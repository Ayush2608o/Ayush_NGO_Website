# Ayush NGO

This folder uses a local SQLite database for account registration, sign-in, profiles, and the other backend records. The database file is `%LOCALAPPDATA%\AyushNGO\ayush_ngo_db.db`; it is separate from the website source and is ignored by Git.

## Start locally

Requirements: Node.js 22.5 or newer and VS Code Live Server.

1. Start the backend from this folder with `.\run-backend.ps1`. Keep the terminal open. It uses the existing local SQLite database and listens on port 8085.
2. If this is the first setup on a computer, run `.\setup-local.ps1` once instead. It creates the database schema and local secret, then starts the backend.
3. Serve this folder in VS Code Live Server on port 5500. Open `http://127.0.0.1:5500/signup.html`; new accounts are stored in the SQLite `users` table. Check backend health at `http://127.0.0.1:8085/api/health`.

The frontend talks to the local Express backend, which writes records into SQLite. No remote database service or MySQL account is required. VS Code's Database Client extension can open `%LOCALAPPDATA%\AyushNGO\ayush_ngo_db.db` directly; the schema is in `backend-node/schema.sql`.

The supplied `QR_CODE.jpeg` is copied into local uploads on first backend start and its UPI ID (`ayushsk2041@oksbi`), displayed payee (`Ayush Raj`), image path, and scan instructions are saved in `payment_settings`. The donation page displays this saved QR after sign-in. Donation submissions save their amount and transaction reference for manual verification; this does not initiate or verify a bank payment automatically.

To create the first administrator, run `.\bootstrap-admin.ps1` and enter the details at its prompts. The database starts empty; it does not create sample accounts.
