(function () {
  const study = window.STUDY_DATA || {};
  const lab = study.methodLab;
  const root = document.querySelector('[data-method-lab-root]');
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

  let activeDetailView = 'scatter';
  let dockDepth = 'medium';
  let hoveredPoint = null;
  let isDraggingCurrent = false;
  let scrollChromeBound = false;
  let hasInteracted = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const pct = (value) => `${Math.round(value * 100)}%`;
  const windowNorm = () => clamp((controls.windowSize - 12) / 68, 0, 1);
  const slugSeed = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const vizConfig = {
    dagmm: { title: 'Latent cluster canvas', xLabel: 'Latent density gap', yLabel: 'Reconstruction mismatch', scatterSummary: '정상 cluster 바깥으로 window가 튀는 순간을 2D latent 관점으로 읽습니다.', normalLabel: 'dense normal manifold', anomalyLabel: 'low-density outliers', zoneLabel: 'anomaly density zone', xKey: 'densityGap', yKey: 'reconstructionGap', xWeight: 0.58, yWeight: 0.42, normalGeometry: 'cluster', anomalyGeometry: 'spray', fieldMode: 'linear', trailMode: 'direct' },
    mscred: { title: 'Relation map canvas', xLabel: 'Correlation-map drift', yLabel: 'Temporal coherence loss', scatterSummary: 'signature matrix가 얼마나 접히는지와 그 변화가 시간축에서 누적되는지를 함께 봅니다.', normalLabel: 'stable relation maps', anomalyLabel: 'broken correlation frames', zoneLabel: 'relation collapse zone', xKey: 'relationDrift', yKey: 'temporalMismatch', xWeight: 0.54, yWeight: 0.46, normalGeometry: 'diagonal', anomalyGeometry: 'split', fieldMode: 'ridge', trailMode: 'arc' },
    omnianomaly: { title: 'Uncertainty canvas', xLabel: 'Latent uncertainty', yLabel: 'Reconstruction surprise', scatterSummary: 'variance spike와 reconstruction gap이 동시에 커질 때 확률적 anomaly 해석이 또렷해집니다.', normalLabel: 'stable posterior windows', anomalyLabel: 'high-variance alarms', zoneLabel: 'uncertainty-alert zone', xKey: 'uncertainty', yKey: 'reconstructionGap', xWeight: 0.52, yWeight: 0.48, normalGeometry: 'teardrop', anomalyGeometry: 'vertical-burst', fieldMode: 'basin', trailMode: 'loop' },
    usad: { title: 'Decoder disagreement canvas', xLabel: 'Decoder-A gap', yLabel: 'Decoder-B disagreement', scatterSummary: '두 decoder가 같은 window를 얼마나 다르게 해석하는지 2D로 바로 비교합니다.', normalLabel: 'agreed reconstructions', anomalyLabel: 'decoder disagreement', zoneLabel: 'disagreement zone', xKey: 'decoderGap', yKey: 'reconstructionGap', xWeight: 0.5, yWeight: 0.5, normalGeometry: 'paired', anomalyGeometry: 'cross', fieldMode: 'cross', trailMode: 'stair' },
    'mad-gan': { title: 'Realism canvas', xLabel: 'Discriminator realism gap', yLabel: 'Sequence drift', scatterSummary: 'reconstruction 오차뿐 아니라 “정상처럼 보이는가”라는 realism 판단을 같이 노출합니다.', normalLabel: 'credible normal windows', anomalyLabel: 'unnatural sequences', zoneLabel: 'realism break zone', xKey: 'realismGap', yKey: 'temporalMismatch', xWeight: 0.56, yWeight: 0.44, normalGeometry: 'wave', anomalyGeometry: 'crescent', fieldMode: 'waves', trailMode: 'arc' },
    thoc: { title: 'Boundary canvas', xLabel: 'Hierarchical memory strain', yLabel: 'One-class boundary distance', scatterSummary: '장기 패턴 붕괴가 정상 hypersphere 밖으로 밀려나는 장면을 보여 줍니다.', normalLabel: 'compressed normal hierarchy', anomalyLabel: 'boundary escapes', zoneLabel: 'one-class escape zone', xKey: 'memoryStrain', yKey: 'boundaryDistance', xWeight: 0.48, yWeight: 0.52, normalGeometry: 'nested', anomalyGeometry: 'escape', fieldMode: 'radial', trailMode: 'stair' },
    gta: { title: 'Graph-attention canvas', xLabel: 'Graph attention drift', yLabel: 'Long-range temporal mismatch', scatterSummary: '멀리 떨어진 시점과 현재 graph relation을 같이 묶을 때 anomaly 분리가 커지는 모습을 보여 줍니다.', normalLabel: 'aligned graph-time windows', anomalyLabel: 'relation + memory drift', zoneLabel: 'joint-attention alert zone', xKey: 'attentionDrift', yKey: 'temporalMismatch', xWeight: 0.51, yWeight: 0.49, normalGeometry: 'bridge', anomalyGeometry: 'fan', fieldMode: 'saddle', trailMode: 'loop' },
    gdn: { title: 'Graph deviation canvas', xLabel: 'Edge deviation', yLabel: 'Node surprise', scatterSummary: '어느 edge/node가 정상 graph에서 벗어나는지 root-cause 친화적으로 읽을 수 있습니다.', normalLabel: 'stable graph neighborhoods', anomalyLabel: 'deviating nodes/edges', zoneLabel: 'graph deviation zone', xKey: 'graphDeviation', yKey: 'nodeSurprise', xWeight: 0.6, yWeight: 0.4, normalGeometry: 'graph', anomalyGeometry: 'spike', fieldMode: 'graph', trailMode: 'stair' },
    'lstm-vae': { title: 'Sequence latent canvas', xLabel: 'Latent prior deviation', yLabel: 'Sequence reconstruction gap', scatterSummary: '확률적 latent trajectory와 sequence reconstruction이 함께 흔들릴 때 점이 경계 밖으로 이동합니다.', normalLabel: 'prior-consistent windows', anomalyLabel: 'unlikely trajectories', zoneLabel: 'likelihood alert zone', xKey: 'priorDeviation', yKey: 'reconstructionGap', xWeight: 0.47, yWeight: 0.53, normalGeometry: 'arc', anomalyGeometry: 'spray', fieldMode: 'likelihood', trailMode: 'arc' },
  };
  const config = vizConfig[slug] || vizConfig.dagmm;

  function metricScores() {
    const relationFit = clamp(0.35 + method.focus.relation * controls.relationStrength + (1 - Math.abs(controls.windowSize - (method.controls?.recommendedWindow || 36)) / 80) * 0.2, 0, 1);
    const temporalFit = clamp(0.22 + method.focus.temporal * controls.memoryHorizon + Math.min(controls.windowSize / 80, 1) * 0.16, 0, 1);
    const criterionFit = clamp(0.24 + method.focus.criterion * controls.anomalyAmplitude + (1 - controls.noiseLevel * 0.38), 0, 1);
    const thresholdFit = clamp(1 - Math.abs(controls.threshold - (method.controls?.recommendedThreshold || 0.5)) * 1.65, 0, 1);
    const detection = clamp(relationFit * 0.28 + temporalFit * 0.28 + criterionFit * 0.3 + thresholdFit * 0.14, 0, 1);
    const explainability = clamp(method.focus.explainability + thresholdFit * 0.14 - controls.noiseLevel * 0.08, 0, 1);
    return { relationFit, temporalFit, criterionFit, thresholdFit, detection, explainability };
  }

  function controlMarkup() {
    return [
      ['windowSize', 'Window size', controls.windowSize, 12, 80, 1, '짧으면 즉각 반응, 길면 더 긴 context 확인'],
      ['relationStrength', 'Relation strength', controls.relationStrength, 0, 1, 0.01, '센서 간 coupling이 얼마나 강한지'],
      ['memoryHorizon', 'Memory horizon', controls.memoryHorizon, 0, 1, 0.01, '긴 temporal context가 얼마나 필요한지'],
      ['anomalyAmplitude', 'Anomaly amplitude', controls.anomalyAmplitude, 0, 1, 0.01, '이상 신호가 얼마나 크게 튀는지'],
      ['noiseLevel', 'Noise level', controls.noiseLevel, 0, 1, 0.01, '정상 변동성/측정 noise'],
      ['threshold', 'Threshold', controls.threshold, 0, 1, 0.01, 'alarm 기준선 calibration'],
    ].map(([key, label, value, min, max, step, hint]) => `
      <label class="method-lab-control">
        <div class="method-lab-control-top"><span>${label}</span><strong>${key === 'windowSize' ? value : pct(value)}</strong></div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-method-control="${key}">
        <div class="method-lab-control-hint small">${hint}</div>
      </label>`).join('');
  }

  function seeded(index, salt = 0) {
    const raw = Math.sin((index + 1) * 12.9898 + slugSeed * 0.17 + salt * 7.23) * 43758.5453;
    return raw - Math.floor(raw);
  }

  function deriveSignals(scores) {
    return {
      relationDrift: clamp(0.12 + controls.relationStrength * 0.56 + controls.anomalyAmplitude * 0.16 - controls.noiseLevel * 0.1 + method.focus.relation * 0.08),
      temporalMismatch: clamp(0.14 + controls.memoryHorizon * 0.52 + windowNorm() * 0.12 + controls.anomalyAmplitude * 0.12 - controls.noiseLevel * 0.08 + method.focus.temporal * 0.06),
      densityGap: clamp(0.12 + controls.anomalyAmplitude * 0.56 + (1 - controls.relationStrength) * 0.18 + controls.noiseLevel * 0.1 + (1 - method.focus.relation) * 0.06),
      reconstructionGap: clamp(0.15 + controls.anomalyAmplitude * 0.42 + controls.noiseLevel * 0.16 + (1 - scores.thresholdFit) * 0.18 + (1 - method.focus.temporal) * 0.06),
      uncertainty: clamp(0.1 + controls.noiseLevel * 0.54 + controls.memoryHorizon * 0.18 + (1 - scores.thresholdFit) * 0.12 + (1 - method.focus.threshold) * 0.06),
      decoderGap: clamp(0.12 + controls.anomalyAmplitude * 0.34 + controls.noiseLevel * 0.16 + (1 - controls.memoryHorizon) * 0.1 + scores.criterionFit * 0.14),
      realismGap: clamp(0.12 + controls.memoryHorizon * 0.24 + controls.anomalyAmplitude * 0.22 + controls.noiseLevel * 0.2 + (1 - method.focus.baselineLatency) * 0.08),
      memoryStrain: clamp(0.12 + controls.memoryHorizon * 0.5 + windowNorm() * 0.14 + controls.noiseLevel * 0.08 + method.focus.temporal * 0.08),
      boundaryDistance: clamp(0.14 + controls.memoryHorizon * 0.36 + controls.anomalyAmplitude * 0.18 + (1 - scores.thresholdFit) * 0.2 + controls.noiseLevel * 0.08),
      attentionDrift: clamp(0.12 + controls.relationStrength * 0.34 + controls.memoryHorizon * 0.26 + controls.anomalyAmplitude * 0.16 + (1 - method.focus.baselineLatency) * 0.08),
      graphDeviation: clamp(0.12 + controls.relationStrength * 0.58 + controls.anomalyAmplitude * 0.16 + controls.noiseLevel * 0.08 + method.focus.relation * 0.08),
      nodeSurprise: clamp(0.14 + controls.noiseLevel * 0.2 + controls.anomalyAmplitude * 0.26 + (1 - controls.threshold) * 0.18 + (1 - method.focus.temporal) * 0.06),
      priorDeviation: clamp(0.12 + controls.memoryHorizon * 0.32 + controls.noiseLevel * 0.2 + controls.anomalyAmplitude * 0.18 + (1 - scores.thresholdFit) * 0.16),
    };
  }

  function currentPoint(signals) {
    return { x: clamp(signals[config.xKey]), y: clamp(signals[config.yKey]) };
  }

  function stableCenter() {
    return {
      x: clamp(0.22 + method.focus.relation * 0.1 + (1 - controls.anomalyAmplitude) * 0.06, 0.16, 0.42),
      y: clamp(0.22 + method.focus.temporal * 0.1 + (1 - controls.noiseLevel) * 0.04, 0.16, 0.42),
    };
  }

  function anomalyCenter(signals) {
    return {
      x: clamp(0.66 + signals[config.xKey] * 0.12, 0.62, 0.88),
      y: clamp(0.64 + signals[config.yKey] * 0.14, 0.6, 0.9),
    };
  }

  function decisionBoundary() {
    return clamp(0.72 - controls.threshold * 0.24 - method.focus.criterion * 0.06 + controls.noiseLevel * 0.05, 0.34, 0.78);
  }

  function shapePoint(center, spreadX, spreadY, index, salt, mode) {
    const a = seeded(index, salt);
    const b = seeded(index, salt + 1);
    const c = seeded(index, salt + 2);
    const angle = a * Math.PI * 2;
    const radial = 0.35 + b * 0.75;
    const t = index / Math.max(1, (mode === 'wave' || mode === 'bridge') ? 41 : 15);
    switch (mode) {
      case 'diagonal': return { x: clamp(center.x - spreadX * 0.5 + t * spreadX + (b - 0.5) * spreadX * 0.22), y: clamp(center.y - spreadY * 0.45 + t * spreadY + (c - 0.5) * spreadY * 0.18) };
      case 'teardrop': return { x: clamp(center.x + Math.cos(angle) * spreadX * radial * 0.55), y: clamp(center.y + Math.sin(angle) * spreadY * radial * (0.35 + a)) };
      case 'paired': return { x: clamp(center.x + (index % 2 === 0 ? -1 : 1) * spreadX * 0.24 + (b - 0.5) * spreadX * 0.14), y: clamp(center.y - spreadY * 0.45 + t * spreadY * 0.9 + (c - 0.5) * spreadY * 0.12) };
      case 'wave': return { x: clamp(center.x - spreadX * 0.52 + t * spreadX), y: clamp(center.y + Math.sin(t * Math.PI * 2.1 + angle * 0.2) * spreadY * 0.32 + (b - 0.5) * spreadY * 0.18) };
      case 'nested': return { x: clamp(center.x + Math.cos(angle) * spreadX * (0.2 + (index % 3) * 0.18)), y: clamp(center.y + Math.sin(angle) * spreadY * (0.2 + (index % 3) * 0.18)) };
      case 'bridge': return { x: clamp(center.x - spreadX * 0.48 + t * spreadX), y: clamp(center.y + Math.sin(t * Math.PI) * spreadY * 0.42 + (b - 0.5) * spreadY * 0.1) };
      case 'graph': return { x: clamp(center.x + (index % 4 - 1.5) * spreadX * 0.18 + (b - 0.5) * spreadX * 0.08), y: clamp(center.y + (Math.floor(index / 4) % 4 - 1.5) * spreadY * 0.18 + (c - 0.5) * spreadY * 0.08) };
      case 'arc': return { x: clamp(center.x + Math.cos(Math.PI * (0.7 + t * 0.8)) * spreadX * 0.58), y: clamp(center.y + Math.sin(Math.PI * (0.7 + t * 0.8)) * spreadY * 0.42 + (b - 0.5) * spreadY * 0.12) };
      case 'spray': return { x: clamp(center.x + Math.cos(angle) * spreadX * radial * 0.8 + Math.max(0, b - 0.45) * spreadX * 0.3), y: clamp(center.y + Math.sin(angle) * spreadY * radial * 0.75 + Math.max(0, c - 0.45) * spreadY * 0.2) };
      case 'split': return { x: clamp(center.x + (index % 2 === 0 ? -1 : 1) * spreadX * 0.26 + (b - 0.5) * spreadX * 0.16), y: clamp(center.y + (Math.floor(index / 2) / 8 - 0.45) * spreadY + (c - 0.5) * spreadY * 0.18) };
      case 'vertical-burst': return { x: clamp(center.x + (b - 0.5) * spreadX * 0.3), y: clamp(center.y - spreadY * 0.4 + t * spreadY * 1.15 + (c - 0.5) * spreadY * 0.12) };
      case 'cross': return index % 2 === 0 ? { x: clamp(center.x - spreadX * 0.45 + t * spreadX * 0.9), y: clamp(center.y + (b - 0.5) * spreadY * 0.18) } : { x: clamp(center.x + (b - 0.5) * spreadX * 0.18), y: clamp(center.y - spreadY * 0.45 + t * spreadY * 0.9) };
      case 'crescent': return { x: clamp(center.x + Math.cos(Math.PI * (0.2 + t * 0.9)) * spreadX * 0.55 + spreadX * 0.08), y: clamp(center.y + Math.sin(Math.PI * (0.2 + t * 0.9)) * spreadY * 0.52) };
      case 'escape': return { x: clamp(center.x + Math.cos(angle) * spreadX * 0.3 + t * spreadX * 0.38), y: clamp(center.y + Math.sin(angle) * spreadY * 0.25 + t * spreadY * 0.42) };
      case 'fan': return { x: clamp(center.x + t * spreadX * 0.65 + (b - 0.5) * spreadX * 0.1), y: clamp(center.y - spreadY * 0.45 + (index % 5) * spreadY * 0.22 + (c - 0.5) * spreadY * 0.1) };
      case 'spike': return { x: clamp(center.x + (b - 0.5) * spreadX * 0.14), y: clamp(center.y - spreadY * 0.35 + t * spreadY * 1.2) };
      default: return { x: clamp(center.x + (a - 0.5) * spreadX), y: clamp(center.y + (b - 0.5) * spreadY) };
    }
  }

  function scoreSurface(x, y) {
    const linear = x * config.xWeight + y * config.yWeight;
    const centeredX = x - 0.5;
    const centeredY = y - 0.5;
    let shaped = linear;
    switch (config.fieldMode) {
      case 'ridge': shaped += 0.16 * Math.exp(-Math.abs(y - (0.2 + x * 0.72)) * 8); break;
      case 'basin': shaped += 0.18 * Math.sqrt((x - 0.62) ** 2 + (y - 0.66) ** 2); break;
      case 'cross': shaped += 0.18 * Math.max(1 - Math.abs(x - 0.55) * 3.2, 1 - Math.abs(y - 0.55) * 3.2); break;
      case 'waves': shaped += 0.12 * (Math.sin(x * 7 + controls.windowSize * 0.03) + Math.cos(y * 6 + controls.noiseLevel * 2)); break;
      case 'radial': shaped += 0.18 * Math.sqrt((x - 0.24) ** 2 + (y - 0.24) ** 2); break;
      case 'saddle': shaped += 0.22 * (centeredX * centeredY * 2); break;
      case 'graph': shaped += 0.15 * (Math.max(0, x - 0.48) * 1.2 + Math.abs(x - y) * 0.55); break;
      case 'likelihood': shaped += 0.16 * ((x - 0.35) ** 2 + (y - 0.32) ** 2); break;
      default: break;
    }
    return clamp(0.5 + (shaped - decisionBoundary()) * 1.7);
  }

  function cloud(signals) {
    const stable = stableCenter();
    const anomaly = anomalyCenter(signals);
    const points = [];
    for (let index = 0; index < 42; index += 1) points.push({ type: 'normal', ...shapePoint(stable, 0.28, 0.26, index, 1, config.normalGeometry) });
    for (let index = 0; index < 16; index += 1) points.push({ type: 'anomaly', ...shapePoint(anomaly, 0.22, 0.24, index, 5, config.anomalyGeometry) });
    return points;
  }

  function trajectory(signals) {
    const start = stableCenter();
    const finish = currentPoint(signals);
    return Array.from({ length: 12 }, (_, index) => {
      const t = index / 11;
      const eased = t * t * (3 - 2 * t);
      const base = { x: start.x * (1 - eased) + finish.x * eased, y: start.y * (1 - eased) + finish.y * eased };
      switch (config.trailMode) {
        case 'arc': return { x: clamp(base.x + (seeded(index, 7) - 0.5) * 0.02), y: clamp(base.y + Math.sin(t * Math.PI) * 0.12 + (seeded(index, 8) - 0.5) * 0.02) };
        case 'loop': return { x: clamp(base.x + Math.sin(t * Math.PI * 2) * 0.05 * (1 - t)), y: clamp(base.y + Math.cos(t * Math.PI * 2) * 0.06 * (1 - t)) };
        case 'stair': return { x: clamp(start.x + (finish.x - start.x) * eased + (index % 3 === 0 ? 0.03 : 0)), y: clamp(start.y + (finish.y - start.y) * Math.floor(t * 5) / 5 + (seeded(index, 8) - 0.5) * 0.015) };
        default: return { x: clamp(base.x + (seeded(index, 7) - 0.5) * 0.03), y: clamp(base.y + (seeded(index, 8) - 0.5) * 0.04) };
      }
    });
  }

  function visualInsights(scores, signals) {
    const current = currentPoint(signals);
    const alert = scoreSurface(current.x, current.y);
    return [
      `${config.xLabel} ${pct(current.x)} · ${config.yLabel} ${pct(current.y)}로 현재 window가 위치합니다.`,
      alert >= 0.7 ? `현재 window는 ${config.zoneLabel} 쪽에 가깝습니다.` : '현재 window는 아직 정상 군집 근처에 남아 있습니다.',
      controls.threshold >= method.controls.recommendedThreshold ? 'threshold가 보수적으로 잡혀 경계선이 위로 올라갔습니다.' : 'threshold가 낮아져 더 공격적으로 anomaly를 건드립니다.',
    ];
  }

  function beginnerDockSections(scores, signals) {
    const current = currentPoint(signals);
    const currentAlert = scoreSurface(current.x, current.y);
    const currentReading = currentAlert >= 0.7
      ? '이상 쪽으로 읽히기 쉬운 위치'
      : currentAlert >= 0.5
        ? '정상과 이상의 경계에 가까운 위치'
        : '아직 정상 쪽으로 읽히기 쉬운 위치';
    const technicalTranslations = [
      `${config.xLabel} = 가로 방향에서 평소 패턴과 얼마나 달라졌는지`,
      `${config.yLabel} = 세로 방향에서 또 다른 기준으로 얼마나 어색해졌는지`,
      '지금 보고 있는 짧은 시간 구간 = 화면의 흰 점',
      '정상처럼 보이는 예시들 = 파란 점들',
      '이상처럼 보이는 예시들 = 노란 점들',
    ];
    const scenarioMap = {
      dagmm: {
        setting: '여러 센서 값을 압축해서 “평소 군집” 안에 남는지 보는 상황',
        normal: '흰 점이 조밀한 파란 무리 근처에 남아 있으면, 현재 구간은 아직 평소 군집 안쪽 설명이 가능합니다.',
        drift: '흰 점이 군집 바깥으로 조금씩 밀리면, 평소와는 다르지만 아직 애매한 경계 상황으로 읽습니다.',
        anomaly: '흰 점이 멀리 튀면 “정상 군집으로 설명하기 어려운 구간”이라고 읽습니다.',
      },
      mscred: {
        setting: '센서들 사이 관계 지도가 평소처럼 유지되는지 보는 상황',
        normal: '흰 점이 파란 무리 쪽이면 센서 관계 지도가 아직 평소와 비슷합니다.',
        drift: '흰 점이 경계로 가면 센서 관계가 조금씩 접히거나 어긋나는 중이라고 볼 수 있습니다.',
        anomaly: '흰 점이 노란 무리로 가면 관계 지도가 눈에 띄게 깨졌다고 읽습니다.',
      },
      omnianomaly: {
        setting: '정상인지, 아니면 불확실성이 갑자기 커진 것인지 함께 보는 상황',
        normal: '흰 점이 파란 무리 안쪽이면 현재 구간이 아직 정상 쪽으로 설명됩니다.',
        drift: '흰 점이 위쪽이나 바깥쪽으로 밀리면 “설명은 되지만 점점 불확실해진다”는 뜻에 가깝습니다.',
        anomaly: '흰 점이 노란 무리 쪽으로 가면 불확실성과 이상 신호가 함께 커졌다고 읽습니다.',
      },
      usad: {
        setting: '두 decoder가 같은 입력을 비슷하게 복원하는지 보는 상황',
        normal: '흰 점이 파란 무리 근처면 두 decoder가 비슷하게 읽고 있다는 뜻입니다.',
        drift: '흰 점이 경계로 가면 두 decoder의 해석 차이가 커지기 시작한 것입니다.',
        anomaly: '흰 점이 노란 무리로 들어가면 두 decoder가 현재 구간을 다르게 복원하며 이상 징후가 강해집니다.',
      },
      'mad-gan': {
        setting: '현재 sequence가 정말 “정상처럼 자연스러운가”를 보는 상황',
        normal: '흰 점이 파란 무리 쪽이면 지금 구간이 아직 자연스럽고 익숙한 흐름처럼 읽힙니다.',
        drift: '흰 점이 경계 쪽이면 뭔가 어색하지만 아직 완전히 비정상이라고 단정하긴 어려운 상태입니다.',
        anomaly: '흰 점이 노란 무리로 가면 현재 sequence가 정상처럼 보이기 어려워졌다고 읽습니다.',
      },
      thoc: {
        setting: '긴 시간 문맥이 한 번에 무너지는지 보는 상황',
        normal: '흰 점이 파란 무리 근처면 긴 문맥까지 포함해도 아직 정상 범위에 있습니다.',
        drift: '흰 점이 경계로 가면 장기 패턴이 조금씩 흔들리는 중이라고 볼 수 있습니다.',
        anomaly: '흰 점이 노란 무리로 가면 정상 경계 바깥으로 밀려난 긴 패턴 붕괴라고 읽습니다.',
      },
      gta: {
        setting: '변수 관계와 긴 시간 연결을 같이 봐야 하는 상황',
        normal: '흰 점이 파란 무리 안쪽이면 관계와 시간 문맥이 아직 함께 맞아떨어집니다.',
        drift: '흰 점이 경계 쪽이면 관계나 시간 연결 중 하나가 조금씩 흔들리는 중입니다.',
        anomaly: '흰 점이 노란 무리로 들어가면 관계와 시간 흐름을 같이 봤을 때도 설명이 어려운 상태입니다.',
      },
      gdn: {
        setting: '어느 변수 관계가 정상 graph에서 벗어나는지 보는 상황',
        normal: '흰 점이 파란 무리 쪽이면 그래프 관계가 아직 정상 범위에 있습니다.',
        drift: '흰 점이 경계로 가면 일부 edge나 node가 평소 관계에서 조금씩 벗어나는 중입니다.',
        anomaly: '흰 점이 노란 무리 쪽이면 그래프 관계 이탈이 분명해졌다고 읽습니다.',
      },
      'lstm-vae': {
        setting: '현재 sequence가 평소 latent trajectory처럼 보이는지 보는 상황',
        normal: '흰 점이 파란 무리 쪽이면 현재 구간이 아직 익숙한 trajectory로 설명됩니다.',
        drift: '흰 점이 경계 쪽이면 trajectory가 평소 패턴에서 서서히 멀어지는 중입니다.',
        anomaly: '흰 점이 노란 무리로 가면 현재 sequence가 평소 latent 흐름으로 설명되기 어려워졌다고 읽습니다.',
      },
    };
    const scenario = scenarioMap[slug] || scenarioMap.dagmm;

    const sections = [
      {
        title: '1. Start here — 이 페이지는 무엇을 하려는가?',
        simpler: `${method.name}은 지금 구간이 평소처럼 보이는지, 아니면 많이 달라졌는지를 눈으로 보여 주려는 모델입니다.`,
        body: `
          <p>이 페이지의 목적은 <strong>${method.name}</strong> 논문을 잘 모르는 사람도 “이 모델이 무엇을 이상하다고 느끼는지”를 먼저 감으로 잡게 만드는 것입니다.</p>
          <p>어렵게 말하지 않고 먼저 쉽게 말하면, <strong>${method.name}</strong>은 <strong>${method.summary}</strong></p>
          <p>즉, 이 모델은 “센서 값의 짧은 묶음 하나가 평소 패턴과 얼마나 다른지”를 읽으려는 모델입니다. 이 페이지에서 가장 중요한 질문은 <strong>${method.coreQuestion}</strong> 입니다.</p>
          <p><strong>처음 보는 사람용 규칙:</strong> 여기서는 논문 구조를 다 이해하려고 하기보다, 먼저 흰 점이 어느 쪽으로 움직이는지만 보시면 됩니다.</p>
        `,
      },
      {
        title: '2. Read the picture first — 화면을 정말 step by step으로 읽기',
        simpler: `흰 점이 파란 점 쪽이면 정상에 가깝고, 노란 점 쪽이면 이상 쪽 해석이 강하다고 읽으면 됩니다.`,
        body: `
          <ol class="info-list verbose-list">
            <li><strong>첫째, 흰 점</strong>을 보세요. 이것이 <strong>지금 보고 있는 짧은 시간 구간</strong>입니다.</li>
            <li><strong>둘째, 파란 점</strong>은 보통 정상처럼 보이는 예시들이고, <strong>노란 점</strong>은 이상 쪽으로 더 밀려난 예시들입니다.</li>
            <li><strong>셋째, 흰 점이 파란 점 무리 근처</strong>에 있으면 “아직 평소와 크게 다르지 않다”로 읽고, <strong>노란 점 무리 쪽</strong>으로 가면 “이상 쪽 설명이 더 강해진다”로 읽으면 됩니다.</li>
            <li><strong>넷째, 지금 현재 흰 점</strong>은 <strong>${config.xLabel} ${pct(current.x)}</strong>, <strong>${config.yLabel} ${pct(current.y)}</strong> 위치에 있고, 이 위치는 <strong>${currentReading}</strong> 입니다.</li>
            <li><strong>다섯째, 결론</strong>은 숫자보다 위치입니다. 흰 점이 어느 무리 쪽에 더 가까운지가 핵심입니다.</li>
          </ol>
        `,
      },
      {
        title: '3. 지금 canvas에서 바로 해볼 실험',
        simpler: `흰 점을 파란 점 쪽, 노란 점 쪽으로 각각 옮겨 보고 차이를 느끼면 됩니다.`,
        body: `
          <p>처음이면 이 section부터 그대로 따라 해보세요. 이론보다 직접 움직여 보는 것이 훨씬 빠르게 이해됩니다.</p>
          <ol class="info-list verbose-list">
            <li><strong>Step 1.</strong> 흰 점을 파란 점 무리 쪽으로 옮겨 보세요. 그러면 “정상처럼 보이는 위치”가 어떤 느낌인지 감이 옵니다.</li>
            <li><strong>Step 2.</strong> 이번에는 흰 점을 노란 점 무리 쪽으로 옮겨 보세요. 그러면 “이상처럼 읽히는 방향”이 어떤 것인지 바로 보입니다.</li>
            <li><strong>Step 3.</strong> <strong>Field</strong> 모드로 바꿔 보세요. 배경색이 진할수록 모델이 더 위험하게 읽는 자리입니다.</li>
            <li><strong>Step 4.</strong> <strong>Trail</strong> 모드로 바꿔 보세요. 흰 점이 갑자기 튄 것인지, 조금씩 밀린 것인지 더 쉽게 읽을 수 있습니다.</li>
          </ol>
          <p><strong>처음 보는 사람용 규칙:</strong> 한 번에 한 가지 동작만 해 보고, 흰 점이 어디로 가는지 확인하세요.</p>
        `,
      },
      {
        title: '4. 축 이름이 어려우면 이렇게 읽으면 됩니다',
        simpler: `가로축과 세로축은 “평소와 얼마나 달라졌는가”를 서로 다른 방식으로 보여 주는 두 개의 기준입니다.`,
        body: `
          <p>축 이름이 낯설어도 괜찮습니다. 전문 용어보다 먼저 <strong>쉬운 질문</strong>으로 바꿔 읽으면 됩니다.</p>
          <ul class="info-list verbose-list">
            ${technicalTranslations.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p>쉽게 말하면 이 canvas는 “한 가지 기준”이 아니라 <strong>두 가지 기준을 동시에 보는 지도</strong>입니다.</p>
          <p><strong>처음 보는 사람용 규칙:</strong> 가로축과 세로축의 정확한 이름보다, “둘 다 커질수록 평소에서 멀어진다”는 느낌을 먼저 잡으면 됩니다.</p>
        `,
      },
      {
        title: '5. What the model is doing — 내부에서는 무슨 순서로 움직이나?',
        simpler: `이 모델은 입력을 읽고, 평소 모습과 비교하고, 차이가 크면 이상 쪽으로 표시합니다.`,
        body: `
          <p>이제 화면을 읽을 수 있으니, 그다음에 내부 흐름을 보겠습니다. 논문 문장을 아주 쉽게 바꾸면 아래 순서입니다.</p>
          <ol class="info-list verbose-list">
            <li><strong>먼저</strong> 입력 데이터를 읽습니다.</li>
            <li><strong>그다음</strong> 정상일 때의 모습과 비교할 단서를 만듭니다.</li>
            <li><strong>이후</strong> 지금 구간이 정상처럼 설명되는지, 아니면 설명이 점점 어색해지는지 봅니다.</li>
            <li><strong>마지막으로</strong> 차이가 충분히 크면 이상 쪽으로 표시합니다.</li>
          </ol>
          <p>논문 기준의 자세한 흐름을 보면 아래와 같습니다.</p>
          <ol class="info-list verbose-list">
            ${method.logic.map((item, index) => `<li><strong>Detail ${index + 1}.</strong> ${item}</li>`).join('')}
          </ol>
          <p><strong>처음 보는 사람용 규칙:</strong> 전부 외우지 않아도 됩니다. “읽고 → 비교하고 → 차이가 크면 이상”만 기억하면 충분합니다.</p>
        `,
      },
      {
        title: '6. Toy controls는 실제로 무엇을 바꾸는가?',
        simpler: `각 control은 모델이 무엇을 더 중요하게 볼지 바꾸는 손잡이입니다. 한 번에 하나만 바꾸는 것이 가장 쉽습니다.`,
        body: `
          <p>아래 control은 단순 장식이 아닙니다. 각각은 모델이 상황을 보는 <strong>관점</strong>을 조금씩 바꿉니다.</p>
          <ul class="info-list verbose-list">
            <li><strong>Window size</strong> = 한 번에 얼마나 긴 시간 묶음을 보고 판단할지</li>
            <li><strong>Relation strength</strong> = 변수들 사이 관계를 얼마나 중요하게 볼지</li>
            <li><strong>Memory horizon</strong> = 과거 문맥을 얼마나 길게 끌고 갈지</li>
            <li><strong>Anomaly amplitude</strong> = 이상 신호가 얼마나 크게 튀는 상황인지</li>
            <li><strong>Noise level</strong> = 이상이 아니라 그냥 흔들림일 가능성이 얼마나 큰지</li>
            <li><strong>Threshold</strong> = 어디부터 이상이라고 부를지 정하는 기준선</li>
          </ul>
          <p><strong>처음 보는 사람용 규칙:</strong> 반드시 한 번에 하나만 바꾸세요. 그래야 무엇이 흰 점을 움직였는지 분명하게 보입니다.</p>
        `,
      },
      {
        title: '7. 언제 도움이 되고, 언제 조심해야 하나?',
        simpler: `이 모델은 잘 맞는 데이터가 따로 있고, 모든 데이터에서 항상 최고는 아닙니다.`,
        body: `
          <p>모든 TSAD 모델이 모든 데이터에 똑같이 잘 맞지는 않습니다. <strong>${method.name}</strong>은 특히 아래 상황에서 도움이 됩니다.</p>
          <ul class="info-list verbose-list">
            ${method.useCases.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p>그리고 실제로 사용자가 체감하는 장점은 보통 아래와 같습니다.</p>
          <ul class="info-list verbose-list">
            ${method.strengths.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p>하지만 아래 상황에서는 해석을 더 조심해야 합니다.</p>
          <ul class="info-list verbose-list">
            ${method.cautions.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p><strong>처음 보는 사람용 규칙:</strong> “잘 맞는 상황” 목록과 내 데이터가 비슷할수록 이 모델 설명을 더 믿어 볼 수 있습니다.</p>
        `,
      },
      {
        title: '8. 오해하기 쉬운 포인트 + 진짜 한 문장 요약',
        simpler: `노란 점이 있다고 바로 실제 이상은 아닙니다. 중요한 것은 흰 점이 어느 방향으로 계속 이동하는가입니다.`,
        body: `
          <ul class="info-list verbose-list">
            <li><strong>오해 1.</strong> 노란 점이 있으면 무조건 실제 anomaly다 → 아닙니다. 이 화면은 개념 설명용 toy explainer입니다.</li>
            <li><strong>오해 2.</strong> 흰 점이 조금 움직이면 바로 큰 문제다 → 아닙니다. 중요한 것은 어느 방향으로, 얼마나 계속 이동하는가입니다.</li>
            <li><strong>오해 3.</strong> threshold만 낮추면 무조건 더 잘 잡는다 → 아닙니다. 너무 낮으면 false alarm이 많아지고, 너무 높으면 놓칠 수 있습니다.</li>
            <li><strong>오해 4.</strong> 이 method가 항상 최고다 → 아닙니다. 각 method는 잘 맞는 데이터 모양이 다릅니다.</li>
          </ul>
          <p>정말 한 문장으로 요약하면, <strong>${method.name}</strong>은 “지금 보고 있는 짧은 시간 구간이 정상처럼 설명되는지, 아니면 점점 설명이 어려워지는지”를 눈으로 보이는 위치 변화로 바꿔 보여 주는 모델입니다.</p>
          <p><strong>처음 보는 사람용 규칙:</strong> 흰 점이 노란 점 무리 쪽으로 가면 “이상 쪽 해석이 강해진다”고 읽으세요.</p>
        `,
      },
      {
        title: '9. Example scenario — 진짜로 어떻게 읽는지 한 번 예시로 보기',
        simpler: `예시 하나를 잡고, 흰 점이 정상 → 경계 → 이상으로 이동하는 이야기로 읽으면 됩니다.`,
        body: `
          <p>예를 들어 <strong>${scenario.setting}</strong> 상황을 상상해 보겠습니다.</p>
          <ol class="info-list verbose-list">
            <li><strong>상황 A.</strong> ${scenario.normal}</li>
            <li><strong>상황 B.</strong> ${scenario.drift}</li>
            <li><strong>상황 C.</strong> ${scenario.anomaly}</li>
            <li><strong>상황 D.</strong> Field 모드까지 같이 봤을 때 진한 영역으로 들어간다면, 이 위치는 더 위험하게 읽히는 자리라고 이해하면 됩니다.</li>
          </ol>
          <p>즉, 초보자 입장에서는 “점 하나가 어디로 갔는가”를 “정상 → 경계 → 이상”의 이동 이야기로 읽으면 됩니다.</p>
        `,
      },
      {
        title: '10. What to look at next + tiny glossary',
        simpler: `다음에는 mode를 바꾸고, threshold를 먼저 조절해 보고, glossary로 낯선 단어를 바로 뜻풀이해 읽으면 됩니다.`,
        body: `
          <p>이제 다음으로 무엇을 보면 좋을지도 같이 안내하겠습니다.</p>
          <ol class="info-list verbose-list">
            <li><strong>다음에 볼 것 1.</strong> 같은 위치에서도 mode를 Scatter / Field / Trail로 바꿔 보세요.</li>
            <li><strong>다음에 볼 것 2.</strong> Control drawer에서 threshold만 먼저 바꿔 보세요. 초보자가 가장 쉽게 체감하는 변화입니다.</li>
            <li><strong>다음에 볼 것 3.</strong> relation strength와 memory horizon을 하나씩 바꿔 보며, 이 모델이 관계 중심인지 시간 문맥 중심인지 느껴 보세요.</li>
          </ol>
          <div class="method-lab-glossary">
            <div class="method-lab-glossary-item"><strong>window</strong><span>시계열을 짧게 잘라 본 한 조각</span></div>
            <div class="method-lab-glossary-item"><strong>relation</strong><span>여러 변수 사이의 연결이나 함께 움직이는 방식</span></div>
            <div class="method-lab-glossary-item"><strong>reconstruction</strong><span>모델이 “정상이라면 이렇게 생겼을 것”이라고 다시 그려 보는 것</span></div>
            <div class="method-lab-glossary-item"><strong>threshold</strong><span>어디부터 이상이라고 부를지 정하는 선</span></div>
          </div>
          <p><strong>마지막 규칙:</strong> 이해가 막히면 용어로 돌아가지 말고, 다시 흰 점과 파란/노란 점의 위치 관계부터 보세요.</p>
        `,
      },
    ];

    if (dockDepth === 'quick') return sections.slice(0, 4);
    if (dockDepth === 'medium') return sections.slice(0, 8);
    return sections;
  }

  function checkpointMarkup() {
    const answerState = hasInteracted
      ? `
          <details class="method-lab-answer"><summary>Answer reveal</summary><div>파란 점 쪽이면 아직 정상 쪽 해석이 더 쉽고, 노란 점 쪽이면 이상 쪽 해석이 더 강해집니다.</div></details>
        `
      : `<div class="method-lab-answer-lock">Canvas를 클릭하거나 control을 한 번 움직이면 answer가 열립니다.</div>`;
    const answerState2 = hasInteracted
      ? `
          <details class="method-lab-answer"><summary>Answer reveal</summary><div>맞습니다. 이 화면에서는 진한 영역일수록 모델이 더 위험하거나 더 설명이 어려운 위치로 읽는다고 생각하면 됩니다.</div></details>
        `
      : `<div class="method-lab-answer-lock">먼저 canvas나 control과 상호작용해 보세요.</div>`;
    const answerState3 = hasInteracted
      ? `
          <details class="method-lab-answer"><summary>Answer reveal</summary><div>맞습니다. control은 단순 점수 조절이 아니라, 관계·문맥·기준선을 어떻게 해석할지 바꾸는 손잡이입니다.</div></details>
        `
      : `<div class="method-lab-answer-lock">한 번 직접 값을 바꿔 보면 answer가 더 쉽게 이해됩니다.</div>`;
    return `
      <div class="method-lab-checkpoints">
        <article class="method-lab-checkpoint">
          <strong>Checkpoint 1</strong>
          <p>지금 흰 점이 파란 점 무리 쪽에 더 가까운가, 노란 점 무리 쪽에 더 가까운가?</p>
          ${answerState}
        </article>
        <article class="method-lab-checkpoint">
          <strong>Checkpoint 2</strong>
          <p>Field 모드에서 더 진한 영역으로 갈수록 보통 더 위험하게 읽는다고 이해했는가?</p>
          ${answerState2}
        </article>
        <article class="method-lab-checkpoint">
          <strong>Checkpoint 3</strong>
          <p>Control은 숫자 장식이 아니라 “모델이 무엇을 더 중요하게 볼지”를 바꾸는 장치라는 점이 이해됐는가?</p>
          ${answerState3}
        </article>
      </div>`;
  }

  function syncControlsFromPoint(point) {
    controls.relationStrength = clamp(point.x);
    controls.memoryHorizon = clamp(point.y);
    controls.anomalyAmplitude = clamp(point.x * 0.42 + point.y * 0.58);
    controls.noiseLevel = clamp(0.12 + Math.abs(point.x - point.y) * 0.42);
    controls.threshold = clamp(0.78 - point.x * 0.2 - point.y * 0.16, 0, 1);
    controls.windowSize = Math.round(12 + clamp(point.y * 0.7 + point.x * 0.3) * 68);
  }

  function pointToCanvas(point, width, height, padding) {
    return { x: padding + point.x * (width - padding * 2), y: padding + (1 - point.y) * (height - padding * 2) };
  }

  function canvasToPoint(x, y, width, height, padding) {
    return { x: clamp((x - padding) / (width - padding * 2)), y: clamp(1 - (y - padding) / (height - padding * 2)) };
  }

  function drawCanvas() {
    const canvas = root.querySelector('[data-method-canvas]');
    const tooltip = root.querySelector('[data-method-tooltip]');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width * dpr));
    const height = Math.max(320, Math.round(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scores = metricScores();
    const signals = deriveSignals(scores);
    const current = currentPoint(signals);
    const points = cloud(signals);
    const trail = trajectory(signals);
    const padding = 52 * dpr;

    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, 'rgba(18, 36, 67, 0.98)');
    bg.addColorStop(1, 'rgba(7, 17, 31, 0.98)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    if (activeDetailView === 'field') {
      const cellSize = Math.max(16 * dpr, Math.floor((width - padding * 2) / 20));
      for (let yy = padding; yy < height - padding; yy += cellSize) {
        for (let xx = padding; xx < width - padding; xx += cellSize) {
          const p = canvasToPoint(xx, yy, width, height, padding);
          const score = scoreSurface(p.x, p.y);
          ctx.fillStyle = `rgba(233,69,96,${(0.08 + score * 0.5).toFixed(3)})`;
          ctx.fillRect(xx, yy, cellSize + 1, cellSize + 1);
        }
      }
    }

    ctx.strokeStyle = 'rgba(151,184,255,0.16)';
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i <= 5; i += 1) {
      const t = i / 5;
      const x = padding + t * (width - padding * 2);
      const y = padding + t * (height - padding * 2);
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }

    const boundary = decisionBoundary();
    const candidates = [];
    const push = (x, y) => { if (x >= 0 && x <= 1 && y >= 0 && y <= 1) candidates.push({ x, y }); };
    push(0, boundary / config.yWeight);
    push(1, (boundary - config.xWeight) / config.yWeight);
    push(boundary / config.xWeight, 0);
    push((boundary - config.yWeight) / config.xWeight, 1);
    const linePoints = candidates.filter((p, i, arr) => arr.findIndex((q) => Math.abs(q.x - p.x) < 0.001 && Math.abs(q.y - p.y) < 0.001) === i).slice(0, 2);
    if (linePoints.length === 2) {
      const a = pointToCanvas(linePoints[0], width, height, padding);
      const b = pointToCanvas(linePoints[1], width, height, padding);
      ctx.save();
      ctx.setLineDash([10 * dpr, 8 * dpr]);
      ctx.strokeStyle = 'rgba(134,255,202,0.9)';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.restore();
    }

    if (activeDetailView === 'trail') {
      ctx.strokeStyle = 'rgba(134,255,202,0.94)';
      ctx.lineWidth = 4 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      trail.forEach((point, index) => {
        const pos = pointToCanvas(point, width, height, padding);
        if (index === 0) ctx.moveTo(pos.x, pos.y); else ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();
    }

    points.forEach((point) => {
      const pos = pointToCanvas(point, width, height, padding);
      ctx.beginPath();
      ctx.fillStyle = point.type === 'anomaly' ? 'rgba(255,206,106,0.94)' : 'rgba(110,208,255,0.82)';
      ctx.arc(pos.x, pos.y, point.type === 'anomaly' ? 6 * dpr : 4.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      point.canvasX = pos.x; point.canvasY = pos.y;
    });

    const currentPos = pointToCanvas(current, width, height, padding);
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2.5 * dpr; ctx.arc(currentPos.x, currentPos.y, 14 * dpr, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = '#fff'; ctx.arc(currentPos.x, currentPos.y, 7 * dpr, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(232,240,255,0.96)';
    ctx.font = `${13 * dpr}px Inter, sans-serif`;
    ctx.fillText(config.xLabel, width / 2 - 40 * dpr, height - 16 * dpr);
    ctx.save(); ctx.translate(18 * dpr, height / 2 + 40 * dpr); ctx.rotate(-Math.PI / 2); ctx.fillText(config.yLabel, 0, 0); ctx.restore();
    ctx.fillStyle = 'rgba(158,178,212,0.9)';
    ctx.fillText(config.zoneLabel, width - padding - 160 * dpr, padding + 20 * dpr);

    if (tooltip) {
      if (hoveredPoint) {
        const label = hoveredPoint.type === 'current' ? 'current window' : hoveredPoint.type === 'anomaly' ? config.anomalyLabel : config.normalLabel;
        tooltip.hidden = false;
        tooltip.textContent = `${label} · ${config.xLabel} ${pct(hoveredPoint.x)} · ${config.yLabel} ${pct(hoveredPoint.y)}`;
        tooltip.style.left = `${hoveredPoint.clientX}px`;
        tooltip.style.top = `${hoveredPoint.clientY}px`;
      } else {
        tooltip.hidden = true;
      }
    }

    canvas._scene = { current, currentPos, points, width, height, padding };
  }

  function bindCanvas() {
    const canvas = root.querySelector('[data-method-canvas]');
    if (!canvas) return;

    const updateHover = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (window.devicePixelRatio || 1);
      const y = (event.clientY - rect.top) * (window.devicePixelRatio || 1);
      const scene = canvas._scene;
      if (!scene) return;
      const currentDist = Math.hypot(x - scene.currentPos.x, y - scene.currentPos.y);
      if (currentDist < 18 * (window.devicePixelRatio || 1)) {
        hoveredPoint = { type: 'current', x: scene.current.x, y: scene.current.y, clientX: event.offsetX + 18, clientY: event.offsetY + 18 };
      } else {
        const nearest = scene.points.find((point) => Math.hypot(x - point.canvasX, y - point.canvasY) < 10 * (window.devicePixelRatio || 1));
        hoveredPoint = nearest ? { type: nearest.type, x: nearest.x, y: nearest.y, clientX: event.offsetX + 18, clientY: event.offsetY + 18 } : null;
      }
      drawCanvas();
    };

    const updateFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (event.clientX - rect.left) * dpr;
      const y = (event.clientY - rect.top) * dpr;
      const scene = canvas._scene;
      if (!scene) return;
      syncControlsFromPoint(canvasToPoint(x, y, scene.width, scene.height, scene.padding));
      render();
    };

    canvas.addEventListener('pointerdown', (event) => { hasInteracted = true; isDraggingCurrent = true; canvas.setPointerCapture(event.pointerId); updateFromEvent(event); });
    canvas.addEventListener('pointermove', (event) => { if (isDraggingCurrent) updateFromEvent(event); else updateHover(event); });
    canvas.addEventListener('pointerup', () => { isDraggingCurrent = false; });
    canvas.addEventListener('pointerleave', () => { hoveredPoint = null; isDraggingCurrent = false; drawCanvas(); });
    window.addEventListener('resize', drawCanvas, { passive: true });
    drawCanvas();
  }

  function applyScrollChrome() {
    const compact = window.scrollY > 80;
    const slimHeader = root.querySelector('.method-lab-header-slim');
    const overlayCopy = root.querySelector('.method-viz-overlay-copy');
    if (slimHeader) slimHeader.classList.toggle('is-hidden-on-scroll', compact);
    if (overlayCopy) overlayCopy.classList.toggle('is-faded-on-scroll', compact);
  }

  function bindScrollChrome() {
    if (scrollChromeBound) return;
    scrollChromeBound = true;
    window.addEventListener('scroll', applyScrollChrome, { passive: true });
    window.addEventListener('resize', applyScrollChrome, { passive: true });
  }

  function render() {
    const scores = metricScores();
    const signals = deriveSignals(scores);
    const insights = visualInsights(scores, signals);
    const dockSections = beginnerDockSections(scores, signals);
    const current = currentPoint(signals);
    const liveSummary = `${method.name}. ${config.xLabel} ${Math.round(current.x * 100)}%, ${config.yLabel} ${Math.round(current.y * 100)}%. Canvas를 클릭하거나 드래그해 current window를 옮길 수 있습니다.`;

    root.innerHTML = `
      <section class="method-lab-shell">
        <article class="card method-lab-stage method-viz-stage method-viz-stage-full">
          <figure class="method-viz-figure method-viz-figure-full" role="img" aria-label="${method.name}의 interactive canvas. 현재 window 점을 드래그해서 anomaly separation을 탐색합니다.">
            <div class="method-viz-canvas-wrap">
              <div class="method-viz-overlay">
                <div class="method-viz-overlay-copy">
                  <div class="eyebrow">Explainer visuals</div>
                  <strong>${config.title}</strong>
                  <span>${config.scatterSummary}</span>
                </div>
                <div class="method-viz-toolbar method-viz-toolbar-overlay" role="toolbar" aria-label="Visualization views">
                  <button type="button" class="method-viz-btn ${activeDetailView === 'scatter' ? 'is-active' : ''}" data-method-view="scatter" aria-pressed="${activeDetailView === 'scatter'}">Scatter</button>
                  <button type="button" class="method-viz-btn ${activeDetailView === 'field' ? 'is-active' : ''}" data-method-view="field" aria-pressed="${activeDetailView === 'field'}">Field</button>
                  <button type="button" class="method-viz-btn ${activeDetailView === 'trail' ? 'is-active' : ''}" data-method-view="trail" aria-pressed="${activeDetailView === 'trail'}">Trail</button>
                </div>
              </div>
              <canvas class="method-viz-canvas" data-method-canvas></canvas>
              <div class="method-viz-tooltip" data-method-tooltip hidden></div>
            </div>
            <figcaption class="visually-hidden">Canvas에서 current window를 직접 움직이며 normal cluster, anomaly cloud, threshold contour, trail 또는 field를 볼 수 있습니다.</figcaption>
          </figure>
          <div class="method-viz-meta method-viz-meta-compact">
            <div class="method-viz-note"><strong>legend</strong><span><i class="swatch normal"></i>${config.normalLabel} · <i class="swatch anomaly"></i>${config.anomalyLabel} · <i class="swatch current"></i>current window</span></div>
          </div>
          <ul class="method-viz-insights info-list">${insights.map((item) => `<li>${item}</li>`).join('')}</ul>
        </article>

        <article class="panel hero-card method-lab-header method-lab-header-slim">
          <div class="method-lab-header-top">
            <div class="eyebrow">${lab.intro?.eyebrow || 'Method Lab'} · ${method.family}</div>
            <div class="meta-row method-lab-meta-tight">
              <span class="badge">${method.name}</span>
              <span class="badge">canvas interactive</span>
              <span class="badge">drag current window</span>
            </div>
          </div>
          <div class="method-lab-header-main">
            <p class="lead method-lab-lead-tight">${method.summary}</p>
            <div class="method-lab-header-side">
              <strong>핵심 질문</strong>
              <span>${method.coreQuestion}</span>
              <span class="small muted">${method.playgroundPrompt}</span>
            </div>
          </div>
          <div class="method-lab-live visually-hidden" aria-live="polite">${liveSummary}</div>
        </article>

        <details class="card method-lab-stage method-lab-control-stage method-lab-drawer">
          <summary class="method-lab-drawer-summary">
            <div>
              <div class="eyebrow">Toy controls</div>
              <h2 class="section-title section-title-compact">Control drawer</h2>
            </div>
            <span class="badge">expand calibration</span>
          </summary>
          <div class="method-lab-drawer-body">
            <p class="method-lab-caption small">Explainer 아래에서 세부 calibration을 조정합니다.</p>
            <div class="method-lab-controls method-lab-controls-wide">${controlMarkup()}</div>
          </div>
        </details>

        <article class="card method-lab-dock">
          <div class="method-lab-dock-head">
            <div>
              <div class="eyebrow">Explainer dock</div>
              <h2 class="section-title section-title-compact">처음 보는 사람을 위한 step-by-step 설명</h2>
            </div>
            <div class="method-lab-dock-modes" role="toolbar" aria-label="Explainer depth">
              <button type="button" class="method-viz-btn ${dockDepth === 'quick' ? 'is-active' : ''}" data-dock-depth="quick" aria-pressed="${dockDepth === 'quick'}">30-sec</button>
              <button type="button" class="method-viz-btn ${dockDepth === 'medium' ? 'is-active' : ''}" data-dock-depth="medium" aria-pressed="${dockDepth === 'medium'}">2-min</button>
              <button type="button" class="method-viz-btn ${dockDepth === 'deep' ? 'is-active' : ''}" data-dock-depth="deep" aria-pressed="${dockDepth === 'deep'}">Deep dive</button>
            </div>
          </div>
          ${checkpointMarkup()}
          <div class="method-lab-dock-grid">
            ${dockSections.map((section, index) => {
              const simpler = section.simpler
                ? `<details class="method-lab-simpler" ${dockDepth === 'quick' ? 'open' : ''}><summary>Show simpler wording</summary><div>${section.simpler}</div></details>`
                : '';
              const body = `
                ${simpler}
                <div class="method-lab-dock-copy">${section.body}</div>`;
              if (dockDepth === 'deep' && index >= 4) {
                return `
                  <details class="method-lab-dock-card method-lab-dock-card-verbose method-lab-dock-fold">
                    <summary>${section.title}</summary>
                    ${body}
                  </details>`;
              }
              return `
                <section class="method-lab-dock-card method-lab-dock-card-verbose">
                  <strong>${section.title}</strong>
                  ${body}
                </section>`;
            }).join('')}
          </div>
          <p class="method-lab-dock-note"><strong>한 줄 요약:</strong> ${lab.intro?.summary || ''} 이 dock는 용어를 줄이고, “지금 이 canvas에서 무엇을 봐야 하는가”를 순서대로 설명하도록 다시 썼습니다.</p>
        </article>
      </section>`;

    root.querySelectorAll('[data-method-control]').forEach((input) => {
      input.addEventListener('input', (event) => {
        hasInteracted = true;
        controls[event.target.dataset.methodControl] = Number(event.target.value);
        render();
      });
    });
    root.querySelectorAll('[data-method-view]').forEach((button) => {
      button.addEventListener('click', (event) => {
        hasInteracted = true;
        activeDetailView = event.currentTarget.dataset.methodView;
        render();
      });
    });
    root.querySelectorAll('[data-dock-depth]').forEach((button) => {
      button.addEventListener('click', (event) => {
        hasInteracted = true;
        dockDepth = event.currentTarget.dataset.dockDepth;
        render();
      });
    });
    bindCanvas();
    bindScrollChrome();
    applyScrollChrome();
  }

  render();
})();
