# Live Netlify account setup

The Netlify site serves static files. It cannot access the SQLite database on your computer. `render.yaml` defines the Node + SQLite backend for Render and mounts persistent storage so account and payment data survive restarts. The hosted database starts empty; local accounts are not copied automatically.

Use the `ayush-website-local-sqlite` branch for these changes, or merge it into the branch configured for production on Netlify and Render.

1. In Render, create a Blueprint from this repository and deploy `render.yaml`.
2. Wait for the `ayush-ngo-node-api` service health check at `/api/health` to pass, then copy its HTTPS service URL.
3. In Netlify, open **Site configuration > Environment variables** and set `API_BASE_URL` to the backend URL without a trailing slash.
4. Trigger a new Netlify deploy. `scripts/build-site.js` embeds the URL in the published `js/deploy-config.js` file.
5. Confirm the deployed `/js/deploy-config.js` contains the backend URL, then create an account on the live site.

The backend accepts credentialed browser requests from `https://ayushngo.netlify.app`. Its SQLite database and uploaded files use the persistent `/var/data` disk.

The Render blueprint uses the Starter plan because Render only supports persistent disks on paid web services. Deploying it may incur a hosting charge; review the plan in Render before confirming deployment.
