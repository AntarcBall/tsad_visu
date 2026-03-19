#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const outputPath = path.join(distDir, "tsad-study-offline.html");

const routeConfigs = [
  { route: "/", id: "overview", source: "index.html", label: "Overview" },
  { route: "/background/", id: "background", source: "background/index.html", label: "Background" },
  { route: "/classical-limitations/", id: "classical-limitations", source: "classical-limitations/index.html", label: "Classical Limits" },
  { route: "/applications/", id: "applications", source: "applications/index.html", label: "Applications" },
  { route: "/methods/", id: "methods", source: "methods/index.html", label: "Methods" },
  { route: "/methods/dagmm/", id: "method-dagmm", source: "methods/dagmm/index.html", label: "DAGMM Lab", methodSlug: "dagmm" },
  { route: "/methods/mscred/", id: "method-mscred", source: "methods/mscred/index.html", label: "MSCRED Lab", methodSlug: "mscred" },
  { route: "/methods/omnianomaly/", id: "method-omnianomaly", source: "methods/omnianomaly/index.html", label: "OmniAnomaly Lab", methodSlug: "omnianomaly" },
  { route: "/methods/usad/", id: "method-usad", source: "methods/usad/index.html", label: "USAD Lab", methodSlug: "usad" },
  { route: "/methods/mad-gan/", id: "method-mad-gan", source: "methods/mad-gan/index.html", label: "MAD-GAN Lab", methodSlug: "mad-gan" },
  { route: "/methods/thoc/", id: "method-thoc", source: "methods/thoc/index.html", label: "THOC Lab", methodSlug: "thoc" },
  { route: "/methods/gta/", id: "method-gta", source: "methods/gta/index.html", label: "GTA Lab", methodSlug: "gta" },
  { route: "/methods/gdn/", id: "method-gdn", source: "methods/gdn/index.html", label: "GDN Lab", methodSlug: "gdn" },
  { route: "/methods/lstm-vae/", id: "method-lstm-vae", source: "methods/lstm-vae/index.html", label: "LSTM-VAE Lab", methodSlug: "lstm-vae" },
  { route: "/benchmarks/", id: "benchmarks", source: "benchmarks/index.html", label: "Benchmarks" },
  { route: "/guidelines/", id: "guidelines", source: "guidelines/index.html", label: "Guidelines" },
  { route: "/figures/", id: "figures", source: "figures/index.html", label: "Figures" },
  { route: "/glossary/", id: "glossary", source: "glossary/index.html", label: "Glossary" },
  { route: "/paper-map/", id: "paper-map", source: "paper-map/index.html", label: "Paper Map" },
  { route: "/about-paper/", id: "about-paper", source: "about-paper/index.html", label: "About Paper" },
  { route: "/playground/", id: "playground", source: "playground/index.html", label: "Playground" },
];

const routeToId = Object.fromEntries(routeConfigs.map((config) => [config.route, config.id]));
const knownRouteSet = new Set(routeConfigs.map((config) => config.route));
const assetCache = new Map();

function readFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function extractSection(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? match[1].trim() : "";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mimeTypeFor(assetPath) {
  const extension = path.extname(assetPath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".gif") return "image/gif";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".webp") return "image/webp";
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".css") return "text/css";
  if (extension === ".js") return "text/javascript";
  return "application/octet-stream";
}

function toDataUri(relativeAssetPath) {
  const normalized = relativeAssetPath.replace(/\\/g, "/");
  if (assetCache.has(normalized)) return assetCache.get(normalized);
  const absolutePath = path.join(rootDir, normalized);
  const bytes = fs.readFileSync(absolutePath);
  const dataUri = `data:${mimeTypeFor(normalized)};base64,${bytes.toString("base64")}`;
  assetCache.set(normalized, dataUri);
  return dataUri;
}

function resolveAssetPath(value, sourceFile) {
  const sourceDir = path.dirname(sourceFile);
  return path.normalize(path.join(sourceDir, value)).replace(/\\/g, "/");
}

function isEmbeddableAsset(value) {
  const lower = value.toLowerCase();
  return /\.(png|jpe?g|gif|svg|webp|pdf)$/.test(lower);
}

function rewriteHref(value) {
  if (knownRouteSet.has(value)) return `#${routeToId[value]}`;
  return value;
}

function rewriteHtmlFragment(fragment, sourceFile, routeConfig) {
  let next = fragment;

  next = next.replace(/(<div\s+data-method-lab-root)(?![^>]*data-method-slug)/g, `$1 data-method-slug="${routeConfig.methodSlug || ""}"`);

  next = next.replace(/(src|href)=("([^"]+)"|'([^']+)')/g, (fullMatch, attribute, quotedValue, doubleQuoted, singleQuoted) => {
    const originalValue = doubleQuoted || singleQuoted || "";
    const quote = quotedValue[0];
    if (!originalValue || originalValue.startsWith("#") || /^[a-z]+:/i.test(originalValue)) {
      return `${attribute}=${quote}${originalValue}${quote}`;
    }

    if (attribute === "href" && knownRouteSet.has(originalValue)) {
      return `${attribute}=${quote}${rewriteHref(originalValue)}${quote}`;
    }

    if (isEmbeddableAsset(originalValue)) {
      const assetPath = resolveAssetPath(originalValue, sourceFile);
      return `${attribute}=${quote}${toDataUri(assetPath)}${quote}`;
    }

    return `${attribute}=${quote}${originalValue}${quote}`;
  });

  return next;
}

