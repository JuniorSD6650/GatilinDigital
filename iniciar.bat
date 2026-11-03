@echo off
REM ============================================================
REM  Gatilin Digital - INICIAR (uso diario)
REM  Requisito: MySQL encendido (Laragon > Start All).
REM ============================================================
cd /d "%~dp0"

start "Gatilin Backend :5000" cmd /k "cd /d %~dp0be-gatilin-digital_2 && npm start"
start "Gatilin Frontend :3000" cmd /k "cd /d %~dp0fe-gatilin-digital_2 && npm run dev"

echo Esperando a que el frontend arranque...
timeout /t 8 /nobreak >nul
start "" http://localhost:3000
