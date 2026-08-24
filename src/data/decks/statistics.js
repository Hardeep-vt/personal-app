// Statistics concepts that come up in ML engineering interviews.
// Each back follows: definition -> what's actually happening -> pitfall/gotcha -> example.

export default {
  deck: 'Statistics for ML',
  cards: [
    {
      front: 'Sampling bias — what is it, and why does more data not fix it?',
      back: 'The sample is drawn so some population members are systematically more likely to appear, so the sample distribution ≠ the population distribution.\n\nUnder the hood: it shifts the quantity you are estimating, not just the noise around it. More data narrows the interval around the WRONG value.\n\nPitfall: "we have 100M rows so it must be representative." Volume never fixes bias.\n\nExample: a credit model trained only on approved applicants — you never observe how rejected applicants would have repaid.',
    },
    {
      front: 'Central Limit Theorem — what exactly converges to normal?',
      back: 'The distribution of the SAMPLE MEAN (properly scaled) approaches a normal distribution as n grows, whatever the population shape, provided variance is finite.\n\nUnder the hood: it describes the sampling distribution of a statistic, not your raw data.\n\nPitfall: using it to claim your features are normally distributed. It says nothing about individual observations.\n\nGotcha: fails for infinite-variance / heavy-tailed distributions (Cauchy), and converges slowly for very skewed data — n=30 is a rule of thumb, not a law.',
    },
    {
      front: 'p-value — precise definition, and the three things it is NOT',
      back: 'P(data at least as extreme as observed | null hypothesis true).\n\nIt is NOT: (1) the probability the null is true, (2) the probability the result was chance, (3) a measure of effect size.\n\nUnder the hood: a tail probability under an assumed null model, so it depends on your sampling plan, not just the data you collected.\n\nPitfall: with huge n, trivially small effects reach p<0.05. Always report effect size and a confidence interval alongside it.',
    },
    {
      front: 'Type I vs Type II error, and statistical power',
      back: 'Type I (α): rejecting a true null — a false positive. Type II (β): failing to reject a false null — a false negative. Power = 1 − β, the chance of detecting a real effect.\n\nUnder the hood: for fixed n, lowering α raises β. Power rises with larger effect size, larger n, and lower variance.\n\nPitfall: running an underpowered test and reading "not significant" as "no effect." Absence of evidence is not evidence of absence.\n\nExample: an A/B test with n=200 simply cannot detect a 0.5% lift.',
    },
    {
      front: 'Multiple comparisons problem — and how to correct for it',
      back: 'Testing many hypotheses at α=0.05 each means the chance of at least one false positive grows fast: 1−0.95^k. With 20 tests it is ~64%.\n\nUnder the hood: α controls the error rate PER TEST, not across a family of tests.\n\nCorrections: Bonferroni (α/k) controls family-wise error but is very conservative. Benjamini-Hochberg controls the False Discovery Rate and has far more power — usually the better choice in ML.\n\nExample: checking an A/B test across 20 segments until one "wins."',
    },
    {
      front: 'Peeking / optional stopping in A/B tests',
      back: 'Repeatedly checking a running experiment and stopping when p<0.05 inflates the false positive rate far above 5% — often to 20-30%.\n\nUnder the hood: the p-value assumes a FIXED sample size decided in advance. Continuous monitoring gives the random walk many chances to cross the threshold.\n\nFix: fix n in advance via power analysis, or use methods designed for it — sequential testing, always-valid p-values, or Bayesian bandits.\n\nGotcha: this is probably the single most common way real experiments lie.',
    },
    {
      front: 'Confidence interval — what does "95%" actually refer to?',
      back: 'A procedure that, across repeated samples, produces intervals containing the true parameter 95% of the time.\n\nUnder the hood: the randomness lives in the INTERVAL, not the parameter. A specific computed interval either contains the true value or it does not.\n\nPitfall: saying "there is a 95% probability the true value is in [a,b]" — that is the Bayesian credible interval, a different object.\n\nUseful: a CI carries strictly more information than a p-value, since it shows magnitude and precision.',
    },
    {
      front: 'Maximum Likelihood Estimation (MLE)',
      back: 'Choose parameters θ that maximise the probability of the observed data: argmax θ P(data | θ).\n\nUnder the hood: most standard losses ARE MLE. Squared error = MLE under Gaussian noise. Cross-entropy = MLE for a categorical/Bernoulli model. Knowing this explains WHY those losses are used.\n\nProperties: consistent and asymptotically efficient, but biased in small samples (e.g. MLE of variance divides by n, not n−1).\n\nPitfall: MLE happily overfits — it has no preference for simpler parameters.',
    },
    {
      front: "Bayes' theorem — and the base rate fallacy",
      back: 'P(A|B) = P(B|A)·P(A) / P(B). Posterior ∝ likelihood × prior.\n\nBase rate fallacy: ignoring P(A), the prior.\n\nExample: a disease affects 1 in 10,000. A test is 99% accurate. You test positive. P(sick) ≈ 1%, not 99% — because false positives (~100 per 10,000 healthy people) vastly outnumber the 1 true case.\n\nWhy it matters in ML: this is exactly why a 99%-accurate classifier on a rare-event problem can still be useless in production.',
    },
    {
      front: 'MLE vs MAP — and why regularization is a prior',
      back: 'MLE maximises P(data|θ). MAP maximises P(θ|data) ∝ P(data|θ)·P(θ), adding a prior over parameters.\n\nUnder the hood — this is the key insight: L2 regularization is exactly MAP with a Gaussian prior centred at 0. L1 is MAP with a Laplace prior. The regularization strength λ is the inverse of the prior variance.\n\nSo: "shrink weights toward zero" and "believe a priori that weights are small" are the same statement.\n\nGotcha: as n grows the likelihood dominates and the prior washes out.',
    },
    {
      front: 'Bootstrap — how it works and when it breaks',
      back: 'Resample your data WITH replacement many times, recompute the statistic each time, and use the spread of those values as its sampling distribution.\n\nUnder the hood: it treats the empirical distribution as a stand-in for the population — no closed-form formula needed, which is why it works for medians, ratios, AUC, and other awkward statistics.\n\nBreaks down for: extremes (max/min), very small n, and dependent data (time series, grouped data) unless you use a block/cluster bootstrap.\n\nUse: confidence intervals for metrics with no analytic standard error.',
    },
    {
      front: 'Permutation test',
      back: 'Shuffle the group labels many times to build the distribution of the test statistic under the null of "labels do not matter," then see where the observed statistic falls.\n\nUnder the hood: it makes the null concrete by simulation instead of assuming a parametric form — so it needs almost no distributional assumptions.\n\nStrength: exact, works for any statistic you can compute.\n\nCost: compute-heavy, and it assumes exchangeability — so it is invalid when observations are dependent or the groups differ in variance.',
    },
    {
      front: 'Bias-variance decomposition',
      back: 'Expected squared error = bias² + variance + irreducible noise.\n\nBias: error from wrong assumptions (too simple a model). Variance: sensitivity to the particular training sample. Noise: floor you cannot beat.\n\nUnder the hood: the decomposition is for squared loss specifically; it does not decompose so cleanly for 0-1 loss.\n\nGotcha: modern deep nets and boosted ensembles show "double descent" — going far past the interpolation point can REDUCE test error again, which the classic U-shaped picture does not predict.',
    },
    {
      front: "Simpson's paradox",
      back: 'A trend that appears in every subgroup can reverse when the groups are pooled.\n\nUnder the hood: caused by a confounder that is unevenly distributed across groups, so pooling mixes populations with different base rates.\n\nClassic example: a treatment looks better in both mild and severe cases separately, yet worse overall — because it was given mostly to severe cases.\n\nML relevance: aggregate offline metrics can hide per-segment regressions. Always slice your metrics before trusting an overall number.',
    },
    {
      front: 'Confounding variable',
      back: 'A variable that influences both the supposed cause and the outcome, creating a spurious association between them.\n\nUnder the hood: it opens a "back-door path" between X and Y, so conditioning on it (stratify, match, or include as a covariate) closes the path.\n\nExample: ice cream sales and drownings — temperature drives both.\n\nGotcha: do NOT blindly control for everything. Conditioning on a COLLIDER (a common effect of X and Y) creates bias where none existed. More covariates is not automatically safer.',
    },
    {
      front: 'Correlation vs causation — what actually establishes causality?',
      back: 'Correlation is a symmetric measure of linear co-movement. Causation is directional and about intervention: what happens to Y if I SET X.\n\nEstablishing it needs: a randomised experiment (breaks the link between X and all confounders), or a quasi-experimental design — instrumental variables, difference-in-differences, regression discontinuity, or a defensible causal graph.\n\nGotcha: correlation of 0 rules out only LINEAR association. y = x² over a symmetric range has correlation ≈ 0 while being perfectly determined.',
    },
    {
      front: 'Pearson vs Spearman correlation',
      back: 'Pearson measures LINEAR association on the raw values. Spearman is Pearson applied to the RANKS, so it captures any monotonic relationship.\n\nUse Spearman when: the relationship is monotonic but curved, there are outliers, or the data is ordinal.\n\nUnder the hood: ranking discards magnitude, which is exactly what buys robustness to outliers.\n\nGotcha: both are single numbers that can hide wildly different structure — Anscombe\'s quartet gives four datasets with identical correlation and completely different shapes. Always plot.',
    },
    {
      front: 'Multicollinearity and VIF',
      back: 'Predictors that are highly correlated with each other. The model still predicts fine, but individual coefficients become unstable and uninterpretable.\n\nUnder the hood: XᵀX becomes near-singular, so its inverse blows up — tiny data changes swing coefficients wildly, sometimes flipping their sign.\n\nDetect: Variance Inflation Factor. VIF > 5-10 is a warning sign.\n\nKey distinction: it hurts INFERENCE, not prediction. If you only care about accuracy you can often ignore it. Ridge regression fixes it directly by making the matrix invertible again.',
    },
    {
      front: 'Heteroscedasticity',
      back: 'The variance of the residuals changes across the range of the predictors — a fan/cone shape in a residual plot.\n\nUnder the hood: OLS coefficients stay unbiased, but the standard errors are wrong, so your p-values and confidence intervals are misleading.\n\nFixes: robust (sandwich) standard errors, weighted least squares, or a variance-stabilising transform such as log.\n\nExample: predicting spend from income — variability of spend is far larger among high earners.',
    },
    {
      front: 'R² — and why adjusted R² exists',
      back: 'Fraction of variance in y explained by the model: 1 − SS_res/SS_tot.\n\nPitfall: R² NEVER decreases when you add a predictor, even pure noise. So it cannot be used for model selection. Adjusted R² penalises parameter count to compensate.\n\nGotcha: R² can be negative on a test set — it means you are doing worse than predicting the mean.\n\nBigger point: a high R² does not imply a correct or causal model, and a low R² is expected and fine in genuinely noisy domains.',
    },
    {
      front: 'Missing data: MCAR, MAR, MNAR',
      back: 'MCAR — missingness is unrelated to anything; dropping rows is unbiased, just wasteful. MAR — missingness depends on OBSERVED variables; imputation conditioned on those works. MNAR — missingness depends on the UNOBSERVED value itself; no imputation fully fixes it.\n\nExample of MNAR: high earners declining to state income. The missingness is informative.\n\nPractical tip: add a binary "was_missing" indicator column. If missingness carries signal, the model can use it — and it often does.',
    },
    {
      front: 'Class imbalance — why accuracy lies',
      back: 'When one class dominates, a model predicting only the majority achieves high accuracy while being useless.\n\nExample: 99.9% of transactions are legitimate. "Always predict legitimate" = 99.9% accurate and catches zero fraud.\n\nUse instead: precision, recall, F1, and PR-AUC.\n\nHandling: class weights, threshold tuning, resampling (SMOTE), or a different loss (focal loss).\n\nGotcha: resampling distorts predicted probabilities. If you need calibrated probabilities, prefer class weights or recalibrate afterwards.',
    },
    {
      front: 'ROC-AUC vs PR-AUC — when does the choice matter?',
      back: 'ROC-AUC plots TPR against FPR; it is the probability a random positive is ranked above a random negative. PR-AUC plots precision against recall.\n\nKey difference: ROC-AUC uses FPR, whose denominator is the large negative class, so a flood of false positives barely moves it. PR-AUC uses precision, whose denominator is your positive predictions.\n\nSo: on heavily imbalanced problems ROC-AUC looks deceptively good — 0.95 while precision at your operating point is 5%. Prefer PR-AUC when positives are rare and you care about them.',
    },
    {
      front: 'Calibration and the Brier score',
      back: 'A model is calibrated when, among predictions of 0.7, about 70% are actually positive. Ranking quality (AUC) and calibration are INDEPENDENT — a model can rank perfectly and be badly calibrated.\n\nMeasure: reliability diagram, expected calibration error, or Brier score (mean squared error on probabilities).\n\nFix: Platt scaling (fit a logistic on held-out scores) or isotonic regression (non-parametric, needs more data).\n\nWhy it matters: any downstream expected-value decision — bidding, risk, thresholding on cost — needs true probabilities, not just good ordering.',
    },
    {
      front: 'Entropy and cross-entropy',
      back: 'Entropy H(p) = −Σ p log p: the average information content, i.e. the optimal average code length for samples from p. Maximal for a uniform distribution, zero when one outcome is certain.\n\nCross-entropy H(p,q) = −Σ p log q: the cost of coding samples from p using a code optimised for q.\n\nUnder the hood: H(p,q) = H(p) + KL(p‖q). Since H(p) is fixed by the data, MINIMISING CROSS-ENTROPY LOSS IS EXACTLY MINIMISING KL DIVERGENCE from your model to the true labels.',
    },
    {
      front: 'KL divergence — and why it is not a distance',
      back: 'KL(P‖Q) = Σ P(x) log(P(x)/Q(x)): the expected extra bits from using Q to model data that truly comes from P.\n\nNot a metric: it is ASYMMETRIC (KL(P‖Q) ≠ KL(Q‖P)) and violates the triangle inequality.\n\nThe asymmetry has real consequences: minimising KL(P‖Q) is mode-COVERING (Q must put mass everywhere P does), while KL(Q‖P) is mode-SEEKING (Q collapses onto one mode). This drives behaviour in variational inference and generative models.\n\nGotcha: infinite when Q=0 where P>0. Use Jensen-Shannon for a symmetric, bounded alternative.',
    },
    {
      front: 'Covariate shift, label shift, and concept drift',
      back: 'Covariate shift: P(X) changes, P(Y|X) stays. Label shift: P(Y) changes, P(X|Y) stays. Concept drift: P(Y|X) itself changes — the relationship you learned is now wrong.\n\nWhy the distinction matters: covariate shift can often be corrected by importance weighting on the inputs. Concept drift cannot — it requires new labels and retraining.\n\nExample: a spam filter facing new vocabulary (covariate shift) versus spammers actively adapting to evade it (concept drift).\n\nDetect: PSI or KS test on features; monitor performance once labels arrive.',
    },
    {
      front: 'Survivorship bias',
      back: 'Analysing only the entities that "survived" some selection process, while the ones that dropped out are invisible in your data.\n\nCanonical example: WWII bombers returning with bullet holes in the wings. Reinforcing the wings is wrong — planes hit in the ENGINES never came back. Armour the untouched areas.\n\nML relevance: training a churn model only on active users; evaluating a trading strategy on companies still listed today; learning from products that were never taken off the shelf.\n\nAsk always: what data was destroyed or never recorded before it reached me?',
    },
    {
      front: 'Regression to the mean',
      back: 'Extreme observations tend to be followed by less extreme ones, purely because extremes partly reflect luck that does not repeat.\n\nUnder the hood: any measurement = signal + noise. Selecting on an extreme value selects partly for extreme noise, which by definition does not persist.\n\nTrap: it manufactures fake causal stories. "We coached the worst performers and they improved" — they would have improved anyway.\n\nML relevance: this is why targeting an intervention at the worst-performing segment makes almost any intervention look effective without a control group.',
    },
    {
      front: 'A/B test sample size — what drives it?',
      back: 'n per arm ≈ 16σ²/Δ², where Δ is the minimum effect you want to detect (for 80% power, α=0.05).\n\nThe critical property: n scales with 1/Δ². Halving the detectable effect QUADRUPLES the required sample. This is why detecting small lifts is so expensive.\n\nDecide before running: baseline rate, minimum detectable effect, α, and power.\n\nPitfall: computing sample size after peeking at results, or powering for a lift far larger than anything plausible so the test is guaranteed to be inconclusive.',
    },
    {
      front: 'CUPED (variance reduction in experiments)',
      back: 'Use pre-experiment data as a covariate to strip out predictable variance: Y_adj = Y − θ(X_pre − E[X_pre]), with θ chosen as Cov(Y,X)/Var(X).\n\nUnder the hood: X_pre cannot have been affected by the treatment, so subtracting its variation removes noise WITHOUT biasing the treatment effect.\n\nPayoff: variance reduction of 30-50% is common, which is equivalent to a much larger sample for free — and since n scales as 1/Δ², that meaningfully shrinks the detectable effect.\n\nRequires: a pre-period metric correlated with the outcome.',
    },
    {
      front: 'Novelty and primacy effects in experiments',
      back: 'Novelty: users engage with anything new simply because it is new, so early results overstate the true effect. Primacy: users trained on the old design temporarily do WORSE with a better new one.\n\nUnder the hood: both are transient behavioural responses to CHANGE, not to the change\'s quality. They decay over time.\n\nDetect: plot the treatment effect by day. A curve trending toward zero signals novelty.\n\nFix: run long enough for the effect to stabilise, and analyse new users separately since they have no prior expectation to unlearn.',
    },
    {
      front: 'Robust statistics — median, MAD, and trimming',
      back: 'The mean and standard deviation have a breakdown point of 0: ONE extreme value can move them arbitrarily. The median has a breakdown point of 50%.\n\nRobust alternatives: median for location, MAD (median absolute deviation) or IQR for spread, Huber loss for regression (quadratic near zero, linear in the tails).\n\nWhen it matters: heavy-tailed data — revenue, latency, session length are all right-skewed.\n\nGotcha: mean latency is nearly meaningless; SLAs are written on p95/p99 precisely because the tail is what users feel.',
    },
    {
      front: 'Why log-transform a skewed variable?',
      back: 'It compresses the right tail, turning multiplicative relationships into additive ones and often stabilising variance.\n\nUnder the hood: log turns y = a·x^b into log y = log a + b·log x, so a power law becomes linear and coefficients read as elasticities (a 1% change in x → b% change in y).\n\nUse for: income, prices, counts, page views, durations.\n\nGotchas: undefined at 0 (use log1p), and E[log Y] ≠ log E[Y] by Jensen\'s inequality — so back-transforming a mean prediction underestimates the true mean.',
    },
  ],
}