function loadStudyData() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFile("assets/js/data.js"), sandbox, { filename: "assets/js/data.js" });
  return sandbox.window.STUDY_DATA;
}

function transformValue(value) {
  if (Array.isArray(value)) return value.map(transformValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, transformValue(item)]));
  }
  if (typeof value !== "string") return value;
  if (knownRouteSet.has(value)) return `#${routeToId[value]}`;
  if (isEmbeddableAsset(value)) {
    const assetPath = path.normalize(value.replace(/^\//, "")).replace(/\\/g, "/");
    if (fs.existsSync(path.join(rootDir, assetPath))) {
      return toDataUri(assetPath);
    }
  }
  return value;
}

function buildNav(configs) {
  const primaryRoutes = configs.filter((config) => !config.methodSlug);
  return primaryRoutes
    .map((config) => `<a class="nav-link" data-nav-link href="#${config.id}" data-route-target="${config.route}">${escapeHtml(config.label)}</a>`)
    .join("");
}

function buildRoutePanels() {
  return routeConfigs
    .map((config) => {
      const sourceHtml = readFile(config.source);
      const mainHtml = extractSection(sourceHtml, "main");
      const footerHtml = extractSection(sourceHtml, "footer");
      const rewrittenMain = rewriteHtmlFragment(mainHtml, config.source, config);
      const rewrittenFooter = rewriteHtmlFragment(footerHtml, config.source, config);
      const footerPanel = rewrittenFooter
        ? `<div class="route-footer"><div class="container">${rewrittenFooter}</div></div>`
        : "";
      const routePill = config.methodSlug ? "Method Lab" : "Study Route";
      return `
        <article class="route-panel" id="${config.id}" data-route="${config.route}" data-route-label="${escapeHtml(config.label)}">
          <div class="route-anchor-bar">
            <div class="container route-anchor-inner">
              <span class="eyebrow route-pill">${routePill}</span>
              <strong>${escapeHtml(config.label)}</strong>
              <span class="route-path">${escapeHtml(config.route)}</span>
            </div>
          </div>
          ${rewrittenMain}
          ${footerPanel}
        </article>
      `;
    })
    .join("\n");
}

function buildRuntime(studyData) {
  const routeMapJson = JSON.stringify(routeToId, null, 2);
  const mainRoutesJson = JSON.stringify(studyData.routeOrder);
  const studyDataJson = JSON.stringify(studyData, null, 2);

  return `
const STUDY_DATA = ${studyDataJson};
const ROUTE_TO_ID = ${routeMapJson};
const MAIN_ROUTES = ${mainRoutesJson};

(function () {
  const storageKey = "tsad-study-progress-offline-v1";
  const defaultState = {
    visited: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: 0,
    correct: 0,
    achievements: [],
  };

  function normalizeRoute(route) {
    if (!route) return "/";
    if (route === "#") return "/";
    if (route.startsWith("#")) {
      const id = route.slice(1);
      const match = Object.entries(ROUTE_TO_ID).find(([, value]) => value === id);
      return match ? match[0] : "/";
    }
    return route.endsWith("/") ? route : route + "/";
  }

  function routeToHash(route) {
    const id = ROUTE_TO_ID[normalizeRoute(route)] || ROUTE_TO_ID["/"];
    return "#" + id;
  }

  function loadState() {
    try {
      return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch (_error) {
      return { ...defaultState };
    }
  }

  function saveState(nextState) {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
    window.__TSAD_PROGRESS__ = nextState;
    renderProgress(nextState);
  }

  function markVisited(route) {
    const normalized = normalizeRoute(route);
    const state = loadState();
    if (!state.visited.includes(normalized)) {
      state.visited.push(normalized);
      saveState(state);
    }
  }

  function observeSections() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const route = entry.target.getAttribute("data-route");
          if (route) markVisited(route);
        });
      },
      { threshold: 0.35 },
    );

    document.querySelectorAll(".route-panel[data-route]").forEach((panel) => observer.observe(panel));
  }

  function renderMissionBoard(state, total) {
    const mount = document.querySelector("[data-mission-board]");
    if (!mount) return;
    const items = [
      { label: "퀴즈로 30점 달성", done: state.score >= 30, detail: "현재 " + state.score + "점" },
      { label: "3연속 정답 streak 만들기", done: state.streak >= 3, detail: "현재 streak " + state.streak },
      { label: "전체 페이지 순회 완료", done: state.visited.filter((route) => MAIN_ROUTES.includes(route)).length >= total, detail: "현재 " + state.visited.filter((route) => MAIN_ROUTES.includes(route)).length + "/" + total + " 페이지 방문" },
    ];
    mount.innerHTML = items
      .map((item) => \`
        <div class="map-link">
          <div>
            <strong>\${item.done ? "완료" : "진행 중"}</strong> · \${item.label}
            <div class="muted small">\${item.detail}</div>
          </div>
          <span class="badge">\${item.done ? "✓" : "..."}</span>
        </div>
      \`)
      .join("");
  }

  function renderAchievementBoard(state) {
    const mount = document.querySelector("[data-achievement-board]");
    if (!mount) return;
    const unlocked = new Set(state.achievements || []);
    const items = [
      { name: "개념 수집가", hint: "점수 30점 이상" },
      { name: "연속 추론가", hint: "streak 3 이상" },
      { name: "길찾기 완주자", hint: "모든 페이지 방문" },
    ];
    mount.innerHTML = items
      .map((item) => \`
        <div class="map-link">
          <div>
            <strong>\${item.name}</strong>
            <div class="muted small">\${unlocked.has(item.name) ? "배지 해금 완료" : item.hint}</div>
          </div>
          <span class="badge">\${unlocked.has(item.name) ? "Unlocked" : "Locked"}</span>
        </div>
      \`)
      .join("");
  }

  function renderQuizStats(state) {
    const mount = document.querySelector("[data-quiz-stats]");
    if (!mount) return;
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    mount.innerHTML = \`
      <div class="study-map">
        <div class="map-link"><span>푼 문제 수</span><strong>\${state.answered}</strong></div>
        <div class="map-link"><span>정답률</span><strong>\${accuracy}%</strong></div>
        <div class="map-link"><span>최고 streak</span><strong>\${state.bestStreak || 0}</strong></div>
      </div>
    \`;
  }

  function renderNextRoute(state, total) {
    const nextLink = document.querySelector("[data-next-route]");
    const summary = document.querySelector("[data-mission-summary]");
    if (!nextLink) return;
    const visitedMain = state.visited.filter((route) => MAIN_ROUTES.includes(route));
    const nextRoute = MAIN_ROUTES.find((route) => !visitedMain.includes(route)) || "/";
    nextLink.href = routeToHash(nextRoute);
    nextLink.textContent =
      visitedMain.length >= total
        ? "Overview로 돌아가 복습 마무리"
        : (STUDY_DATA.routeLabels[nextRoute] || "다음 페이지") + "로 이동";
    if (summary) {
      summary.textContent =
        visitedMain.length >= total
          ? "전체 페이지를 한 바퀴 돌았습니다. 이제 Overview로 돌아가 흐름을 다시 압축하세요."
          : "다음 약한 고리는 " + (STUDY_DATA.routeLabels[nextRoute] || nextRoute) + "입니다. 페이지를 열어 설명이 막히는 문장을 다시 확인해 보세요.";
    }
  }

  function renderProgress(state) {
    const total = MAIN_ROUTES.length || 1;
    const visitedMain = state.visited.filter((route) => MAIN_ROUTES.includes(route));
    const percent = Math.round((visitedMain.length / total) * 100);
    document.querySelectorAll("[data-progress-summary]").forEach((node) => {
      node.textContent = "학습 진행 " + visitedMain.length + "/" + total + " · 점수 " + state.score + " · 연속 정답 " + state.streak + " · " + percent + "% 완료";
    });
    document.querySelectorAll("[data-progress-fill]").forEach((el) => {
      el.style.width = percent + "%";
    });
    document.querySelectorAll("[data-score]").forEach((el) => {
      el.textContent = String(state.score);
    });
    document.querySelectorAll("[data-streak]").forEach((el) => {
      el.textContent = String(state.streak);
    });
    document.querySelectorAll("[data-visited]").forEach((el) => {
      el.textContent = visitedMain.length + "/" + total;
    });
    renderMissionBoard(state, total);
    renderAchievementBoard(state);
    renderQuizStats(state);
    renderNextRoute(state, total);
  }

  function setupNav() {
    function updateActive() {
      const currentHash = location.hash || "#overview";
      const currentRoute = normalizeRoute(currentHash);
      const highlightRoute = currentRoute.startsWith("/methods/") && currentRoute !== "/methods/" ? "/methods/" : currentRoute;
      document.querySelectorAll("[data-nav-link]").forEach((link) => {
        const linkRoute = link.getAttribute("data-route-target");
        link.classList.toggle("active", normalizeRoute(linkRoute) === highlightRoute);
      });
    }

    window.addEventListener("hashchange", updateActive);
    updateActive();
  }

  function bindTabs() {
    const tabsRoot = document.querySelector("[data-anomaly-tabs]");
    if (!tabsRoot || !STUDY_DATA.anomalyTabs) return;
    const image = document.querySelector("[data-anomaly-image]");
    const title = document.querySelector("[data-anomaly-title]");
    const summary = document.querySelector("[data-anomaly-summary]");
    const note = document.querySelector("[data-anomaly-note]");

    function select(id) {
      const selected = STUDY_DATA.anomalyTabs.find((item) => item.id === id) || STUDY_DATA.anomalyTabs[0];
      tabsRoot.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.id === selected.id);
      });
      if (image) image.src = selected.image;
      if (title) title.textContent = selected.title;
      if (summary) summary.textContent = selected.summary;
      if (note) note.textContent = selected.note;
    }

    tabsRoot.addEventListener("click", (event) => {
      const btn = event.target.closest(".tab-btn");
      if (!btn) return;
      select(btn.dataset.id);
    });

    select(STUDY_DATA.anomalyTabs[0].id);
  }

  function renderModels() {
    const mount = document.querySelector("[data-model-grid]");
    if (!mount || !STUDY_DATA.models) return;
    const family = document.querySelector("[data-filter-family]");
    const temporal = document.querySelector("[data-filter-temporal]");
    const criterion = document.querySelector("[data-filter-criterion]");

    function template(model) {
      return \`
        <article class="model-card">
          <span class="tag">\${model.family}</span>
          <h3>\${model.name}</h3>
          <p class="muted small">\${model.bestFor}</p>
          <div class="meta-row">
            <span class="badge">inter-correlation: \${model.interCorrelation}</span>
            <span class="badge">temporal: \${model.temporal}</span>
            <span class="badge">criterion: \${model.criterion}</span>
          </div>
          <div class="grid-2 model-card-split">
            <div>
              <strong>장점</strong>
              <ul>\${model.strengths.map((item) => "<li>" + item + "</li>").join("")}</ul>
            </div>
            <div>
              <strong>주의점</strong>
              <ul>\${model.cautions.map((item) => "<li>" + item + "</li>").join("")}</ul>
            </div>
          </div>
          \${model.route ? '<div class="method-card-actions"><a class="btn secondary" href="' + routeToHash(model.route) + '">Simulator 열기</a></div>' : ""}
        </article>
      \`;
    }

    function update() {
      const visible = STUDY_DATA.models.filter((model) =>
        (!family.value || model.family === family.value) &&
        (!temporal.value || model.temporal === temporal.value) &&
        (!criterion.value || model.criterion === criterion.value)
      );
      mount.innerHTML =
        visible.map(template).join("") ||
        '<div class="result-box">조건에 맞는 모델이 없습니다. 필터를 조금 완화해 보세요.</div>';
    }

    [family, temporal, criterion].forEach((node) => node && node.addEventListener("change", update));
    update();
  }

  function renderDatasets() {
    const mount = document.querySelector("[data-dataset-grid]");
    if (!mount || !STUDY_DATA.datasets) return;
    mount.innerHTML = STUDY_DATA.datasets
      .map((dataset) => \`
        <article class="model-card">
          <span class="tag">\${dataset.domain}</span>
          <h3>\${dataset.name}</h3>
          <p class="muted small">length \${dataset.length} · dimension \${dataset.dimension}</p>
          <ul>
            <li><strong>anomaly setup:</strong> \${dataset.anomalies}</li>
            <li><strong>study takeaway:</strong> \${dataset.takeaway}</li>
          </ul>
        </article>
      \`)
      .join("");
  }

  function bindGuidelineBuilder() {
    const form = document.querySelector("[data-guideline-builder]");
    const out = document.querySelector("[data-guideline-result]");
    if (!form || !out) return;

    function recommend() {
      const mode = form.querySelector('[name="mode"]').value;
      const update = form.querySelector('[name="update"]').value;
      const dimension = form.querySelector('[name="dimension"]').value;
      const relation = form.querySelector('[name="relation"]').value;
      const labels = form.querySelector('[name="labels"]').value;
      const picks = [];

      if (mode === "realtime") picks.push("GRU/CNN 기반 reconstruction workflow를 우선 검토");
      if (mode === "warning") picks.push("LSTM/HTM 계열의 predictive setup과 threshold tuning에 더 많은 비중");
      if (update === "window") picks.push("sliding window 기반 2D matrix / ConvLSTM / Transformer 실험");
      if (update === "incremental") picks.push("online update와 adaptive threshold를 함께 고려");
      if (dimension === "high") picks.push("graph structure learning 또는 selective dimensional reduction 검토");
      if (relation === "strong") picks.push("GDN/GTA처럼 attribute relation을 explicit하게 학습하는 모델 우선");
      if (labels === "scarce") picks.push("semi-supervised/unsupervised setup 전제 유지");

      const caution =
        dimension === "high"
          ? "WADI 분석처럼 high dimension에서는 계산량이 급격히 늘어납니다. “더 큰 모델”보다 “relation-aware modeling”이 더 중요할 수 있습니다."
          : "중간 규모 dimension이라면 temporal modeling 품질과 threshold strategy가 더 큰 차이를 만들 수 있습니다.";

      out.innerHTML = \`
        <h3>추천 워크플로</h3>
        <ul>\${picks.map((item) => "<li>" + item + "</li>").join("")}</ul>
        <p class="callout">\${caution}</p>
      \`;
    }

    form.addEventListener("change", recommend);
    recommend();
  }

  function bindProgressActions() {
    const resetButton = document.querySelector("[data-reset-progress]");
    if (!resetButton) return;
    resetButton.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      const fresh = loadState();
      saveState(fresh);
      bindQuiz();
    });
  }

  function bindQuiz() {
    const mount = document.querySelector("[data-quiz]");
    if (!mount || !STUDY_DATA.quiz) return;
    let index = 0;
    let locked = false;

    function unlockAchievement(nextState) {
      const achievements = new Set(nextState.achievements || []);
      if (nextState.score >= 30) achievements.add("개념 수집가");
      if (nextState.streak >= 3) achievements.add("연속 추론가");
      if (nextState.visited.filter((route) => MAIN_ROUTES.includes(route)).length >= MAIN_ROUTES.length) achievements.add("길찾기 완주자");
      nextState.achievements = Array.from(achievements);
      return nextState;
    }

    function render() {
      const item = STUDY_DATA.quiz[index];
      mount.innerHTML = \`
        <div class="quiz-shell panel hero-card">
          <div class="badge">문제 \${index + 1} / \${STUDY_DATA.quiz.length}</div>
          <h3>\${item.question}</h3>
          <div class="choice-grid">
            \${item.choices.map((choice, choiceIndex) => '<button class="choice-btn" data-choice="' + choiceIndex + '">' + choice + "</button>").join("")}
          </div>
          <div class="muted" data-quiz-feedback>정답을 선택하면 explanation이 나옵니다.</div>
        </div>
      \`;
      locked = false;
    }

    mount.onclick = (event) => {
      const btn = event.target.closest("[data-choice]");
      if (!btn || locked) return;
      locked = true;
      const item = STUDY_DATA.quiz[index];
      const chosen = Number(btn.dataset.choice);
      const feedback = mount.querySelector("[data-quiz-feedback]");
      mount.querySelectorAll("[data-choice]").forEach((node) => {
        const value = Number(node.dataset.choice);
        if (value === item.answer) node.classList.add("correct");
        if (value === chosen && value !== item.answer) node.classList.add("wrong");
      });

      const nextState = loadState();
      nextState.answered += 1;
      if (chosen === item.answer) {
        nextState.score += 10;
        nextState.correct += 1;
        nextState.streak += 1;
        nextState.bestStreak = Math.max(nextState.bestStreak || 0, nextState.streak);
        feedback.textContent = "정답! " + item.explanation;
      } else {
        nextState.streak = 0;
        feedback.textContent = "오답. " + item.explanation;
      }
      saveState(unlockAchievement(nextState));

      setTimeout(() => {
        index = (index + 1) % STUDY_DATA.quiz.length;
        render();
      }, 2200);
    };

    render();
  }

  function bindFlashcards() {
    const mount = document.querySelector("[data-flashcards]");
    if (!mount || !STUDY_DATA.flashcards) return;
    mount.innerHTML = STUDY_DATA.flashcards
      .map((card, index) => \`
        <article class="flash-card" data-flashcard="\${index}">
          <div class="badge">Flashcard</div>
          <h3>\${card.front}</h3>
          <p class="muted">클릭해서 answer 보기</p>
          <div class="small" data-flash-answer hidden>\${card.back}</div>
        </article>
      \`)
      .join("");

    mount.addEventListener("click", (event) => {
      const card = event.target.closest("[data-flashcard]");
      if (!card) return;
      card.classList.toggle("is-open");
      const answer = card.querySelector("[data-flash-answer]");
      const hint = card.querySelector(".muted");
      const open = card.classList.contains("is-open");
      answer.hidden = !open;
      hint.textContent = open ? "answer open" : "클릭해서 answer 보기";
    });
  }

  function bindImageZoom() {
    const selector = ".figure-card img, .figure-thumb img, .atlas-card img, .figure-inline img, [data-anomaly-image]";
    const overlay = document.createElement("div");
    overlay.className = "image-zoom-overlay";
    overlay.hidden = true;
    overlay.innerHTML = \`
      <div class="image-zoom-stage">
        <img alt="" />
        <div class="image-zoom-meta">터치/스크롤로 확대 · 바깥 탭 또는 Esc 로 닫기</div>
      </div>
    \`;
    document.body.appendChild(overlay);

    const zoomedImage = overlay.querySelector("img");
    const zoomStage = overlay.querySelector(".image-zoom-stage");
    let zoomScale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragMoved = false;

    function applyZoomTransform() {
      zoomedImage.style.transform = "translate(" + translateX + "px, " + translateY + "px) scale(" + zoomScale + ")";
      zoomedImage.style.cursor = zoomScale > 1 ? "grab" : "zoom-out";
    }

    function clampTranslation() {
      const rect = zoomedImage.getBoundingClientRect();
      const stageRect = zoomStage.getBoundingClientRect();
      const overflowX = Math.max(0, (rect.width - stageRect.width) / 2);
      const overflowY = Math.max(0, (rect.height - stageRect.height) / 2);
      translateX = Math.min(overflowX, Math.max(-overflowX, translateX));
      translateY = Math.min(overflowY, Math.max(-overflowY, translateY));
    }

    function closeZoom() {
      overlay.hidden = true;
      zoomedImage.removeAttribute("src");
      zoomedImage.removeAttribute("style");
      zoomedImage.alt = "";
      zoomScale = 1;
      translateX = 0;
      translateY = 0;
      isDragging = false;
      dragMoved = false;
    }

    function openZoom(img) {
      const naturalWidth = img.naturalWidth || img.width || 0;
      const naturalHeight = img.naturalHeight || img.height || 0;
      zoomedImage.src = img.currentSrc || img.src;
      zoomedImage.alt = img.alt || "Zoomed figure";
      if (naturalWidth && naturalHeight) {
        const maxWidth = Math.min(window.innerWidth * 0.92, naturalWidth * 3);
        const maxHeight = Math.min(window.innerHeight * 0.82, naturalHeight * 3);
        zoomedImage.style.maxWidth = maxWidth + "px";
        zoomedImage.style.maxHeight = maxHeight + "px";
      }
      zoomScale = 1;
      translateX = 0;
      translateY = 0;
      applyZoomTransform();
      overlay.hidden = false;
    }

    document.addEventListener("mouseup", (event) => {
      const img = event.target.closest(selector);
      if (!img) return;
      openZoom(img);
    });

    overlay.addEventListener("click", (event) => {
      if (!zoomStage.contains(event.target)) {
        closeZoom();
        return;
      }
      if (event.target === zoomedImage && !dragMoved && zoomScale <= 1.02) closeZoom();
    });

    zoomedImage.addEventListener("wheel", (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.2 : -0.2;
      zoomScale = Math.min(3, Math.max(1, +(zoomScale + delta).toFixed(2)));
      if (zoomScale === 1) {
        translateX = 0;
        translateY = 0;
      } else {
        clampTranslation();
      }
      applyZoomTransform();
    }, { passive: false });

    zoomedImage.addEventListener("pointerdown", (event) => {
      if (zoomScale <= 1) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = event.clientX - translateX;
      dragStartY = event.clientY - translateY;
      zoomedImage.style.cursor = "grabbing";
      zoomedImage.setPointerCapture(event.pointerId);
    });

    zoomedImage.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      translateX = event.clientX - dragStartX;
      translateY = event.clientY - dragStartY;
      clampTranslation();
      applyZoomTransform();
      dragMoved = true;
    });

    function stopDragging(event) {
      if (!isDragging) return;
      isDragging = false;
      if (event && event.pointerId !== undefined) {
        try {
          zoomedImage.releasePointerCapture(event.pointerId);
        } catch (_error) {
        }
      }
      applyZoomTransform();
      setTimeout(() => {
        dragMoved = false;
      }, 0);
    }

    zoomedImage.addEventListener("pointerup", stopDragging);
    zoomedImage.addEventListener("pointercancel", stopDragging);
    zoomStage.addEventListener("mouseleave", closeZoom);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeZoom();
    });
    window.addEventListener("scroll", () => {
      if (!overlay.hidden) closeZoom();
    });
  }

  function bindMethodLabs() {
    const study = STUDY_DATA || {};
    const lab = study.methodLab;
    if (!lab) return;

    document.querySelectorAll("[data-method-lab-root][data-method-slug]").forEach((root) => {
      const slug = root.getAttribute("data-method-slug");
      const method = (lab.methods || []).find((item) => item.slug === slug);
      if (!method) return;

      const controls = {
        windowSize: method.controls && method.controls.recommendedWindow || 36,
        relationStrength: 0.62,
        memoryHorizon: 0.58,
        anomalyAmplitude: method.controls && method.controls.anomalySweetSpot || 0.56,
        noiseLevel: 0.28,
        threshold: method.controls && method.controls.recommendedThreshold || 0.5,
      };

      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
      const pct = (value) => Math.round(value * 100) + "%";

      function metricScores() {
        const relationFit = clamp(0.35 + method.focus.relation * controls.relationStrength + (1 - Math.abs(controls.windowSize - ((method.controls && method.controls.recommendedWindow) || 36)) / 80) * 0.2, 0, 1);
        const temporalFit = clamp(0.22 + method.focus.temporal * controls.memoryHorizon + Math.min(controls.windowSize / 80, 1) * 0.16, 0, 1);
        const criterionFit = clamp(0.24 + method.focus.criterion * controls.anomalyAmplitude + (1 - controls.noiseLevel * 0.38), 0, 1);
        const thresholdFit = clamp(1 - Math.abs(controls.threshold - ((method.controls && method.controls.recommendedThreshold) || 0.5)) * 1.65, 0, 1);
        const detection = clamp(relationFit * 0.28 + temporalFit * 0.28 + criterionFit * 0.3 + thresholdFit * 0.14, 0, 1);
        const latency = clamp(method.focus.baselineLatency - controls.windowSize / 160 + controls.memoryHorizon * 0.16 - controls.noiseLevel * 0.05, 0, 1);
        const explainability = clamp(method.focus.explainability + thresholdFit * 0.14 - controls.noiseLevel * 0.08, 0, 1);
        const robustness = clamp(detection * 0.68 + (1 - controls.noiseLevel) * 0.18 + thresholdFit * 0.14, 0, 1);
        return { relationFit, temporalFit, criterionFit, thresholdFit, detection, latency, explainability, robustness };
      }

      function statusFor(score) {
        if (score >= 0.75) return { label: "좋음", cls: "good" };
        if (score >= 0.52) return { label: "주의", cls: "warn" };
        return { label: "리스크", cls: "risk" };
      }

      function insightCopy(scores) {
        const messages = [];
        messages.push(scores.relationFit >= 0.75 ? "변수 관계 신호를 잘 붙잡고 있습니다." : "relation signal이 약해 edge/상관 구조 설명력이 낮습니다.");
        messages.push(scores.temporalFit >= 0.75 ? "긴 문맥까지 안정적으로 읽는 상태입니다." : "window 또는 memory 설정이 짧아 temporal drift를 덜 봅니다.");
        messages.push(scores.thresholdFit >= 0.75 ? "threshold가 권장 범위 근처라 calibration이 안정적입니다." : "threshold가 권장 범위를 벗어나 false alarm / miss risk가 큽니다.");
        return messages.join(" ");
      }

      function makeBars(scores) {
        return [
          { label: method.scoreLabels && method.scoreLabels[0] || "relation", value: scores.relationFit },
          { label: method.scoreLabels && method.scoreLabels[1] || "temporal", value: scores.temporalFit },
          { label: method.scoreLabels && method.scoreLabels[2] || "criterion", value: scores.explainability },
          { label: method.scoreLabels && method.scoreLabels[3] || "latency", value: scores.latency },
        ].map((item) => \`
          <div class="method-lab-bar">
            <div class="method-lab-control-top"><strong>\${item.label}</strong><span class="badge">\${pct(item.value)}</span></div>
            <div class="method-lab-bar-track"><div class="method-lab-bar-fill" style="width:\${pct(item.value)}"></div></div>
          </div>
        \`).join("");
      }

      function makeSparkline(scores) {
        const anomalyIndex = Math.max(2, Math.min(15, Math.round(controls.windowSize / 5)));
        return Array.from({ length: 18 }, (_, index) => {
          const wave = 0.28 + Math.abs(Math.sin((index + 1) * 0.55)) * 0.34 + controls.noiseLevel * 0.18;
          const anomalyBoost = index >= anomalyIndex && index <= anomalyIndex + 2 ? controls.anomalyAmplitude * (0.45 + scores.detection * 0.45) : 0;
          const height = clamp(wave + anomalyBoost + scores.temporalFit * 0.12, 0.12, 1);
          return '<div class="method-lab-spark ' + (anomalyBoost ? "is-anomaly" : "") + '" style="height:' + Math.round(height * 100) + '%"><span>' + (index + 1) + "</span></div>";
        }).join("");
      }

      function controlMarkup() {
        return [
          ["windowSize", "Window size", controls.windowSize, 12, 80, 1, "짧으면 즉각 반응, 길면 더 긴 context 확인"],
          ["relationStrength", "Relation strength", controls.relationStrength, 0, 1, 0.01, "센서 간 coupling이 얼마나 강한지"],
          ["memoryHorizon", "Memory horizon", controls.memoryHorizon, 0, 1, 0.01, "긴 temporal context가 얼마나 필요한지"],
          ["anomalyAmplitude", "Anomaly amplitude", controls.anomalyAmplitude, 0, 1, 0.01, "이상 신호가 얼마나 크게 튀는지"],
          ["noiseLevel", "Noise level", controls.noiseLevel, 0, 1, 0.01, "정상 변동성/측정 noise"],
          ["threshold", "Threshold", controls.threshold, 0, 1, 0.01, "alarm 기준선 calibration"],
        ].map(([key, label, value, min, max, step, hint]) => \`
          <label class="method-lab-control">
            <div class="method-lab-control-top"><span>\${label}</span><strong>\${key === "windowSize" ? value : pct(value)}</strong></div>
            <input type="range" min="\${min}" max="\${max}" step="\${step}" value="\${value}" data-method-control="\${key}">
            <div class="method-lab-control-hint small">\${hint}</div>
          </label>
        \`).join("");
      }

      function render() {
        const scores = metricScores();
        const detectionStatus = statusFor(scores.detection);
        const robustnessStatus = statusFor(scores.robustness);
        root.innerHTML = \`
          <section class="method-lab-shell">
            <article class="panel hero-card method-lab-header">
              <div class="eyebrow">\${lab.intro && lab.intro.eyebrow || "Method Lab"} · \${method.family}</div>
              <h1>\${method.name} simulator</h1>
              <p class="lead">\${method.summary}</p>
              <div class="meta-row">
                <span class="badge">핵심 질문: \${method.coreQuestion}</span>
                <span class="badge">추천 window \${method.controls && method.controls.recommendedWindow}</span>
                <span class="badge">추천 threshold \${Math.round(((method.controls && method.controls.recommendedThreshold) || 0.5) * 100)}%</span>
              </div>
              <p class="method-lab-copy">\${method.intuition}</p>
              <div class="result-box"><strong>Play tip</strong><div class="stack-top-sm muted">\${method.playgroundPrompt}</div></div>
            </article>

            <div class="method-lab-subgrid">
              <article class="card method-lab-stage">
                <div class="section-head section-head-compact"><div><div class="eyebrow">Toy controls</div><h2 class="section-title section-title-compact">설정을 바꾸면 score가 바로 반응합니다</h2></div></div>
                <div class="method-lab-controls">\${controlMarkup()}</div>
              </article>

              <article class="card method-lab-stage">
                <div class="section-head section-head-compact"><div><div class="eyebrow">Signal preview</div><h2 class="section-title section-title-compact">window 속 anomaly segment</h2></div><span class="badge">toy sequence</span></div>
                <div class="method-lab-sparkline">\${makeSparkline(scores)}</div>
                <p class="method-lab-caption small">노란 bar는 anomaly segment입니다. relation / memory / threshold를 바꾸며 얼마나 score가 달라지는지 보세요.</p>
              </article>
            </div>

            <div class="method-lab-stats">
              <article class="method-lab-stat"><strong>Detection score</strong><span class="method-lab-stat-value">\${Math.round(scores.detection * 100)}</span><div class="method-lab-status \${detectionStatus.cls}">\${detectionStatus.label}</div></article>
              <article class="method-lab-stat"><strong>Robustness</strong><span class="method-lab-stat-value">\${Math.round(scores.robustness * 100)}</span><div class="method-lab-status \${robustnessStatus.cls}">\${robustnessStatus.label}</div></article>
              <article class="method-lab-stat"><strong>Explainability</strong><span class="method-lab-stat-value">\${Math.round(scores.explainability * 100)}</span><div class="small muted">발표/설명 친화도</div></article>
              <article class="method-lab-stat"><strong>Latency fit</strong><span class="method-lab-stat-value">\${Math.round(scores.latency * 100)}</span><div class="small muted">실시간 대응 여유</div></article>
            </div>

            <article class="card">
              <div class="section-head section-head-compact"><div><div class="eyebrow">Scoreboard</div><h2 class="section-title section-title-compact">왜 점수가 이렇게 나왔는가</h2></div></div>
              <div class="method-lab-bars">\${makeBars(scores)}</div>
              <p class="result-box stack-top-md"><strong>해석</strong><span class="stack-top-sm muted" style="display:block;">\${insightCopy(scores)}</span></p>
            </article>

            <div class="method-lab-lesson-grid">
              <article class="method-lab-lesson"><strong>Core logic</strong><ol class="info-list">\${method.logic.map((item) => "<li>" + item + "</li>").join("")}</ol></article>
              <article class="method-lab-lesson"><strong>잘 맞는 상황</strong><ul class="info-list">\${method.useCases.map((item) => "<li>" + item + "</li>").join("")}</ul></article>
              <article class="method-lab-lesson"><strong>주의할 점</strong><ul class="info-list">\${method.cautions.map((item) => "<li>" + item + "</li>").join("")}</ul></article>
            </div>

            <div class="method-lab-mini-grid">
              <article class="method-lab-mini"><strong>강점</strong><ul class="info-list">\${method.strengths.map((item) => "<li>" + item + "</li>").join("")}</ul></article>
              <article class="method-lab-mini"><strong>한 줄 메모</strong><p class="method-lab-copy">\${lab.intro && lab.intro.summary || ""}</p></article>
            </div>
          </section>
        \`;

        root.querySelectorAll("[data-method-control]").forEach((input) => {
          input.addEventListener("input", (event) => {
            controls[event.target.dataset.methodControl] = Number(event.target.value);
            render();
          });
        });
      }

      render();
    });
  }

  if (!location.hash) history.replaceState(null, "", "#overview");
  markVisited(normalizeRoute(location.hash));
  setupNav();
  observeSections();
  bindTabs();
  renderModels();
  renderDatasets();
  bindGuidelineBuilder();
  bindProgressActions();
  bindQuiz();
  bindFlashcards();
  bindImageZoom();
  bindMethodLabs();
  renderProgress(loadState());
})();
`;
}

function main() {
  const baseCss = readFile("assets/css/style.css");
  const extraCss = `
.offline-page-note {
  margin: 0;
  color: var(--muted);
}
.offline-intro {
  padding: 18px 20px 0;
}
.route-panel {
  scroll-margin-top: 92px;
}
.route-anchor-bar {
  position: sticky;
  top: 74px;
  z-index: 10;
  backdrop-filter: blur(16px);
}
.route-anchor-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  padding-top: 10px;
}
.route-pill {
  margin-bottom: 0;
}
.route-path {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
}
.route-footer {
  padding-bottom: 10px;
}
.route-footer .footer {
  margin-top: 0;
}
.route-footer .footer-card {
  margin-top: 0;
}
.offline-shell {
  padding-bottom: 80px;
}
@media (max-width: 720px) {
  .route-anchor-bar {
    top: 112px;
  }
  .route-anchor-inner {
    padding-top: 6px;
  }
}
`;

  const transformedData = transformValue(loadStudyData());
  const navHtml = buildNav(routeConfigs);
  const routePanelsHtml = buildRoutePanels();
  const runtimeJs = buildRuntime(transformedData);

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TSAD Deep Study Offline</title>
  <meta name="description" content="모바일과 데스크톱에서 localhost 없이 바로 열 수 있는 TSAD Deep Study 오프라인 단일 HTML.">
  <style>
${baseCss}
${extraCss}
  </style>
</head>
<body>
  <div class="page-shell offline-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#overview">
          <span class="brand-mark">TS</span>
          <span>TSAD Deep Study Offline</span>
        </a>
        <nav class="nav-links">
${navHtml}
        </nav>
      </div>
      <div class="container offline-intro">
        <p class="offline-page-note">단일 self-contained HTML입니다. 모바일에서도 <span class="codeish">file://</span>로 바로 열 수 있고, 점수/진도는 브라우저 로컬 저장소에 저장됩니다.</p>
      </div>
    </header>

    <main>
${routePanelsHtml}
    </main>
  </div>
  <script>
${runtimeJs}
  </script>
</body>
</html>
`;

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");
  process.stdout.write(outputPath + "\n");
}

main();
