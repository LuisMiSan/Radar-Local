@echo off
title Radar Local - Servidor
echo.
echo  ========================================
echo    RADAR LOCAL - Iniciando servidor...
echo  ========================================
echo.
cd /d "C:\Users\USER\radar-local"
start "" http://localhost:3000/admin
npm run dev
