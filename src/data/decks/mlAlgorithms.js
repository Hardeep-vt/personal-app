// Core ML algorithm concepts for ML engineering interviews.

export default {
  deck: 'ML Algorithms',
  cards: [
    {
      front: 'Linear regression — assumptions, and closed form vs gradient descent',
      back: 'Fits y = Xβ by minimising squared error. Closed form: β = (XᵀX)⁻¹Xᵀy.\n\nAssumptions: linearity, independent errors, constant error variance, and (for inference) normally distributed errors.\n\nWhen to use which: the closed form is O(d³) in the number of features, so it is fine for small d and impossible for large d. Gradient descent scales to large d and huge n.\n\nGotcha: XᵀX is singular when features are collinear or d > n — the closed form simply does not exist. Ridge fixes this by adding λI, guaranteeing invertibility.',
    },
    {
      front: 'Logistic regression — why not use squared error?',
      back: 'Models log-odds as linear: log(p/(1−p)) = Xβ, so p = sigmoid(Xβ).\n\nWhy cross-entropy instead of MSE — two reasons: (1) MSE paired with a sigmoid is NON-CONVEX in the weights, so optimisation can get stuck; cross-entropy is convex. (2) MSE\'s gradient contains the sigmoid derivative, which vanishes when predictions are confidently wrong — learning stalls exactly when it should be fastest. Cross-entropy cancels that term.\n\nInterpretation: exp(βⱼ) is the odds ratio for a one-unit change in feature j.',
    },
    {
      front: 'L1 vs L2 regularization — why does L1 produce exact zeros?',
      back: 'L2 (Ridge) adds λ‖β‖²; L1 (Lasso) adds λ‖β‖₁.\n\nThe geometric reason: the L1 constraint region is a diamond with CORNERS on the axes; the L2 region is a smooth circle. The loss contours are most likely to first touch the diamond at a corner — where some coefficients are exactly 0. A circle has no corners, so L2 shrinks smoothly but never to zero.\n\nAnalytic view: L1\'s gradient is constant (±λ) regardless of magnitude, so it keeps pushing to zero; L2\'s gradient shrinks proportionally and asymptotes.\n\nElastic Net blends both — needed when features are correlated, since Lasso arbitrarily picks one of a correlated group.',
    },
    {
      front: 'Gradient descent variants: SGD, momentum, RMSProp, Adam',
      back: 'Batch GD: exact gradient, slow, one update per epoch. SGD: one sample — noisy but fast, and the noise helps escape sharp minima. Mini-batch: the practical compromise.\n\nMomentum: accumulates a velocity vector, damping oscillation across ravines and accelerating along consistent directions.\n\nRMSProp: divides by a running average of squared gradients, giving each parameter its own effective learning rate.\n\nAdam = momentum + RMSProp + bias correction. Fast and forgiving, but often generalises slightly worse than well-tuned SGD+momentum — which is why large vision models still often use the latter.',
    },
    {
      front: 'Learning rate — the single most important hyperparameter',
      back: 'Too high: divergence or oscillation. Too low: painfully slow, and more likely to settle in a poor local region.\n\nSchedules: step decay, cosine annealing, and WARMUP (start small, ramp up) — warmup matters because early gradients are large and unrepresentative, especially with adaptive optimisers whose variance estimates are still unreliable.\n\nDiagnostic: loss exploding to NaN → lower it. Loss flat from the start → probably too low, or a dead network.\n\nTrick: the LR range test — sweep the rate upward and plot loss to find the steepest-descent region.',
    },
    {
      front: 'Loss functions: MSE, MAE, Huber, cross-entropy, hinge',
      back: 'MSE: penalises squared error, so it is dominated by outliers; its optimum is the conditional MEAN. MAE: linear penalty, robust, optimum is the conditional MEDIAN. Huber: quadratic near zero and linear in the tails — robust but differentiable everywhere.\n\nCross-entropy: for probabilistic classification; heavily penalises confident mistakes.\n\nHinge (SVM): zero loss once the margin is satisfied, so only boundary points matter.\n\nKey insight: the loss encodes what you consider a good prediction. Choosing MSE on skewed revenue data silently commits you to chasing outliers.',
    },
    {
      front: 'Decision trees — splitting criteria and why they overfit',
      back: 'Recursively split to maximise purity. Gini = 1 − Σp²; entropy = −Σp log p. They behave near-identically; Gini is marginally cheaper. Regression trees split on variance reduction.\n\nWhy they overfit: a tree grown to full depth can isolate every training point, achieving zero training error and memorising noise.\n\nControls: max_depth, min_samples_leaf, min_impurity_decrease, and cost-complexity pruning.\n\nUnder the hood: splits are chosen GREEDILY and locally — a tree cannot look ahead, so it can miss combinations that only pay off jointly (e.g. XOR).',
    },
    {
      front: 'Random Forest — what makes it work?',
      back: 'Bagging (bootstrap samples) plus RANDOM FEATURE SUBSETS at each split, averaged over many deep trees.\n\nThe crucial part: bootstrapping alone leaves trees highly correlated, because one dominant feature is chosen first in nearly every tree. Averaging correlated models barely reduces variance. Restricting the candidate features at each split DECORRELATES the trees, which is where most of the benefit comes from.\n\nProperties: reduces variance without increasing bias; hard to overfit by adding trees; gives free OOB validation.\n\nWeakness: large memory footprint, and poor extrapolation beyond the training range.',
    },
    {
      front: 'Bagging vs boosting',
      back: 'Bagging: train models in PARALLEL on bootstrap samples and average. Targets VARIANCE. Base learners should be low-bias/high-variance (deep trees).\n\nBoosting: train models SEQUENTIALLY, each correcting the previous one\'s errors. Targets BIAS. Base learners should be weak/high-bias (shallow stumps).\n\nUnder the hood: bagging averages independent errors away; boosting performs gradient descent in function space.\n\nConsequence: boosting CAN overfit with too many rounds and needs early stopping; bagging essentially cannot. Boosting is usually more accurate but more sensitive to noisy labels.',
    },
    {
      front: 'Gradient boosting — what is the "gradient"?',
      back: 'Each new tree is fitted to the NEGATIVE GRADIENT of the loss with respect to the current predictions — the pseudo-residuals. For squared loss those are just the ordinary residuals, which is why the intuition "fit the errors" works.\n\nUnder the hood: this is gradient descent where each step is taken in function space rather than parameter space, with a tree approximating the descent direction.\n\nKey knobs: learning rate (shrinkage) and n_estimators trade off against each other — lower rate needs more trees but generalises better. Subsampling adds stochasticity and helps.\n\nXGBoost adds second-order (Newton) information and regularisation; LightGBM uses histogram binning and leaf-wise growth for speed.',
    },
    {
      front: 'SVM and the kernel trick',
      back: 'Finds the hyperplane maximising the MARGIN to the nearest points (support vectors). Soft margin allows violations via C: small C = wider margin, more tolerance; large C = fits training data harder.\n\nKernel trick: the optimisation depends on the data only through inner products, so replacing x·x\' with K(x,x\') implicitly maps to a high-dimensional space WITHOUT ever computing coordinates there. RBF corresponds to an infinite-dimensional space.\n\nGotcha: scales roughly O(n²)-O(n³), so it is impractical for very large n — a big reason SVMs lost ground to boosted trees and neural nets.',
    },
    {
      front: 'k-Nearest Neighbours and the curse of dimensionality',
      back: 'No training: at prediction time, find the k closest training points and vote or average.\n\nCurse of dimensionality: as dimensions grow, points become nearly EQUIDISTANT — the ratio of nearest to farthest distance approaches 1 — so "nearest" stops being meaningful. Data needed grows exponentially with d.\n\nPractical notes: features MUST be scaled, since distance is dominated by large-magnitude features. Small k = low bias/high variance; large k = the reverse.\n\nCost: training is free, inference is expensive — the opposite profile of most models.',
    },
    {
      front: 'Naive Bayes — why does it work despite a false assumption?',
      back: 'Applies Bayes\' rule assuming all features are conditionally independent given the class — almost never true.\n\nWhy it still works: for CLASSIFICATION you only need the correct ARGMAX, not correct probabilities. Dependence distorts the magnitudes but often preserves their ordering.\n\nStrengths: extremely fast, works with tiny data and very high dimensions (text), naturally online.\n\nGotchas: probabilities are badly calibrated (typically driven toward 0 or 1). An unseen feature-class pair gives probability 0 and annihilates the product — hence Laplace smoothing.',
    },
    {
      front: 'k-means — assumptions and initialisation',
      back: 'Alternates assigning points to the nearest centroid and recomputing centroids — Lloyd\'s algorithm, which converges to a LOCAL optimum only.\n\nHidden assumptions: clusters are spherical, similarly sized, and similarly dense. It fails badly on elongated or nested shapes because it minimises within-cluster squared distance.\n\nInitialisation matters enormously: random init can converge terribly, so use k-means++ (spread initial centroids apart probabilistically).\n\nChoosing k: elbow method, silhouette score, gap statistic — all heuristics. Features must be scaled first.',
    },
    {
      front: 'DBSCAN vs k-means',
      back: 'DBSCAN grows clusters from dense regions using eps (neighbourhood radius) and min_samples.\n\nAdvantages: finds ARBITRARY shapes, does not require choosing k, and explicitly labels outliers as noise.\n\nWeaknesses: struggles when clusters have very different densities, and eps is hard to choose in high dimensions where distances concentrate.\n\nUse DBSCAN when: shapes are irregular or outliers matter (anomaly detection). Use k-means when: clusters are roughly globular and you need speed at scale.\n\nHDBSCAN removes the fixed-eps limitation by building a hierarchy over densities.',
    },
    {
      front: 'PCA — what is it actually doing?',
      back: 'Finds orthogonal directions of maximum variance; these are the eigenvectors of the covariance matrix, with eigenvalues giving variance explained.\n\nUnder the hood: it is the linear projection minimising reconstruction error. Equivalently, the SVD of the centred data matrix.\n\nCritical preprocessing: you MUST centre, and standardise when features have different units — otherwise a feature measured in metres dominates one measured in kilometres purely by scale.\n\nLimits: only captures LINEAR structure, and components are usually uninterpretable mixtures. Not a feature-selection method — it creates new features rather than choosing among existing ones.',
    },
    {
      front: 't-SNE and UMAP — and how to not misread them',
      back: 'Non-linear methods that preserve LOCAL neighbourhood structure for visualisation.\n\nCritical caveats: cluster SIZES are meaningless, distances BETWEEN clusters are largely meaningless, and results change with perplexity/seed. t-SNE has no meaningful global geometry.\n\nUMAP preserves more global structure, is much faster, and can transform new points — t-SNE cannot embed new data without refitting.\n\nBiggest mistake: treating a t-SNE plot as evidence that clusters are well separated in the original space, or feeding t-SNE coordinates into a downstream model.',
    },
    {
      front: 'Backpropagation',
      back: 'Applies the chain rule backwards through the computation graph, reusing intermediate results so all gradients cost roughly one forward pass.\n\nUnder the hood: the forward pass caches activations; the backward pass multiplies local Jacobians. Without this reuse, computing gradients numerically would cost one forward pass PER PARAMETER — completely infeasible.\n\nMemory consequence: activations must be stored for the backward pass, which is why memory scales with depth × batch size. Gradient checkpointing trades compute for memory by recomputing them.',
    },
    {
      front: 'Activation functions and the dying ReLU',
      back: 'Sigmoid/tanh SATURATE: gradients approach zero for large |x|, which is a primary cause of vanishing gradients in deep nets.\n\nReLU: max(0,x). Cheap, non-saturating for positive inputs, and induces sparsity — it made deep nets trainable.\n\nDying ReLU: a unit pushed to always-negative pre-activation outputs 0 with gradient 0 FOREVER — it can never recover. Often triggered by too high a learning rate.\n\nFixes: Leaky ReLU / ELU / GELU keep a small negative slope. GELU is standard in transformers.',
    },
    {
      front: 'Vanishing and exploding gradients',
      back: 'Gradients are products of many terms across layers. If those terms are consistently < 1 the product decays to zero; if > 1 it explodes.\n\nSymptoms: early layers stop learning (vanishing), or loss goes NaN (exploding).\n\nFixes: non-saturating activations (ReLU family), careful initialisation (Xavier for tanh, He for ReLU — both keep activation variance stable across layers), normalisation layers, RESIDUAL CONNECTIONS (which give gradients a direct path, the key enabler of very deep nets), and gradient clipping for explosions.',
    },
    {
      front: 'Batch norm vs layer norm',
      back: 'Batch norm normalises each feature ACROSS THE BATCH; layer norm normalises across FEATURES within each individual example.\n\nWhy the distinction matters: batch norm depends on batch statistics, so it behaves differently at train and inference time (it uses running averages), degrades with small batches, and is awkward for variable-length sequences. Layer norm has no batch dependence at all — which is why transformers use it.\n\nEffect: originally credited to reducing "internal covariate shift"; the better-supported explanation is that it SMOOTHS THE LOSS LANDSCAPE, permitting higher learning rates.',
    },
    {
      front: 'Dropout',
      back: 'Randomly zeroes a fraction p of activations during training only.\n\nUnder the hood: prevents co-adaptation by making units unable to rely on any specific other unit, and approximates training an exponential ensemble of subnetworks that share weights.\n\nAt inference: dropout is OFF and activations are scaled (or, with inverse dropout, scaled during training instead) so expected magnitudes match.\n\nGotchas: forgetting model.eval() in PyTorch leaves dropout active and produces random predictions. Dropout interacts poorly with batch norm — modern architectures often use one or the other.',
    },
    {
      front: 'CNNs: convolution, weight sharing, receptive field',
      back: 'A small kernel slides across the input, so the same weights detect a pattern anywhere — giving translation equivariance and vastly fewer parameters than a dense layer.\n\nThree structural priors: locality (nearby pixels relate), weight sharing (patterns are position-independent), and hierarchy (edges → textures → parts → objects).\n\nReceptive field: the input region influencing one output unit. It grows with depth, kernel size, stride, and dilation — and if it is smaller than the object you care about, the network structurally cannot see it.\n\nPooling adds invariance and shrinks spatial dimensions.',
    },
    {
      front: 'RNNs and LSTMs',
      back: 'RNNs carry a hidden state across timesteps, sharing weights over time — but repeated multiplication through the same matrix causes vanishing/exploding gradients over long sequences.\n\nLSTM fix: a CELL STATE with additive updates, plus gates (forget, input, output) controlling information flow. Because the cell state is updated additively rather than multiplicatively, gradients flow across many steps without decaying.\n\nGRU: merges gates, fewer parameters, often comparable.\n\nWhy transformers replaced them: RNNs are inherently SEQUENTIAL and cannot parallelise across time, which caps training throughput.',
    },
    {
      front: 'Attention and transformers',
      back: 'Attention(Q,K,V) = softmax(QKᵀ/√d)V. Each position attends to every other, weighted by query-key similarity.\n\nWhy √d: without it, dot products grow with dimension, pushing softmax into saturation where gradients vanish.\n\nKey advantages: any two positions are ONE step apart (no long-range decay), and the whole sequence is processed in parallel.\n\nMulti-head: several attention subspaces capture different relation types.\n\nCosts: O(n²) in sequence length for both time and memory — the central bottleneck driving FlashAttention and sparse/linear attention variants. Positional encodings are required since attention is permutation-invariant.',
    },
    {
      front: 'Embeddings',
      back: 'Dense low-dimensional vectors representing discrete items, learned so that geometric closeness reflects semantic or behavioural similarity.\n\nWhy not one-hot: one-hot is huge, sparse, and treats every pair of items as equally dissimilar — it carries no notion of relatedness.\n\nUnder the hood: an embedding layer is just a lookup into a learned matrix, mathematically equivalent to multiplying a one-hot vector by a weight matrix but implemented as indexing.\n\nSizing heuristic: roughly the fourth root of cardinality. Gotcha: high-cardinality embeddings hold most of a recommender\'s parameters and can dominate memory.',
    },
    {
      front: 'Transfer learning and fine-tuning',
      back: 'Reuse a model pretrained on a large corpus, then adapt it to your task — early layers hold general features, later layers task-specific ones.\n\nStrategy by data size: very little data → freeze the backbone and train only the head. More data → unfreeze progressively with a LOW learning rate, since large updates destroy pretrained features (catastrophic forgetting).\n\nUnder the hood: pretraining supplies a far better initialisation than random, so you need orders of magnitude less labelled data.\n\nModern variants: LoRA and adapters tune a small number of extra parameters, making fine-tuning cheap and letting many tasks share one base model.',
    },
    {
      front: 'Cross-validation strategies — and when k-fold is wrong',
      back: 'k-fold: split into k parts, train on k−1, validate on the rest. Stratified k-fold preserves class proportions and should be the default for classification.\n\nWhen standard k-fold is INVALID: (1) time series — random folds let the model train on the future and predict the past; use forward-chaining splits. (2) Grouped data — multiple rows per user must stay in the same fold, or the model memorises the user; use GroupKFold.\n\nGotcha: any preprocessing fitted on the full dataset (scaling, imputation, feature selection) leaks validation information. Fit it INSIDE the fold, via a pipeline.',
    },
    {
      front: 'Data leakage — the most expensive bug in ML',
      back: 'Information available at training time that will not exist at prediction time, producing brilliant offline metrics and a worthless production model.\n\nCommon sources: scaling/imputing before the split; target encoding computed over all data; features derived from the future (point-in-time violations); duplicate rows spanning splits; an ID that correlates with the label.\n\nTell-tale sign: suspiciously high performance, or one feature with overwhelming importance.\n\nDefence: build every transform inside a pipeline fitted per fold, and for temporal data ask of each feature "would I truly have known this at decision time?"',
    },
    {
      front: 'Hyperparameter search: grid, random, Bayesian',
      back: 'Grid: exhaustive, cost explodes exponentially with dimensions. Random: samples independently — provably better than grid in high dimensions, because most hyperparameters barely matter and random search spends more distinct trials on the ones that do.\n\nBayesian optimisation: builds a surrogate model of the objective and picks the most promising next point. Sample-efficient, best when each run is expensive.\n\nHyperband/ASHA: allocate compute adaptively, killing bad runs early — usually the best value in practice.\n\nGotcha: tuning against the test set is leakage. Use a separate validation set or nested CV.',
    },
    {
      front: 'Generative vs discriminative models',
      back: 'Discriminative models learn P(Y|X) directly (logistic regression, trees, most neural nets). Generative models learn P(X,Y) or P(X|Y)·P(Y) and apply Bayes\' rule (Naive Bayes, GMMs, diffusion models, LLMs).\n\nTrade-off: discriminative models usually win on pure classification accuracy given enough data, since they solve the easier problem directly. Generative models converge faster with LITTLE data, can synthesise samples, handle missing features naturally, and support anomaly detection through likelihood.\n\nRule of thumb: if you only need a decision boundary, modelling the full input distribution is wasted effort.',
    },
    {
      front: 'Handling class imbalance in training',
      back: 'Options: class weights in the loss (cheapest, keeps data intact), oversampling the minority (SMOTE interpolates synthetic points), undersampling the majority (discards data), or focal loss (down-weights easy examples so training focuses on hard ones).\n\nCritical rule: resample ONLY the training fold. Applying SMOTE before splitting leaks synthetic points derived from validation data.\n\nGotcha: any resampling distorts predicted probabilities, so calibration breaks. If probabilities matter, prefer class weights or recalibrate afterwards.\n\nOften the best lever is not resampling at all — just move the decision THRESHOLD.',
    },
    {
      front: 'No Free Lunch theorem',
      back: 'Averaged over ALL possible problems, every algorithm performs identically. No learner is universally superior.\n\nWhat it actually means: performance comes from an algorithm\'s INDUCTIVE BIAS matching the structure of your specific problem. CNNs beat MLPs on images because locality and translation equivariance are true of images, not because convolution is inherently better.\n\nPractical takeaway: this is why "which model is best?" has no answer without the data. It also justifies empirical benchmarking — and explains why boosted trees still beat deep nets on most tabular problems.',
    },
  ],
}
