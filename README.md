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
- Razorpay one-time checkout is available when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are configured in the server environment. The backend creates orders, checks the checkout HMAC, confirms payment capture with Razorpay, and only then records `SUCCEEDED`.
- This website uses Razorpay Standard Payment Gateway credentials: Key ID plus Key Secret. OAuth Client ID and Client Secret are not interchangeable with these API credentials.
- Monthly recurring payments are not enabled. USD checkout also depends on the Razorpay account supporting USD; INR is the standard supported setup for this site.
- Never commit payment credentials. For local test checkout, run `scripts/run-backend-with-razorpay.ps1`; it prompts for the Key ID and reads the Key Secret without echoing it or saving it. For Render, add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as private Environment Variables on the web service and redeploy. The `render.yaml` placeholders contain no key values. Use Razorpay test keys for testing and live keys only after account activation.
- Contact, volunteer, and newsletter forms are saved in private JSON Lines files; the Java server does not send email.
- Email-based password recovery, email verification, Google sign in, and administrator access are not configured in the Java SE server.

## API routes

- `GET /api/health`
- `GET /api/auth/csrf`, `GET /api/auth/me`, `GET /api/auth/options`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/change-password`
- `GET /api/profile/me`, `PUT /api/profile/me`
- `GET /api/donations/me`, `GET /api/donations/me/summary`
- `POST /api/contact`, `POST /api/newsletter`, `POST /api/volunteer`
- `GET /api/payment/config`, `POST /api/payment/order`, `POST /api/payment/verify`
- `GET /api/stats`, `GET /api/projects`, `GET /api/news`, `GET /api/donations/recent`

## Hosting notes

Netlify builds the static frontend with `node scripts/build-site.js`. Set `JAVA_API_URL` in the Netlify build environment to the public HTTPS base URL of the Java API. Set `FRONTEND_ORIGIN=https://ayushngo.netlify.app` on the API service. Razorpay secrets belong on the Java API service in Render, not in Netlify frontend variables or `deploy-config.js`; the existing Java backend handles order creation and verification server-side.

`backend/Dockerfile` and `render.yaml` provide the Java SE API container setup. Configure a private persistent data directory for account and form records. Production use still requires a real email verification and reset flow, a supported database, rate limiting, and a configured Razorpay account. Recurring payments are not implemented.

## Content and data

Project and news content is illustrative. Verify organizational details, impact claims, addresses, and imagery before publication. Runtime data and credentials are excluded from Git.
