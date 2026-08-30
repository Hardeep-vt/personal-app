// Serving infrastructure and inference optimisation.

export default [
  {
    front: 'Model server vs embedded model',
    back: 'Two ways to run a model in an application:\n- Embedded: the model runs inside the app process (load the artefact, call predict).\n- Model server: a separate service the app calls over the network (TF Serving, TorchServe, Triton, KServe).\n\nWhy separate it:\n- Independent scaling and hardware (app on CPU, model on GPU).\n- One model shared by many services.\n- Model updates without redeploying the app.\n\nCost of separating:\n- A network hop of added latency, plus serialisation and a service to operate.\n\nRule of thumb:\n- Embed for tiny models on the hot path where latency is precious.\n- Use a server once the model needs a GPU, is shared, or is updated on its own cadence.',
  },
  {
    front: 'REST vs gRPC for model serving',
    back: 'Two API styles:\n- REST / JSON: human-readable, universally supported, easy to debug.\n- gRPC: binary protobuf over HTTP/2, with streaming and multiplexing.\n\nWhy gRPC wins internally:\n- Protobuf is far more compact than JSON, so serialising large tensors is much cheaper.\n- HTTP/2 multiplexing avoids head-of-line blocking.\n- For a high-QPS embedding or feature payload the encoding cost alone is significant.\n\nWhen REST is fine:\n- Low QPS, small payloads, public or browser-facing APIs, or when debuggability matters more than microseconds.\n\nGotcha:\n- JSON cannot represent raw binary efficiently — base64 inflates tensors ~33% and adds encode / decode cost on both ends.',
  },
  {
    front: 'Inference graph optimisation (ONNX, TensorRT, torch.compile)',
    back: 'Convert a trained model into an optimised execution graph: fuse operators, fold constants, pick fast kernels, and specialise for the target hardware.\n\nMechanism:\n- Operator FUSION is the big win — conv + bias + ReLU becomes one kernel, cutting memory round-trips.\n- Constant folding precomputes anything not input-dependent.\n\nTools:\n- ONNX as a portable interchange format; TensorRT for NVIDIA GPUs; ONNX Runtime cross-platform; torch.compile / XLA graph capture.\n\nGotchas:\n- Dynamic shapes defeat many optimisations — some engines specialise per shape, so variable batch sizes trigger recompiles.\n- Numerical results can differ slightly from the training framework, so re-validate accuracy after conversion.',
  },
  {
    front: 'ONNX as an interchange format',
    back: 'A framework-agnostic graph format. Export from PyTorch / TF / sklearn, run anywhere with an ONNX runtime.\n\nWhy it helps:\n- Decouples training framework from serving runtime. You can train in PyTorch and serve with a lean C++ runtime that has no Python and no PyTorch dependency, cutting image size and cold start.\n\nGotchas:\n- Not every operator or custom layer has an ONNX equivalent, so exotic models fail to export or fall back to slow paths.\n- Opset version mismatches between exporter and runtime cause subtle failures.\n- Control flow (loops, conditionals) exports poorly.\n\nAlways:\n- Re-run your eval set through the exported model — export is a re-implementation and can silently change outputs.',
  },
  {
    front: 'Cold start in model serving',
    back: 'The first request after a new instance spins up is slow because the model must be loaded into memory (and onto the GPU), the runtime initialised, and caches warmed.\n\nWhy it bites:\n- Loading a multi-GB model can take tens of seconds. With scale-to-zero or autoscaling, real user requests hit cold instances and see huge tail latency.\n\nMitigations:\n- A readiness probe that passes only AFTER the model is loaded (so traffic never routes to a not-ready pod).\n- A warm pool of pre-loaded instances for baseline traffic.\n- Model warmup — a synthetic request to trigger lazy GPU allocation and kernel compilation.\n- mmap / lazy weight loading.\n\nGotcha:\n- Scale-to-zero saves money but reintroduces cold starts — a direct cost / latency trade.',
  },
  {
    front: 'Model warmup',
    back: 'Sending synthetic requests to a freshly loaded model before it takes real traffic.\n\nWhy it is necessary:\n- The first real inference triggers one-time costs — lazy CUDA context creation, JIT kernel compilation, cuDNN autotuning, cache population. Without warmup, the first users eat all of it as latency.\n\nHow:\n- Run representative inputs (including the shapes and batch sizes you expect) at startup, gated behind the readiness probe so traffic waits.\n\nGotcha:\n- Warm with the ACTUAL production shapes. If you warm with batch size 1 but serve batch 32, the batch-32 kernels compile on the first real batch and that request is slow anyway.',
  },
  {
    front: 'GPU utilisation and why batch size 1 wastes the GPU',
    back: 'A GPU is a massively parallel device; a single small request leaves most of its compute idle while kernel-launch and memory-transfer overhead dominate.\n\nMechanism:\n- Throughput rises with batch size until the GPU saturates, so a batch of 32 often costs barely more wall-clock time than a batch of 1.\n- Serving at batch 1 can waste 90%+ of the hardware you are paying for.\n\nLevers:\n- Dynamic batching to fill batches.\n- MPS or time-slicing to share one GPU across processes.\n- MIG to partition a GPU into isolated instances.\n\nGotcha:\n- Measure GPU utilisation, not just CPU. A GPU service can show low CPU and still be the bottleneck — or be paid-for and idle.',
  },
  {
    front: 'Multi-tenancy on GPUs (MPS, MIG, time-slicing)',
    back: 'Sharing one physical GPU across multiple models or tenants to raise utilisation.\n\nOptions:\n- TIME-SLICING: interleaves work. Simple, but no isolation — one tenant can starve another.\n- MPS (Multi-Process Service): runs kernels from several processes concurrently for better throughput.\n- MIG: partitions the GPU into hardware-isolated instances with dedicated memory and compute.\n\nTrade-off:\n- MIG gives predictable isolation but fixed partition sizes waste capacity.\n- MPS packs better but leaks interference.\n- Time-slicing is cheapest and least safe.\n\nWhen it matters:\n- Many small models that each underuse a full GPU. Consolidating them is often the biggest single cost saving in ML serving.',
  },
  {
    front: 'Throughput vs latency — the fundamental serving trade-off',
    back: 'Optimising one usually hurts the other.\n- Batching raises throughput (requests / sec) but adds queueing latency.\n- Small batches cut latency but waste hardware.\n\nMechanism:\n- They answer different questions. Latency is per-request wall time; throughput is aggregate work per unit cost. A batch-serving pipeline maximises throughput; a real-time API is latency-bound.\n\nHow to reason:\n- Set a latency SLO (p99), then maximise throughput WITHIN that budget — tune max batch size and max wait time so the batch either fills or times out before the budget is spent.\n\nGotcha:\n- Reporting mean latency hides the queueing tail that batching creates. Hold the SLO on p99.',
  },
  {
    front: 'Mixed-precision and lower-precision inference',
    back: 'Run inference in FP16 / BF16 instead of FP32: half the memory, and much faster matmuls on tensor-core hardware.\n\nBF16 vs FP16:\n- BF16 keeps FP32\'s exponent RANGE (fewer overflow / underflow issues) at the cost of mantissa precision.\n- FP16 has more precision but a narrow range that can overflow.\n- BF16 is usually the safer default for inference.\n\nWhy it is nearly free:\n- Inference tolerates low precision far better than training — there is no gradient accumulation to destabilise.\n\nGotchas:\n- Some ops (softmax, layernorm, reductions) still need FP32 for numerical stability — hence "mixed" precision.\n- Validate accuracy; occasionally a layer is precision-sensitive.',
  },
  {
    front: 'Model loading: memory-mapping and lazy loading',
    back: 'Loading a large model naively reads the whole file into process memory, which is slow and duplicates it per process.\n\n- mmap: map the weights file into the address space so the OS pages them in on demand and SHARES one copy across processes via the page cache. Multiple workers on a box then share physical memory instead of each holding a full copy.\n- Lazy loading: bring layers into GPU memory only as needed, enabling models larger than a single device via offloading.\n\nGotcha:\n- mmap makes the FIRST access to each page a disk read, so cold latency shifts into early requests — pair it with warmup.\n- Offloading to CPU / disk trades memory for large latency hits.',
  },
  {
    front: 'Concurrency model: sync, async, and worker pools',
    back: 'A serving process must handle many in-flight requests. The model call is often GPU-bound (releases the GIL) while I/O — feature fetches, network — is waiting.\n\nPatterns:\n- A thread / worker pool sized to the hardware.\n- ASYNC I/O so feature fetches and downstream calls do not block a worker.\n- A dedicated inference thread or process that batches across concurrent requests.\n\nKey point:\n- Separate the I/O-bound part (async, high concurrency) from the compute-bound inference (batched, bounded by hardware). Conflating them wastes both.\n\nGotcha:\n- Too many worker processes each loading the model exhausts GPU memory; too few underutilise it. The right count balances GPU memory against concurrency.',
  },
  {
    front: 'Serverless inference — when it fits and when it does not',
    back: 'Fully managed, scale-to-zero, pay-per-request functions running the model.\n\nFits:\n- Spiky or low traffic, where paying for idle instances dominates cost, and where occasional cold-start latency is acceptable.\n\nDoes NOT fit:\n- Steady high traffic (always-on is cheaper).\n- Strict low-latency paths (cold starts, no warm GPU).\n- Large models (load time and memory limits).\n\nGotchas:\n- GPU support is limited and expensive on serverless.\n- The model artefact must fit deployment size limits or be fetched at cold start (adding seconds).\n- Per-request billing can exceed provisioned cost above a surprisingly low QPS.\n\nDecision:\n- Estimate cost at your real QPS both ways — the crossover is often lower than expected.',
  },
  {
    front: 'Ensemble and DAG serving (inference pipelines)',
    back: 'Real predictions often chain steps: preprocess → embed → model → business-rules post-process, sometimes across several models.\n\nApproaches:\n- An inference graph / ensemble in the server (Triton ensembles, KServe inference graphs) runs the DAG close to the hardware, avoiding network hops between stages.\n- Alternatively an orchestration service calls each stage.\n\nWhy in-server helps:\n- Intermediate tensors stay on-device instead of being serialised across the network between every step.\n\nGotchas:\n- A chain is only as fast as its slowest stage, and each stage is a failure point — you need per-stage timeouts and fallbacks.\n- Version the WHOLE graph, since changing one stage changes end-to-end behaviour.',
  },
  {
    front: 'Preprocessing parity — the tokeniser/transform trap',
    back: 'The exact preprocessing used in training must run identically at serving: tokenisation, normalisation, image resizing, categorical encoding.\n\nWhy it silently breaks:\n- Training preprocessing is often Python / pandas, while serving may be a different language or library. A different resize interpolation, a mismatched normalisation constant, or a tokeniser version bump shifts inputs subtly — accuracy drops with no error.\n\nFixes:\n- Package preprocessing WITH the model (as graph ops, or a shared library both paths use).\n- Pin exact versions.\n- Add an online / offline consistency check on the TRANSFORMED features, not just raw inputs.\n\nGotcha:\n- This is training/serving skew hiding in the preprocessing layer — the most common place it lurks.',
  },
  {
    front: 'Edge and on-device inference',
    back: 'Running the model on the user\'s device (phone, browser, IoT) instead of a server.\n\nWhy:\n- Near-zero network latency, privacy (data never leaves the device), offline capability, and no per-request server cost.\n\nCosts:\n- Tight compute / memory / battery budgets force heavy compression (quantisation, pruning, distillation).\n- You cannot easily update the model or gather centralised labels.\n- Device heterogeneity means many hardware targets.\n\nTooling:\n- TF Lite, Core ML, ONNX Runtime Mobile, WebGPU / WASM in the browser.\n\nGotcha:\n- Shipping the model to the client means it can be extracted and reverse-engineered — do not put anything secret in on-device weights, and expect the model itself to leak.',
  },
]
