# Korean Content Map — Deep Learning for Anomaly Detection in Time-Series Data

- Source paper: `Deep_Learning_for_Anomaly_Detection_in_Time-Series_Data_Review_Analysis_and_Guidelines.pdf`
- Goal: 한국어 기반 학습/전시용 콘텐츠 맵 작성
- Style rule: 핵심 technical term은 영어 원문을 병기하거나 그대로 유지

## 1. 한 줄 요약
이 논문은 **multivariate time-series anomaly detection**를 위한 딥러닝 기반 방법들을 산업 적용 사례, 모델 taxonomy, benchmark 비교, practitioner guideline 관점에서 정리한 리뷰 논문이다. 핵심 메시지는 **단일 best model은 없으며**, 데이터의 temporal dependency, inter-correlation, 실시간성 요구, 업데이트 방식, 노이즈 수준에 맞춰 모델/학습 전략을 고르는 것이 중요하다는 점이다.

## 2. 한국어 콘텐츠 상위 구조

### 2.1 Hero / Overview
- 제목: 시계열 이상 탐지를 위한 딥러닝 리뷰, 분석, 가이드라인
- 핵심 질문:
  - 왜 multivariate time-series anomaly detection가 어려운가?
  - classical approach는 어디까지 유효한가?
  - 어떤 deep learning model family가 어떤 조건에서 유리한가?
- 핵심 메시지:
  - labeled anomaly 부족
  - temporal dependency + variable correlation 동시 고려 필요
  - 실제 산업 현장에서는 real-time/early-warning/online-update 제약이 중요

### 2.2 Section Map
1. **Introduction**
   - 이상 탐지는 산업 자동화, IoT, quality assurance, fault diagnosis에서 핵심 문제
   - 기존 리뷰는 모델 분류에 치우쳤고, 본 논문은 **비교 실험 + 선택 가이드**까지 제공
2. **Background**
   - anomaly type: point anomaly / contextual anomaly / collective anomaly
   - time-series property: temporality / dimensionality / nonstationarity / noise
3. **Industrial Applications**
   - smart manufacturing
   - smart energy management
   - cloud computing system
   - structural health monitoring
4. **Challenges of Classical Approaches**
   - lack of labels
   - complexity of high-dimensional multivariate data
5. **Deep Learning for Anomaly Detection**
   - inter-correlation between variables
   - modeling temporal context
   - anomaly criteria
6. **Comparative Reviews**
   - benchmark datasets 비교
   - model family별 성능 해석
7. **Guidelines for Practitioners**
   - detection strategy
   - training / preprocessing choices
8. **Conclusion**
   - use-case dependent selection이 핵심

## 3. 섹션별 한국어 콘텐츠 맵

### I. Introduction
- 문제 정의: 이상 탐지는 예상치 못한 사고, 경제적 손실, 설비 고장을 사전에 포착하기 위한 핵심 기술
- 논문의 차별점:
  - 단순 model catalog가 아니라
  - **variable interrelationship**, **temporal context**, **anomaly criterion** 축으로 재분류
  - benchmark datasets 기반 비교와 practitioner guideline 제공

### II. Background
#### A. Anomalies in Time-Series Data
- **Point anomaly**: 순간적으로 정상 범위를 벗어나는 이상
- **Contextual anomaly**: 값 자체는 극단적이지 않아도 문맥상 비정상
- **Collective anomaly**: 개별 시점은 정상처럼 보여도 연속 패턴 전체가 비정상
- 전달 포인트:
  - time-series anomaly는 값 하나보다 **문맥(context)** 이 중요
  - multivariate setting에서는 변수 간 관계가 이상 여부를 바꿀 수 있음

#### B. Properties of Time-Series Data
- **Temporality**: 이전 시점 의존성
- **Dimensionality**: 고차원 센서/로그 데이터의 curse of dimensionality
- **Nonstationarity**: 시간이 지남에 따라 분포 변화
- **Noise**: 센서 노이즈와 실제 이상을 구분해야 함

### III. Industrial Applications
#### A. Smart Manufacturing
- production equipment: LSTM-AE, SAE, CNN 기반 fault detection
- infrastructure facilities: pump/HVAC/chemical/WWT anomaly detection
- logistics automation system: AGV, rail, vehicle dynamics monitoring
- 메시지: 제조 현장은 **fault detection + predictive maintenance** 니즈가 강함

#### B. Smart Energy Management
- electric power: ConvLSTM, CNN, attention 기반 plant monitoring
- treated water: SWaT/WADI 같은 cyber-physical system benchmark 중요
- manufactured gas: leak detection, cyber-attack 대응

#### C. Cloud Computing System
- server machine monitoring: OmniAnomaly 같은 GRU-VAE 계열
- network/framework monitoring: AE, graph attention network 기반 detection
- cybersecurity: intrusion/anomaly detection 중요

