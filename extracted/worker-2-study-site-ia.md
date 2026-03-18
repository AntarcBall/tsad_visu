# Interactive Study-Site Information Architecture

Source paper: **Deep Learning for Anomaly Detection in Time-Series Data: Review, Analysis, and Guidelines**

## Goal
Build a multi-URI study site that helps readers move from problem framing → industrial motivation → model taxonomy → benchmark evidence → practitioner decision support.

## Primary audience
- Researchers entering time-series anomaly detection (TSAD)
- Engineers choosing models for multivariate industrial data
- Readers who need a quicker, more explorable version of the review paper

## Site map (multi-URI)

| URI | Page title | Core purpose | Paper anchors |
|---|---|---|---|
| `/` | Paper Overview | High-level landing page with abstract, contributions, and navigation | Abstract, Intro |
| `/problem-space` | Anomaly Detection Problem Space | Explain anomaly types, TSAD setting, and why multivariate time series is hard | Sec. I–II, Fig. 1, Table 1 |
| `/applications` | Industrial Applications | Show where TSAD matters across manufacturing, energy, infra, cloud, and health | Sec. III, Fig. 2, Fig. 3 |
| `/classical-limitations` | Why Classical Methods Break | Summarize challenges that motivate deep learning | Sec. IV, Fig. 4 |
| `/taxonomy` | Deep Learning Taxonomy | Main explorable model-family page | Sec. V, Fig. 5, Table 2, Table 3 |
| `/benchmarks` | Datasets and Comparative Results | Benchmark-centered page for SWaT / WADI / MSL | Sec. VI, Table 4, Table 5, Table 6, Fig. 9, Fig. 10 |
| `/guidelines` | Practitioner Playbook | Decision framework for model choice and training strategy | Sec. VII, Fig. 11 |
| `/figures` | Figure & Table Atlas | Searchable gallery for all paper visuals with captions and reuse guidance | Fig. 1–11, Table 1–6 |
| `/glossary` | Terminology & Model Glossary | Fast lookup for AE/VAE/GAN/GNN/Transformer/GRU/LSTM/etc. | Cross-page support |
| `/about-paper` | Citation, authors, license | Metadata, DOI, citation block, provenance | Front matter |

## Navigation model

### Global nav
1. Overview
2. Problem Space
3. Applications
4. Taxonomy
5. Benchmarks
6. Guidelines
7. Figures

### Cross-page user journeys
- **New reader path**: `/` → `/problem-space` → `/taxonomy` → `/guidelines`
- **Practitioner path**: `/` → `/applications` → `/benchmarks` → `/guidelines`
- **Figure-driven path**: `/figures` → linked detail sections on each thematic page
- **Dataset-driven path**: `/benchmarks?dataset=SWaT|WADI|MSL` → filtered model cards → `/guidelines`

## Page-by-page content plan

### 1) `/` — Paper Overview
**Hero block**
- Title, authors, year, DOI
- One-sentence thesis: deep learning improves multivariate TSAD, but model choice must reflect deployment constraints
- CTA buttons: `Explore taxonomy`, `Compare datasets`, `Choose a strategy`

**Sections**
- Paper summary in 4 cards:
  - Background of TSAD
  - Industrial applications
  - Deep model taxonomy
  - Practical guidelines
- “What this paper contributes” strip:
  - broad review
  - comparative analysis on benchmark datasets
  - practitioner-oriented guidelines
- Preview cards for Sec. III / VI / VII

**Interactive module**
- `Paper-at-a-glance`: clicking a contribution scrolls to the relevant page route

### 2) `/problem-space` — Anomaly Detection Problem Space
**Content blocks**
- What anomaly detection means in time-series data
- Univariate vs multivariate TSAD
- Anomaly types and data properties
- Background challenges: temporal dependency, inter-variable correlation, nonstationarity, noise, label scarcity

**Interactive modules**
- `Anomaly Type Explorer` based on Fig. 1 + Table 1
  - point / contextual / collective style examples
  - hover definitions with mini time-series sketches
- `Challenge Cards`
  - temporal context
  - multivariate correlation
  - noisy sensors
  - thresholding difficulty

**Visual usage**
- Hero visual: **Fig. 1**
- Supporting table summary: **Table 1**

### 3) `/applications` — Industrial Applications
**Content blocks**
- Smart manufacturing
  - production equipment
  - infrastructure facilities
  - logistics automation systems
- Smart energy management
- Water treatment / distribution / cyber-physical security
- Cloud/server monitoring and other domains surfaced later in Sec. III

**Interactive modules**
- `Industry Scenario Tabs`
  - Manufacturing
  - Energy
  - Water/CPS
  - IT/Cloud
- `Use-case to Failure-Cost matrix`
  - real-time severity
  - latency tolerance
  - typical signal dimension

