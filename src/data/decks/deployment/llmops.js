// Deploying and operating LLM systems (LLMOps).

export default [
  {
    front: 'TTFT vs TPOT — the two LLM latency metrics',
    back: 'An LLM generates one token at a time, so it has two distinct latencies:\n- TTFT (Time To First Token): how long until the first token appears. Dominated by the PREFILL of the prompt.\n- TPOT (Time Per Output Token): the steady-state rate of every token after that. Dominated by DECODE.\n\nWhy split them:\n- TTFT drives perceived responsiveness and grows with prompt length.\n- TPOT drives how fast the answer streams out.\n\nDifferent bottlenecks:\n- TTFT is compute-bound on the prompt — helped by shorter prompts and prefill optimisation.\n- TPOT is memory-bandwidth bound per token — helped by quantisation, batching, speculative decoding.\n\nGotcha:\n- A single "latency" number hides which half is slow. A long prompt kills TTFT even when TPOT is fine.',
  },
  {
    front: 'Streaming responses (SSE) for LLMs',
    back: 'Tokens are sent to the client as they are generated (Server-Sent Events or chunked HTTP) rather than waiting for the whole response.\n\nWhy:\n- Total generation can take seconds, but streaming shows the first token in a fraction of that (TTFT), so perceived latency collapses even though total time is unchanged.\n\nInfra implications:\n- Connections are long-lived — affects load balancing, timeouts, and connection limits.\n- You must handle mid-stream cancellation (user stops → stop generating, free the GPU slot).\n\nGotcha:\n- Output validation / guardrails are harder — you have already sent tokens before you can check the whole output. Either buffer for validation (losing the latency win) or validate incrementally.',
  },
  {
    front: 'RAG serving architecture',
    back: 'Retrieval-Augmented Generation: at request time, retrieve relevant documents (vector search over an index) and inject them into the prompt, so the LLM answers from current, specific knowledge.\n\nWhy:\n- Grounds the model in up-to-date, proprietary, or citable facts without retraining, and reduces hallucination.\n\nServing pieces:\n- An embedding model, a vector database (ANN search), a retriever / re-ranker, and the LLM — a multi-stage pipeline with its own latency budget per stage.\n\nGotchas:\n- Retrieval QUALITY caps answer quality — garbage retrieved → confident wrong answer.\n- The index must be kept fresh.\n- Too many documents blow the context window and TTFT.\n- Retrieval is usually the failure point, not the LLM.',
  },
  {
    front: 'Vector databases in production',
    back: 'Stores embeddings and serves approximate nearest-neighbour search for retrieval / semantic search.\n\nProduction concerns:\n- ANN index type — HNSW (fast, memory-heavy) vs IVF / PQ (compressed, some recall loss).\n- Recall-vs-latency tuning (efSearch / nprobe).\n- Index FRESHNESS — new documents are invisible until indexed.\n\nOperational realities:\n- Rebuilding / updating indexes at scale, metadata filtering combined with vector search, sharding as the corpus grows.\n\nGotcha:\n- Re-embedding with a new embedding model means EVERY vector must be recomputed and the whole index rebuilt — embeddings from different models are not comparable. Plan embedding-model upgrades as full reindex migrations.',
  },
  {
    front: 'Semantic caching for LLMs',
    back: 'Caching LLM responses keyed by the MEANING of the query (embedding similarity) rather than an exact string match, so paraphrased repeats hit the cache.\n\nWhy:\n- LLM calls are expensive and slow, and many queries are near-duplicates. An exact-match cache misses "reset my password" vs "how do I reset password"; a semantic cache catches both.\n\nHow:\n- Embed the query, find a cached entry within a similarity threshold, return it.\n\nGotchas:\n- The similarity threshold is a precision / recall trade — too loose returns a wrong cached answer for a subtly different question (dangerous); too tight and the hit rate collapses.\n- Cached answers can go stale if the underlying knowledge changed.\n- Not safe for personalised or context-dependent responses.',
  },
  {
    front: 'Guardrails and output validation for LLMs',
    back: 'Checks placed around an LLM to constrain its inputs and outputs:\n- Input filters: prompt-injection, PII, disallowed content.\n- Output validation: format / schema conformance, toxicity, factuality, policy.\n\nWhy:\n- LLMs are non-deterministic and can produce harmful, malformed, or off-policy output. A downstream system expecting valid JSON breaks when the model emits prose.\n\nApproaches:\n- Schema-constrained decoding (force valid JSON), classifier guardrails on input / output, regex / rule validators, a second LLM as a judge.\n\nGotchas:\n- Guardrails add latency and can be bypassed (jailbreaks).\n- Constrained decoding guarantees format but not correctness.\n- Streaming makes output validation hard — tokens are sent before the full output can be checked.',
  },
  {
    front: 'Prompt versioning and management',
    back: 'Treating prompts as versioned, tested artefacts — not strings hardcoded in application code.\n\nWhy:\n- A prompt is effectively model configuration that strongly determines behaviour. Changing it changes outputs, so it needs versioning, review, testing, and the ability to roll back — exactly like model weights.\n\nPractices:\n- Store prompts in a registry with versions.\n- Evaluate a prompt change against a test set before shipping.\n- Log which prompt version produced each output.\n\nGotcha:\n- Teams edit prompts casually in code and ship untested changes that silently shift behaviour for every user. And a prompt tuned for one model version can degrade when the underlying model is updated — prompt and model version are coupled.',
  },
  {
    front: 'LLM evaluation in production',
    back: 'Measuring LLM output quality, hard because there is usually no single correct answer.\n\nApproaches:\n- Reference-based metrics — weak for open-ended text.\n- LLM-AS-JUDGE — another model scores outputs against a rubric. Scalable, but has its own biases.\n- Human evaluation — gold standard, expensive.\n- Task-specific checks — did the extracted JSON match, did the code run.\n\nProduction signals:\n- User feedback (thumbs, edits, regenerations), task success rates, guardrail trigger rates.\n\nGotchas:\n- LLM judges are biased (favour longer answers, their own style, position) and must be validated against humans.\n- Offline eval sets go stale as usage shifts — build a living eval set from real traffic.',
  },
  {
    front: 'Hallucination monitoring and mitigation',
    back: 'Hallucination: an LLM producing fluent, confident, and FALSE content.\n\nWhy it is hard operationally:\n- The output looks correct, so it passes casual review.\n- The model gives no reliable internal signal of when it is fabricating.\n\nMitigations:\n- RAG grounding (answer from retrieved sources).\n- Citation / attribution (force claims to reference provided context).\n- Constrained tasks and lower temperature for factual work.\n\nMonitoring:\n- Factuality checks against sources, groundedness scoring (is the answer supported by retrieved context?), and user-correction signals.\n\nGotcha:\n- RAG reduces but does not eliminate hallucination — the model can still ignore or misread retrieved context, or answer confidently when retrieval returned nothing relevant. Detecting "should have abstained" is the hard part.',
  },
  {
    front: 'Token cost management',
    back: 'LLM cost scales with TOKENS (input + output), so cost control means token control.\n\nLevers:\n- Shorter prompts (trim boilerplate, retrieve fewer / better documents).\n- Cap output length.\n- Cache (exact and semantic).\n- Route easy queries to smaller / cheaper models.\n- Batch where latency allows.\n\nWhy prompt length matters doubly:\n- Long prompts cost input tokens AND raise TTFT (more prefill) — so bloated context hurts both cost and latency.\n\nMonitoring:\n- Track tokens per request by route / feature, not just request counts — one feature with huge contexts can dominate the bill.\n\nGotcha:\n- Rate-limit and quota by TOKENS, not requests — requests vary 100× in cost.',
  },
  {
    front: 'Model gateway and multi-provider routing',
    back: 'A proxy in front of one or more LLM providers that centralises routing, retries, fallback, rate limiting, caching, logging, and cost tracking.\n\nWhy:\n- Decouples application code from specific providers.\n- Enables failover when a provider is down or rate-limits you.\n- Lets you route by cost / quality — cheap model for easy tasks, strong model for hard ones.\n\nWhat it centralises:\n- Auth / keys, per-team quotas, prompt / response logging, and cross-provider observability.\n\nGotchas:\n- Providers differ in APIs, tokenisation, and behaviour, so "just switch providers" changes outputs — the gateway abstracts the interface, not the behaviour.\n- The gateway itself becomes a critical single point of failure that must be highly available.',
  },
  {
    front: 'Retries, timeouts, and fallbacks for LLM calls',
    back: 'LLM APIs are slow, rate-limited, and occasionally fail, so robust calling logic is essential.\n\nPatterns:\n- Timeouts sized to expected generation length (a streaming call can legitimately take many seconds).\n- Retries with EXPONENTIAL BACKOFF and jitter on rate limits / 5xx.\n- A circuit breaker to stop hammering a failing provider.\n- Fallbacks — a cheaper model, a cached answer, or a graceful degraded response.\n\nGotchas:\n- A naive retry on timeout can DOUBLE-charge you (the first call may still complete server-side) and amplify load during an outage.\n- Retrying a non-idempotent action (an agent that took a side effect) repeats the side effect. Make retried operations idempotent, and back off aggressively during provider incidents.',
  },
  {
    front: 'Context window management',
    back: 'An LLM has a bounded context; prompt + retrieved content + history must all fit, and cost and latency rise with length.\n\nStrategies:\n- Truncation (drop oldest).\n- Summarisation of history.\n- Retrieval of only the most relevant chunks rather than everything.\n- Sliding windows for long conversations.\n\nThe "lost in the middle" effect:\n- Models attend most to the START and END of the context and can MISS information buried in the middle — so ordering matters, not just fitting.\n\nGotcha:\n- A bigger context window is not free — it raises cost and TTFT and can DILUTE attention, sometimes lowering answer quality. Relevant, well-ordered context beats more context.',
  },
  {
    front: 'Prompt injection and LLM input security',
    back: 'Prompt injection: malicious instructions embedded in the input (or in retrieved / tool-returned content) that hijack the model — "ignore previous instructions and…".\n\nWhy it is dangerous in deployed systems:\n- An LLM with tools or data access can be tricked into exfiltrating data, misusing tools, or bypassing policy.\n- INDIRECT injection — poisoned content the model retrieves (a web page, a document) — is especially insidious, because the attack rides in on data, not the user\'s message.\n\nDefences:\n- Treat all retrieved / tool content as untrusted.\n- Separate instructions from data.\n- Least-privilege tool access.\n- Output filtering, and human confirmation for high-impact actions.\n\nGotcha:\n- There is no complete fix. Design for LEAST PRIVILEGE and assume the model can be manipulated.',
  },
  {
    front: 'Fine-tuning vs RAG vs prompting in production',
    back: 'Three ways to adapt an LLM, with different operational profiles:\n- PROMPTING: fastest to change, no training, but limited by context window and cost per call.\n- RAG: injects fresh / proprietary knowledge at query time, updates by re-indexing (no retraining), best for factual grounding.\n- FINE-TUNING: bakes in behaviour / style / format, cheaper per call (shorter prompts), but needs training data and a retrain to update, and can degrade general ability.\n\nDecision heuristic:\n- Prompt first; add RAG for knowledge and grounding; fine-tune for consistent format / behaviour or to cut per-call cost at scale.\n- They COMBINE — fine-tune for behaviour, RAG for facts.\n\nGotcha:\n- Fine-tuning to add KNOWLEDGE is usually the wrong tool — expensive, stale immediately, hallucination-prone. RAG fits knowledge better.',
  },
]
