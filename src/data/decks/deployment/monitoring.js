// Monitoring and observability for ML systems in production.

export default [
  {
    front: 'The four layers of ML monitoring',
    back: 'A mental model, ordered from fastest signal to most meaningful:\n- SYSTEM — latency, error rate, throughput, saturation. Standard SRE metrics.\n- DATA — schema violations, null rates, unseen categories, feature drift.\n- MODEL — prediction distribution, confidence distribution, and accuracy once labels arrive.\n- BUSINESS — the KPI the model exists to move.\n\nKey insight:\n- Signal availability is INVERSE to meaningfulness. System metrics are instant but say little about model quality; business metrics matter most but arrive slowest.\n\nAlerting discipline:\n- PAGE on system and business metrics.\n- Make drift a ticket, not a page — it is noisy and rarely a live incident.',
  },
  {
    front: 'Prediction drift as the first-line monitor',
    back: 'Tracking the distribution of the model\'s OUTPUTS over time (predicted scores, class rates).\n\nWhy it is the single most valuable signal:\n- Available immediately — no labels needed.\n- AGGREGATES every upstream problem — input drift, a broken feature, a bad deploy — into one number.\n\nWhat a shift means:\n- Either the world changed (real) or your pipeline broke (bug). It does not distinguish them, but it tells you to look.\n\nGotcha:\n- A stable prediction distribution does NOT guarantee correctness — a model can be confidently wrong in a stable way. Pair it with delayed accuracy.',
  },
  {
    front: 'Monitoring performance without labels',
    back: 'When ground truth is delayed or absent, you still need a health signal.\n\nProxy approaches:\n- Prediction / confidence distribution shifts.\n- Input drift metrics.\n- A small human-labelled audit sample.\n- More advanced: importance-weighting or model-based estimators that ESTIMATE accuracy under covariate shift from unlabelled production data.\n\nWhy it matters:\n- Waiting for labels means discovering a broken model weeks late.\n\nGotcha:\n- Label-free estimators assume P(Y|X) is unchanged (covariate shift only). Under CONCEPT drift — the relationship itself changing — they can report healthy while the model is quietly wrong, because they were calibrated on the old relationship.',
  },
  {
    front: 'Embedding drift monitoring',
    back: 'For models on text / images / users, monitor whether the distribution of EMBEDDINGS shifts over time.\n\nWhy:\n- Raw high-dimensional inputs are hard to monitor directly, but their embeddings compress semantics into a trackable space.\n- New topics, new user behaviour, or a new content type show up as movement in embedding space BEFORE accuracy drops.\n\nHow:\n- Track summary statistics of embeddings, distances to reference centroids, or a drift metric (MMD, KL on projected dimensions) against a training baseline.\n\nGotcha:\n- Retraining the embedding model changes the space and invalidates the baseline — re-baseline drift metrics on the new version, or they alarm on the model change itself.',
  },
  {
    front: 'Out-of-distribution / novelty detection at serving',
    back: 'Detecting inputs unlike anything in training, where the model\'s prediction is unreliable regardless of its confidence.\n\nWhy it matters:\n- Models EXTRAPOLATE badly, and often do so with high confidence. An OOD input (a new language, a corrupted image, an attack) gets a confident, wrong answer.\n\nApproaches:\n- Distance to the training distribution in feature / embedding space.\n- Density or reconstruction-error models.\n- Ensemble disagreement.\n\nWhat to do on OOD:\n- Abstain, route to a fallback or human, or flag for review — do not serve a confident guess.\n\nGotcha:\n- Softmax probability is NOT a reliable OOD signal — networks are systematically overconfident on OOD inputs. Use dedicated detectors.',
  },
  {
    front: 'Silent failures in ML systems',
    back: 'The defining hazard of ML in production: the system keeps returning predictions, throws no errors, and passes health checks — while quietly getting worse.\n\nExamples:\n- A feature pipeline serving stale values.\n- An upstream unit change.\n- A model degrading under drift.\n- A preprocessing mismatch.\n- A cache serving a previous model\'s outputs.\n\nWhy traditional monitoring misses it:\n- HTTP 200s and normal latency look healthy. The failure is in the CONTENT of predictions, not their availability.\n\nDefences:\n- Monitor prediction and feature distributions (not just uptime), online / offline consistency checks, and a randomised labelled holdout. Assume the failure mode is silent degradation, not a crash.',
  },
  {
    front: 'SLIs, SLOs, and error budgets for ML',
    back: 'The reliability vocabulary:\n- SLI: a measured indicator (p99 latency, prediction availability, feature freshness).\n- SLO: the target (p99 < 200ms, 99.9% availability).\n- Error budget: the allowed shortfall (0.1%), spent on risk.\n\nML-specific SLIs beyond uptime:\n- Feature freshness, prediction-distribution stability, model accuracy (when labels arrive), fallback rate.\n\nWhy the budget framing helps:\n- It makes the reliability / velocity trade explicit — budget intact → ship faster; budget exhausted → freeze and stabilise.\n\nGotcha:\n- An accuracy SLO needs labels, which are delayed — so you monitor leading proxies against the SLO in the interim and reconcile when labels land.',
  },
  {
    front: 'Logging predictions for audit and debugging',
    back: 'Persisting each prediction with its inputs, model version, and timestamp.\n\nWhy essential:\n- To debug a bad prediction you must reproduce the EXACT features and model that produced it.\n- To compute delayed accuracy you join logged predictions to labels that arrive later.\n- Compliance may require explaining any individual decision.\n\nWhat to log:\n- The TRANSFORMED features actually fed to the model (not just raw inputs — that is what catches skew), the model / version id, the score, and the request context.\n\nGotchas:\n- Volume and cost — sample or aggregate high-QPS logs.\n- PII in logged features — redact / hash.\n- Logging RAW inputs but not TRANSFORMED features misses the most common bug class.',
  },
  {
    front: 'Distributed tracing for ML pipelines',
    back: 'Propagating a trace / correlation id through every hop of a request — gateway, feature fetches, preprocessing, model call, post-processing — so you can see where latency and errors occur.\n\nWhy ML needs it:\n- An inference request fans out to multiple feature stores and possibly several models. When p99 latency spikes, tracing shows WHICH stage is responsible — often a slow feature fetch, not the model.\n\nWhat it reveals:\n- Per-stage latency breakdown, which dependency timed out, which fallback engaged.\n\nGotcha:\n- Without tracing, "the model is slow" is unactionable. Model compute is frequently a small fraction of total latency, dominated by feature I/O and network hops.',
  },
  {
    front: 'Alerting: pages vs tickets, and alert fatigue',
    back: 'Not every anomaly deserves to wake someone. Over-alerting trains responders to ignore alerts, so real incidents get missed.\n\nDiscipline:\n- PAGE on actionable, urgent, user-impacting problems — system down, error spike, business-metric cliff.\n- TICKET (or dashboard) for drift, gradual degradation, and informational trends that need investigation but not at 3am.\n\nWhy ML tempts over-alerting:\n- Drift signals are noisy and fire constantly; wiring them to pages guarantees fatigue.\n\nGood alerts:\n- Have a clear owner, a runbook, and a low false-positive rate. If an alert has no defined response, it should not page.',
  },
  {
    front: 'Choosing a drift baseline and reference window',
    back: 'Drift detection compares live data to a REFERENCE. The choice of reference decides what "drift" means.\n\nOptions:\n- The TRAINING distribution — detects any divergence from what the model learned. The right baseline for model validity.\n- A RECENT trailing window — detects sudden changes but treats slow drift as the new normal.\n\nGotcha:\n- A trailing-window baseline slowly "accepts" gradual drift, so a model can degrade steadily while the drift monitor stays quiet — the baseline crept along with the data. For model-validity monitoring, anchor to the training distribution.\n\nAlso:\n- Seasonality. Comparing Monday to Sunday flags false drift — compare like-for-like periods.',
  },
  {
    front: 'Canary metrics and automated rollback triggers',
    back: 'During a canary, watch a small set of health metrics and automatically halt / roll back if they regress.\n\nWhat to watch:\n- System health (errors, latency).\n- Invariants (assignment ratios, guardrail metrics that must not move).\n- A leading quality proxy where one is available fast.\n\nWhy automate:\n- Humans watching dashboards miss regressions or react slowly; an automated trigger bounds the blast radius.\n\nGotchas:\n- The trigger needs enough traffic / time to be statistically meaningful, or it fires on noise.\n- It must account for novelty effects that make early metrics unrepresentative.\n- Set thresholds from historical variability, not guesses.',
  },
  {
    front: 'Feature attribution drift (monitoring WHY, not just WHAT)',
    back: 'Beyond monitoring inputs and outputs, track whether the FEATURES DRIVING predictions have changed — e.g. average SHAP attributions per feature over time.\n\nWhy it adds signal:\n- Input distributions can look stable while the model\'s RELIANCE on features shifts.\n- A feature that was important can become constant (a broken pipeline serving a default), which output monitoring might miss.\n\nExample:\n- A feature silently pipes a null / default; its attribution collapses to zero. Attribution monitoring flags "the model stopped using feature X" even though predictions still flow.\n\nGotcha:\n- Attribution is expensive to compute per request — sample it. And SHAP shows model reliance, not causation.',
  },
  {
    front: 'Business-metric guardrails vs the optimisation target',
    back: 'Monitor metrics the model is NOT trying to improve but must not harm: latency, revenue, unsubscribes, complaint rate, downstream conversion.\n\nWhy:\n- Optimising a single target invites collateral damage. A model that lifts CTR can raise it by degrading latency or by cannibalising another surface, and the target metric will not reveal it.\n\nHow:\n- Define guardrails up front with looser thresholds, and block promotion on any guardrail regression even when the target improves.\n\nGotcha:\n- Guardrails are also your defence against Goodhart\'s law — when the proxy target is gamed, the guardrails catch the harm the gaming causes. Without them, "the metric went up" is not evidence the product improved.',
  },
]
