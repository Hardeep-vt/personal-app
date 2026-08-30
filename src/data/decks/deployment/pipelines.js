// Data and feature pipelines in production.

export default [
  {
    front: 'Streaming vs batch feature computation',
    back: 'Two ways to compute features:\n- Batch: recompute on a schedule over the warehouse. Cheap, simple, high latency to freshness.\n- Streaming: update event-by-event as data arrives. Fresh, but complex and stateful.\n\nChoose by FRESHNESS need:\n- "User\'s 30-day spend" is fine hourly.\n- "Items viewed in this session" must be streaming.\n\nMechanism:\n- The hard part of streaming is maintaining aggregations (windowed counts, running sums) with correct state, out-of-order events, and exactly-once semantics.\n\nGotcha:\n- Computing a feature one way for training (batch backfill) and another for serving (streaming) is a classic source of training/serving skew — the two code paths drift apart.',
  },
  {
    front: 'Feature freshness and staleness SLAs',
    back: 'How recent a feature value is when the model reads it. Every online feature has an implicit or explicit freshness SLA.\n\nWhy it matters:\n- A fraud model reading an hour-old "transactions in last 5 minutes" is blind to the attack in progress.\n- A recommender reading yesterday\'s session context recommends stale intent.\n\nMechanism:\n- Freshness is bounded by the pipeline — batch cadence, streaming lag, and cache TTL all add staleness.\n\nMonitor it:\n- Track feature timestamp vs serving time, and alert on staleness. A stalled pipeline that silently serves old features is worse than an error — predictions keep flowing and look fine.',
  },
  {
    front: 'Backfilling features and point-in-time correctness',
    back: 'To build a training set you must reconstruct each feature\'s value AS IT WAS at each historical event — not its current value.\n\nWhy naive backfill leaks:\n- Joining today\'s feature table to old events attaches future information (a "lifetime value" that already includes the outcome you predict), giving great offline metrics and a broken production model.\n\nImplementation:\n- Append-only / versioned feature tables and AS-OF joins on event timestamps, so each label row gets the feature snapshot valid just before it.\n\nGotcha:\n- Even the streaming pipeline\'s own lag must be modelled — if a feature was actually available 10 minutes late in production, the training set should reflect that delay, not instantaneous availability.',
  },
  {
    front: 'Data validation in pipelines (schema and distribution checks)',
    back: 'Automated checks that incoming data matches expectations BEFORE it trains or serves a model.\n\nTwo layers:\n- SCHEMA — types, required fields, allowed categories, ranges. Catches structural breakage.\n- DISTRIBUTION — means, null rates, cardinality, drift vs a baseline. Catches silent semantic shifts.\n\nTools:\n- Great Expectations, TFDV, Deequ, or custom assertions in the DAG.\n\nWhy it is essential:\n- Upstream teams change schemas without telling you, an ETL job half-fails, a unit changes from cents to dollars. Without validation the model trains on or serves garbage and degrades quietly.\n\nGotcha:\n- An unseen categorical VALUE (not a schema change) is a common silent breaker — validate the value set, not just the type.',
  },
  {
    front: 'Data contracts',
    back: 'An explicit, enforced agreement between a data producer and its consumers about schema, semantics, freshness, and quality.\n\nWhy MLOps needs them:\n- Models depend on upstream tables owned by teams who do not know a model consumes them. A "harmless" refactor — renaming a column, changing an enum, altering a unit — silently breaks the model.\n\nHow:\n- Version the schema, validate producer output against the contract in CI, and treat a breaking change as an API change requiring migration.\n\nGotcha:\n- Without contracts, data-lineage failures are discovered downstream as model degradation days later — far from the actual change. Contracts move the failure to the producer\'s deploy, where it is cheap to fix.',
  },
  {
    front: 'Idempotency in data pipelines',
    back: 'Re-running a pipeline step with the same input produces the same result and no duplicate side effects.\n\nWhy it is essential:\n- Pipelines fail and retry constantly. A non-idempotent step that APPENDS on each run double-counts on retry, corrupting features and labels.\n\nHow:\n- Use deterministic keys and UPSERT / overwrite-by-partition instead of blind append; make writes keyed so a replay overwrites rather than duplicates.\n\nGotcha:\n- Idempotency plus at-least-once delivery gives you effectively-exactly-once results without expensive true exactly-once machinery. If a step is idempotent, at-least-once delivery is safe.',
  },
  {
    front: 'Exactly-once vs at-least-once vs at-most-once',
    back: 'Delivery guarantees for streaming / event systems:\n- At-most-once: may drop events. Fast, lossy.\n- At-least-once: never drops, may DUPLICATE. Safe if consumers are idempotent.\n- Exactly-once: no loss, no duplicates. Expensive — needs coordinated state and offsets.\n\nPractical stance:\n- True exactly-once is costly, so most systems use AT-LEAST-ONCE delivery with IDEMPOTENT consumers, which yields exactly-once EFFECTS without the overhead.\n\nWhy it matters for ML:\n- Duplicated events inflate count features and label counts; dropped events silently bias them. Both corrupt the model, neither throws an error.\n\nGotcha:\n- "Exactly-once" claims usually mean exactly-once processing within one system, not end-to-end across sinks.',
  },
  {
    front: 'Late-arriving data and watermarks',
    back: 'Events often arrive out of order and late (mobile buffering, network delays, batch uploads).\n\nWatermark:\n- The streaming system\'s estimate of "we have probably seen all events up to time T", used to decide when to close a window and emit its aggregate.\n\nThe trade-off:\n- Wait longer (later watermark) to capture stragglers and be more correct, or emit sooner and be fresher but miss late events.\n\nGotcha:\n- Data arriving after the watermark is either dropped or triggers a costly recomputation of an already-emitted result. In ML this means a feature value computed at serving time can differ from the same feature backfilled later — a subtle skew.\n- "Allowed lateness" bounds this trade explicitly.',
  },
  {
    front: 'Pipeline orchestration and DAGs',
    back: 'Workflow schedulers (Airflow, Dagster, Prefect, Kubeflow) model pipelines as DAGs of tasks with dependencies, scheduling, retries, and backfills.\n\nWhat they give you:\n- Dependency management (train only after features are built).\n- Retries with backoff.\n- Backfilling historical runs.\n- Observability into what ran when.\n\nMLOps specifics:\n- Tasks are heterogeneous (SQL, Spark, GPU training, deployment) and long-running.\n- Idempotency and data-aware scheduling (run when data lands, not just on a clock) matter more than in generic ETL.\n\nGotcha:\n- Scheduling on a fixed CLOCK when upstream data is late trains on incomplete data. Prefer data-availability triggers (sensors) over pure cron.',
  },
  {
    front: 'Materialised vs on-demand features',
    back: 'Two ways to serve a feature:\n- Materialised: precompute and store it, serve by lookup. Fast, but can be stale and costs storage.\n- On-demand: compute at request time from raw signals. Always fresh, but adds serving latency and compute.\n\nDecision:\n- Materialise features that are expensive and slow-changing (a user\'s 90-day aggregate).\n- Compute on-demand features that depend on request context (distance from current location, time since last event).\n\nMechanism:\n- A classic space / time (and freshness / latency) trade. Feature stores support both, and one model often mixes them.\n\nGotcha:\n- An on-demand feature must be computed identically in training and serving, or you reintroduce the skew that materialisation avoids.',
  },
  {
    front: 'Label pipelines and delayed labels',
    back: 'The ground-truth label often arrives long after the prediction — a conversion days later, a chargeback months later, a subscription renewal a year later.\n\nConsequences:\n- You cannot evaluate accuracy in real time.\n- Building a training set needs an ATTRIBUTION WINDOW deciding how long to wait for a label before calling it negative.\n\nGotcha:\n- Labelling "no conversion YET" as a hard negative mislabels recent events that simply have not converted, biasing the model against recent data. Delayed-feedback models treat unconverted recent events as CENSORED, not negative.\n\nDesign:\n- Match the training-set cutoff to the attribution window, and exclude events too recent to have a stable label.',
  },
  {
    front: 'Data lineage and provenance',
    back: 'A record of where each dataset, feature, and model came from: which sources, transforms, code version, and run produced it.\n\nWhy it is essential in ML:\n- When a model degrades or a feature looks wrong, lineage lets you trace back to the upstream change.\n- When a data source is found corrupt or non-compliant, lineage identifies every downstream model that must be retrained.\n- It also supports reproducibility and audit ("what data trained the model that made this decision?").\n\nGotcha:\n- Lineage must span DATA and CODE and MODELS together. Tracking only code versions misses that the same code produced different models because the data changed underneath it.',
  },
  {
    front: 'Feature versioning and the online/offline store',
    back: 'A feature definition can change (new logic, new source), so features must be versioned like code, and training must use the version that will serve.\n\nOnline vs offline store:\n- OFFLINE store holds full history for training (point-in-time correct).\n- ONLINE store holds the latest value per entity for low-latency serving.\n- Both are populated from ONE definition, to avoid skew.\n\nGotcha:\n- Changing a feature\'s computation without versioning means models trained on the old logic run against the new logic in production — silent skew.\n- Backfilling a new feature version into history requires recomputing it point-in-time correctly, not just applying today\'s logic to old data.',
  },
  {
    front: 'Schema evolution and backward compatibility',
    back: 'Data schemas change over time; pipelines and models must tolerate it without breaking.\n\nSafe changes (backward compatible):\n- Adding an optional field, widening a type.\n\nUnsafe changes:\n- Removing a field a model uses, renaming, changing a unit, narrowing a type, repurposing an enum value.\n\nHow to manage:\n- Schema registries with compatibility rules, defaults for new / missing fields, and treating breaking changes as versioned migrations.\n\nGotcha for models:\n- A model trained with a feature that later disappears receives nulls / defaults in production — if it was not trained to handle missing values, its behaviour on that feature is undefined. Feature removal is a model-breaking change, not just a data change.',
  },
  {
    front: 'Training-data snapshotting and versioning',
    back: 'Capturing the exact dataset a model was trained on, immutably, so the model can be reproduced and audited.\n\nWhy code versioning is not enough:\n- The same training code produces different models when the data changes underneath it. Without a data snapshot, "just retrain it" does not reproduce the model.\n\nTools / approaches:\n- DVC, LakeFS, Delta / Iceberg time travel, or content-addressed dataset hashes recorded in the model registry.\n\nGotcha:\n- Snapshotting must be point-in-time correct — pin "the users table as of the training date", not the mutable current table. And the snapshot must be cheap (references / deltas), or teams skip it and lose reproducibility.',
  },
]
