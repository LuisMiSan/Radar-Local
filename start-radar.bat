@echo off
title Radar Local - Servidor
color 0A
echo.
echo  ========================================
echo    RADAR LOCAL - Iniciando servidor...
echo  ========================================
echo.

cd /d "C:\Users\USER\radar-local"

:: Matar procesos previos en puerto 3000
echo  Limpiando puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Esperar 1 segundo
timeout /t 1 /nobreak >nul

:: Abrir navegador en 5 segundos
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000/admin"

:: Arrancar servidor
echo  Servidor arrancando en http://localhost:3000
echo  (No cierres esta ventana)
echo.
npm run dev