**Visual usage**
- **Fig. 2** for manufacturing equipment examples
- **Fig. 3** for smart energy management system context

### 4) `/classical-limitations` — Why Classical Methods Break
**Content blocks**
- Why handcrafted / classical approaches struggle at scale
- Limits of fixed assumptions under multivariate, high-volume, noisy data
- MapReduce-era scaling vs representation limits
- Transition narrative into deep learning section

**Interactive modules**
- `Classical vs Deep comparison table`
  - feature engineering burden
  - temporal context handling
  - multivariate representation
  - scalability
- `Failure mode callouts`

**Visual usage**
- **Fig. 4** flowchart of MapReduce model as a contrast/reference point

### 5) `/taxonomy` — Deep Learning Taxonomy
**Content blocks**
- Overview taxonomy of recent methods
- Inter-correlation modeling strategies
- Temporal context modeling strategies
- Anomaly scoring families

**Subsections / internal anchors**
- `#families`: AE / VAE / GAN / RNN / Transformer / GNN / hybrids
- `#inter-correlation`: dimensional reduction, convolution, graph structure, attention
- `#temporal-context`: recurrent, dilated recurrent, TCN, self-attention
- `#scores`: reconstruction, prediction, dissimilarity

**Interactive modules**
- `Taxonomy Explorer` using **Fig. 5** as the page anchor
  - filter by model family
  - filter by score type
  - filter by temporal modeling capability
- `Model Family Cards`
  - input assumptions
  - strengths
  - failure risks
  - best-fit deployment contexts
- `Correlation Strategy Matrix` from **Table 2**
- `Temporal Context Matrix` from **Table 3**
- `Mechanism Deep Dives`
  - Graph attention explainer using **Fig. 6**
  - Dilated RNN explainer using **Fig. 7**
  - Anomaly score explainer using **Fig. 8**

### 6) `/benchmarks` — Datasets and Comparative Results
**Content blocks**
- Public datasets used in the review: SWaT, WADI, MSL
- Evaluation metrics: Precision / Recall / F1-score
- Experimental conditions and caveats
- Main findings: no universal winner; temporal modeling helps; dataset dimensionality matters; graph structure helps on strongly related attributes

**Interactive modules**
- `Dataset Selector`
  - SWaT
  - WADI
  - MSL
- `Benchmark Table Viewer`
  - transform Table 6 into sortable cards/table
  - metric toggle: Precision / Recall / F1
- `Finding Highlights`
  - temporal dependency effect (**Fig. 9**)
  - dimension effect (**Fig. 10**)
- `Model-vs-Dataset Fit chart`

**Visual usage**
- **Table 4** summary of datasets
- **Table 5** hyperparameter context (collapsible advanced section)
- **Table 6** results table
- **Fig. 9** and **Fig. 10** as analysis visuals

### 7) `/guidelines` — Practitioner Playbook
**Content blocks**
- Detection strategy selection
  - real-time vs early warning
  - sliding window vs incremental update
- Training and preprocessing choices
  - loss functions
  - batch learning vs online update
  - denoising
- Deployment-oriented recommendations
  - match system constraints to family choice
  - note false-positive / false-negative tradeoffs

**Interactive modules**
- `Decision Wizard`
  - asks: real-time?, streaming?, long sequence?, strong feature graph?, low labels?, online update?
  - outputs recommended model families and caveats
- `Threshold Tradeoff Slider`
  - shows recall vs false alarms conceptually
- `Training Strategy Checklist`

**Visual usage**
- **Fig. 11** as main decision-framework visual

### 8) `/figures` — Figure & Table Atlas
**Structure**
- Grid of visual assets grouped by:
  - problem framing
  - applications
  - taxonomy/mechanisms
  - benchmarking
  - guidelines

**Per-item card content**
- caption
- paper section source
- where to reuse in the site
- whether to crop, highlight, or keep full width

### 9) `/glossary` — Terminology & Model Glossary
**Entries**
- AE, VAE, GAN, RNN, GRU, LSTM, TCN, GNN, GAT, Transformer, THOC, DAGMM, OmniAnomaly, GDN, GTA
- dataset entries: SWaT, WADI, MSL
- evaluation entries: precision, recall, F1-score, threshold, point adjustment

**Interactive module**
- `Term lookup + related pages`

### 10) `/about-paper` — Metadata & Provenance
**Content blocks**
- DOI, publication details, authors, affiliations
- license/provenance note for reused paper figures
- citation export options (BibTeX/plain)

## Recommended homepage section order
1. Hero
2. Why TSAD matters
3. Industrial impact preview
4. Deep learning taxonomy snapshot
5. Benchmark takeaway strip
6. Practitioner guideline preview
7. Figures gallery teaser
8. Citation/footer

## Interactive modules inventory

