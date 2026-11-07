@echo off
title Sudharshan - Verification ^& Trust Platform
echo ========================================================
echo   Launching Sudharshan Verification ^& Trust Platform
echo   SIH26263 - Verification ^& Trust Platform
echo ========================================================
echo Starting local web server on port 3000...
start "" "http://localhost:3000"
python -m http.server 3000

