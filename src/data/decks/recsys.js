// Recommendation system concepts for ML engineering interviews.
// Heavy emphasis on the bias/feedback-loop failure modes, which interviewers probe hard.

export default {
  deck: 'Recommendation Systems',
  cards: [
    {
      front: 'Collaborative filtering — user-based vs item-based',
      back: 'Recommend using patterns of behaviour across users, with no content features at all.\n- User-based: find users similar to you, recommend what they liked.\n- Item-based: find items co-liked by the same users, recommend those.\n\nWhy item-based in production:\n- Item-item similarities are far more stable over time than user tastes, so they can be precomputed and cached.\n\nStrength:\n- Discovers non-obvious associations no content feature would reveal.\n\nWeakness:\n- Total cold start — a brand-new item has no interactions, so it is invisible.',
    },
    {
      front: 'Matrix factorization (ALS / SVD-style)',
      back: 'Factor the sparse user-item interaction matrix R (n×m) into two thin matrices U (n×k) and V (m×k) so that R ≈ U·Vᵀ.\n- Each user and each item becomes a k-dimensional latent vector; a prediction is their dot product.\n\nMechanism:\n- k is far smaller than n or m, so the model is forced to compress taste into a few latent factors — it generalises rather than memorising.\n\nWhy ALS (alternating least squares):\n- Fix U and solving for V is a plain least-squares problem, and vice versa. Alternating is convex in each step and parallelises well.\n\nGotcha:\n- "SVD" in recsys is not true SVD — the matrix is mostly MISSING, not zero.',
    },
    {
      front: 'Implicit vs explicit feedback',
      back: 'Two kinds of training signal:\n- Explicit: the user states a preference (a star rating).\n- Implicit: behaviour is used as a proxy (click, watch, purchase, dwell time).\n\nThe hard part of implicit:\n- There are NO TRUE NEGATIVES. A non-click may mean dislike, or simply never seen. Absence of interaction is ambiguous.\n\nStandard treatment:\n- Treat unobserved pairs as weak negatives with low confidence, and observed ones with confidence that rises with interaction strength (e.g. c = 1 + α·r).\n\nPitfall:\n- Labelling everything unseen as a hard negative teaches the model that unpopular-but-relevant items are bad.',
    },
    {
      front: 'Content-based filtering, and hybrid recommenders',
      back: 'Content-based: score items by feature similarity to what the user already liked (text, category, embeddings), ignoring other users entirely.\n\nStrength:\n- Handles new items immediately — features exist before any interaction does. Also explainable.\n\nWeakness:\n- Over-specialisation. It keeps recommending more of the same and never surprises the user.\n\nHybrid:\n- Combine with collaborative signals — a weighted blend, switching by data availability, or one model taking both as features.\n- Almost every production system is a hybrid: content covers cold start, collaborative filtering drives quality once data arrives.',
    },
    {
      front: 'Cold start — the three kinds',
      back: 'Three distinct "no data yet" problems:\n- New USER: no history.\n- New ITEM: no interactions.\n- New SYSTEM: no data at all.\n\nFixes by type:\n- New user: onboarding preferences, demographics, popularity / trending defaults, contextual bandits to learn fast.\n- New item: content features and embeddings, plus deliberate exploration traffic.\n- New system: content-based or rules until interaction data accumulates.\n\nMechanism:\n- Cold start is fundamentally an EXPLORATION problem — you cannot learn about an item you never show.\n\nGotcha:\n- A pure exploit policy makes item cold start permanent: new items never get impressions to earn a ranking.',
    },
    {
      front: 'Two-stage architecture: candidate generation → ranking',
      back: 'Split recommendation into two passes with different objectives:\n- Stage 1 (retrieval): cheaply narrow millions of items to a few hundred. Optimised for RECALL.\n- Stage 2 (ranking): apply an expensive, feature-rich model to those few hundred. Optimised for PRECISION at the top.\n\nWhy the split:\n- You cannot run a heavy model over the whole catalogue within a latency budget. Cost per item forces it.\n\nKey consequence:\n- THE RANKER CAN ONLY BE AS GOOD AS RETRIEVAL. Anything retrieval misses is unrecoverable, so measure recall@K of the candidate stage separately.\n\nOften:\n- A third re-ranking stage adds diversity and business rules.',
    },
    {
      front: 'Two-tower model',
      back: 'Two separate encoders: one for the user / context, one for the item. Trained so the dot product (or cosine) of their embeddings predicts relevance.\n\nWhy it dominates retrieval:\n- The towers are INDEPENDENT. Item embeddings are precomputed offline for the whole catalogue; at request time you encode only the user and run an approximate nearest-neighbour search. That makes million-item retrieval feasible in milliseconds.\n\nTrade-off:\n- Because the towers never interact until the final dot product, it cannot model fine-grained user-item feature crosses — which is exactly what the ranking stage adds.',
    },
    {
      front: 'Approximate nearest neighbour search (HNSW, IVF, FAISS)',
      back: 'Finds near-neighbours in embedding space WITHOUT scanning every item — trading a little recall for orders-of-magnitude speed.\n\nMain methods:\n- HNSW: a navigable small-world graph; greedy descent through layers. Excellent recall / latency, memory-hungry.\n- IVF: cluster the space, search only the nearest few cells.\n- PQ (product quantization): compress the vectors to cut memory, at some accuracy cost.\n\nKnobs:\n- efSearch / nprobe trade recall against latency at query time.\n\nGotcha:\n- Index freshness. New items are invisible until the index is rebuilt, so an ANN index quietly reintroduces item cold start.',
    },
    {
      front: 'Popularity bias',
      back: 'Popular items get recommended far more than their true relevance warrants.\n\nMechanism:\n- Popular items have the most interaction data, so the model is most confident about them.\n- Training data is itself dominated by them, so the loss is minimised by favouring them.\n\nEffect:\n- The long tail is starved, catalogue coverage collapses, and the system becomes a bestseller list rather than a recommender.\n\nMitigate:\n- Popularity-debiased sampling, inverse-propensity weighting, explicit diversity in re-ranking, or penalising item frequency in the loss.',
    },
    {
      front: 'Position bias',
      back: 'Users click higher-ranked items far more often regardless of relevance, simply because those items are seen first.\n\nWhy it is dangerous:\n- You train on clicks, so the model learns "position-1 items are good" — but position 1 was chosen BY THE PREVIOUS MODEL. You are learning your own past decisions, not user preference.\n\nMeasure it:\n- Randomised position swaps, or intervention harvesting from natural ranking variation.\n\nCorrect it:\n- Inverse-propensity weighting, weighting each click by 1 / P(examined at that position).\n- Or model position as an explicit feature and set it to a constant at serving time.',
    },
    {
      front: 'The feedback loop / rich-get-richer effect',
      back: 'A recommender surfaces an item → it gets more impressions → more clicks purely from exposure → the model reads that as higher quality → it ranks even higher. The advantage compounds regardless of true relevance.\n\nMechanism:\n- The model TRAINS ON DATA IT GENERATED. Exposure and quality become statistically inseparable, so the system is measuring its own past choices, not preference.\n\nExample:\n- A job posting recommended early accumulates clicks, locks into the top slot, and equally good postings never surface.\n\nMitigate:\n- Exploration traffic, propensity weighting, diversity constraints, and monitoring catalogue coverage / Gini over time.',
    },
    {
      front: 'Filter bubbles and echo chambers',
      back: 'Personalisation progressively narrows what a user is shown until they only see reinforcement of existing preferences.\n\nMechanism:\n- A direct consequence of the feedback loop at the USER level. The model optimises short-term engagement, which is maximised by familiarity, so the exploration radius shrinks with every interaction.\n\nHarm:\n- User boredom and churn, plus societal effects for content platforms.\n\nMitigate:\n- Inject diversity and serendipity, optimise for long-term value rather than the next click, and monitor per-user intra-list diversity and topic entropy over time — not just CTR.',
    },
    {
      front: 'Exploration vs exploitation',
      back: 'Two competing goals when choosing what to show:\n- Exploit: show what the model believes is best right now.\n- Explore: show uncertain items to LEARN their value.\n\nWhy pure exploitation fails:\n- The model never gathers data that could change its mind, so early mistakes become permanent and new items can never break in.\n\nStrategies:\n- ε-greedy: show a random item ε of the time. Simple, wasteful.\n- UCB: add an optimism bonus proportional to uncertainty.\n- Thompson sampling: sample from the posterior and act greedily on the sample. Usually best in practice, trivially parallel.\n\nFraming:\n- Exploration is the cost you pay to keep the training distribution from collapsing onto your own predictions.',
    },
    {
      front: 'Multi-armed bandits and Thompson sampling',
      back: 'A bandit chooses actions to maximise cumulative reward WHILE learning, balancing exploration and exploitation online rather than in fixed A/B splits.\n\nThompson sampling:\n- Keep a posterior distribution over each arm\'s reward.\n- SAMPLE one value from each arm\'s posterior, play the arm with the highest sample.\n- Arms with wide uncertainty occasionally sample high and get tried.\n\nWhy it suits recsys:\n- Adapts continuously, wastes far less traffic on clear losers than a fixed A/B test, and handles the new-item problem naturally.\n\nContextual bandits:\n- Condition the choice on user features — the bridge between bandits and full recommenders.',
    },
    {
      front: 'Learning to rank: pointwise, pairwise, listwise',
      back: 'Three ways to frame ranking as a learning problem:\n- Pointwise: predict a score per item independently (plain regression / classification). Simple, but optimises absolute values when only ORDER matters.\n- Pairwise: learn which of two items should rank higher (RankNet, LambdaRank). Directly targets ordering.\n- Listwise: optimise a whole-list metric such as NDCG directly (LambdaMART, ListNet).\n\nMechanism:\n- Ranking metrics are flat or discontinuous in the scores, so they have no usable gradient.\n- LambdaRank\'s trick: define the gradient directly, weighting each pair by how much swapping it would change NDCG.',
    },
    {
      front: 'Ranking metrics: Precision@K, Recall@K, MRR, MAP, NDCG',
      back: 'Top-K ranking metrics and what each rewards:\n- Precision@K: fraction of the top K that are relevant.\n- Recall@K: fraction of ALL relevant items captured in the top K.\n- MRR: 1 / rank of the first relevant item — good when a single right answer matters.\n- MAP: mean of average precision — position-aware across all relevant items.\n- NDCG: discounted cumulative gain, normalised by the ideal ordering. Uses a log discount so higher positions count more, and it is the only common metric that handles GRADED relevance rather than binary.\n\nChoosing:\n- NDCG for graded relevance, MRR for known-item search, Recall@K for the retrieval stage.',
    },
    {
      front: 'Offline/online metric mismatch',
      back: 'A model that wins on logged offline data often fails to move live metrics — one of the most common surprises in recsys.\n\nWhy:\n- Offline evaluation replays a distribution generated by the OLD policy. A new model that would have shown different items has no logged feedback for them, so it is scored only where it agrees with the incumbent.\n- Offline data also cannot capture novelty, position effects, or user adaptation.\n\nImplication:\n- Offline metrics are a filter for what deserves an online test, not a substitute for one. Always ship behind an A/B test or interleaving.',
    },
    {
      front: 'Counterfactual evaluation and Inverse Propensity Scoring (IPS)',
      back: 'Estimates how a NEW policy would have performed using data logged under an OLD one, by reweighting each logged event by 1 / P(action taken | old policy).\n\nMechanism:\n- It turns a biased sample into an unbiased estimate of the new policy\'s value — the same trick as importance sampling.\n\nRequirements:\n- The logging policy must be stochastic, and its action probabilities (propensities) must be recorded. If P(action) was 0, that region is unobservable and no reweighting recovers it.\n\nGotcha:\n- High variance when propensities are tiny. Use clipped / self-normalised IPS, or doubly robust estimators.',
    },
    {
      front: 'Negative sampling in recommenders',
      back: 'With millions of items, computing a full softmax is infeasible, so you contrast each positive example against a SAMPLE of negatives.\n\nChoices:\n- Uniform random negatives: easy, but too easy — the model learns only coarse distinctions.\n- In-batch negatives: cheap and popular for two-tower models.\n- HARD negatives (plausible but wrong): sharpen the decision boundary most.\n\nGotcha:\n- In-batch negatives are sampled by popularity, so popular items show up as negatives too often. Correct with a logQ / sampled-softmax correction, or you systematically suppress popular items.\n\nAlso:\n- Watch for false negatives — a "negative" the user simply had not seen yet.',
    },
    {
      front: 'Diversity, novelty, serendipity, coverage',
      back: 'Four "beyond-accuracy" qualities:\n- Diversity: how dissimilar the items within one list are.\n- Novelty: how unknown / unpopular an item is to this user.\n- Serendipity: relevant AND surprising — the genuinely hard one.\n- Coverage: what fraction of the catalogue ever gets recommended.\n\nWhy they matter:\n- Accuracy alone produces a monotonous, redundant list (five near-identical items) that suppresses long-term engagement.\n\nImplementation:\n- Maximal Marginal Relevance trades relevance against similarity to already-selected items; determinantal point processes do this more principledly.\n\nTension:\n- These metrics trade against short-term CTR, which is why they need explicit objectives.',
    },
    {
      front: 'Selection bias in logged recommendation data',
      back: 'You only observe feedback for items the system CHOSE to show. The data is Missing Not At Random by construction.\n\nMechanism:\n- Training on it means learning P(click | shown), while what you actually want is P(relevant) over the whole catalogue. The gap between them is the bias.\n\nConsequence:\n- The model is confident where the old policy was active and blind everywhere else — and that blindness is self-reinforcing.\n\nMitigate:\n- Reserve a small randomised exploration slice as an unbiased evaluation set, log propensities, and use IPS or doubly robust estimators.',
    },
    {
      front: 'Session-based and sequential recommendation',
      back: 'Models the ORDER of interactions within a session rather than a static user profile.\n- GRU4Rec uses an RNN; SASRec / BERT4Rec use self-attention.\n\nWhy sequence matters:\n- Intent is short-lived and order-dependent. Someone who just bought a phone wants a case, not another phone.\n\nMechanism:\n- Self-attention lets any earlier item directly influence the prediction, so it captures long-range dependencies better than an RNN and trains in parallel.\n\nKey design decision:\n- Separate short-term session intent from long-term stable taste — strong systems model both and combine them.',
    },
    {
      front: 'Delayed and sparse feedback',
      back: 'The signal you truly care about (purchase, retention, subscription) arrives long after the recommendation, if ever.\n\nProblem:\n- Attribution windows are ambiguous, and training on the immediate proxy (clicks) optimises the wrong objective — the classic route to clickbait.\n\nHandling:\n- Multi-task models predicting click AND conversion.\n- Delayed-feedback models that treat an unconverted event as CENSORED (outcome still pending) rather than negative.\n- Proxy metrics validated against long-term outcomes via holdouts.\n\nGotcha:\n- Labelling "no conversion yet" as negative systematically mislabels recent events, biasing the model toward older data.',
    },
    {
      front: 'Multi-objective recommendation',
      back: 'Real systems optimise several competing goals at once: relevance, revenue, diversity, freshness, creator fairness, long-term retention.\n\nApproaches:\n- Scalarisation: weighted sum of the predicted objectives. Simple, requires tuning the weights.\n- Constrained optimisation: maximise relevance subject to diversity ≥ X.\n- Pareto-front methods.\n\nMechanism:\n- Usually one model per objective feeding a blending layer, since the objectives have different label densities and delays.\n\nGotcha:\n- Weights get tuned to short-term metrics and silently drift the product. Tie weight changes to long-term holdout experiments.',
    },
    {
      front: 'Presentation and trust bias',
      back: 'Beyond position, HOW an item is displayed changes clicks: thumbnail quality, badges ("Sponsored", "Top pick"), card size, whether it is above the fold.\n\nTrust bias specifically:\n- Users click higher results partly because they TRUST the system\'s ordering — so a click reflects confidence in the ranker, not just relevance.\n\nConsequence:\n- Your click labels encode UI decisions. A UI change silently shifts the label distribution and can look like model degradation.\n\nMitigate:\n- Log the UI treatment as a feature, and re-baseline metrics after any presentation change.',
    },
    {
      front: 'Wide & Deep, DeepFM, and feature crosses',
      back: 'Wide & Deep combines two parts trained jointly:\n- A linear "wide" part that MEMORISES specific feature crosses seen in training.\n- A deep part that GENERALISES via embeddings.\n\nWhy both:\n- Memorisation captures exceptions and strong co-occurrences; generalisation covers unseen combinations. Either alone underperforms.\n\nDeepFM:\n- Removes the manual feature-cross engineering by learning second-order interactions with a factorisation machine, sharing embeddings with the deep part.\n\nMechanism:\n- These exist because plain MLPs are surprisingly bad at learning multiplicative feature interactions from one-hot inputs.',
    },
    {
      front: 'Graph-based recommendation (GNNs)',
      back: 'Model users and items as nodes in a bipartite interaction graph, and propagate embeddings along the edges — so a user\'s representation absorbs information from items, their other users, and outward.\n\nMechanism:\n- Message passing over k hops is effectively higher-order collaborative filtering — it captures "users like me liked items like this" transitively.\n- LightGCN strips out the non-linearities and shows the propagation itself does the work.\n\nStrength:\n- Helps sparse users by borrowing signal from graph neighbours.\n\nCost:\n- Expensive to train and serve at scale; neighbour sampling is required.',
    },
    {
      front: 'Evaluating a recommender: what should you actually measure?',
      back: 'Offline:\n- Recall@K for retrieval, NDCG for ranking, plus coverage and intra-list diversity so accuracy gains are not bought with catalogue collapse.\n\nOnline:\n- CTR is the tempting default but is short-term and clickbait-prone. Prefer downstream conversion, session depth, return rate, and long-term retention holdouts.\n\nGuardrails:\n- Catalogue coverage / Gini, share of impressions to the head, latency p99, and per-segment metrics to catch Simpson-style reversals.\n\nRule of thumb:\n- If a change raises CTR while lowering coverage and diversity, you have probably strengthened the feedback loop rather than the product.',
    },
  ],
}
