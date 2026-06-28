@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Kanaan Image Engine on port 5050...
python main.py
pause
