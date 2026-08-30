// Scaling, hardware, and performance for ML serving.

export default [
  {
    front: 'Horizontal vs vertical scaling for inference',
    back: 'Two ways to add capacity:\n- Vertical: a bigger machine (more / faster GPU, more RAM).\n- Horizontal: more machines behind a load balancer.\n\nWhen vertical is forced:\n- A model that does not fit on one device, or a single request needing more memory than a small node has.\n\nWhy horizontal is preferred for throughput:\n- Scales near-linearly with traffic, tolerates node failure, matches autoscaling. But it needs the model to be replicable and stateless.\n\nGotcha:\n- GPU nodes are expensive and scarce, so horizontal scaling of GPU services is costly and slow to provision. This is why raising per-node UTILISATION (batching, multi-tenancy) often beats adding nodes.',
  },
  {
    front: 'Load balancing and session affinity for model servers',
    back: 'Distributing requests across replicas. Usually stateless round-robin / least-connections is right.\n\nWhen affinity matters:\n- If replicas hold per-user CACHE (an LLM conversation\'s KV cache, a warmed embedding cache), routing a user consistently to the same replica (consistent hashing / sticky sessions) raises the cache hit rate dramatically.\n\nThe trade-off:\n- Affinity improves cache locality but hurts load balancing — a hot user can overload one replica, and a replica loss loses its cache.\n\nGotcha:\n- Consistent hashing minimises cache churn when replicas scale up / down (only a fraction of keys remap). Plain modulo hashing invalidates nearly every cache entry on a scale event.',
  },
  {
    front: 'Backpressure, queueing, and load shedding',
    back: 'Under overload, a serving system must degrade gracefully rather than collapse.\n\n- Backpressure: signal upstream to slow down when queues fill.\n- Load shedding: proactively REJECT excess requests (with a fast error or fallback) to protect latency for the rest.\n\nWhy shed load:\n- An unbounded queue means every request eventually times out. Better to serve 90% well and fast-fail 10% than to serve 100% past the deadline.\n\nAdmission control:\n- Reject early, before expensive feature fetches and GPU work are spent on a request that will time out anyway.\n\nGotcha:\n- A request already past its deadline should be dropped, not served — completing it wastes capacity and helps no one.',
  },
  {
    front: 'Rate limiting and quotas',
    back: 'Capping request rate per client / tenant to protect the service and ensure fair sharing.\n\nAlgorithms:\n- Token bucket: allows bursts up to a cap, refills at a steady rate. The common default.\n- Leaky bucket: smooths to a constant rate.\n\nWhy ML services need it:\n- Inference is expensive, and one abusive or buggy caller can exhaust GPU capacity for everyone. Quotas also bound cost.\n\nGotcha:\n- Enforce limits at admission (cheaply), BEFORE feature fetch and inference — enforcing them after the expensive work defeats the purpose.\n- For LLMs, limit by TOKENS, not requests — requests vary wildly in cost.',
  },
  {
    front: 'Batch (offline) inference at scale',
    back: 'Scoring a large dataset on a schedule rather than per request — the cheapest way to serve when freshness allows.\n\nHow:\n- Distributed compute (Spark, Ray, Beam) partitions the data and runs the model across many workers; results are written to a store and served by lookup.\n\nWhy far cheaper than online:\n- Perfect batching and GPU utilisation, no latency SLO, no idle capacity, trivial retries.\n\nWhen it fits:\n- The input space is enumerable and predictions stay valid for hours (daily churn scores, precomputed recommendations).\n\nGotcha:\n- The offline scoring code must use the SAME features and preprocessing as any online path, or you get skew between precomputed predictions and freshly computed ones.',
  },
  {
    front: 'Hardware selection: CPU vs GPU vs TPU vs accelerators',
    back: 'The options:\n- CPU: cheap, ubiquitous, best for small models and low QPS where a GPU would sit idle.\n- GPU: massively parallel, wins on large models and high batch throughput.\n- TPU: optimised for large dense matmuls (big training, some serving).\n- Inference accelerators (Inferentia, etc.): cost-optimised for serving specific model classes.\n\nDecision drivers:\n- Model size, batch-ability, QPS, and latency SLO. A small model at low QPS is often CHEAPER on CPU because the GPU cannot be kept busy.\n\nGotcha:\n- Benchmark on YOUR model and traffic. Vendor throughput numbers assume large batches and ideal shapes you may never hit in a latency-bound service.',
  },
  {
    front: 'Autoscaling ML services — the right signal',
    back: 'CPU utilisation, the default autoscaling signal, is a poor proxy for a GPU service — it can be low while the GPU is saturated.\n\nBetter signals:\n- GPU utilisation, request concurrency, queue depth, or inference latency against the SLO.\n\nML-specific complications:\n- Slow cold starts (model loading), expensive / scarce GPU nodes, large fixed memory footprints.\n\nTactics:\n- Keep a warm pool for baseline load and burst on top.\n- Scale on queue depth so you add capacity before latency degrades.\n- Use stabilisation windows to avoid thrashing.\n- A readiness probe that passes only after the model loads.\n\nGotcha:\n- Scaling down aggressively then hitting a traffic spike incurs cold-start latency — smooth the scale-down.',
  },
  {
    front: 'Cost optimisation levers for inference',
    back: 'Where the money goes and how to cut it:\n- Raise UTILISATION — batching and multi-tenancy so paid hardware is not idle (idle GPU time is the classic waste).\n- SMALLER models — quantise, distil, prune.\n- Move ONLINE work to BATCH where freshness allows (orders of magnitude cheaper).\n- Right-size HARDWARE — CPU for small / low-QPS.\n- CACHE repeated inputs.\n- Spot / preemptible instances for fault-tolerant batch jobs.\n\nBiggest structural win:\n- Precompute in batch instead of per-request whenever the prediction stays valid for hours.\n\nGotcha:\n- Scale-to-zero cuts idle cost but adds cold-start latency — a direct cost / latency trade to make deliberately.',
  },
  {
    front: 'Tensor, pipeline, and data parallelism for serving large models',
    back: 'When a model is too big for one device, split it. Three axes:\n- Tensor parallelism: split individual layers ACROSS GPUs (each holds a slice of the weights). Needs high-bandwidth interconnect for per-layer all-reduces.\n- Pipeline parallelism: put different LAYERS on different GPUs and stream microbatches through, keeping stages busy.\n- Data parallelism: replicate the whole model, split the BATCH. Scales throughput, not model size.\n\nWhen each:\n- Tensor-parallel within a node (fast NVLink); pipeline-parallel across nodes; data-parallel to add throughput once the model fits.\n\nGotcha:\n- Tensor parallelism\'s communication cost makes it bandwidth-bound — it needs fast interconnect or the GPUs starve.',
  },
  {
    front: 'Precompute vs on-demand (the caching/compute trade)',
    back: 'Precompute predictions or features ahead of time and serve by lookup, versus computing them per request.\n\nPrecompute when:\n- The input space is bounded and enumerable, and results stay valid for a while (user embeddings, daily scores, popular-query results). Cheap serving, but stale and storage-heavy.\n\nOn-demand when:\n- Inputs are unbounded or request-context-dependent (a novel search query, current location), or freshness is critical.\n\nHybrid is common:\n- Precompute the expensive stage (embeddings, candidate sets) in batch, do the light request-time work (ranking, filtering) online.\n\nGotcha:\n- Precomputed results need INVALIDATION when the model or features change, or you serve outputs from a retired model.',
  },
  {
    front: 'Operator fusion and kernel optimisation',
    back: 'Combining several operations into a single GPU kernel to cut memory traffic and launch overhead.\n\nWhy it is a big win:\n- GPUs are often MEMORY-bandwidth bound, not compute bound. Each separate op reads its inputs from and writes its outputs to global memory; fusing (e.g. matmul + bias + activation, or FlashAttention fusing the whole attention block) keeps intermediates in fast on-chip memory and avoids the round-trips.\n\nWhere it comes from:\n- Compilers (torch.compile, XLA, TensorRT) and hand-written fused kernels.\n\nGotcha:\n- Fusion benefits depend on tensor shapes. Tiny tensors are launch-overhead bound (fusion helps a lot); huge ones may already be compute bound (fusion helps less).',
  },
  {
    front: 'Speculative decoding (LLM latency)',
    back: 'Speeds up autoregressive LLM generation by using a small "draft" model to propose several tokens, which the large model VERIFIES in a single parallel forward pass.\n\nWhy it works:\n- Verifying k proposed tokens costs one large-model pass instead of k.\n- The large model accepts the draft\'s tokens wherever they match what it would have produced — so the output is provably IDENTICAL to normal decoding.\n\nPayoff:\n- Often 2-3× fewer large-model passes when the draft is good, with no quality loss.\n\nGotcha:\n- Gains depend on the draft\'s acceptance rate. A poor draft is rejected often, wasting its work — the draft must be cheap AND well-aligned with the target.',
  },
  {
    front: 'KV cache and continuous batching for LLM serving',
    back: 'KV cache:\n- An LLM stores the keys / values of past tokens so each new token does not recompute attention over the whole prefix — turning generation from quadratic into incremental.\n- The catch: the cache grows with sequence length and consumes large, variable GPU memory, and requests finish at different times.\n\nContinuous batching (PagedAttention / vLLM):\n- Instead of static batches, add and evict requests token-by-token and manage KV cache in paged blocks, keeping the GPU full as sequences of different lengths come and go.\n- Naive static batching wastes the GPU while long sequences finish; continuous batching can multiply throughput several-fold.\n\nGotcha:\n- KV-cache MEMORY, not compute, is often the LLM serving bottleneck.',
  },
  {
    front: 'Federated and privacy-preserving deployment',
    back: 'Federated learning:\n- Train across many devices / silos WITHOUT centralising raw data — devices compute updates locally and only aggregates are shared.\n\nWhy:\n- Privacy, regulation, and data that legally cannot leave a device or region.\n\nCosts and complications:\n- Unreliable, heterogeneous clients.\n- Non-IID data across clients (each device\'s data is unrepresentative).\n- Communication is the bottleneck.\n- Updates themselves can LEAK information, so differential privacy or secure aggregation is added.\n\nGotcha:\n- Federated does not automatically mean private — model updates can be inverted to reconstruct training data. Privacy requires explicit mechanisms (DP noise, secure aggregation), with their own accuracy cost.',
  },
]
