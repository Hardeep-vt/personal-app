// Core statistics concepts — the original set, kept verbatim so cards already
// imported into the sheet keep matching on their question text.

export default [
  {
    front: 'Sampling bias — what is it, and why does more data not fix it?',
    back: 'The way you collected the sample makes some population members systematically more likely to appear, so the sample distribution ≠ the population distribution.\n\nWhy more data does not help:\n- Bias shifts the quantity you are estimating, not just the noise around it.\n- More data narrows the confidence interval around the WRONG value — you become precisely wrong.\n\nPitfall:\n- "We have 100M rows so it must be representative." Volume never fixes bias.\n\nExample:\n- A credit model trained only on approved applicants. You never observe how rejected applicants would have repaid, so the model cannot learn about them.',
  },
  {
    front: 'Central Limit Theorem — what exactly converges to normal?',
    back: 'Take many samples, compute the mean of each. The distribution of THOSE means (properly scaled) approaches a normal distribution as sample size n grows — whatever shape the population has, as long as its variance is finite.\n\nKey point:\n- It is about the sampling distribution of a statistic, not about your raw data.\n\nPitfall:\n- Using it to claim your features are normally distributed. It says nothing about individual observations.\n\nGotcha:\n- Fails for infinite-variance / heavy-tailed distributions (Cauchy).\n- Converges slowly for very skewed data — "n ≥ 30" is a rule of thumb, not a law.',
  },
  {
    front: 'p-value — precise definition, and the three things it is NOT',
    back: 'The probability of seeing data at least as extreme as yours, IF the null hypothesis were true: P(data this extreme | null true).\n\nIt is NOT:\n- The probability the null is true.\n- The probability the result was due to chance.\n- A measure of effect size or importance.\n\nMechanism:\n- It is a tail probability under an assumed null model, so it depends on your sampling plan, not only on the data you collected.\n\nPitfall:\n- With huge n, trivially small effects clear p < 0.05. Always report an effect size and a confidence interval next to it.',
  },
  {
    front: 'Type I vs Type II error, and statistical power',
    back: 'Two ways a test can be wrong:\n- Type I (rate α): reject a true null — a false positive.\n- Type II (rate β): fail to reject a false null — a false negative.\n- Power = 1 − β: the chance of detecting a real effect.\n\nMechanism:\n- For fixed n, lowering α raises β — you cannot shrink both at once.\n- Power rises with larger true effect, larger n, and lower variance.\n\nPitfall:\n- Running an underpowered test and reading "not significant" as "no effect". Absence of evidence is not evidence of absence.\n\nExample:\n- An A/B test with n = 200 simply cannot detect a 0.5% lift.',
  },
  {
    front: 'Multiple comparisons problem — and how to correct for it',
    back: 'Run many tests at α = 0.05 each and the chance of at least one false positive balloons: 1 − 0.95^k. With 20 tests it is about 64%.\n\nWhy:\n- α controls the error rate PER TEST, not across a whole family of tests.\n\nCorrections:\n- Bonferroni (use α/k): controls the family-wide error rate, but very conservative.\n- Benjamini-Hochberg: controls the False Discovery Rate (expected share of your "hits" that are false), far more power — usually the better choice in ML.\n\nExample:\n- Slicing an A/B test across 20 segments until one "wins".',
  },
  {
    front: 'Peeking / optional stopping in A/B tests',
    back: 'Repeatedly checking a running experiment and stopping the moment p < 0.05. This pushes the real false-positive rate far above 5% — often to 20-30%.\n\nMechanism:\n- The p-value assumes a sample size FIXED in advance. Continuous checking gives the random walk many chances to cross the threshold.\n\nFix:\n- Fix n in advance via a power analysis, or\n- Use methods built for it: sequential testing, always-valid p-values, or Bayesian bandits.\n\nGotcha:\n- This is probably the single most common way real experiments produce false wins.',
  },
  {
    front: 'Confidence interval — what does "95%" actually refer to?',
    back: 'It refers to the PROCEDURE, not to your one interval: a method that, across repeated samples, produces intervals containing the true parameter 95% of the time.\n\nMechanism:\n- The randomness is in the interval, not the parameter. Your specific computed interval either contains the true value or it does not.\n\nPitfall:\n- "There is a 95% probability the true value is in [a, b]." That describes a Bayesian credible interval — a different object.\n\nWhy it beats a bare p-value:\n- A CI shows magnitude and precision, not just "significant or not".',
  },
  {
    front: 'Maximum Likelihood Estimation (MLE)',
    back: 'Pick the parameters θ that make your observed data most probable: argmax_θ  P(data | θ).\n\nWhy it matters:\n- Most standard losses ARE MLE in disguise. Squared error = MLE under Gaussian noise. Cross-entropy = MLE for a Bernoulli / categorical model. This is WHY those losses are used.\n\nProperties:\n- Consistent and asymptotically efficient (hits the precision floor as n grows).\n- Biased in small samples — the MLE of variance divides by n, not n − 1.\n\nPitfall:\n- MLE has no preference for simpler parameters, so it overfits happily. Regularisation adds that preference.',
  },
  {
    front: "Bayes' theorem — and the base rate fallacy",
    back: 'How to update a belief with evidence: P(A|B) = P(B|A)·P(A) / P(B), i.e. posterior ∝ likelihood × prior.\n\nBase rate fallacy:\n- Ignoring P(A), the prior / prevalence.\n\nExample:\n- A disease affects 1 in 10,000. A test is 99% accurate. You test positive.\n- Per 10,000 people: ~1 true case, but ~100 false positives among the healthy.\n- P(actually sick | positive) ≈ 1%, not 99%.\n\nWhy it matters in ML:\n- This is exactly why a 99%-accurate classifier on a rare event can still be useless in production.',
  },
  {
    front: 'MLE vs MAP — and why regularization is a prior',
    back: 'Two ways to fit parameters:\n- MLE maximises P(data | θ).\n- MAP maximises P(θ | data) ∝ P(data | θ)·P(θ), adding a prior belief about the parameters.\n\nThe key insight:\n- L2 regularization = MAP with a Gaussian prior centred at 0.\n- L1 regularization = MAP with a Laplace prior.\n- The regularization strength λ is the inverse of the prior variance.\n- So "shrink weights toward zero" and "believe weights are small a priori" are the same statement.\n\nGotcha:\n- As n grows the likelihood dominates and the prior washes out.',
  },
  {
    front: 'Bootstrap — how it works and when it breaks',
    back: 'Estimate the uncertainty of a statistic by resampling your own data.\n\nHow:\n- Draw samples of the same size WITH replacement, many times.\n- Recompute the statistic on each resample.\n- The spread of those values approximates its sampling distribution.\n\nMechanism:\n- Treats the observed data as a stand-in for the population — no formula needed, which is why it works for medians, ratios, AUC and other awkward statistics.\n\nBreaks down for:\n- Extremes (max / min), very small n, and dependent data (time series, grouped data) unless you use a block / cluster bootstrap.\n\nUse it when:\n- You need a confidence interval for a metric with no clean analytic standard error.',
  },
  {
    front: 'Permutation test',
    back: 'Test whether a grouping matters by shuffling the group labels.\n\nHow:\n- Shuffle labels many times; each shuffle is a world where "the label does not matter".\n- Recompute the test statistic each time to build its null distribution.\n- See where the real, unshuffled statistic falls in that distribution.\n\nStrengths:\n- Almost no distributional assumptions; exact; works for any statistic you can compute.\n\nCosts:\n- Compute-heavy.\n- Assumes exchangeability, so it is invalid when observations are dependent or the groups have very different variances.',
  },
  {
    front: 'Bias-variance decomposition',
    back: 'Expected squared prediction error splits into three parts:\n- bias²: error from wrong assumptions (model too simple).\n- variance: sensitivity to the particular training sample.\n- irreducible noise: the floor you cannot beat.\n\nGotcha:\n- This clean split is for SQUARED loss. It does not decompose so neatly for 0-1 (classification) loss.\n\nModern wrinkle:\n- Deep nets and boosted ensembles show "double descent" — pushing far past the point of interpolating the training set can REDUCE test error again, which the classic U-shaped curve does not predict.',
  },
  {
    front: "Simpson's paradox",
    back: 'A trend that holds in every subgroup can reverse when you pool the groups together.\n\nMechanism:\n- A confounder is spread unevenly across groups, so pooling mixes populations with different base rates.\n\nExample:\n- A treatment looks better in both mild and severe cases separately, yet worse overall — because it was given mostly to severe cases.\n\nML relevance:\n- An aggregate offline metric can hide a per-segment regression. Slice metrics by segment before trusting an overall number.',
  },
  {
    front: 'Confounding variable',
    back: 'A variable that influences BOTH the supposed cause and the outcome, creating an association between them that is not causal.\n\nMechanism:\n- It opens a "back-door path" between X and Y. Conditioning on it (stratify, match, or add as a covariate) closes that path.\n\nExample:\n- Ice cream sales and drownings both rise together — temperature drives both.\n\nGotcha:\n- Do NOT blindly control for everything. Conditioning on a COLLIDER (a common effect of X and Y) creates bias where none existed. More covariates is not automatically safer.',
  },
  {
    front: 'Correlation vs causation — what actually establishes causality?',
    back: 'Correlation is a symmetric measure of linear co-movement. Causation is directional and about intervention: what happens to Y if I SET X.\n\nWhat establishes causation:\n- A randomised experiment (breaks the link between X and all confounders), or\n- A quasi-experimental design: instrumental variables, difference-in-differences, regression discontinuity, or a defensible causal graph.\n\nGotcha:\n- A correlation of 0 rules out only LINEAR association. y = x² over a symmetric range has correlation ≈ 0 while y is perfectly determined by x.',
  },
  {
    front: 'Pearson vs Spearman correlation',
    back: 'Two correlation coefficients:\n- Pearson: linear association on the raw values.\n- Spearman: Pearson applied to the RANKS, so it captures any monotonic relationship, curved or not.\n\nUse Spearman when:\n- The relationship is monotonic but curved, there are outliers, or the data is ordinal.\n\nMechanism:\n- Ranking throws away magnitude, which is exactly what buys robustness to outliers.\n\nGotcha:\n- Both are single numbers that hide structure. Anscombe\'s quartet: four datasets, identical correlation, completely different shapes. Always plot.',
  },
  {
    front: 'Multicollinearity and VIF',
    back: 'Predictor variables that are strongly correlated WITH EACH OTHER. The model still predicts fine, but individual coefficients become unstable and hard to interpret.\n\nMechanism:\n- XᵀX becomes near-singular, so inverting it blows up. Tiny data changes swing coefficients wildly, sometimes flipping their sign.\n\nDetect:\n- Variance Inflation Factor. VIF > 5-10 is a warning sign.\n\nKey distinction:\n- It hurts INFERENCE (coefficient meaning), not prediction accuracy. If you only care about accuracy you can often ignore it.\n- Ridge regression fixes it directly by making the matrix invertible again.',
  },
  {
    front: 'Heteroscedasticity',
    back: 'The spread of the residuals changes across the range of the predictors — a fan or cone shape in a residual plot, instead of an even band.\n\nConsequence:\n- OLS coefficients stay unbiased, but the standard errors are wrong — so p-values and confidence intervals mislead.\n\nFixes:\n- Robust (sandwich) standard errors.\n- Weighted least squares.\n- A variance-stabilising transform such as log.\n\nExample:\n- Predicting spend from income — spend varies far more among high earners than low earners.',
  },
  {
    front: 'R² — and why adjusted R² exists',
    back: 'The fraction of variance in y that the model explains: 1 − SS_residual / SS_total.\n\nPitfall:\n- R² NEVER decreases when you add a predictor, even pure noise. So it cannot be used to choose between models. Adjusted R² penalises parameter count to fix this.\n\nGotcha:\n- R² can be NEGATIVE on a test set — it means the model does worse than just predicting the mean.\n\nBigger point:\n- A high R² does not imply a correct or causal model, and a low R² is normal and fine in genuinely noisy domains.',
  },
  {
    front: 'Missing data: MCAR, MAR, MNAR',
    back: 'Three reasons a value can be missing, in increasing order of trouble:\n- MCAR — missingness unrelated to anything. Dropping rows is unbiased, just wasteful.\n- MAR — missingness depends on OBSERVED variables. Imputation conditioned on those works.\n- MNAR — missingness depends on the UNOBSERVED value itself. No imputation fully fixes it.\n\nExample of MNAR:\n- High earners declining to state their income. The fact that it is missing is informative.\n\nIn practice:\n- Add a binary "was_missing" indicator column. If missingness carries signal, the model can use it — and it often does.',
  },
  {
    front: 'Class imbalance — why accuracy lies',
    back: 'When one class massively outnumbers the other, a model that always predicts the majority scores high accuracy while being useless.\n\nExample:\n- 99.9% of transactions are legitimate. "Always predict legitimate" = 99.9% accurate and catches zero fraud.\n\nUse instead:\n- Precision, recall, F1, and PR-AUC.\n\nHandling:\n- Class weights, threshold tuning, resampling (SMOTE), or a different loss (focal loss).\n\nGotcha:\n- Resampling distorts predicted probabilities. If you need calibrated probabilities, prefer class weights or recalibrate afterwards.',
  },
  {
    front: 'ROC-AUC vs PR-AUC — when does the choice matter?',
    back: 'Two summary curves for a scoring classifier:\n- ROC-AUC: plots true-positive rate vs false-positive rate. Equals the probability a random positive is ranked above a random negative.\n- PR-AUC: plots precision vs recall.\n\nKey difference:\n- ROC-AUC\'s false-positive rate has the huge negative class in its denominator, so a flood of false positives barely moves it.\n- PR-AUC\'s precision has your positive predictions in its denominator, so it reacts.\n\nSo:\n- On heavily imbalanced problems ROC-AUC looks deceptively good — 0.95 while precision at your operating point is 5%. Prefer PR-AUC when positives are rare and you care about them.',
  },
  {
    front: 'Calibration and the Brier score',
    back: 'A model is calibrated when, among all its 0.7 predictions, about 70% actually turn out positive.\n\nKey point:\n- Ranking quality (AUC) and calibration are INDEPENDENT. A model can rank perfectly and still be badly calibrated.\n\nMeasure:\n- Reliability diagram, expected calibration error, or Brier score (mean squared error on the predicted probabilities).\n\nFix:\n- Platt scaling (fit a logistic on held-out scores), or isotonic regression (non-parametric, needs more data).\n\nWhy it matters:\n- Any downstream expected-value decision — bidding, risk, cost-based thresholds — needs true probabilities, not just correct ordering.',
  },
  {
    front: 'Entropy and cross-entropy',
    back: 'Entropy H(p) = −Σ p log p: the average information content of a distribution, i.e. the best achievable average code length for its samples. Maximal for a uniform distribution, zero when one outcome is certain.\n\nCross-entropy H(p, q) = −Σ p log q: the cost of coding samples that truly come from p using a code optimised for q.\n\nThe identity that matters:\n- H(p, q) = H(p) + KL(p‖q).\n- H(p) is fixed by the data, so MINIMISING CROSS-ENTROPY LOSS IS EXACTLY MINIMISING KL DIVERGENCE from your model to the true labels.',
  },
  {
    front: 'KL divergence — and why it is not a distance',
    back: 'KL(P‖Q) = Σ P(x) log(P(x)/Q(x)): the expected number of extra bits you pay by using Q to model data that really comes from P.\n\nNot a metric:\n- Asymmetric: KL(P‖Q) ≠ KL(Q‖P).\n- Violates the triangle inequality.\n\nThe asymmetry has real consequences:\n- Minimising KL(P‖Q) is mode-COVERING: Q must put mass everywhere P does.\n- Minimising KL(Q‖P) is mode-SEEKING: Q collapses onto one mode of P.\n- This drives the behaviour of variational inference and generative models.\n\nGotcha:\n- Infinite when Q = 0 somewhere P > 0. Jensen-Shannon divergence is a symmetric, bounded alternative.',
  },
  {
    front: 'Covariate shift, label shift, and concept drift',
    back: 'Three ways the data distribution can change between training and production:\n- Covariate shift: P(X) changes, P(Y|X) stays. The inputs move.\n- Label shift: P(Y) changes, P(X|Y) stays. The class mix moves.\n- Concept drift: P(Y|X) itself changes. The rule you learned is now wrong.\n\nWhy the distinction matters:\n- Covariate shift can often be corrected by importance-weighting the inputs.\n- Concept drift cannot — it needs new labels and retraining.\n\nExample:\n- A spam filter meeting new vocabulary (covariate shift) vs spammers actively rewording to evade it (concept drift).\n\nDetect:\n- PSI or KS test on features; monitor performance once labels arrive.',
  },
  {
    front: 'Survivorship bias',
    back: 'Analysing only the entities that made it through some selection process, while the ones that dropped out are invisible in your data.\n\nCanonical example:\n- WWII bombers came back with bullet holes in the wings. Reinforcing the wings is wrong — planes hit in the ENGINES never came back. Armour the untouched areas.\n\nML examples:\n- Training a churn model only on still-active users.\n- Backtesting a strategy on companies still listed today.\n- Learning from products that were never pulled from the shelf.\n\nAlways ask:\n- What data was destroyed or never recorded before it reached me?',
  },
  {
    front: 'Regression to the mean',
    back: 'Extreme measurements tend to be followed by less extreme ones, purely because an extreme value partly reflects luck that does not repeat.\n\nMechanism:\n- Any measurement = signal + noise. Selecting on an extreme value selects partly for extreme noise, which by definition does not persist.\n\nTrap:\n- It manufactures fake causal stories. "We coached the worst performers and they improved" — they would have improved anyway.\n\nML relevance:\n- This is why targeting an intervention at the worst-performing segment makes almost any intervention look effective without a control group.',
  },
  {
    front: 'A/B test sample size — what drives it?',
    back: 'Roughly, n per arm ≈ 16σ² / Δ², where Δ is the smallest effect you want to be able to detect (for 80% power, α = 0.05).\n\nThe critical property:\n- n scales with 1 / Δ². Halving the detectable effect QUADRUPLES the sample you need. Small lifts are expensive to detect.\n\nDecide before running:\n- Baseline rate, minimum detectable effect, α, and power.\n\nPitfall:\n- Computing sample size after peeking at results.\n- Powering for a lift far larger than anything plausible, so the test is guaranteed inconclusive.',
  },
  {
    front: 'CUPED (variance reduction in experiments)',
    back: 'A technique to make an A/B test more sensitive by subtracting out variance you could have predicted from before the experiment started.\n\nHow:\n- Y_adjusted = Y − θ(X_pre − mean(X_pre)), with θ = Cov(Y, X_pre) / Var(X_pre).\n- X_pre is a pre-experiment metric (e.g. each user\'s prior activity).\n\nWhy it is unbiased:\n- X_pre cannot have been affected by a treatment that had not happened yet, so removing its variation removes noise without touching the treatment effect.\n\nPayoff:\n- 30-50% variance reduction is common — equivalent to a much bigger sample for free. Since n scales as 1/Δ², that meaningfully shrinks the detectable effect.\n\nRequires:\n- A pre-period metric correlated with the outcome.',
  },
  {
    front: 'Novelty and primacy effects in experiments',
    back: 'Two transient reactions to CHANGE that distort early experiment results:\n- Novelty: users engage with anything new just because it is new, so early results overstate the true effect.\n- Primacy: users trained on the old design temporarily do WORSE with a better new one.\n\nMechanism:\n- Both are responses to the change itself, not its quality. They decay over time.\n\nDetect:\n- Plot the treatment effect by day. A curve trending toward zero signals novelty.\n\nFix:\n- Run long enough for the effect to stabilise.\n- Analyse brand-new users separately — they have no prior expectation to unlearn.',
  },
  {
    front: 'Robust statistics — median, MAD, and trimming',
    back: 'The mean and standard deviation have a breakdown point of 0: a SINGLE extreme value can move them arbitrarily far. The median has a breakdown point of 50%.\n\nRobust alternatives:\n- Median for location.\n- MAD (median absolute deviation) or IQR for spread.\n- Huber loss for regression: quadratic near zero, linear in the tails.\n\nWhen it matters:\n- Heavy-tailed data — revenue, latency, session length are all right-skewed.\n\nGotcha:\n- Mean latency is nearly meaningless. SLAs are written on p95 / p99 precisely because the tail is what users feel.',
  },
  {
    front: 'Why log-transform a skewed variable?',
    back: 'Taking log(x) compresses a long right tail, turns multiplicative relationships into additive ones, and often stabilises variance.\n\nMechanism:\n- log turns y = a·x^b into log y = log a + b·log x. A power law becomes linear, and coefficients read as elasticities (a 1% change in x → about b% change in y).\n\nUse for:\n- Income, prices, counts, page views, durations.\n\nGotchas:\n- Undefined at 0 — use log1p (log of 1 + x).\n- E[log Y] ≠ log E[Y] (Jensen\'s inequality), so back-transforming a mean prediction UNDERESTIMATES the true mean.',
  },
]
