(function () {
  const study = window.STUDY_DATA || {};
  const lab = study.methodLab;
  const root = document.querySelector("[data-method-lab-root]");
  const slug = document.body.dataset.methodLab;
  if (!lab || !root || !slug) return;

  const method = (lab.methods || []).find((item) => item.slug === slug);
  if (!method) return;

  const controls = {
    windowSize: method.controls?.recommendedWindow || 36,
    relationStrength: 0.62,
    memoryHorizon: 0.58,
    anomalyAmplitude: method.controls?.anomalySweetSpot || 0.56,
    noiseLevel: 0.28,
    threshold: method.controls?.recommendedThreshold || 0.5,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pct = (value) => `${Math.round(value * 100)}%`;

  function metricScores() {
    const relationFit = clamp(0.35 + method.focus.relation * controls.relationStrength + (1 - Math.abs(controls.windowSize - (method.controls?.recommendedWindow || 36)) / 80) * 0.2, 0, 1);
    const temporalFit = clamp(0.22 + method.focus.temporal * controls.memoryHorizon + Math.min(controls.windowSize / 80, 1) * 0.16, 0, 1);
    const criterionFit = clamp(0.24 + method.focus.criterion * controls.anomalyAmplitude + (1 - controls.noiseLevel * 0.38), 0, 1);
    const thresholdFit = clamp(1 - Math.abs(controls.threshold - (method.controls?.recommendedThreshold || 0.5)) * 1.65, 0, 1);
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
      { label: method.scoreLabels?.[0] || "relation", value: scores.relationFit },
      { label: method.scoreLabels?.[1] || "temporal", value: scores.temporalFit },
      { label: method.scoreLabels?.[2] || "criterion", value: scores.explainability },
      { label: method.scoreLabels?.[3] || "latency", value: scores.latency },
    ].map((item) => `
      <div class="method-lab-bar">
        <div class="method-lab-control-top"><strong>${item.label}</strong><span class="badge">${pct(item.value)}</span></div>
        <div class="method-lab-bar-track"><div class="method-lab-bar-fill" style="width:${pct(item.value)}"></div></div>
      </div>`).join("");
  }

  function makeSparkline(scores) {
    const anomalyIndex = Math.max(2, Math.min(15, Math.round(controls.windowSize / 5)));
    return Array.from({ length: 18 }, (_, index) => {
      const wave = 0.28 + Math.abs(Math.sin((index + 1) * 0.55)) * 0.34 + controls.noiseLevel * 0.18;
      const anomalyBoost = index >= anomalyIndex && index <= anomalyIndex + 2 ? controls.anomalyAmplitude * (0.45 + scores.detection * 0.45) : 0;
      const height = clamp(wave + anomalyBoost + scores.temporalFit * 0.12, 0.12, 1);
      return `<div class="method-lab-spark ${anomalyBoost ? "is-anomaly" : ""}" style="height:${Math.round(height * 100)}%"><span>${index + 1}</span></div>`;
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
    ].map(([key, label, value, min, max, step, hint]) => `
      <label class="method-lab-control">
        <div class="method-lab-control-top"><span>${label}</span><strong>${key === "windowSize" ? value : pct(value)}</strong></div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-method-control="${key}">
        <div class="method-lab-control-hint small">${hint}</div>
      </label>`).join("");
  }

  function render() {
    const scores = metricScores();
    const detectionStatus = statusFor(scores.detection);
    const robustnessStatus = statusFor(scores.robustness);
    root.innerHTML = `
      <section class="method-lab-shell">
        <article class="panel hero-card method-lab-header">
          <div class="eyebrow">${lab.intro?.eyebrow || "Method Lab"} · ${method.family}</div>
          <h1>${method.name} simulator</h1>
          <p class="lead">${method.summary}</p>
          <div class="meta-row">
            <span class="badge">핵심 질문: ${method.coreQuestion}</span>
            <span class="badge">추천 window ${method.controls?.recommendedWindow}</span>
            <span class="badge">추천 threshold ${Math.round((method.controls?.recommendedThreshold || 0.5) * 100)}%</span>
          </div>
          <p class="method-lab-copy">${method.intuition}</p>
          <div class="result-box"><strong>Play tip</strong><div class="stack-top-sm muted">${method.playgroundPrompt}</div></div>
        </article>

        <div class="method-lab-subgrid">
          <article class="card method-lab-stage">
            <div class="section-head section-head-compact"><div><div class="eyebrow">Toy controls</div><h2 class="section-title section-title-compact">설정을 바꾸면 score가 바로 반응합니다</h2></div></div>
            <div class="method-lab-controls">${controlMarkup()}</div>
          </article>

          <article class="card method-lab-stage">
            <div class="section-head section-head-compact"><div><div class="eyebrow">Signal preview</div><h2 class="section-title section-title-compact">window 속 anomaly segment</h2></div><span class="badge">toy sequence</span></div>
            <div class="method-lab-sparkline">${makeSparkline(scores)}</div>
            <p class="method-lab-caption small">노란 bar는 anomaly segment입니다. relation / memory / threshold를 바꾸며 얼마나 score가 달라지는지 보세요.</p>
          </article>
        </div>

        <div class="method-lab-stats">
          <article class="method-lab-stat"><strong>Detection score</strong><span class="method-lab-stat-value">${Math.round(scores.detection * 100)}</span><div class="method-lab-status ${detectionStatus.cls}">${detectionStatus.label}</div></article>
          <article class="method-lab-stat"><strong>Robustness</strong><span class="method-lab-stat-value">${Math.round(scores.robustness * 100)}</span><div class="method-lab-status ${robustnessStatus.cls}">${robustnessStatus.label}</div></article>
          <article class="method-lab-stat"><strong>Explainability</strong><span class="method-lab-stat-value">${Math.round(scores.explainability * 100)}</span><div class="small muted">발표/설명 친화도</div></article>
          <article class="method-lab-stat"><strong>Latency fit</strong><span class="method-lab-stat-value">${Math.round(scores.latency * 100)}</span><div class="small muted">실시간 대응 여유</div></article>
        </div>

        <article class="card">
          <div class="section-head section-head-compact"><div><div class="eyebrow">Scoreboard</div><h2 class="section-title section-title-compact">왜 점수가 이렇게 나왔는가</h2></div></div>
          <div class="method-lab-bars">${makeBars(scores)}</div>
          <p class="result-box stack-top-md"><strong>해석</strong><span class="stack-top-sm muted" style="display:block;">${insightCopy(scores)}</span></p>
        </article>

        <div class="method-lab-lesson-grid">
          <article class="method-lab-lesson"><strong>Core logic</strong><ol class="info-list">${method.logic.map((item) => `<li>${item}</li>`).join("")}</ol></article>
          <article class="method-lab-lesson"><strong>잘 맞는 상황</strong><ul class="info-list">${method.useCases.map((item) => `<li>${item}</li>`).join("")}</ul></article>
          <article class="method-lab-lesson"><strong>주의할 점</strong><ul class="info-list">${method.cautions.map((item) => `<li>${item}</li>`).join("")}</ul></article>
        </div>

        <div class="method-lab-mini-grid">
          <article class="method-lab-mini"><strong>강점</strong><ul class="info-list">${method.strengths.map((item) => `<li>${item}</li>`).join("")}</ul></article>
          <article class="method-lab-mini"><strong>한 줄 메모</strong><p class="method-lab-copy">${lab.intro?.summary || ""}</p></article>
        </div>
      </section>`;

    root.querySelectorAll("[data-method-control]").forEach((input) => {
      input.addEventListener("input", (event) => {
        controls[event.target.dataset.methodControl] = Number(event.target.value);
        render();
      });
    });
  }

  render();
})();