#### D. Structural Health Monitoring
- bridge/building/pipeline 데이터를 이미지화해 SAE/CNN으로 분류
- 전달 포인트: time-series를 image-like representation으로 변환하는 전략도 유효

### IV. Challenges of Classical Approaches
- classical methods:
  - time/frequency domain analysis
  - statistical model
  - distance-based model
  - predictive model
  - clustering model
- 한계:
  - labeled anomaly scarcity
  - multivariate/high-dimensional complexity 대응 부족
  - 변수 간 correlation 활용이 제한적

### V. Deep Learning for Anomaly Detection
#### A. Inter-Correlation Between Variables
1. **Dimensional Reduction**
   - PCA/SVD/AE/VAE 등으로 feature 압축
   - 장점: 계산량 감소
   - 단점: root cause 파악이 어려워질 수 있음
2. **2D Matrix**
   - covariance/similarity matrix 형태로 변수 관계를 직접 표현
   - 장점: multivariate relation을 joint하게 반영
   - 리스크: concept drift에 따라 불필요한 alarm 가능
3. **Graph**
   - GNN + attention으로 causal/topological relation 학습
   - 장점: strongly related sensor network에서 특히 유리
   - 추가 가치: root-cause identification에 도움
4. **Others**
   - raw data 직접 사용 또는 multivariate Gaussian distribution 활용

#### B. Modeling Temporal Context
1. **RNN / LSTM / GRU / Dilated RNN**
   - long-term dependency modeling 강점
   - prediction 기반 또는 reconstruction 기반 모두 가능
2. **CNN / TCN**
   - short-term pattern 학습에 강함
   - TCN은 causal convolution + long receptive field 제공
3. **Hybrid**
   - ConvLSTM 등으로 spatial + temporal 동시 처리
4. **Attention / Transformer**
   - self-attention으로 long-range dependency와 parallel processing 확보
5. **HTM and Others**
   - streaming data에 대한 continual/online 특성 강조

#### C. Anomaly Criteria
- **Reconstruction error**
  - AE / VAE / GAN / Transformer 계열에서 자주 사용
- **Prediction error**
  - 미래 값 또는 정상 여부 예측 실패를 anomaly score로 사용
  - early warning에 적합
- **Dissimilarity**
  - cluster/distribution에서 얼마나 멀리 떨어지는지 측정
  - cosine similarity, Mahalanobis distance 등 활용
- 전달 포인트:
  - anomaly score는 모델 구조만큼이나 중요
  - thresholding 전략은 실무 성능을 크게 좌우

## 4. 핵심 Dataset Map

| Dataset | 도메인 | 논문 설명 핵심 | 콘텐츠에서 강조할 점 |
|---|---|---|---|
| **SWaT** (Secure Water Treatment) | water treatment cyber-physical system | 11일 수집, 마지막 4일에 36 attacks 포함 | industrial control system, 공격 시나리오, benchmark 대표성 |
| **WADI** (Water Distribution) | water distribution pipelines | 16일 수집, 14일 normal + 2일 attack | 고차원 multivariate setting, sensor/actuator/network traffic 동시 포함 |
| **MSL** (Mars Science Laboratory Rover) | spacecraft/rover telemetry | train/test 분리, test anomaly labeled | 산업 외 복잡 시스템 generalization 사례 |

### Dataset 해석 포인트
- SWaT/WADI는 **cyber-physical security + industrial sensor network** 성격이 강함
- WADI는 차원이 크고 복잡해 many models의 성능이 전반적으로 떨어짐
- MSL은 aerospace telemetry benchmark로 temporal modeling 성능 비교에 유리

## 5. 핵심 Model Family Map

| Model family | 대표 예시 | 강점 | 약점/주의 |
|---|---|---|---|
| **AE** | DAGMM, MSCRED, OmniAnomaly(구성상 AE 계열로 함께 비교됨) | reconstruction 기반 이상 탐지에 직관적 | temporal dependency 반영이 약하면 성능 저하 |
| **VAE** | LSTM-VAE, USAD | 확률적 latent modeling | latent temporal dependency를 충분히 못 담으면 한계 |
| **GAN** | MAD-GAN | 강한 generative modeling | adversarial training instability |
| **RNN family** | THOC, LSTM/GRU 기반 모델 | long-term temporal dependency modeling | sequential computation으로 parallelization 제약 |
| **CNN/TCN** | MSCRED, TCN 계열 | short-term/local pattern + 병렬 처리 | 매우 긴 dependency 이해는 제한될 수 있음 |
| **Transformer / Attention** | GTA | long-range dependency + parallel processing | 데이터/구조 설계가 중요 |
| **GNN** | GTA, GDN | 변수 간 graph relation 학습, root-cause 친화적 | graph construction quality에 민감 |
| **HTM / Others** | HTM | streaming/online adaptation 관점에서 흥미로움 | 최신 deep learning mainline과는 결이 다름 |

