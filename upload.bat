@echo off
echo ================================
echo Uploading CDSO System to GitHub
echo ================================

git add .

git commit -m "update cdso system"

git push

echo ================================
echo Done! Railway will redeploy automatically.
echo ================================

pause