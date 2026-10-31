# Ayush NGO website

A responsive multi-page NGO website with a Java API for contact forms, donation requests, accounts, profiles, and account-specific donation history.

## Pages

- `index.html` — home page with the 3D Earth hero and public donation request form
- `about.html`, `work.html`, `gallery.html`, `blog.html`, `contact.html`, and `showcase.html` — public site pages
- `login.html` and `signup.html` — account access
- `profile.html` — account profile
- `dashboard.html` — donation requests associated with the signed-in email
- `terms.html` and `privacy.html` — account information

## Run locally

Requires JDK 17 or newer. From the repository root, run:

```powershell
.\run-backend.ps1
```

The Java server compiles and starts on port `8085`. Open `http://localhost:8085/`. If using a separate Live Server on port `5500`, the frontend connects to the Java API on `8085`.

New accounts are stored in `%USERPROFILE%\.ayush-ngo-data\accounts.tsv`. Passwords are saved as salted PBKDF2 hashes. Account sessions are held in memory and end when the Java server restarts, so sign in again after a restart. Local application data is outside the website and must not be committed.

## Account and donation behavior

- Signup creates a local account; sign in uses that account's email and password.
- Profile details are scoped to the signed-in account.
- Signed-in users can change their password by confirming the current password in `profile.html`.
- If email recovery is not configured, run `scripts/reset-account-password.ps1` locally to choose a new account password without displaying it in the terminal.
- Donation history matches donation requests by the signed-in account's email address.
- Donation requests remain `PENDING_PAYMENT`. The site does not collect money or claim that a payment succeeded.
- Successful totals only include records explicitly marked `SUCCEEDED`; no payment provider or verified payment webhook is configured.
- Contact, volunteer, and newsletter forms are saved in private JSON Lines files; the Java server does not send email.
- Email-based password recovery, email verification, Google sign in, and administrator access are not configured in the Java SE server.

## API routes

- `GET /api/health`
- `GET /api/auth/csrf`, `GET /api/auth/me`, `GET /api/auth/options`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/change-password`
- `GET /api/profile/me`, `PUT /api/profile/me`
- `GET /api/donations/me`, `GET /api/donations/me/summary`
- `POST /api/contact`, `POST /api/newsletter`, `POST /api/volunteer`, `POST /api/donate`
- `GET /api/stats`, `GET /api/projects`, `GET /api/news`, `GET /api/donations/recent`

## Hosting notes

Netlify builds the static frontend with `node scripts/build-site.js`. Set `JAVA_API_URL` in the Netlify build environment to the public HTTPS base URL of a separately hosted Java API. Do not place credentials in frontend configuration. The API's CORS origin must be set to the exact deployed website origin.

`backend/Dockerfile` and `render.yaml` provide the Java SE API container setup. Configure a private persistent data directory for account and form records. Production use still requires a real email verification and reset flow, a supported database, rate limiting, and a legitimate payment provider with server-side verification.

## Content and data

Project and news content is illustrative. Verify organizational details, impact claims, addresses, and imagery before publication. Runtime data and credentials are excluded from Git.
