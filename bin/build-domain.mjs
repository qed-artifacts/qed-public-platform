import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const platformRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function required(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required field: ${label}`);
  }
  return value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function validate(domain, catalog) {
  if (domain.schemaVersion !== 1) throw new Error(`Unsupported domain schemaVersion: ${domain.schemaVersion}`);
  if (catalog.schemaVersion !== 1) throw new Error(`Unsupported catalog schemaVersion: ${catalog.schemaVersion}`);
  for (const key of ["slug", "portalName", "canonicalUrl", "repository", "status", "scopeStatus", "hero", "focus", "pathway", "methods", "theme"]) {
    required(domain[key], key);
  }
  for (const [label, value] of [["focus.items", domain.focus.items], ["pathway.items", domain.pathway.items], ["methods.principles", domain.methods.principles], ["catalog.apps", catalog.apps]]) {
    if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  }
  if (catalog.domain !== domain.slug) throw new Error(`Catalog domain '${catalog.domain}' does not match '${domain.slug}'`);
  if (!domain.canonicalUrl.startsWith("https://qedartifacts.org/")) throw new Error("canonicalUrl must use qedartifacts.org HTTPS");
  if (!/^#[0-9a-f]{6}$/i.test(domain.theme.accent) || !/^#[0-9a-f]{6}$/i.test(domain.theme.accentSoft)) {
    throw new Error("Theme colors must be six-digit hexadecimal values");
  }
}

function renderIndex(domain) {
  const focusCards = domain.focus.items.map((item) => `<article><span class="card-index">${escapeHtml(item.kicker)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join("");
  const pathwayItems = domain.pathway.items.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></li>`).join("");
  const principles = domain.methods.principles.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></div>`).join("");
  const headline = domain.hero.lines.map(escapeHtml).join("<br>");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(domain.portalName)} | QED-AI</title>
  <meta name="description" content="${escapeHtml(domain.metaDescription)}">
  <meta name="theme-color" content="#14201c">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(domain.portalName)} | QED-AI">
  <meta property="og:description" content="${escapeHtml(domain.metaDescription)}">
  <meta property="og:url" content="${escapeHtml(domain.canonicalUrl)}">
  <link rel="canonical" href="${escapeHtml(domain.canonicalUrl)}">
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="https://qedartifacts.org/" aria-label="QED Artifacts Institute home"><span class="brand-mark">QED<span>AI</span></span><span class="brand-name">${escapeHtml(domain.shortLabel)}</span></a>
    <nav aria-label="Primary navigation"><a href="#focus">Focus</a><a href="#pathway">Roadmap</a><a href="#apps">Apps</a><a href="#methods">Methods</a><a href="#contact">Contact</a></nav>
  </header>
  <main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="eyebrow">QED-AI Domain Portal ${escapeHtml(domain.portalNumber)}</p><h1>${headline}</h1><p class="hero-lead">${escapeHtml(domain.hero.lead)}</p><a class="button" href="#focus">Explore the foundation</a></div>
      <aside class="hero-record" aria-label="Portal status"><p class="record-label">Domain record</p><dl><div><dt>Owner</dt><dd>QED Artifacts Institute</dd></div><div><dt>Repository</dt><dd>${escapeHtml(domain.repository)}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(domain.scopeStatus)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(domain.status)}</dd></div></dl></aside>
    </section>
    <section class="scope-band" aria-label="Scope notice"><p><strong>This is a working domain boundary.</strong> ${escapeHtml(domain.scopeNotice)}</p></section>
    <section class="section focus" id="focus"><div class="section-heading"><div><p class="eyebrow">Initial field of view</p><h2>${escapeHtml(domain.focus.title)}</h2></div><p class="section-note">${escapeHtml(domain.focus.note)}</p></div><div class="card-grid">${focusCards}</div></section>
    <section class="section pathway" id="pathway"><div class="section-heading"><div><p class="eyebrow">Development pathway</p><h2>${escapeHtml(domain.pathway.title)}</h2></div><p class="section-note">${escapeHtml(domain.pathway.note)}</p></div><ol>${pathwayItems}</ol></section>
    <section class="section apps" id="apps"><div class="section-heading"><div><p class="eyebrow">Application catalog</p><h2>${escapeHtml(domain.apps.title)}</h2></div><p class="section-note">${escapeHtml(domain.apps.note)}</p></div><div class="app-grid" data-app-catalog><p>Loading the public application catalog...</p></div></section>
    <section class="section methods" id="methods"><div><p class="eyebrow">Operating commitments</p><h2>${escapeHtml(domain.methods.title)}</h2><p>${escapeHtml(domain.methods.lead)}</p></div><div class="principles">${principles}</div></section>
    <section class="section contact" id="contact"><div><p class="eyebrow">QED Artifacts Institute</p><h2>A public foundation, still in development.</h2><p>${escapeHtml(domain.legalStatus)}</p></div><div class="contact-actions"><a class="button" href="mailto:${escapeHtml(domain.contact)}">Contact QED-AI</a></div></section>
  </main>
  <footer><a class="brand" href="https://qedartifacts.org/"><span class="brand-mark">QED<span>AI</span></span></a><p>&copy; <span data-current-year></span> Quality Evaluation and Disposition Artifacts Institute</p><div><a href="https://qedartifacts.org/">Main site</a><a href="https://github.com/${escapeHtml(domain.repository)}">Source</a></div></footer>
  <script src="assets/site.js"></script>
</body>
</html>`;
}

const sourceDir = path.resolve(readArg("--source", "."));
const outDir = path.resolve(readArg("--out", "dist"));
if (outDir === sourceDir || outDir === path.parse(outDir).root) throw new Error("Unsafe output directory");

const domain = JSON.parse(await fs.readFile(path.join(sourceDir, "domain.json"), "utf8"));
const catalog = JSON.parse(await fs.readFile(path.join(sourceDir, "apps", "catalog.json"), "utf8"));
validate(domain, catalog);

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(path.join(outDir, "assets"), { recursive: true });
await fs.mkdir(path.join(outDir, "apps"), { recursive: true });

const baseCss = await fs.readFile(path.join(platformRoot, "assets", "styles.css"), "utf8");
const css = baseCss.replaceAll("__ACCENT__", domain.theme.accent).replaceAll("__ACCENT_SOFT__", domain.theme.accentSoft);
await fs.writeFile(path.join(outDir, "index.html"), renderIndex(domain));
await fs.writeFile(path.join(outDir, "assets", "styles.css"), css);
await fs.copyFile(path.join(platformRoot, "assets", "site.js"), path.join(outDir, "assets", "site.js"));
await fs.writeFile(path.join(outDir, "apps", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(outDir, ".nojekyll"), "");
await fs.writeFile(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${domain.canonicalUrl}sitemap.xml\n`);
await fs.writeFile(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${domain.canonicalUrl}</loc></url></urlset>\n`);

for (const folderName of ["public", "apps"]) {
  const from = path.join(sourceDir, folderName);
  try {
    await fs.cp(from, path.join(outDir, folderName), { recursive: true, force: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
await fs.writeFile(path.join(outDir, "apps", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Built ${domain.portalName} -> ${outDir}`);

