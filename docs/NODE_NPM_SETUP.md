# Node.js and npm not found in terminal

If you see `npm : The term 'npm' is not recognized` in PowerShell or Cursor's terminal, Node.js is either not installed or not on your PATH for that session.

## Fix options

### 1. Use a terminal where Node is already available

- Open **Command Prompt** (cmd) or **Windows Terminal** and run `node -v`. If it works, run `npm install` there.
- If you use **nvm-windows**, **fnm**, or **Volta**: open a **new** terminal (or run `nvm use default` / equivalent), then run `npm install` from the project folder.

### 2. Add Node.js to your PATH (if installed)

If Node is installed but not in PATH:

1. Find the install folder, e.g.:
   - `C:\Program Files\nodejs\`
   - `%APPDATA%\nvm\...\nodejs` (nvm)
   - `%LOCALAPPDATA%\fnm\...\nodejs` (fnm)
2. In Windows search, type **"Environment Variables"** → **Edit the system environment variables** → **Environment Variables**.
3. Under **User variables** or **System variables**, select **Path** → **Edit** → **New**.
4. Add the folder that contains `node.exe` and `npm.cmd` (e.g. `C:\Program Files\nodejs`).
5. OK out, **close and reopen** Cursor/terminal, then run:
   ```powershell
   cd "c:\Users\darto\Documents\Cursor App Dev\MOTARRO Supplies-theme-cursor"
   npm install
   ```

### 3. Install Node.js if needed

1. Go to https://nodejs.org/ and download the **LTS** installer.
2. Run it and ensure **"Add to PATH"** is checked.
3. Restart Cursor/terminal, then run `npm install` from the project folder.

---

After `npm` is available, run from the project root:

```powershell
cd "c:\Users\darto\Documents\Cursor App Dev\MOTARRO Supplies-theme-cursor"
npm install
```

This installs all dependencies, including TipTap for the blog editor.
