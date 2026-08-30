const a=[{front:"Sampling bias — what is it, and why does more data not fix it?",back:`The way you collected the sample makes some population members systematically more likely to appear, so the sample distribution ≠ the population distribution.

Why more data does not help:
- Bias shifts the quantity you are estimating, not just the noise around it.
- More data narrows the confidence interval around the WRONG value — you become precisely wrong.

Pitfall:
- "We have 100M rows so it must be representative." Volume never fixes bias.

Example:
- A credit model trained only on approved applicants. You never observe how rejected applicants would have repaid, so the model cannot learn about them.`},{front:"Central Limit Theorem — what exactly converges to normal?",back:`Take many samples, compute the mean of each. The distribution of THOSE means (properly scaled) approaches a normal distribution as sample size n grows — whatever shape the population has, as long as its variance is finite.

Key point:
- It is about the sampling distribution of a statistic, not about your raw data.

Pitfall:
- Using it to claim your features are normally distributed. It says nothing about individual observations.

Gotcha:
- Fails for infinite-variance / heavy-tailed distributions (Cauchy).
- Converges slowly for very skewed data — "n ≥ 30" is a rule of thumb, not a law.`},{front:"p-value — precise definition, and the three things it is NOT",back:`The probability of seeing data at least as extreme as yours, IF the null hypothesis were true: P(data this extreme | null true).

It is NOT:
- The probability the null is true.
- The probability the result was due to chance.
- A measure of effect size or importance.

Mechanism:
- It is a tail probability under an assumed null model, so it depends on your sampling plan, not only on the data you collected.

Pitfall:
- With huge n, trivially small effects clear p < 0.05. Always report an effect size and a confidence interval next to it.`},{front:"Type I vs Type II error, and statistical power",back:`Two ways a test can be wrong:
- Type I (rate α): reject a true null — a false positive.
- Type II (rate β): fail to reject a false null — a false negative.
- Power = 1 − β: the chance of detecting a real effect.

Mechanism:
- For fixed n, lowering α raises β — you cannot shrink both at once.
- Power rises with larger true effect, larger n, and lower variance.

Pitfall:
- Running an underpowered test and reading "not significant" as "no effect". Absence of evidence is not evidence of absence.

Example:
- An A/B test with n = 200 simply cannot detect a 0.5% lift.`},{front:"Multiple comparisons problem — and how to correct for it",back:`Run many tests at α = 0.05 each and the chance of at least one false positive balloons: 1 − 0.95^k. With 20 tests it is about 64%.

Why:
- α controls the error rate PER TEST, not across a whole family of tests.

Corrections:
- Bonferroni (use α/k): controls the family-wide error rate, but very conservative.
- Benjamini-Hochberg: controls the False Discovery Rate (expected share of your "hits" that are false), far more power — usually the better choice in ML.

Example:
- Slicing an A/B test across 20 segments until one "wins".`},{front:"Peeking / optional stopping in A/B tests",back:`Repeatedly checking a running experiment and stopping the moment p < 0.05. This pushes the real false-positive rate far above 5% — often to 20-30%.

Mechanism:
- The p-value assumes a sample size FIXED in advance. Continuous checking gives the random walk many chances to cross the threshold.

Fix:
- Fix n in advance via a power analysis, or
- Use methods built for it: sequential testing, always-valid p-values, or Bayesian bandits.

Gotcha:
- This is probably the single most common way real experiments produce false wins.`},{front:'Confidence interval — what does "95%" actually refer to?',back:`It refers to the PROCEDURE, not to your one interval: a method that, across repeated samples, produces intervals containing the true parameter 95% of the time.

Mechanism:
- The randomness is in the interval, not the parameter. Your specific computed interval either contains the true value or it does not.

Pitfall:
- "There is a 95% probability the true value is in [a, b]." That describes a Bayesian credible interval — a different object.

Why it beats a bare p-value:
- A CI shows magnitude and precision, not just "significant or not".`},{front:"Maximum Likelihood Estimation (MLE)",back:`Pick the parameters θ that make your observed data most probable: argmax_θ  P(data | θ).

Why it matters:
- Most standard losses ARE MLE in disguise. Squared error = MLE under Gaussian noise. Cross-entropy = MLE for a Bernoulli / categorical model. This is WHY those losses are used.

Properties:
- Consistent and asymptotically efficient (hits the precision floor as n grows).
- Biased in small samples — the MLE of variance divides by n, not n − 1.

Pitfall:
- MLE has no preference for simpler parameters, so it overfits happily. Regularisation adds that preference.`},{front:"Bayes' theorem — and the base rate fallacy",back:`How to update a belief with evidence: P(A|B) = P(B|A)·P(A) / P(B), i.e. posterior ∝ likelihood × prior.

Base rate fallacy:
- Ignoring P(A), the prior / prevalence.

Example:
- A disease affects 1 in 10,000. A test is 99% accurate. You test positive.
- Per 10,000 people: ~1 true case, but ~100 false positives among the healthy.
- P(actually sick | positive) ≈ 1%, not 99%.

Why it matters in ML:
- This is exactly why a 99%-accurate classifier on a rare event can still be useless in production.`},{front:"MLE vs MAP — and why regularization is a prior",back:`Two ways to fit parameters:
- MLE maximises P(data | θ).
- MAP maximises P(θ | data) ∝ P(data | θ)·P(θ), adding a prior belief about the parameters.

The key insight:
- L2 regularization = MAP with a Gaussian prior centred at 0.
- L1 regularization = MAP with a Laplace prior.
- The regularization strength λ is the inverse of the prior variance.
- So "shrink weights toward zero" and "believe weights are small a priori" are the same statement.

Gotcha:
- As n grows the likelihood dominates and the prior washes out.`},{front:"Bootstrap — how it works and when it breaks",back:`Estimate the uncertainty of a statistic by resampling your own data.

How:
- Draw samples of the same size WITH replacement, many times.
- Recompute the statistic on each resample.
- The spread of those values approximates its sampling distribution.

Mechanism:
- Treats the observed data as a stand-in for the population — no formula needed, which is why it works for medians, ratios, AUC and other awkward statistics.

Breaks down for:
- Extremes (max / min), very small n, and dependent data (time series, grouped data) unless you use a block / cluster bootstrap.

Use it when:
- You need a confidence interval for a metric with no clean analytic standard error.`},{front:"Permutation test",back:`Test whether a grouping matters by shuffling the group labels.

How:
- Shuffle labels many times; each shuffle is a world where "the label does not matter".
- Recompute the test statistic each time to build its null distribution.
- See where the real, unshuffled statistic falls in that distribution.

Strengths:
- Almost no distributional assumptions; exact; works for any statistic you can compute.

Costs:
- Compute-heavy.
- Assumes exchangeability, so it is invalid when observations are dependent or the groups have very different variances.`},{front:"Bias-variance decomposition",back:`Expected squared prediction error splits into three parts:
- bias²: error from wrong assumptions (model too simple).
- variance: sensitivity to the particular training sample.
- irreducible noise: the floor you cannot beat.

Gotcha:
- This clean split is for SQUARED loss. It does not decompose so neatly for 0-1 (classification) loss.

Modern wrinkle:
- Deep nets and boosted ensembles show "double descent" — pushing far past the point of interpolating the training set can REDUCE test error again, which the classic U-shaped curve does not predict.`},{front:"Simpson's paradox",back:`A trend that holds in every subgroup can reverse when you pool the groups together.

Mechanism:
- A confounder is spread unevenly across groups, so pooling mixes populations with different base rates.

Example:
- A treatment looks better in both mild and severe cases separately, yet worse overall — because it was given mostly to severe cases.

ML relevance:
- An aggregate offline metric can hide a per-segment regression. Slice metrics by segment before trusting an overall number.`},{front:"Confounding variable",back:`A variable that influences BOTH the supposed cause and the outcome, creating an association between them that is not causal.

Mechanism:
- It opens a "back-door path" between X and Y. Conditioning on it (stratify, match, or add as a covariate) closes that path.

Example:
- Ice cream sales and drownings both rise together — temperature drives both.

Gotcha:
- Do NOT blindly control for everything. Conditioning on a COLLIDER (a common effect of X and Y) creates bias where none existed. More covariates is not automatically safer.`},{front:"Correlation vs causation — what actually establishes causality?",back:`Correlation is a symmetric measure of linear co-movement. Causation is directional and about intervention: what happens to Y if I SET X.

What establishes causation:
- A randomised experiment (breaks the link between X and all confounders), or
- A quasi-experimental design: instrumental variables, difference-in-differences, regression discontinuity, or a defensible causal graph.

Gotcha:
- A correlation of 0 rules out only LINEAR association. y = x² over a symmetric range has correlation ≈ 0 while y is perfectly determined by x.`},{front:"Pearson vs Spearman correlation",back:`Two correlation coefficients:
- Pearson: linear association on the raw values.
- Spearman: Pearson applied to the RANKS, so it captures any monotonic relationship, curved or not.

Use Spearman when:
- The relationship is monotonic but curved, there are outliers, or the data is ordinal.

Mechanism:
- Ranking throws away magnitude, which is exactly what buys robustness to outliers.

Gotcha:
- Both are single numbers that hide structure. Anscombe's quartet: four datasets, identical correlation, completely different shapes. Always plot.`},{front:"Multicollinearity and VIF",back:`Predictor variables that are strongly correlated WITH EACH OTHER. The model still predicts fine, but individual coefficients become unstable and hard to interpret.

Mechanism:
- XᵀX becomes near-singular, so inverting it blows up. Tiny data changes swing coefficients wildly, sometimes flipping their sign.

Detect:
- Variance Inflation Factor. VIF > 5-10 is a warning sign.

Key distinction:
- It hurts INFERENCE (coefficient meaning), not prediction accuracy. If you only care about accuracy you can often ignore it.
- Ridge regression fixes it directly by making the matrix invertible again.`},{front:"Heteroscedasticity",back:`The spread of the residuals changes across the range of the predictors — a fan or cone shape in a residual plot, instead of an even band.

Consequence:
- OLS coefficients stay unbiased, but the standard errors are wrong — so p-values and confidence intervals mislead.

Fixes:
- Robust (sandwich) standard errors.
- Weighted least squares.
- A variance-stabilising transform such as log.

Example:
- Predicting spend from income — spend varies far more among high earners than low earners.`},{front:"R² — and why adjusted R² exists",back:`The fraction of variance in y that the model explains: 1 − SS_residual / SS_total.

Pitfall:
- R² NEVER decreases when you add a predictor, even pure noise. So it cannot be used to choose between models. Adjusted R² penalises parameter count to fix this.

Gotcha:
- R² can be NEGATIVE on a test set — it means the model does worse than just predicting the mean.

Bigger point:
- A high R² does not imply a correct or causal model, and a low R² is normal and fine in genuinely noisy domains.`},{front:"Missing data: MCAR, MAR, MNAR",back:`Three reasons a value can be missing, in increasing order of trouble:
- MCAR — missingness unrelated to anything. Dropping rows is unbiased, just wasteful.
- MAR — missingness depends on OBSERVED variables. Imputation conditioned on those works.
- MNAR — missingness depends on the UNOBSERVED value itself. No imputation fully fixes it.

Example of MNAR:
- High earners declining to state their income. The fact that it is missing is informative.

In practice:
- Add a binary "was_missing" indicator column. If missingness carries signal, the model can use it — and it often does.`},{front:"Class imbalance — why accuracy lies",back:`When one class massively outnumbers the other, a model that always predicts the majority scores high accuracy while being useless.

Example:
- 99.9% of transactions are legitimate. "Always predict legitimate" = 99.9% accurate and catches zero fraud.

Use instead:
- Precision, recall, F1, and PR-AUC.

Handling:
- Class weights, threshold tuning, resampling (SMOTE), or a different loss (focal loss).

Gotcha:
- Resampling distorts predicted probabilities. If you need calibrated probabilities, prefer class weights or recalibrate afterwards.`},{front:"ROC-AUC vs PR-AUC — when does the choice matter?",back:`Two summary curves for a scoring classifier:
- ROC-AUC: plots true-positive rate vs false-positive rate. Equals the probability a random positive is ranked above a random negative.
- PR-AUC: plots precision vs recall.

Key difference:
- ROC-AUC's false-positive rate has the huge negative class in its denominator, so a flood of false positives barely moves it.
- PR-AUC's precision has your positive predictions in its denominator, so it reacts.

So:
- On heavily imbalanced problems ROC-AUC looks deceptively good — 0.95 while precision at your operating point is 5%. Prefer PR-AUC when positives are rare and you care about them.`},{front:"Calibration and the Brier score",back:`A model is calibrated when, among all its 0.7 predictions, about 70% actually turn out positive.

Key point:
- Ranking quality (AUC) and calibration are INDEPENDENT. A model can rank perfectly and still be badly calibrated.

Measure:
- Reliability diagram, expected calibration error, or Brier score (mean squared error on the predicted probabilities).

Fix:
- Platt scaling (fit a logistic on held-out scores), or isotonic regression (non-parametric, needs more data).

Why it matters:
- Any downstream expected-value decision — bidding, risk, cost-based thresholds — needs true probabilities, not just correct ordering.`},{front:"Entropy and cross-entropy",back:`Entropy H(p) = −Σ p log p: the average information content of a distribution, i.e. the best achievable average code length for its samples. Maximal for a uniform distribution, zero when one outcome is certain.

Cross-entropy H(p, q) = −Σ p log q: the cost of coding samples that truly come from p using a code optimised for q.

The identity that matters:
- H(p, q) = H(p) + KL(p‖q).
- H(p) is fixed by the data, so MINIMISING CROSS-ENTROPY LOSS IS EXACTLY MINIMISING KL DIVERGENCE from your model to the true labels.`},{front:"KL divergence — and why it is not a distance",back:`KL(P‖Q) = Σ P(x) log(P(x)/Q(x)): the expected number of extra bits you pay by using Q to model data that really comes from P.

Not a metric:
- Asymmetric: KL(P‖Q) ≠ KL(Q‖P).
- Violates the triangle inequality.

The asymmetry has real consequences:
- Minimising KL(P‖Q) is mode-COVERING: Q must put mass everywhere P does.
- Minimising KL(Q‖P) is mode-SEEKING: Q collapses onto one mode of P.
- This drives the behaviour of variational inference and generative models.

Gotcha:
- Infinite when Q = 0 somewhere P > 0. Jensen-Shannon divergence is a symmetric, bounded alternative.`},{front:"Covariate shift, label shift, and concept drift",back:`Three ways the data distribution can change between training and production:
- Covariate shift: P(X) changes, P(Y|X) stays. The inputs move.
- Label shift: P(Y) changes, P(X|Y) stays. The class mix moves.
- Concept drift: P(Y|X) itself changes. The rule you learned is now wrong.

Why the distinction matters:
- Covariate shift can often be corrected by importance-weighting the inputs.
- Concept drift cannot — it needs new labels and retraining.

Example:
- A spam filter meeting new vocabulary (covariate shift) vs spammers actively rewording to evade it (concept drift).

Detect:
- PSI or KS test on features; monitor performance once labels arrive.`},{front:"Survivorship bias",back:`Analysing only the entities that made it through some selection process, while the ones that dropped out are invisible in your data.

Canonical example:
- WWII bombers came back with bullet holes in the wings. Reinforcing the wings is wrong — planes hit in the ENGINES never came back. Armour the untouched areas.

ML examples:
- Training a churn model only on still-active users.
- Backtesting a strategy on companies still listed today.
- Learning from products that were never pulled from the shelf.

Always ask:
- What data was destroyed or never recorded before it reached me?`},{front:"Regression to the mean",back:`Extreme measurements tend to be followed by less extreme ones, purely because an extreme value partly reflects luck that does not repeat.

Mechanism:
- Any measurement = signal + noise. Selecting on an extreme value selects partly for extreme noise, which by definition does not persist.

Trap:
- It manufactures fake causal stories. "We coached the worst performers and they improved" — they would have improved anyway.

ML relevance:
- This is why targeting an intervention at the worst-performing segment makes almost any intervention look effective without a control group.`},{front:"A/B test sample size — what drives it?",back:`Roughly, n per arm ≈ 16σ² / Δ², where Δ is the smallest effect you want to be able to detect (for 80% power, α = 0.05).

The critical property:
- n scales with 1 / Δ². Halving the detectable effect QUADRUPLES the sample you need. Small lifts are expensive to detect.

Decide before running:
- Baseline rate, minimum detectable effect, α, and power.

Pitfall:
- Computing sample size after peeking at results.
- Powering for a lift far larger than anything plausible, so the test is guaranteed inconclusive.`},{front:"CUPED (variance reduction in experiments)",back:`A technique to make an A/B test more sensitive by subtracting out variance you could have predicted from before the experiment started.

How:
- Y_adjusted = Y − θ(X_pre − mean(X_pre)), with θ = Cov(Y, X_pre) / Var(X_pre).
- X_pre is a pre-experiment metric (e.g. each user's prior activity).

Why it is unbiased:
- X_pre cannot have been affected by a treatment that had not happened yet, so removing its variation removes noise without touching the treatment effect.

Payoff:
- 30-50% variance reduction is common — equivalent to a much bigger sample for free. Since n scales as 1/Δ², that meaningfully shrinks the detectable effect.

Requires:
- A pre-period metric correlated with the outcome.`},{front:"Novelty and primacy effects in experiments",back:`Two transient reactions to CHANGE that distort early experiment results:
- Novelty: users engage with anything new just because it is new, so early results overstate the true effect.
- Primacy: users trained on the old design temporarily do WORSE with a better new one.

Mechanism:
- Both are responses to the change itself, not its quality. They decay over time.

Detect:
- Plot the treatment effect by day. A curve trending toward zero signals novelty.

Fix:
- Run long enough for the effect to stabilise.
- Analyse brand-new users separately — they have no prior expectation to unlearn.`},{front:"Robust statistics — median, MAD, and trimming",back:`The mean and standard deviation have a breakdown point of 0: a SINGLE extreme value can move them arbitrarily far. The median has a breakdown point of 50%.

Robust alternatives:
- Median for location.
- MAD (median absolute deviation) or IQR for spread.
- Huber loss for regression: quadratic near zero, linear in the tails.

When it matters:
- Heavy-tailed data — revenue, latency, session length are all right-skewed.

Gotcha:
- Mean latency is nearly meaningless. SLAs are written on p95 / p99 precisely because the tail is what users feel.`},{front:"Why log-transform a skewed variable?",back:`Taking log(x) compresses a long right tail, turns multiplicative relationships into additive ones, and often stabilises variance.

Mechanism:
- log turns y = a·x^b into log y = log a + b·log x. A power law becomes linear, and coefficients read as elasticities (a 1% change in x → about b% change in y).

Use for:
- Income, prices, counts, page views, durations.

Gotchas:
- Undefined at 0 — use log1p (log of 1 + x).
- E[log Y] ≠ log E[Y] (Jensen's inequality), so back-transforming a mean prediction UNDERESTIMATES the true mean.`}],i=[{front:"Probability vs likelihood — what is the difference?",back:`Both come from the same function P(data | θ), read in opposite directions.

- Probability: θ is FIXED, the data varies. "Given a fair coin, how likely is 8 heads in 10 tosses?"
- Likelihood: the DATA is fixed, θ varies. "Given I saw 8 heads, how well does p = 0.5 explain it?"

Mechanism:
- Likelihood is a function of the parameter, and it does NOT integrate to 1 over θ. So it is not a probability distribution over parameters — turning it into one is exactly what a prior plus Bayes' rule are for.

Gotcha:
- "The likelihood that the model is right" is a category error unless you are being explicitly Bayesian.`},{front:"Linearity of expectation — and what it does NOT require",back:`E[aX + bY] = aE[X] + bE[Y], ALWAYS. No independence required.

Why it matters:
- Problems that look like they need a joint distribution collapse into a sum. It is the most useful single trick in probability interviews.

Example:
- Expected number of fixed points in a random permutation of n items. Put an indicator on each position, each with E = 1/n. Sum = 1. The indicators are dependent, and it does not matter.

Gotcha:
- Linearity does NOT extend to products or variances. E[XY] = E[X]E[Y] needs independence, and Var(X + Y) needs the covariance term.`},{front:"Variance algebra — Var(aX+b) and Var(X+Y)",back:`Two identities you must know cold:
- Var(aX + b) = a²·Var(X). The shift b vanishes; the scale is SQUARED.
- Var(X + Y) = Var(X) + Var(Y) + 2·Cov(X, Y). The covariance term drops out only if X and Y are independent.

Mechanism:
- Variance is a squared quantity, so it is not linear. This is why standard deviations do not add, but variances of independent terms do.

Example:
- Standard error of a mean: Var(X̄) = Var(X)/n, so SE = σ/√n. The √n comes straight from the squared scaling.

Gotcha:
- Averaging CORRELATED observations does not cut variance by 1/n. Positive correlation makes your effective sample size smaller than n.`},{front:"Law of total expectation (and total variance)",back:`A way to compute an average by splitting on another variable:
- E[X] = E[E[X|Y]] — average the conditional means, weighted by how often each condition occurs.
- Var(X) = E[Var(X|Y)] + Var(E[X|Y]) — "within-group variance" plus "between-group variance".

Why it matters in ML:
- This IS the bias-variance style decomposition, and it is how you reason about grouped / hierarchical data.

Example:
- Overall conversion rate = weighted average of per-segment rates. Weight it wrong and you get Simpson's paradox.

Use it when:
- A quantity is easier to reason about conditionally than directly — condition, then average back.`},{front:"Independence vs conditional independence",back:`Two separate notions:
- Independent: P(A, B) = P(A)·P(B).
- Conditionally independent given C: P(A, B | C) = P(A|C)·P(B|C).

Key point:
- Neither implies the other. Variables can be dependent overall but independent once you condition, and vice versa.

Example:
- Two independent coin flips become DEPENDENT once you know their sum. Conditioning on a common effect creates dependence — that is collider bias.

ML relevance:
- Naive Bayes assumes conditional independence given the class, not marginal independence.
- Graphical models are basically bookkeeping for which conditional independencies hold.`},{front:"Law of Large Numbers vs Central Limit Theorem",back:`Two different guarantees about the sample mean:
- LLN: the sample mean CONVERGES to the true mean as n grows. Tells you WHERE you end up.
- CLT: the sample mean's distribution around that value becomes normal, with spread σ/√n. Tells you HOW FAR OFF you typically are.

So:
- LLN gives consistency; CLT gives the error bars. You need the CLT, not the LLN, to build a confidence interval.

Gotcha:
- LLN needs a finite mean; the CLT additionally needs finite variance. For a Cauchy distribution the sample mean never settles — more data does not help.`},{front:"Jensen's inequality",back:`For a CONVEX function f: E[f(X)] ≥ f(E[X]). Reversed for a concave f. Equality only if f is linear or X is constant.

Plain meaning:
- The average of a transformed variable ≠ the transform of the average. This quietly breaks a lot of intuition.

Example:
- E[log Y] < log E[Y]. So back-transforming a mean prediction from log space UNDERESTIMATES the mean on the original scale.

ML relevance:
- It is why the ELBO in variational inference is a lower bound, and why log-loss and geometric means behave as they do.`},{front:"Chebyshev's inequality",back:`A distribution-free bound on how often a variable is far from its mean:
- P(|X − μ| ≥ kσ) ≤ 1/k².
- So at least 75% of ANY distribution lies within 2σ, at least 89% within 3σ.

Why it is useful:
- It assumes nothing about the shape — no normality needed.

Why it is loose:
- That same generality. For a normal distribution 2σ actually captures 95%, not merely 75%. Chebyshev is a worst-case guarantee.

Use it when:
- You need a bound without assuming Gaussianity. It is also the standard tool for proving the Law of Large Numbers.`},{front:"Odds, log-odds, and the logit",back:`Three ways to express a probability p:
- Odds = p / (1 − p), ranging over (0, ∞).
- Log-odds (the logit) = log(p / (1 − p)), ranging over (−∞, ∞).

Why it matters:
- Logistic regression models the LOGIT as linear because a linear function can output any real number, while p must stay in [0, 1]. The logit is the bridge.

Interpretation:
- A coefficient β means a one-unit change in x multiplies the odds by e^β.

Gotcha:
- Odds ratios and risk ratios are different numbers and get confused constantly. They nearly coincide for rare events and diverge badly for common ones.`},{front:"Standard deviation vs standard error",back:`Two things that both look like "±something":
- SD describes the SPREAD OF THE DATA.
- SE describes the UNCERTAINTY OF AN ESTIMATE: SE = σ/√n.

Key difference:
- SD does not shrink as you collect more data — the population is as variable as it is.
- SE shrinks as √n, because your estimate of the mean gets sharper.

Gotcha:
- Plotting SE bars and calling them "variability" makes results look far more precise than they are. Show SD to describe a distribution; SE or a CI to describe an estimate.

Interview trap:
- Quadruple n: SD unchanged, SE halves.`},{front:"Bessel's correction — why divide by n−1?",back:`Sample variance divides by n − 1, not n, so that it is an UNBIASED estimate of the population variance.

Mechanism:
- You measure deviations from the SAMPLE mean, which is fitted to the data and sits closer to the points than the true mean does.
- That makes the sum of squared deviations systematically too small; dividing by n − 1 corrects it exactly.

Degrees-of-freedom view:
- Estimating the mean uses up one degree of freedom, leaving n − 1.

Gotcha:
- The MLE of variance uses n and IS biased. NumPy defaults to ddof = 0 (biased); pandas defaults to ddof = 1. They silently disagree.`},{front:"Degrees of freedom — what are you actually counting?",back:`The number of independent pieces of information left AFTER subtracting the parameters you estimated from the same data.

Rule of thumb:
- df = n − (number of parameters estimated).

Examples:
- Sample variance: n − 1 (the mean was estimated).
- Two-sample t-test: n₁ + n₂ − 2.
- Chi-squared test of independence on an r×c table: (r − 1)(c − 1), because the row and column totals are fixed.

Why it matters:
- df picks the reference distribution, so getting it wrong gives the wrong p-value.
- It also explains why heavily parameterised models need much more data before their estimates mean anything.`},{front:"Monte Carlo estimation",back:`Approximate an expectation you cannot compute in closed form by averaging over random samples: E[f(X)] ≈ (1/n)·Σ f(xᵢ).

The key property:
- The error shrinks as 1/√n REGARDLESS OF DIMENSION. Deterministic numerical integration degrades exponentially with dimension, which is why Monte Carlo dominates high-dimensional problems.

Cost:
- One extra decimal digit of accuracy needs 100× the samples. Robust, but never precise cheaply.

ML uses:
- Dropout at inference, the bootstrap, MCMC posteriors, policy-gradient estimates — any expectation with no closed form.`},{front:"Importance sampling",back:`Estimate an expectation under distribution p using samples drawn from a DIFFERENT distribution q, then correct with weights w = p(x) / q(x):  E_p[f] = E_q[f·w].

Why you need it:
- You often cannot sample from p, or the events you care about are rare under it.

Requirement:
- q must cover the support of p. Anywhere q(x) = 0 but p(x) > 0 is invisible, and the estimate is silently biased.

Gotcha:
- If q is a poor match, a few samples get enormous weights and the variance explodes — effective sample size collapses to a handful of points. Clipped or self-normalised weights are the standard defence.

ML relevance:
- Exactly the machinery behind off-policy evaluation and inverse-propensity scoring in recommenders.`}],s=[{front:"Bernoulli and Binomial — and when the Binomial breaks",back:`Two building-block distributions for yes/no data:
- Bernoulli: a single trial, P(success) = p. Mean p, variance p(1 − p).
- Binomial: the number of successes in n INDEPENDENT trials with CONSTANT p. Mean np, variance np(1 − p).

Mechanism:
- Variance is maximal at p = 0.5 and vanishes at 0 or 1. Extreme rates are inherently less variable, which is why a conversion test on a very rare event needs far more traffic than the raw rate suggests.

Gotcha:
- Both assumptions fail in practice. Repeat visits by the same user break independence; a p that drifts over the test window breaks constancy. Either makes the true variance larger than the formula, so your p-values come out too optimistic.`},{front:"Poisson distribution — when does it apply?",back:`Counts of events in a fixed window, when events are independent and arrive at a constant average rate λ. Mean = variance = λ.

The signature:
- Mean equals variance. If your count data has variance far above the mean it is OVERDISPERSED and Poisson is the wrong model — use negative binomial.

Examples:
- Requests per second, clicks per session, defects per batch.

Mechanism:
- It is the limit of a Binomial as n → ∞ and p → 0 with np = λ fixed — the "many chances, each unlikely" regime.

Gotcha:
- Real traffic is bursty and rate-varying, which produces overdispersion almost by default.`},{front:"Exponential distribution and memorylessness",back:`Models the WAITING TIME between events that arrive as a Poisson process. Mean 1/λ.

Memoryless:
- P(T > s + t | T > s) = P(T > t). Having already waited tells you nothing about how much longer you will wait. The exponential is the only continuous distribution with this property.

Example:
- If session length were exponential, a user 10 minutes in has the same expected remaining time as a brand-new one.

Gotcha:
- Real durations are usually NOT memoryless. Session length, tenure and time-to-failure typically show "the longer you have stayed, the longer you will stay" or wear-out. Use Weibull or log-normal when the risk of the event is not constant over time.`},{front:"The Normal distribution — why is it everywhere?",back:`Three independent reasons it shows up so often:
- CLT: sums / averages of many small independent effects converge to it.
- Maximum entropy: it is the least-assuming distribution once you fix a mean and variance.
- Convenience: closed under linear combinations and under conditioning.

Properties:
- Fully described by μ and σ.
- Uncorrelated jointly-normal variables are independent (true for the normal, NOT in general).

Gotcha:
- It has thin tails, so it badly underestimates extreme events in finance, latency and network traffic. Assuming normality where the tails are heavy is how risk models fail.`},{front:"Student's t distribution — why the heavier tails?",back:`The distribution of a sample mean when the standard deviation σ is UNKNOWN and estimated from the same small sample.

Mechanism:
- You are dividing by an estimated SD that is itself noisy. Sometimes you underestimate it, which inflates the ratio — so extreme values happen more often than under a normal. Hence the fatter tails.

Behaviour:
- As degrees of freedom → ∞ it converges to the normal (the SD estimate becomes reliable). By n ≈ 30 the difference is small.

Use it when:
- Small samples with unknown variance. Also used deliberately as a heavy-tailed likelihood for robust regression.`},{front:"Chi-squared distribution — where does it come from?",back:`The distribution of a SUM of k squared independent standard-normal variables. Mean k, variance 2k. Strictly positive, right-skewed.

Why it shows up:
- Whenever you sum squared deviations. It is the reference distribution for sample variance, for goodness-of-fit tests, and for likelihood-ratio tests (−2 log Λ is asymptotically chi-squared).

Mechanism:
- The degrees of freedom = number of independent squared terms after subtracting estimated parameters. This is why df bookkeeping matters so much in these tests.

Example:
- Comparing observed vs expected counts across categories.`},{front:"Beta distribution — the natural prior for a rate",back:`A distribution over the interval [0, 1], shaped by two parameters α and β. Mean α / (α + β).

Why it pairs with the Binomial:
- It is the CONJUGATE prior. Observing s successes and f failures updates Beta(α, β) → Beta(α + s, β + f). The update is literally addition — no integration.

Intuition:
- α − 1 and β − 1 act like "prior successes and failures". Beta(1, 1) is uniform — no information.

Use in ML:
- Bayesian A/B testing, Thompson sampling for bandits, and smoothing sparse rates — a new item with 1 click in 2 impressions gets pulled toward the prior instead of scored 50%.`},{front:"Log-normal distribution",back:`X is log-normal if log(X) is normally distributed. Strictly positive, right-skewed.

Why it appears so often:
- It arises from MULTIPLICATIVE processes, just as the normal arises from additive ones. Anything built by repeated proportional growth trends log-normal.

Examples:
- Income, house prices, session length, latency, file sizes, revenue per user.

Gotcha:
- Mean ≠ median; the mean is pulled well above the median by the tail. A "mean revenue per user" on log-normal data describes almost nobody.
- E[X] = exp(μ + σ²/2), NOT exp(μ) — which is why naive back-transformation understates the mean.`},{front:"Power laws and heavy tails",back:`A distribution where P(X > x) ∝ x^(−α). Scale-free: there is no typical value, and the tail dominates every total.

Consequences:
- For α ≤ 2 the variance is INFINITE; for α ≤ 1 even the mean is.
- Sample statistics never stabilise — collecting more data can make the sample mean JUMP rather than settle.

Examples:
- Item popularity, city sizes, word frequency, network degree, wealth.

ML relevance:
- Why recommender catalogues have a long tail, why "average" popularity is meaningless, and why CLT-based confidence intervals silently fail on such metrics. Work on logs, use medians, or model the tail explicitly.`},{front:"Skewness and kurtosis",back:`Two shape numbers beyond mean and variance:
- Skewness: asymmetry. Positive = long right tail (mean > median).
- Kurtosis: tail weight relative to a normal. Excess kurtosis > 0 means fatter tails and more outliers.

Why they matter operationally:
- Positive skew makes the mean a poor summary and inflates the variance of the sample mean, so tests lose power.
- High kurtosis means extreme values arrive more often than any normal-based interval expects.

Gotcha:
- Both are extremely sensitive to outliers — they are built from third and fourth powers, so one extreme point can dominate the estimate.

Fix:
- Log or Box-Cox transform, winsorise, or switch to rank-based methods.`},{front:"QQ plot — how do you read one?",back:`Plots your sample's quantiles against the quantiles a reference distribution would predict. A straight 45° line means the distribution matches.

Reading the deviations:
- S-shape: the tails are wrong. Ends bending UP above the line = heavier tails than assumed.
- A convex or concave bow: skew.
- One point far off the line: an outlier.

Why prefer it to a histogram:
- Histograms depend heavily on bin width and hide tail behaviour — which is exactly where model assumptions break.

Use it when:
- Checking residual normality, or deciding whether a transform actually worked (compare QQ plots before and after).`},{front:"Mixture distributions — and why they fool summary statistics",back:`A distribution formed by drawing from several component distributions, each with some probability.

Why it matters in practice:
- Almost all real data is a mixture over unobserved segments — device types, new vs returning users, bot vs human traffic.

Gotcha:
- A mixture can be bimodal, so the MEAN falls in the valley between the two humps and describes no actual member of the population. Reported alone it is actively misleading.

Signals:
- Bimodal histograms; variance far larger than any single component; a metric that moves without any component moving (the mix shifted).
- This is the mechanism behind Simpson's paradox and behind drift caused purely by traffic composition.`},{front:"Choosing a likelihood for your target variable",back:`Match the assumed output distribution to the data type — this is what "picking a loss" really means.

- Continuous, symmetric → Normal (squared error).
- Continuous, positive and skewed → log-normal or Gamma (often: model log y).
- Binary → Bernoulli (cross-entropy).
- Counts → Poisson, or negative binomial if overdispersed.
- Counts with an exposure → Poisson with an offset.
- Bounded proportions → Beta.
- Time-to-event with censoring → a survival model, not regression.

Gotcha:
- Squared error on skewed positive data chases the tail and predicts negative values.
- Poisson on overdispersed counts gives confident, wrong standard errors.`}],o=[{front:"Estimator properties: bias, consistency, efficiency",back:`An estimator is a recipe for guessing a parameter θ (a mean, a variance, a rate) from a finite sample. Three standard ways to judge one:

- Unbiased: E[θ̂] = θ. Right on average across many samples.
- Consistent: θ̂ → θ as sample size n → ∞. Right in the limit.
- Efficient: smallest variance among a stated class of estimators.

Gotcha:
- The three are independent. An estimator can be biased yet consistent — the MLE of variance divides by n, is biased for any finite n, and still converges.

Why ML cares:
- We often PREFER a biased estimator. Ridge regression is biased on purpose because the fall in variance more than pays for it. Unbiasedness is a nice-to-have, not the goal.`},{front:"MSE of an estimator = bias² + variance",back:`How wrong an estimate is on average, squared, splits into exactly two parts:

- E[(θ̂ − θ)²] = (E[θ̂] − θ)²  +  Var(θ̂)
- bias² = how far off the average guess is. variance = how much the guess jumps between samples.

Why it is the central idea in ML:
- It licenses trading bias for variance. A little bias that buys a large variance cut lowers total error.
- Regularisation, early stopping, and ensembling are all this same trade in different clothes.

Example:
- Pulling a noisy per-item conversion rate toward the global average is biased, but has far lower MSE for items with few observations.

Gotcha:
- This clean split is for SQUARED loss. Under other losses it does not decompose so neatly, which is why the "bias-variance" story is fuzzier for classification.`},{front:"Fisher information and the Cramér-Rao bound",back:`Fisher information I(θ) measures how much a sample actually tells you about a parameter θ.

Mechanism:
- It is the expected sharpness (curvature) of the log-likelihood peak. A sharp peak = one parameter value clearly fits best = lots of information.
- A flat log-likelihood means many values of θ explain the data equally well, so any estimate is inherently imprecise.

Cramér-Rao bound:
- Any unbiased estimator has Var(θ̂) ≥ 1/I(θ). There is a hard floor on precision, set by the data itself.

Why it matters:
- The MLE reaches this floor as n grows — that is what "asymptotically efficient" means.
- The inverse curvature at the fitted optimum is the standard way to get standard errors for model parameters.`},{front:"Method of moments",back:`A quick way to fit a distribution: set its theoretical moments (mean, variance, …) equal to the sample versions and solve for the parameters.

Example:
- To fit a Gamma, match the sample mean and sample variance to the Gamma's mean and variance formulas, then solve the two equations.

Strengths:
- Closed-form, no optimisation, and gives good starting values for MLE.

Limitations:
- Usually higher variance than MLE (less efficient).
- Can return estimates outside the valid parameter range.
- Ignores any information beyond the moments you matched.

Where it still shows up:
- Fitting a prior from historical data in empirical Bayes, and as an interview check of whether you understand what an estimator is.`},{front:"Sufficient statistic",back:`A summary T(X) of the data is sufficient for θ if, once you know T(X), the raw data holds no further information about θ.

Examples:
- Bernoulli trials: the COUNT of successes is sufficient — the order of the flips is irrelevant.
- Normal with known variance: the sample mean is sufficient.

Why it matters in practice:
- Sufficiency is what makes a summary lossless. It tells you the minimum you must store or stream to fit a model later — the basis of online/streaming estimation.

Connection:
- Exponential-family distributions are exactly the ones with simple fixed-size sufficient statistics, which is why they dominate GLMs.`},{front:"Delta method",back:`A formula for the uncertainty of a FUNCTION of an estimate, when you already know the uncertainty of the estimate.

- Var(g(θ̂))  ≈  g'(θ̂)²  ·  Var(θ̂)
- In words: run the estimate's variance through the local slope of g, squared.

Why experimentation needs it:
- Many key metrics are RATIOS — clicks per session, revenue per user — where numerator and denominator are both random and correlated. The naive standard error is wrong.
- For R = X/Y the delta method gives the variance including the covariance term, which is how you build a correct confidence interval for CTR when sessions-per-user varies.

Gotcha:
- It is a first-order (linear) approximation, so it degrades for strongly curved g or small samples. Bootstrap is the assumption-light alternative.`},{front:"Conjugate priors",back:`A prior is "conjugate" to a likelihood when the posterior comes out in the SAME distribution family as the prior — so Bayesian updating is just arithmetic, no integration.

The standard pairs:
- Beta prior + Binomial data → Beta posterior (rates)
- Gamma + Poisson → Gamma (counts)
- Normal + Normal (known variance) → Normal (means)
- Dirichlet + Multinomial → Dirichlet (category shares)

Why they matter:
- The update is closed-form, so you can revise beliefs per request. This is exactly what bandits need to run online.

Gotcha:
- Conjugacy is a convenience, not a fact about the world. If the conjugate family cannot express your real prior belief, you are letting maths pick your assumptions. Modern MCMC / variational tools often make the trade unnecessary.`},{front:"Beta-Binomial updating in practice",back:`The workhorse for estimating a rate (click-through, conversion, pass rate) with honest uncertainty.

The update:
- Start with a prior Beta(α, β).
- Observe s successes and f failures.
- Posterior = Beta(α + s, β + f). Posterior mean = (α + s) / (α + β + s + f).

Why it is so useful:
- It is principled smoothing. An item with 1 click in 2 impressions has a raw rate of 50%; under a Beta(1, 20) prior its posterior mean is about 9% — sensibly pulled toward the population rate.

Reading the prior:
- α + β is the prior's strength, in "pseudo-observations". Fit α and β from your historical rate distribution (empirical Bayes) rather than guessing.

Use it when:
- Ranking sparse items, cold-start scoring, and Thompson sampling for exploration.`},{front:"Credible interval vs confidence interval",back:`Two intervals that look identical but answer different questions.

- Credible interval (Bayesian): "given this data and prior, there is a 95% probability the parameter is in here." A statement about the PARAMETER.
- Confidence interval (frequentist): "this procedure captures the true parameter 95% of the time across repeated samples." A statement about the PROCEDURE, not this one interval.

Why people conflate them:
- The plain-English reading of a confidence interval is actually the definition of a credible interval.
- With a flat prior and plenty of data the two often coincide numerically, which hides the distinction.

When the difference bites:
- Small samples and strong priors, where the two can diverge a lot.`},{front:"Posterior predictive distribution",back:`The predicted distribution of a NEW data point, obtained by averaging the model over every plausible parameter value rather than plugging in one best-fit value.

Why it matters:
- It carries parameter uncertainty into the prediction. A point estimate gives one number; the posterior predictive gives an interval that widens honestly when data is scarce.

Example:
- Forecasting next month's conversions from 10 days of history should be far more uncertain than from 1000 days. Plugging in a single θ̂ hides that entirely.

ML relevance:
- This is what deep ensembles and MC-dropout approximate, and why they give better-calibrated uncertainty than a single network.`},{front:"Empirical Bayes and shrinkage",back:`Estimate the PRIOR from the data itself (pooling across all groups), then use it to pull each group's own estimate toward the overall mean.

Mechanism:
- The amount of pull is automatic: groups with little data get pulled hard toward the population, groups with lots of data barely move. A per-group bias-variance trade.

Example:
- Ranking sellers by rating when some have 3 reviews and others 3000. Raw averages put a 3-review 5.0 above a 3000-review 4.8, which is wrong. Shrinkage fixes it.

Also known as:
- James-Stein estimation, hierarchical / partial pooling.

The surprising result:
- Shrinkage beats raw averages in total squared error even though it biases every single group estimate.`},{front:"Bayesian A/B testing",back:`Instead of a p-value, model each arm's rate with a posterior distribution and report things like P(B > A) and the distribution of the lift.

Advantages:
- No fixed sample size required, so checking the results as they come in is legitimate (you are not repeatedly testing a null).
- Output is decision-shaped: "87% chance B is better; expected loss if we ship B is 0.2%".
- Handles small samples gracefully via the prior.

Gotcha:
- The prior is a real choice; a strong one can drive the conclusion on small data.
- "Probability B is better" is NOT a false-positive rate — it does not bound error the way α does.
- Stopping the moment P(B > A) looks good still inflates the chance of shipping a loser.`},{front:"Prior sensitivity and weakly informative priors",back:`A prior is defensible only if the data overwhelms it OR you can justify it on real-world grounds.

Weakly informative prior:
- Broad enough not to drive the conclusion, tight enough to rule out the absurd — e.g. a conversion-rate prior that excludes 90% but allows anything plausible.
- Preferred over "uninformative" flat priors, which are often not actually uninformative after a change of variables and can put most of their mass on nonsense.

What to do:
- Run a sensitivity analysis: refit under two or three reasonable priors. If the conclusion flips, say so — the data is not deciding the question.

Gotcha:
- With sparse or heavily imbalanced data, the prior IS the answer. Report that honestly.`}],r=[{front:"t-test — the three variants and when to use each",back:`A test for whether means differ, in three forms:
- One-sample: is this mean different from a fixed reference value?
- Two-sample (independent): do two separate groups differ?
- Paired: do matched observations differ (before/after, or the same user under both conditions)?

Why paired matters:
- Pairing removes between-subject variability from the comparison, so it has far more power for the same n. If your design has a natural pairing and you run an unpaired test, you throw away power.

Assumptions:
- Roughly normal sampling distribution of the mean (the CLT usually covers it), independent observations, and — for the classic version — equal variances.

Gotcha:
- Repeated measurements from the same user are not independent observations.`},{front:"z-test vs t-test",back:`Same idea, different assumption about the standard deviation:
- z-test: population σ is known, or n is large enough that the estimate σ̂ is effectively exact.
- t-test: σ is estimated from the sample.

In practice:
- You almost never know σ, so the t-test is the honest default. The two converge as n grows — beyond n ≈ 30 the difference in critical values is negligible.

Why it still matters:
- With small n, using z instead of t gives intervals that are too NARROW and p-values that are too small, because it ignores the uncertainty in your variance estimate.

Proportions:
- For large-sample proportion tests a z-test is standard, since the variance is set by p itself rather than estimated separately.`},{front:"Welch's t-test — and why it should be your default",back:`A two-sample t-test that does NOT assume the two groups have equal variance — it adjusts the degrees of freedom instead.

Why default to it:
- The equal-variance assumption is usually false, and the classic (Student) version is not robust to violating it — especially with unequal group sizes, where its error rate goes badly wrong.
- Welch costs almost nothing in power when the variances ARE equal.

Gotcha:
- Running Levene's test first and then choosing is itself a form of multiple testing that distorts the error rate. Just use Welch.

Relevance to A/B tests:
- A treatment often changes the variance as well as the mean, so unequal variances are the norm.`},{front:"Chi-squared test of independence",back:`Tests whether two categorical variables are associated, by comparing observed counts to the counts you would expect if they were independent: Σ (O − E)² / E, with df = (r − 1)(c − 1).

Use for:
- Conversion by variant, feature category vs outcome, any contingency table.

Assumptions:
- Independent observations, and adequate expected counts — the usual rule is all expected counts ≥ 5. Below that the approximation breaks; use Fisher's exact test.

Gotcha:
- It tells you THAT there is an association, not where or how strong. With large n, trivial associations become significant, so pair it with an effect size such as Cramér's V.`},{front:"Fisher's exact test",back:`Computes the EXACT probability of your observed 2×2 table (and any more extreme table) under independence, using the hypergeometric distribution instead of an approximation.

Use it when:
- Small samples or sparse cells, where chi-squared's "expected counts ≥ 5" rule fails.

Mechanism:
- It fixes the observed row and column totals and enumerates the possible tables. Exact, but combinatorially expensive for large tables.

Gotcha:
- It is somewhat CONSERVATIVE (true error rate below the nominal α), so it can be underpowered. For large samples, chi-squared is fine and much cheaper.`},{front:"ANOVA and the F-test",back:`Tests whether three or more group means differ, via the F ratio = between-group variance / within-group variance.

Why not many t-tests:
- Comparing k groups pairwise inflates the false-positive rate. ANOVA gives one omnibus test at the intended α.

Key limitation:
- A significant F says SOME groups differ, not which. You then need post-hoc pairwise comparisons with correction (Tukey HSD) — and that step is where people quietly reintroduce the multiple-comparisons problem.

Assumptions:
- Normality of residuals, independence, and equal variances across groups (use Welch's ANOVA otherwise).`},{front:"Mann-Whitney U / Wilcoxon rank-sum",back:`A non-parametric alternative to the two-sample t-test. It works on the RANKS of the pooled data, not the raw values, and tests whether one group tends to produce larger values.

Use it when:
- Heavy skew, outliers, ordinal data, or small samples where normality is doubtful.

Mechanism:
- Replacing values with ranks caps the influence of any single extreme point — that is where the robustness comes from, and also what it costs you (magnitude information is discarded).

Gotcha:
- It is NOT a test of medians in general — it tests stochastic dominance. With differently shaped distributions a significant result can occur with equal medians. The paired version is the Wilcoxon SIGNED-rank test.`},{front:"Kolmogorov-Smirnov test",back:`Compares two distributions (or one sample against a theoretical distribution) using the maximum vertical gap between their cumulative distribution curves.

Use in ML:
- The standard drift detector for a continuous feature — compare the live distribution against the training one.

Strength:
- Distribution-free, and sensitive to any difference in shape, not just a shift in location.

Gotchas:
- Most sensitive near the CENTRE of the distribution and comparatively blind in the tails — often where drift matters most.
- With large n it flags statistically significant but practically irrelevant differences. Monitor the KS STATISTIC as an effect size, not its p-value.
- Continuous data only.`},{front:"One-tailed vs two-tailed tests",back:`What question you are asking:
- Two-tailed: is there ANY difference?
- One-tailed: is it specifically in this pre-chosen direction?

The trade-off:
- A one-tailed test at α = 0.05 puts the whole rejection region on one side, so it has more power to detect an effect in that direction — but ZERO ability to detect the opposite.

Gotcha:
- Choosing one-tailed AFTER seeing which way your result went effectively doubles your false-positive rate. The direction must be committed in advance for a substantive reason.

Guidance:
- Use two-tailed almost always in experimentation. You genuinely do want to know if your change made things worse.`},{front:"Effect size and Cohen's d",back:`Effect size measures the MAGNITUDE of a difference, independently of sample size.
- Cohen's d = (mean₁ − mean₂) / pooled SD — the gap expressed in standard deviations.
- Rough scale: 0.2 small, 0.5 medium, 0.8 large.

Why it is essential:
- A p-value blends effect size with sample size. With n large enough, everything is significant. The effect size tells you whether anyone should care.

Other forms:
- Cramér's V for categorical association, r or R² for variance explained, odds ratio for binary outcomes, absolute lift for business decisions.

Interview answer:
- Always report an effect size and a confidence interval alongside any p-value.`},{front:"FWER vs FDR — which should you control?",back:`Two ways to keep multiple testing honest:
- Family-Wise Error Rate: P(at least one false positive anywhere). Controlled by Bonferroni. Very strict; power collapses as tests multiply.
- False Discovery Rate: the expected PROPORTION of your rejections that are false. Controlled by Benjamini-Hochberg.

Choosing:
- Control FWER when a single false positive is costly and you act on each finding individually — a confirmatory experiment, a regulatory claim.
- Control FDR when you are screening many candidates and will follow up in bulk — feature selection, scanning many segments.

Gotcha:
- Bonferroni on 500 tests makes almost nothing significant, so people quietly drop the correction. FDR is the honest middle ground.`},{front:"Equivalence and non-inferiority testing",back:`A standard test can never PROVE "no difference" — failing to reject the null is not evidence of equivalence.

Equivalence testing flips the logic:
- Define a margin δ of practical indifference.
- Test whether the whole confidence interval for the difference sits INSIDE (−δ, +δ).
- TOST (two one-sided tests) is the usual implementation.

Why ML teams need it:
- "The smaller, cheaper model is no worse than the big one" is an equivalence claim. So is "this refactor did not change behaviour."

Gotcha:
- The margin δ must be chosen on substantive grounds BEFORE the test. Choosing it after seeing the data makes the whole thing meaningless.`},{front:"Parametric vs non-parametric — the real trade-off",back:`Two families of test:
- Parametric: assume a distributional form and estimate its parameters.
- Non-parametric: assume much less, usually working through ranks or resampling.

The trade-off:
- If the parametric assumptions hold, those tests have MORE POWER for the same n.
- If they fail, the parametric error rates are simply wrong.

Guidance:
- Large n: the CLT makes mean-based parametric tests robust to non-normality — use them.
- Small n, heavy skew, or extreme outliers: prefer a rank-based test, a permutation test, or a bootstrap.

Gotcha:
- "Non-parametric" does not mean assumption-free — most still require independence and exchangeability.`},{front:"Statistical vs practical significance",back:`Two unrelated questions:
- Statistical significance: is the effect probably not zero?
- Practical significance: is it big enough to act on?

Four outcomes, two of them traps:
- Significant but trivially small: huge n detecting a 0.01% lift that costs more to ship than it earns.
- Non-significant but potentially large: an underpowered test with a wide interval that includes both a big win and a big loss. That is "we do not know", not "no effect".

What to report:
- The effect size with a confidence interval, compared against a pre-declared minimum meaningful effect. The decision follows from where the interval sits relative to that threshold.`}],l=[{front:'Gauss-Markov theorem — what makes OLS "BLUE"?',back:`Under four conditions — linearity, exogeneity (E[ε|X] = 0), constant error variance, and no autocorrelation — ordinary least squares is the Best Linear Unbiased Estimator: the lowest-variance option among all linear unbiased estimators.

Note what is NOT required:
- Normality of the errors. Normality is needed for exact t and F inference in small samples, not for OLS to be BLUE.

Why "linear unbiased" is a real limit:
- It says nothing about BIASED estimators. Ridge is biased and can have far lower MSE — Gauss-Markov does not contradict that, it just excludes it from the comparison.

Which assumption matters most:
- Exogeneity. Violate it and OLS is BIASED, not merely inefficient.`},{front:"Omitted variable bias",back:`Leaving out a variable that affects Y and is also correlated with an included predictor X biases the coefficient on X.

Direction:
- bias ≈ (effect of the omitted variable on Y) × (correlation of the omitted variable with X). You can often SIGN the bias without any data.

Example:
- Regressing salary on years of education, with ability omitted. Ability raises salary and correlates with education, so education's coefficient soaks up part of ability's effect and comes out overstated.

Why it matters in ML:
- It is why coefficients from an observational model are not causal effects, and why "the model says feature X drives Y" is an unsafe claim.`},{front:"Leverage, influence, and Cook's distance",back:`Three related diagnostics for a single data point:
- Leverage: how unusual the point's X values are — its POTENTIAL to move the fit.
- Influence: how much it ACTUALLY moves the fit.
- Cook's distance: combines both into one number.

Key distinction:
- High leverage is not automatically a problem. A point far out in X that sits on the trend line has high leverage and low influence.
- The danger is high leverage COMBINED with a large residual.

Rule of thumb:
- Investigate points with Cook's distance > 4/n.

What to do:
- Never delete points just for being influential. Check if they are data errors; if genuine, report the fit with and without them, or use a robust regression.`},{front:"Residual diagnostics — what to plot and what it means",back:`The residuals are where a misspecified model shows itself. Plot them four ways:
- Residuals vs fitted: should be a formless band around zero. Curvature = a missing non-linear term; a fan shape = non-constant variance.
- QQ plot of residuals: checks normality, which matters for small-sample inference.
- Residuals vs each predictor: shows which variable needs a transform or an interaction.
- Residuals vs time / row order: any pattern means autocorrelation, so your standard errors are wrong.

Why bother:
- R² can look fine while the model is structurally wrong. The residuals tell you WHAT to fix, not just that something is off.`},{front:"Interaction terms — and the rule people break",back:`An interaction term X₁·X₂ lets the effect of one variable depend on the level of the other.

The rule:
- If you include an interaction, you MUST include both main effects (X₁ and X₂ on their own). Omitting one forces an implausible constraint and makes the interaction coefficient uninterpretable.

Interpretation shift:
- With an interaction present, the coefficient on X₁ is the effect of X₁ WHEN X₂ = 0. If X₂ is never near zero, that number is meaningless. CENTRE the variables so main effects read at average values.

Why trees get this for free:
- Any tree or boosted ensemble captures interactions implicitly by splitting — a big part of why they beat linear models on tabular data.`},{front:"Dummy variable trap",back:`Encoding a k-level category as k separate 0/1 dummies AND keeping an intercept makes the design matrix singular — the dummies add up to the intercept, so the coefficients cannot be identified.

Fix:
- Drop one level as the reference (k − 1 dummies), or drop the intercept.

Interpretation:
- Each coefficient is then the difference from the reference level, not an absolute effect. Changing the reference changes all the numbers but not the predictions.

When it does NOT matter:
- Regularised models (ridge / lasso) and tree models handle full one-hot encoding fine — regularisation resolves the degeneracy. It is specifically an unregularised-OLS inference problem.`},{front:"GLMs and link functions",back:`A Generalised Linear Model has three parts:
- A distribution for Y from the exponential family.
- A linear predictor Xβ.
- A LINK function g that maps the mean to the linear scale: g(μ) = Xβ.

Why the link exists:
- It keeps predictions in the valid range. The logit link keeps probabilities in (0, 1); the log link keeps rates positive. A plain linear model on a probability will happily predict 1.4.

Standard pairings:
- Normal + identity = OLS.
- Bernoulli + logit = logistic regression.
- Poisson + log = count regression.
- Gamma + log = positive skewed outcomes.

Unified view:
- Choosing a loss in ML is usually choosing a distribution here — cross-entropy is exactly the Bernoulli GLM's likelihood.`},{front:"Poisson regression and overdispersion",back:`Models count outcomes with a log link, so coefficients read as multiplicative effects on the event rate.

The built-in assumption:
- Variance = mean. Real count data usually has variance much LARGER (overdispersion), from unobserved heterogeneity or clustering.

Consequence:
- Standard errors are understated, so everything looks significant. The point estimates are often fine; the inference is not.

Fixes:
- Negative binomial regression (adds a dispersion parameter), quasi-Poisson (inflates the standard errors), or robust / cluster-robust standard errors.

Also:
- Use an OFFSET (log of exposure) when counts come from windows or populations of different size, otherwise you are modelling volume rather than rate.`},{front:"Quantile regression",back:`Models a chosen QUANTILE of Y given X (the median, the 90th percentile, …) instead of the mean, by minimising an asymmetric absolute loss (the pinball loss).

Why it is useful:
- The relationship can differ across the distribution. A feature may barely move median latency while strongly affecting the 99th percentile — the part users actually feel.

Advantages:
- No distributional assumption, robust to outliers, and gives genuine prediction INTERVALS by fitting several quantiles.

ML relevance:
- How gradient boosting produces prediction intervals, and how demand forecasting handles asymmetric costs — overstock and stockout rarely cost the same, so the best forecast is not the mean.`},{front:"Measurement error and regression dilution",back:`Random noise in a PREDICTOR biases its coefficient TOWARD ZERO (attenuation). Noise in the OUTCOME inflates standard errors but does not bias the coefficient.

Mechanism:
- Noise adds variance to X without adding covariance with Y. The OLS slope is Cov(X, Y) / Var(X) — a bigger denominator with an unchanged numerator shrinks the slope.

Consequence:
- A poorly measured feature looks unimportant even when the underlying quantity matters a lot — so you can drop the right variable for the wrong reason.

Worse in multivariable models:
- Attenuation on one variable spills bias onto the others, in either direction.`},{front:"Anscombe's quartet and the Datasaurus",back:`Anscombe's quartet: four datasets with identical means, variances, correlation and regression line — yet completely different shapes. One linear, one curved, one with a single outlier driving everything, one where one point creates the whole slope.

The Datasaurus goes further:
- A dozen datasets sharing summary statistics to two decimal places, one of which is literally a dinosaur.

The lesson:
- Summary statistics are lossy in ways that can invert your conclusion, and no amount of care choosing WHICH statistics fixes it.

Practical rule:
- Plot the data before modelling and the residuals after. In ML the equivalent is slicing metrics by segment.`}],c=[{front:"Potential outcomes framework",back:`Each unit has two potential outcomes: Y(1) if treated and Y(0) if not. The causal effect for that unit is Y(1) − Y(0).

The fundamental problem of causal inference:
- You only ever OBSERVE one of them. The other is counterfactual and permanently missing, so an individual causal effect can never be measured directly.

Consequence:
- All causal inference is about estimating AVERAGE effects by finding a credible stand-in for the missing outcome — a comparable control group.

Why this framing helps:
- It reframes a causal question as a missing-data problem, which forces the assumptions you need to be explicit.`},{front:"ATE, ATT, and CATE",back:`Three treatment effects at different scopes:
- ATE — Average Treatment Effect over the whole population: E[Y(1) − Y(0)].
- ATT — the effect among those actually TREATED.
- CATE — the effect conditional on covariates X, i.e. for a specific subgroup.

Why they differ:
- If treatment was not randomly assigned, the treated group is not representative. A voluntary feature's ATT (effect on people who chose it) can be large while its ATE (effect if forced on everyone) is near zero.

Which you want:
- ATE for "should we ship to everyone?"
- ATT for "did this campaign work on those we targeted?"
- CATE for personalisation and targeting — CATE estimation is what uplift modelling does.`},{front:"Why does randomisation actually work?",back:`Random assignment makes treatment INDEPENDENT of every pre-treatment variable — observed and unobserved alike.

Mechanism:
- That independence makes the control group a valid estimate of what would have happened to the treated group. It closes every back-door path at once, so no covariate adjustment is needed for an unbiased estimate.

The key advantage over any observational method:
- It handles CONFOUNDERS YOU DID NOT THINK OF. Propensity matching can only balance what you measured.

Gotcha:
- Randomisation guarantees balance in EXPECTATION, not in your particular sample. Small experiments can still be visibly imbalanced — check, and stratify if it matters.`},{front:"SUTVA — the assumption everyone forgets",back:`Stable Unit Treatment Value Assumption, two parts:
- No interference: one unit's treatment does not affect another unit's outcome.
- Consistency: there is only one version of the treatment.

Where it breaks in tech:
- Social networks (your treated friend changes your behaviour).
- Marketplaces (treated buyers consume supply the control group needed).
- Anything with shared resources or shared caches.

Consequence:
- When SUTVA fails, even a perfectly randomised A/B test is biased — the control group has been contaminated by the treatment.

Fix:
- Randomise at a higher level: cluster / graph-based randomisation, or geographic or time-based splits.`},{front:"DAGs and the back-door criterion",back:`A DAG (directed acyclic graph) draws variables as nodes and causal arrows as edges. A "back-door path" from X to Y is a non-causal path connecting them that creates spurious association.

Back-door criterion:
- To identify the causal effect of X on Y, condition on a set of variables that blocks every back-door path WITHOUT including any descendant of X.

Why this beats intuition:
- It tells you exactly which variables to control for — and, crucially, which you must NOT. "Control for everything available" is wrong.

The three building blocks:
- Chain X→Z→Y: conditioning on Z blocks it.
- Fork X←Z→Y: Z is a confounder — condition on it.
- Collider X→Z←Y: do NOT condition on Z.`},{front:"Collider bias",back:`A collider is a variable that is a common EFFECT of two others (X→Z←Y). Conditioning on it creates an association between X and Y that does not exist in the full population.

Intuition:
- Among people admitted to hospital, being young and being severely ill become negatively correlated — because you generally need one or the other to be admitted at all.

Why it is the most dangerous causal error:
- Adding a control variable can CREATE bias where there was none. This is the formal reason "control for more covariates" is not automatically safer.

ML relevance:
- Selecting your training set on a variable that is downstream of both features and label induces exactly this — the model learns a relationship that vanishes in production.`},{front:"Berkson's paradox",back:`A spurious NEGATIVE association that appears because the sample was selected on a variable both inputs influence — collider bias disguised as a sampling rule.

Classic example:
- At a selective university, SAT score and GPA look negatively correlated, because admission required a high combination of the two. Anyone low on both was never admitted.

Tech example:
- Among users who converted, ad exposure and organic intent look like substitutes, because either alone was enough to convert.

Why it matters:
- It can make genuinely positive relationships look negative inside a selected sample. Always ask what filter produced this dataset before interpreting a correlation within it.`},{front:"Propensity score matching",back:`Model P(treated | covariates), then compare treated and control units that have similar propensity scores.

Mechanism:
- It collapses many covariates into one number, which makes matching feasible in high dimensions. Balancing on the score balances the covariates that went into it.

The assumption that decides everything:
- NO UNMEASURED CONFOUNDERS. It only balances what you measured; unobserved selection stays fully intact.

Checks:
- Assess covariate balance after matching (standardised mean differences).
- Verify overlap — units with no comparable counterpart must be dropped, which narrows your estimand from ATE to something local.`},{front:"Difference-in-differences",back:`Compare the CHANGE in a treated group to the change in an untreated group over the same period:
- (After − Before)_treated  −  (After − Before)_control.

Why it helps:
- Differencing removes any time-invariant confounder, even unobserved ones. The control group removes any common time trend.

The critical assumption — PARALLEL TRENDS:
- Absent treatment, both groups would have moved the same way. Untestable for the treatment period, but you can check it in pre-period data (an "event study" plot).

Gotchas:
- Fails if treatment timing correlates with a differential shock.
- With staggered adoption across many units, the standard two-way fixed-effects estimator is biased — use a modern staggered-DiD estimator.`},{front:"Regression discontinuity",back:`When treatment is assigned by a THRESHOLD on a continuous score, units just above and just below the cutoff are nearly identical apart from treatment. Compare them.

Why it is compelling:
- Near the cutoff, assignment is effectively random, so you get a local experiment without running one.

Examples:
- A credit-score cutoff for loan approval, a spend threshold that unlocks a loyalty tier, a rank cutoff for being featured.

Gotchas:
- The estimate is LOCAL to the cutoff and may not generalise elsewhere.
- Check for manipulation — bunching just above the threshold means people are gaming it, which breaks the design.
- Verify no other policy uses the same cutoff.`},{front:"Instrumental variables",back:`An instrument Z affects the treatment X but influences the outcome Y ONLY through X. Use the part of X's variation that is driven by Z to estimate the causal effect, sidestepping confounding.

Three requirements:
- Relevance: Z genuinely moves X.
- Exclusion: Z has no direct path to Y.
- Independence: Z is itself unconfounded.

Classic tech instrument:
- A randomised NUDGE. If you randomise who is prompted to try a feature, the prompt is an instrument for actually using it — this recovers the effect of usage despite self-selection.

Gotchas:
- A WEAK instrument gives wildly unstable estimates and amplifies any small violation of exclusion.
- Exclusion is untestable and is where most IV analyses fail.`},{front:"Intention-to-treat vs per-protocol",back:`Two ways to analyse an experiment with imperfect compliance:
- ITT: analyse everyone by the group they were ASSIGNED to, regardless of whether they complied.
- Per-protocol: analyse only those who actually complied.

Why ITT is the default:
- Assignment was randomised; compliance was not. Filtering to compliers reintroduces selection bias, because compliers differ systematically from non-compliers.

The trade-off:
- ITT answers "what happens if we launch this?" (the real business question) but DILUTES the effect toward zero when compliance is low.
- Per-protocol estimates the effect of the treatment itself — but with confounding back in.

Best of both:
- Report ITT as the headline, and use an IV / CACE analysis to estimate the effect among compliers without the selection bias.`},{front:"Heterogeneous treatment effects (and uplift modelling)",back:`The average effect can be near zero while hiding a large positive effect in one segment and a negative one in another.

Why it matters commercially:
- Shipping to everyone leaves value on the table if you could target. Uplift / CATE models predict the INDIVIDUAL treatment effect rather than the outcome, so you treat only those who respond.

Methods:
- Causal forests, T / S / X-learners, and direct uplift trees that split on the difference in effect.

The hard part:
- You never observe an individual's treatment effect, so there is no ground-truth label. Evaluation uses Qini / uplift curves on held-out randomised data.

Gotcha:
- Hunting for subgroups post hoc until one is significant is p-hacking. Pre-specify, or correct for multiplicity.`}],d=[{front:"Randomisation unit vs analysis unit",back:`The unit you randomise on and the unit you analyse on must MATCH.
- Randomise by user but analyse by page view, and your observations are not independent — one user contributes many correlated rows.

Consequence:
- The standard error is computed as though you had far more independent data than you do. Confidence intervals come out too narrow and false positives soar. One of the most common real-world A/B bugs.

Fix:
- Analyse at the randomisation unit (aggregate to per-user metrics), or use cluster-robust standard errors / the delta method to account for within-user correlation.

Rule:
- The more page views per user, the worse the inflation.`},{front:"Cluster randomisation — when and what it costs",back:`Randomise whole GROUPS (schools, cities, accounts, regions) rather than individuals.

Why:
- It prevents contamination when units interact — the standard answer to network effects or shared marketplace supply.

The cost:
- Your EFFECTIVE sample size is closer to the number of clusters than the number of individuals. Ten cities is ten data points, however many users they contain — so power drops sharply.

Quantified by:
- The intra-cluster correlation (ICC). Higher ICC means members of a cluster are more alike, so the effective n is smaller.

Implication:
- Cluster-randomised tests need many more users to detect the same effect.`},{front:"Sample Ratio Mismatch (SRM)",back:`You intended a 50/50 split but observe, say, 50.4 / 49.6. With large n a chi-squared test on the assignment counts rejects decisively — a signal that something is broken.

Why it is the single most valuable A/B guardrail:
- It does not test your metric, it tests your EXPERIMENT. An SRM means assignment, logging, or filtering is broken, so every result from that test is untrustworthy however good it looks.

Common causes:
- Redirect-based assignment losing slow clients, bot filtering applied unevenly, a crash affecting one variant, or a join that drops rows for one arm.

Rule:
- If SRM fires, DEBUG — never interpret the metrics. A "winning" test with SRM is usually a broken test.`},{front:"Guardrail metrics",back:`Metrics you do not expect to improve but must not damage: latency, crash rate, unsubscribes, support tickets, overall revenue.

Why they are essential:
- Teams optimise one success metric, and the cheapest way to move it is often to harm something else. A recommendation change can raise CTR by degrading page latency or by cannibalising another surface.

How to use them:
- Monitor for DEGRADATION at a looser threshold, and treat any regression as blocking regardless of the win on the primary metric.

Also include invariants:
- Metrics that logically cannot change (assignment ratio, counts on unaffected surfaces). If they move, you have a bug.`},{front:"Network effects and interference in experiments",back:`Treatment leaks from treated users to control users, so the control group stops being a clean counterfactual.

Mechanisms:
- Social spillover (a treated user messages an untreated one), marketplace competition (treated buyers take inventory), shared models or caches trained on pooled traffic.

Direction of the bias:
- Usually SHRINKS the measured effect, because control is partly treated — you underestimate a real win.
- With marketplace competition it can INFLATE it, because the treatment steals from control rather than growing the pie.

Fixes:
- Cluster or graph-partition randomisation, geo splits, time-based switchbacks, or two-sided designs that randomise both sides of a marketplace.`},{front:"Sequential testing and always-valid p-values",back:`Methods built for CONTINUOUS monitoring, so you can stop as soon as the evidence is sufficient without inflating the false-positive rate.

Approaches:
- Group sequential designs with pre-specified interim looks and adjusted boundaries (O'Brien-Fleming).
- Always-valid p-values / confidence sequences based on martingale bounds.

The trade-off:
- They are more conservative at any single look than a fixed-n test. If the effect is large you stop much sooner; if it is small you may need more data than a fixed design would have.

Why it matters:
- It makes the natural human behaviour — checking the dashboard daily — statistically legitimate instead of a source of false wins.`},{front:"Stratification and blocking",back:`Randomise WITHIN strata (country, device, new vs returning, prior activity level) so each arm gets a balanced mix.

Why it helps:
- It removes between-stratum variance from the comparison, cutting the variance of the treatment-effect estimate. Same n, more power — the same principle as CUPED and paired tests.

When it matters most:
- Small experiments where chance imbalance is likely, and populations with a few heavy strata that dominate the metric.

Gotcha:
- You must ANALYSE with the same stratification you randomised on, or you forfeit the gain.
- Stratify only on PRE-treatment variables. Stratifying on anything measured after treatment biases the estimate.`},{front:"Ratio metrics and why their variance is tricky",back:`Metrics like clicks-per-session or revenue-per-order have a random NUMERATOR AND DENOMINATOR, often correlated.

The error:
- Treating the ratio as a simple mean and using the usual standard error. That ignores denominator variance and the covariance, giving intervals that are wrong — usually too narrow.

Fix:
- The delta method gives the correct variance including the covariance term; or bootstrap at the randomisation unit, which handles it with no formula.

Related trap:
- The ratio of averages ≠ the average of ratios. Per-user CTR averaged across users weights a one-impression user the same as a thousand-impression user. Decide which quantity you actually want.`},{front:"Winsorisation and capping for skewed metrics",back:`Revenue and session-length metrics are heavily right-skewed, so a single "whale" can dominate the difference between arms and make results swing unpredictably.

Winsorise:
- Clip values above a high percentile (e.g. the 99th) down to that percentile. Trimming instead DISCARDS them, which changes the population you are describing.

Why it helps:
- It cuts variance sharply, restoring power — those outliers were adding noise, not signal about the treatment.

Gotchas:
- It BIASES the metric (you are no longer estimating true mean revenue), so pre-declare the cap and apply it identically to both arms.
- If the treatment genuinely works by creating whales, capping hides your real effect.`},{front:"Twyman's law",back:`"Any figure that looks interesting or different is usually wrong."

Why it deserves to be a rule:
- The prior probability of a 40% lift from a button-colour change is far lower than the probability of an instrumentation bug. An extraordinary result is evidence about your pipeline before it is evidence about user behaviour.

What to check first:
- SRM, logging duplication, filters applied to one arm, a metric-definition change shipped in the same window, bot traffic, and whether the effect is concentrated in one platform or one day.

Discipline:
- Require a mechanism. If nobody can explain HOW the change produced the effect, treat it as unverified.`},{front:"Interaction between concurrent experiments",back:`Most organisations run many tests at once on overlapping traffic. Usually this is fine — effects are roughly additive and randomisation makes other tests balanced noise.

When it breaks:
- Two tests changing the same surface, or one changing what the other measures. Then the effects are not additive, and each test's "control" contains a mixture of the other's variants.

Defences:
- Orthogonal / independent hashing per experiment so overlaps stay balanced.
- Mutually exclusive layers for tests known to conflict.
- An interaction check on shared surfaces.

Gotcha:
- With many tests, some pair WILL show a spurious interaction by chance. Do not chase every one; require a plausible mechanism.`},{front:"Long-term holdouts and why short tests mislead",back:`A permanent (or long-running) holdout group that never receives the accumulated changes, measured over months.

Why you need one:
- Short tests capture novelty, miss habituation, and cannot see cumulative or compounding effects. A series of individually positive tests can sum to a negative long-run outcome — notifications that each lift engagement while collectively driving unsubscribes.

What it catches:
- Metric erosion, user fatigue, ecosystem effects, and the gap between short-term proxies and retention.

Costs:
- Some users permanently get a worse product, it needs disciplined infrastructure, and the holdout population slowly becomes unrepresentative as it self-selects through churn.`},{front:"Goodhart's law and metric gaming",back:`"When a measure becomes a target, it ceases to be a good measure."

Mechanism:
- Optimisation finds the cheapest path to the number, which is rarely the intended behaviour. The proxy and the goal diverge precisely because you applied pressure to the proxy.

ML examples:
- Optimising CTR → clickbait.
- Optimising watch time → autoplay traps.
- Optimising "resolved tickets" → prematurely closed tickets.
- Optimising a reward model → outputs that exploit the reward model.

Defences:
- Pair the target with guardrails that capture the harm, use multiple objectives, measure long-term outcomes via holdouts, and periodically re-check that the proxy still correlates with the goal.`}],h=[{front:"Confusion matrix — the four rates and their denominators",back:`Every classification rate is TP, TN, FP or FN over a chosen denominator — and the denominator is the whole story.

- TPR / recall / sensitivity = TP / (TP + FN): of the ACTUAL positives, how many did we catch?
- Specificity = TN / (TN + FP): of the actual negatives, how many did we clear?
- Precision / PPV = TP / (TP + FP): of our POSITIVE PREDICTIONS, how many were right?
- FPR = FP / (TN + FP) = 1 − specificity.

Key insight:
- Recall and specificity condition on the TRUTH, so they do not change with prevalence — they are properties of the model.
- Precision conditions on the PREDICTION, so it moves with prevalence — the same model has lower precision when positives are rarer.`},{front:"Why does PPV collapse when the base rate is low?",back:`Because the false positives are drawn from a huge negative class.

Worked example (prevalence 0.1%, sensitivity 99%, specificity 99%), per 100,000 people:
- 100 positives → 99 caught.
- 99,900 negatives → 999 false positives.
- PPV = 99 / (99 + 999) ≈ 9%.

So:
- A "99% accurate" test is wrong about 91% of the people it flags.

Why interviewers love it:
- It separates people who memorised metric formulas from people who understand conditioning. It is Bayes' rule in applied form.

Implication:
- On rare-event problems, report precision at your operating threshold. Sensitivity and specificity alone will mislead everyone.`},{front:"F1, Fβ, and what F1 quietly assumes",back:`F1 is the HARMONIC mean of precision and recall: 2PR / (P + R). Harmonic, not arithmetic, so it is dragged down by the weaker of the two — perfect precision cannot rescue terrible recall.

Fβ generalises it:
- β > 1 weights recall more (fraud, disease screening — misses are costly).
- β < 1 weights precision more (spam filtering, automated actions — false alarms are costly).

What F1 assumes:
- That precision and recall matter EQUALLY. That is a modelling choice, usually a false one. β should come from the real cost ratio.

Gotcha:
- F1 ignores true negatives entirely, so it is not symmetric under swapping which class you call positive.`},{front:"Log loss (cross-entropy) as an evaluation metric",back:`The mean of −log(predicted probability of the true class). Unbounded above — one confident wrong prediction can dominate the whole score.

What makes it valuable:
- It is a PROPER SCORING RULE: uniquely minimised by reporting your true beliefs. It rewards calibration, not just correct ranking, so unlike AUC it punishes overconfidence.

Gotcha:
- Because it is unbounded, a handful of confidently wrong cases can swamp it.
- Predictions of exactly 0 or 1 give infinite loss — hence clipping.

When to prefer it:
- Whenever the probability itself is used downstream (expected-value decisions, bidding, cost-based thresholds). Use AUC when only the ordering matters.`},{front:"Matthews correlation coefficient and Cohen's kappa",back:`Two single-number summaries that stay honest under imbalance:
- MCC: the correlation between predicted and true labels, in [−1, 1]. Uses all four confusion-matrix cells, so unlike F1 it cannot be inflated by ignoring the negative class. High MCC requires doing well on BOTH classes.
- Cohen's kappa: agreement CORRECTED FOR CHANCE — (observed − expected) / (1 − expected). Originally for inter-rater agreement, also used for classifiers.

Why chance correction matters:
- With 95% of one class, a trivial classifier gets 95% raw agreement. Kappa reports roughly 0 — the honest answer.

Gotcha:
- Kappa is hard to compare across different prevalences, so compare it only within one fixed data distribution.`},{front:"Choosing a decision threshold",back:`The model outputs a probability; the THRESHOLD that turns it into a decision is a separate business choice, and 0.5 is almost never right.

Principled approach:
- Pick the threshold that minimises expected cost. With costs C_FP and C_FN, the optimal threshold is C_FP / (C_FP + C_FN) — independent of the model. If a miss costs 9× a false alarm, threshold at 0.1.

When costs are unknown:
- Fix precision at the level the business tolerates and take whatever recall follows, or fix the alert VOLUME your review team can process.

Gotcha:
- Tune the threshold on a validation set, not the test set, and re-tune after any change in prevalence — the optimal threshold moves with the base rate.`},{front:"McNemar's test — comparing two classifiers properly",back:`Compares two models on the SAME test set, using only the cases where they disagree:
- b = count where A is right and B wrong.
- c = count where B is right and A wrong.
- Statistic ≈ (|b − c| − 1)² / (b + c).

Why not a two-proportion test on the two accuracies:
- Those accuracies are computed on the same examples, so they are strongly dependent. Treating them as independent overstates the uncertainty and wastes the pairing.

Mechanism:
- Cases both models get right, or both wrong, carry NO information about which is better, so they are correctly discarded.

Use it when:
- Choosing between two models on one held-out set.`},{front:"Comparing models across cross-validation folds",back:`The trap: running a paired t-test on the per-fold scores. Folds SHARE training data, so the scores are correlated and the test's independence assumption is violated — it declares significance far too readily.

Better options:
- Repeated k-fold with a corrected resampled t-test that accounts for the overlap.
- The 5×2cv paired t-test.
- Best of all: a single large held-out set with McNemar or a bootstrap interval.

More honest still:
- Report the mean AND spread across folds. If your improvement is smaller than the fold-to-fold noise, you have not shown anything.`},{front:"Bootstrap confidence intervals for a metric",back:`Resample the TEST SET with replacement, recompute the metric each time, and take percentiles of the resulting distribution.

Why it is the practical default:
- AUC, F1, precision@k and NDCG have no simple analytic standard error, and the bootstrap needs none.

What it reveals:
- How much of your "+0.3% AUC" is noise. A 95% interval of [−0.4%, +1.0%] settles the argument.

Gotchas:
- Resample at the INDEPENDENT unit — by user, not by row, when a user contributes many rows. For ranking metrics, resample queries / sessions.
- It captures only test-set sampling noise, not variance from retraining, so it understates total uncertainty.`},{front:"Nested cross-validation",back:`Two nested loops: an outer loop estimates generalisation performance, and an inner loop does hyperparameter selection within each outer training fold.

The problem it solves:
- Tuning hyperparameters on the same CV folds you report scores from leaks information — you picked the configuration that happened to suit those folds, so the reported score is optimistically biased. With many configurations tried, that bias is large.

Cost:
- k_outer × k_inner model fits — often prohibitive.

Practical alternative:
- A three-way split: train / validation (for tuning) / test (touched once). Nested CV is mainly worth it when data is scarce enough that a single split is too noisy.`},{front:"Overfitting the validation set",back:`Every decision guided by validation performance — features, architecture, thresholds, early stopping, which experiment to pursue — leaks a little information from it. After hundreds of such choices, the validation score is an optimistic estimate of true performance.

Why it is invisible:
- No single step feels like cheating, and there is no error message. It is the multiple-comparisons problem applied to model development.

Symptom:
- A persistent gap where the test or production metric is consistently worse than validation, and the gap widens the longer a project runs.

Defences:
- Keep a test set genuinely untouched until the end, refresh the validation data periodically, and be suspicious of tiny gains accumulated over many iterations.`}],u=[{front:"p-hacking and the garden of forking paths",back:`p-hacking: trying variations — subsets, outlier rules, extra covariates, transforms, alternative metrics — until something clears p < 0.05.

The garden of forking paths (the subtler version):
- You run ONE analysis, but every choice along the way was contingent on the data. No conscious cheating, yet the effective number of tests is large, so the reported p-value is meaningless.

Why it is so common in ML:
- The analysis pipeline has dozens of defensible-looking decision points.

Defences:
- Pre-register the primary metric and analysis, report every variant you tried, keep exploratory work separate from confirmatory, and validate on genuinely fresh data.`},{front:"HARKing and the Texas sharpshooter fallacy",back:`HARKing: Hypothesising After the Results are Known — presenting a pattern you FOUND in the data as though you had predicted it in advance.

Texas sharpshooter:
- Fire at a barn, then draw the target around the tightest cluster of holes. Any large dataset contains striking patterns by chance; picking the pattern first and the hypothesis second guarantees you "find" one.

Why it feels legitimate:
- The story is built after the fact and sounds entirely plausible. Plausibility is not evidence.

Defence:
- Exploratory findings are HYPOTHESES, not conclusions. They need confirmation on data that played no part in generating them. Say which mode you are in.`},{front:"Ecological fallacy (and its inverse)",back:`Ecological fallacy: inferring INDIVIDUAL behaviour from GROUP-level correlations.
- Regions with more immigrants may have higher literacy while immigrants individually have lower literacy. The group relationship need not hold at the individual level.

Atomistic fallacy: the reverse — inferring group effects from individual data.

Mechanism:
- Aggregation destroys within-group variation, so group-level correlations are typically stronger and can even flip sign. Same machinery as Simpson's paradox.

ML relevance:
- A feature aggregated to a coarse level (city-average income as a user feature) does not carry the individual relationship you assume, and models built on it can behave very differently per person.`},{front:"Look-ahead bias and time-travel in features",back:`Any feature computed using information that would not have been available at prediction time. Offline metrics look excellent; production collapses.

Common sources:
- Aggregates computed over the full dataset, including the future.
- A label-derived field ("total_purchases" when predicting purchase).
- A status column that gets UPDATED in place, so the historical row now shows today's value.
- Joining a dimension table without effective dates.

The diagnostic question for every feature:
- Would I have known this value, WITH THIS VALUE, at the moment of the decision?

Defences:
- Point-in-time correct joins, strictly temporal train/test splits, and immediate suspicion of any single feature with dominant importance.`},{front:"Winner's curse in model and variant selection",back:`When you pick the best of many candidates based on a noisy estimate, the winner's TRUE performance is systematically worse than its observed score.

Mechanism:
- Winning requires both genuine quality and favourable noise. Selection is partly selection on noise, which does not repeat — so the estimate shrinks on re-measurement.

Consequences:
- The best of 50 A/B variants overstates its lift.
- The top Kaggle leaderboard model is partly lucky.
- The best hyperparameter configuration underperforms its search score.

Why it is regression to the mean with teeth:
- The more candidates and the noisier the estimate, the bigger the shortfall.

Fix:
- Re-measure the winner on fresh data, or shrink the estimate.`},{front:"Stationarity and spurious regression",back:`A stationary series has constant mean, variance and autocovariance over time. Most business series are NOT stationary — they trend.

Spurious regression:
- Two independent series that both trend upward will show a high R² and a "significant" coefficient with no real relationship. Regressing one random walk on another produces significant results most of the time.

Detect:
- An ADF or KPSS test for unit roots; visually, a series that never returns to a mean.

Fix:
- Difference the series, model the trend explicitly, or use cointegration methods if a genuine long-run relationship is suspected. Never interpret a regression between two undifferenced trending series.`},{front:"Autocorrelation and effective sample size",back:`When observations are correlated with their own recent past, each new point carries LESS than one point's worth of new information.

Consequence:
- Your EFFECTIVE sample size is smaller than n, sometimes drastically. Standard errors computed as if independent are too small, so everything looks significant. With positive autocorrelation ρ, effective n ≈ n·(1 − ρ) / (1 + ρ).

Where it appears:
- Daily metrics, per-user event streams, sensor data, MCMC chains.

Detect:
- ACF plot, Durbin-Watson, or Ljung-Box test on residuals.

Fixes:
- Aggregate to a coarser unit, use HAC / Newey-West standard errors, model the autocorrelation directly, or block-bootstrap instead of resampling points.`},{front:"Selecting on the dependent variable",back:`Studying only the cases that have the outcome you care about, with no comparison group.

Examples:
- Analysing only converting users to find "what drives conversion".
- Studying only successful startups for lessons.
- Reviewing only churned accounts to explain churn.

Why it cannot work:
- Without the non-outcome group you cannot compute any conditional difference. If 90% of converters used feature X but so did 90% of non-converters, X explains nothing — and you would never know.

Mechanism:
- The base rate fallacy plus survivorship bias combined.

Fix:
- Always assemble a comparison group, and think in terms of a 2×2 table, not a single column.`},{front:"Aggregation and the choice of unit",back:`The same data gives different answers depending on the level you aggregate to, because different aggregations apply different implicit weights.

Example:
- Average per-user CTR weights a one-impression user the same as a 10,000-impression user.
- Total clicks / total impressions weights by activity.
- Neither is wrong — they answer different questions, and they can move in opposite directions.

Gotcha:
- Switching aggregation level mid-analysis, or comparing a metric defined one way against a historical version defined the other way, produces changes that look like real effects.

Discipline:
- Write the metric definition down, including the unit and the weighting, and keep it fixed across comparisons.`},{front:"Multiple testing hidden inside feature selection",back:`Screening thousands of features for association with the target IS thousands of hypothesis tests. At α = 0.05, 1000 pure-noise features yield about 50 "significant" ones.

Consequence:
- Features selected this way include many spurious ones that will not generalise, and any performance estimate computed on the same data that guided selection is optimistic.

The compounding error:
- Doing selection BEFORE cross-validation leaks the whole dataset into every fold. Selection must happen inside the fold.

Defences:
- Fit selection within the CV pipeline, use FDR control if you need a defensible feature list, or prefer embedded regularisation (lasso) whose selection is part of the model being validated.`},{front:"Correlation of a metric with itself over time (Twyman meets drift)",back:`A metric can move for three indistinguishable reasons:
- The underlying behaviour changed.
- The POPULATION MIX changed.
- The instrumentation changed.
The aggregate number alone cannot tell them apart.

Why it matters:
- A "model degradation" alert is frequently a traffic-mix shift, a new client version logging differently, or a bot wave — not the model at all.

Diagnostic sequence:
- Decompose the metric by segment: did any segment move, or only the weights?
- Check the volume of each segment.
- Check whether the change aligns with a release.

Rule:
- Before concluding a behavioural change, rule out composition and instrumentation. Mix shifts are more common than behaviour shifts.`}],m={deck:"Statistics for ML",cards:[...a,...i,...s,...o,...r,...l,...c,...d,...h,...u]},p={deck:"ML Algorithms",cards:[{front:"Linear regression — assumptions, and closed form vs gradient descent",back:`Fits a straight-line relationship y = Xβ by minimising squared error.

Two ways to solve it:
- Closed form: β = (XᵀX)⁻¹Xᵀy. One shot, but O(d³) in the number of features d.
- Gradient descent: iterative, scales to large d and huge n.

Assumptions:
- Linearity, independent errors, constant error variance, and — for inference — normally distributed errors.

Gotcha:
- XᵀX is singular when features are collinear or d > n, so the closed form does not exist. Ridge fixes this by adding λI, which guarantees invertibility.`},{front:"Logistic regression — why not use squared error?",back:`Models the log-odds of the positive class as linear: log(p / (1 − p)) = Xβ, so p = sigmoid(Xβ).

Why cross-entropy loss, not MSE:
- MSE paired with a sigmoid is NON-CONVEX in the weights, so optimisation can get stuck. Cross-entropy is convex.
- MSE's gradient contains the sigmoid derivative, which vanishes when the model is confidently wrong — learning stalls exactly when it should be fastest. Cross-entropy cancels that term.

Interpretation:
- exp(βⱼ) is the odds ratio for a one-unit increase in feature j.`},{front:"L1 vs L2 regularization — why does L1 produce exact zeros?",back:`Both add a penalty on coefficient size: L2 (Ridge) adds λ·‖β‖², L1 (Lasso) adds λ·‖β‖₁.

Geometric reason L1 zeros things out:
- The L1 constraint region is a diamond with CORNERS on the axes; the L2 region is a smooth circle.
- The loss contours first touch the diamond at a corner — where some coefficients are exactly 0. A circle has no corners, so L2 shrinks smoothly but never to zero.

Analytic view:
- L1's gradient is a constant ±λ regardless of magnitude, so it keeps pushing to zero. L2's gradient shrinks in proportion and tapers off.

Elastic Net:
- Blends both — needed with correlated features, since Lasso arbitrarily keeps just one of a correlated group.`},{front:"Gradient descent variants: SGD, momentum, RMSProp, Adam",back:`Ways to step down the loss surface:
- Batch GD: exact gradient over all data, one update per epoch. Slow.
- SGD: gradient from one sample — noisy but fast, and the noise helps escape sharp minima.
- Mini-batch: the practical compromise.

Momentum:
- Accumulates a velocity vector, damping oscillation across narrow valleys and accelerating along consistent directions.

RMSProp:
- Divides the step by a running average of squared gradients, giving each parameter its own effective learning rate.

Adam:
- Momentum + RMSProp + bias correction. Fast and forgiving, but often generalises slightly worse than well-tuned SGD + momentum — which is why large vision models still often use the latter.`},{front:"Learning rate — the single most important hyperparameter",back:`How big a step to take along the gradient.
- Too high: divergence or oscillation.
- Too low: painfully slow, and more likely to settle in a poor region.

Schedules:
- Step decay, cosine annealing, and WARMUP (start small, ramp up).
- Warmup helps because early gradients are large and unrepresentative, especially with adaptive optimisers whose variance estimates are still unreliable.

Diagnostic:
- Loss exploding to NaN → lower it.
- Loss flat from the start → probably too low, or a dead network.

Trick:
- The LR range test — sweep the rate upward and plot loss to find the steepest-descent region.`},{front:"Loss functions: MSE, MAE, Huber, cross-entropy, hinge",back:`The loss encodes what you count as a good prediction:
- MSE: squared error, dominated by outliers; its optimum is the conditional MEAN.
- MAE: linear penalty, robust; optimum is the conditional MEDIAN.
- Huber: quadratic near zero, linear in the tails — robust but differentiable everywhere.
- Cross-entropy: for probabilistic classification; heavily punishes confident mistakes.
- Hinge (SVM): zero loss once the margin is satisfied, so only boundary points matter.

Key insight:
- Choosing MSE on skewed revenue data silently commits you to chasing outliers.`},{front:"Decision trees — splitting criteria and why they overfit",back:`Recursively split the data to make each region as pure (single-class) as possible.
- Classification impurity: Gini = 1 − Σp², or entropy = −Σp log p. They behave near-identically; Gini is marginally cheaper.
- Regression trees split on variance reduction.

Why they overfit:
- Grown to full depth, a tree can isolate every single training point — zero training error, memorised noise.

Controls:
- max_depth, min_samples_leaf, min_impurity_decrease, and cost-complexity pruning.

Mechanism:
- Splits are chosen GREEDILY and locally. A tree cannot look ahead, so it misses combinations that only pay off jointly (e.g. XOR).`},{front:"Random Forest — what makes it work?",back:`Many deep decision trees, each trained on a bootstrap sample AND restricted to a random subset of features at each split, then averaged.

The crucial part:
- Bootstrapping alone leaves trees highly correlated, because one dominant feature gets chosen first in nearly every tree. Averaging correlated models barely cuts variance.
- Restricting the candidate features at each split DECORRELATES the trees — that is where most of the benefit comes from.

Properties:
- Reduces variance without raising bias; hard to overfit by adding more trees; gives free out-of-bag validation.

Weakness:
- Large memory footprint, and poor extrapolation beyond the training range.`},{front:"Bagging vs boosting",back:`Two ways to combine many models:
- Bagging: train models in PARALLEL on bootstrap samples, then average. Targets VARIANCE. Base learners should be low-bias / high-variance (deep trees).
- Boosting: train models SEQUENTIALLY, each correcting the previous one's errors. Targets BIAS. Base learners should be weak / high-bias (shallow stumps).

Mechanism:
- Bagging averages independent errors away.
- Boosting performs gradient descent in function space.

Consequence:
- Boosting CAN overfit with too many rounds and needs early stopping; bagging essentially cannot.
- Boosting is usually more accurate but more sensitive to noisy labels.`},{front:'Gradient boosting — what is the "gradient"?',back:`Each new tree is fitted to the NEGATIVE GRADIENT of the loss with respect to the current predictions — the "pseudo-residuals".
- For squared loss, those are just the ordinary residuals, which is why "fit the errors" is the usual intuition.

Mechanism:
- It is gradient descent where each step is taken in function space rather than parameter space, with a tree approximating the descent direction.

Key knobs:
- Learning rate (shrinkage) and number of trees trade off — a lower rate needs more trees but generalises better.
- Subsampling adds useful stochasticity.

Implementations:
- XGBoost adds second-order (Newton) information and regularisation; LightGBM uses histogram binning and leaf-wise growth for speed.`},{front:"SVM and the kernel trick",back:`Finds the hyperplane that maximises the MARGIN — the gap to the nearest data points (the support vectors).
- Soft margin allows some violations, controlled by C: small C = wider margin, more tolerance; large C = fits the training data harder.

Kernel trick:
- The optimisation depends on the data only through inner products. Replacing x·x' with a kernel K(x, x') implicitly maps to a high-dimensional space WITHOUT ever computing coordinates there. The RBF kernel corresponds to an infinite-dimensional space.

Gotcha:
- Scales roughly O(n²)-O(n³), so it is impractical for very large n — a big reason SVMs lost ground to boosted trees and neural nets.`},{front:"k-Nearest Neighbours and the curse of dimensionality",back:`No training. At prediction time, find the k closest training points and vote (classification) or average (regression).

Curse of dimensionality:
- As dimensions grow, all points become nearly EQUIDISTANT — the ratio of nearest to farthest distance approaches 1 — so "nearest" stops being meaningful.
- The data needed to keep neighbourhoods dense grows exponentially with dimension.

Practical notes:
- Features MUST be scaled, or distance is dominated by large-magnitude features.
- Small k = low bias / high variance; large k = the reverse.

Cost profile:
- Training free, inference expensive — the opposite of most models.`},{front:"Naive Bayes — why does it work despite a false assumption?",back:`Applies Bayes' rule while assuming all features are conditionally independent given the class — almost never actually true.

Why it still works:
- For CLASSIFICATION you only need the correct ARGMAX, not correct probabilities. Dependence distorts the magnitudes but often preserves their ordering.

Strengths:
- Extremely fast, works with tiny data and very high dimensions (text), naturally online.

Gotchas:
- Predicted probabilities are badly calibrated — usually pushed toward 0 or 1.
- An unseen feature-class pair gives probability 0 and annihilates the whole product — hence Laplace smoothing.`},{front:"k-means — assumptions and initialisation",back:`Alternates two steps (Lloyd's algorithm): assign each point to the nearest centroid, then recompute each centroid as the mean of its points. Converges to a LOCAL optimum only.

Hidden assumptions:
- Clusters are spherical, similarly sized, and similarly dense. It fails badly on elongated or nested shapes because it minimises within-cluster squared distance.

Initialisation matters a lot:
- Random init can converge terribly. Use k-means++ (spreads the initial centroids apart probabilistically).

Choosing k:
- Elbow method, silhouette score, gap statistic — all heuristics. Scale the features first.`},{front:"DBSCAN vs k-means",back:`DBSCAN grows clusters outward from dense regions, using two parameters: eps (neighbourhood radius) and min_samples.

Advantages over k-means:
- Finds ARBITRARY shapes.
- No need to choose k in advance.
- Explicitly labels outliers as noise.

Weaknesses:
- Struggles when clusters have very different densities.
- eps is hard to choose in high dimensions, where distances concentrate.

When to use which:
- DBSCAN for irregular shapes or when outliers matter (anomaly detection).
- k-means when clusters are roughly globular and you need speed at scale.
- HDBSCAN removes the fixed-eps limitation by building a hierarchy over densities.`},{front:"PCA — what is it actually doing?",back:`Finds the orthogonal directions of MAXIMUM VARIANCE in the data. These are the eigenvectors of the covariance matrix; the eigenvalues give the variance each one explains.

Equivalent views:
- The linear projection that minimises reconstruction error.
- The SVD of the centred data matrix.

Critical preprocessing:
- You MUST centre the data, and standardise it when features have different units — otherwise a feature measured in metres dominates one in kilometres purely by scale.

Limits:
- Captures LINEAR structure only, and components are usually uninterpretable mixtures.
- Not feature selection — it creates new features rather than choosing among existing ones.`},{front:"t-SNE and UMAP — and how to not misread them",back:`Non-linear methods that squeeze high-dimensional data to 2D for VISUALISATION, preserving local neighbourhood structure.

Critical caveats:
- Cluster SIZES are meaningless.
- Distances BETWEEN clusters are largely meaningless.
- Results change with perplexity and random seed.
- t-SNE has no meaningful global geometry.

UMAP vs t-SNE:
- UMAP preserves more global structure, is much faster, and can place new points. t-SNE cannot embed new data without refitting.

Biggest mistake:
- Treating a t-SNE plot as proof that clusters are well separated in the original space, or feeding t-SNE coordinates into a downstream model.`},{front:"Backpropagation",back:`The algorithm that computes all of a network's gradients efficiently, by applying the chain rule BACKWARDS through the computation graph and reusing intermediate results.

Mechanism:
- The forward pass caches activations.
- The backward pass multiplies local Jacobians, layer by layer.
- Without this reuse, computing gradients numerically would cost one forward pass PER PARAMETER — completely infeasible.

Memory consequence:
- Activations must be stored for the backward pass, so memory scales with depth × batch size. Gradient checkpointing trades compute for memory by recomputing them.`},{front:"Activation functions and the dying ReLU",back:`The non-linearity between layers — without one, a deep net collapses to a single linear map.

- Sigmoid / tanh SATURATE: their gradient approaches zero for large |x|, a primary cause of vanishing gradients in deep nets.
- ReLU = max(0, x): cheap, non-saturating for positive inputs, induces sparsity. It made deep nets trainable.

Dying ReLU:
- A unit pushed to always-negative pre-activation outputs 0 with gradient 0 FOREVER — it can never recover. Often triggered by too high a learning rate.

Fixes:
- Leaky ReLU / ELU / GELU keep a small negative slope. GELU is standard in transformers.`},{front:"Vanishing and exploding gradients",back:`A gradient in a deep net is a product of many per-layer terms.
- If those terms are consistently < 1, the product decays toward zero (vanishing).
- If consistently > 1, it blows up (exploding).

Symptoms:
- Early layers stop learning (vanishing), or the loss goes NaN (exploding).

Fixes:
- Non-saturating activations (ReLU family).
- Careful initialisation — Xavier for tanh, He for ReLU — keeping activation variance stable across layers.
- Normalisation layers.
- RESIDUAL CONNECTIONS, which give gradients a direct path — the key enabler of very deep nets.
- Gradient clipping for the exploding case.`},{front:"Batch norm vs layer norm",back:`Both rescale activations to keep them well-behaved, but along different axes:
- Batch norm normalises each feature ACROSS THE BATCH.
- Layer norm normalises across FEATURES within each individual example.

Why the distinction matters:
- Batch norm depends on batch statistics, so it behaves differently at train vs inference (it uses running averages), degrades with small batches, and is awkward for variable-length sequences.
- Layer norm has no batch dependence at all — which is why transformers use it.

Why it helps:
- Originally credited to reducing "internal covariate shift"; the better-supported explanation is that it SMOOTHS the loss landscape, allowing higher learning rates.`},{front:"Dropout",back:`During training only, randomly set a fraction p of activations to zero on each forward pass.

Mechanism:
- Prevents co-adaptation — no unit can rely on any specific other unit being present.
- Approximates training an exponentially large ensemble of subnetworks that share weights.

At inference:
- Dropout is OFF, and activations are scaled (or scaled during training instead, with "inverse dropout") so expected magnitudes match.

Gotchas:
- Forgetting model.eval() in PyTorch leaves dropout active → random predictions.
- Dropout interacts poorly with batch norm; modern architectures often use one or the other.`},{front:"CNNs: convolution, weight sharing, receptive field",back:`A small kernel of weights slides across the input, so the SAME weights detect a pattern wherever it appears — translation equivariance, and far fewer parameters than a dense layer.

Three structural priors it bakes in:
- Locality: nearby pixels are related.
- Weight sharing: patterns are position-independent.
- Hierarchy: edges → textures → parts → objects.

Receptive field:
- The region of input that influences one output unit. It grows with depth, kernel size, stride and dilation.
- If it is smaller than the object you care about, the network structurally cannot see the whole thing.

Pooling:
- Adds a little invariance and shrinks the spatial dimensions.`},{front:"RNNs and LSTMs",back:`An RNN carries a hidden state from one timestep to the next, sharing weights over time.
- Problem: repeatedly multiplying by the same weight matrix causes vanishing / exploding gradients over long sequences.

LSTM fix:
- A CELL STATE with ADDITIVE updates, plus gates (forget, input, output) that control what flows in and out.
- Because the cell state is updated additively rather than multiplicatively, gradients flow across many steps without decaying.

GRU:
- Merges gates, fewer parameters, often comparable performance.

Why transformers replaced them:
- RNNs are inherently SEQUENTIAL and cannot parallelise across time, which caps training throughput.`},{front:"Attention and transformers",back:`Attention(Q, K, V) = softmax(QKᵀ / √d)·V. Each position produces a query, compares it to every position's key, and takes a weighted sum of their values.

Why the √d:
- Without it, dot products grow with dimension, pushing the softmax into saturation where gradients vanish.

Key advantages:
- Any two positions are ONE step apart — no long-range decay.
- The whole sequence is processed in parallel.

Multi-head:
- Several attention subspaces in parallel, capturing different kinds of relation.

Costs:
- O(n²) in sequence length for both time and memory — the bottleneck behind FlashAttention and sparse / linear attention. Positional encodings are required, since attention alone is permutation-invariant.`},{front:"Embeddings",back:`Dense, low-dimensional vectors that represent discrete items (words, users, products), learned so that geometric closeness reflects semantic or behavioural similarity.

Why not one-hot:
- One-hot is huge, sparse, and treats every pair of items as equally dissimilar — it carries no notion of relatedness.

Mechanism:
- An embedding layer is just a lookup into a learned matrix — mathematically the same as multiplying a one-hot vector by a weight matrix, but implemented as indexing.

Sizing heuristic:
- Roughly the fourth root of the number of distinct values.

Gotcha:
- High-cardinality embeddings hold most of a recommender's parameters and can dominate memory.`},{front:"Transfer learning and fine-tuning",back:`Take a model pretrained on a large corpus and adapt it to your task. Early layers hold general features; later layers hold task-specific ones.

Strategy by data size:
- Very little data → freeze the backbone, train only a new head.
- More data → unfreeze progressively with a LOW learning rate, since large updates destroy pretrained features (catastrophic forgetting).

Why it works:
- Pretraining gives a far better starting point than random initialisation, so you need orders of magnitude less labelled data.

Modern variants:
- LoRA and adapters tune a small set of extra parameters, making fine-tuning cheap and letting many tasks share one base model.`},{front:"Cross-validation strategies — and when k-fold is wrong",back:`k-fold: split the data into k parts, train on k − 1, validate on the held-out one, rotate. Stratified k-fold preserves class proportions and is the default for classification.

When standard k-fold is INVALID:
- Time series — random folds let the model train on the future and predict the past. Use forward-chaining splits.
- Grouped data — multiple rows per user must stay in the same fold, or the model memorises the user. Use GroupKFold.

Gotcha:
- Any preprocessing fitted on the full dataset (scaling, imputation, feature selection) leaks validation information. Fit it INSIDE each fold, via a pipeline.`},{front:"Data leakage — the most expensive bug in ML",back:`Using information at training time that will not exist at prediction time. The result: brilliant offline metrics and a worthless production model.

Common sources:
- Scaling / imputing before the train-test split.
- Target encoding computed over all data.
- Features derived from the future (point-in-time violations).
- Duplicate rows spanning splits.
- An ID that happens to correlate with the label.

Tell-tale sign:
- Suspiciously high performance, or one feature with overwhelming importance.

Defence:
- Build every transform inside a pipeline fitted per fold. For temporal data, ask of each feature: "would I truly have known this at decision time?"`},{front:"Hyperparameter search: grid, random, Bayesian",back:`Ways to search the hyperparameter space:
- Grid: try every combination. Cost explodes exponentially with the number of hyperparameters.
- Random: sample combinations independently. Provably better than grid in high dimensions, because most hyperparameters barely matter and random search spends more distinct trials on the ones that do.
- Bayesian optimisation: build a surrogate model of the objective and pick the most promising next point. Sample-efficient; best when each run is expensive.
- Hyperband / ASHA: allocate compute adaptively, killing bad runs early — usually the best value in practice.

Gotcha:
- Tuning against the test set is leakage. Use a separate validation set or nested CV.`},{front:"Generative vs discriminative models",back:`Two ways to model the same classification problem:
- Discriminative: learn P(Y|X) directly (logistic regression, trees, most neural nets).
- Generative: learn P(X, Y) or P(X|Y)·P(Y), then apply Bayes' rule (Naive Bayes, GMMs, diffusion models, LLMs).

Trade-off:
- Discriminative usually wins on pure classification accuracy given enough data — it solves the easier problem directly.
- Generative converges faster with LITTLE data, can synthesise samples, handles missing features naturally, and supports anomaly detection via likelihood.

Rule of thumb:
- If you only need a decision boundary, modelling the full input distribution is wasted effort.`},{front:"Handling class imbalance in training",back:`Options when one class is rare:
- Class weights in the loss: cheapest, keeps the data intact.
- Oversample the minority: SMOTE interpolates synthetic points.
- Undersample the majority: discards data.
- Focal loss: down-weights easy examples so training focuses on hard ones.

Critical rule:
- Resample ONLY the training fold. Applying SMOTE before the split leaks synthetic points derived from validation data.

Gotcha:
- Any resampling distorts predicted probabilities, so calibration breaks. If probabilities matter, prefer class weights or recalibrate afterwards.

Often best:
- Do not resample at all — just move the decision THRESHOLD.`},{front:"No Free Lunch theorem",back:`Averaged over ALL possible problems, every learning algorithm performs identically. No learner is universally superior.

What it actually means:
- Real performance comes from an algorithm's INDUCTIVE BIAS matching the structure of your specific problem.
- CNNs beat MLPs on images because locality and translation equivariance are true of images — not because convolution is inherently better.

Practical takeaway:
- "Which model is best?" has no answer without the data.
- It justifies empirical benchmarking, and explains why boosted trees still beat deep nets on most tabular problems.`}]},f=[{front:"Training/serving skew",back:`The model sees differently-computed features in production than it did in training, so live performance silently falls short of offline metrics.

Common causes:
- Features computed by separate code paths (Spark for training, a Java service for serving).
- Different default / missing-value handling.
- Time-zone or unit mismatches.
- A training pipeline that had access to data arriving only after the decision point.

Detect:
- Log the actual features used at serving and compare their distributions to training.

Fix:
- Share ONE feature definition between both paths — the core motivation for a feature store.`},{front:"Feature store — what problem does it actually solve?",back:`A central system for defining, computing, storing and serving features. It has an offline store (historical, for training) and an online store (low-latency, for inference).

The two real problems it solves:
- Training/serving skew — one definition serves both paths.
- Point-in-time correctness — it can reconstruct feature values AS THEY WERE at each historical event.

Secondary benefit:
- Reuse of features across teams and models.

Gotcha:
- It is significant infrastructure. For one model with simple features it is overkill — the payoff comes with many models sharing features.`},{front:"Point-in-time correctness",back:`When building a training set, each feature must carry the value it HAD at the moment of the event — not its current value.

Why it is subtle:
- Joining a feature table naively attaches today's value to a year-old event, leaking the future into training. The model learns from information that did not exist at decision time and collapses in production.

Example:
- "customer_lifetime_value" attached to a purchase from last year already includes that purchase and everything after it.

Implementation:
- As-of joins on event timestamps, and versioned / append-only feature tables rather than mutable ones.`},{front:"Batch vs online (real-time) inference",back:`Two ways to produce predictions:
- Batch: precompute predictions on a schedule, store them, serve by lookup. Cheap, simple, trivially scalable; lookup latency is microseconds.
- Online: compute on request. Needed when inputs are only known at request time or freshness matters.

Choose batch when:
- The input space is enumerable and predictions stay valid for hours (churn scores, weekly recommendations).

Choose online when:
- Inputs include real-time context (current session, search query, live pricing).

Hybrid is common:
- Precompute expensive embeddings / candidates in batch, do light ranking online.`},{front:"Model registry and versioning — what must be versioned?",back:`Reproducibility needs FOUR things versioned together: code, data, model artefact, and environment. Versioning only the model weights is not enough.

What a registry stores:
- Model versions plus metadata: training data snapshot, hyperparameters, metrics, lineage, and stage (staging / production / archived).

Why it matters operationally:
- Rollback needs the exact previous artefact.
- Incident investigation needs to know precisely what was serving at a given time.

Gotcha:
- "We can just retrain it" is not reproducibility — nondeterminism in sampling, GPU ops and library versions means you will not get the same model back.`},{front:"Shadow deployment",back:`Run the new model alongside the current one on real production traffic, log its predictions, but DO NOT serve them to users.

What it validates:
- Latency and resource use under real load.
- No crashes on real inputs.
- How its prediction distribution compares to the incumbent.

What it CANNOT validate:
- Business impact — nobody sees the outputs, so there is no feedback on whether the new model would have changed user behaviour.

How to use it:
- As the safety gate before a canary, not as a substitute for an A/B test.

Cost:
- Doubles inference compute for the shadow period.`},{front:"Canary release vs blue-green vs A/B test",back:`Three rollout patterns that get conflated:
- Canary: route a small share of traffic (1-5%) to the new version, watch health metrics, ramp up gradually. Optimised for LIMITING BLAST RADIUS.
- Blue-green: two full environments; switch all traffic at once. Instant rollback, but doubles infrastructure and exposes everyone simultaneously.
- A/B test: randomised assignment with statistical analysis. Optimised for MEASURING EFFECT, not safety.

The distinction interviewers probe:
- Canarying answers "is it broken?"
- A/B testing answers "is it better?"
- Mature systems use both in sequence.`},{front:"Data drift vs concept drift — and why the difference matters",back:`Two kinds of change after deployment:
- Data (covariate) drift: the input distribution P(X) changes.
- Concept drift: the relationship P(Y|X) changes.

Why the distinction is operationally critical:
- Data drift may be harmless — if the model handles the new region well, accuracy is fine.
- Concept drift ALWAYS degrades the model, because what it learned is now wrong.

Consequence:
- Drift alerts on inputs are a leading indicator, not proof of damage. Alerting on every input shift produces alert fatigue.

Detect:
- PSI or KS tests on features for data drift; performance monitoring against delayed labels for concept drift.`},{front:"Population Stability Index (PSI) and KS test for drift",back:`Two ways to quantify how far a distribution has moved from a baseline:
- PSI = Σ (actual% − expected%) · ln(actual% / expected%) over bins.
- KS test: the maximum gap between two cumulative distribution curves.

PSI rules of thumb:
- < 0.1: no meaningful shift.
- 0.1-0.25: moderate, investigate.
- > 0.25: significant shift.

Gotcha:
- KS with large n flags statistically significant but practically irrelevant differences — use the effect size, not just the p-value.

Practical notes:
- Monitor the PREDICTION distribution too — it rolls all input drift into one signal.
- Watch categorical features for new unseen categories, a common silent breakage.`},{front:"Ground truth delay and the feedback loop in monitoring",back:`Labels usually arrive long after predictions — days for conversions, months for loan defaults, sometimes never.

Consequence:
- You cannot monitor accuracy in real time, so you need PROXY signals meanwhile: input drift, prediction drift, and business KPIs.

Worse — the label can depend on the model's own action:
- If you decline a loan you never learn whether it would have defaulted, so your training data only ever covers approvals.

Mitigate:
- Reserve a small randomised holdout that bypasses the model, giving unbiased ground truth. It costs a little revenue and is often the only path to unbiased evaluation.`},{front:"Retraining strategy — cadence vs trigger",back:`Two ways to decide when to retrain:
- Scheduled: retrain on a fixed cadence. Simple and predictable, but arbitrary — retrains when nothing changed, lags when something did.
- Triggered: retrain on drift detection or a performance drop. Responsive, but needs reliable monitoring and can thrash.

Questions that matter more than the schedule:
- What training window — all history, or recent only?
- Warm start, or from scratch?
- Who approves promotion?
- Is there an automatic rollback if the new model underperforms?

Gotcha:
- Automated retraining on contaminated data will faithfully automate the contamination. Always gate on validation against a trusted holdout.`},{front:"Latency budget: p50 vs p95 vs p99",back:`Always measure percentiles, never the mean — latency distributions are right-skewed, so the mean hides the tail users actually feel.

Why p99 dominates design:
- If a page makes 10 backend calls, the chance at least one hits the p99 tail is roughly 1 − 0.99¹⁰ ≈ 10%. Tail latency COMPOUNDS across a fan-out.

Budget breakdown:
- Feature fetch + model compute + network + serialisation.

Levers:
- Caching, smaller / quantised models, batching, and cutting feature-store round trips.`},{front:"Dynamic batching for inference",back:`Queue incoming requests for a few milliseconds and run them as one batch to exploit GPU parallelism.

The trade-off:
- Throughput up, per-request latency up (each request waits for the batch to fill or the timeout to expire).
- Tuned by max batch size and max wait time.

Why it works:
- GPUs are badly underused at batch size 1 — kernel launch and memory transfer dominate, so a batch of 32 often costs barely more wall-clock time than a batch of 1.

When NOT to use it:
- Strict low-latency paths where the added queueing delay breaks the budget.
- Genuinely low traffic where batches never fill.`},{front:"Quantization",back:`Represent weights / activations in lower numeric precision: FP32 → FP16 / BF16 → INT8 → INT4.

Gains:
- Memory scales down roughly linearly, and low-precision arithmetic is faster on supporting hardware. INT8 typically gives ~4× smaller models with minimal accuracy loss.

Two approaches:
- Post-training quantization: fast, no retraining, small accuracy drop.
- Quantization-aware training: simulates quantization during training, recovering most of the loss — needed for aggressive bit widths.

Gotcha:
- Accuracy loss is uneven — outlier activations are what break naive quantization, which is why per-channel scales and outlier-aware schemes exist.`},{front:"Knowledge distillation and pruning",back:`Two ways to shrink a model:
- Distillation: train a small "student" to match a large "teacher's" outputs. Crucially it matches the SOFT probability distribution, not just hard labels — the relative probabilities of wrong classes carry "dark knowledge" about similarity structure, which is why the student beats one trained on labels alone.
- Pruning: remove weights or whole structures. Unstructured pruning gives high sparsity but needs special hardware to pay off; structured pruning (whole channels / heads) yields real speedups on ordinary hardware.

Use together with quantization — they compound.`},{front:"Caching in ML serving — what and where",back:`Three cache layers:
- Prediction cache: same input → same output.
- Feature cache: avoid repeated feature-store lookups.
- Embedding cache: keep hot items in memory.

When a prediction cache works:
- Repeated identical inputs, and outputs stable over the TTL. It fails when inputs include a timestamp or session context, since the hit rate collapses.

Critical gotcha:
- A cache must be INVALIDATED ON MODEL DEPLOY, or you serve the old model's predictions after shipping a new one — a genuinely common, confusing production bug.

Also watch:
- Cache stampede on expiry, and stale features producing inconsistent decisions.`},{front:"Graceful degradation and fallbacks",back:`When the model or its dependencies fail, the product must still work.

Fallback ladder, in order:
- Full model → simpler / cached model → heuristic or popularity baseline → static default. Never a 500 error.

Design requirements:
- Timeouts on every dependency (especially feature fetches).
- Circuit breakers to stop hammering a failing service.
- Defaults for missing features that the model was actually trained to handle.

Gotcha:
- Silent fallbacks are dangerous. If you do not ALERT when the fallback engages, you can serve the popularity baseline for weeks while metrics quietly sag and nobody notices.`},{front:"CI/CD for ML — how it differs from software CI/CD",back:`Ordinary CI/CD tests code. ML pipelines must also validate DATA and MODEL behaviour, because the code can be correct while the model is broken.

Additional gates:
- Schema and data-quality checks.
- Training reproducibility.
- Model performance above a threshold on a trusted holdout.
- Per-SEGMENT performance (to catch regressions hidden by aggregates).
- Fairness / bias checks.
- Latency and size limits.

The deeper difference:
- The artefact depends on data that changes independently of any commit — so a pipeline can start producing worse models with zero code changes. Continuous training needs continuous validation.`},{front:"Rollback strategy for models",back:`Requirements:
- The previous model artefact retained and immediately loadable.
- Automated health checks that can trigger the rollback.
- Feature-pipeline compatibility with the old version.

The hard part people miss:
- If the new model changed the FEATURE SCHEMA, rolling back the model alone breaks — you must roll back the feature pipeline too. Model and features must be versioned and rolled back TOGETHER.

Also:
- Caches must be invalidated on rollback.
- Any downstream system that stored the new model's outputs may need reprocessing.

Rehearse it — an untested rollback path is not a rollback path.`},{front:"Monitoring an ML system: what to actually alert on",back:`Four layers:
- SYSTEM — latency p99, error rate, throughput, saturation.
- DATA — schema violations, null rates, unseen categories, feature drift.
- MODEL — prediction distribution shift, confidence distribution, and accuracy once labels land.
- BUSINESS — the KPI the model exists to move.

Alerting discipline:
- Page on system and business metrics.
- Make drift a ticket, not a page — drift is noisy and usually not urgent.

Most valuable single signal:
- Prediction distribution shift — available immediately, needs no labels, and rolls every upstream problem into one number.`},{front:"Model explainability in production: SHAP and LIME",back:`Two ways to attribute a single prediction to its features:
- SHAP: uses Shapley values from cooperative game theory — the unique attribution satisfying efficiency, symmetry and additivity. TreeSHAP computes it exactly and fast for tree ensembles.
- LIME: fits a simple local surrogate model around one prediction. Faster but less stable — repeated runs can give different explanations.

Production uses:
- Regulatory requirements (adverse-action notices), debugging, and trust.

Gotcha:
- SHAP shows what the MODEL used, not what CAUSES the outcome. With correlated features, attribution splits arbitrarily among them. It is not causal evidence.`},{front:"Reproducibility: sources of nondeterminism",back:`Where two "identical" training runs diverge:
- Random seeds (init, shuffling, dropout, augmentation).
- GPU non-determinism — atomic float ops reduce in a nondeterministic order.
- Library and driver versions.
- Data ordering.
- Parallel / distributed reduction order.

Controls:
- Set seeds for every RNG (Python, NumPy, framework), enable deterministic-algorithm flags, pin all dependency versions, containerise, and snapshot / version the training data.

Cost:
- Deterministic GPU kernels can be meaningfully slower — a real trade-off.

Why it matters:
- Without reproducibility you cannot attribute a metric change to your code change rather than to noise.`},{front:"Cost per inference — and where the money actually goes",back:`Levers:
- Model size and precision, hardware choice, batch size, cache hit rate, and autoscaling policy.

CPU vs GPU:
- GPUs win on large batches and big models.
- For small models at low QPS, CPU is often cheaper because the GPU sits idle — idle GPU time is the usual source of waste.

Big structural lever:
- Move work from online to BATCH wherever freshness permits — precomputed predictions are orders of magnitude cheaper than per-request inference.

Watch:
- Scale-to-zero introduces cold starts (model loading can take tens of seconds), trading cost against tail latency.`},{front:"Autoscaling ML services — why it is harder than for stateless apps",back:`Complications:
- Model loading makes cold starts slow (seconds to minutes).
- GPU nodes are expensive and scarce.
- Memory footprint is large and fixed.

Scaling signal:
- CPU utilisation is a poor proxy for a GPU service. Prefer queue depth, request concurrency, or inference latency.

Tactics:
- Keep a warm pool for baseline traffic and scale burst capacity on top.
- Pre-load models at container start, with a readiness probe that only passes AFTER the model is loaded — otherwise traffic routes to a pod that cannot serve it.

Gotcha:
- Aggressive scale-down thrashes; use stabilisation windows.`},{front:"Online/offline consistency checking",back:`A continuous test that the production path reproduces the training path: take logged serving inputs, re-run them through the offline pipeline, and compare predictions.

What it catches:
- Training/serving skew, feature-pipeline bugs, version mismatches, and silent library upgrades that alter behaviour.

How to run it:
- Sample a small fraction of live traffic, recompute offline, and alert when the mismatch rate crosses a threshold.

Why it is worth the effort:
- Skew bugs are silent — no error is thrown, metrics degrade gradually, and without this check they are typically found weeks later, if ever.`},{front:"Multi-model serving and model routing",back:`Patterns:
- One model per user segment or region.
- Ensembles combining several models.
- Cascades: a cheap model first, escalating uncertain cases to an expensive one.
- Champion / challenger for continuous evaluation.

Cascade economics:
- If a cheap model confidently handles 90% of traffic, average cost collapses while accuracy on hard cases is preserved — one of the highest-leverage serving optimisations.

Operational cost:
- Many models multiply the monitoring, retraining and rollback surface. Each variant needs its own drift tracking and performance baseline — which is why per-segment models are easy to launch and painful to maintain.`},{front:"Containerisation and dependency pinning for ML",back:`Containers package code, dependencies, system libraries and CUDA runtime so the environment is identical across dev, CI and production.

ML-specific pain:
- Images are huge (multi-GB with CUDA), builds are slow, and dependency resolution is fragile — framework, CUDA, driver and cuDNN versions form a tightly coupled matrix.

Practices:
- Pin EXACT versions (never a floating tag or unpinned pip install).
- Use multi-stage builds to strip build tooling.
- Keep model weights OUT of the image so one image serves many model versions.

Gotcha:
- "latest" tags make deployments unreproducible and turn rollback into guesswork.`},{front:"Preventing feedback loops in deployed models",back:`The model influences the data that trains its successor, so errors and biases compound over generations of retraining.

Examples:
- A fraud model that declines a segment never observes their good behaviour.
- A recommender that never surfaces an item never learns it was good.
- Predictive policing directing patrols to areas it already flagged.

Detection:
- Monitor whether the training distribution is narrowing over time — coverage, entropy, and share of traffic to the top items.

Mitigations:
- Randomised exploration holdouts, propensity logging with IPS correction, and periodically training on data from a randomised slice rather than model-selected traffic.`}],g=[{front:"Model server vs embedded model",back:`Two ways to run a model in an application:
- Embedded: the model runs inside the app process (load the artefact, call predict).
- Model server: a separate service the app calls over the network (TF Serving, TorchServe, Triton, KServe).

Why separate it:
- Independent scaling and hardware (app on CPU, model on GPU).
- One model shared by many services.
- Model updates without redeploying the app.

Cost of separating:
- A network hop of added latency, plus serialisation and a service to operate.

Rule of thumb:
- Embed for tiny models on the hot path where latency is precious.
- Use a server once the model needs a GPU, is shared, or is updated on its own cadence.`},{front:"REST vs gRPC for model serving",back:`Two API styles:
- REST / JSON: human-readable, universally supported, easy to debug.
- gRPC: binary protobuf over HTTP/2, with streaming and multiplexing.

Why gRPC wins internally:
- Protobuf is far more compact than JSON, so serialising large tensors is much cheaper.
- HTTP/2 multiplexing avoids head-of-line blocking.
- For a high-QPS embedding or feature payload the encoding cost alone is significant.

When REST is fine:
- Low QPS, small payloads, public or browser-facing APIs, or when debuggability matters more than microseconds.

Gotcha:
- JSON cannot represent raw binary efficiently — base64 inflates tensors ~33% and adds encode / decode cost on both ends.`},{front:"Inference graph optimisation (ONNX, TensorRT, torch.compile)",back:`Convert a trained model into an optimised execution graph: fuse operators, fold constants, pick fast kernels, and specialise for the target hardware.

Mechanism:
- Operator FUSION is the big win — conv + bias + ReLU becomes one kernel, cutting memory round-trips.
- Constant folding precomputes anything not input-dependent.

Tools:
- ONNX as a portable interchange format; TensorRT for NVIDIA GPUs; ONNX Runtime cross-platform; torch.compile / XLA graph capture.

Gotchas:
- Dynamic shapes defeat many optimisations — some engines specialise per shape, so variable batch sizes trigger recompiles.
- Numerical results can differ slightly from the training framework, so re-validate accuracy after conversion.`},{front:"ONNX as an interchange format",back:`A framework-agnostic graph format. Export from PyTorch / TF / sklearn, run anywhere with an ONNX runtime.

Why it helps:
- Decouples training framework from serving runtime. You can train in PyTorch and serve with a lean C++ runtime that has no Python and no PyTorch dependency, cutting image size and cold start.

Gotchas:
- Not every operator or custom layer has an ONNX equivalent, so exotic models fail to export or fall back to slow paths.
- Opset version mismatches between exporter and runtime cause subtle failures.
- Control flow (loops, conditionals) exports poorly.

Always:
- Re-run your eval set through the exported model — export is a re-implementation and can silently change outputs.`},{front:"Cold start in model serving",back:`The first request after a new instance spins up is slow because the model must be loaded into memory (and onto the GPU), the runtime initialised, and caches warmed.

Why it bites:
- Loading a multi-GB model can take tens of seconds. With scale-to-zero or autoscaling, real user requests hit cold instances and see huge tail latency.

Mitigations:
- A readiness probe that passes only AFTER the model is loaded (so traffic never routes to a not-ready pod).
- A warm pool of pre-loaded instances for baseline traffic.
- Model warmup — a synthetic request to trigger lazy GPU allocation and kernel compilation.
- mmap / lazy weight loading.

Gotcha:
- Scale-to-zero saves money but reintroduces cold starts — a direct cost / latency trade.`},{front:"Model warmup",back:`Sending synthetic requests to a freshly loaded model before it takes real traffic.

Why it is necessary:
- The first real inference triggers one-time costs — lazy CUDA context creation, JIT kernel compilation, cuDNN autotuning, cache population. Without warmup, the first users eat all of it as latency.

How:
- Run representative inputs (including the shapes and batch sizes you expect) at startup, gated behind the readiness probe so traffic waits.

Gotcha:
- Warm with the ACTUAL production shapes. If you warm with batch size 1 but serve batch 32, the batch-32 kernels compile on the first real batch and that request is slow anyway.`},{front:"GPU utilisation and why batch size 1 wastes the GPU",back:`A GPU is a massively parallel device; a single small request leaves most of its compute idle while kernel-launch and memory-transfer overhead dominate.

Mechanism:
- Throughput rises with batch size until the GPU saturates, so a batch of 32 often costs barely more wall-clock time than a batch of 1.
- Serving at batch 1 can waste 90%+ of the hardware you are paying for.

Levers:
- Dynamic batching to fill batches.
- MPS or time-slicing to share one GPU across processes.
- MIG to partition a GPU into isolated instances.

Gotcha:
- Measure GPU utilisation, not just CPU. A GPU service can show low CPU and still be the bottleneck — or be paid-for and idle.`},{front:"Multi-tenancy on GPUs (MPS, MIG, time-slicing)",back:`Sharing one physical GPU across multiple models or tenants to raise utilisation.

Options:
- TIME-SLICING: interleaves work. Simple, but no isolation — one tenant can starve another.
- MPS (Multi-Process Service): runs kernels from several processes concurrently for better throughput.
- MIG: partitions the GPU into hardware-isolated instances with dedicated memory and compute.

Trade-off:
- MIG gives predictable isolation but fixed partition sizes waste capacity.
- MPS packs better but leaks interference.
- Time-slicing is cheapest and least safe.

When it matters:
- Many small models that each underuse a full GPU. Consolidating them is often the biggest single cost saving in ML serving.`},{front:"Throughput vs latency — the fundamental serving trade-off",back:`Optimising one usually hurts the other.
- Batching raises throughput (requests / sec) but adds queueing latency.
- Small batches cut latency but waste hardware.

Mechanism:
- They answer different questions. Latency is per-request wall time; throughput is aggregate work per unit cost. A batch-serving pipeline maximises throughput; a real-time API is latency-bound.

How to reason:
- Set a latency SLO (p99), then maximise throughput WITHIN that budget — tune max batch size and max wait time so the batch either fills or times out before the budget is spent.

Gotcha:
- Reporting mean latency hides the queueing tail that batching creates. Hold the SLO on p99.`},{front:"Mixed-precision and lower-precision inference",back:`Run inference in FP16 / BF16 instead of FP32: half the memory, and much faster matmuls on tensor-core hardware.

BF16 vs FP16:
- BF16 keeps FP32's exponent RANGE (fewer overflow / underflow issues) at the cost of mantissa precision.
- FP16 has more precision but a narrow range that can overflow.
- BF16 is usually the safer default for inference.

Why it is nearly free:
- Inference tolerates low precision far better than training — there is no gradient accumulation to destabilise.

Gotchas:
- Some ops (softmax, layernorm, reductions) still need FP32 for numerical stability — hence "mixed" precision.
- Validate accuracy; occasionally a layer is precision-sensitive.`},{front:"Model loading: memory-mapping and lazy loading",back:`Loading a large model naively reads the whole file into process memory, which is slow and duplicates it per process.

- mmap: map the weights file into the address space so the OS pages them in on demand and SHARES one copy across processes via the page cache. Multiple workers on a box then share physical memory instead of each holding a full copy.
- Lazy loading: bring layers into GPU memory only as needed, enabling models larger than a single device via offloading.

Gotcha:
- mmap makes the FIRST access to each page a disk read, so cold latency shifts into early requests — pair it with warmup.
- Offloading to CPU / disk trades memory for large latency hits.`},{front:"Concurrency model: sync, async, and worker pools",back:`A serving process must handle many in-flight requests. The model call is often GPU-bound (releases the GIL) while I/O — feature fetches, network — is waiting.

Patterns:
- A thread / worker pool sized to the hardware.
- ASYNC I/O so feature fetches and downstream calls do not block a worker.
- A dedicated inference thread or process that batches across concurrent requests.

Key point:
- Separate the I/O-bound part (async, high concurrency) from the compute-bound inference (batched, bounded by hardware). Conflating them wastes both.

Gotcha:
- Too many worker processes each loading the model exhausts GPU memory; too few underutilise it. The right count balances GPU memory against concurrency.`},{front:"Serverless inference — when it fits and when it does not",back:`Fully managed, scale-to-zero, pay-per-request functions running the model.

Fits:
- Spiky or low traffic, where paying for idle instances dominates cost, and where occasional cold-start latency is acceptable.

Does NOT fit:
- Steady high traffic (always-on is cheaper).
- Strict low-latency paths (cold starts, no warm GPU).
- Large models (load time and memory limits).

Gotchas:
- GPU support is limited and expensive on serverless.
- The model artefact must fit deployment size limits or be fetched at cold start (adding seconds).
- Per-request billing can exceed provisioned cost above a surprisingly low QPS.

Decision:
- Estimate cost at your real QPS both ways — the crossover is often lower than expected.`},{front:"Ensemble and DAG serving (inference pipelines)",back:`Real predictions often chain steps: preprocess → embed → model → business-rules post-process, sometimes across several models.

Approaches:
- An inference graph / ensemble in the server (Triton ensembles, KServe inference graphs) runs the DAG close to the hardware, avoiding network hops between stages.
- Alternatively an orchestration service calls each stage.

Why in-server helps:
- Intermediate tensors stay on-device instead of being serialised across the network between every step.

Gotchas:
- A chain is only as fast as its slowest stage, and each stage is a failure point — you need per-stage timeouts and fallbacks.
- Version the WHOLE graph, since changing one stage changes end-to-end behaviour.`},{front:"Preprocessing parity — the tokeniser/transform trap",back:`The exact preprocessing used in training must run identically at serving: tokenisation, normalisation, image resizing, categorical encoding.

Why it silently breaks:
- Training preprocessing is often Python / pandas, while serving may be a different language or library. A different resize interpolation, a mismatched normalisation constant, or a tokeniser version bump shifts inputs subtly — accuracy drops with no error.

Fixes:
- Package preprocessing WITH the model (as graph ops, or a shared library both paths use).
- Pin exact versions.
- Add an online / offline consistency check on the TRANSFORMED features, not just raw inputs.

Gotcha:
- This is training/serving skew hiding in the preprocessing layer — the most common place it lurks.`},{front:"Edge and on-device inference",back:`Running the model on the user's device (phone, browser, IoT) instead of a server.

Why:
- Near-zero network latency, privacy (data never leaves the device), offline capability, and no per-request server cost.

Costs:
- Tight compute / memory / battery budgets force heavy compression (quantisation, pruning, distillation).
- You cannot easily update the model or gather centralised labels.
- Device heterogeneity means many hardware targets.

Tooling:
- TF Lite, Core ML, ONNX Runtime Mobile, WebGPU / WASM in the browser.

Gotcha:
- Shipping the model to the client means it can be extracted and reverse-engineered — do not put anything secret in on-device weights, and expect the model itself to leak.`}],y=[{front:"Streaming vs batch feature computation",back:`Two ways to compute features:
- Batch: recompute on a schedule over the warehouse. Cheap, simple, high latency to freshness.
- Streaming: update event-by-event as data arrives. Fresh, but complex and stateful.

Choose by FRESHNESS need:
- "User's 30-day spend" is fine hourly.
- "Items viewed in this session" must be streaming.

Mechanism:
- The hard part of streaming is maintaining aggregations (windowed counts, running sums) with correct state, out-of-order events, and exactly-once semantics.

Gotcha:
- Computing a feature one way for training (batch backfill) and another for serving (streaming) is a classic source of training/serving skew — the two code paths drift apart.`},{front:"Feature freshness and staleness SLAs",back:`How recent a feature value is when the model reads it. Every online feature has an implicit or explicit freshness SLA.

Why it matters:
- A fraud model reading an hour-old "transactions in last 5 minutes" is blind to the attack in progress.
- A recommender reading yesterday's session context recommends stale intent.

Mechanism:
- Freshness is bounded by the pipeline — batch cadence, streaming lag, and cache TTL all add staleness.

Monitor it:
- Track feature timestamp vs serving time, and alert on staleness. A stalled pipeline that silently serves old features is worse than an error — predictions keep flowing and look fine.`},{front:"Backfilling features and point-in-time correctness",back:`To build a training set you must reconstruct each feature's value AS IT WAS at each historical event — not its current value.

Why naive backfill leaks:
- Joining today's feature table to old events attaches future information (a "lifetime value" that already includes the outcome you predict), giving great offline metrics and a broken production model.

Implementation:
- Append-only / versioned feature tables and AS-OF joins on event timestamps, so each label row gets the feature snapshot valid just before it.

Gotcha:
- Even the streaming pipeline's own lag must be modelled — if a feature was actually available 10 minutes late in production, the training set should reflect that delay, not instantaneous availability.`},{front:"Data validation in pipelines (schema and distribution checks)",back:`Automated checks that incoming data matches expectations BEFORE it trains or serves a model.

Two layers:
- SCHEMA — types, required fields, allowed categories, ranges. Catches structural breakage.
- DISTRIBUTION — means, null rates, cardinality, drift vs a baseline. Catches silent semantic shifts.

Tools:
- Great Expectations, TFDV, Deequ, or custom assertions in the DAG.

Why it is essential:
- Upstream teams change schemas without telling you, an ETL job half-fails, a unit changes from cents to dollars. Without validation the model trains on or serves garbage and degrades quietly.

Gotcha:
- An unseen categorical VALUE (not a schema change) is a common silent breaker — validate the value set, not just the type.`},{front:"Data contracts",back:`An explicit, enforced agreement between a data producer and its consumers about schema, semantics, freshness, and quality.

Why MLOps needs them:
- Models depend on upstream tables owned by teams who do not know a model consumes them. A "harmless" refactor — renaming a column, changing an enum, altering a unit — silently breaks the model.

How:
- Version the schema, validate producer output against the contract in CI, and treat a breaking change as an API change requiring migration.

Gotcha:
- Without contracts, data-lineage failures are discovered downstream as model degradation days later — far from the actual change. Contracts move the failure to the producer's deploy, where it is cheap to fix.`},{front:"Idempotency in data pipelines",back:`Re-running a pipeline step with the same input produces the same result and no duplicate side effects.

Why it is essential:
- Pipelines fail and retry constantly. A non-idempotent step that APPENDS on each run double-counts on retry, corrupting features and labels.

How:
- Use deterministic keys and UPSERT / overwrite-by-partition instead of blind append; make writes keyed so a replay overwrites rather than duplicates.

Gotcha:
- Idempotency plus at-least-once delivery gives you effectively-exactly-once results without expensive true exactly-once machinery. If a step is idempotent, at-least-once delivery is safe.`},{front:"Exactly-once vs at-least-once vs at-most-once",back:`Delivery guarantees for streaming / event systems:
- At-most-once: may drop events. Fast, lossy.
- At-least-once: never drops, may DUPLICATE. Safe if consumers are idempotent.
- Exactly-once: no loss, no duplicates. Expensive — needs coordinated state and offsets.

Practical stance:
- True exactly-once is costly, so most systems use AT-LEAST-ONCE delivery with IDEMPOTENT consumers, which yields exactly-once EFFECTS without the overhead.

Why it matters for ML:
- Duplicated events inflate count features and label counts; dropped events silently bias them. Both corrupt the model, neither throws an error.

Gotcha:
- "Exactly-once" claims usually mean exactly-once processing within one system, not end-to-end across sinks.`},{front:"Late-arriving data and watermarks",back:`Events often arrive out of order and late (mobile buffering, network delays, batch uploads).

Watermark:
- The streaming system's estimate of "we have probably seen all events up to time T", used to decide when to close a window and emit its aggregate.

The trade-off:
- Wait longer (later watermark) to capture stragglers and be more correct, or emit sooner and be fresher but miss late events.

Gotcha:
- Data arriving after the watermark is either dropped or triggers a costly recomputation of an already-emitted result. In ML this means a feature value computed at serving time can differ from the same feature backfilled later — a subtle skew.
- "Allowed lateness" bounds this trade explicitly.`},{front:"Pipeline orchestration and DAGs",back:`Workflow schedulers (Airflow, Dagster, Prefect, Kubeflow) model pipelines as DAGs of tasks with dependencies, scheduling, retries, and backfills.

What they give you:
- Dependency management (train only after features are built).
- Retries with backoff.
- Backfilling historical runs.
- Observability into what ran when.

MLOps specifics:
- Tasks are heterogeneous (SQL, Spark, GPU training, deployment) and long-running.
- Idempotency and data-aware scheduling (run when data lands, not just on a clock) matter more than in generic ETL.

Gotcha:
- Scheduling on a fixed CLOCK when upstream data is late trains on incomplete data. Prefer data-availability triggers (sensors) over pure cron.`},{front:"Materialised vs on-demand features",back:`Two ways to serve a feature:
- Materialised: precompute and store it, serve by lookup. Fast, but can be stale and costs storage.
- On-demand: compute at request time from raw signals. Always fresh, but adds serving latency and compute.

Decision:
- Materialise features that are expensive and slow-changing (a user's 90-day aggregate).
- Compute on-demand features that depend on request context (distance from current location, time since last event).

Mechanism:
- A classic space / time (and freshness / latency) trade. Feature stores support both, and one model often mixes them.

Gotcha:
- An on-demand feature must be computed identically in training and serving, or you reintroduce the skew that materialisation avoids.`},{front:"Label pipelines and delayed labels",back:`The ground-truth label often arrives long after the prediction — a conversion days later, a chargeback months later, a subscription renewal a year later.

Consequences:
- You cannot evaluate accuracy in real time.
- Building a training set needs an ATTRIBUTION WINDOW deciding how long to wait for a label before calling it negative.

Gotcha:
- Labelling "no conversion YET" as a hard negative mislabels recent events that simply have not converted, biasing the model against recent data. Delayed-feedback models treat unconverted recent events as CENSORED, not negative.

Design:
- Match the training-set cutoff to the attribution window, and exclude events too recent to have a stable label.`},{front:"Data lineage and provenance",back:`A record of where each dataset, feature, and model came from: which sources, transforms, code version, and run produced it.

Why it is essential in ML:
- When a model degrades or a feature looks wrong, lineage lets you trace back to the upstream change.
- When a data source is found corrupt or non-compliant, lineage identifies every downstream model that must be retrained.
- It also supports reproducibility and audit ("what data trained the model that made this decision?").

Gotcha:
- Lineage must span DATA and CODE and MODELS together. Tracking only code versions misses that the same code produced different models because the data changed underneath it.`},{front:"Feature versioning and the online/offline store",back:`A feature definition can change (new logic, new source), so features must be versioned like code, and training must use the version that will serve.

Online vs offline store:
- OFFLINE store holds full history for training (point-in-time correct).
- ONLINE store holds the latest value per entity for low-latency serving.
- Both are populated from ONE definition, to avoid skew.

Gotcha:
- Changing a feature's computation without versioning means models trained on the old logic run against the new logic in production — silent skew.
- Backfilling a new feature version into history requires recomputing it point-in-time correctly, not just applying today's logic to old data.`},{front:"Schema evolution and backward compatibility",back:`Data schemas change over time; pipelines and models must tolerate it without breaking.

Safe changes (backward compatible):
- Adding an optional field, widening a type.

Unsafe changes:
- Removing a field a model uses, renaming, changing a unit, narrowing a type, repurposing an enum value.

How to manage:
- Schema registries with compatibility rules, defaults for new / missing fields, and treating breaking changes as versioned migrations.

Gotcha for models:
- A model trained with a feature that later disappears receives nulls / defaults in production — if it was not trained to handle missing values, its behaviour on that feature is undefined. Feature removal is a model-breaking change, not just a data change.`},{front:"Training-data snapshotting and versioning",back:`Capturing the exact dataset a model was trained on, immutably, so the model can be reproduced and audited.

Why code versioning is not enough:
- The same training code produces different models when the data changes underneath it. Without a data snapshot, "just retrain it" does not reproduce the model.

Tools / approaches:
- DVC, LakeFS, Delta / Iceberg time travel, or content-addressed dataset hashes recorded in the model registry.

Gotcha:
- Snapshotting must be point-in-time correct — pin "the users table as of the training date", not the mutable current table. And the snapshot must be cheap (references / deltas), or teams skip it and lose reproducibility.`}],b=[{front:"The four layers of ML monitoring",back:`A mental model, ordered from fastest signal to most meaningful:
- SYSTEM — latency, error rate, throughput, saturation. Standard SRE metrics.
- DATA — schema violations, null rates, unseen categories, feature drift.
- MODEL — prediction distribution, confidence distribution, and accuracy once labels arrive.
- BUSINESS — the KPI the model exists to move.

Key insight:
- Signal availability is INVERSE to meaningfulness. System metrics are instant but say little about model quality; business metrics matter most but arrive slowest.

Alerting discipline:
- PAGE on system and business metrics.
- Make drift a ticket, not a page — it is noisy and rarely a live incident.`},{front:"Prediction drift as the first-line monitor",back:`Tracking the distribution of the model's OUTPUTS over time (predicted scores, class rates).

Why it is the single most valuable signal:
- Available immediately — no labels needed.
- AGGREGATES every upstream problem — input drift, a broken feature, a bad deploy — into one number.

What a shift means:
- Either the world changed (real) or your pipeline broke (bug). It does not distinguish them, but it tells you to look.

Gotcha:
- A stable prediction distribution does NOT guarantee correctness — a model can be confidently wrong in a stable way. Pair it with delayed accuracy.`},{front:"Monitoring performance without labels",back:`When ground truth is delayed or absent, you still need a health signal.

Proxy approaches:
- Prediction / confidence distribution shifts.
- Input drift metrics.
- A small human-labelled audit sample.
- More advanced: importance-weighting or model-based estimators that ESTIMATE accuracy under covariate shift from unlabelled production data.

Why it matters:
- Waiting for labels means discovering a broken model weeks late.

Gotcha:
- Label-free estimators assume P(Y|X) is unchanged (covariate shift only). Under CONCEPT drift — the relationship itself changing — they can report healthy while the model is quietly wrong, because they were calibrated on the old relationship.`},{front:"Embedding drift monitoring",back:`For models on text / images / users, monitor whether the distribution of EMBEDDINGS shifts over time.

Why:
- Raw high-dimensional inputs are hard to monitor directly, but their embeddings compress semantics into a trackable space.
- New topics, new user behaviour, or a new content type show up as movement in embedding space BEFORE accuracy drops.

How:
- Track summary statistics of embeddings, distances to reference centroids, or a drift metric (MMD, KL on projected dimensions) against a training baseline.

Gotcha:
- Retraining the embedding model changes the space and invalidates the baseline — re-baseline drift metrics on the new version, or they alarm on the model change itself.`},{front:"Out-of-distribution / novelty detection at serving",back:`Detecting inputs unlike anything in training, where the model's prediction is unreliable regardless of its confidence.

Why it matters:
- Models EXTRAPOLATE badly, and often do so with high confidence. An OOD input (a new language, a corrupted image, an attack) gets a confident, wrong answer.

Approaches:
- Distance to the training distribution in feature / embedding space.
- Density or reconstruction-error models.
- Ensemble disagreement.

What to do on OOD:
- Abstain, route to a fallback or human, or flag for review — do not serve a confident guess.

Gotcha:
- Softmax probability is NOT a reliable OOD signal — networks are systematically overconfident on OOD inputs. Use dedicated detectors.`},{front:"Silent failures in ML systems",back:`The defining hazard of ML in production: the system keeps returning predictions, throws no errors, and passes health checks — while quietly getting worse.

Examples:
- A feature pipeline serving stale values.
- An upstream unit change.
- A model degrading under drift.
- A preprocessing mismatch.
- A cache serving a previous model's outputs.

Why traditional monitoring misses it:
- HTTP 200s and normal latency look healthy. The failure is in the CONTENT of predictions, not their availability.

Defences:
- Monitor prediction and feature distributions (not just uptime), online / offline consistency checks, and a randomised labelled holdout. Assume the failure mode is silent degradation, not a crash.`},{front:"SLIs, SLOs, and error budgets for ML",back:`The reliability vocabulary:
- SLI: a measured indicator (p99 latency, prediction availability, feature freshness).
- SLO: the target (p99 < 200ms, 99.9% availability).
- Error budget: the allowed shortfall (0.1%), spent on risk.

ML-specific SLIs beyond uptime:
- Feature freshness, prediction-distribution stability, model accuracy (when labels arrive), fallback rate.

Why the budget framing helps:
- It makes the reliability / velocity trade explicit — budget intact → ship faster; budget exhausted → freeze and stabilise.

Gotcha:
- An accuracy SLO needs labels, which are delayed — so you monitor leading proxies against the SLO in the interim and reconcile when labels land.`},{front:"Logging predictions for audit and debugging",back:`Persisting each prediction with its inputs, model version, and timestamp.

Why essential:
- To debug a bad prediction you must reproduce the EXACT features and model that produced it.
- To compute delayed accuracy you join logged predictions to labels that arrive later.
- Compliance may require explaining any individual decision.

What to log:
- The TRANSFORMED features actually fed to the model (not just raw inputs — that is what catches skew), the model / version id, the score, and the request context.

Gotchas:
- Volume and cost — sample or aggregate high-QPS logs.
- PII in logged features — redact / hash.
- Logging RAW inputs but not TRANSFORMED features misses the most common bug class.`},{front:"Distributed tracing for ML pipelines",back:`Propagating a trace / correlation id through every hop of a request — gateway, feature fetches, preprocessing, model call, post-processing — so you can see where latency and errors occur.

Why ML needs it:
- An inference request fans out to multiple feature stores and possibly several models. When p99 latency spikes, tracing shows WHICH stage is responsible — often a slow feature fetch, not the model.

What it reveals:
- Per-stage latency breakdown, which dependency timed out, which fallback engaged.

Gotcha:
- Without tracing, "the model is slow" is unactionable. Model compute is frequently a small fraction of total latency, dominated by feature I/O and network hops.`},{front:"Alerting: pages vs tickets, and alert fatigue",back:`Not every anomaly deserves to wake someone. Over-alerting trains responders to ignore alerts, so real incidents get missed.

Discipline:
- PAGE on actionable, urgent, user-impacting problems — system down, error spike, business-metric cliff.
- TICKET (or dashboard) for drift, gradual degradation, and informational trends that need investigation but not at 3am.

Why ML tempts over-alerting:
- Drift signals are noisy and fire constantly; wiring them to pages guarantees fatigue.

Good alerts:
- Have a clear owner, a runbook, and a low false-positive rate. If an alert has no defined response, it should not page.`},{front:"Choosing a drift baseline and reference window",back:`Drift detection compares live data to a REFERENCE. The choice of reference decides what "drift" means.

Options:
- The TRAINING distribution — detects any divergence from what the model learned. The right baseline for model validity.
- A RECENT trailing window — detects sudden changes but treats slow drift as the new normal.

Gotcha:
- A trailing-window baseline slowly "accepts" gradual drift, so a model can degrade steadily while the drift monitor stays quiet — the baseline crept along with the data. For model-validity monitoring, anchor to the training distribution.

Also:
- Seasonality. Comparing Monday to Sunday flags false drift — compare like-for-like periods.`},{front:"Canary metrics and automated rollback triggers",back:`During a canary, watch a small set of health metrics and automatically halt / roll back if they regress.

What to watch:
- System health (errors, latency).
- Invariants (assignment ratios, guardrail metrics that must not move).
- A leading quality proxy where one is available fast.

Why automate:
- Humans watching dashboards miss regressions or react slowly; an automated trigger bounds the blast radius.

Gotchas:
- The trigger needs enough traffic / time to be statistically meaningful, or it fires on noise.
- It must account for novelty effects that make early metrics unrepresentative.
- Set thresholds from historical variability, not guesses.`},{front:"Feature attribution drift (monitoring WHY, not just WHAT)",back:`Beyond monitoring inputs and outputs, track whether the FEATURES DRIVING predictions have changed — e.g. average SHAP attributions per feature over time.

Why it adds signal:
- Input distributions can look stable while the model's RELIANCE on features shifts.
- A feature that was important can become constant (a broken pipeline serving a default), which output monitoring might miss.

Example:
- A feature silently pipes a null / default; its attribution collapses to zero. Attribution monitoring flags "the model stopped using feature X" even though predictions still flow.

Gotcha:
- Attribution is expensive to compute per request — sample it. And SHAP shows model reliance, not causation.`},{front:"Business-metric guardrails vs the optimisation target",back:`Monitor metrics the model is NOT trying to improve but must not harm: latency, revenue, unsubscribes, complaint rate, downstream conversion.

Why:
- Optimising a single target invites collateral damage. A model that lifts CTR can raise it by degrading latency or by cannibalising another surface, and the target metric will not reveal it.

How:
- Define guardrails up front with looser thresholds, and block promotion on any guardrail regression even when the target improves.

Gotcha:
- Guardrails are also your defence against Goodhart's law — when the proxy target is gamed, the guardrails catch the harm the gaming causes. Without them, "the metric went up" is not evidence the product improved.`}],v=[{front:"Horizontal vs vertical scaling for inference",back:`Two ways to add capacity:
- Vertical: a bigger machine (more / faster GPU, more RAM).
- Horizontal: more machines behind a load balancer.

When vertical is forced:
- A model that does not fit on one device, or a single request needing more memory than a small node has.

Why horizontal is preferred for throughput:
- Scales near-linearly with traffic, tolerates node failure, matches autoscaling. But it needs the model to be replicable and stateless.

Gotcha:
- GPU nodes are expensive and scarce, so horizontal scaling of GPU services is costly and slow to provision. This is why raising per-node UTILISATION (batching, multi-tenancy) often beats adding nodes.`},{front:"Load balancing and session affinity for model servers",back:`Distributing requests across replicas. Usually stateless round-robin / least-connections is right.

When affinity matters:
- If replicas hold per-user CACHE (an LLM conversation's KV cache, a warmed embedding cache), routing a user consistently to the same replica (consistent hashing / sticky sessions) raises the cache hit rate dramatically.

The trade-off:
- Affinity improves cache locality but hurts load balancing — a hot user can overload one replica, and a replica loss loses its cache.

Gotcha:
- Consistent hashing minimises cache churn when replicas scale up / down (only a fraction of keys remap). Plain modulo hashing invalidates nearly every cache entry on a scale event.`},{front:"Backpressure, queueing, and load shedding",back:`Under overload, a serving system must degrade gracefully rather than collapse.

- Backpressure: signal upstream to slow down when queues fill.
- Load shedding: proactively REJECT excess requests (with a fast error or fallback) to protect latency for the rest.

Why shed load:
- An unbounded queue means every request eventually times out. Better to serve 90% well and fast-fail 10% than to serve 100% past the deadline.

Admission control:
- Reject early, before expensive feature fetches and GPU work are spent on a request that will time out anyway.

Gotcha:
- A request already past its deadline should be dropped, not served — completing it wastes capacity and helps no one.`},{front:"Rate limiting and quotas",back:`Capping request rate per client / tenant to protect the service and ensure fair sharing.

Algorithms:
- Token bucket: allows bursts up to a cap, refills at a steady rate. The common default.
- Leaky bucket: smooths to a constant rate.

Why ML services need it:
- Inference is expensive, and one abusive or buggy caller can exhaust GPU capacity for everyone. Quotas also bound cost.

Gotcha:
- Enforce limits at admission (cheaply), BEFORE feature fetch and inference — enforcing them after the expensive work defeats the purpose.
- For LLMs, limit by TOKENS, not requests — requests vary wildly in cost.`},{front:"Batch (offline) inference at scale",back:`Scoring a large dataset on a schedule rather than per request — the cheapest way to serve when freshness allows.

How:
- Distributed compute (Spark, Ray, Beam) partitions the data and runs the model across many workers; results are written to a store and served by lookup.

Why far cheaper than online:
- Perfect batching and GPU utilisation, no latency SLO, no idle capacity, trivial retries.

When it fits:
- The input space is enumerable and predictions stay valid for hours (daily churn scores, precomputed recommendations).

Gotcha:
- The offline scoring code must use the SAME features and preprocessing as any online path, or you get skew between precomputed predictions and freshly computed ones.`},{front:"Hardware selection: CPU vs GPU vs TPU vs accelerators",back:`The options:
- CPU: cheap, ubiquitous, best for small models and low QPS where a GPU would sit idle.
- GPU: massively parallel, wins on large models and high batch throughput.
- TPU: optimised for large dense matmuls (big training, some serving).
- Inference accelerators (Inferentia, etc.): cost-optimised for serving specific model classes.

Decision drivers:
- Model size, batch-ability, QPS, and latency SLO. A small model at low QPS is often CHEAPER on CPU because the GPU cannot be kept busy.

Gotcha:
- Benchmark on YOUR model and traffic. Vendor throughput numbers assume large batches and ideal shapes you may never hit in a latency-bound service.`},{front:"Autoscaling ML services — the right signal",back:`CPU utilisation, the default autoscaling signal, is a poor proxy for a GPU service — it can be low while the GPU is saturated.

Better signals:
- GPU utilisation, request concurrency, queue depth, or inference latency against the SLO.

ML-specific complications:
- Slow cold starts (model loading), expensive / scarce GPU nodes, large fixed memory footprints.

Tactics:
- Keep a warm pool for baseline load and burst on top.
- Scale on queue depth so you add capacity before latency degrades.
- Use stabilisation windows to avoid thrashing.
- A readiness probe that passes only after the model loads.

Gotcha:
- Scaling down aggressively then hitting a traffic spike incurs cold-start latency — smooth the scale-down.`},{front:"Cost optimisation levers for inference",back:`Where the money goes and how to cut it:
- Raise UTILISATION — batching and multi-tenancy so paid hardware is not idle (idle GPU time is the classic waste).
- SMALLER models — quantise, distil, prune.
- Move ONLINE work to BATCH where freshness allows (orders of magnitude cheaper).
- Right-size HARDWARE — CPU for small / low-QPS.
- CACHE repeated inputs.
- Spot / preemptible instances for fault-tolerant batch jobs.

Biggest structural win:
- Precompute in batch instead of per-request whenever the prediction stays valid for hours.

Gotcha:
- Scale-to-zero cuts idle cost but adds cold-start latency — a direct cost / latency trade to make deliberately.`},{front:"Tensor, pipeline, and data parallelism for serving large models",back:`When a model is too big for one device, split it. Three axes:
- Tensor parallelism: split individual layers ACROSS GPUs (each holds a slice of the weights). Needs high-bandwidth interconnect for per-layer all-reduces.
- Pipeline parallelism: put different LAYERS on different GPUs and stream microbatches through, keeping stages busy.
- Data parallelism: replicate the whole model, split the BATCH. Scales throughput, not model size.

When each:
- Tensor-parallel within a node (fast NVLink); pipeline-parallel across nodes; data-parallel to add throughput once the model fits.

Gotcha:
- Tensor parallelism's communication cost makes it bandwidth-bound — it needs fast interconnect or the GPUs starve.`},{front:"Precompute vs on-demand (the caching/compute trade)",back:`Precompute predictions or features ahead of time and serve by lookup, versus computing them per request.

Precompute when:
- The input space is bounded and enumerable, and results stay valid for a while (user embeddings, daily scores, popular-query results). Cheap serving, but stale and storage-heavy.

On-demand when:
- Inputs are unbounded or request-context-dependent (a novel search query, current location), or freshness is critical.

Hybrid is common:
- Precompute the expensive stage (embeddings, candidate sets) in batch, do the light request-time work (ranking, filtering) online.

Gotcha:
- Precomputed results need INVALIDATION when the model or features change, or you serve outputs from a retired model.`},{front:"Operator fusion and kernel optimisation",back:`Combining several operations into a single GPU kernel to cut memory traffic and launch overhead.

Why it is a big win:
- GPUs are often MEMORY-bandwidth bound, not compute bound. Each separate op reads its inputs from and writes its outputs to global memory; fusing (e.g. matmul + bias + activation, or FlashAttention fusing the whole attention block) keeps intermediates in fast on-chip memory and avoids the round-trips.

Where it comes from:
- Compilers (torch.compile, XLA, TensorRT) and hand-written fused kernels.

Gotcha:
- Fusion benefits depend on tensor shapes. Tiny tensors are launch-overhead bound (fusion helps a lot); huge ones may already be compute bound (fusion helps less).`},{front:"Speculative decoding (LLM latency)",back:`Speeds up autoregressive LLM generation by using a small "draft" model to propose several tokens, which the large model VERIFIES in a single parallel forward pass.

Why it works:
- Verifying k proposed tokens costs one large-model pass instead of k.
- The large model accepts the draft's tokens wherever they match what it would have produced — so the output is provably IDENTICAL to normal decoding.

Payoff:
- Often 2-3× fewer large-model passes when the draft is good, with no quality loss.

Gotcha:
- Gains depend on the draft's acceptance rate. A poor draft is rejected often, wasting its work — the draft must be cheap AND well-aligned with the target.`},{front:"KV cache and continuous batching for LLM serving",back:`KV cache:
- An LLM stores the keys / values of past tokens so each new token does not recompute attention over the whole prefix — turning generation from quadratic into incremental.
- The catch: the cache grows with sequence length and consumes large, variable GPU memory, and requests finish at different times.

Continuous batching (PagedAttention / vLLM):
- Instead of static batches, add and evict requests token-by-token and manage KV cache in paged blocks, keeping the GPU full as sequences of different lengths come and go.
- Naive static batching wastes the GPU while long sequences finish; continuous batching can multiply throughput several-fold.

Gotcha:
- KV-cache MEMORY, not compute, is often the LLM serving bottleneck.`},{front:"Federated and privacy-preserving deployment",back:`Federated learning:
- Train across many devices / silos WITHOUT centralising raw data — devices compute updates locally and only aggregates are shared.

Why:
- Privacy, regulation, and data that legally cannot leave a device or region.

Costs and complications:
- Unreliable, heterogeneous clients.
- Non-IID data across clients (each device's data is unrepresentative).
- Communication is the bottleneck.
- Updates themselves can LEAK information, so differential privacy or secure aggregation is added.

Gotcha:
- Federated does not automatically mean private — model updates can be inverted to reconstruct training data. Privacy requires explicit mechanisms (DP noise, secure aggregation), with their own accuracy cost.`}],w=[{front:"Experiment tracking",back:`Recording every training run's code version, data version, hyperparameters, metrics, and artefacts (MLflow, Weights & Biases, Neptune).

Why it is foundational:
- ML development is empirical — dozens of runs with small variations. Without tracking you cannot answer "which config produced the best model?", cannot reproduce a result, and re-run experiments you already did.

What to log:
- Params, metrics (train and val), the data snapshot reference, the git commit, the environment, and the output model.

Gotcha:
- Logging metrics but not the DATA VERSION and CODE COMMIT makes runs irreproducible — the same hyperparameters produced a different model because the data or code differed.`},{front:"Model cards and documentation",back:`A standardised document describing a model: intended use, training data, evaluation results BROKEN DOWN BY SEGMENT, limitations, ethical considerations, and known failure modes.

Why:
- It communicates a model's appropriate use and risks to people who did not build it, and is increasingly required for governance and compliance.

The key content:
- Per-segment performance. An aggregate accuracy hides that the model is far worse for a subgroup — the card forces that disclosure.

Gotcha:
- A model card is only useful if kept current. A card describing v1 while v3 serves is worse than none — it gives false confidence about behaviour that has changed.`},{front:"Champion/challenger and shadow evaluation",back:`Champion: the model currently serving. Challenger: a candidate run in parallel to prove it is better before promotion.

Modes:
- SHADOW: the challenger scores real traffic, outputs logged not served. Validates stability and distribution, but not user impact.
- A/B: the challenger serves a slice. Measures real impact.
- Shadow first for safety, then A/B for effect.

Why:
- Offline metrics do not guarantee production wins, so challengers must be validated on live traffic before promotion.

Gotcha:
- Shadow mode cannot measure business impact (nobody sees the outputs) and doubles inference cost for the shadow period. It is a safety gate, not a substitute for an A/B test.`},{front:"Progressive rollout and feature flags for models",back:`Releasing a new model to a growing fraction of traffic (1% → 5% → 25% → 100%), gated behind a flag that can flip instantly.

Why:
- Limits blast radius, lets health metrics stabilise at each stage, and enables instant rollback by flipping the flag — no redeploy.

Difference from a canary:
- A canary is specifically the small first stage watched for health; progressive rollout is the whole staged ramp. Feature flags are the mechanism that makes both instant to control.

Gotcha:
- The flag / config that selects the model is itself production state — version it, audit changes, and ensure a flag flip does not leave caches serving the old model's outputs.`},{front:"Interleaving vs A/B testing for ranking models",back:`Two ways to compare rankers:
- A/B: users are split into groups, each group sees one ranker, and you compare aggregate metrics.
- Interleaving: a SINGLE user sees results MIXED from both rankers, and you measure which ranker's items they prefer.

Why interleaving is powerful for ranking:
- It controls for the user — the same person judges both rankers on the same query — so it detects differences with far LESS traffic and lower variance than A/B.

Limits:
- Works for comparing rankings, not whole-experience or long-term metrics, and is harder to implement correctly (fair mixing, unbiased attribution).

Use:
- Interleaving to cheaply screen ranker candidates, A/B to confirm the winner's business impact.`},{front:"Human-in-the-loop and review queues",back:`Routing uncertain or high-stakes predictions to humans instead of auto-deciding.

When:
- High cost of error (medical, fraud, moderation), low model confidence, out-of-distribution inputs, or a regulatory requirement for human oversight.

Design:
- An ABSTENTION threshold — the model acts only when confident enough, otherwise it escalates. This trades coverage (fraction auto-handled) against accuracy on what it does handle.

Bonus:
- Human decisions on escalated cases become fresh labels, especially on the hard / uncertain region — active-learning value.

Gotcha:
- Calibrate the confidence used for routing, or you escalate the wrong cases. And design for the human throughput you actually have, or the queue backs up and the "safety net" becomes a bottleneck.`},{front:"Model approval gates and sign-off",back:`Formal checks a model must pass before it can serve: performance thresholds on a trusted holdout, per-segment and fairness checks, latency / size limits, and sometimes human or legal sign-off.

Why:
- Automated retraining will faithfully promote a WORSE model trained on contaminated data unless a gate blocks it. Gates make promotion a validated event, not an automatic one.

Where in CI/CD:
- After training, before deployment — the gate is code, evaluated against a held-out set the training never saw.

Gotcha:
- Gating only on AGGREGATE metrics lets a per-segment regression through. Include segment-level and guardrail checks, and compare against the CURRENT champion, not an absolute bar.`},{front:"Audit trails and compliance (right to explanation, model risk)",back:`Regulated domains (credit, insurance, hiring, healthcare) require automated decisions to be explainable, contestable, and auditable.

What it demands:
- Log which model / version made each decision and on what inputs.
- Produce a human-readable reason for adverse decisions (adverse-action notices).
- Retain records.
- Manage model risk (validation, documentation, monitoring) under frameworks like SR 11-7.

Technical implications:
- Prediction logging with model lineage, explainability (SHAP for reason codes), and versioned governance.

Gotcha:
- SHAP shows what the model used, not causal reasons — the "reasons" you give must be legally defensible. And you cannot explain a decision if you did not log the exact model and features that produced it.`},{front:"Fairness and bias monitoring in production",back:`A model fair at launch can become unfair as data drifts, so fairness is a monitoring concern, not just a training-time check.

Metrics (which conflict):
- Demographic parity: equal positive rates across groups.
- Equalised odds: equal TPR / FPR across groups.
- Calibration within groups.
- An IMPOSSIBILITY result means you generally cannot satisfy all at once — you must choose which to prioritise.

Monitor:
- Per-group performance and outcome rates over time, alerting on divergence.

Gotchas:
- You need group labels to measure fairness, which may be sensitive or unavailable.
- Optimising one fairness metric can worsen another, so the choice must be explicit and justified.`},{front:"PII handling and access control in ML systems",back:`Training data and features often contain personal data, creating obligations across the whole lifecycle.

Practices:
- Minimise and mask PII in features.
- Encrypt at rest and in transit.
- Access controls on feature stores, training data, and prediction logs.
- Redact PII from logs — a common leak, since features and prompts logged for debugging contain personal data.

Regulatory hooks:
- Purpose limitation, retention limits, and data-subject rights.

Gotcha:
- Models (especially LLMs) can MEMORISE and regurgitate PII, so "the raw data is secured" is not enough — the model itself can leak training data. Prediction / feature logs are an often-overlooked PII store.`},{front:"Right to be forgotten and machine unlearning",back:`Regulations grant individuals the right to have their data deleted — but a trained model has already ABSORBED that data into its weights.

The problem:
- Deleting the row from the database does not remove its influence on the model, and models can memorise and regurgitate specific training examples.

Approaches:
- Retrain from scratch without the data (correct but expensive).
- Approximate UNLEARNING methods that adjust the model to remove a sample's influence.
- Architectures designed for efficient deletion (sharded training so only affected shards retrain).

Gotcha:
- Proving a sample's influence is truly gone is hard, and frequent deletion requests make full retraining impractical. This is an active, unsolved area to plan for, not assume away.`},{front:"Model supply-chain security and provenance",back:`Models, like software, have a supply chain that can be attacked: pretrained weights from public hubs, training data, and dependencies.

Threats:
- A POISONED pretrained model or dataset (backdoor triggered by a specific input).
- A malicious model file that executes code on load (pickle deserialisation is a known vector).
- Compromised dependencies.

Defences:
- Verify provenance and checksums of downloaded weights.
- Prefer safe serialisation formats (safetensors over pickle).
- Scan and pin dependencies.
- Control who can register / promote models.

Gotcha:
- Loading an untrusted model artefact can execute arbitrary code — treat model files from external sources as untrusted executables, not inert data.`},{front:"Adversarial robustness in production",back:`Deployed models face inputs crafted to fool them:
- Adversarial examples: small perturbations that flip the prediction.
- Evasion: spammers / fraudsters adapting to the model.
- Prompt injection for LLMs.

Why it is a deployment concern:
- A static model against ADAPTIVE adversaries degrades as they learn its blind spots — concept drift driven by an opponent, requiring frequent retraining.

Defences:
- Adversarial training, input validation and anomaly / OOD detection, rate limiting to slow probing, ensembles, and keeping model details private to raise the attacker's cost.

Gotcha:
- Exposing confidence scores or detailed outputs helps attackers optimise against you — a trade-off between transparency and robustness.`},{front:"Model deprecation and retirement",back:`Retiring an old model version safely — often overlooked until it causes an incident.

What it involves:
- Confirming no traffic still routes to it.
- Checking no downstream system stored or depends on its outputs.
- Retaining the artefact and metadata for audit even after retirement.
- Cleaning up its serving resources.

Why it matters:
- "Zombie" models keep serving forgotten traffic, or a cache / precompute table keeps returning a retired model's predictions long after it was "turned off".

Gotcha:
- You may need to KEEP a retired model's artefact and lineage for compliance even though it no longer serves — deletion and deprecation are different. And rollback needs the previous artefact to still exist, so do not delete N−1 when shipping N.`}],k=[{front:"TTFT vs TPOT — the two LLM latency metrics",back:`An LLM generates one token at a time, so it has two distinct latencies:
- TTFT (Time To First Token): how long until the first token appears. Dominated by the PREFILL of the prompt.
- TPOT (Time Per Output Token): the steady-state rate of every token after that. Dominated by DECODE.

Why split them:
- TTFT drives perceived responsiveness and grows with prompt length.
- TPOT drives how fast the answer streams out.

Different bottlenecks:
- TTFT is compute-bound on the prompt — helped by shorter prompts and prefill optimisation.
- TPOT is memory-bandwidth bound per token — helped by quantisation, batching, speculative decoding.

Gotcha:
- A single "latency" number hides which half is slow. A long prompt kills TTFT even when TPOT is fine.`},{front:"Streaming responses (SSE) for LLMs",back:`Tokens are sent to the client as they are generated (Server-Sent Events or chunked HTTP) rather than waiting for the whole response.

Why:
- Total generation can take seconds, but streaming shows the first token in a fraction of that (TTFT), so perceived latency collapses even though total time is unchanged.

Infra implications:
- Connections are long-lived — affects load balancing, timeouts, and connection limits.
- You must handle mid-stream cancellation (user stops → stop generating, free the GPU slot).

Gotcha:
- Output validation / guardrails are harder — you have already sent tokens before you can check the whole output. Either buffer for validation (losing the latency win) or validate incrementally.`},{front:"RAG serving architecture",back:`Retrieval-Augmented Generation: at request time, retrieve relevant documents (vector search over an index) and inject them into the prompt, so the LLM answers from current, specific knowledge.

Why:
- Grounds the model in up-to-date, proprietary, or citable facts without retraining, and reduces hallucination.

Serving pieces:
- An embedding model, a vector database (ANN search), a retriever / re-ranker, and the LLM — a multi-stage pipeline with its own latency budget per stage.

Gotchas:
- Retrieval QUALITY caps answer quality — garbage retrieved → confident wrong answer.
- The index must be kept fresh.
- Too many documents blow the context window and TTFT.
- Retrieval is usually the failure point, not the LLM.`},{front:"Vector databases in production",back:`Stores embeddings and serves approximate nearest-neighbour search for retrieval / semantic search.

Production concerns:
- ANN index type — HNSW (fast, memory-heavy) vs IVF / PQ (compressed, some recall loss).
- Recall-vs-latency tuning (efSearch / nprobe).
- Index FRESHNESS — new documents are invisible until indexed.

Operational realities:
- Rebuilding / updating indexes at scale, metadata filtering combined with vector search, sharding as the corpus grows.

Gotcha:
- Re-embedding with a new embedding model means EVERY vector must be recomputed and the whole index rebuilt — embeddings from different models are not comparable. Plan embedding-model upgrades as full reindex migrations.`},{front:"Semantic caching for LLMs",back:`Caching LLM responses keyed by the MEANING of the query (embedding similarity) rather than an exact string match, so paraphrased repeats hit the cache.

Why:
- LLM calls are expensive and slow, and many queries are near-duplicates. An exact-match cache misses "reset my password" vs "how do I reset password"; a semantic cache catches both.

How:
- Embed the query, find a cached entry within a similarity threshold, return it.

Gotchas:
- The similarity threshold is a precision / recall trade — too loose returns a wrong cached answer for a subtly different question (dangerous); too tight and the hit rate collapses.
- Cached answers can go stale if the underlying knowledge changed.
- Not safe for personalised or context-dependent responses.`},{front:"Guardrails and output validation for LLMs",back:`Checks placed around an LLM to constrain its inputs and outputs:
- Input filters: prompt-injection, PII, disallowed content.
- Output validation: format / schema conformance, toxicity, factuality, policy.

Why:
- LLMs are non-deterministic and can produce harmful, malformed, or off-policy output. A downstream system expecting valid JSON breaks when the model emits prose.

Approaches:
- Schema-constrained decoding (force valid JSON), classifier guardrails on input / output, regex / rule validators, a second LLM as a judge.

Gotchas:
- Guardrails add latency and can be bypassed (jailbreaks).
- Constrained decoding guarantees format but not correctness.
- Streaming makes output validation hard — tokens are sent before the full output can be checked.`},{front:"Prompt versioning and management",back:`Treating prompts as versioned, tested artefacts — not strings hardcoded in application code.

Why:
- A prompt is effectively model configuration that strongly determines behaviour. Changing it changes outputs, so it needs versioning, review, testing, and the ability to roll back — exactly like model weights.

Practices:
- Store prompts in a registry with versions.
- Evaluate a prompt change against a test set before shipping.
- Log which prompt version produced each output.

Gotcha:
- Teams edit prompts casually in code and ship untested changes that silently shift behaviour for every user. And a prompt tuned for one model version can degrade when the underlying model is updated — prompt and model version are coupled.`},{front:"LLM evaluation in production",back:`Measuring LLM output quality, hard because there is usually no single correct answer.

Approaches:
- Reference-based metrics — weak for open-ended text.
- LLM-AS-JUDGE — another model scores outputs against a rubric. Scalable, but has its own biases.
- Human evaluation — gold standard, expensive.
- Task-specific checks — did the extracted JSON match, did the code run.

Production signals:
- User feedback (thumbs, edits, regenerations), task success rates, guardrail trigger rates.

Gotchas:
- LLM judges are biased (favour longer answers, their own style, position) and must be validated against humans.
- Offline eval sets go stale as usage shifts — build a living eval set from real traffic.`},{front:"Hallucination monitoring and mitigation",back:`Hallucination: an LLM producing fluent, confident, and FALSE content.

Why it is hard operationally:
- The output looks correct, so it passes casual review.
- The model gives no reliable internal signal of when it is fabricating.

Mitigations:
- RAG grounding (answer from retrieved sources).
- Citation / attribution (force claims to reference provided context).
- Constrained tasks and lower temperature for factual work.

Monitoring:
- Factuality checks against sources, groundedness scoring (is the answer supported by retrieved context?), and user-correction signals.

Gotcha:
- RAG reduces but does not eliminate hallucination — the model can still ignore or misread retrieved context, or answer confidently when retrieval returned nothing relevant. Detecting "should have abstained" is the hard part.`},{front:"Token cost management",back:`LLM cost scales with TOKENS (input + output), so cost control means token control.

Levers:
- Shorter prompts (trim boilerplate, retrieve fewer / better documents).
- Cap output length.
- Cache (exact and semantic).
- Route easy queries to smaller / cheaper models.
- Batch where latency allows.

Why prompt length matters doubly:
- Long prompts cost input tokens AND raise TTFT (more prefill) — so bloated context hurts both cost and latency.

Monitoring:
- Track tokens per request by route / feature, not just request counts — one feature with huge contexts can dominate the bill.

Gotcha:
- Rate-limit and quota by TOKENS, not requests — requests vary 100× in cost.`},{front:"Model gateway and multi-provider routing",back:`A proxy in front of one or more LLM providers that centralises routing, retries, fallback, rate limiting, caching, logging, and cost tracking.

Why:
- Decouples application code from specific providers.
- Enables failover when a provider is down or rate-limits you.
- Lets you route by cost / quality — cheap model for easy tasks, strong model for hard ones.

What it centralises:
- Auth / keys, per-team quotas, prompt / response logging, and cross-provider observability.

Gotchas:
- Providers differ in APIs, tokenisation, and behaviour, so "just switch providers" changes outputs — the gateway abstracts the interface, not the behaviour.
- The gateway itself becomes a critical single point of failure that must be highly available.`},{front:"Retries, timeouts, and fallbacks for LLM calls",back:`LLM APIs are slow, rate-limited, and occasionally fail, so robust calling logic is essential.

Patterns:
- Timeouts sized to expected generation length (a streaming call can legitimately take many seconds).
- Retries with EXPONENTIAL BACKOFF and jitter on rate limits / 5xx.
- A circuit breaker to stop hammering a failing provider.
- Fallbacks — a cheaper model, a cached answer, or a graceful degraded response.

Gotchas:
- A naive retry on timeout can DOUBLE-charge you (the first call may still complete server-side) and amplify load during an outage.
- Retrying a non-idempotent action (an agent that took a side effect) repeats the side effect. Make retried operations idempotent, and back off aggressively during provider incidents.`},{front:"Context window management",back:`An LLM has a bounded context; prompt + retrieved content + history must all fit, and cost and latency rise with length.

Strategies:
- Truncation (drop oldest).
- Summarisation of history.
- Retrieval of only the most relevant chunks rather than everything.
- Sliding windows for long conversations.

The "lost in the middle" effect:
- Models attend most to the START and END of the context and can MISS information buried in the middle — so ordering matters, not just fitting.

Gotcha:
- A bigger context window is not free — it raises cost and TTFT and can DILUTE attention, sometimes lowering answer quality. Relevant, well-ordered context beats more context.`},{front:"Prompt injection and LLM input security",back:`Prompt injection: malicious instructions embedded in the input (or in retrieved / tool-returned content) that hijack the model — "ignore previous instructions and…".

Why it is dangerous in deployed systems:
- An LLM with tools or data access can be tricked into exfiltrating data, misusing tools, or bypassing policy.
- INDIRECT injection — poisoned content the model retrieves (a web page, a document) — is especially insidious, because the attack rides in on data, not the user's message.

Defences:
- Treat all retrieved / tool content as untrusted.
- Separate instructions from data.
- Least-privilege tool access.
- Output filtering, and human confirmation for high-impact actions.

Gotcha:
- There is no complete fix. Design for LEAST PRIVILEGE and assume the model can be manipulated.`},{front:"Fine-tuning vs RAG vs prompting in production",back:`Three ways to adapt an LLM, with different operational profiles:
- PROMPTING: fastest to change, no training, but limited by context window and cost per call.
- RAG: injects fresh / proprietary knowledge at query time, updates by re-indexing (no retraining), best for factual grounding.
- FINE-TUNING: bakes in behaviour / style / format, cheaper per call (shorter prompts), but needs training data and a retrain to update, and can degrade general ability.

Decision heuristic:
- Prompt first; add RAG for knowledge and grounding; fine-tune for consistent format / behaviour or to cut per-call cost at scale.
- They COMBINE — fine-tune for behaviour, RAG for facts.

Gotcha:
- Fine-tuning to add KNOWLEDGE is usually the wrong tool — expensive, stale immediately, hallucination-prone. RAG fits knowledge better.`}],T={deck:"ML Deployment (MLOps)",cards:[...f,...g,...y,...b,...v,...w,...k]},A={deck:"Recommendation Systems",cards:[{front:"Collaborative filtering — user-based vs item-based",back:`Recommend using patterns of behaviour across users, with no content features at all.
- User-based: find users similar to you, recommend what they liked.
- Item-based: find items co-liked by the same users, recommend those.

Why item-based in production:
- Item-item similarities are far more stable over time than user tastes, so they can be precomputed and cached.

Strength:
- Discovers non-obvious associations no content feature would reveal.

Weakness:
- Total cold start — a brand-new item has no interactions, so it is invisible.`},{front:"Matrix factorization (ALS / SVD-style)",back:`Factor the sparse user-item interaction matrix R (n×m) into two thin matrices U (n×k) and V (m×k) so that R ≈ U·Vᵀ.
- Each user and each item becomes a k-dimensional latent vector; a prediction is their dot product.

Mechanism:
- k is far smaller than n or m, so the model is forced to compress taste into a few latent factors — it generalises rather than memorising.

Why ALS (alternating least squares):
- Fix U and solving for V is a plain least-squares problem, and vice versa. Alternating is convex in each step and parallelises well.

Gotcha:
- "SVD" in recsys is not true SVD — the matrix is mostly MISSING, not zero.`},{front:"Implicit vs explicit feedback",back:`Two kinds of training signal:
- Explicit: the user states a preference (a star rating).
- Implicit: behaviour is used as a proxy (click, watch, purchase, dwell time).

The hard part of implicit:
- There are NO TRUE NEGATIVES. A non-click may mean dislike, or simply never seen. Absence of interaction is ambiguous.

Standard treatment:
- Treat unobserved pairs as weak negatives with low confidence, and observed ones with confidence that rises with interaction strength (e.g. c = 1 + α·r).

Pitfall:
- Labelling everything unseen as a hard negative teaches the model that unpopular-but-relevant items are bad.`},{front:"Content-based filtering, and hybrid recommenders",back:`Content-based: score items by feature similarity to what the user already liked (text, category, embeddings), ignoring other users entirely.

Strength:
- Handles new items immediately — features exist before any interaction does. Also explainable.

Weakness:
- Over-specialisation. It keeps recommending more of the same and never surprises the user.

Hybrid:
- Combine with collaborative signals — a weighted blend, switching by data availability, or one model taking both as features.
- Almost every production system is a hybrid: content covers cold start, collaborative filtering drives quality once data arrives.`},{front:"Cold start — the three kinds",back:`Three distinct "no data yet" problems:
- New USER: no history.
- New ITEM: no interactions.
- New SYSTEM: no data at all.

Fixes by type:
- New user: onboarding preferences, demographics, popularity / trending defaults, contextual bandits to learn fast.
- New item: content features and embeddings, plus deliberate exploration traffic.
- New system: content-based or rules until interaction data accumulates.

Mechanism:
- Cold start is fundamentally an EXPLORATION problem — you cannot learn about an item you never show.

Gotcha:
- A pure exploit policy makes item cold start permanent: new items never get impressions to earn a ranking.`},{front:"Two-stage architecture: candidate generation → ranking",back:`Split recommendation into two passes with different objectives:
- Stage 1 (retrieval): cheaply narrow millions of items to a few hundred. Optimised for RECALL.
- Stage 2 (ranking): apply an expensive, feature-rich model to those few hundred. Optimised for PRECISION at the top.

Why the split:
- You cannot run a heavy model over the whole catalogue within a latency budget. Cost per item forces it.

Key consequence:
- THE RANKER CAN ONLY BE AS GOOD AS RETRIEVAL. Anything retrieval misses is unrecoverable, so measure recall@K of the candidate stage separately.

Often:
- A third re-ranking stage adds diversity and business rules.`},{front:"Two-tower model",back:`Two separate encoders: one for the user / context, one for the item. Trained so the dot product (or cosine) of their embeddings predicts relevance.

Why it dominates retrieval:
- The towers are INDEPENDENT. Item embeddings are precomputed offline for the whole catalogue; at request time you encode only the user and run an approximate nearest-neighbour search. That makes million-item retrieval feasible in milliseconds.

Trade-off:
- Because the towers never interact until the final dot product, it cannot model fine-grained user-item feature crosses — which is exactly what the ranking stage adds.`},{front:"Approximate nearest neighbour search (HNSW, IVF, FAISS)",back:`Finds near-neighbours in embedding space WITHOUT scanning every item — trading a little recall for orders-of-magnitude speed.

Main methods:
- HNSW: a navigable small-world graph; greedy descent through layers. Excellent recall / latency, memory-hungry.
- IVF: cluster the space, search only the nearest few cells.
- PQ (product quantization): compress the vectors to cut memory, at some accuracy cost.

Knobs:
- efSearch / nprobe trade recall against latency at query time.

Gotcha:
- Index freshness. New items are invisible until the index is rebuilt, so an ANN index quietly reintroduces item cold start.`},{front:"Popularity bias",back:`Popular items get recommended far more than their true relevance warrants.

Mechanism:
- Popular items have the most interaction data, so the model is most confident about them.
- Training data is itself dominated by them, so the loss is minimised by favouring them.

Effect:
- The long tail is starved, catalogue coverage collapses, and the system becomes a bestseller list rather than a recommender.

Mitigate:
- Popularity-debiased sampling, inverse-propensity weighting, explicit diversity in re-ranking, or penalising item frequency in the loss.`},{front:"Position bias",back:`Users click higher-ranked items far more often regardless of relevance, simply because those items are seen first.

Why it is dangerous:
- You train on clicks, so the model learns "position-1 items are good" — but position 1 was chosen BY THE PREVIOUS MODEL. You are learning your own past decisions, not user preference.

Measure it:
- Randomised position swaps, or intervention harvesting from natural ranking variation.

Correct it:
- Inverse-propensity weighting, weighting each click by 1 / P(examined at that position).
- Or model position as an explicit feature and set it to a constant at serving time.`},{front:"The feedback loop / rich-get-richer effect",back:`A recommender surfaces an item → it gets more impressions → more clicks purely from exposure → the model reads that as higher quality → it ranks even higher. The advantage compounds regardless of true relevance.

Mechanism:
- The model TRAINS ON DATA IT GENERATED. Exposure and quality become statistically inseparable, so the system is measuring its own past choices, not preference.

Example:
- A job posting recommended early accumulates clicks, locks into the top slot, and equally good postings never surface.

Mitigate:
- Exploration traffic, propensity weighting, diversity constraints, and monitoring catalogue coverage / Gini over time.`},{front:"Filter bubbles and echo chambers",back:`Personalisation progressively narrows what a user is shown until they only see reinforcement of existing preferences.

Mechanism:
- A direct consequence of the feedback loop at the USER level. The model optimises short-term engagement, which is maximised by familiarity, so the exploration radius shrinks with every interaction.

Harm:
- User boredom and churn, plus societal effects for content platforms.

Mitigate:
- Inject diversity and serendipity, optimise for long-term value rather than the next click, and monitor per-user intra-list diversity and topic entropy over time — not just CTR.`},{front:"Exploration vs exploitation",back:`Two competing goals when choosing what to show:
- Exploit: show what the model believes is best right now.
- Explore: show uncertain items to LEARN their value.

Why pure exploitation fails:
- The model never gathers data that could change its mind, so early mistakes become permanent and new items can never break in.

Strategies:
- ε-greedy: show a random item ε of the time. Simple, wasteful.
- UCB: add an optimism bonus proportional to uncertainty.
- Thompson sampling: sample from the posterior and act greedily on the sample. Usually best in practice, trivially parallel.

Framing:
- Exploration is the cost you pay to keep the training distribution from collapsing onto your own predictions.`},{front:"Multi-armed bandits and Thompson sampling",back:`A bandit chooses actions to maximise cumulative reward WHILE learning, balancing exploration and exploitation online rather than in fixed A/B splits.

Thompson sampling:
- Keep a posterior distribution over each arm's reward.
- SAMPLE one value from each arm's posterior, play the arm with the highest sample.
- Arms with wide uncertainty occasionally sample high and get tried.

Why it suits recsys:
- Adapts continuously, wastes far less traffic on clear losers than a fixed A/B test, and handles the new-item problem naturally.

Contextual bandits:
- Condition the choice on user features — the bridge between bandits and full recommenders.`},{front:"Learning to rank: pointwise, pairwise, listwise",back:`Three ways to frame ranking as a learning problem:
- Pointwise: predict a score per item independently (plain regression / classification). Simple, but optimises absolute values when only ORDER matters.
- Pairwise: learn which of two items should rank higher (RankNet, LambdaRank). Directly targets ordering.
- Listwise: optimise a whole-list metric such as NDCG directly (LambdaMART, ListNet).

Mechanism:
- Ranking metrics are flat or discontinuous in the scores, so they have no usable gradient.
- LambdaRank's trick: define the gradient directly, weighting each pair by how much swapping it would change NDCG.`},{front:"Ranking metrics: Precision@K, Recall@K, MRR, MAP, NDCG",back:`Top-K ranking metrics and what each rewards:
- Precision@K: fraction of the top K that are relevant.
- Recall@K: fraction of ALL relevant items captured in the top K.
- MRR: 1 / rank of the first relevant item — good when a single right answer matters.
- MAP: mean of average precision — position-aware across all relevant items.
- NDCG: discounted cumulative gain, normalised by the ideal ordering. Uses a log discount so higher positions count more, and it is the only common metric that handles GRADED relevance rather than binary.

Choosing:
- NDCG for graded relevance, MRR for known-item search, Recall@K for the retrieval stage.`},{front:"Offline/online metric mismatch",back:`A model that wins on logged offline data often fails to move live metrics — one of the most common surprises in recsys.

Why:
- Offline evaluation replays a distribution generated by the OLD policy. A new model that would have shown different items has no logged feedback for them, so it is scored only where it agrees with the incumbent.
- Offline data also cannot capture novelty, position effects, or user adaptation.

Implication:
- Offline metrics are a filter for what deserves an online test, not a substitute for one. Always ship behind an A/B test or interleaving.`},{front:"Counterfactual evaluation and Inverse Propensity Scoring (IPS)",back:`Estimates how a NEW policy would have performed using data logged under an OLD one, by reweighting each logged event by 1 / P(action taken | old policy).

Mechanism:
- It turns a biased sample into an unbiased estimate of the new policy's value — the same trick as importance sampling.

Requirements:
- The logging policy must be stochastic, and its action probabilities (propensities) must be recorded. If P(action) was 0, that region is unobservable and no reweighting recovers it.

Gotcha:
- High variance when propensities are tiny. Use clipped / self-normalised IPS, or doubly robust estimators.`},{front:"Negative sampling in recommenders",back:`With millions of items, computing a full softmax is infeasible, so you contrast each positive example against a SAMPLE of negatives.

Choices:
- Uniform random negatives: easy, but too easy — the model learns only coarse distinctions.
- In-batch negatives: cheap and popular for two-tower models.
- HARD negatives (plausible but wrong): sharpen the decision boundary most.

Gotcha:
- In-batch negatives are sampled by popularity, so popular items show up as negatives too often. Correct with a logQ / sampled-softmax correction, or you systematically suppress popular items.

Also:
- Watch for false negatives — a "negative" the user simply had not seen yet.`},{front:"Diversity, novelty, serendipity, coverage",back:`Four "beyond-accuracy" qualities:
- Diversity: how dissimilar the items within one list are.
- Novelty: how unknown / unpopular an item is to this user.
- Serendipity: relevant AND surprising — the genuinely hard one.
- Coverage: what fraction of the catalogue ever gets recommended.

Why they matter:
- Accuracy alone produces a monotonous, redundant list (five near-identical items) that suppresses long-term engagement.

Implementation:
- Maximal Marginal Relevance trades relevance against similarity to already-selected items; determinantal point processes do this more principledly.

Tension:
- These metrics trade against short-term CTR, which is why they need explicit objectives.`},{front:"Selection bias in logged recommendation data",back:`You only observe feedback for items the system CHOSE to show. The data is Missing Not At Random by construction.

Mechanism:
- Training on it means learning P(click | shown), while what you actually want is P(relevant) over the whole catalogue. The gap between them is the bias.

Consequence:
- The model is confident where the old policy was active and blind everywhere else — and that blindness is self-reinforcing.

Mitigate:
- Reserve a small randomised exploration slice as an unbiased evaluation set, log propensities, and use IPS or doubly robust estimators.`},{front:"Session-based and sequential recommendation",back:`Models the ORDER of interactions within a session rather than a static user profile.
- GRU4Rec uses an RNN; SASRec / BERT4Rec use self-attention.

Why sequence matters:
- Intent is short-lived and order-dependent. Someone who just bought a phone wants a case, not another phone.

Mechanism:
- Self-attention lets any earlier item directly influence the prediction, so it captures long-range dependencies better than an RNN and trains in parallel.

Key design decision:
- Separate short-term session intent from long-term stable taste — strong systems model both and combine them.`},{front:"Delayed and sparse feedback",back:`The signal you truly care about (purchase, retention, subscription) arrives long after the recommendation, if ever.

Problem:
- Attribution windows are ambiguous, and training on the immediate proxy (clicks) optimises the wrong objective — the classic route to clickbait.

Handling:
- Multi-task models predicting click AND conversion.
- Delayed-feedback models that treat an unconverted event as CENSORED (outcome still pending) rather than negative.
- Proxy metrics validated against long-term outcomes via holdouts.

Gotcha:
- Labelling "no conversion yet" as negative systematically mislabels recent events, biasing the model toward older data.`},{front:"Multi-objective recommendation",back:`Real systems optimise several competing goals at once: relevance, revenue, diversity, freshness, creator fairness, long-term retention.

Approaches:
- Scalarisation: weighted sum of the predicted objectives. Simple, requires tuning the weights.
- Constrained optimisation: maximise relevance subject to diversity ≥ X.
- Pareto-front methods.

Mechanism:
- Usually one model per objective feeding a blending layer, since the objectives have different label densities and delays.

Gotcha:
- Weights get tuned to short-term metrics and silently drift the product. Tie weight changes to long-term holdout experiments.`},{front:"Presentation and trust bias",back:`Beyond position, HOW an item is displayed changes clicks: thumbnail quality, badges ("Sponsored", "Top pick"), card size, whether it is above the fold.

Trust bias specifically:
- Users click higher results partly because they TRUST the system's ordering — so a click reflects confidence in the ranker, not just relevance.

Consequence:
- Your click labels encode UI decisions. A UI change silently shifts the label distribution and can look like model degradation.

Mitigate:
- Log the UI treatment as a feature, and re-baseline metrics after any presentation change.`},{front:"Wide & Deep, DeepFM, and feature crosses",back:`Wide & Deep combines two parts trained jointly:
- A linear "wide" part that MEMORISES specific feature crosses seen in training.
- A deep part that GENERALISES via embeddings.

Why both:
- Memorisation captures exceptions and strong co-occurrences; generalisation covers unseen combinations. Either alone underperforms.

DeepFM:
- Removes the manual feature-cross engineering by learning second-order interactions with a factorisation machine, sharing embeddings with the deep part.

Mechanism:
- These exist because plain MLPs are surprisingly bad at learning multiplicative feature interactions from one-hot inputs.`},{front:"Graph-based recommendation (GNNs)",back:`Model users and items as nodes in a bipartite interaction graph, and propagate embeddings along the edges — so a user's representation absorbs information from items, their other users, and outward.

Mechanism:
- Message passing over k hops is effectively higher-order collaborative filtering — it captures "users like me liked items like this" transitively.
- LightGCN strips out the non-linearities and shows the propagation itself does the work.

Strength:
- Helps sparse users by borrowing signal from graph neighbours.

Cost:
- Expensive to train and serve at scale; neighbour sampling is required.`},{front:"Evaluating a recommender: what should you actually measure?",back:`Offline:
- Recall@K for retrieval, NDCG for ranking, plus coverage and intra-list diversity so accuracy gains are not bought with catalogue collapse.

Online:
- CTR is the tempting default but is short-term and clickbait-prone. Prefer downstream conversion, session depth, return rate, and long-term retention holdouts.

Guardrails:
- Catalogue coverage / Gini, share of impressions to the head, latency p99, and per-segment metrics to catch Simpson-style reversals.

Rule of thumb:
- If a change raises CTR while lowering coverage and diversity, you have probably strengthened the feedback loop rather than the product.`}]},t=[m,p,T,A],E=t.reduce((e,n)=>e+n.cards.length,0);function S(){return t.flatMap(e=>e.cards.map(n=>({deck:e.deck,front:n.front,back:n.back})))}export{E as STARTER_CARD_COUNT,t as STARTER_DECKS,S as starterCards};
