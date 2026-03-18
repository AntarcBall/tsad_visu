window.STUDY_DATA = {
  routeOrder: [
    '/',
    '/background/',
    '/classical-limitations/',
    '/applications/',
    '/methods/',
    '/benchmarks/',
    '/guidelines/',
    '/figures/',
    '/glossary/',
    '/about-paper/',
    '/paper-map/',
    '/playground/'
  ],
  routeLabels: {
    '/': 'Overview',
    '/background/': 'Background',
    '/classical-limitations/': 'Classical Limits',
    '/applications/': 'Applications',
    '/methods/': 'Methods',
    '/benchmarks/': 'Benchmarks',
    '/guidelines/': 'Guidelines',
    '/figures/': 'Figures',
    '/glossary/': 'Glossary',
    '/about-paper/': 'About Paper',
    '/paper-map/': 'Paper Map',
    '/playground/': 'Playground'
  },
  anomalyTabs: [
    {
      id: 'point',
      title: 'Point anomaly',
      image: '/assets/images/paper/anomaly-wave-1.jpg',
      summary: '정상 범위를 갑자기 벗어나는 단일 시점/짧은 구간의 이상입니다. 센서 오류나 갑작스러운 abnormal operation에서 자주 등장합니다.',
      note: 'Paper 포인트: UCL/LCL 같은 control limit 방식으로 직관적으로 다루기 쉽지만, temporal context는 놓칠 수 있습니다.'
    },
    {
      id: 'contextual',
      title: 'Contextual anomaly',
      image: '/assets/images/paper/anomaly-wave-2.jpg',
      summary: '수치 자체는 평범해 보여도 주어진 context에서 부자연스러운 패턴입니다. 계절성, phase, regime change와 함께 읽어야 합니다.',
      note: 'Paper 포인트: 단순 threshold로는 잘 안 잡히고 temporal context modeling이 중요합니다.'
    },
    {
      id: 'collective',
      title: 'Collective anomaly',
      image: '/assets/images/paper/anomaly-wave-3.jpg',
      summary: '개별 포인트는 정상처럼 보여도 연속된 segment 전체가 비정상인 경우입니다. sequence-level reasoning이 핵심입니다.',
      note: 'Paper 포인트: sliding window, reconstruction error, prediction error의 설계가 탐지 성능을 크게 좌우합니다.'
    }
  ],
  models: [
    {
      family: 'AE',
      name: 'DAGMM',
      slug: 'dagmm',
      route: '/methods/dagmm/',
      interCorrelation: 'dimensional_reduction',
      temporal: 'none',
      criterion: 'dissimilarity',
      strengths: ['비교적 단순한 pipeline', 'distribution-based scoring'],
      cautions: ['temporal dependency 직접 반영이 약함'],
      bestFor: '빠른 baseline과 비시계열적 패턴 요약',
      simulatorRoute: '/methods/dagmm/',
      simulatorLabel: 'DAGMM simulator 열기'
    },
    {
      family: 'AE',
      name: 'MSCRED',
      slug: 'mscred',
      route: '/methods/mscred/',
      interCorrelation: 'matrix',
      temporal: 'hybrid',
      criterion: 'reconstruction',
      strengths: ['2D matrix 기반 inter-correlation', 'ConvLSTM으로 spatiotemporal modeling'],
      cautions: ['high-dimensional data에서 계산량 증가'],
      bestFor: '센서 간 관계가 강한 multivariate setting',
      simulatorRoute: '/methods/mscred/',
      simulatorLabel: 'MSCRED simulator 열기'
    },
    {
      family: 'VAE',
      name: 'OmniAnomaly',
      slug: 'omnianomaly',
      route: '/methods/omnianomaly/',
      interCorrelation: 'raw',
      temporal: 'rnn',
      criterion: 'reconstruction',
      strengths: ['stochastic latent dynamics', 'temporal dependency 반영'],
      cautions: ['threshold tuning 중요'],
      bestFor: 'uncertainty와 stochasticity가 중요한 streaming anomaly detection',
      simulatorRoute: '/methods/omnianomaly/',
      simulatorLabel: 'OmniAnomaly simulator 열기'
    },
    {
      family: 'VAE',
      name: 'USAD',
      slug: 'usad',
      route: '/methods/usad/',
      interCorrelation: 'raw',
      temporal: 'none',
      criterion: 'reconstruction',
      strengths: ['unsupervised reconstruction setup', '구현 단순성'],
      cautions: ['장기 temporal dependency 반영은 약함'],
      bestFor: 'clean baseline과 reconstruction-centric workflow',
      simulatorRoute: '/methods/usad/',
      simulatorLabel: 'USAD simulator 열기'
    },
    {
      family: 'GAN',
      name: 'MAD-GAN',
      slug: 'mad-gan',
      route: '/methods/mad-gan/',
      interCorrelation: 'raw',
      temporal: 'rnn',
      criterion: 'reconstruction',
      strengths: ['GAN 기반 sequence generation', 'temporal context 사용'],
      cautions: ['훈련 안정성 관리 필요'],
      bestFor: 'sequence realism과 adversarial reconstruction이 필요한 경우',
      simulatorRoute: '/methods/mad-gan/',
      simulatorLabel: 'MAD-GAN simulator 열기'
    },
    {
      family: 'RNN',
      name: 'THOC',
      slug: 'thoc',
      route: '/methods/thoc/',
      interCorrelation: 'raw',
      temporal: 'rnn',
      criterion: 'dissimilarity',
      strengths: ['dilated RNN으로 long/short-term dependency 동시 포착', 'deep SVDD류 scoring'],
      cautions: ['parallelization 제약'],
      bestFor: '긴 시퀀스와 hierarchical temporal pattern',
      simulatorRoute: '/methods/thoc/',
      simulatorLabel: 'THOC simulator 열기'
    },
    {
      family: 'Transformer/GNN',
      name: 'GTA',
      slug: 'gta',
      route: '/methods/gta/',
      interCorrelation: 'graph',
      temporal: 'attention',
      criterion: 'reconstruction',
      strengths: ['self-attention 기반 장거리 dependency', 'graph attention으로 attribute relation 반영'],
      cautions: ['모델 복잡도와 compute cost 상승'],
      bestFor: 'long sequence + attribute relation이 모두 중요한 상황',
      simulatorRoute: '/methods/gta/',
      simulatorLabel: 'GTA simulator 열기'
    },
    {
      family: 'GNN',
      name: 'GDN',
      slug: 'gdn',
      route: '/methods/gdn/',
      interCorrelation: 'graph',
      temporal: 'none',
      criterion: 'dissimilarity',
      strengths: ['graph structure learning 강점', 'WADI 같은 high-dimensional relation에 강함'],
      cautions: ['temporal reasoning은 별도 고려 필요'],
      bestFor: 'attribute inter-correlation이 강한 industrial dataset',
      simulatorRoute: '/methods/gdn/',
      simulatorLabel: 'GDN simulator 열기'
    },
    {
      family: 'RNN/VAE',
      name: 'LSTM-VAE',
      slug: 'lstm-vae',
      route: '/methods/lstm-vae/',
      interCorrelation: 'raw',
      temporal: 'rnn',
      criterion: 'reconstruction',
      strengths: ['sequence encoder-decoder 구조', 'VAE 기반 latent regularization'],
      cautions: ['latent variable 간 temporal dependency modeling은 약할 수 있음'],
      bestFor: 'probabilistic sequence representation',
      simulatorRoute: '/methods/lstm-vae/',
      simulatorLabel: 'LSTM-VAE simulator 열기'
    }
  ],
  datasets: [
    {
      id: 'swat',
      name: 'SWaT',
      dimension: 51,
      domain: 'Secure Water Treatment',
      length: '11일',
      anomalies: '마지막 4일에 36 attacks',
      takeaway: 'benchmark에서 temporal modeling의 효과가 비교적 선명하게 드러납니다.'
    },
    {
      id: 'wadi',
      name: 'WADI',
      dimension: 112,
      domain: 'Water Distribution',
      length: '16일',
      anomalies: '2일 attack scenarios',
      takeaway: 'dimension이 매우 높아 graph-based relation modeling의 이점이 더 잘 드러납니다.'
    },
    {
      id: 'msl',
      name: 'MSL',
      dimension: 55,
      domain: 'Mars Science Laboratory Rover',
      length: 'train/test 분리',
      anomalies: 'test set labeled anomalies',
      takeaway: 'long sequence와 predictive structure를 비교하기 좋습니다.'
    }
  ],
  quiz: [
    {
      question: 'Paper의 핵심 메시지와 가장 가까운 것은?',
      choices: [
        '항상 Transformer가 최고 성능이다',
        '하나의 one-size-fits-all method는 없고, 목적과 데이터 조건에 따라 선택해야 한다',
        'AE는 anomaly detection에 적합하지 않다',
        '온라인 환경에서는 supervised learning만 사용해야 한다'
      ],
      answer: 1,
      explanation: '논문은 명시적으로 one-size-fits-all approach가 없다고 말하며, use case와 데이터 특성에 맞춘 선택을 권장합니다.'
    },
    {
      question: 'WADI에서 GNN 계열의 장점이 두드러진 이유로 paper가 강조한 것은?',
      choices: [
        '라벨 수가 많기 때문',
        '시계열 길이가 짧기 때문',
        'attribute 간 inter-correlation이 강하고 dimension이 높기 때문',
        '모든 anomaly가 point anomaly이기 때문'
      ],
      answer: 2,
      explanation: 'WADI는 dimension이 크고 센서/actuator 관계가 강해 graph structure learning이 특히 유리하다고 분석합니다.'
    },
    {
      question: 'Real-time detection에 상대적으로 잘 맞는 설명은?',
      choices: [
        '미래 breakdown을 미리 예측하는 early warning만 가능하다',
        'reconstruction-based GRU/CNN 계열이 즉시 탐지 워크플로에 자주 쓰인다',
        'point adjustment를 반드시 쓰면 된다',
        'batch learning을 금지해야 한다'
      ],
      answer: 1,
      explanation: '논문은 GRU- 및 CNN-based reconstruction 모델이 real-time anomaly detection capability를 제공한다고 정리합니다.'
    },
    {
      question: 'Anomaly criterion 세 가지 축에 포함되지 않는 것은?',
      choices: ['reconstruction error', 'prediction error', 'dissimilarity', 'data augmentation score'],
      answer: 3,
      explanation: '논문은 reconstruction error, prediction error, dissimilarity의 세 축을 제시합니다.'
    },
    {
      question: 'Point adjustment의 실무적 의미는?',
      choices: [
        'precision을 항상 올려준다',
        'contiguous anomaly segment를 더 잘 감지한 것으로 평가해 recall을 끌어올릴 수 있다',
        'online update를 끈다',
        'dataset dimension을 줄인다'
      ],
      answer: 1,
      explanation: '연속된 anomaly segment 중 일부만 잡아도 segment 전체를 detected로 간주해 recall/F1 개선에 기여할 수 있습니다.'
    }
  ],
  flashcards: [
    {
      front: '왜 multivariate time-series anomaly detection이 어려운가?',
      back: 'Temporal dependency와 variable relationship를 동시에 고려해야 하고, label scarcity까지 겹치기 때문입니다.'
    },
    {
      front: 'Graph modeling은 언제 특히 유리한가?',
      back: '센서·actuator·network traffic처럼 attribute inter-correlation이 강하고 root-cause 추적이 중요한 industrial setting에서 유리합니다.'
    },
    {
      front: 'Early warning과 Real-time의 차이는?',
      back: 'Real-time은 actual anomaly를 즉시 잡는 데 초점이 있고, Early warning은 future breakdown의 조기 징후를 감지해 preventive maintenance에 기여합니다.'
    },
    {
      front: '왜 long sequence에서 Transformer가 매력적인가?',
      back: 'Self-attention으로 all-time-step context를 병렬로 참조할 수 있어, long-range dependency를 병렬 처리와 함께 다루기 좋기 때문입니다.'
    }
  ],
  methodLab: {
    "intro": {
        "eyebrow": "Method Lab",
        "title": "모델을 눌러 보고, 점수판으로 체감하는 TSAD simulator",
        "summary": "각 simulator는 논문의 세 축(inter-correlation, temporal context, anomaly criterion)을 장난감 설정으로 단순화해 보여줍니다. 숫자는 toy score이지만, 왜 어떤 method가 특정 데이터 조건에서 강해지는지 바로 감으로 잡도록 설계했습니다."
    },
    "routes": [
        "/methods/dagmm/",
        "/methods/mscred/",
        "/methods/omnianomaly/",
        "/methods/usad/",
        "/methods/mad-gan/",
        "/methods/thoc/",
        "/methods/gta/",
        "/methods/gdn/",
        "/methods/lstm-vae/"
    ],
    "methods": [
        {
            "slug": "dagmm",
            "name": "DAGMM",
            "family": "AE",
            "route": "/methods/dagmm/",
            "heroTag": "Dimensionality reduction + GMM",
            "summary": "압축한 representation 위에서 mixture density를 읽어, 정상 cluster에서 얼마나 멀어졌는지 보는 baseline형 simulator입니다.",
            "coreQuestion": "잠깐, 이 window가 정상 cluster 밖으로 얼마나 튀었지?",
            "intuition": "autoencoder가 입력을 compact latent로 압축한 뒤 estimation network가 Gaussian mixture 위에서 정상 밀도를 읽는다고 상상하세요. 관계 정보는 직접 모델링하기보다 latent 요약에 기대는 편입니다.",
            "logic": [
                "입력 window를 latent z와 reconstruction error로 요약합니다.",
                "z + reconstruction feature를 mixture density estimator에 넣어 정상 cluster 적합도를 계산합니다.",
                "density가 낮고 reconstruction mismatch가 크면 anomaly score가 올라갑니다."
            ],
            "useCases": [
                "빠른 baseline",
                "compact feature summary",
                "distribution-based scoring 설명용"
            ],
            "strengths": [
                "구조가 비교적 단순해 설명하기 쉽다",
                "cluster 밖 샘플을 직관적으로 볼 수 있다"
            ],
            "cautions": [
                "temporal dependency를 직접 추적하지 않는다",
                "threshold를 너무 높이면 subtle drift를 놓칠 수 있다"
            ],
            "playgroundPrompt": "latent cluster에서 샘플이 얼마나 멀어지는지 보려면 relation보다 anomaly amplitude를 먼저 올려 보세요.",
            "focus": {
                "relation": 0.42,
                "temporal": 0.22,
                "criterion": 0.86,
                "threshold": 0.58,
                "baselineLatency": 0.78,
                "explainability": 0.86
            },
            "controls": {
                "recommendedWindow": 36,
                "recommendedThreshold": 0.54,
                "anomalySweetSpot": 0.62
            },
            "scoreLabels": [
                "밀도 감지력",
                "시간 문맥 반영",
                "설명 용이성",
                "실시간 민첩성"
            ]
        },
        {
            "slug": "mscred",
            "name": "MSCRED",
            "family": "AE",
            "route": "/methods/mscred/",
            "heroTag": "Signature matrix + ConvLSTM",
            "summary": "센서 간 correlation을 signature matrix로 만든 뒤 ConvLSTM이 시공간 변화를 따라가는 simulator입니다.",
            "coreQuestion": "현재 센서 관계 지도가 정상 시점과 얼마나 다르게 접히고 있지?",
            "intuition": "각 window를 sensor-to-sensor correlation image로 바꾸면, anomaly는 관계 패턴이 깨지는 장면처럼 보입니다. ConvLSTM은 이 이미지 시퀀스의 temporal drift를 붙잡는 역할입니다.",
            "logic": [
                "window마다 signature matrix를 계산해 sensor relation을 2D로 표현합니다.",
                "Conv encoder가 지역 relation pattern을 읽고 ConvLSTM이 연속 frame 변화를 추적합니다.",
                "decoder reconstruction이 무너지면 relation map 자체가 비정상이라고 판단합니다."
            ],
            "useCases": [
                "relation-heavy sensor grid",
                "multiscale correlation shift",
                "visual explanation"
            ],
            "strengths": [
                "관계 패턴을 2D로 시각화하기 좋다",
                "temporal drift와 spatial relation을 함께 본다"
            ],
            "cautions": [
                "차원이 커지면 matrix가 빠르게 무거워진다",
                "window 길이가 짧으면 signature 안정성이 떨어질 수 있다"
            ],
            "playgroundPrompt": "relation strength와 memory horizon을 함께 올리면 MSCRED의 장점이 가장 잘 보입니다.",
            "focus": {
                "relation": 0.9,
                "temporal": 0.78,
                "criterion": 0.8,
                "threshold": 0.56,
                "baselineLatency": 0.52,
                "explainability": 0.82
            },
            "controls": {
                "recommendedWindow": 48,
                "recommendedThreshold": 0.48,
                "anomalySweetSpot": 0.58
            },
            "scoreLabels": [
                "관계 지도 해상도",
                "시간 기억력",
                "설명 용이성",
                "연산 부담 대응"
            ]
        },
        {
            "slug": "omnianomaly",
            "name": "OmniAnomaly",
            "family": "VAE",
            "route": "/methods/omnianomaly/",
            "heroTag": "Stochastic latent dynamics",
            "summary": "GRU-VAE가 noisy sequence를 latent distribution으로 읽고 uncertainty까지 함께 반영하는 simulator입니다.",
            "coreQuestion": "이상인가, 아니면 uncertainty가 큰 정상 변동인가?",
            "intuition": "deterministic reconstruction만 보는 대신 latent distribution을 추적합니다. 그래서 anomaly amplitude뿐 아니라 variance spike에도 민감한 probabilistic lens를 제공합니다.",
            "logic": [
                "GRU encoder가 시계열 문맥을 latent distribution으로 압축합니다.",
                "샘플링된 latent trajectory로 decoder reconstruction과 KL regularization을 동시에 계산합니다.",
                "reconstruction mismatch와 latent uncertainty가 함께 anomaly signal이 됩니다."
            ],
            "useCases": [
                "streaming data",
                "uncertainty-aware monitoring",
                "noisy sensor environment"
            ],
            "strengths": [
                "stochasticity를 자연스럽게 표현한다",
                "temporal dependency를 latent dynamics로 읽는다"
            ],
            "cautions": [
                "threshold tuning이 민감하다",
                "noise와 anomaly를 분리하려면 calibration이 필요하다"
            ],
            "playgroundPrompt": "noise level이 높을수록 threshold calibration 점수 변화에 주목해 보세요.",
            "focus": {
                "relation": 0.5,
                "temporal": 0.82,
                "criterion": 0.84,
                "threshold": 0.74,
                "baselineLatency": 0.58,
                "explainability": 0.68
            },
            "controls": {
                "recommendedWindow": 42,
                "recommendedThreshold": 0.51,
                "anomalySweetSpot": 0.57
            },
            "scoreLabels": [
                "uncertainty 감지력",
                "시간 문맥 반영",
                "threshold 민감도",
                "스트리밍 적합성"
            ]
        },
        {
            "slug": "usad",
            "name": "USAD",
            "family": "VAE",
            "route": "/methods/usad/",
            "heroTag": "Two-decoder adversarial autoencoder",
            "summary": "두 reconstruction 관점을 번갈아 써서 정상 패턴을 더 견고하게 고정하는 lightweight simulator입니다.",
            "coreQuestion": "같은 입력을 두 decoder가 다르게 복원하면, 어디서 비정상이 새나올까?",
            "intuition": "USAD는 두 decoder의 시각 차이를 이용해 reconstruction gap을 더 분명하게 만듭니다. temporal memory는 약하지만 baseline 실험에는 빠릅니다.",
            "logic": [
                "encoder가 window를 latent로 압축합니다.",
                "decoder-1/decoder-2가 서로 다른 reconstruction pressure를 걸며 정상 manifold를 학습합니다.",
                "재복원 discrepancy가 커질수록 anomaly score를 높입니다."
            ],
            "useCases": [
                "clean baseline",
                "빠른 ablation",
                "reconstruction-centric demo"
            ],
            "strengths": [
                "구현이 단순하고 lightweight하다",
                "reconstruction gap 비교가 쉽다"
            ],
            "cautions": [
                "긴 temporal pattern은 잘 드러나지 않는다",
                "관계 구조를 직접 학습하지 않는다"
            ],
            "playgroundPrompt": "USAD는 짧은 window + 중간 threshold에서 baseline 감각을 익히기 좋습니다.",
            "focus": {
                "relation": 0.36,
                "temporal": 0.24,
                "criterion": 0.82,
                "threshold": 0.62,
                "baselineLatency": 0.84,
                "explainability": 0.84
            },
            "controls": {
                "recommendedWindow": 28,
                "recommendedThreshold": 0.5,
                "anomalySweetSpot": 0.56
            },
            "scoreLabels": [
                "재복원 대비",
                "시간 문맥 반영",
                "설명 용이성",
                "baseline 민첩성"
            ]
        },
        {
            "slug": "mad-gan",
            "name": "MAD-GAN",
            "family": "GAN",
            "route": "/methods/mad-gan/",
            "heroTag": "Adversarial sequence reconstruction",
            "summary": "generator와 discriminator가 sequence realism을 두고 겨루며 anomaly를 드러내는 simulator입니다.",
            "coreQuestion": "이 sequence는 discriminator가 보기에도 정상처럼 자연스러운가?",
            "intuition": "GAN은 reconstruction error뿐 아니라 generated sequence의 realism 자체를 따집니다. 그래서 anomaly amplitude가 작아도 pattern realism이 깨지면 반응할 수 있습니다.",
            "logic": [
                "generator가 정상 sequence manifold를 흉내 내며 window를 재생성합니다.",
                "discriminator가 진짜/가짜 sequence pattern 차이를 학습합니다.",
                "reconstruction mismatch와 adversarial signal을 함께 합쳐 anomaly score를 냅니다."
            ],
            "useCases": [
                "sequence realism",
                "adversarial reconstruction",
                "temporal pattern irregularity"
            ],
            "strengths": [
                "realism signal이 추가된다",
                "sequence-level anomaly를 설명하기 좋다"
            ],
            "cautions": [
                "학습 안정성이 낮을 수 있다",
                "threshold보다 training dynamics가 더 큰 변수일 수 있다"
            ],
            "playgroundPrompt": "anomaly amplitude보다 memory horizon을 올려 sequence realism 점수 변화를 보세요.",
            "focus": {
                "relation": 0.48,
                "temporal": 0.78,
                "criterion": 0.82,
                "threshold": 0.5,
                "baselineLatency": 0.46,
                "explainability": 0.62
            },
            "controls": {
                "recommendedWindow": 40,
                "recommendedThreshold": 0.47,
                "anomalySweetSpot": 0.53
            },
            "scoreLabels": [
                "realism 감지",
                "시간 문맥 반영",
                "threshold 안정성",
                "훈련 난이도 내성"
            ]
        },
        {
            "slug": "thoc",
            "name": "THOC",
            "family": "RNN",
            "route": "/methods/thoc/",
            "heroTag": "Dilated RNN + one-class objective",
            "summary": "hierarchical temporal memory와 one-class separation을 결합해 긴 패턴 붕괴를 잡는 simulator입니다.",
            "coreQuestion": "멀리 떨어진 dependency가 한 번에 깨질 때, 정상 hypersphere 밖으로 밀려나는가?",
            "intuition": "dilated recurrence가 짧은 패턴과 긴 패턴을 동시에 흡수하고, one-class objective가 정상 영역을 촘촘히 압축합니다. reconstruction보다 representation separation 감각이 강합니다.",
            "logic": [
                "dilated RNN stack이 여러 시간 스케일의 dependency를 순차적으로 읽습니다.",
                "hierarchical representation을 normality boundary 안에 모으도록 one-class objective를 학습합니다.",
                "boundary에서 멀어질수록 anomaly score를 높입니다."
            ],
            "useCases": [
                "long sequence",
                "hierarchical temporal pattern",
                "boundary-based scoring"
            ],
            "strengths": [
                "긴 문맥을 다층으로 압축한다",
                "representation separation이 분명하다"
            ],
            "cautions": [
                "순차 계산이라 latency가 증가할 수 있다",
                "관계 구조보다는 temporal memory에 강점이 있다"
            ],
            "playgroundPrompt": "memory horizon을 크게 올렸을 때 THOC의 score가 가장 꾸준히 오르는지 확인해 보세요.",
            "focus": {
                "relation": 0.4,
                "temporal": 0.92,
                "criterion": 0.76,
                "threshold": 0.6,
                "baselineLatency": 0.42,
                "explainability": 0.66
            },
            "controls": {
                "recommendedWindow": 64,
                "recommendedThreshold": 0.52,
                "anomalySweetSpot": 0.49
            },
            "scoreLabels": [
                "장기 문맥 포착",
                "정상 경계 분리",
                "설명 용이성",
                "실시간 부담"
            ]
        },
        {
            "slug": "gta",
            "name": "GTA",
            "family": "Transformer/GNN",
            "route": "/methods/gta/",
            "heroTag": "Graph attention over time",
            "summary": "attribute graph와 temporal attention을 함께 얹어 long-range relation drift를 읽는 simulator입니다.",
            "coreQuestion": "시간축 멀리 있는 이벤트와 현재 센서 관계를 같이 보면 anomaly가 더 선명해지는가?",
            "intuition": "attention은 먼 시점끼리 바로 연결하고, graph module은 변수 관계를 명시적으로 보여 줍니다. relation-heavy + long-range 조건에서 가장 빛납니다.",
            "logic": [
                "graph attention이 변수 간 edge importance를 동적으로 조정합니다.",
                "temporal self-attention이 긴 시간 범위의 의존성을 병렬로 끌어옵니다.",
                "relation-aware reconstruction 또는 score head가 이상 신호를 합성합니다."
            ],
            "useCases": [
                "long sequence + strong relation",
                "attribute interaction",
                "complex industrial graph"
            ],
            "strengths": [
                "관계와 장기 문맥을 동시에 잡는다",
                "병렬 attention으로 긴 맥락 비교가 쉽다"
            ],
            "cautions": [
                "복잡도와 compute cost가 높다",
                "소규모 데이터에서는 과할 수 있다"
            ],
            "playgroundPrompt": "relation strength와 memory horizon을 같이 높일수록 GTA가 왜 강한지 잘 드러납니다.",
            "focus": {
                "relation": 0.94,
                "temporal": 0.9,
                "criterion": 0.78,
                "threshold": 0.58,
                "baselineLatency": 0.36,
                "explainability": 0.64
            },
            "controls": {
                "recommendedWindow": 60,
                "recommendedThreshold": 0.49,
                "anomalySweetSpot": 0.51
            },
            "scoreLabels": [
                "관계 추론력",
                "장기 문맥 반영",
                "threshold 안정성",
                "연산 부담 관리"
            ]
        },
        {
            "slug": "gdn",
            "name": "GDN",
            "family": "GNN",
            "route": "/methods/gdn/",
            "heroTag": "Graph deviation network",
            "summary": "변수 그래프를 학습해 정상 관계에서 벗어난 node를 빠르게 찾는 simulator입니다.",
            "coreQuestion": "어느 센서 edge가 정상 graph에서 가장 크게 이탈했지?",
            "intuition": "time modeling보다 relation modeling에 무게가 있습니다. 그래서 attribute inter-correlation이 강한 산업 데이터에서 root-cause 탐색 감각이 좋습니다.",
            "logic": [
                "센서 간 dependency graph를 학습하거나 추정합니다.",
                "graph message passing으로 각 노드의 기대 상태를 계산합니다.",
                "예상 relation에서 벗어난 node/edge deviation을 anomaly signal로 사용합니다."
            ],
            "useCases": [
                "industrial relation graph",
                "root-cause hint",
                "high-dimensional sensors"
            ],
            "strengths": [
                "관계 기반 설명이 매우 직관적이다",
                "high-dimensional setting에서 강하다"
            ],
            "cautions": [
                "temporal drift가 길면 별도 보강이 필요하다",
                "graph 품질이 성능을 많이 좌우한다"
            ],
            "playgroundPrompt": "relation strength를 올렸을 때 edge deviation 힌트가 얼마나 빨리 강해지는지 보세요.",
            "focus": {
                "relation": 0.96,
                "temporal": 0.34,
                "criterion": 0.72,
                "threshold": 0.57,
                "baselineLatency": 0.72,
                "explainability": 0.88
            },
            "controls": {
                "recommendedWindow": 24,
                "recommendedThreshold": 0.52,
                "anomalySweetSpot": 0.46
            },
            "scoreLabels": [
                "관계 추론력",
                "시간 문맥 반영",
                "root-cause 설명력",
                "실시간 민첩성"
            ]
        },
        {
            "slug": "lstm-vae",
            "name": "LSTM-VAE",
            "family": "RNN/VAE",
            "route": "/methods/lstm-vae/",
            "heroTag": "Sequence VAE baseline",
            "summary": "LSTM encoder-decoder와 variational latent를 결합해 sequence likelihood를 읽는 고전적 simulator입니다.",
            "coreQuestion": "이 sequence는 latent prior가 보기에 정상적인 trajectory인가?",
            "intuition": "sequence encoder-decoder에 probabilistic latent를 더해 reconstruction + likelihood 관점을 함께 얻습니다. OmniAnomaly보다 단순하지만 설명용 baseline으로 좋습니다.",
            "logic": [
                "LSTM encoder가 window를 latent distribution으로 압축합니다.",
                "latent 샘플로 decoder가 sequence를 복원합니다.",
                "reconstruction gap과 latent regularization 붕괴를 함께 anomaly score로 사용합니다."
            ],
            "useCases": [
                "probabilistic baseline",
                "sequence embedding",
                "compact demo"
            ],
            "strengths": [
                "구조가 익숙해 설명이 쉽다",
                "확률적 reconstruction 관점을 제공한다"
            ],
            "cautions": [
                "매우 긴 장기 dependency에는 한계가 있다",
                "graph relation은 직접 표현하지 않는다"
            ],
            "playgroundPrompt": "noise와 memory horizon을 동시에 조금씩 올리며 latent uncertainty가 어떻게 반응하는지 보세요.",
            "focus": {
                "relation": 0.44,
                "temporal": 0.74,
                "criterion": 0.8,
                "threshold": 0.68,
                "baselineLatency": 0.54,
                "explainability": 0.74
            },
            "controls": {
                "recommendedWindow": 44,
                "recommendedThreshold": 0.5,
                "anomalySweetSpot": 0.55
            },
            "scoreLabels": [
                "latent 안정성",
                "시간 문맥 반영",
                "설명 용이성",
                "baseline 민첩성"
            ]
        }
    ]
}
};