| Module | Route(s) | User value | Inputs |
|---|---|---|---|
| Paper-at-a-glance | `/` | Quick orientation | contribution cards |
| Anomaly Type Explorer | `/problem-space` | Understand anomaly categories visually | Fig. 1 + Table 1 |
| Industry Scenario Tabs | `/applications` | Compare deployment contexts | Sec. III subsections |
| Classical vs Deep comparison | `/classical-limitations` | Explain motivation for model shift | Sec. IV |
| Taxonomy Explorer | `/taxonomy` | Filter model families and scoring styles | Fig. 5, Tables 2-3 |
| Mechanism Deep Dives | `/taxonomy` | Teach graph attention / dilated RNN / anomaly score logic | Fig. 6-8 |
| Dataset Selector | `/benchmarks` | Compare evidence by benchmark | Table 4 |
| Benchmark Table Viewer | `/benchmarks` | Sort/filter reported results | Table 6 |
| Decision Wizard | `/guidelines` | Convert paper guidance into an actionable path | Fig. 11 + Sec. VII |
| Threshold Tradeoff Slider | `/guidelines` | Explain recall/false-alarm tradeoff | Sec. VI–VII |
| Figure & Table Atlas | `/figures` | Reuse visuals coherently | Fig. 1-11, Tables 1-6 |
| Glossary Lookup | `/glossary` | Fast term decoding | cross-page terms |

## Figure usage plan

| Paper visual | Use on site | Placement plan | Notes |
|---|---|---|---|
| Fig. 1 Anomaly types | `/problem-space` hero | Large annotated visual | Best opening explanatory figure |
| Table 1 anomaly classification | `/problem-space` secondary | Convert to compact definition table | Pair with Fig. 1 |
| Fig. 2 equipment examples | `/applications` manufacturing section | Tabbed image with callouts | Good for concrete industrial grounding |
| Fig. 3 smart energy system | `/applications` energy section | Full-width contextual figure | Shows monitoring/control loop |
| Fig. 4 MapReduce flowchart | `/classical-limitations` | Supporting visual | Use to explain old pipeline mindset |
| Fig. 5 DL taxonomy | `/taxonomy` hero | Primary central visual | Make clickable overlays if possible |
| Table 2 inter-correlation | `/taxonomy` | Interactive matrix | Filter by variable-relationship handling |
| Fig. 6 graph attention layer | `/taxonomy#inter-correlation` | Mechanism explainer card | Link to GNN-family models |
| Fig. 7 dilated RNN | `/taxonomy#temporal-context` | Mechanism explainer card | Link to long-context modeling |
| Table 3 temporal context | `/taxonomy` | Comparison matrix | Pair with Fig. 7 |
| Fig. 8 anomaly criteria | `/taxonomy#scores` | 3-panel explainer | reconstruction/prediction/dissimilarity |
| Table 4 datasets | `/benchmarks` | Data summary table | Keep exact dataset fields |
| Table 5 hyperparameters | `/benchmarks` advanced | Collapsible appendix block | Useful for advanced readers only |
| Table 6 benchmark results | `/benchmarks` main | Sortable table | Primary evidence artifact |
| Fig. 9 temporal dependency results | `/benchmarks` findings | Highlight card | Shows value of temporal modeling |
| Fig. 10 dimensionality effect | `/benchmarks` findings | Highlight card | Explains WADI difficulty |
| Fig. 11 strategies | `/guidelines` hero | Decision framework visual | Backbone for wizard |

## Suggested page components for implementation

### Reusable components
- `PaperHero`
- `SectionAnchorNav`
- `ModelFamilyCard`
- `DatasetBadge`
- `FigureCard`
- `ComparisonMatrix`
- `DecisionWizard`
- `GlossaryDrawer`

### Data structures to prepare
- `paperMetadata`
- `routeSections`
- `modelFamilies`
- `datasets`
- `benchmarkRows`
- `figureRegistry`
- `glossaryTerms`
- `guidelineRules`

## Content extraction priorities for leader integration
1. Capture exact captions for Fig. 1–11 and Table 1–6.
2. Normalize model family names and benchmark rows into JSON-friendly tables.
3. Extract short summaries per major section (I–VII) for each route.
4. If image mapping is needed, map extracted assets in `extracted/pdf_images/` to figure numbers before frontend integration.

## Minimal build order
1. `/` landing page
2. `/taxonomy`
3. `/benchmarks`
4. `/guidelines`
5. `/applications`
6. `/problem-space`
7. `/figures`
8. `/glossary`
9. `/about-paper`

## Notes for integration
- The paper is a review/survey, so the site should foreground **comparison and decision support**, not only paper summary.
- The site will work best if figures are used as navigation anchors rather than passive decorations.
- Benchmark and guideline pages should be treated as the most interactive destinations because they convert the paper into an explorable study tool.
