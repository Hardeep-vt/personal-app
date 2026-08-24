// Data and feature pipelines in production.

export default [
  {
    front: 'Streaming vs batch feature computation',
    back: 'Batch: recompute features on a schedule over the warehouse (cheap, simple, high latency to freshness). Streaming: update features event-by-event as data arrives (fresh, but complex and stateful).\n\nChoose by FRESHNESS need: a "user\'s 30-day spend" feature is fine hourly; "items viewed in this session" must be streaming.\n\nUnder the hood: the hard part of streaming is maintaining aggregations (windowed counts, running sums) with correct state, out-of-order events, and exactly-once semantics.\n\nGotcha: computing a feature one way for training (batch backfill) and another for serving (streaming) is a classic source of training/serving skew — the two code paths drift.',
  },
  {
    front: 'Feature freshness and staleness SLAs',
    back: 'How recent a feature value is when the model reads it. Every online feature has an implicit or explicit freshness SLA.\n\nWhy it matters: a fraud model reading an hour-old "transactions in last 5 minutes" is blind to the attack in progress. A recommender reading yesterday\'s session context recommends stale intent.\n\nUnder the hood: freshness is bounded by the pipeline — batch cadence, streaming lag, and cache TTL all add staleness.\n\nMonitor it: track feature timestamp vs serving time, and alert on staleness. A stalled pipeline that silently serves old features is worse than an error, because predictions keep flowing and look fine.',
  },
  {
    front: 'Backfilling features and point-in-time correctness',
    back: 'To build a training set you must reconstruct each feature\'s value AS IT WAS at each historical event — not its current value.\n\nWhy naive backfill leaks: joining today\'s feature table to old events attaches future information (a "lifetime value" that already includes the outcome you predict), giving great offline metrics and a broken production model.\n\nImplementation: append-only/versioned feature tables and AS-OF joins on event timestamps, so each label row gets the feature snapshot valid just before it.\n\nGotcha: even the streaming pipeline\'s own lag must be modelled — if a feature was actually available 10 minutes late in production, the training set should reflect that delay, not instantaneous availability.',
  },
  {
    front: 'Data validation in pipelines (schema and distribution checks)',
    back: 'Automated checks that incoming data matches expectations BEFORE it trains or serves a model.\n\nTwo layers: SCHEMA (types, required fields, allowed categories, ranges) catches structural breakage; DISTRIBUTION (means, null rates, cardinality, drift vs a baseline) catches silent semantic shifts.\n\nTools: Great Expectations, TFDV, Deequ, or custom assertions in the DAG.\n\nWhy it is essential: upstream teams change schemas without telling you, an ETL job half-fails, a unit changes from cents to dollars. Without validation the model trains on or serves garbage and degrades quietly.\n\nGotcha: an unseen categorical VALUE (not a schema change) is a common silent breaker — validate the value set, not just the type.',
  },
  {
    front: 'Data contracts',
    back: 'An explicit, enforced agreement between a data producer and its consumers about schema, semantics, freshness, and quality.\n\nWhy MLOps needs them: models depend on upstream tables owned by teams who do not know a model consumes them. A "harmless" refactor — renaming a column, changing an enum, altering a unit — silently breaks the model.\n\nHow: version the schema, validate producer output against the contract in CI, and treat a breaking change as an API change requiring migration.\n\nGotcha: without contracts, data lineage failures are discovered downstream as model degradation days later — far from the actual change. Contracts move the failure to the producer\'s deploy, where it is cheap to fix.',
  },
  {
    front: 'Idempotency in data pipelines',
    back: 'Re-running a pipeline step with the same input produces the same result and no duplicate side effects.\n\nWhy it is essential: pipelines fail and retry constantly. A non-idempotent step that APPENDS on each run double-counts on retry, corrupting features and labels.\n\nHow: use deterministic keys and UPSERT/overwrite-by-partition instead of blind append; make writes keyed so a replay overwrites rather than duplicates.\n\nGotcha: idempotency plus at-least-once delivery is how you achieve effectively-exactly-once results without expensive true exactly-once machinery. If a step is idempotent, at-least-once delivery is safe.',
  },
  {
    front: 'Exactly-once vs at-least-once vs at-most-once',
    back: 'Delivery guarantees for streaming/event systems. At-most-once: may drop events (fast, lossy). At-least-once: never drops, may DUPLICATE (safe if consumers are idempotent). Exactly-once: no loss, no duplicates (expensive, needs coordinated state and offsets).\n\nPractical stance: true exactly-once is costly, so most systems use AT-LEAST-ONCE delivery with IDEMPOTENT consumers, which yields exactly-once EFFECTS without the overhead.\n\nWhy it matters for ML: duplicated events inflate count features and label counts; dropped events silently bias them. Both corrupt the model, and neither throws an error.\n\nGotcha: "exactly-once" claims usually mean exactly-once processing within one system, not end-to-end across sinks.',
  },
  {
    front: 'Late-arriving data and watermarks',
    back: 'Events often arrive out of order and late (mobile buffering, network delays, batch uploads).\n\nWatermark: the streaming system\'s estimate of "we have probably seen all events up to time T," used to decide when to close a window and emit its aggregate.\n\nThe trade-off: wait longer (later watermark) to capture stragglers and be more correct, or emit sooner and be fresher but miss late events.\n\nGotcha: data arriving after the watermark is either dropped or triggers a costly recomputation of an already-emitted result. In ML this means feature values computed at serving time can differ from the same feature backfilled later — a subtle skew.\n\nDesign choice: allowed lateness bounds this trade explicitly.',
  },
  {
    front: 'Pipeline orchestration and DAGs',
    back: 'Workflow schedulers (Airflow, Dagster, Prefect, Kubeflow) model pipelines as DAGs of tasks with dependencies, scheduling, retries, and backfills.\n\nWhat they give you: dependency management (train only after features are built), retries with backoff, backfilling historical runs, and observability into what ran when.\n\nMLOps specifics: tasks are heterogeneous (SQL, Spark, GPU training, deployment) and long-running; idempotency and data-aware scheduling (run when data lands, not just on a clock) matter more than in generic ETL.\n\nGotcha: scheduling on a fixed CLOCK when upstream data is late trains on incomplete data. Prefer data-availability triggers (sensors) over pure cron.',
  },
  {
    front: 'Materialised vs on-demand features',
    back: 'Materialised: precompute and store the feature, serve by lookup (fast, but can be stale and costs storage). On-demand: compute at request time from raw signals (always fresh, but adds serving latency and compute).\n\nDecision: materialise features that are expensive and slow-changing (a user\'s 90-day aggregate); compute on-demand features that depend on request context (distance from current location, time since last event).\n\nUnder the hood: this is a classic space/time (and freshness/latency) trade. Feature stores support both, and a single model often mixes them.\n\nGotcha: an on-demand feature must be computed identically in training and serving, or you reintroduce skew — the exact risk materialisation avoids.',
  },
  {
    front: 'Label pipelines and delayed labels',
    back: 'The ground-truth label often arrives long after the prediction — a conversion days later, a chargeback months later, a subscription renewal a year later.\n\nConsequences: you cannot evaluate accuracy in real time, and building a training set requires an ATTRIBUTION WINDOW deciding how long to wait for a label before calling it negative.\n\nGotcha: labelling "no conversion YET" as a hard negative mislabels recent events that simply have not converted, biasing the model against recent data. Delayed-feedback models treat unconverted recent events as CENSORED, not negative.\n\nDesign: match the training-set cutoff to the attribution window, and exclude events too recent to have a stable label.',
  },
  {
    front: 'Data lineage and provenance',
    back: 'A record of where each dataset, feature, and model came from: which sources, transforms, code version, and run produced it.\n\nWhy it is essential in ML: when a model degrades or a feature looks wrong, lineage lets you trace back to the upstream change. When a data source is found to be corrupt or non-compliant, lineage identifies every downstream model that must be retrained.\n\nAlso: reproducibility and audit/compliance ("what data trained the model that made this decision?").\n\nGotcha: lineage must span DATA and CODE and MODELS together. Tracking only code versions misses that the same code produced different models because the data changed underneath it.',
  },
  {
    front: 'Feature versioning and the online/offline store',
    back: 'A feature definition can change (new logic, new source), so features must be versioned like code, and training must use the version that will serve.\n\nOnline vs offline store: the OFFLINE store holds full history for training (point-in-time correct); the ONLINE store holds the latest value per entity for low-latency serving. Both are populated from ONE definition to avoid skew.\n\nGotcha: changing a feature\'s computation without versioning means models trained on the old logic run against the new logic in production — silent skew. And backfilling a new feature version into history requires recomputing it point-in-time correctly, not just applying today\'s logic to old data.',
  },
  {
    front: 'Schema evolution and backward compatibility',
    back: 'Data schemas change over time; pipelines and models must tolerate it without breaking.\n\nSafe changes (backward compatible): adding an optional field, widening a type. Unsafe: removing a field a model uses, renaming, changing a unit, narrowing a type, or repurposing an enum value.\n\nHow to manage: schema registries with compatibility rules, defaults for new/missing fields, and treating breaking changes as versioned migrations.\n\nGotcha for models: a model trained with a feature that later disappears will receive nulls/defaults in production — if it was not trained to handle missing values there, its behaviour on that feature is undefined. Feature removal is a model-breaking change, not just a data change.',
  },
  {
    front: 'Training-data snapshotting and versioning',
    back: 'Capturing the exact dataset a model was trained on, immutably, so the model can be reproduced and audited.\n\nWhy code versioning is not enough: the same training code produces different models when the data changes underneath it. Without a data snapshot, "just retrain it" does not reproduce the model.\n\nTools/approaches: DVC, LakeFS, Delta/Iceberg time travel, or content-addressed dataset hashes recorded in the model registry.\n\nGotcha: snapshotting must be point-in-time correct — pinning "the users table as of the training date," not the mutable current table. And the snapshot must be cheap (references/deltas), or teams skip it and lose reproducibility.',
  },
]
