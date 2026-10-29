# Asha Foundation - Complete NGO Website (6 Pages + Showcase + Java Backend)

> **Empowering Lives, Restoring Hope**  
> Clean, Modern, HR-Ready NGO Web Platform built with HTML5, CSS3, ES6 JavaScript, and Java SE REST API Backend.

---

## 🌟 Project Highlights (HR & Interview Ready)

1. **Exact UI & Design Matching**: Matched directly to the provided design PDF/mockups (Asha Foundation design system).
2. **Complete 6 Pages + All Pages Showcase**:
   - `index.html` — **Home Page** (Hero with 100k+ impact overlay, Urgent banner, Core Pillars).
   - `about.html` — **About Us** (14+ Years unbroken service badge, Mission & Vision cards, 4 grassroots counters).
   - `work.html` — **Our Work / Projects** (Shiksha Mission 2026, Mobile Health Vans, Clean Earth Drive with funding progress bars).
   - `gallery.html` — **Gallery** (Photo & Event Gallery with active category filter tabs & distinctive "Gallery 2" card).
   - `blog.html` — **Blog & Latest News** (Winter Relief Drive Press Release, Rural High School Computer Lab story).
   - `contact.html` — **Contact Us** (Interactive inquiry form, New Delhi Headquarters details & interactive map view).
   - `showcase.html` — **All Pages Showcase** (Visual portfolio overview linking all 6 pages).
3. **Interactive Donation Modal**:
   - Triggered by `❤ Donate Now` on all pages and buttons.
   - Preset amounts ($25, $50, $100) + custom amount input + donor fields.
   - Records donation requests and shows a request ID confirmation. No payment is collected.
4. **Full Java Backend REST API**:
   - Built with standard Java SE (`backend.NgoServer`).
   - Zero external dependencies required (runs instantly with any JDK 17, 21, 27).
   - Serves REST endpoints (`/api/health`, `/api/stats`, `/api/projects`, `/api/news`, `/api/contact`, `/api/donate`).
   - Built-in static file server to host HTML/CSS/JS directly at `http://localhost:8080`.
   - Full CORS support enabled.
5. **Intelligent Offline / Standalone Fallback**:
   - If Java is running, the frontend live-communicates with Java REST APIs.
   - If opened directly as static HTML files in a browser, it uses built-in smart mock data so the UI is 100% functional and never breaks for HR!

---

## 📁 Project Structure

```text
Vistar NGO-Website/
├── index.html              # Page 1: Home Page
├── about.html              # Page 2: About Us
├── work.html               # Page 3: Our Work & Initiatives
├── gallery.html            # Page 4: Photo & Event Gallery
├── blog.html               # Page 5: Blog & News
├── contact.html            # Page 6: Contact Us
├── showcase.html           # Bonus: All Pages Showcase & Portfolio
├── css/
│   └── style.css           # Complete responsive stylesheet (Design system)
├── js/
│   ├── api.js              # REST API connector & fallback layer
│   └── main.js             # Navigation, modal, filter tabs, toasts & counters
├── backend/
│   ├── NgoServer.java      # Java HTTP & REST Server (JDK 17+)
│   └── pom.xml             # Optional Maven build configuration
├── run-backend.bat         # 1-Click launcher for Java Backend (CMD)
├── run-backend.ps1         # 1-Click launcher for Java Backend (PowerShell)
└── README.md               # Documentation & Setup Guide
```

---

## 🚀 How to Run the Project (Step-by-Step)

### Deploy frontend to Netlify and Java API to Render

Netlify hosts the static website. The Java API runs as a separate service on Render; configure each side with the other's public URL.

1. Push this repository to GitHub. In Render, create a Blueprint from it using `render.yaml`. It builds the Java service from `backend/Dockerfile` and attaches a disk for saved form submissions. Render persistent disks require a paid web service plan; this Blueprint selects the Starter plan.
2. Open `https://<your-render-service>/api/health` and confirm it reports `UP`.
3. Import the same repository in Netlify. Add `JAVA_API_URL` with the Render API's public HTTPS URL (for example, `https://vistar-ngo-java-api.onrender.com`), then deploy. The build generates the API URL config in `dist/js/deploy-config.js` and publishes only the website files.
4. In the Render service's environment settings, set `FRONTEND_ORIGIN` to the exact Netlify site origin (for example, `https://your-site.netlify.app`). Redeploy the API after setting it.
5. Submit a contact or volunteer form from the Netlify site to confirm it reaches the Java backend.

The donation form records a donation request only. It does not collect payment. The Render disk retains contact, donation-request, volunteer, and newsletter records across service restarts.

For a custom Netlify domain, update `FRONTEND_ORIGIN` to that domain too. For local development, leave `js/deploy-config.js` empty and run the Java backend with `run-backend.bat` or `java -cp bin backend.NgoServer`.

### Option 1: Run Frontend Directly in Browser (No Server Needed)
1. Double-click `index.html` or `showcase.html` in your file explorer.
2. It will open directly in Chrome, Edge, or Firefox.
3. All navigation links, modals, gallery filters, and forms work immediately!

---

### Option 2: Run Full Working Java Backend (Recommended for HR Presentation)

#### Using Windows Command Prompt / Double-Click:
1. Double-click `run-backend.bat` in this folder.
2. The batch script will compile `NgoServer.java` and start the server.
3. Open your browser and visit:
   - **Home Page**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
   - **All Pages Showcase**: [http://localhost:8080/showcase.html](http://localhost:8080/showcase.html)
   - **API Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

#### Using PowerShell:
```powershell
./run-backend.ps1
```

#### Manual Compilation & Run:
```cmd
javac -d bin backend/NgoServer.java
java -cp bin backend.NgoServer
```

---

## 📡 Java Backend REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns backend status & timestamp |
| `GET` | `/api/stats` | Returns lives impacted, schools built, surgeries, trees |
| `GET` | `/api/projects` | Returns active causes with raised amounts & funding goals |
| `GET` | `/api/news` | Returns press releases & news articles |
| `POST` | `/api/contact` | Receives contact form submissions (`name`, `email`, `subject`, `message`) |
| `POST` | `/api/donate` | Processes donation requests and generates a receipt ID |

---

## 🎯 Tips for HR / Interview Presentation

1. **Highlight Full-Stack Architecture**:
   - Explain how HTML5 semantic tags and modern CSS grid/flexbox provide mobile-first responsive design.
   - Explain how `js/api.js` acts as an asynchronous service layer using `fetch` with `async/await` and error handling.
   - Explain how the Java backend (`NgoServer.java`) handles multithreaded HTTP requests, enforces CORS security, and provides clean REST API contracts.
2. **Demonstrate the "All Pages Showcase" (`showcase.html`)**:
   - Start your demonstration on `showcase.html` to give the HR an instant high-level overview of the complete multi-page design before clicking into individual pages.
3. **Showcase the Live Donation Modal & Contact Form**:
   - Click `❤ Donate Now` to show the dynamic amount selector and instant transaction ID generation.
   - Go to `contact.html`, fill the form, and show the instant confirmation response.

