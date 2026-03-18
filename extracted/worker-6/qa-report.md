# QA / Provenance Report (worker-6)

## 범위
- read-only QA/provenance lane로 전체 정적 페이지, route, paper figure asset, extracted/pdf_images 출처를 점검했습니다.
- 수정 범위는 `extracted/worker-6/` 산출물만 포함합니다.

## 핵심 결과
- 정적 HTML 기준 link/img reference 105건을 점검했고 **broken reference는 0건**이었습니다.
- 사이트에서 재사용한 paper figure asset 13개는 모두 `extracted/pdf_images/`의 원본 추출 파일과 **SHA-256 동일 매치**가 확인되었습니다.
- `/background/`는 static `<img>`가 없지만 `assets/js/data.js`를 통해 Figure 1 crop 3장을 동적으로 주입합니다.
- 현재 빌드 route는 `/`, `/background/`, `/applications/`, `/methods/`, `/benchmarks/`, `/guidelines/`, `/paper-map/`, `/playground/` 8개입니다.
- `extracted/worker-2-study-site-routes.json`의 richer IA 대비 `/problem-space/`, `/classical-limitations/`, `/taxonomy/`, `/figures/`, `/glossary/`, `/about-paper/`는 아직 실제 route로 구현되지 않았습니다.

## 페이지별 QA 메모
- `/applications/` (`applications/index.html`): title="Applications · TSAD Deep Study", 링크 11개, 정적 이미지 1개, broken 0, note: 특이사항 없음
- `/background/` (`background/index.html`): title="Background · TSAD Deep Study", 링크 10개, 정적 이미지 0개, broken 0, note: Background anomaly tabs inject three Figure 1 crops via assets/js/data.js
- `/benchmarks/` (`benchmarks/index.html`): title="Benchmarks · TSAD Deep Study", 링크 10개, 정적 이미지 2개, broken 0, note: 특이사항 없음
- `/guidelines/` (`guidelines/index.html`): title="Guidelines · TSAD Deep Study", 링크 10개, 정적 이미지 2개, broken 0, note: 특이사항 없음
- `/` (`index.html`): title="TSAD Deep Study · Deep Learning for Anomaly Detection in Time-Series Data", 링크 19개, 정적 이미지 4개, broken 0, note: 특이사항 없음
- `/methods/` (`methods/index.html`): title="Methods · TSAD Deep Study", 링크 10개, 정적 이미지 4개, broken 0, note: 특이사항 없음
- `/paper-map/` (`paper-map/index.html`): title="Paper Map · TSAD Deep Study", 링크 10개, 정적 이미지 1개, broken 0, note: 특이사항 없음
- `/playground/` (`playground/index.html`): title="Playground · TSAD Deep Study", 링크 11개, 정적 이미지 1개, broken 0, note: 특이사항 없음

## figure provenance 요약
- Figure 1 · `assets/images/paper/anomaly-wave-1.jpg` ← `extracted/pdf_images/img-002.jpg` · routes: /background/#js-tabs
- Figure 1 · `assets/images/paper/anomaly-wave-2.jpg` ← `extracted/pdf_images/img-003.jpg` · routes: /background/#js-tabs
- Figure 1 · `assets/images/paper/anomaly-wave-3.jpg` ← `extracted/pdf_images/img-004.jpg` · routes: /, /background/#js-tabs
- Figure 2 · `assets/images/paper/industrial-apps.jpg` ← `extracted/pdf_images/img-026.jpg` · routes: /applications/
- Figure 6 · `assets/images/paper/graph-attention.jpg` ← `extracted/pdf_images/img-030.jpg` · routes: /methods/
- Figure 5 · `assets/images/paper/benchmark-summary.jpg` ← `extracted/pdf_images/img-032.jpg` · routes: /, /paper-map/, /playground/
- Figure 7 · `assets/images/paper/dilated-rnn.jpg` ← `extracted/pdf_images/img-035.jpg` · routes: /, /methods/
- Figure 8 · `assets/images/paper/latent-reconstruction.jpg` ← `extracted/pdf_images/img-037.jpg` · routes: /methods/
- Figure 8 · `assets/images/paper/dissimilarity-space.jpg` ← `extracted/pdf_images/img-039.jpg` · routes: /methods/
- Figure 9 · `assets/images/paper/results-bars-blue.jpg` ← `extracted/pdf_images/img-043.jpg` · routes: /, /benchmarks/
- Figure 10 · `assets/images/paper/results-bars-gold.png` ← `extracted/pdf_images/img-044.png` · routes: /benchmarks/
- Figure 11 · `assets/images/paper/strategy-realtime.jpg` ← `extracted/pdf_images/img-046.jpg` · routes: /guidelines/
- Figure 11 · `assets/images/paper/strategy-warning.jpg` ← `extracted/pdf_images/img-047.jpg` · routes: /guidelines/

## 남아 있는 provenance 여지
- `extracted/pdf_images/`에는 실제 site에서 아직 쓰지 않은 추출 이미지가 다수 남아 있습니다. 대표적으로 IA에서 제안했던 Fig. 3/4 및 표/보조 그래픽 후보가 포함되어 보입니다.
- 본 lane은 read-only 범위라 route/HTML 수정은 하지 않았고, 후속 구현자는 `figure-provenance.json`과 `route-audit.json`을 근거로 필요한 자산만 추가 반영하면 됩니다.

## 산출물
- `extracted/worker-6/qa-report.md`
- `extracted/worker-6/figure-provenance.json`
- `extracted/worker-6/route-audit.json`
