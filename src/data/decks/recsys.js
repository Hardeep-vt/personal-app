// Recommendation system concepts for ML engineering interviews.
// Heavy emphasis on the bias/feedback-loop failure modes, which interviewers probe hard.

export default {
  deck: 'Recommendation Systems',
  cards: [
    {
      front: 'Collaborative filtering — user-based vs item-based',
      back: 'Recommend using behaviour patterns across users, with no content features at all. User-based: find similar users, recommend what they liked. Item-based: find items co-liked by the same users.\n\nUnder the hood: item-based is usually preferred in production because item-item similarities are far more stable over time than user tastes, so they can be precomputed and cached.\n\nStrength: discovers non-obvious associations no content feature would reveal.\n\nWeakness: total cold start — a brand-new item has no interactions, so it is invisible.',
    },
    {
      front: 'Matrix factorization (ALS / SVD-style)',
      back: 'Factor the sparse user-item interaction matrix R (n×m) into U (n×k) and V (m×k) so R ≈ U·Vᵀ. Each user and item becomes a k-dimensional latent vector; a prediction is their dot product.\n\nUnder the hood: k is far smaller than n or m, so the model is forced to compress taste into a few latent factors — it generalises rather than memorising.\n\nWhy ALS: fixing U makes solving for V a plain least-squares problem, and vice versa. Alternating is convex in each step and parallelises well.\n\nGotcha: "SVD" in recsys is not true SVD — the matrix is mostly missing, not zero.',
    },
    {
      front: 'Implicit vs explicit feedback',
      back: 'Explicit: the user states a preference (star rating). Implicit: behaviour is used as a proxy (click, watch, purchase, dwell time).\n\nThe hard part of implicit: there are NO TRUE NEGATIVES. A non-click may mean dislike, or never seen. Absence of interaction is ambiguous.\n\nStandard treatment: treat unobserved pairs as weak negatives with low confidence, and observed ones with confidence rising in the interaction strength (c = 1 + αr).\n\nPitfall: naively labelling everything unseen as a hard negative teaches the model that unpopular-but-relevant items are bad.',
    },
    {
      front: 'Content-based filtering, and hybrid recommenders',
      back: 'Content-based scores items by feature similarity to what the user already liked (text, category, embeddings), ignoring other users entirely.\n\nStrength: handles new items immediately — features exist before any interaction does. Also explainable.\n\nWeakness: over-specialisation. It keeps recommending more of the same and never surprises the user.\n\nHybrid: combine with collaborative signals — weighted blend, switching by data availability, or a single model taking both as features. Almost every production system is a hybrid, using content to cover cold start and CF to drive quality once data arrives.',
    },
    {
      front: 'Cold start — the three kinds',
      back: 'New USER: no history. New ITEM: no interactions. New SYSTEM: no data at all.\n\nFixes by type — new user: onboarding preferences, demographics, popularity/trending defaults, contextual bandits to learn fast. New item: content features and embeddings, plus deliberate exploration traffic. New system: content-based or rules until interaction data accumulates.\n\nUnder the hood: cold start is fundamentally an EXPLORATION problem — you cannot learn about an item you never show.\n\nGotcha: a pure exploit policy makes item cold start permanent, since new items never get impressions to earn their ranking.',
    },
    {
      front: 'Two-stage architecture: candidate generation → ranking',
      back: 'Stage 1 (retrieval): cheaply narrow millions of items to a few hundred, optimised for RECALL. Stage 2 (ranking): apply an expensive, feature-rich model to those few hundred, optimised for PRECISION at the top.\n\nUnder the hood: you cannot run a heavy model over the whole catalogue within a latency budget. Cost per item forces the split.\n\nKey consequence: THE RANKER CAN ONLY BE AS GOOD AS RETRIEVAL. Anything retrieval misses is unrecoverable, so measure recall@K of the candidate stage separately.\n\nOften a third re-ranking stage adds diversity and business rules.',
    },
    {
      front: 'Two-tower model',
      back: 'One encoder tower for the user/context, another for the item, trained so that dot product (or cosine) of their embeddings predicts relevance.\n\nWhy it dominates retrieval: the towers are INDEPENDENT. Item embeddings are precomputed offline for the whole catalogue; at request time you encode only the user and do an approximate nearest-neighbour search. That is what makes million-item retrieval feasible in milliseconds.\n\nTrade-off: because the towers never interact until the final dot product, it cannot model fine-grained user-item feature crosses — which is exactly what the ranking stage adds.',
    },
    {
      front: 'Approximate nearest neighbour search (HNSW, IVF, FAISS)',
      back: 'Finds near-neighbours in embedding space without scanning every item — trading a little recall for orders-of-magnitude speed.\n\nHNSW: a navigable small-world graph; greedy descent through layers. Excellent recall/latency, memory-hungry. IVF: cluster the space, search only the nearest few cells. PQ: compress vectors to cut memory at some accuracy cost.\n\nKnobs: efSearch / nprobe trade recall against latency at query time.\n\nGotcha: index freshness. New items are invisible until reindexed, so an ANN index quietly reintroduces item cold start.',
    },
    {
      front: 'Popularity bias',
      back: 'Popular items get recommended disproportionately, beyond what their actual relevance warrants.\n\nUnder the hood: popular items have the most interaction data, so the model is most confident about them; and training data is itself dominated by them, so the loss is minimised by favouring them.\n\nEffect: the long tail is starved, catalogue coverage collapses, and the system becomes a bestseller list rather than a recommender.\n\nMitigate: popularity-debiased sampling, inverse-propensity weighting, explicit diversity in re-ranking, or penalising item frequency in the loss.',
    },
    {
      front: 'Position bias',
      back: 'Users click higher-ranked items far more often regardless of relevance, simply because those items are seen first.\n\nWhy it is dangerous: you train on clicks, so the model learns "position 1 items are good" — but position 1 was chosen BY THE PREVIOUS MODEL. You are learning your own past decisions, not user preference.\n\nMeasure it: randomised position swaps, or intervention harvesting from natural ranking variation.\n\nCorrect it: inverse propensity weighting, where each click is weighted by 1/P(examined at that position), or model position explicitly as a feature and set it to a constant at serving time.',
    },
    {
      front: 'The feedback loop / rich-get-richer effect',
      back: 'A recommender surfaces an item → it gets more impressions → more clicks purely from exposure → the model reads that as higher quality → it ranks even higher. The advantage compounds regardless of true relevance.\n\nUnder the hood: the model TRAINS ON DATA IT GENERATED. Exposure and quality become statistically inseparable, so the system is no longer measuring preference — it is measuring its own past choices.\n\nExample: a job posting recommended early accumulates clicks, locks into the top slot, and equally good postings never surface.\n\nMitigate: exploration traffic, propensity weighting, diversity constraints, and monitoring catalogue coverage/Gini over time.',
    },
    {
      front: 'Filter bubbles and echo chambers',
      back: 'Personalisation progressively narrows what a user is shown until they only see reinforcement of existing preferences.\n\nUnder the hood: a direct consequence of the feedback loop at the USER level. The model optimises short-term engagement, which is maximised by familiarity, so the exploration radius shrinks with every interaction.\n\nHarm: user boredom and churn, plus societal effects for content platforms.\n\nMitigate: inject diversity and serendipity, optimise for long-term value rather than next-click, and monitor per-user intra-list diversity and topic entropy over time — not just CTR.',
    },
    {
      front: 'Exploration vs exploitation',
      back: 'Exploit: show what the model believes is best now. Explore: show uncertain items to LEARN their value.\n\nWhy pure exploitation fails: the model never gathers data that could change its mind, so early mistakes become permanent and new items can never break in.\n\nStrategies: ε-greedy (simple, wasteful), UCB (optimism proportional to uncertainty), Thompson sampling (sample from the posterior — usually best in practice and trivially parallel).\n\nFraming: exploration is the cost you pay to keep the training distribution from collapsing onto your own predictions.',
    },
    {
      front: 'Multi-armed bandits and Thompson sampling',
      back: 'Bandits choose actions to maximise cumulative reward while learning, balancing exploration and exploitation online rather than in fixed A/B splits.\n\nThompson sampling: keep a posterior over each arm\'s reward, SAMPLE one value per arm, play the argmax. Arms with wide uncertainty occasionally sample high and get tried.\n\nWhy it suits recsys: adapts continuously, wastes far less traffic on clear losers than a fixed A/B test, and handles the new-item problem naturally.\n\nContextual bandits condition on user features — the bridge between bandits and full recommenders.',
    },
    {
      front: 'Learning to rank: pointwise, pairwise, listwise',
      back: 'Pointwise: predict a score per item independently (plain regression/classification). Simple, but optimises absolute values when only ORDER matters.\n\nPairwise: learn which of two items should rank higher (RankNet, LambdaRank). Directly targets ordering.\n\nListwise: optimise a whole-list metric such as NDCG directly (LambdaMART, ListNet).\n\nUnder the hood: ranking metrics are flat or discontinuous in the scores, so they have no usable gradient. LambdaRank\'s trick is to define the gradient directly — weighting each pair by how much swapping it would change NDCG.',
    },
    {
      front: 'Ranking metrics: Precision@K, Recall@K, MRR, MAP, NDCG',
      back: 'Precision@K: fraction of the top K that are relevant. Recall@K: fraction of all relevant items captured in the top K. MRR: 1/rank of the first relevant item — good when a single right answer matters. MAP: mean of average precision, position-aware across all relevant items.\n\nNDCG: discounted cumulative gain normalised by the ideal ordering. Uses a log discount so higher positions count more, and it is the only common metric that handles GRADED relevance rather than binary.\n\nChoosing: NDCG for graded relevance, MRR for known-item search, Recall@K for the retrieval stage.',
    },
    {
      front: 'Offline/online metric mismatch',
      back: 'A model that wins on logged offline data frequently fails to move live metrics — one of the most common surprises in recsys.\n\nWhy: offline evaluation replays a distribution generated by the OLD policy. A new model that would have shown different items has no logged feedback for them, so it is scored only where it agrees with the incumbent. It also cannot capture novelty, position effects, or user adaptation.\n\nImplication: offline metrics are a filter for what deserves an online test, not a substitute for one. Always ship behind an A/B test or interleaving.',
    },
    {
      front: 'Counterfactual evaluation and Inverse Propensity Scoring (IPS)',
      back: 'Estimates how a NEW policy would have performed using data logged under an OLD one, by reweighting each logged event by 1/P(action taken | old policy).\n\nUnder the hood: it turns a biased sample into an unbiased estimate of the new policy\'s value — the same trick as importance sampling.\n\nRequirements: the logging policy must be stochastic and its propensities recorded. If P(action) was 0, that region is unobservable and no reweighting can recover it.\n\nGotcha: high variance when propensities are tiny. Use clipped/self-normalised IPS or doubly robust estimators.',
    },
    {
      front: 'Negative sampling in recommenders',
      back: 'With millions of items, computing a full softmax is infeasible, so you contrast each positive against a sample of negatives.\n\nChoices: uniform random negatives are easy but too easy — the model learns only coarse distinctions. In-batch negatives are cheap and popular for two-tower models. HARD negatives (plausible but wrong) sharpen the decision boundary most.\n\nGotcha: in-batch negatives are sampled by popularity, so popular items appear as negatives too often. Correct with logQ / sampled-softmax correction, otherwise you systematically suppress popular items.\n\nAlso: watch false negatives — a "negative" the user simply had not seen yet.',
    },
    {
      front: 'Diversity, novelty, serendipity, coverage',
      back: 'Diversity: how dissimilar the items within one list are. Novelty: how unknown/unpopular an item is to this user. Serendipity: relevant AND surprising — the genuinely hard one. Coverage: what fraction of the catalogue ever gets recommended.\n\nWhy they matter: accuracy alone produces a monotonous, redundant list (five near-identical items) that suppresses long-term engagement.\n\nImplementation: Maximal Marginal Relevance trades relevance against similarity to already-selected items; determinantal point processes do this more principledly.\n\nTension: these metrics trade against short-term CTR, which is exactly why they need explicit objectives.',
    },
    {
      front: 'Selection bias in logged recommendation data',
      back: 'You only observe feedback for items the system CHOSE to show. The data is Missing Not At Random by construction.\n\nUnder the hood: training on it means learning P(click | shown), while what you actually want is P(relevant) over the whole catalogue. The gap between them is the bias.\n\nConsequence: the model is confident where the old policy was active and blind everywhere else — and that blindness is self-reinforcing.\n\nMitigate: reserve a small randomised exploration slice as an unbiased evaluation set, log propensities, and use IPS or doubly robust estimators.',
    },
    {
      front: 'Session-based and sequential recommendation',
      back: 'Models the ORDER of interactions within a session rather than a static user profile. GRU4Rec uses an RNN; SASRec/BERT4Rec use self-attention.\n\nWhy sequence matters: intent is short-lived and order-dependent. Someone who just bought a phone wants a case, not another phone.\n\nUnder the hood: self-attention lets any earlier item directly influence the prediction, so it captures long-range dependencies better than an RNN and trains in parallel.\n\nKey design decision: separate short-term session intent from long-term stable taste — most strong systems model both and combine them.',
    },
    {
      front: 'Delayed and sparse feedback',
      back: 'The signal you truly care about (purchase, retention, subscription) arrives long after the recommendation, if ever.\n\nProblem: attribution windows are ambiguous, and training on the immediate proxy (clicks) optimises the wrong objective — the classic route to clickbait.\n\nHandling: multi-task models predicting click AND conversion, delayed-feedback models treating unconverted events as censored rather than negative, and proxy metrics validated against long-term outcomes via holdouts.\n\nGotcha: if you label "no conversion yet" as negative, you systematically mislabel recent events — creating a bias toward older data.',
    },
    {
      front: 'Multi-objective recommendation',
      back: 'Real systems optimise several competing goals at once: relevance, revenue, diversity, freshness, creator fairness, long-term retention.\n\nApproaches: scalarisation (weighted sum of predicted objectives — simple, requires tuning weights), constrained optimisation (maximise relevance subject to diversity ≥ X), or Pareto-front methods.\n\nUnder the hood: usually one model per objective feeding a blending layer, since the objectives have different label densities and delays.\n\nGotcha: weights get tuned to short-term metrics and silently drift the product. Tie weight changes to long-term holdout experiments.',
    },
    {
      front: 'Presentation and trust bias',
      back: 'Beyond position, HOW an item is displayed changes clicks: thumbnail quality, badges ("Sponsored", "Top pick"), card size, whether it is above the fold.\n\nTrust bias specifically: users click higher results partly because they TRUST the system\'s ordering — so clicks reflect confidence in the ranker, not just relevance.\n\nConsequence: your click labels encode UI decisions. A UI change silently shifts the label distribution and can look like model degradation.\n\nMitigate: log UI treatment as a feature, and re-baseline metrics after any presentation change.',
    },
    {
      front: 'Wide & Deep, DeepFM, and feature crosses',
      back: 'Wide & Deep: a linear "wide" part MEMORISES specific feature crosses seen in training; a deep part GENERALISES via embeddings. Trained jointly.\n\nWhy both: memorisation captures exceptions and strong co-occurrences; generalisation covers unseen combinations. Either alone underperforms.\n\nDeepFM removes the manual feature-engineering burden by learning second-order interactions with a factorisation machine, sharing embeddings with the deep part.\n\nUnder the hood: these exist because plain MLPs are surprisingly bad at learning multiplicative feature interactions from one-hot inputs.',
    },
    {
      front: 'Graph-based recommendation (GNNs)',
      back: 'Model users and items as nodes in a bipartite interaction graph and propagate embeddings along edges, so a user\'s representation absorbs information from items, their other users, and outward.\n\nUnder the hood: message passing over k hops is effectively higher-order collaborative filtering — it captures "users like me liked items like this" transitively. LightGCN strips out non-linearities and shows the propagation itself does the work.\n\nStrength: helps sparse users by borrowing signal from graph neighbours.\n\nCost: expensive to train and serve at scale; neighbour sampling is required.',
    },
    {
      front: 'Evaluating a recommender: what should you actually measure?',
      back: 'Offline: Recall@K for retrieval, NDCG for ranking, plus coverage and intra-list diversity so accuracy gains are not bought with catalogue collapse.\n\nOnline: CTR is the tempting default but is short-term and clickbait-prone. Prefer downstream conversion, session depth, return rate, and long-term retention holdouts.\n\nGuardrails: catalogue coverage/Gini, share of impressions to the head, latency p99, and per-segment metrics to catch Simpson-style reversals.\n\nRule of thumb: if a change raises CTR while lowering coverage and diversity, you have probably strengthened the feedback loop rather than the product.',
    },
  ],
}
