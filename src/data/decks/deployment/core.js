// Core MLOps/deployment concepts — the original set, kept verbatim so cards already
// imported into the sheet keep matching on their question text.

export default [
  {
    front: 'Training/serving skew',
    back: 'The model sees differently-computed features in production than it did in training, so live performance silently falls short of offline metrics.\n\nCommon causes: features computed by separate code paths (Spark for training, Java service for serving); different default/missing-value handling; time-zone or unit mismatches; a training pipeline that had access to data arriving only after the decision point.\n\nDetect: log the actual features used at serving and compare their distributions to training.\n\nFix: share ONE feature definition between both paths — the core motivation for a feature store.',
  },
  {
    front: 'Feature store — what problem does it actually solve?',
    back: 'A central system for defining, computing, storing and serving features, with an offline store (historical, for training) and an online store (low-latency, for inference).\n\nThe two real problems it solves: (1) training/serving skew, by making one definition serve both paths; (2) point-in-time correctness, by reconstructing feature values AS THEY WERE at each historical event.\n\nSecondary benefit: reuse across teams and models.\n\nGotcha: it is significant infrastructure. For one model with simple features it is overkill — the payoff comes with many models sharing features.',
  },
  {
    front: 'Point-in-time correctness',
    back: 'When building a training set, each feature must carry the value it HAD at the moment of the event — not its current value.\n\nWhy it is subtle: joining a feature table naively attaches today\'s value to a year-old event, leaking the future into training. The model learns from information that did not exist at decision time and collapses in production.\n\nExample: "customer_lifetime_value" attached to a purchase from last year already includes that purchase and everything after it.\n\nImplementation: as-of joins on event timestamps, and versioned/append-only feature tables rather than mutable ones.',
  },
  {
    front: 'Batch vs online (real-time) inference',
    back: 'Batch: precompute predictions on a schedule, store them, serve by lookup. Cheap, simple, trivially scalable, and lookup latency is microseconds.\n\nOnline: compute on request. Needed when inputs are only known at request time or freshness matters.\n\nChoose batch when: the input space is enumerable and predictions stay valid for hours (churn scores, weekly recommendations).\n\nChoose online when: inputs include real-time context (current session, search query, live pricing).\n\nHybrid is common: precompute expensive embeddings/candidates in batch, do light ranking online.',
  },
  {
    front: 'Model registry and versioning — what must be versioned?',
    back: 'Reproducibility requires versioning FOUR things together: code, data, model artefact, and environment. Versioning only the model weights is not enough to reproduce a result.\n\nA registry stores model versions with metadata: training data snapshot, hyperparameters, metrics, lineage, and stage (staging/production/archived).\n\nWhy it matters operationally: rollback needs the exact previous artefact, and incident investigation needs to know precisely what was serving at a given time.\n\nGotcha: "we can just retrain it" is not reproducibility — nondeterminism in sampling, GPU ops and library versions means you will not get the same model back.',
  },
  {
    front: 'Shadow deployment',
    back: 'Run the new model alongside the current one on real production traffic, log its predictions, but DO NOT serve them to users.\n\nWhat it validates: latency and resource use under real load, absence of crashes on real inputs, and how prediction distributions compare to the incumbent.\n\nWhat it CANNOT validate: business impact — nobody sees the outputs, so there is no feedback on whether the new model would have changed user behaviour.\n\nUse it as the safety gate before a canary, not as a substitute for an A/B test.\n\nCost: doubles inference compute for the shadow period.',
  },
  {
    front: 'Canary release vs blue-green vs A/B test',
    back: 'Canary: route a small share of traffic (1-5%) to the new version, watch health metrics, ramp up gradually. Optimised for LIMITING BLAST RADIUS.\n\nBlue-green: two full environments; switch all traffic at once. Instant rollback, but doubles infrastructure and exposes everyone simultaneously.\n\nA/B test: randomised assignment with statistical analysis. Optimised for MEASURING EFFECT, not for safety.\n\nKey distinction that interviewers probe: canarying answers "is it broken?" while A/B testing answers "is it better?" They serve different purposes and mature systems use both in sequence.',
  },
  {
    front: 'Data drift vs concept drift — and why the difference matters',
    back: 'Data (covariate) drift: the input distribution P(X) changes. Concept drift: the relationship P(Y|X) changes.\n\nWhy the distinction is operationally critical: data drift may be harmless — if the model handles the new region well, accuracy is fine. Concept drift ALWAYS degrades the model, because what it learned is now wrong.\n\nConsequence: drift alerts on inputs are a leading indicator, not proof of damage. Alerting on every input shift produces alert fatigue.\n\nDetect: PSI or KS tests on features for data drift; performance monitoring against delayed labels for concept drift.',
  },
  {
    front: 'Population Stability Index (PSI) and KS test for drift',
    back: 'PSI = Σ (actual% − expected%) · ln(actual%/expected%) over bins.\n\nRules of thumb: PSI < 0.1 no meaningful shift; 0.1-0.25 moderate, investigate; > 0.25 significant shift.\n\nKS test: max distance between two empirical CDFs. Good for continuous features, but with large n it flags statistically significant yet practically irrelevant differences — so use effect size, not just the p-value.\n\nPractical notes: monitor the PREDICTION distribution too, since it aggregates all input drift into one signal. Watch categorical features for new unseen categories, a common silent breakage.',
  },
  {
    front: 'Ground truth delay and the feedback loop in monitoring',
    back: 'Labels usually arrive long after predictions — days for conversions, months for loan defaults, sometimes never.\n\nConsequence: you cannot monitor accuracy in real time, so you need PROXY signals in the meantime: input drift, prediction drift, and business KPIs.\n\nWorse: for many systems the label depends on the model\'s own action. If you decline a loan you never learn whether it would have defaulted — so your training data only ever covers approvals.\n\nMitigate: reserve a small randomised holdout that bypasses the model, giving unbiased ground truth. It costs a little revenue and is often the only path to unbiased evaluation.',
  },
  {
    front: 'Retraining strategy — cadence vs trigger',
    back: 'Scheduled: retrain on a fixed cadence. Simple and predictable, but arbitrary — it retrains when nothing changed and lags when something did.\n\nTriggered: retrain on drift detection or a performance drop. Responsive, but needs reliable monitoring and can thrash.\n\nDesign questions that matter more than the schedule: what training window (all history vs recent only)? Warm start or from scratch? Who approves promotion? Is there an automatic rollback if the new model underperforms?\n\nGotcha: automated retraining on contaminated data will faithfully automate the contamination. Always gate on validation against a trusted holdout.',
  },
  {
    front: 'Latency budget: p50 vs p95 vs p99',
    back: 'Always measure percentiles, never the mean — latency distributions are right-skewed, so the mean hides the tail that users actually feel.\n\nWhy p99 dominates design: if a page makes 10 backend calls, the chance that at least one hits the p99 tail is roughly 1 − 0.99¹⁰ ≈ 10%. Tail latency COMPOUNDS across a fan-out. This is why tail latency, not average latency, sets the user experience.\n\nBudget breakdown: feature fetch + model compute + network + serialisation.\n\nLevers: caching, smaller/quantised models, batching, and cutting feature-store round trips.',
  },
  {
    front: 'Dynamic batching for inference',
    back: 'Queue incoming requests briefly and run them as one batch to exploit GPU parallelism.\n\nThe trade-off: throughput up, per-request latency up (each request waits for the batch to fill or the timeout to expire). Tuned by max batch size and max wait time.\n\nWhy it works: GPUs are heavily underutilised on batch size 1 — the kernel launch and memory transfer dominate, so a batch of 32 often costs barely more wall-clock time than a batch of 1.\n\nWhen NOT to use it: strict low-latency paths where added queueing delay breaks the budget, or genuinely low traffic where batches never fill.',
  },
  {
    front: 'Quantization',
    back: 'Represent weights/activations in lower precision — FP32 → FP16/BF16 → INT8 → INT4.\n\nGains: memory scales down roughly linearly, and lower-precision arithmetic is faster on supporting hardware. INT8 typically gives ~4x smaller models with minimal accuracy loss.\n\nPost-training quantization: fast, no retraining, small accuracy drop. Quantization-aware training: simulates quantization during training, recovering most of the loss — needed for aggressive bit widths.\n\nGotcha: accuracy loss is uneven — outlier activations are what break naive quantization, which is why per-channel scales and outlier-aware schemes exist.',
  },
  {
    front: 'Knowledge distillation and pruning',
    back: 'Distillation: train a small "student" to match a large "teacher\'s" outputs. Crucially it matches the SOFT probability distribution, not just hard labels — the relative probabilities of wrong classes carry "dark knowledge" about similarity structure, which is why the student beats one trained on labels alone.\n\nPruning: remove weights or whole structures. Unstructured pruning gives high sparsity but needs special hardware to pay off; structured pruning (whole channels/heads) yields real speedups on ordinary hardware.\n\nUse together with quantization — they compound.',
  },
  {
    front: 'Caching in ML serving — what and where',
    back: 'Layers: prediction cache (same input → same output), feature cache (avoid repeated store lookups), and embedding cache (hot items kept in memory).\n\nWhen a prediction cache works: repeated identical inputs and outputs stable over the TTL. It fails when inputs include a timestamp or session context, since the hit rate collapses.\n\nCritical gotcha: a cache must be INVALIDATED ON MODEL DEPLOY, or you serve the old model\'s predictions after shipping a new one — a genuinely common and confusing production bug.\n\nAlso watch: cache stampede on expiry, and stale features producing inconsistent decisions.',
  },
  {
    front: 'Graceful degradation and fallbacks',
    back: 'When the model or its dependencies fail, the product must still work.\n\nFallback ladder, in order: full model → simpler/cached model → heuristic or popularity baseline → static default. Never a 500 error.\n\nDesign requirements: timeouts on every dependency (especially feature fetches), circuit breakers to stop hammering a failing service, and defaults for missing features that the model was actually trained to handle.\n\nGotcha: silent fallbacks are dangerous — if you do not ALERT when the fallback engages, you can serve the popularity baseline for weeks while metrics quietly sag and nobody notices.',
  },
  {
    front: 'CI/CD for ML — how it differs from software CI/CD',
    back: 'Ordinary CI/CD tests code. ML pipelines must also validate DATA and MODEL behaviour, because the code can be correct while the model is broken.\n\nAdditional gates: schema and data-quality checks, training reproducibility, model performance above a threshold on a trusted holdout, per-SEGMENT performance (to catch regressions hidden by aggregates), fairness/bias checks, and latency/size limits.\n\nThe deeper difference: the artefact depends on data that changes independently of any commit — so a pipeline can start producing worse models with zero code changes. Continuous training needs continuous validation.',
  },
  {
    front: 'Rollback strategy for models',
    back: 'Requirements: the previous model artefact retained and immediately loadable, automated health checks that can trigger rollback, and feature-pipeline compatibility with the old version.\n\nThe hard part people miss: if the new model changed the FEATURE SCHEMA, rolling back the model alone breaks — you must roll back the feature pipeline too. Model and features must be versioned and rolled back TOGETHER.\n\nAlso: caches must be invalidated on rollback, and any downstream system that stored the new model\'s outputs may need reprocessing.\n\nRehearse it — an untested rollback path is not a rollback path.',
  },
  {
    front: 'Monitoring an ML system: what to actually alert on',
    back: 'Four layers: (1) SYSTEM — latency p99, error rate, throughput, saturation. (2) DATA — schema violations, null rates, unseen categories, feature drift. (3) MODEL — prediction distribution shift, confidence distribution, and accuracy once labels land. (4) BUSINESS — the KPI the model exists to move.\n\nAlerting discipline: page on system and business metrics; make drift a ticket, not a page, since drift is noisy and usually not urgent.\n\nMost valuable single signal: prediction distribution shift — it is available immediately, requires no labels, and aggregates every upstream problem into one number.',
  },
  {
    front: 'Model explainability in production: SHAP and LIME',
    back: 'SHAP: attributes a prediction to features using Shapley values from cooperative game theory — the unique attribution satisfying efficiency, symmetry and additivity. TreeSHAP computes it exactly and fast for tree ensembles.\n\nLIME: fits a simple local surrogate around one prediction. Faster but less stable — repeated runs can give different explanations.\n\nProduction uses: regulatory requirements (adverse action notices), debugging, and trust.\n\nGotcha: SHAP shows what the MODEL used, not what CAUSES the outcome. With correlated features, attribution splits arbitrarily among them. It is not causal evidence.',
  },
  {
    front: 'Reproducibility: sources of nondeterminism',
    back: 'Sources: random seeds (init, shuffling, dropout, augmentation), GPU non-determinism (atomic float ops reduce in nondeterministic order), library and driver versions, data ordering, and parallel/distributed reduction order.\n\nControls: set seeds for every RNG (Python, NumPy, framework), enable deterministic algorithm flags, pin all dependency versions, containerise, and snapshot/version the training data.\n\nCost: deterministic GPU kernels can be meaningfully slower — a real trade-off.\n\nWhy it matters: without reproducibility you cannot attribute a metric change to your code change rather than to noise.',
  },
  {
    front: 'Cost per inference — and where the money actually goes',
    back: 'Levers: model size and precision, hardware choice, batch size, cache hit rate, and autoscaling policy.\n\nCPU vs GPU: GPUs win on large batches and big models; for small models at low QPS, CPU is often cheaper because the GPU sits idle. Idle GPU time is the usual source of waste.\n\nBig structural lever: move work from online to BATCH wherever freshness permits — precomputed predictions are orders of magnitude cheaper than per-request inference.\n\nWatch: scale-to-zero introduces cold starts (model loading can take tens of seconds), so it trades cost against tail latency.',
  },
  {
    front: 'Autoscaling ML services — why it is harder than for stateless apps',
    back: 'Complications: model loading makes cold starts slow (seconds to minutes), GPU nodes are expensive and scarce, and memory footprint is large and fixed.\n\nScaling signal: CPU utilisation is a poor proxy for a GPU service. Prefer queue depth, request concurrency, or inference latency.\n\nTactics: keep a warm pool for baseline traffic and scale burst capacity on top; pre-load models at container start with a readiness probe that only passes after the model is loaded — otherwise traffic routes to a pod that cannot serve it.\n\nGotcha: aggressive scale-down thrashes; use stabilisation windows.',
  },
  {
    front: 'Online/offline consistency checking',
    back: 'A continuous test that the production path reproduces the training path: take logged serving inputs, re-run them through the offline pipeline, and compare predictions.\n\nWhat it catches: training/serving skew, feature-pipeline bugs, version mismatches, and silent library upgrades that alter behaviour.\n\nHow to run it: sample a small fraction of live traffic, recompute offline, and alert when the mismatch rate crosses a threshold.\n\nWhy it is worth the effort: skew bugs are silent — no error is thrown, metrics degrade gradually, and without this check they are typically found weeks later, if ever.',
  },
  {
    front: 'Multi-model serving and model routing',
    back: 'Patterns: one model per user segment or region, ensembles combining several models, cascades (cheap model first, escalate uncertain cases to an expensive one), and champion/challenger for continuous evaluation.\n\nCascade economics: if a cheap model confidently handles 90% of traffic, average cost collapses while accuracy on hard cases is preserved — one of the highest-leverage serving optimisations.\n\nOperational cost: many models multiply monitoring, retraining and rollback surface area. Each variant needs its own drift tracking and its own performance baseline, which is why per-segment models are easy to launch and painful to maintain.',
  },
  {
    front: 'Containerisation and dependency pinning for ML',
    back: 'Containers package code, dependencies, system libraries and CUDA runtime so the environment is identical across dev, CI and production.\n\nML-specific pain: images are huge (multi-GB with CUDA), builds are slow, and dependency resolution is fragile — framework, CUDA, driver, and cuDNN versions form a tightly coupled matrix.\n\nPractices: pin EXACT versions (never a floating tag or unpinned pip install), use multi-stage builds to strip build tooling, and keep model weights OUT of the image so one image serves many model versions.\n\nGotcha: "latest" tags make deployments unreproducible and turn rollback into guesswork.',
  },
  {
    front: 'Preventing feedback loops in deployed models',
    back: 'The model influences the data that trains its successor, so errors and biases compound over generations of retraining.\n\nExamples: a fraud model that declines a segment never observes their good behaviour; a recommender that never surfaces an item never learns it was good; predictive policing directing patrols to areas it already flagged.\n\nDetection: monitor whether the training distribution is narrowing over time — coverage, entropy, and share of traffic to the top items.\n\nMitigations: randomised exploration holdouts, propensity logging with IPS correction, and periodically training on data from a randomised slice rather than model-selected traffic.',
  },
]
