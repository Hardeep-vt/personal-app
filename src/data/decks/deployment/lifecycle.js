// Model lifecycle, governance, rollout, and safety.

export default [
  {
    front: 'Experiment tracking',
    back: 'Recording every training run\'s code version, data version, hyperparameters, metrics, and artifacts (MLflow, Weights & Biases, Neptune).\n\nWhy it is foundational: ML development is empirical — dozens of runs with small variations. Without tracking you cannot answer "which config produced the best model?" or reproduce a result, and you re-run experiments you already did.\n\nWhat to log: params, metrics (train and val), the data snapshot reference, the git commit, environment, and the output model.\n\nGotcha: tracking metrics but not the DATA VERSION and CODE COMMIT makes runs irreproducible — the same logged hyperparameters produced a different model because the data or code differed.',
  },
  {
    front: 'Model cards and documentation',
    back: 'A standardised document describing a model: intended use, training data, evaluation results BROKEN DOWN BY SEGMENT, limitations, ethical considerations, and known failure modes.\n\nWhy: it communicates a model\'s appropriate use and risks to people who did not build it, and is increasingly required for governance and compliance.\n\nThe key content: per-segment performance. An aggregate accuracy hides that the model is far worse for a subgroup — the model card forces that disclosure.\n\nGotcha: a model card is only useful if kept current. A card describing v1 while v3 serves is worse than none, because it gives false confidence about behaviour that has changed.',
  },
  {
    front: 'Champion/challenger and shadow evaluation',
    back: 'Champion: the model currently serving. Challenger: a candidate run in parallel to prove it is better before promotion.\n\nModes: SHADOW (challenger scores real traffic, outputs logged not served — validates stability and distribution, but not user impact); A/B (challenger serves a slice — measures real impact). Shadow first for safety, then A/B for effect.\n\nWhy: offline metrics do not guarantee production wins, so challengers must be validated on live traffic before promotion.\n\nGotcha: shadow mode cannot measure business impact (nobody sees the outputs) and doubles inference cost during the shadow period. It is a safety gate, not a substitute for an A/B test.',
  },
  {
    front: 'Progressive rollout and feature flags for models',
    back: 'Releasing a new model to a growing fraction of traffic (1% → 5% → 25% → 100%), gated behind a flag that can flip instantly.\n\nWhy: limits blast radius, lets health metrics stabilise at each stage, and enables instant rollback by flipping the flag — no redeploy.\n\nDifference from a canary: a canary is specifically the small first stage watched for health; progressive rollout is the whole staged ramp. Feature flags are the mechanism that makes both instant to control.\n\nGotcha: the flag/config that selects the model is itself production state — version it, audit changes, and ensure a flag flip does not leave caches serving the old model\'s outputs.',
  },
  {
    front: 'Interleaving vs A/B testing for ranking models',
    back: 'A/B: users are split into groups, each group sees one ranker, and you compare aggregate metrics. Interleaving: a SINGLE user sees results MIXED from both rankers, and you measure which ranker\'s items they prefer.\n\nWhy interleaving is powerful for ranking: it controls for the user — the same person judges both rankers on the same query — so it detects differences with far LESS traffic and lower variance than A/B.\n\nLimits: it works for comparing rankings, not for whole-experience or long-term metrics, and it is more complex to implement correctly (fair mixing, unbiased attribution).\n\nUse: interleaving to cheaply screen ranker candidates, A/B to confirm the winner\'s business impact.',
  },
  {
    front: 'Human-in-the-loop and review queues',
    back: 'Routing uncertain or high-stakes predictions to humans instead of auto-deciding.\n\nWhen: high cost of error (medical, fraud, moderation), low model confidence, OOD inputs, or regulatory requirements for human oversight.\n\nDesign: an ABSTENTION threshold — the model acts only when confident enough, otherwise escalates. This trades coverage (fraction auto-handled) against accuracy on what it does handle.\n\nBonus: human decisions on escalated cases become fresh labels, especially on the hard/uncertain region — active-learning value.\n\nGotcha: calibrate the confidence used for routing, or you escalate the wrong cases; and design for the human throughput you actually have, or the queue backs up and the "safety net" becomes a bottleneck.',
  },
  {
    front: 'Model approval gates and sign-off',
    back: 'Formal checks a model must pass before it can serve: performance thresholds on a trusted holdout, per-segment and fairness checks, latency/size limits, and sometimes human/legal sign-off.\n\nWhy: automated retraining will faithfully promote a WORSE model trained on contaminated data unless a gate blocks it. Gates make promotion a validated event, not an automatic one.\n\nWhere in CI/CD: after training, before deployment — the gate is code, evaluated against a held-out set the training never saw.\n\nGotcha: gating only on AGGREGATE metrics lets a per-segment regression through. Include segment-level and guardrail checks, and compare against the CURRENT champion, not an absolute bar.',
  },
  {
    front: 'Audit trails and compliance (right to explanation, model risk)',
    back: 'Regulated domains (credit, insurance, hiring, healthcare) require that automated decisions be explainable, contestable, and auditable.\n\nWhat it demands: log which model/version made each decision and on what inputs; produce a human-readable reason for adverse decisions (adverse action notices); retain records; and manage model risk (validation, documentation, monitoring) under frameworks like SR 11-7.\n\nTechnical implications: prediction logging with model lineage, explainability (SHAP for reason codes), and versioned governance.\n\nGotcha: SHAP shows what the MODEL used, not causal reasons — legally you must be careful that "reasons" given are defensible. And you cannot explain a decision if you did not log the exact model and features that produced it.',
  },
  {
    front: 'Fairness and bias monitoring in production',
    back: 'A model fair at launch can become unfair as data drifts, so fairness is a monitoring concern, not just a training-time check.\n\nMetrics (which conflict): demographic parity (equal positive rates across groups), equalised odds (equal TPR/FPR across groups), calibration within groups. You generally cannot satisfy all simultaneously — an IMPOSSIBILITY result forces a choice of which to prioritise.\n\nMonitor: per-group performance and outcome rates over time, alerting on divergence.\n\nGotchas: you need group labels to measure fairness, which may be sensitive or unavailable; and optimising one fairness metric can worsen another, so the choice must be explicit and justified, not implicit.',
  },
  {
    front: 'PII handling and access control in ML systems',
    back: 'Training data and features often contain personal data, creating obligations across the whole lifecycle.\n\nPractices: minimise and mask PII in features; encrypt at rest and in transit; access controls on feature stores, training data, and prediction logs; and redact PII from logs (a common leak — features and prompts logged for debugging contain personal data).\n\nRegulatory hooks: purpose limitation (data used only for stated purposes), retention limits, and data-subject rights.\n\nGotcha: PII can be MEMORISED by models and regurgitated (especially LLMs), so "the raw data is secured" is not enough — the model itself can leak training data. And prediction/feature logs are an often-overlooked PII store.',
  },
  {
    front: 'Right to be forgotten and machine unlearning',
    back: 'Regulations grant individuals the right to have their data deleted — but a trained model has already ABSORBED that data into its weights.\n\nThe problem: deleting the row from the database does not remove its influence on the model, and models can memorise and regurgitate specific training examples.\n\nApproaches: retrain from scratch without the data (correct but expensive), approximate UNLEARNING methods that adjust the model to remove a sample\'s influence, or architectures designed for efficient deletion (sharded training so only affected shards retrain).\n\nGotcha: proving a sample\'s influence is truly gone is hard, and frequent deletion requests make full retraining impractical — this is an active, unsolved area teams must plan for, not assume away.',
  },
  {
    front: 'Model supply-chain security and provenance',
    back: 'Models, like software, have a supply chain that can be attacked: pretrained weights from public hubs, training data, and dependencies.\n\nThreats: a POISONED pretrained model or dataset (backdoor triggered by a specific input), a malicious model file that executes code on load (pickle deserialisation is a known vector), and compromised dependencies.\n\nDefences: verify provenance and checksums of downloaded weights, prefer safe serialisation formats (safetensors over pickle), scan and pin dependencies, and control who can register/promote models.\n\nGotcha: loading an untrusted model artifact can execute arbitrary code — treat model files from external sources as untrusted executables, not inert data.',
  },
  {
    front: 'Adversarial robustness in production',
    back: 'Deployed models face inputs crafted to fool them: adversarial examples (small perturbations flipping the prediction), evasion (spammers/fraudsters adapting to the model), and prompt injection for LLMs.\n\nWhy it is a deployment concern: a static model against ADAPTIVE adversaries degrades as they learn its blind spots — this is concept drift driven by an opponent, requiring frequent retraining.\n\nDefences: adversarial training, input validation and anomaly/OOD detection, rate limiting to slow probing, ensembles, and keeping model details private to raise the attacker\'s cost.\n\nGotcha: exposing confidence scores or detailed outputs helps attackers optimise against you — there is a trade-off between transparency and robustness.',
  },
  {
    front: 'Model deprecation and retirement',
    back: 'Retiring an old model version safely — often overlooked until it causes an incident.\n\nWhat it involves: confirming no traffic still routes to it, checking no downstream system stored/depends on its outputs, retaining the artifact and metadata for audit even after retirement, and cleaning up its serving resources.\n\nWhy it matters: "zombie" models keep serving forgotten traffic, or a cache/precompute table keeps returning a retired model\'s predictions long after it was "turned off."\n\nGotcha: you may need to KEEP a retired model\'s artifact and lineage for compliance/audit even though it no longer serves — deletion and deprecation are different. And rollback requires the previous artifact to still exist, so do not delete N-1 when shipping N.',
  },
]
