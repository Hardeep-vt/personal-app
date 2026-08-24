// Monitoring and observability for ML systems in production.

export default [
  {
    front: 'The four layers of ML monitoring',
    back: 'A useful mental model, from cheapest/fastest signal to most meaningful:\n\n(1) SYSTEM — latency, error rate, throughput, saturation. Standard SRE metrics. (2) DATA — schema violations, null rates, unseen categories, feature drift. (3) MODEL — prediction distribution, confidence distribution, and accuracy once labels arrive. (4) BUSINESS — the KPI the model exists to move.\n\nKey insight: signal availability is inverse to meaningfulness. System metrics are instant but tell you little about model quality; business metrics matter most but arrive slowest.\n\nAlerting discipline: PAGE on system and business metrics; make drift a ticket, not a page. Drift is noisy and rarely a live incident.',
  },
  {
    front: 'Prediction drift as the first-line monitor',
    back: 'Tracking the distribution of the model\'s OUTPUTS over time (predicted scores, class rates).\n\nWhy it is the single most valuable signal: it is available immediately (no labels needed), and it AGGREGATES every upstream problem — input drift, a broken feature, a bad deploy — into one number. If the input distribution shifts or a feature pipeline breaks, the prediction distribution usually moves.\n\nWhat a shift means: either the world changed (real) or your pipeline broke (bug). It does not distinguish them, but it tells you to look.\n\nGotcha: a stable prediction distribution does NOT guarantee correctness — a model can be confidently wrong in a stable way. Pair it with delayed accuracy.',
  },
  {
    front: 'Monitoring performance without labels',
    back: 'When ground truth is delayed or absent, you still need a health signal.\n\nProxy approaches: prediction/confidence distribution shifts, input drift metrics, and a small human-labelled audit sample. More advanced: importance-weighting or model-based estimators that ESTIMATE accuracy under covariate shift from unlabelled production data.\n\nWhy it matters: waiting for labels means discovering a broken model weeks late.\n\nGotcha: label-free estimators assume the P(Y|X) relationship is unchanged (covariate shift only). Under CONCEPT drift — the relationship itself changing — they can report healthy while the model is quietly wrong, because they were calibrated on the old relationship.',
  },
  {
    front: 'Embedding drift monitoring',
    back: 'For models on text/images/users, monitor whether the distribution of EMBEDDINGS shifts over time.\n\nWhy: raw high-dimensional inputs are hard to monitor directly, but their embeddings compress semantics into a trackable space. New topics, new user behaviour, or a new content type show up as movement in embedding space before accuracy drops.\n\nHow: track summary statistics of embeddings, distances to reference centroids, or a drift metric (MMD, KL on projected dimensions) against a training baseline.\n\nGotcha: if you retrain the embedding model, the space changes and your baseline is invalid — drift metrics must be re-baselined on the new embedding version, or they alarm on the model change itself.',
  },
  {
    front: 'Out-of-distribution / novelty detection at serving',
    back: 'Detecting inputs unlike anything in training, where the model\'s prediction is unreliable regardless of its confidence.\n\nWhy it matters: models EXTRAPOLATE badly and often do so with high confidence. An OOD input (a new language, a corrupted image, an attack) gets a confident, wrong answer.\n\nApproaches: distance to training distribution in feature/embedding space, density or reconstruction-error models, or ensemble disagreement.\n\nWhat to do on OOD: abstain, route to a fallback or human, or flag for review rather than serve a confident guess.\n\nGotcha: softmax probability is NOT a reliable OOD signal — networks are systematically overconfident on OOD inputs. Use dedicated detectors.',
  },
  {
    front: 'Silent failures in ML systems',
    back: 'The defining hazard of ML in production: the system keeps returning predictions, throws no errors, and passes health checks — while quietly getting worse.\n\nExamples: a feature pipeline serving stale values, an upstream unit change, a model degrading under drift, a preprocessing mismatch, a cache serving a previous model\'s outputs.\n\nWhy traditional monitoring misses it: HTTP 200s and normal latency look healthy. The failure is in the CONTENT of predictions, not their availability.\n\nDefences: monitor prediction and feature distributions (not just uptime), online/offline consistency checks, and a randomised labelled holdout. Assume the failure mode is silent degradation, not a crash.',
  },
  {
    front: 'SLIs, SLOs, and error budgets for ML',
    back: 'SLI: a measured indicator (p99 latency, prediction availability, feature freshness). SLO: the target (p99 < 200ms, 99.9% availability). Error budget: the allowed shortfall (0.1%), spent on risk.\n\nML-specific SLIs beyond uptime: feature freshness, prediction-distribution stability, model accuracy (when labels arrive), and fallback rate.\n\nWhy the budget framing helps: it makes the reliability/velocity trade explicit — if the error budget is intact, ship faster; if exhausted, freeze and stabilise.\n\nGotcha: an accuracy SLO needs labels, which are delayed, so you monitor leading proxies against the SLO in the interim and reconcile when labels land.',
  },
  {
    front: 'Logging predictions for audit and debugging',
    back: 'Persisting each prediction with its inputs, model version, and timestamp.\n\nWhy essential: to debug a bad prediction you must reproduce the EXACT features and model that produced it; to compute delayed accuracy you join logged predictions to labels that arrive later; and compliance may require explaining any individual decision.\n\nWhat to log: the transformed features actually fed to the model (not just raw inputs — that is what catches skew), the model/version id, the score, and the request context.\n\nGotchas: volume and cost (sample or aggregate high-QPS logs), PII in logged features (redact/hash), and retention limits vs audit requirements. Logging RAW inputs but not TRANSFORMED features misses the most common bug class.',
  },
  {
    front: 'Distributed tracing for ML pipelines',
    back: 'Propagating a trace/correlation id through every hop of a request — gateway, feature fetches, preprocessing, model call, post-processing — so you can see where latency and errors occur.\n\nWhy ML needs it: an inference request fans out to multiple feature stores and possibly several models. When p99 latency spikes, tracing shows WHICH stage (often a slow feature fetch, not the model) is responsible.\n\nWhat it reveals: per-stage latency breakdown, which dependency timed out, and which fallback engaged.\n\nGotcha: without tracing, "the model is slow" is unactionable — the model compute is frequently a small fraction of total latency, dominated by feature I/O and network hops.',
  },
  {
    front: 'Alerting: pages vs tickets, and alert fatigue',
    back: 'Not every anomaly deserves to wake someone. Over-alerting trains responders to ignore alerts, so real incidents get missed.\n\nDiscipline: PAGE on actionable, urgent, user-impacting problems — system down, error spike, business metric cliff. TICKET (or dashboard) for drift, gradual degradation, and informational trends that need investigation but not at 3am.\n\nWhy ML tempts over-alerting: drift signals are noisy and fire constantly; wiring them to pages guarantees fatigue.\n\nGood alerts: have a clear owner, a runbook, and a low false-positive rate. If an alert has no defined response, it should not page.',
  },
  {
    front: 'Choosing a drift baseline and reference window',
    back: 'Drift detection compares live data to a REFERENCE. The choice of reference decides what "drift" means.\n\nOptions: the TRAINING distribution (detects any divergence from what the model learned — the right baseline for model validity), or a RECENT trailing window (detects sudden changes but treats slow drift as the new normal).\n\nGotcha: a trailing-window baseline slowly "accepts" gradual drift, so a model can degrade steadily while the drift monitor stays quiet — the baseline crept along with the data. For model-validity monitoring, anchor to the training distribution.\n\nAlso: seasonality. Comparing Monday to Sunday flags false drift; compare like-for-like periods.',
  },
  {
    front: 'Canary metrics and automated rollback triggers',
    back: 'During a canary, watch a small set of health metrics and automatically halt/roll back if they regress.\n\nWhat to watch: system health (errors, latency), invariants (assignment ratios, guardrail metrics that must not move), and — where available fast — a leading quality proxy.\n\nWhy automate: humans watching dashboards miss regressions or react slowly; an automated trigger bounds the blast radius.\n\nGotchas: the trigger needs enough traffic/time to be statistically meaningful (too little and it fires on noise); it must account for novelty effects that make early metrics unrepresentative; and it must know the difference between a real regression and normal variance — set thresholds from historical variability, not guesses.',
  },
  {
    front: 'Feature attribution drift (monitoring WHY, not just WHAT)',
    back: 'Beyond monitoring inputs and outputs, track whether the FEATURES DRIVING predictions have changed — e.g. average SHAP attributions per feature over time.\n\nWhy it adds signal: input distributions can look stable while the model\'s RELIANCE on features shifts, or a feature that was important becomes constant (a broken pipeline serving a default), which output monitoring might miss.\n\nExample: a feature silently pipes a null/default; its attribution collapses to zero. Attribution monitoring flags "the model stopped using feature X" even though predictions still flow.\n\nGotcha: attribution is expensive to compute per request — sample it, and remember SHAP shows model reliance, not causation.',
  },
  {
    front: 'Business-metric guardrails vs the optimisation target',
    back: 'Monitor metrics the model is NOT trying to improve but must not harm: latency, revenue, unsubscribes, complaint rate, downstream conversion.\n\nWhy: optimising a single target invites collateral damage. A model that lifts CTR can raise it by degrading latency or by cannibalising another surface, and the target metric will not reveal it.\n\nHow: define guardrails up front with looser thresholds, and block promotion on any guardrail regression even when the target improves.\n\nGotcha: guardrails are also your defence against Goodhart\'s law — when the proxy target is gamed, the guardrails catch the harm the gaming causes. Without them, "the metric went up" is not evidence the product improved.',
  },
]