## 6. Comparative Review 핵심 해석
- 논문 메시지:
  - **one-size-fits-all method는 없다**
  - temporal dependency를 반영한 모델이 non-temporal baseline보다 대체로 우수
  - Transformer 계열은 긴 시퀀스와 병렬 처리에서 장점
  - WADI처럼 고차원 데이터에서는 단순 reconstruction 계열이 불리할 수 있음
  - GNN 계열은 sensor/actuator 간 inter-correlation이 강한 환경에서 특히 강점

### 해석 포인트 요약
1. **Temporal dependency modeling은 필수에 가깝다**
2. **긴 시퀀스 처리 효율은 Transformer의 장점**
3. **고차원 데이터에서는 모델 구조보다 feature relation modeling이 더 중요할 수 있다**
4. **강한 attribute dependency가 있으면 graph structure learning이 유리하다**

## 7. Practitioner Guideline Map

### A. Detection Strategies
#### 1) Real-Time vs. Early Warning
- **Real-Time**
  - 즉시 탐지 필요
  - manufacturing, online business, CPS에 적합
  - GRU/CNN reconstruction 계열이 실시간 처리에 자주 언급됨
- **Early Warning**
  - 실제 고장 전 징후 탐지
  - predictive maintenance에 중요
  - LSTM/HTM 기반 prediction approaches가 자주 사용됨
- 콘텐츠 메시지:
  - false alarm cost와 missed anomaly cost를 같이 봐야 함

#### 2) Sliding Window vs. Incremental Update
- **Sliding Window**
  - CNN/TCN 계열과 잘 맞음
  - window size 선택이 핵심 hyper-parameter
- **Incremental Update**
  - streaming environment에 유리
  - autoregressive RNN 계열이 자연스럽게 지원
- 콘텐츠 메시지:
  - 메모리/연산량/지연시간 요구가 모델 선택을 좌우함

### B. Training and Preprocessing Techniques
#### 1) Loss Function
- adversarial loss
- reconstruction loss
- prediction loss
- negative log-likelihood (NLL)
- VAE의 ELBO

#### 2) Batch Learning vs. Online Update
- batch learning은 stationary assumption에 가까움
- online update는 nonstationarity 대응에 유리하지만 deep learning에서는 드묾
- continual learning은 catastrophic forgetting 문제가 있음

#### 3) Denoising
- smoothing
- transformation (Wavelet / FFT)
- estimation (Kalman filter)
- denoising autoencoder

## 8. Study-Site용 한국어 모듈 제안
- **모듈 1: 문제 정의** — 왜 time-series anomaly detection가 어려운가
- **모듈 2: anomaly taxonomy** — point/contextual/collective anomaly
- **모듈 3: 산업 사례** — manufacturing / energy / cloud / SHM
- **모듈 4: model taxonomy** — AE/VAE/GAN/RNN/CNN/Transformer/GNN/HTM
- **모듈 5: benchmark datasets** — SWaT / WADI / MSL
- **모듈 6: performance interpretation** — temporal dependency, dimension, inter-correlation
- **모듈 7: practitioner guidelines** — real-time vs early warning, window vs incremental, denoising

## 9. 반드시 보존할 Technical Terms
- anomaly detection
- multivariate time series
- point anomaly / contextual anomaly / collective anomaly
- temporal dependency
- inter-correlation between variables
- reconstruction error / prediction error / dissimilarity
- autoencoder (AE)
- variational autoencoder (VAE)
- generative adversarial network (GAN)
- recurrent neural network (RNN)
- long short-term memory (LSTM)
- gated recurrent unit (GRU)
- temporal convolutional network (TCN)
- Transformer
- graph neural network (GNN)
- graph attention network
- online update
- nonstationarity
- denoising
- predictive maintenance
- cyber-physical system (CPS)

## 10. 리더 통합 시 바로 쓸 수 있는 요약 문안
이 논문은 산업용 multivariate time-series anomaly detection 문제를 대상으로, 데이터의 **temporal dependency** 와 **inter-correlation between variables** 를 어떻게 모델링하는지가 성능을 좌우한다고 정리한다. 비교 실험에서는 SWaT, WADI, MSL benchmark를 사용해 AE/VAE/GAN/RNN/Transformer/GNN 계열을 비교했으며, 결론적으로 단일 최고 모델은 없고, **실시간성·데이터 차원·변수 관계·업데이트 방식** 에 맞춰 모델을 선택해야 한다는 practitioner guideline을 제시한다.
