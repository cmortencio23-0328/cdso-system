async function protectPage(allowedRoles) {

    const response = await fetch('/auth/me');
    const data = await response.json();

    if (!data.loggedIn) {
        window.location.href = '/login.html';
        return;
    }

    if (!allowedRoles.includes(data.user.role)) {

        alert('You are not allowed to access this page.');

        if (data.user.role === 'admin') {
            window.location.href = '/admin-dashboard.html';

        } else if (data.user.role === 'cdso') {
            window.location.href = '/dashboard.html';

        } else {
            window.location.href = '/student-dashboard.html';
        }
    }
}

/* STATUS COLORS */

function statusClass(status) {

    if (status === 'Approved') {
        return 'status-approved';
    }

    if (status === 'Rejected') {
        return 'status-rejected';
    }

    return 'status-pending';
}

/* DASHBOARD ANALYTICS */

async function loadAnalytics() {

    const reports = await fetch('/reports/analytics');
    const reportData = await reports.json();

    const reqs = await fetch('/requisition/analytics');
    const reqData = await reqs.json();

    const reservations = await fetch('/reservation/analytics');
    const reservationData = await reservations.json();

    if (document.getElementById('totalReports')) {
        document.getElementById('totalReports').innerHTML =
            reportData.totalReports || 0;
    }

    if (document.getElementById('totalRequests')) {
        document.getElementById('totalRequests').innerHTML =
            reqData.totalRequests || 0;
    }

    if (document.getElementById('totalReservations')) {
        document.getElementById('totalReservations').innerHTML =
            reservationData.totalReservations || 0;
    }

    if (document.getElementById('pendingApprovals')) {

        const totalPending =
            Number(reportData.pendingReports || 0) +
            Number(reqData.pendingRequests || 0) +
            Number(reservationData.pendingReservations || 0);

        document.getElementById('pendingApprovals').innerHTML =
            totalPending;
    }
}

/* SUBMIT REQUISITION */

async function submitRequisition(event) {

    event.preventDefault();

    const btn = event.target.querySelector('button');

    btn.disabled = true;
    btn.innerHTML = 'Submitting...';

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/requisition/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {

        alert('Requisition submitted successfully');

        event.target.reset();

        loadRequisitions();
        loadAnalytics();

    } else {

        alert('Failed to submit requisition');
    }

    btn.disabled = false;
    btn.innerHTML = 'Submit Request';
}

/* SUBMIT RESERVATION */

async function submitReservation(event) {

    event.preventDefault();

    const btn = event.target.querySelector('button');

    btn.disabled = true;
    btn.innerHTML = 'Reserving...';

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/reservation/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {

        alert('Reservation submitted successfully');

        event.target.reset();

        loadReservations();
        loadAnalytics();

    } else {

        alert('Failed to submit reservation');
    }

    btn.disabled = false;
    btn.innerHTML = 'Reserve';
}

/* SUBMIT REPORT */

async function submitReport(event) {

    event.preventDefault();

    const btn = event.target.querySelector('button');

    btn.disabled = true;
    btn.innerHTML = 'Uploading...';

    const formData = new FormData(event.target);

    const response = await fetch('/reports/add', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.success) {

        alert('Report uploaded successfully');

        event.target.reset();

        loadReports();
        loadAnalytics();

    } else {

        alert('Failed to upload report');
    }

    btn.disabled = false;
    btn.innerHTML = 'Upload Report';
}

/* LOAD REQUISITIONS */

async function loadRequisitions() {

    const table = document.getElementById('requisitionTable');

    if (!table) return;

    const response = await fetch('/requisition/all');
    const rows = await response.json();

    table.innerHTML = rows.map(row => `
        <tr>

            <td>${row.fullname}</td>

            <td>${row.item_name}</td>

            <td>${row.quantity}</td>

            <td class="${statusClass(row.status)}">
                ${row.status}
            </td>

        </tr>
    `).join('');
}

/* LOAD RESERVATIONS */

async function loadReservations() {

    const table = document.getElementById('reservationTable');

    if (!table) return;

    const response = await fetch('/reservation/all');
    const rows = await response.json();

    table.innerHTML = rows.map(row => `
        <tr>

            <td>${row.fullname}</td>

            <td>${row.equipment_name}</td>

            <td>${row.reservation_date}</td>

            <td class="${statusClass(row.status)}">
                ${row.status}
            </td>

        </tr>
    `).join('');
}

/* LOAD REPORTS */

async function loadReports() {

    const table = document.getElementById('reportTable');

    if (!table) return;

    const response = await fetch('/reports/all');
    const rows = await response.json();

    table.innerHTML = rows.map(row => `
        <tr>

            <td>${row.fullname}</td>

            <td>${row.problem_type}</td>

            <td>${row.description}</td>

            <td>

                ${
                    row.report_file

                    ? `<a href="/uploads/${row.report_file}" target="_blank">
                            View File
                       </a>`

                    : 'No File'
                }

            </td>

            <td class="${statusClass(row.status)}">
                ${row.status}
            </td>

        </tr>
    `).join('');
}

/* ADMIN APPROVALS */

async function loadAdminApprovals() {

    const table = document.getElementById('approvalTable');

    if (!table) return;

    const reports =
        await (await fetch('/reports/all')).json();

    const reqs =
        await (await fetch('/requisition/all')).json();

    const reservations =
        await (await fetch('/reservation/all')).json();

    const allRows = [];

    reports.forEach(row => {

        allRows.push({
            type: 'report',
            id: row.id,
            title: row.problem_type,
            user: row.fullname,
            status: row.status
        });

    });

    reqs.forEach(row => {

        allRows.push({
            type: 'requisition',
            id: row.id,
            title: row.item_name,
            user: row.fullname,
            status: row.status
        });

    });

    reservations.forEach(row => {

        allRows.push({
            type: 'reservation',
            id: row.id,
            title: row.equipment_name,
            user: row.fullname,
            status: row.status
        });

    });

    table.innerHTML = allRows.map(row => `

        <tr>

            <td>${row.type}</td>

            <td>${row.title}</td>

            <td>${row.user}</td>

            <td class="${statusClass(row.status)}">
                ${row.status}
            </td>

            <td>

                ${
                    row.status === 'Pending'

                    ? `

                        <button
                            class="btn btn-approve"
                            onclick="updateApproval('${row.type}', ${row.id}, 'Approved')"
                        >
                            Approve
                        </button>

                        <button
                            class="btn btn-reject"
                            onclick="updateApproval('${row.type}', ${row.id}, 'Rejected')"
                        >
                            Reject
                        </button>

                    `

                    : `

                        <span class="${statusClass(row.status)}">
                            Already ${row.status}
                        </span>

                    `
                }

            </td>

        </tr>

    `).join('');
}

/* UPDATE APPROVAL */

async function updateApproval(type, id, status) {

    await fetch('/approval/update', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            type,
            id,
            status
        })
    });

    loadAdminApprovals();
    loadReports();
    loadRequisitions();
    loadReservations();
    loadAnalytics();
}

/* AUTO LOAD */

loadAnalytics();
loadRequisitions();
loadReservations();
loadReports();
loadAdminApprovals();

/* REALTIME REFRESH */

setInterval(() => {

    loadAnalytics();

    loadRequisitions();

    loadReservations();

    loadReports();

    loadAdminApprovals();

}, 3000);