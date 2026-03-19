const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "dist", "site");

const entriesToCopy = [
  "index.html",
  "Deep_Learning_for_Anomaly_Detection_in_Time-Series_Data_Review_Analysis_and_Guidelines.pdf",
  "about-paper",
  "applications",
  "assets",
  "background",
  "benchmarks",
  "classical-limitations",
  "figures",
  "glossary",
  "guidelines",
  "methods",
  "paper-map",
  "playground",
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(srcPath, destPath) {
  const stats = fs.statSync(srcPath);
  if (stats.isDirectory()) {
    ensureDir(destPath);
    for (const entry of fs.readdirSync(srcPath)) {
      copyRecursive(path.join(srcPath, entry), path.join(destPath, entry));
    }
    return;
  }

  ensureDir(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function routeForHtml(relativePath) {
  const normalized = toPosix(relativePath);
  if (normalized === "index.html") return "/";
  return `/${normalized.replace(/\/index\.html$/, "/")}`;
}

function prefixForHtml(relativePath) {
  const normalized = toPosix(relativePath);
  const directory = path.posix.dirname(normalized);
  if (directory === ".") return "";
  return "../".repeat(directory.split("/").length);
}

function toRelativeUrl(prefix, absolutePath) {
  if (absolutePath === "/") return prefix || "./";
  return `${prefix}${absolutePath.replace(/^\/+/, "")}`;
}

function injectRouteConfig(html, prefix, canonicalRoute) {
  const configScript = `<script>window.__TSAD_SITE_PREFIX__=${JSON.stringify(prefix)};window.__TSAD_CANONICAL_ROUTE__=${JSON.stringify(canonicalRoute)};</script>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `  ${configScript}\n</head>`);
  }
  return `${configScript}\n${html}`;
}

function rewriteHtml(html, prefix, canonicalRoute) {
  const withConfig = injectRouteConfig(html, prefix, canonicalRoute);
  const rewrittenHrefs = withConfig.replace(
    /href="\/(?!\/)([^"]*)"/g,
    (_match, target) =>
      `href="${toRelativeUrl(prefix, `/${target}`)}" data-route="/${target}"`,
  );

  return rewrittenHrefs.replace(
    /src="\/(?!\/)([^"]+)"/g,
    (_match, target) => `src="${toRelativeUrl(prefix, `/${target}`)}"`,
  );
}

function collectHtmlFiles(dirPath, relativeDir = "") {
  const htmlFiles = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      htmlFiles.push(...collectHtmlFiles(absolutePath, relativePath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(relativePath);
    }
  }
  return htmlFiles;
}

fs.rmSync(outDir, { recursive: true, force: true });
ensureDir(outDir);

for (const entry of entriesToCopy) {
  const srcPath = path.join(rootDir, entry);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing required entry: ${entry}`);
  }
  copyRecursive(srcPath, path.join(outDir, entry));
}

for (const relativePath of collectHtmlFiles(outDir)) {
  const outputPath = path.join(outDir, relativePath);
  const html = fs.readFileSync(outputPath, "utf8");
  const canonicalRoute = routeForHtml(relativePath);
  const prefix = prefixForHtml(relativePath);
  fs.writeFileSync(
    outputPath,
    rewriteHtml(html, prefix, canonicalRoute),
    "utf8",
  );
}

fs.writeFileSync(path.join(outDir, ".nojekyll"), "", "utf8");

console.log(`Built GitHub Pages artifact in ${path.relative(rootDir, outDir)}`);
