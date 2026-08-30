// Model lifecycle, governance, rollout, and safety.

export default [
  {
    front: 'Experiment tracking',
    back: 'Recording every training run\'s code version, data version, hyperparameters, metrics, and artefacts (MLflow, Weights & Biases, Neptune).\n\nWhy it is foundational:\n- ML development is empirical — dozens of runs with small variations. Without tracking you cannot answer "which config produced the best model?", cannot reproduce a result, and re-run experiments you already did.\n\nWhat to log:\n- Params, metrics (train and val), the data snapshot reference, the git commit, the environment, and the output model.\n\nGotcha:\n- Logging metrics but not the DATA VERSION and CODE COMMIT makes runs irreproducible — the same hyperparameters produced a different model because the data or code differed.',
  },
  {
    front: 'Model cards and documentation',
    back: 'A standardised document describing a model: intended use, training data, evaluation results BROKEN DOWN BY SEGMENT, limitations, ethical considerations, and known failure modes.\n\nWhy:\n- It communicates a model\'s appropriate use and risks to people who did not build it, and is increasingly required for governance and compliance.\n\nThe key content:\n- Per-segment performance. An aggregate accuracy hides that the model is far worse for a subgroup — the card forces that disclosure.\n\nGotcha:\n- A model card is only useful if kept current. A card describing v1 while v3 serves is worse than none — it gives false confidence about behaviour that has changed.',
  },
  {
    front: 'Champion/challenger and shadow evaluation',
    back: 'Champion: the model currently serving. Challenger: a candidate run in parallel to prove it is better before promotion.\n\nModes:\n- SHADOW: the challenger scores real traffic, outputs logged not served. Validates stability and distribution, but not user impact.\n- A/B: the challenger serves a slice. Measures real impact.\n- Shadow first for safety, then A/B for effect.\n\nWhy:\n- Offline metrics do not guarantee production wins, so challengers must be validated on live traffic before promotion.\n\nGotcha:\n- Shadow mode cannot measure business impact (nobody sees the outputs) and doubles inference cost for the shadow period. It is a safety gate, not a substitute for an A/B test.',
  },
  {
    front: 'Progressive rollout and feature flags for models',
    back: 'Releasing a new model to a growing fraction of traffic (1% → 5% → 25% → 100%), gated behind a flag that can flip instantly.\n\nWhy:\n- Limits blast radius, lets health metrics stabilise at each stage, and enables instant rollback by flipping the flag — no redeploy.\n\nDifference from a canary:\n- A canary is specifically the small first stage watched for health; progressive rollout is the whole staged ramp. Feature flags are the mechanism that makes both instant to control.\n\nGotcha:\n- The flag / config that selects the model is itself production state — version it, audit changes, and ensure a flag flip does not leave caches serving the old model\'s outputs.',
  },
  {
    front: 'Interleaving vs A/B testing for ranking models',
    back: 'Two ways to compare rankers:\n- A/B: users are split into groups, each group sees one ranker, and you compare aggregate metrics.\n- Interleaving: a SINGLE user sees results MIXED from both rankers, and you measure which ranker\'s items they prefer.\n\nWhy interleaving is powerful for ranking:\n- It controls for the user — the same person judges both rankers on the same query — so it detects differences with far LESS traffic and lower variance than A/B.\n\nLimits:\n- Works for comparing rankings, not whole-experience or long-term metrics, and is harder to implement correctly (fair mixing, unbiased attribution).\n\nUse:\n- Interleaving to cheaply screen ranker candidates, A/B to confirm the winner\'s business impact.',
  },
  {
    front: 'Human-in-the-loop and review queues',
    back: 'Routing uncertain or high-stakes predictions to humans instead of auto-deciding.\n\nWhen:\n- High cost of error (medical, fraud, moderation), low model confidence, out-of-distribution inputs, or a regulatory requirement for human oversight.\n\nDesign:\n- An ABSTENTION threshold — the model acts only when confident enough, otherwise it escalates. This trades coverage (fraction auto-handled) against accuracy on what it does handle.\n\nBonus:\n- Human decisions on escalated cases become fresh labels, especially on the hard / uncertain region — active-learning value.\n\nGotcha:\n- Calibrate the confidence used for routing, or you escalate the wrong cases. And design for the human throughput you actually have, or the queue backs up and the "safety net" becomes a bottleneck.',
  },
  {
    front: 'Model approval gates and sign-off',
    back: 'Formal checks a model must pass before it can serve: performance thresholds on a trusted holdout, per-segment and fairness checks, latency / size limits, and sometimes human or legal sign-off.\n\nWhy:\n- Automated retraining will faithfully promote a WORSE model trained on contaminated data unless a gate blocks it. Gates make promotion a validated event, not an automatic one.\n\nWhere in CI/CD:\n- After training, before deployment — the gate is code, evaluated against a held-out set the training never saw.\n\nGotcha:\n- Gating only on AGGREGATE metrics lets a per-segment regression through. Include segment-level and guardrail checks, and compare against the CURRENT champion, not an absolute bar.',
  },
  {
    front: 'Audit trails and compliance (right to explanation, model risk)',
    back: 'Regulated domains (credit, insurance, hiring, healthcare) require automated decisions to be explainable, contestable, and auditable.\n\nWhat it demands:\n- Log which model / version made each decision and on what inputs.\n- Produce a human-readable reason for adverse decisions (adverse-action notices).\n- Retain records.\n- Manage model risk (validation, documentation, monitoring) under frameworks like SR 11-7.\n\nTechnical implications:\n- Prediction logging with model lineage, explainability (SHAP for reason codes), and versioned governance.\n\nGotcha:\n- SHAP shows what the model used, not causal reasons — the "reasons" you give must be legally defensible. And you cannot explain a decision if you did not log the exact model and features that produced it.',
  },
  {
    front: 'Fairness and bias monitoring in production',
    back: 'A model fair at launch can become unfair as data drifts, so fairness is a monitoring concern, not just a training-time check.\n\nMetrics (which conflict):\n- Demographic parity: equal positive rates across groups.\n- Equalised odds: equal TPR / FPR across groups.\n- Calibration within groups.\n- An IMPOSSIBILITY result means you generally cannot satisfy all at once — you must choose which to prioritise.\n\nMonitor:\n- Per-group performance and outcome rates over time, alerting on divergence.\n\nGotchas:\n- You need group labels to measure fairness, which may be sensitive or unavailable.\n- Optimising one fairness metric can worsen another, so the choice must be explicit and justified.',
  },
  {
    front: 'PII handling and access control in ML systems',
    back: 'Training data and features often contain personal data, creating obligations across the whole lifecycle.\n\nPractices:\n- Minimise and mask PII in features.\n- Encrypt at rest and in transit.\n- Access controls on feature stores, training data, and prediction logs.\n- Redact PII from logs — a common leak, since features and prompts logged for debugging contain personal data.\n\nRegulatory hooks:\n- Purpose limitation, retention limits, and data-subject rights.\n\nGotcha:\n- Models (especially LLMs) can MEMORISE and regurgitate PII, so "the raw data is secured" is not enough — the model itself can leak training data. Prediction / feature logs are an often-overlooked PII store.',
  },
  {
    front: 'Right to be forgotten and machine unlearning',
    back: 'Regulations grant individuals the right to have their data deleted — but a trained model has already ABSORBED that data into its weights.\n\nThe problem:\n- Deleting the row from the database does not remove its influence on the model, and models can memorise and regurgitate specific training examples.\n\nApproaches:\n- Retrain from scratch without the data (correct but expensive).\n- Approximate UNLEARNING methods that adjust the model to remove a sample\'s influence.\n- Architectures designed for efficient deletion (sharded training so only affected shards retrain).\n\nGotcha:\n- Proving a sample\'s influence is truly gone is hard, and frequent deletion requests make full retraining impractical. This is an active, unsolved area to plan for, not assume away.',
  },
  {
    front: 'Model supply-chain security and provenance',
    back: 'Models, like software, have a supply chain that can be attacked: pretrained weights from public hubs, training data, and dependencies.\n\nThreats:\n- A POISONED pretrained model or dataset (backdoor triggered by a specific input).\n- A malicious model file that executes code on load (pickle deserialisation is a known vector).\n- Compromised dependencies.\n\nDefences:\n- Verify provenance and checksums of downloaded weights.\n- Prefer safe serialisation formats (safetensors over pickle).\n- Scan and pin dependencies.\n- Control who can register / promote models.\n\nGotcha:\n- Loading an untrusted model artefact can execute arbitrary code — treat model files from external sources as untrusted executables, not inert data.',
  },
  {
    front: 'Adversarial robustness in production',
    back: 'Deployed models face inputs crafted to fool them:\n- Adversarial examples: small perturbations that flip the prediction.\n- Evasion: spammers / fraudsters adapting to the model.\n- Prompt injection for LLMs.\n\nWhy it is a deployment concern:\n- A static model against ADAPTIVE adversaries degrades as they learn its blind spots — concept drift driven by an opponent, requiring frequent retraining.\n\nDefences:\n- Adversarial training, input validation and anomaly / OOD detection, rate limiting to slow probing, ensembles, and keeping model details private to raise the attacker\'s cost.\n\nGotcha:\n- Exposing confidence scores or detailed outputs helps attackers optimise against you — a trade-off between transparency and robustness.',
  },
  {
    front: 'Model deprecation and retirement',
    back: 'Retiring an old model version safely — often overlooked until it causes an incident.\n\nWhat it involves:\n- Confirming no traffic still routes to it.\n- Checking no downstream system stored or depends on its outputs.\n- Retaining the artefact and metadata for audit even after retirement.\n- Cleaning up its serving resources.\n\nWhy it matters:\n- "Zombie" models keep serving forgotten traffic, or a cache / precompute table keeps returning a retired model\'s predictions long after it was "turned off".\n\nGotcha:\n- You may need to KEEP a retired model\'s artefact and lineage for compliance even though it no longer serves — deletion and deprecation are different. And rollback needs the previous artefact to still exist, so do not delete N−1 when shipping N.',
  },
]
