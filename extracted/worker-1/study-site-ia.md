# Multi-URI Interactive Study-Site IA Plan

- Source: `Deep_Learning_for_Anomaly_Detection_in_Time-Series_Data_Review_Analysis_and_Guidelines.pdf`
- Audience: 논문을 빠르게 이해하려는 학생/연구자/엔지니어
- Tone: Korean-first, technical terms preserved in English
- Primary UX goal: 논문 구조를 **탐색 가능한 학습 사이트**로 재구성

## 1. Site Architecture Summary

### Global navigation
- `/` — Overview
- `/problem-space` — Background + anomaly taxonomy
- `/applications` — Industrial applications
- `/model-taxonomy` — Deep learning taxonomy
- `/benchmarks` — Datasets + comparative review
- `/guidelines` — Practitioner guidelines
- `/paper-map` — Section-by-section paper map

### Persistent UI blocks
- Top nav with current section highlight
- Right-side sticky outline for in-page jumping
- Technical term tooltip system (hover: Korean gloss + English original)
- "From the paper" citation pills linking each block to source section/figure/table
- Cross-page CTA: `이 다음에 보기` recommendation cards

## 2. Page-by-Page Content Plan

### `/` — Overview
**Purpose**
- 30초 내에 논문의 문제의식, contribution, takeaway 전달

**Sections**
1. Hero
   - Title, subtitle, one-sentence thesis
2. Why this matters
   - 산업 자동화, IoT, CPS, fault detection 맥락
3. What this paper adds
   - review + analysis + guidelines
4. Fast taxonomy preview
   - anomaly type / model family / dataset / guideline 4-card grid
5. Recommended reading paths
   - 입문용 / 실무용 / 모델 비교용

**Interactive modules**
- Reading-path selector
- Hover glossary chips for anomaly detection, temporal dependency, inter-correlation
- Expandable "3 key takeaways"

**Figure/table usage plan**
- Recreate a simplified card-based version of the paper's overall taxonomy idea (inspired by Fig. 5, not direct image dependence)
- Avoid dense tables on landing page

---

### `/problem-space` — Background + Anomaly Taxonomy
**Purpose**
- anomaly definition과 time-series difficulty를 직관적으로 설명

**Sections**
1. What is an anomaly?
2. Three anomaly types
   - point anomaly
   - contextual anomaly
   - collective anomaly
3. Why time series is harder than static data
   - temporality
   - dimensionality
   - nonstationarity
   - noise
4. Why multivariate modeling matters

**Interactive modules**
- Toggle demo: point/contextual/collective anomaly examples
- Animated timeline showing short-term vs long-term context
- "What changes if multivariate?" comparison slider

**Figure/table usage plan**
- Use **Fig. 1** as the primary visual anchor for anomaly types
- Convert Table 1 idea into compact taxonomy cards instead of raw table

---

### `/applications` — Industrial Applications
**Purpose**
- 논문이 다루는 real-world deployment 맥락을 보여줌

**Sections**
1. Smart manufacturing
   - production equipment
   - infrastructure facilities
   - logistics automation system
2. Smart energy management
   - electric power
   - treated water
   - manufactured gas
3. Cloud computing system
   - server machine
   - network/framework
   - cybersecurity
4. Structural health monitoring
5. Cross-domain pattern summary

**Interactive modules**
- Industry filter chips
- Use-case matrix: domain × data type × anomaly goal
- Clickable cards linking each domain to relevant model families

**Figure/table usage plan**
- Use **Fig. 2** for manufacturing equipment context
- Use **Fig. 3** for smart energy management overview
- Replace long prose with domain cards and "대표 모델/목표" badges

---

### `/model-taxonomy` — Deep Learning Taxonomy
**Purpose**
- 논문의 핵심 contribution인 taxonomy를 가장 풍부하게 보여주는 페이지

**Sections**
1. Why deep learning enters TSAD
   - lack of labels
   - complexity of multivariate data
2. Inter-correlation between variables
   - dimensional reduction
   - 2D matrix
   - graph
   - others
3. Modeling temporal context
   - RNN/LSTM/GRU/dilated RNN
   - CNN/TCN
   - Hybrid / ConvLSTM
   - Attention / Transformer
   - HTM
4. Anomaly criteria
   - reconstruction error
   - prediction error
   - dissimilarity
5. Model family summary table

**Interactive modules**
- Taxonomy explorer: choose relation modeling + temporal modeling + anomaly criterion
- Model family comparison matrix
- Click-to-highlight examples: DAGMM, MSCRED, OmniAnomaly, USAD, MAD-GAN, THOC, GTA, GDN

