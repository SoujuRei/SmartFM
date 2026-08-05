# SmartFM Backend

This document explains how to set up and run the SmartFM backend locally.

## Prerequisites
- Python 3.10 or newer
- pip
- A terminal such as PowerShell

## 1. Open the backend folder
From the project root, run:

```powershell
cd .\src\backend
```

## 2. Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, run this once in the current session:

```powershell
Set-ExecutionPolicy -Scope Process RemoteSigned
```

## 3. Install dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Run the backend

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

If `uvicorn` is not recognized, use:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 5. Access the API
Once the server is running:
- API base URL: http://127.0.0.1:8000/
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Useful checks
- Health check endpoint: http://127.0.0.1:8000/
- This should return a JSON message showing that the backend is running.

## Notes
- The app entry point is [main.py](main.py).
- The API routes are registered in [main.py](main.py) under the auth, order, and fleet modules.
