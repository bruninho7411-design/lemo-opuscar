@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Cidade do Insta - Ep. 32 ===
where node >nul 2>nul
if errorlevel 1 goto semnode
for /f "delims=" %%v in ('node -v') do echo Node encontrado: %%v
if exist node_modules goto render
echo.
echo As dependencias ainda nao estao instaladas: Remotion, React, three.js e o Chrome de renderizacao, cerca de 300 MB, so nesta pasta.
set "OK="
set /p OK=Posso instalar agora? (S/N): 
if /i not "%OK%"=="S" goto naoinstalou
call npm install
if errorlevel 1 goto falhou
:render
if not exist out mkdir out
echo.
echo Renderizando o video 1080x1920...
call npm run render
if errorlevel 1 call npm run render:seguro
echo Gerando a capa...
call npm run capa
echo.
echo Pronto! Arquivos na pasta out\
start "" out
pause
exit /b 0
:semnode
echo [X] Node.js nao encontrado. Instale o Node.js LTS em https://nodejs.org e rode de novo.
pause
exit /b 1
:naoinstalou
echo Ok, nada foi instalado.
pause
exit /b 0
:falhou
echo [X] Falha no npm install.
pause
exit /b 1