**Figure/table usage plan**
- Use **Fig. 5** as the conceptual backbone for the page
- Use **Fig. 6** in the graph subsection
- Use **Fig. 7** in the dilated RNN subsection
- Use **Fig. 8** in the anomaly criteria subsection
- Convert Table 2 and Table 3 into interactive filters/cards rather than static tables

---

### `/benchmarks` — Datasets + Comparative Review
**Purpose**
- benchmark datasets와 결과 해석을 한 페이지에서 연결

**Sections**
1. Benchmark datasets
   - SWaT
   - WADI
   - MSL
2. Evaluation metrics
   - Precision / Recall / F1-score
3. Model family comparison
4. Result interpretation
   - temporal dependency
   - parallel processing for long sequences
   - dimensionality of datasets
   - inter-correlations between attributes
5. Practical takeaway box

**Interactive modules**
- Dataset tabs
- Metric explainer toggle
- Result interpretation accordion
- "Why WADI is harder" explainer panel

**Figure/table usage plan**
- Use **Table 4** for dataset summary, but redesign into responsive cards
- Use **Table 6** as a sortable comparison table
- Use **Fig. 9** and **Fig. 10** for results interpretation
- Keep **Table 5** secondary, inside an expandable hyper-parameter appendix

---

### `/guidelines` — Practitioner Guidelines
**Purpose**
- 논문 후반의 practical advice를 decision-support experience로 전환

**Sections**
1. No one-size-fits-all
2. Detection strategy
   - real-time vs early warning
   - sliding window vs incremental update
3. Training and preprocessing
   - loss function
   - batch learning vs online update
   - denoising
4. Decision checklist
5. Recommended model selection scenarios

**Interactive modules**
- Decision tree / wizard:
  - Is real-time required?
  - Is early warning more important?
  - Is data streaming?
  - Are variable relations strong?
  - Is online update needed?
- Loss function explainer tabs
- Denoising method comparison cards

**Figure/table usage plan**
- Use **Fig. 11** as the key visual for strategy choices
- Convert the text-heavy guideline section into a stepwise decision UI

---

### `/paper-map` — Section-by-Section Paper Map
**Purpose**
- 원논문 구조를 그대로 따라가고 싶은 사용자를 위한 reference page

**Sections**
1. Introduction
2. Background
3. Industrial applications
4. Challenges of classical approaches
5. Deep learning taxonomy
6. Comparative reviews
7. Guidelines for practitioners
8. Conclusion

**Interactive modules**
- Section jump map
- "Read this section if..." guidance
- Source index: figure/table/section cross-reference

**Figure/table usage plan**
- All figures/tables는 썸네일/링크 목록으로만 배치
- 세부 해설은 해당 topic page로 다시 연결

## 3. Cross-Page Interactive Module Inventory

### Essential
- Glossary tooltip engine
- Dataset/model family filter chips
- Figure/table cross-reference system
- Reading mode switch: beginner / practitioner / researcher

### Nice-to-have
- "Compare two model families" drawer
- Anomaly type mini simulation
- Progressive disclosure cards for formulas and metrics

## 4. Figure Usage Plan

| Paper asset | Site usage |
|---|---|
| **Fig. 1** | `/problem-space` anomaly taxonomy explainer |
| **Fig. 2** | `/applications` manufacturing context |
| **Fig. 3** | `/applications` energy management context |
| **Fig. 5** | `/model-taxonomy` master overview |
| **Fig. 6** | `/model-taxonomy` graph attention subsection |
| **Fig. 7** | `/model-taxonomy` temporal context / dilated RNN subsection |
| **Fig. 8** | `/model-taxonomy` anomaly criteria explainer |
| **Fig. 9 + Fig. 10** | `/benchmarks` result interpretation |
| **Fig. 11** | `/guidelines` decision strategy visual |
| **Table 4** | `/benchmarks` dataset summary cards |
| **Table 5** | `/benchmarks` advanced appendix for hyper-parameters |
| **Table 6** | `/benchmarks` sortable result table |

## 5. Content Priority Order for Build
1. `/`
2. `/model-taxonomy`
3. `/benchmarks`
4. `/guidelines`
5. `/problem-space`
6. `/applications`
7. `/paper-map`

## 6. Writing Guidance
- Korean primary copy, but preserve technical terms in English on first mention
- Keep paragraphs short; prefer cards, bullets, diagrams
- Distinguish clearly between:
  - concept explanation
  - paper-specific claim
  - practical takeaway
- Prefer interpretation over verbatim reproduction

## 7. Integration Notes for Leader
- This IA is intentionally aligned with the Korean content map in `extracted/worker-1/korean-content-map.md`
- Suggested pairing:
  - content map = copy/source structure
  - IA plan = route/layout/interaction structure
- Task-state note: although task description says "worker 2 designs", team state assigned task 2 to `worker-1`, so this artifact was produced to keep execution moving.
