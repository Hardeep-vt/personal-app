// Core MLOps/deployment concepts — the original set, kept verbatim so cards already
// imported into the sheet keep matching on their question text.

export default [
  {
    front: 'Training/serving skew',
    back: 'The model sees differently-computed features in production than it did in training, so live performance silently falls short of offline metrics.\n\nCommon causes:\n- Features computed by separate code paths (Spark for training, a Java service for serving).\n- Different default / missing-value handling.\n- Time-zone or unit mismatches.\n- A training pipeline that had access to data arriving only after the decision point.\n\nDetect:\n- Log the actual features used at serving and compare their distributions to training.\n\nFix:\n- Share ONE feature definition between both paths — the core motivation for a feature store.',
  },
  {
    front: 'Feature store — what problem does it actually solve?',
    back: 'A central system for defining, computing, storing and serving features. It has an offline store (historical, for training) and an online store (low-latency, for inference).\n\nThe two real problems it solves:\n- Training/serving skew — one definition serves both paths.\n- Point-in-time correctness — it can reconstruct feature values AS THEY WERE at each historical event.\n\nSecondary benefit:\n- Reuse of features across teams and models.\n\nGotcha:\n- It is significant infrastructure. For one model with simple features it is overkill — the payoff comes with many models sharing features.',
  },
  {
    front: 'Point-in-time correctness',
    back: 'When building a training set, each feature must carry the value it HAD at the moment of the event — not its current value.\n\nWhy it is subtle:\n- Joining a feature table naively attaches today\'s value to a year-old event, leaking the future into training. The model learns from information that did not exist at decision time and collapses in production.\n\nExample:\n- "customer_lifetime_value" attached to a purchase from last year already includes that purchase and everything after it.\n\nImplementation:\n- As-of joins on event timestamps, and versioned / append-only feature tables rather than mutable ones.',
  },
  {
    front: 'Batch vs online (real-time) inference',
    back: 'Two ways to produce predictions:\n- Batch: precompute predictions on a schedule, store them, serve by lookup. Cheap, simple, trivially scalable; lookup latency is microseconds.\n- Online: compute on request. Needed when inputs are only known at request time or freshness matters.\n\nChoose batch when:\n- The input space is enumerable and predictions stay valid for hours (churn scores, weekly recommendations).\n\nChoose online when:\n- Inputs include real-time context (current session, search query, live pricing).\n\nHybrid is common:\n- Precompute expensive embeddings / candidates in batch, do light ranking online.',
  },
  {
    front: 'Model registry and versioning — what must be versioned?',
    back: 'Reproducibility needs FOUR things versioned together: code, data, model artefact, and environment. Versioning only the model weights is not enough.\n\nWhat a registry stores:\n- Model versions plus metadata: training data snapshot, hyperparameters, metrics, lineage, and stage (staging / production / archived).\n\nWhy it matters operationally:\n- Rollback needs the exact previous artefact.\n- Incident investigation needs to know precisely what was serving at a given time.\n\nGotcha:\n- "We can just retrain it" is not reproducibility — nondeterminism in sampling, GPU ops and library versions means you will not get the same model back.',
  },
  {
    front: 'Shadow deployment',
    back: 'Run the new model alongside the current one on real production traffic, log its predictions, but DO NOT serve them to users.\n\nWhat it validates:\n- Latency and resource use under real load.\n- No crashes on real inputs.\n- How its prediction distribution compares to the incumbent.\n\nWhat it CANNOT validate:\n- Business impact — nobody sees the outputs, so there is no feedback on whether the new model would have changed user behaviour.\n\nHow to use it:\n- As the safety gate before a canary, not as a substitute for an A/B test.\n\nCost:\n- Doubles inference compute for the shadow period.',
  },
  {
    front: 'Canary release vs blue-green vs A/B test',
    back: 'Three rollout patterns that get conflated:\n- Canary: route a small share of traffic (1-5%) to the new version, watch health metrics, ramp up gradually. Optimised for LIMITING BLAST RADIUS.\n- Blue-green: two full environments; switch all traffic at once. Instant rollback, but doubles infrastructure and exposes everyone simultaneously.\n- A/B test: randomised assignment with statistical analysis. Optimised for MEASURING EFFECT, not safety.\n\nThe distinction interviewers probe:\n- Canarying answers "is it broken?"\n- A/B testing answers "is it better?"\n- Mature systems use both in sequence.',
  },
  {
    front: 'Data drift vs concept drift — and why the difference matters',
    back: 'Two kinds of change after deployment:\n- Data (covariate) drift: the input distribution P(X) changes.\n- Concept drift: the relationship P(Y|X) changes.\n\nWhy the distinction is operationally critical:\n- Data drift may be harmless — if the model handles the new region well, accuracy is fine.\n- Concept drift ALWAYS degrades the model, because what it learned is now wrong.\n\nConsequence:\n- Drift alerts on inputs are a leading indicator, not proof of damage. Alerting on every input shift produces alert fatigue.\n\nDetect:\n- PSI or KS tests on features for data drift; performance monitoring against delayed labels for concept drift.',
  },
  {
    front: 'Population Stability Index (PSI) and KS test for drift',
    back: 'Two ways to quantify how far a distribution has moved from a baseline:\n- PSI = Σ (actual% − expected%) · ln(actual% / expected%) over bins.\n- KS test: the maximum gap between two cumulative distribution curves.\n\nPSI rules of thumb:\n- < 0.1: no meaningful shift.\n- 0.1-0.25: moderate, investigate.\n- > 0.25: significant shift.\n\nGotcha:\n- KS with large n flags statistically significant but practically irrelevant differences — use the effect size, not just the p-value.\n\nPractical notes:\n- Monitor the PREDICTION distribution too — it rolls all input drift into one signal.\n- Watch categorical features for new unseen categories, a common silent breakage.',
  },
  {
    front: 'Ground truth delay and the feedback loop in monitoring',
    back: 'Labels usually arrive long after predictions — days for conversions, months for loan defaults, sometimes never.\n\nConsequence:\n- You cannot monitor accuracy in real time, so you need PROXY signals meanwhile: input drift, prediction drift, and business KPIs.\n\nWorse — the label can depend on the model\'s own action:\n- If you decline a loan you never learn whether it would have defaulted, so your training data only ever covers approvals.\n\nMitigate:\n- Reserve a small randomised holdout that bypasses the model, giving unbiased ground truth. It costs a little revenue and is often the only path to unbiased evaluation.',
  },
  {
    front: 'Retraining strategy — cadence vs trigger',
    back: 'Two ways to decide when to retrain:\n- Scheduled: retrain on a fixed cadence. Simple and predictable, but arbitrary — retrains when nothing changed, lags when something did.\n- Triggered: retrain on drift detection or a performance drop. Responsive, but needs reliable monitoring and can thrash.\n\nQuestions that matter more than the schedule:\n- What training window — all history, or recent only?\n- Warm start, or from scratch?\n- Who approves promotion?\n- Is there an automatic rollback if the new model underperforms?\n\nGotcha:\n- Automated retraining on contaminated data will faithfully automate the contamination. Always gate on validation against a trusted holdout.',
  },
  {
    front: 'Latency budget: p50 vs p95 vs p99',
    back: 'Always measure percentiles, never the mean — latency distributions are right-skewed, so the mean hides the tail users actually feel.\n\nWhy p99 dominates design:\n- If a page makes 10 backend calls, the chance at least one hits the p99 tail is roughly 1 − 0.99¹⁰ ≈ 10%. Tail latency COMPOUNDS across a fan-out.\n\nBudget breakdown:\n- Feature fetch + model compute + network + serialisation.\n\nLevers:\n- Caching, smaller / quantised models, batching, and cutting feature-store round trips.',
  },
  {
    front: 'Dynamic batching for inference',
    back: 'Queue incoming requests for a few milliseconds and run them as one batch to exploit GPU parallelism.\n\nThe trade-off:\n- Throughput up, per-request latency up (each request waits for the batch to fill or the timeout to expire).\n- Tuned by max batch size and max wait time.\n\nWhy it works:\n- GPUs are badly underused at batch size 1 — kernel launch and memory transfer dominate, so a batch of 32 often costs barely more wall-clock time than a batch of 1.\n\nWhen NOT to use it:\n- Strict low-latency paths where the added queueing delay breaks the budget.\n- Genuinely low traffic where batches never fill.',
  },
  {
    front: 'Quantization',
    back: 'Represent weights / activations in lower numeric precision: FP32 → FP16 / BF16 → INT8 → INT4.\n\nGains:\n- Memory scales down roughly linearly, and low-precision arithmetic is faster on supporting hardware. INT8 typically gives ~4× smaller models with minimal accuracy loss.\n\nTwo approaches:\n- Post-training quantization: fast, no retraining, small accuracy drop.\n- Quantization-aware training: simulates quantization during training, recovering most of the loss — needed for aggressive bit widths.\n\nGotcha:\n- Accuracy loss is uneven — outlier activations are what break naive quantization, which is why per-channel scales and outlier-aware schemes exist.',
  },
  {
    front: 'Knowledge distillation and pruning',
    back: 'Two ways to shrink a model:\n- Distillation: train a small "student" to match a large "teacher\'s" outputs. Crucially it matches the SOFT probability distribution, not just hard labels — the relative probabilities of wrong classes carry "dark knowledge" about similarity structure, which is why the student beats one trained on labels alone.\n- Pruning: remove weights or whole structures. Unstructured pruning gives high sparsity but needs special hardware to pay off; structured pruning (whole channels / heads) yields real speedups on ordinary hardware.\n\nUse together with quantization — they compound.',
  },
  {
    front: 'Caching in ML serving — what and where',
    back: 'Three cache layers:\n- Prediction cache: same input → same output.\n- Feature cache: avoid repeated feature-store lookups.\n- Embedding cache: keep hot items in memory.\n\nWhen a prediction cache works:\n- Repeated identical inputs, and outputs stable over the TTL. It fails when inputs include a timestamp or session context, since the hit rate collapses.\n\nCritical gotcha:\n- A cache must be INVALIDATED ON MODEL DEPLOY, or you serve the old model\'s predictions after shipping a new one — a genuinely common, confusing production bug.\n\nAlso watch:\n- Cache stampede on expiry, and stale features producing inconsistent decisions.',
  },
  {
    front: 'Graceful degradation and fallbacks',
    back: 'When the model or its dependencies fail, the product must still work.\n\nFallback ladder, in order:\n- Full model → simpler / cached model → heuristic or popularity baseline → static default. Never a 500 error.\n\nDesign requirements:\n- Timeouts on every dependency (especially feature fetches).\n- Circuit breakers to stop hammering a failing service.\n- Defaults for missing features that the model was actually trained to handle.\n\nGotcha:\n- Silent fallbacks are dangerous. If you do not ALERT when the fallback engages, you can serve the popularity baseline for weeks while metrics quietly sag and nobody notices.',
  },
  {
    front: 'CI/CD for ML — how it differs from software CI/CD',
    back: 'Ordinary CI/CD tests code. ML pipelines must also validate DATA and MODEL behaviour, because the code can be correct while the model is broken.\n\nAdditional gates:\n- Schema and data-quality checks.\n- Training reproducibility.\n- Model performance above a threshold on a trusted holdout.\n- Per-SEGMENT performance (to catch regressions hidden by aggregates).\n- Fairness / bias checks.\n- Latency and size limits.\n\nThe deeper difference:\n- The artefact depends on data that changes independently of any commit — so a pipeline can start producing worse models with zero code changes. Continuous training needs continuous validation.',
  },
  {
    front: 'Rollback strategy for models',
    back: 'Requirements:\n- The previous model artefact retained and immediately loadable.\n- Automated health checks that can trigger the rollback.\n- Feature-pipeline compatibility with the old version.\n\nThe hard part people miss:\n- If the new model changed the FEATURE SCHEMA, rolling back the model alone breaks — you must roll back the feature pipeline too. Model and features must be versioned and rolled back TOGETHER.\n\nAlso:\n- Caches must be invalidated on rollback.\n- Any downstream system that stored the new model\'s outputs may need reprocessing.\n\nRehearse it — an untested rollback path is not a rollback path.',
  },
  {
    front: 'Monitoring an ML system: what to actually alert on',
    back: 'Four layers:\n- SYSTEM — latency p99, error rate, throughput, saturation.\n- DATA — schema violations, null rates, unseen categories, feature drift.\n- MODEL — prediction distribution shift, confidence distribution, and accuracy once labels land.\n- BUSINESS — the KPI the model exists to move.\n\nAlerting discipline:\n- Page on system and business metrics.\n- Make drift a ticket, not a page — drift is noisy and usually not urgent.\n\nMost valuable single signal:\n- Prediction distribution shift — available immediately, needs no labels, and rolls every upstream problem into one number.',
  },
  {
    front: 'Model explainability in production: SHAP and LIME',
    back: 'Two ways to attribute a single prediction to its features:\n- SHAP: uses Shapley values from cooperative game theory — the unique attribution satisfying efficiency, symmetry and additivity. TreeSHAP computes it exactly and fast for tree ensembles.\n- LIME: fits a simple local surrogate model around one prediction. Faster but less stable — repeated runs can give different explanations.\n\nProduction uses:\n- Regulatory requirements (adverse-action notices), debugging, and trust.\n\nGotcha:\n- SHAP shows what the MODEL used, not what CAUSES the outcome. With correlated features, attribution splits arbitrarily among them. It is not causal evidence.',
  },
  {
    front: 'Reproducibility: sources of nondeterminism',
    back: 'Where two "identical" training runs diverge:\n- Random seeds (init, shuffling, dropout, augmentation).\n- GPU non-determinism — atomic float ops reduce in a nondeterministic order.\n- Library and driver versions.\n- Data ordering.\n- Parallel / distributed reduction order.\n\nControls:\n- Set seeds for every RNG (Python, NumPy, framework), enable deterministic-algorithm flags, pin all dependency versions, containerise, and snapshot / version the training data.\n\nCost:\n- Deterministic GPU kernels can be meaningfully slower — a real trade-off.\n\nWhy it matters:\n- Without reproducibility you cannot attribute a metric change to your code change rather than to noise.',
  },
  {
    front: 'Cost per inference — and where the money actually goes',
    back: 'Levers:\n- Model size and precision, hardware choice, batch size, cache hit rate, and autoscaling policy.\n\nCPU vs GPU:\n- GPUs win on large batches and big models.\n- For small models at low QPS, CPU is often cheaper because the GPU sits idle — idle GPU time is the usual source of waste.\n\nBig structural lever:\n- Move work from online to BATCH wherever freshness permits — precomputed predictions are orders of magnitude cheaper than per-request inference.\n\nWatch:\n- Scale-to-zero introduces cold starts (model loading can take tens of seconds), trading cost against tail latency.',
  },
  {
    front: 'Autoscaling ML services — why it is harder than for stateless apps',
    back: 'Complications:\n- Model loading makes cold starts slow (seconds to minutes).\n- GPU nodes are expensive and scarce.\n- Memory footprint is large and fixed.\n\nScaling signal:\n- CPU utilisation is a poor proxy for a GPU service. Prefer queue depth, request concurrency, or inference latency.\n\nTactics:\n- Keep a warm pool for baseline traffic and scale burst capacity on top.\n- Pre-load models at container start, with a readiness probe that only passes AFTER the model is loaded — otherwise traffic routes to a pod that cannot serve it.\n\nGotcha:\n- Aggressive scale-down thrashes; use stabilisation windows.',
  },
  {
    front: 'Online/offline consistency checking',
    back: 'A continuous test that the production path reproduces the training path: take logged serving inputs, re-run them through the offline pipeline, and compare predictions.\n\nWhat it catches:\n- Training/serving skew, feature-pipeline bugs, version mismatches, and silent library upgrades that alter behaviour.\n\nHow to run it:\n- Sample a small fraction of live traffic, recompute offline, and alert when the mismatch rate crosses a threshold.\n\nWhy it is worth the effort:\n- Skew bugs are silent — no error is thrown, metrics degrade gradually, and without this check they are typically found weeks later, if ever.',
  },
  {
    front: 'Multi-model serving and model routing',
    back: 'Patterns:\n- One model per user segment or region.\n- Ensembles combining several models.\n- Cascades: a cheap model first, escalating uncertain cases to an expensive one.\n- Champion / challenger for continuous evaluation.\n\nCascade economics:\n- If a cheap model confidently handles 90% of traffic, average cost collapses while accuracy on hard cases is preserved — one of the highest-leverage serving optimisations.\n\nOperational cost:\n- Many models multiply the monitoring, retraining and rollback surface. Each variant needs its own drift tracking and performance baseline — which is why per-segment models are easy to launch and painful to maintain.',
  },
  {
    front: 'Containerisation and dependency pinning for ML',
    back: 'Containers package code, dependencies, system libraries and CUDA runtime so the environment is identical across dev, CI and production.\n\nML-specific pain:\n- Images are huge (multi-GB with CUDA), builds are slow, and dependency resolution is fragile — framework, CUDA, driver and cuDNN versions form a tightly coupled matrix.\n\nPractices:\n- Pin EXACT versions (never a floating tag or unpinned pip install).\n- Use multi-stage builds to strip build tooling.\n- Keep model weights OUT of the image so one image serves many model versions.\n\nGotcha:\n- "latest" tags make deployments unreproducible and turn rollback into guesswork.',
  },
  {
    front: 'Preventing feedback loops in deployed models',
    back: 'The model influences the data that trains its successor, so errors and biases compound over generations of retraining.\n\nExamples:\n- A fraud model that declines a segment never observes their good behaviour.\n- A recommender that never surfaces an item never learns it was good.\n- Predictive policing directing patrols to areas it already flagged.\n\nDetection:\n- Monitor whether the training distribution is narrowing over time — coverage, entropy, and share of traffic to the top items.\n\nMitigations:\n- Randomised exploration holdouts, propensity logging with IPS correction, and periodically training on data from a randomised slice rather than model-selected traffic.',
  },
]
