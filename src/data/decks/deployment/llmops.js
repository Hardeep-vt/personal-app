// Deploying and operating LLM systems (LLMOps).

export default [
  {
    front: 'TTFT vs TPOT — the two LLM latency metrics',
    back: 'Autoregressive generation has two distinct latencies. TTFT (Time To First Token): how long until the first token appears — dominated by the PREFILL of the prompt. TPOT (Time Per Output Token): the steady-state rate of subsequent tokens, dominated by DECODE.\n\nWhy split them: they have different bottlenecks and matter differently. TTFT drives perceived responsiveness (and grows with prompt length); TPOT drives how fast the answer streams out.\n\nOptimisation differs: TTFT is compute-bound on the prompt (helped by prefill optimisation, shorter prompts); TPOT is memory-bandwidth bound per token (helped by quantisation, batching, speculative decoding).\n\nGotcha: reporting a single "latency" for an LLM hides which half is slow — a long prompt kills TTFT even when TPOT is fine.',
  },
  {
    front: 'Streaming responses (SSE) for LLMs',
    back: 'Tokens are streamed to the client as they are generated (Server-Sent Events or chunked HTTP) rather than waiting for the full response.\n\nWhy: total generation can take seconds, but streaming shows the first token in a fraction of that (TTFT), so perceived latency collapses even though total time is unchanged.\n\nImplications for infra: connections are long-lived (affects load balancing, timeouts, and connection limits), and you must handle mid-stream cancellation (user stops, so stop generating and free the GPU slot).\n\nGotcha: output validation/guardrails are harder when streaming — you have already sent tokens before you can check the whole output. Either buffer for validation (losing the latency win) or validate incrementally.',
  },
  {
    front: 'RAG serving architecture',
    back: 'Retrieval-Augmented Generation: at request time, retrieve relevant documents (vector search over an index) and inject them into the prompt so the LLM answers from current, specific knowledge.\n\nWhy: grounds the model in up-to-date, proprietary, or citable facts without retraining, and reduces hallucination.\n\nServing pieces: an embedding model, a vector database (ANN search), a retriever/re-ranker, and the LLM — a multi-stage inference pipeline with its own latency budget per stage.\n\nGotchas: retrieval QUALITY caps answer quality (garbage retrieved → confident wrong answer); the index must be kept fresh; and stuffing too many documents blows the context window and TTFT. Retrieval is usually the failure point, not the LLM.',
  },
  {
    front: 'Vector databases in production',
    back: 'Stores embeddings and serves approximate nearest-neighbour search for retrieval/semantic-search.\n\nProduction concerns: ANN index type (HNSW: fast, memory-heavy; IVF/PQ: compressed, some recall loss), recall-vs-latency tuning (efSearch/nprobe), and index FRESHNESS — new documents are invisible until indexed.\n\nOperational realities: rebuilding/updating indexes at scale, metadata filtering combined with vector search, and sharding as the corpus grows.\n\nGotcha: if you re-embed with a new embedding model, EVERY vector must be recomputed and the whole index rebuilt — embeddings from different models are not comparable. Plan embedding-model upgrades as full reindex migrations.',
  },
  {
    front: 'Semantic caching for LLMs',
    back: 'Caching LLM responses keyed by the MEANING of the query (embedding similarity) rather than exact string match, so paraphrased repeats hit the cache.\n\nWhy: LLM calls are expensive and slow, and many queries are near-duplicates. An exact-match cache misses "reset my password" vs "how do I reset password"; a semantic cache catches both.\n\nHow: embed the query, find a cached entry within a similarity threshold, return it.\n\nGotchas: the similarity threshold is a precision/recall trade — too loose returns a wrong cached answer for a subtly different question (dangerous); too tight and hit rate collapses. And cached answers can go stale if the underlying knowledge changed. Not safe for personalised or context-dependent responses.',
  },
  {
    front: 'Guardrails and output validation for LLMs',
    back: 'Checks around an LLM to constrain inputs and outputs: input filters (prompt-injection, PII, disallowed content), and output validation (format/schema conformance, toxicity, factuality, policy).\n\nWhy: LLMs are non-deterministic and can produce harmful, malformed, or off-policy output. Downstream systems expecting valid JSON break when the model emits prose.\n\nApproaches: schema-constrained decoding (force valid JSON), classifier guardrails on input/output, regex/rule validators, and a second LLM as a judge.\n\nGotchas: guardrails add latency and can be bypassed (jailbreaks); constrained decoding guarantees format but not correctness; and streaming makes output validation hard because tokens are sent before the full output can be checked.',
  },
  {
    front: 'Prompt versioning and management',
    back: 'Treating prompts as versioned, tested artifacts — not strings hardcoded in application code.\n\nWhy: a prompt is effectively model configuration that strongly determines behaviour. Changing it changes outputs, so it needs versioning, review, testing, and the ability to roll back — exactly like model weights.\n\nPractices: store prompts in a registry with versions, evaluate a prompt change against a test set before shipping, and log which prompt version produced each output.\n\nGotcha: teams edit prompts casually in code and ship untested changes that silently shift behaviour across every user. And a prompt tuned for one model version can degrade when the underlying model is updated — prompt and model version are coupled.',
  },
  {
    front: 'LLM evaluation in production',
    back: 'Measuring LLM output quality, which is hard because there is usually no single correct answer.\n\nApproaches: reference-based metrics (weak for open-ended text), LLM-AS-JUDGE (another model scores outputs against a rubric — scalable but has its own biases), human evaluation (gold standard, expensive), and task-specific checks (did the extracted JSON match, did the code run).\n\nProduction signals: user feedback (thumbs, edits, regenerations), task success rates, and guardrail trigger rates.\n\nGotchas: LLM judges are biased (favour longer answers, their own style, position) and must themselves be validated against humans; and offline eval sets go stale as usage patterns shift. Build a living eval set from real traffic.',
  },
  {
    front: 'Hallucination monitoring and mitigation',
    back: 'Hallucination: an LLM producing fluent, confident, and FALSE content.\n\nWhy it is hard operationally: the output looks correct, so it passes casual review; and the model gives no reliable internal signal of when it is fabricating.\n\nMitigations: RAG grounding (answer from retrieved sources), citation/attribution (force claims to reference provided context), constrained tasks, and lower temperature for factual work.\n\nMonitoring: factuality checks against sources, groundedness scoring (is the answer supported by retrieved context?), and user-correction signals.\n\nGotcha: RAG reduces but does not eliminate hallucination — the model can still ignore or misread retrieved context, or confidently answer when retrieval returned nothing relevant. Detecting "should have abstained" is the hard part.',
  },
  {
    front: 'Token cost management',
    back: 'LLM cost scales with TOKENS (input + output), so cost control means token control.\n\nLevers: shorter prompts (trim boilerplate, retrieve fewer/better documents), cap output length, cache (exact and semantic), route easy queries to smaller/cheaper models, and batch where latency allows.\n\nWhy prompt length matters doubly: long prompts cost input tokens AND raise TTFT (more prefill), so bloated context hurts both cost and latency.\n\nMonitoring: track tokens per request by route/feature, not just request counts — one feature with huge contexts can dominate the bill.\n\nGotcha: rate-limit and quota by TOKENS, not requests — requests vary 100x in cost, so a request-based limit lets an expensive caller blow the budget.',
  },
  {
    front: 'Model gateway and multi-provider routing',
    back: 'A gateway/proxy in front of one or more LLM providers that centralises routing, retries, fallback, rate limiting, caching, logging, and cost tracking.\n\nWhy: decouples application code from specific providers, enables failover when a provider is down or rate-limits you, and lets you route by cost/quality (cheap model for easy tasks, strong model for hard ones).\n\nWhat it centralises: auth/keys, per-team quotas, prompt/response logging, and observability across providers.\n\nGotchas: providers differ in APIs, tokenisation, and behaviour, so "just switch providers" changes outputs — the gateway abstracts the interface, not the behaviour. And the gateway itself becomes a critical single point of failure that must be highly available.',
  },
  {
    front: 'Retries, timeouts, and fallbacks for LLM calls',
    back: 'LLM APIs are slow, rate-limited, and occasionally fail, so robust calling logic is essential.\n\nPatterns: timeouts sized to expected generation length (a streaming call can legitimately take many seconds); retries with EXPONENTIAL BACKOFF and jitter on rate limits/5xx; a circuit breaker to stop hammering a failing provider; and fallbacks (a cheaper model, a cached answer, or a graceful degraded response).\n\nGotchas: naive retries on a timeout can DOUBLE-charge you (the first call may still complete server-side) and amplify load during an outage; retrying a non-idempotent action (an agent that took a side effect) repeats the side effect. Make retried operations idempotent, and back off aggressively during provider incidents.',
  },
  {
    front: 'Context window management',
    back: 'LLMs have a bounded context; prompts plus retrieved content plus history must fit, and cost/latency rise with length.\n\nStrategies: truncation (drop oldest), summarisation of history, retrieval of only the most relevant chunks rather than everything, and sliding windows for long conversations.\n\nThe "lost in the middle" effect: models attend most to the START and END of context and can MISS information buried in the middle — so ordering matters, not just fitting.\n\nGotchas: simply using a bigger context window is not free — it raises cost and TTFT and can DILUTE attention, sometimes lowering answer quality. More context is not automatically better; relevant, well-ordered context is.',
  },
  {
    front: 'Prompt injection and LLM input security',
    back: 'Prompt injection: malicious instructions embedded in the input (or in retrieved/tool-returned content) that hijack the model — "ignore previous instructions and..."\n\nWhy it is dangerous in deployed systems: an LLM with tools or data access can be tricked into exfiltrating data, misusing tools, or bypassing policy. INDIRECT injection (poisoned content the model retrieves, e.g. a web page or document) is especially insidious — the attack rides in on data, not the user\'s message.\n\nDefences: treat all retrieved/tool content as untrusted, separate instructions from data, least-privilege tool access, output filtering, and human confirmation for high-impact actions.\n\nGotcha: there is no complete fix — injection is an open problem, so design for LEAST PRIVILEGE and assume the model can be manipulated.',
  },
  {
    front: 'Fine-tuning vs RAG vs prompting in production',
    back: 'Three ways to adapt an LLM, with different operational profiles.\n\nPROMPTING: fastest to change, no training, but limited by context window and cost per call. RAG: injects fresh/proprietary knowledge at query time, updates by re-indexing (no retraining), best for factual grounding. FINE-TUNING: bakes in behaviour/style/format, cheaper per call (shorter prompts), but needs training data and a retrain to update, and can degrade general ability.\n\nDecision heuristic: prompt first; add RAG for knowledge and grounding; fine-tune for consistent format/behaviour or to cut per-call cost at scale. They COMBINE — fine-tune for behaviour, RAG for facts.\n\nGotcha: fine-tuning to add KNOWLEDGE is often the wrong tool — it is expensive, stale immediately, and hallucination-prone; RAG fits knowledge better.',
  },
]
