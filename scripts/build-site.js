const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const output = path.join(root, "dist");
const apiUrl = (process.env.API_BASE_URL || process.env.JAVA_API_URL || "").trim().replace(/\/+$/, "");

if (apiUrl && !/^https:\/\//i.test(apiUrl)) {
  throw new Error("API_BASE_URL must be an HTTPS URL for the deployed API.");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of fs.readdirSync(root)) {
  if (name.endsWith(".html") || ["robots.txt", "sitemap.xml", "favicon.svg"].includes(name)) {
    fs.copyFileSync(path.join(root, name), path.join(output, name));
  }
}
for (const directory of ["css", "js"]) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

fs.writeFileSync(
  path.join(output, "js", "deploy-config.js"),
  `// Generated during static site build.\nwindow.AYUSH_API_BASE_URL = ${JSON.stringify(apiUrl)};\n`
);
console.log(apiUrl ? `Configured API: ${apiUrl}` : "API_BASE_URL is empty; using local API defaults.");
