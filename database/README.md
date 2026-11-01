# Local SQLite database

Setup creates `%LOCALAPPDATA%\AyushNGO\ayush_ngo_db.db`, outside the OneDrive workspace. No MySQL server password or third-party database service is needed for local signup/login.

In VS Code's Database Client extension (`cweijan.dbclient-jdbc`), create a SQLite connection and select that `.db` file. The schema is in `backend-node/schema.sql`; `setup-local.ps1` applies it automatically. The file starts empty and receives actual records when the app is used.

The Express backend opens the file with Node's built-in SQLite driver. Keep the `.db` file and any `-wal`/`-shm` companions together while the server runs. Back it up while the backend is stopped. In production, set `DB_PATH` to a file on the backend host's persistent disk; Netlify static hosting does not persist SQLite files.
