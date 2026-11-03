@echo off
chcp 65001 >nul
REM ============================================================
REM  Gatilin Digital - INSTALACION (solo la primera vez)
REM  ATENCION: borra y recrea la base de datos gatilin_db.
REM  Requisito: MySQL encendido (Laragon > Start All).
REM ============================================================
cd /d "%~dp0"

echo.
echo [1/4] Verificando archivo .env del backend...
if not exist "be-gatilin-digital_2\.env" (
  copy "be-gatilin-digital_2\.env.example" "be-gatilin-digital_2\.env" >nul
  echo     Se creo be-gatilin-digital_2\.env - revisa usuario/clave de MySQL si no es root sin clave.
) else (
  echo     OK, ya existe.
)

echo.
echo [2/4] Instalando dependencias del backend...
pushd be-gatilin-digital_2
call npm install || goto :error

echo.
echo [3/4] Creando base de datos, tablas, datos iniciales y usuario admin...
call npm run migrate-seed || goto :error
popd

echo.
echo [4/4] Instalando dependencias del frontend...
pushd fe-gatilin-digital_2
call npm install || goto :error
popd

echo.
echo ============================================================
echo  Instalacion completa. Ahora ejecuta iniciar.bat
echo  Admin: usuario "admin". La clave se mostro arriba ^(o es la de ADMIN_PASSWORD en .env^).
echo ============================================================
pause
exit /b 0

:error
echo.
echo *** Ocurrio un error. Revisa el mensaje de arriba. ***
echo     - Esta MySQL encendido? (Laragon ^> Start All)
echo     - Son correctos DB_USER / DB_PASSWORD en be-gatilin-digital_2\.env?
popd
pause
exit /b 1
