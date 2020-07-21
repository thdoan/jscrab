@echo off
REM Begin local scope
setlocal
REM Set build directory
set target=play
REM Move files to temp directory to search & replace
xcopy /iy src %temp%\vietboard\src
REM Comment out debugging stuff; space required before "//" to work around this bug:
REM https://github.com/lionello/fart-it/issues/9
fart %temp%\vietboard\src\engine.js "DEBUG = true" "DEBUG = false"
fart %temp%\vietboard\src\*.js "if (DEBUG" " //if (DEBUG"
REM Build (minify and concatenate)
AjaxMin.exe -clobber css\style.css -out %target%\css\styles.min.css
AjaxMin.exe -inline:no -clobber -term lang\vi_wordlist.js lang\vi_defs.js lang\vi_letters.js -out %target%\js\lang.min.js
AjaxMin.exe -inline:no -clobber -term %temp%\vietboard\src\redipsdrag.js %temp%\vietboard\src\bonuses.js %temp%\vietboard\src\ui.js %temp%\vietboard\src\engine.js %temp%\vietboard\src\events.js -out %target%\js\app.min.js
REM Deploy
copy /y index.html %target%
xcopy /y lang\en_translate.js %target%\lang\
xcopy /y lang\vi_translate.js %target%\lang\
xcopy /iy pics %target%\pics
xcopy /iy sounds %target%\sounds
fart %target%\index.html style.css styles.min.css
fart %target%\index.html lang/vi_wordlist.js js/lang.min.js
fart %target%\index.html src/redipsdrag.js js/app.min.js
fart --c-style --remove %target%\index.html "<script src=\"lang/vi_defs.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"lang/vi_letters.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"lang/vi_translate.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"src/bonuses.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"src/ui.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"src/engine.js\"></script>\n"
fart --c-style --remove %target%\index.html "<script src=\"src/events.js\"></script>\n"
REM Clean up
rmdir /s /q %temp%\vietboard
REM End local scope
endlocal
pause