(function () {
  const storageKey = "tsad-study-progress-v1";
  const sitePrefix = window.__TSAD_SITE_PREFIX__ || "";
  const canonicalRoute = window.__TSAD_CANONICAL_ROUTE__ || null;
  const defaultState = {
    visited: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: 0,
    correct: 0,
    achievements: [],
  };
  const data = window.STUDY_DATA || { routeOrder: [] };
  const routeLabels = data.routeLabels || {
    "/": "Overview",
    "/background/": "Background",
    "/classical-limitations/": "Classical Limits",
    "/applications/": "Applications",
    "/methods/": "Methods",
    "/benchmarks/": "Benchmarks",
    "/guidelines/": "Guidelines",
    "/figures/": "Figures",
    "/glossary/": "Glossary",
    "/about-paper/": "About Paper",
    "/paper-map/": "Paper Map",
    "/playground/": "Playground",
  };

  function normalizePath(pathname) {
    if (!pathname) return "/";
    const [pathOnly] = pathname.split(/[?#]/, 1);
    const clean = pathOnly.endsWith("index.html")
      ? pathOnly.replace(/index\.html$/, "")
      : pathOnly;
    if (clean === "") return "/";
    return clean.endsWith("/") ? clean : clean + "/";
  }

  function currentRoute() {
    return canonicalRoute || normalizePath(location.pathname);
  }

  function resolveSitePath(pathname) {
    if (!pathname || pathname === "/") return sitePrefix || "./";
    if (!pathname.startsWith("/")) return pathname;
    return `${sitePrefix}${pathname.slice(1)}`;
  }

  function loadState() {
    try {
      return Object.assign(
        {},
        defaultState,
        JSON.parse(localStorage.getItem(storageKey) || "{}"),
      );
    } catch (error) {
      return { ...defaultState };
    }
  }

  function saveState(nextState) {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
    window.__TSAD_PROGRESS__ = nextState;
    renderProgress(nextState);
  }

  function markVisited() {
    const state = loadState();
    const current = currentRoute();
    if (!state.visited.includes(current)) state.visited.push(current);
    saveState(state);
  }

  function renderMissionBoard(state, total) {
    const mount = document.querySelector("[data-mission-board]");
    if (!mount) return;
    const items = [
      {
        label: "퀴즈로 30점 달성",
        done: state.score >= 30,
        detail: `현재 ${state.score}점`,
      },
      {
        label: "3연속 정답 streak 만들기",
        done: state.streak >= 3,
        detail: `현재 streak ${state.streak}`,
      },
      {
        label: "전체 페이지 순회 완료",
        done: state.visited.length >= total,
        detail: `현재 ${state.visited.length}/${total} 페이지 방문`,
      },
    ];
    mount.innerHTML = items
      .map(
        (item) => `
      <div class="map-link">
        <div>
          <strong>${item.done ? "완료" : "진행 중"}</strong> · ${item.label}
          <div class="muted small">${item.detail}</div>
        </div>
        <span class="badge">${item.done ? "✓" : "..."}</span>
      </div>
    `,
      )
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
      .map(
        (item) => `
      <div class="map-link">
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">${unlocked.has(item.name) ? "배지 해금 완료" : item.hint}</div>
        </div>
        <span class="badge">${unlocked.has(item.name) ? "Unlocked" : "Locked"}</span>
      </div>
    `,
      )
      .join("");
  }

  function renderQuizStats(state) {
    const mount = document.querySelector("[data-quiz-stats]");
    if (!mount) return;
    const accuracy = state.answered
      ? Math.round((state.correct / state.answered) * 100)
      : 0;
    mount.innerHTML = `
      <div class="study-map">
        <div class="map-link"><span>푼 문제 수</span><strong>${state.answered}</strong></div>
        <div class="map-link"><span>정답률</span><strong>${accuracy}%</strong></div>
        <div class="map-link"><span>최고 streak</span><strong>${state.bestStreak || 0}</strong></div>
      </div>
    `;
  }

  function renderNextRoute(state, total) {
    const nextLink = document.querySelector("[data-next-route]");
    const summary = document.querySelector("[data-mission-summary]");
    if (!nextLink) return;
    const nextPath =
      (data.routeOrder || []).find((route) => !state.visited.includes(route)) ||
      "/";
    nextLink.href = resolveSitePath(nextPath);
    nextLink.textContent =
      state.visited.length >= total
        ? "Overview로 돌아가 복습 마무리"
        : `${routeLabels[nextPath] || "다음 페이지"}로 이동`;
    if (summary) {
      summary.textContent =
        state.visited.length >= total
          ? "전체 페이지를 한 바퀴 돌았습니다. 이제 Overview로 돌아가 흐름을 다시 압축하세요."
          : `다음 약한 고리는 ${routeLabels[nextPath] || nextPath}입니다. 페이지를 열어 설명이 막히는 문장을 다시 확인해 보세요.`;
    }
  }

  function renderProgress(state) {
    const counters = document.querySelectorAll("[data-progress-summary]");
    const total = (data.routeOrder || []).length || 1;
    const percent = Math.round((state.visited.length / total) * 100);
    counters.forEach((node) => {
      node.textContent = `학습 진행 ${state.visited.length}/${total} · 점수 ${state.score} · 연속 정답 ${state.streak} · ${percent}% 완료`;
    });
    document.querySelectorAll("[data-progress-fill]").forEach((el) => {
      el.style.width = `${percent}%`;
    });
    document.querySelectorAll("[data-score]").forEach((el) => {
      el.textContent = String(state.score);
    });
    document.querySelectorAll("[data-streak]").forEach((el) => {
      el.textContent = String(state.streak);
    });
    document.querySelectorAll("[data-visited]").forEach((el) => {
      el.textContent = `${state.visited.length}/${total}`;
    });
    renderMissionBoard(state, total);
    renderAchievementBoard(state);
    renderQuizStats(state);
    renderNextRoute(state, total);
  }

  function setupNav() {
    const current = currentRoute();
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = normalizePath(link.dataset.route || link.getAttribute("href") || "/");
      if (href === current) link.classList.add("active");
    });
  }

  function bindTabs() {
    const tabsRoot = document.querySelector("[data-anomaly-tabs]");
    if (!tabsRoot || !data.anomalyTabs) return;
    const image = document.querySelector("[data-anomaly-image]");
    const title = document.querySelector("[data-anomaly-title]");
    const summary = document.querySelector("[data-anomaly-summary]");
    const note = document.querySelector("[data-anomaly-note]");

    function select(id) {
      const selected =
        data.anomalyTabs.find((item) => item.id === id) || data.anomalyTabs[0];
      tabsRoot
        .querySelectorAll(".tab-btn")
        .forEach((btn) =>
          btn.classList.toggle("active", btn.dataset.id === selected.id),
        );
      if (image) image.src = resolveSitePath(selected.image);
      if (title) title.textContent = selected.title;
      if (summary) summary.textContent = selected.summary;
      if (note) note.textContent = selected.note;
    }

    tabsRoot.addEventListener("click", (event) => {
      const btn = event.target.closest(".tab-btn");
      if (!btn) return;
      select(btn.dataset.id);
    });

    select(data.anomalyTabs[0].id);
  }

  function renderModels() {
    const mount = document.querySelector("[data-model-grid]");
    if (!mount || !data.models) return;
    const family = document.querySelector("[data-filter-family]");
    const temporal = document.querySelector("[data-filter-temporal]");
    const criterion = document.querySelector("[data-filter-criterion]");

    function template(model) {
      return `
        <article class="model-card">
          <span class="tag">${model.family}</span>
          <h3>${model.name}</h3>
          <p class="muted small">${model.bestFor}</p>
          <div class="meta-row">
            <span class="badge">inter-correlation: ${model.interCorrelation}</span>
            <span class="badge">temporal: ${model.temporal}</span>
            <span class="badge">criterion: ${model.criterion}</span>
          </div>
          <div class="grid-2 model-card-split">
            <div>
              <strong>장점</strong>
              <ul>${model.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div>
              <strong>주의점</strong>
              <ul>${model.cautions.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
          </div>
          ${model.route ? `<div class="method-card-actions"><a class="btn secondary" href="${resolveSitePath(model.route)}">Simulator 열기</a></div>` : ""}
        </article>`;
    }

    function update() {
      const visible = data.models.filter(
        (model) =>
          (!family.value || model.family === family.value) &&
          (!temporal.value || model.temporal === temporal.value) &&
          (!criterion.value || model.criterion === criterion.value),
      );
      mount.innerHTML =
        visible.map(template).join("") ||
        '<div class="result-box">조건에 맞는 모델이 없습니다. 필터를 조금 완화해 보세요.</div>';
    }

    [family, temporal, criterion].forEach(
      (node) => node && node.addEventListener("change", update),
    );
    update();
  }

  function renderDatasets() {
    const mount = document.querySelector("[data-dataset-grid]");
    if (!mount || !data.datasets) return;
    mount.innerHTML = data.datasets
      .map(
        (dataset) => `
      <article class="model-card">
        <span class="tag">${dataset.domain}</span>
        <h3>${dataset.name}</h3>
        <p class="muted small">length ${dataset.length} · dimension ${dataset.dimension}</p>
        <ul>
          <li><strong>anomaly setup:</strong> ${dataset.anomalies}</li>
          <li><strong>study takeaway:</strong> ${dataset.takeaway}</li>
        </ul>
      </article>
    `,
      )
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

      if (mode === "realtime")
        picks.push("GRU/CNN 기반 reconstruction workflow를 우선 검토");
      if (mode === "warning")
        picks.push(
          "LSTM/HTM 계열의 predictive setup과 threshold tuning에 더 많은 비중",
        );
      if (update === "window")
        picks.push(
          "sliding window 기반 2D matrix / ConvLSTM / Transformer 실험",
        );
      if (update === "incremental")
        picks.push("online update와 adaptive threshold를 함께 고려");
      if (dimension === "high")
        picks.push(
          "graph structure learning 또는 selective dimensional reduction 검토",
        );
      if (relation === "strong")
        picks.push(
          "GDN/GTA처럼 attribute relation을 explicit하게 학습하는 모델 우선",
        );
      if (labels === "scarce")
        picks.push("semi-supervised/unsupervised setup 전제 유지");

      const caution =
        dimension === "high"
          ? "WADI 분석처럼 high dimension에서는 계산량이 급격히 늘어납니다. “더 큰 모델”보다 “relation-aware modeling”이 더 중요할 수 있습니다."
          : "중간 규모 dimension이라면 temporal modeling 품질과 threshold strategy가 더 큰 차이를 만들 수 있습니다.";

      out.innerHTML = `
        <h3>추천 워크플로</h3>
        <ul>${picks.map((item) => `<li>${item}</li>`).join("")}</ul>
        <p class="callout">${caution}</p>
      `;
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
    if (!mount || !data.quiz) return;
    let index = 0;
    let locked = false;

    function unlockAchievement(nextState) {
      const achievements = new Set(nextState.achievements || []);
      if (nextState.score >= 30) achievements.add("개념 수집가");
      if (nextState.streak >= 3) achievements.add("연속 추론가");
      if (nextState.visited.length >= ((data.routeOrder || []).length || 1))
        achievements.add("길찾기 완주자");
      nextState.achievements = Array.from(achievements);
      return nextState;
    }

    function render() {
      const item = data.quiz[index];
      mount.innerHTML = `
        <div class="quiz-shell panel hero-card">
          <div class="badge">문제 ${index + 1} / ${data.quiz.length}</div>
          <h3>${item.question}</h3>
          <div class="choice-grid">
            ${item.choices.map((choice, choiceIndex) => `<button class="choice-btn" data-choice="${choiceIndex}">${choice}</button>`).join("")}
          </div>
          <div class="muted" data-quiz-feedback>정답을 선택하면 explanation이 나옵니다.</div>
        </div>
      `;
      locked = false;
    }

    mount.onclick = (event) => {
      const btn = event.target.closest("[data-choice]");
      if (!btn || locked) return;
      locked = true;
      const item = data.quiz[index];
      const chosen = Number(btn.dataset.choice);
      const feedback = mount.querySelector("[data-quiz-feedback]");
      mount.querySelectorAll("[data-choice]").forEach((node) => {
        const value = Number(node.dataset.choice);
        if (value === item.answer) node.classList.add("correct");
        if (value === chosen && value !== item.answer)
          node.classList.add("wrong");
      });

      const nextState = loadState();
      nextState.answered += 1;
      if (chosen === item.answer) {
        nextState.score += 10;
        nextState.correct += 1;
        nextState.streak += 1;
        nextState.bestStreak = Math.max(
          nextState.bestStreak || 0,
          nextState.streak,
        );
        feedback.textContent = `정답! ${item.explanation}`;
      } else {
        nextState.streak = 0;
        feedback.textContent = `오답. ${item.explanation}`;
      }
      saveState(unlockAchievement(nextState));

      setTimeout(() => {
        index = (index + 1) % data.quiz.length;
        render();
      }, 2200);
    };

    render();
  }

  function bindFlashcards() {
    const mount = document.querySelector("[data-flashcards]");
    if (!mount || !data.flashcards) return;
    mount.innerHTML = data.flashcards
      .map(
        (card, index) => `
      <article class="flash-card" data-flashcard="${index}">
        <div class="badge">Flashcard</div>
        <h3>${card.front}</h3>
        <p class="muted">클릭해서 answer 보기</p>
        <div class="small" data-flash-answer hidden>${card.back}</div>
      </article>
    `,
      )
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
    const selector =
      ".figure-card img, .figure-thumb img, .atlas-card img, .figure-inline img, [data-anomaly-image]";
    const overlay = document.createElement("div");
    overlay.className = "image-zoom-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="image-zoom-stage">
        <img alt="" />
        <div class="image-zoom-meta">Mouseup으로 3× 확대 · 바깥 클릭 / 마우스 이탈 / Esc 로 닫기</div>
      </div>
    `;
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
      zoomedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
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
        zoomedImage.style.maxWidth = `${maxWidth}px`;
        zoomedImage.style.maxHeight = `${maxHeight}px`;
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
      if (event.target === zoomedImage && !dragMoved && zoomScale <= 1.02) {
        closeZoom();
      }
    });

    zoomedImage.addEventListener(
      "wheel",
      (event) => {
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
      },
      { passive: false },
    );

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
      if (event?.pointerId !== undefined) {
        try {
          zoomedImage.releasePointerCapture(event.pointerId);
        } catch (_error) {
          // ignore
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

  markVisited();
  setupNav();
  bindTabs();
  renderModels();
  renderDatasets();
  bindGuidelineBuilder();
  bindProgressActions();
  bindQuiz();
  bindFlashcards();
  bindImageZoom();
  renderProgress(loadState());
})();
