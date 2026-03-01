# Project Setup & Installation Guide

If you just pulled the latest code from GitHub (including the new Reports page and `recharts`), follow these instructions to install all new dependencies and run the project simultaneously.

## Option 1: Using VS Code (Recommended)
We have added a **VS Code Tasks file** (`.vscode/tasks.json`) to automate the installation and running of the project without you needing to manually type terminal commands.

1. Open this project folder in **VS Code**.
2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac) to open the Command Palette.
3. Type **"Tasks: Run Task"** and press Enter.
4. Select **"1. Install Dependencies (Frontend & Backend)"** 
   *(This will automatically run `bun install` for `recharts` and `uv sync` for Python requirements).*
5. To instantly start BOTH the frontend and backend servers, press `Ctrl + Shift + B` (or `Cmd + Shift + B`) to "Start All Services" at once.

---

## Option 2: Running Manually in the Terminal
If you prefer to install the requirements manually directly in your terminal, run the following commands with the exact proper codes:

### 1. Install Frontend Requirements (like Recharts)
Open a terminal in the root folder and run:
```powershell
cd frontend
bun install 
```
*(Since `recharts` was added to `package.json`, this will download and install the new charting libraries so the Reports page works for you).*

### 2. Install Backend Requirements
Open a new terminal in the root folder and run:
```powershell
cd backend
uv sync
```
*(This ensures your Python environment is perfectly updated).*

### 3. Start Both Servers
Leave the terminal open in `backend` and start it:
```powershell
uv run uvicorn main:app --reload --port 8000
```
Then open a second terminal in `frontend` and start the UI:
```powershell
bun run dev
```

That's it! Everything will now work for your teammates directly from the terminal without any missing module errors.
