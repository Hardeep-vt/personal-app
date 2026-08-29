// Core ML algorithm concepts for ML engineering interviews.

export default {
  deck: 'ML Algorithms',
  cards: [
    {
      front: 'Linear regression — assumptions, and closed form vs gradient descent',
      back: 'Fits a straight-line relationship y = Xβ by minimising squared error.\n\nTwo ways to solve it:\n- Closed form: β = (XᵀX)⁻¹Xᵀy. One shot, but O(d³) in the number of features d.\n- Gradient descent: iterative, scales to large d and huge n.\n\nAssumptions:\n- Linearity, independent errors, constant error variance, and — for inference — normally distributed errors.\n\nGotcha:\n- XᵀX is singular when features are collinear or d > n, so the closed form does not exist. Ridge fixes this by adding λI, which guarantees invertibility.',
    },
    {
      front: 'Logistic regression — why not use squared error?',
      back: 'Models the log-odds of the positive class as linear: log(p / (1 − p)) = Xβ, so p = sigmoid(Xβ).\n\nWhy cross-entropy loss, not MSE:\n- MSE paired with a sigmoid is NON-CONVEX in the weights, so optimisation can get stuck. Cross-entropy is convex.\n- MSE\'s gradient contains the sigmoid derivative, which vanishes when the model is confidently wrong — learning stalls exactly when it should be fastest. Cross-entropy cancels that term.\n\nInterpretation:\n- exp(βⱼ) is the odds ratio for a one-unit increase in feature j.',
    },
    {
      front: 'L1 vs L2 regularization — why does L1 produce exact zeros?',
      back: 'Both add a penalty on coefficient size: L2 (Ridge) adds λ·‖β‖², L1 (Lasso) adds λ·‖β‖₁.\n\nGeometric reason L1 zeros things out:\n- The L1 constraint region is a diamond with CORNERS on the axes; the L2 region is a smooth circle.\n- The loss contours first touch the diamond at a corner — where some coefficients are exactly 0. A circle has no corners, so L2 shrinks smoothly but never to zero.\n\nAnalytic view:\n- L1\'s gradient is a constant ±λ regardless of magnitude, so it keeps pushing to zero. L2\'s gradient shrinks in proportion and tapers off.\n\nElastic Net:\n- Blends both — needed with correlated features, since Lasso arbitrarily keeps just one of a correlated group.',
    },
    {
      front: 'Gradient descent variants: SGD, momentum, RMSProp, Adam',
      back: 'Ways to step down the loss surface:\n- Batch GD: exact gradient over all data, one update per epoch. Slow.\n- SGD: gradient from one sample — noisy but fast, and the noise helps escape sharp minima.\n- Mini-batch: the practical compromise.\n\nMomentum:\n- Accumulates a velocity vector, damping oscillation across narrow valleys and accelerating along consistent directions.\n\nRMSProp:\n- Divides the step by a running average of squared gradients, giving each parameter its own effective learning rate.\n\nAdam:\n- Momentum + RMSProp + bias correction. Fast and forgiving, but often generalises slightly worse than well-tuned SGD + momentum — which is why large vision models still often use the latter.',
    },
    {
      front: 'Learning rate — the single most important hyperparameter',
      back: 'How big a step to take along the gradient.\n- Too high: divergence or oscillation.\n- Too low: painfully slow, and more likely to settle in a poor region.\n\nSchedules:\n- Step decay, cosine annealing, and WARMUP (start small, ramp up).\n- Warmup helps because early gradients are large and unrepresentative, especially with adaptive optimisers whose variance estimates are still unreliable.\n\nDiagnostic:\n- Loss exploding to NaN → lower it.\n- Loss flat from the start → probably too low, or a dead network.\n\nTrick:\n- The LR range test — sweep the rate upward and plot loss to find the steepest-descent region.',
    },
    {
      front: 'Loss functions: MSE, MAE, Huber, cross-entropy, hinge',
      back: 'The loss encodes what you count as a good prediction:\n- MSE: squared error, dominated by outliers; its optimum is the conditional MEAN.\n- MAE: linear penalty, robust; optimum is the conditional MEDIAN.\n- Huber: quadratic near zero, linear in the tails — robust but differentiable everywhere.\n- Cross-entropy: for probabilistic classification; heavily punishes confident mistakes.\n- Hinge (SVM): zero loss once the margin is satisfied, so only boundary points matter.\n\nKey insight:\n- Choosing MSE on skewed revenue data silently commits you to chasing outliers.',
    },
    {
      front: 'Decision trees — splitting criteria and why they overfit',
      back: 'Recursively split the data to make each region as pure (single-class) as possible.\n- Classification impurity: Gini = 1 − Σp², or entropy = −Σp log p. They behave near-identically; Gini is marginally cheaper.\n- Regression trees split on variance reduction.\n\nWhy they overfit:\n- Grown to full depth, a tree can isolate every single training point — zero training error, memorised noise.\n\nControls:\n- max_depth, min_samples_leaf, min_impurity_decrease, and cost-complexity pruning.\n\nMechanism:\n- Splits are chosen GREEDILY and locally. A tree cannot look ahead, so it misses combinations that only pay off jointly (e.g. XOR).',
    },
    {
      front: 'Random Forest — what makes it work?',
      back: 'Many deep decision trees, each trained on a bootstrap sample AND restricted to a random subset of features at each split, then averaged.\n\nThe crucial part:\n- Bootstrapping alone leaves trees highly correlated, because one dominant feature gets chosen first in nearly every tree. Averaging correlated models barely cuts variance.\n- Restricting the candidate features at each split DECORRELATES the trees — that is where most of the benefit comes from.\n\nProperties:\n- Reduces variance without raising bias; hard to overfit by adding more trees; gives free out-of-bag validation.\n\nWeakness:\n- Large memory footprint, and poor extrapolation beyond the training range.',
    },
    {
      front: 'Bagging vs boosting',
      back: 'Two ways to combine many models:\n- Bagging: train models in PARALLEL on bootstrap samples, then average. Targets VARIANCE. Base learners should be low-bias / high-variance (deep trees).\n- Boosting: train models SEQUENTIALLY, each correcting the previous one\'s errors. Targets BIAS. Base learners should be weak / high-bias (shallow stumps).\n\nMechanism:\n- Bagging averages independent errors away.\n- Boosting performs gradient descent in function space.\n\nConsequence:\n- Boosting CAN overfit with too many rounds and needs early stopping; bagging essentially cannot.\n- Boosting is usually more accurate but more sensitive to noisy labels.',
    },
    {
      front: 'Gradient boosting — what is the "gradient"?',
      back: 'Each new tree is fitted to the NEGATIVE GRADIENT of the loss with respect to the current predictions — the "pseudo-residuals".\n- For squared loss, those are just the ordinary residuals, which is why "fit the errors" is the usual intuition.\n\nMechanism:\n- It is gradient descent where each step is taken in function space rather than parameter space, with a tree approximating the descent direction.\n\nKey knobs:\n- Learning rate (shrinkage) and number of trees trade off — a lower rate needs more trees but generalises better.\n- Subsampling adds useful stochasticity.\n\nImplementations:\n- XGBoost adds second-order (Newton) information and regularisation; LightGBM uses histogram binning and leaf-wise growth for speed.',
    },
    {
      front: 'SVM and the kernel trick',
      back: 'Finds the hyperplane that maximises the MARGIN — the gap to the nearest data points (the support vectors).\n- Soft margin allows some violations, controlled by C: small C = wider margin, more tolerance; large C = fits the training data harder.\n\nKernel trick:\n- The optimisation depends on the data only through inner products. Replacing x·x\' with a kernel K(x, x\') implicitly maps to a high-dimensional space WITHOUT ever computing coordinates there. The RBF kernel corresponds to an infinite-dimensional space.\n\nGotcha:\n- Scales roughly O(n²)-O(n³), so it is impractical for very large n — a big reason SVMs lost ground to boosted trees and neural nets.',
    },
    {
      front: 'k-Nearest Neighbours and the curse of dimensionality',
      back: 'No training. At prediction time, find the k closest training points and vote (classification) or average (regression).\n\nCurse of dimensionality:\n- As dimensions grow, all points become nearly EQUIDISTANT — the ratio of nearest to farthest distance approaches 1 — so "nearest" stops being meaningful.\n- The data needed to keep neighbourhoods dense grows exponentially with dimension.\n\nPractical notes:\n- Features MUST be scaled, or distance is dominated by large-magnitude features.\n- Small k = low bias / high variance; large k = the reverse.\n\nCost profile:\n- Training free, inference expensive — the opposite of most models.',
    },
    {
      front: 'Naive Bayes — why does it work despite a false assumption?',
      back: 'Applies Bayes\' rule while assuming all features are conditionally independent given the class — almost never actually true.\n\nWhy it still works:\n- For CLASSIFICATION you only need the correct ARGMAX, not correct probabilities. Dependence distorts the magnitudes but often preserves their ordering.\n\nStrengths:\n- Extremely fast, works with tiny data and very high dimensions (text), naturally online.\n\nGotchas:\n- Predicted probabilities are badly calibrated — usually pushed toward 0 or 1.\n- An unseen feature-class pair gives probability 0 and annihilates the whole product — hence Laplace smoothing.',
    },
    {
      front: 'k-means — assumptions and initialisation',
      back: 'Alternates two steps (Lloyd\'s algorithm): assign each point to the nearest centroid, then recompute each centroid as the mean of its points. Converges to a LOCAL optimum only.\n\nHidden assumptions:\n- Clusters are spherical, similarly sized, and similarly dense. It fails badly on elongated or nested shapes because it minimises within-cluster squared distance.\n\nInitialisation matters a lot:\n- Random init can converge terribly. Use k-means++ (spreads the initial centroids apart probabilistically).\n\nChoosing k:\n- Elbow method, silhouette score, gap statistic — all heuristics. Scale the features first.',
    },
    {
      front: 'DBSCAN vs k-means',
      back: 'DBSCAN grows clusters outward from dense regions, using two parameters: eps (neighbourhood radius) and min_samples.\n\nAdvantages over k-means:\n- Finds ARBITRARY shapes.\n- No need to choose k in advance.\n- Explicitly labels outliers as noise.\n\nWeaknesses:\n- Struggles when clusters have very different densities.\n- eps is hard to choose in high dimensions, where distances concentrate.\n\nWhen to use which:\n- DBSCAN for irregular shapes or when outliers matter (anomaly detection).\n- k-means when clusters are roughly globular and you need speed at scale.\n- HDBSCAN removes the fixed-eps limitation by building a hierarchy over densities.',
    },
    {
      front: 'PCA — what is it actually doing?',
      back: 'Finds the orthogonal directions of MAXIMUM VARIANCE in the data. These are the eigenvectors of the covariance matrix; the eigenvalues give the variance each one explains.\n\nEquivalent views:\n- The linear projection that minimises reconstruction error.\n- The SVD of the centred data matrix.\n\nCritical preprocessing:\n- You MUST centre the data, and standardise it when features have different units — otherwise a feature measured in metres dominates one in kilometres purely by scale.\n\nLimits:\n- Captures LINEAR structure only, and components are usually uninterpretable mixtures.\n- Not feature selection — it creates new features rather than choosing among existing ones.',
    },
    {
      front: 't-SNE and UMAP — and how to not misread them',
      back: 'Non-linear methods that squeeze high-dimensional data to 2D for VISUALISATION, preserving local neighbourhood structure.\n\nCritical caveats:\n- Cluster SIZES are meaningless.\n- Distances BETWEEN clusters are largely meaningless.\n- Results change with perplexity and random seed.\n- t-SNE has no meaningful global geometry.\n\nUMAP vs t-SNE:\n- UMAP preserves more global structure, is much faster, and can place new points. t-SNE cannot embed new data without refitting.\n\nBiggest mistake:\n- Treating a t-SNE plot as proof that clusters are well separated in the original space, or feeding t-SNE coordinates into a downstream model.',
    },
    {
      front: 'Backpropagation',
      back: 'The algorithm that computes all of a network\'s gradients efficiently, by applying the chain rule BACKWARDS through the computation graph and reusing intermediate results.\n\nMechanism:\n- The forward pass caches activations.\n- The backward pass multiplies local Jacobians, layer by layer.\n- Without this reuse, computing gradients numerically would cost one forward pass PER PARAMETER — completely infeasible.\n\nMemory consequence:\n- Activations must be stored for the backward pass, so memory scales with depth × batch size. Gradient checkpointing trades compute for memory by recomputing them.',
    },
    {
      front: 'Activation functions and the dying ReLU',
      back: 'The non-linearity between layers — without one, a deep net collapses to a single linear map.\n\n- Sigmoid / tanh SATURATE: their gradient approaches zero for large |x|, a primary cause of vanishing gradients in deep nets.\n- ReLU = max(0, x): cheap, non-saturating for positive inputs, induces sparsity. It made deep nets trainable.\n\nDying ReLU:\n- A unit pushed to always-negative pre-activation outputs 0 with gradient 0 FOREVER — it can never recover. Often triggered by too high a learning rate.\n\nFixes:\n- Leaky ReLU / ELU / GELU keep a small negative slope. GELU is standard in transformers.',
    },
    {
      front: 'Vanishing and exploding gradients',
      back: 'A gradient in a deep net is a product of many per-layer terms.\n- If those terms are consistently < 1, the product decays toward zero (vanishing).\n- If consistently > 1, it blows up (exploding).\n\nSymptoms:\n- Early layers stop learning (vanishing), or the loss goes NaN (exploding).\n\nFixes:\n- Non-saturating activations (ReLU family).\n- Careful initialisation — Xavier for tanh, He for ReLU — keeping activation variance stable across layers.\n- Normalisation layers.\n- RESIDUAL CONNECTIONS, which give gradients a direct path — the key enabler of very deep nets.\n- Gradient clipping for the exploding case.',
    },
    {
      front: 'Batch norm vs layer norm',
      back: 'Both rescale activations to keep them well-behaved, but along different axes:\n- Batch norm normalises each feature ACROSS THE BATCH.\n- Layer norm normalises across FEATURES within each individual example.\n\nWhy the distinction matters:\n- Batch norm depends on batch statistics, so it behaves differently at train vs inference (it uses running averages), degrades with small batches, and is awkward for variable-length sequences.\n- Layer norm has no batch dependence at all — which is why transformers use it.\n\nWhy it helps:\n- Originally credited to reducing "internal covariate shift"; the better-supported explanation is that it SMOOTHS the loss landscape, allowing higher learning rates.',
    },
    {
      front: 'Dropout',
      back: 'During training only, randomly set a fraction p of activations to zero on each forward pass.\n\nMechanism:\n- Prevents co-adaptation — no unit can rely on any specific other unit being present.\n- Approximates training an exponentially large ensemble of subnetworks that share weights.\n\nAt inference:\n- Dropout is OFF, and activations are scaled (or scaled during training instead, with "inverse dropout") so expected magnitudes match.\n\nGotchas:\n- Forgetting model.eval() in PyTorch leaves dropout active → random predictions.\n- Dropout interacts poorly with batch norm; modern architectures often use one or the other.',
    },
    {
      front: 'CNNs: convolution, weight sharing, receptive field',
      back: 'A small kernel of weights slides across the input, so the SAME weights detect a pattern wherever it appears — translation equivariance, and far fewer parameters than a dense layer.\n\nThree structural priors it bakes in:\n- Locality: nearby pixels are related.\n- Weight sharing: patterns are position-independent.\n- Hierarchy: edges → textures → parts → objects.\n\nReceptive field:\n- The region of input that influences one output unit. It grows with depth, kernel size, stride and dilation.\n- If it is smaller than the object you care about, the network structurally cannot see the whole thing.\n\nPooling:\n- Adds a little invariance and shrinks the spatial dimensions.',
    },
    {
      front: 'RNNs and LSTMs',
      back: 'An RNN carries a hidden state from one timestep to the next, sharing weights over time.\n- Problem: repeatedly multiplying by the same weight matrix causes vanishing / exploding gradients over long sequences.\n\nLSTM fix:\n- A CELL STATE with ADDITIVE updates, plus gates (forget, input, output) that control what flows in and out.\n- Because the cell state is updated additively rather than multiplicatively, gradients flow across many steps without decaying.\n\nGRU:\n- Merges gates, fewer parameters, often comparable performance.\n\nWhy transformers replaced them:\n- RNNs are inherently SEQUENTIAL and cannot parallelise across time, which caps training throughput.',
    },
    {
      front: 'Attention and transformers',
      back: 'Attention(Q, K, V) = softmax(QKᵀ / √d)·V. Each position produces a query, compares it to every position\'s key, and takes a weighted sum of their values.\n\nWhy the √d:\n- Without it, dot products grow with dimension, pushing the softmax into saturation where gradients vanish.\n\nKey advantages:\n- Any two positions are ONE step apart — no long-range decay.\n- The whole sequence is processed in parallel.\n\nMulti-head:\n- Several attention subspaces in parallel, capturing different kinds of relation.\n\nCosts:\n- O(n²) in sequence length for both time and memory — the bottleneck behind FlashAttention and sparse / linear attention. Positional encodings are required, since attention alone is permutation-invariant.',
    },
    {
      front: 'Embeddings',
      back: 'Dense, low-dimensional vectors that represent discrete items (words, users, products), learned so that geometric closeness reflects semantic or behavioural similarity.\n\nWhy not one-hot:\n- One-hot is huge, sparse, and treats every pair of items as equally dissimilar — it carries no notion of relatedness.\n\nMechanism:\n- An embedding layer is just a lookup into a learned matrix — mathematically the same as multiplying a one-hot vector by a weight matrix, but implemented as indexing.\n\nSizing heuristic:\n- Roughly the fourth root of the number of distinct values.\n\nGotcha:\n- High-cardinality embeddings hold most of a recommender\'s parameters and can dominate memory.',
    },
    {
      front: 'Transfer learning and fine-tuning',
      back: 'Take a model pretrained on a large corpus and adapt it to your task. Early layers hold general features; later layers hold task-specific ones.\n\nStrategy by data size:\n- Very little data → freeze the backbone, train only a new head.\n- More data → unfreeze progressively with a LOW learning rate, since large updates destroy pretrained features (catastrophic forgetting).\n\nWhy it works:\n- Pretraining gives a far better starting point than random initialisation, so you need orders of magnitude less labelled data.\n\nModern variants:\n- LoRA and adapters tune a small set of extra parameters, making fine-tuning cheap and letting many tasks share one base model.',
    },
    {
      front: 'Cross-validation strategies — and when k-fold is wrong',
      back: 'k-fold: split the data into k parts, train on k − 1, validate on the held-out one, rotate. Stratified k-fold preserves class proportions and is the default for classification.\n\nWhen standard k-fold is INVALID:\n- Time series — random folds let the model train on the future and predict the past. Use forward-chaining splits.\n- Grouped data — multiple rows per user must stay in the same fold, or the model memorises the user. Use GroupKFold.\n\nGotcha:\n- Any preprocessing fitted on the full dataset (scaling, imputation, feature selection) leaks validation information. Fit it INSIDE each fold, via a pipeline.',
    },
    {
      front: 'Data leakage — the most expensive bug in ML',
      back: 'Using information at training time that will not exist at prediction time. The result: brilliant offline metrics and a worthless production model.\n\nCommon sources:\n- Scaling / imputing before the train-test split.\n- Target encoding computed over all data.\n- Features derived from the future (point-in-time violations).\n- Duplicate rows spanning splits.\n- An ID that happens to correlate with the label.\n\nTell-tale sign:\n- Suspiciously high performance, or one feature with overwhelming importance.\n\nDefence:\n- Build every transform inside a pipeline fitted per fold. For temporal data, ask of each feature: "would I truly have known this at decision time?"',
    },
    {
      front: 'Hyperparameter search: grid, random, Bayesian',
      back: 'Ways to search the hyperparameter space:\n- Grid: try every combination. Cost explodes exponentially with the number of hyperparameters.\n- Random: sample combinations independently. Provably better than grid in high dimensions, because most hyperparameters barely matter and random search spends more distinct trials on the ones that do.\n- Bayesian optimisation: build a surrogate model of the objective and pick the most promising next point. Sample-efficient; best when each run is expensive.\n- Hyperband / ASHA: allocate compute adaptively, killing bad runs early — usually the best value in practice.\n\nGotcha:\n- Tuning against the test set is leakage. Use a separate validation set or nested CV.',
    },
    {
      front: 'Generative vs discriminative models',
      back: 'Two ways to model the same classification problem:\n- Discriminative: learn P(Y|X) directly (logistic regression, trees, most neural nets).\n- Generative: learn P(X, Y) or P(X|Y)·P(Y), then apply Bayes\' rule (Naive Bayes, GMMs, diffusion models, LLMs).\n\nTrade-off:\n- Discriminative usually wins on pure classification accuracy given enough data — it solves the easier problem directly.\n- Generative converges faster with LITTLE data, can synthesise samples, handles missing features naturally, and supports anomaly detection via likelihood.\n\nRule of thumb:\n- If you only need a decision boundary, modelling the full input distribution is wasted effort.',
    },
    {
      front: 'Handling class imbalance in training',
      back: 'Options when one class is rare:\n- Class weights in the loss: cheapest, keeps the data intact.\n- Oversample the minority: SMOTE interpolates synthetic points.\n- Undersample the majority: discards data.\n- Focal loss: down-weights easy examples so training focuses on hard ones.\n\nCritical rule:\n- Resample ONLY the training fold. Applying SMOTE before the split leaks synthetic points derived from validation data.\n\nGotcha:\n- Any resampling distorts predicted probabilities, so calibration breaks. If probabilities matter, prefer class weights or recalibrate afterwards.\n\nOften best:\n- Do not resample at all — just move the decision THRESHOLD.',
    },
    {
      front: 'No Free Lunch theorem',
      back: 'Averaged over ALL possible problems, every learning algorithm performs identically. No learner is universally superior.\n\nWhat it actually means:\n- Real performance comes from an algorithm\'s INDUCTIVE BIAS matching the structure of your specific problem.\n- CNNs beat MLPs on images because locality and translation equivariance are true of images — not because convolution is inherently better.\n\nPractical takeaway:\n- "Which model is best?" has no answer without the data.\n- It justifies empirical benchmarking, and explains why boosted trees still beat deep nets on most tabular problems.',
    },
  ],
}
