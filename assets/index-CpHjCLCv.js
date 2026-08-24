const a=[{front:"Sampling bias — what is it, and why does more data not fix it?",back:`The sample is drawn so some population members are systematically more likely to appear, so the sample distribution ≠ the population distribution.

Under the hood: it shifts the quantity you are estimating, not just the noise around it. More data narrows the interval around the WRONG value.

Pitfall: "we have 100M rows so it must be representative." Volume never fixes bias.

Example: a credit model trained only on approved applicants — you never observe how rejected applicants would have repaid.`},{front:"Central Limit Theorem — what exactly converges to normal?",back:`The distribution of the SAMPLE MEAN (properly scaled) approaches a normal distribution as n grows, whatever the population shape, provided variance is finite.

Under the hood: it describes the sampling distribution of a statistic, not your raw data.

Pitfall: using it to claim your features are normally distributed. It says nothing about individual observations.

Gotcha: fails for infinite-variance / heavy-tailed distributions (Cauchy), and converges slowly for very skewed data — n=30 is a rule of thumb, not a law.`},{front:"p-value — precise definition, and the three things it is NOT",back:`P(data at least as extreme as observed | null hypothesis true).

It is NOT: (1) the probability the null is true, (2) the probability the result was chance, (3) a measure of effect size.

Under the hood: a tail probability under an assumed null model, so it depends on your sampling plan, not just the data you collected.

Pitfall: with huge n, trivially small effects reach p<0.05. Always report effect size and a confidence interval alongside it.`},{front:"Type I vs Type II error, and statistical power",back:`Type I (α): rejecting a true null — a false positive. Type II (β): failing to reject a false null — a false negative. Power = 1 − β, the chance of detecting a real effect.

Under the hood: for fixed n, lowering α raises β. Power rises with larger effect size, larger n, and lower variance.

Pitfall: running an underpowered test and reading "not significant" as "no effect." Absence of evidence is not evidence of absence.

Example: an A/B test with n=200 simply cannot detect a 0.5% lift.`},{front:"Multiple comparisons problem — and how to correct for it",back:`Testing many hypotheses at α=0.05 each means the chance of at least one false positive grows fast: 1−0.95^k. With 20 tests it is ~64%.

Under the hood: α controls the error rate PER TEST, not across a family of tests.

Corrections: Bonferroni (α/k) controls family-wise error but is very conservative. Benjamini-Hochberg controls the False Discovery Rate and has far more power — usually the better choice in ML.

Example: checking an A/B test across 20 segments until one "wins."`},{front:"Peeking / optional stopping in A/B tests",back:`Repeatedly checking a running experiment and stopping when p<0.05 inflates the false positive rate far above 5% — often to 20-30%.

Under the hood: the p-value assumes a FIXED sample size decided in advance. Continuous monitoring gives the random walk many chances to cross the threshold.

Fix: fix n in advance via power analysis, or use methods designed for it — sequential testing, always-valid p-values, or Bayesian bandits.

Gotcha: this is probably the single most common way real experiments lie.`},{front:'Confidence interval — what does "95%" actually refer to?',back:`A procedure that, across repeated samples, produces intervals containing the true parameter 95% of the time.

Under the hood: the randomness lives in the INTERVAL, not the parameter. A specific computed interval either contains the true value or it does not.

Pitfall: saying "there is a 95% probability the true value is in [a,b]" — that is the Bayesian credible interval, a different object.

Useful: a CI carries strictly more information than a p-value, since it shows magnitude and precision.`},{front:"Maximum Likelihood Estimation (MLE)",back:`Choose parameters θ that maximise the probability of the observed data: argmax θ P(data | θ).

Under the hood: most standard losses ARE MLE. Squared error = MLE under Gaussian noise. Cross-entropy = MLE for a categorical/Bernoulli model. Knowing this explains WHY those losses are used.

Properties: consistent and asymptotically efficient, but biased in small samples (e.g. MLE of variance divides by n, not n−1).

Pitfall: MLE happily overfits — it has no preference for simpler parameters.`},{front:"Bayes' theorem — and the base rate fallacy",back:`P(A|B) = P(B|A)·P(A) / P(B). Posterior ∝ likelihood × prior.

Base rate fallacy: ignoring P(A), the prior.

Example: a disease affects 1 in 10,000. A test is 99% accurate. You test positive. P(sick) ≈ 1%, not 99% — because false positives (~100 per 10,000 healthy people) vastly outnumber the 1 true case.

Why it matters in ML: this is exactly why a 99%-accurate classifier on a rare-event problem can still be useless in production.`},{front:"MLE vs MAP — and why regularization is a prior",back:`MLE maximises P(data|θ). MAP maximises P(θ|data) ∝ P(data|θ)·P(θ), adding a prior over parameters.

Under the hood — this is the key insight: L2 regularization is exactly MAP with a Gaussian prior centred at 0. L1 is MAP with a Laplace prior. The regularization strength λ is the inverse of the prior variance.

So: "shrink weights toward zero" and "believe a priori that weights are small" are the same statement.

Gotcha: as n grows the likelihood dominates and the prior washes out.`},{front:"Bootstrap — how it works and when it breaks",back:`Resample your data WITH replacement many times, recompute the statistic each time, and use the spread of those values as its sampling distribution.

Under the hood: it treats the empirical distribution as a stand-in for the population — no closed-form formula needed, which is why it works for medians, ratios, AUC, and other awkward statistics.

Breaks down for: extremes (max/min), very small n, and dependent data (time series, grouped data) unless you use a block/cluster bootstrap.

Use: confidence intervals for metrics with no analytic standard error.`},{front:"Permutation test",back:`Shuffle the group labels many times to build the distribution of the test statistic under the null of "labels do not matter," then see where the observed statistic falls.

Under the hood: it makes the null concrete by simulation instead of assuming a parametric form — so it needs almost no distributional assumptions.

Strength: exact, works for any statistic you can compute.

Cost: compute-heavy, and it assumes exchangeability — so it is invalid when observations are dependent or the groups differ in variance.`},{front:"Bias-variance decomposition",back:`Expected squared error = bias² + variance + irreducible noise.

Bias: error from wrong assumptions (too simple a model). Variance: sensitivity to the particular training sample. Noise: floor you cannot beat.

Under the hood: the decomposition is for squared loss specifically; it does not decompose so cleanly for 0-1 loss.

Gotcha: modern deep nets and boosted ensembles show "double descent" — going far past the interpolation point can REDUCE test error again, which the classic U-shaped picture does not predict.`},{front:"Simpson's paradox",back:`A trend that appears in every subgroup can reverse when the groups are pooled.

Under the hood: caused by a confounder that is unevenly distributed across groups, so pooling mixes populations with different base rates.

Classic example: a treatment looks better in both mild and severe cases separately, yet worse overall — because it was given mostly to severe cases.

ML relevance: aggregate offline metrics can hide per-segment regressions. Always slice your metrics before trusting an overall number.`},{front:"Confounding variable",back:`A variable that influences both the supposed cause and the outcome, creating a spurious association between them.

Under the hood: it opens a "back-door path" between X and Y, so conditioning on it (stratify, match, or include as a covariate) closes the path.

Example: ice cream sales and drownings — temperature drives both.

Gotcha: do NOT blindly control for everything. Conditioning on a COLLIDER (a common effect of X and Y) creates bias where none existed. More covariates is not automatically safer.`},{front:"Correlation vs causation — what actually establishes causality?",back:`Correlation is a symmetric measure of linear co-movement. Causation is directional and about intervention: what happens to Y if I SET X.

Establishing it needs: a randomised experiment (breaks the link between X and all confounders), or a quasi-experimental design — instrumental variables, difference-in-differences, regression discontinuity, or a defensible causal graph.

Gotcha: correlation of 0 rules out only LINEAR association. y = x² over a symmetric range has correlation ≈ 0 while being perfectly determined.`},{front:"Pearson vs Spearman correlation",back:`Pearson measures LINEAR association on the raw values. Spearman is Pearson applied to the RANKS, so it captures any monotonic relationship.

Use Spearman when: the relationship is monotonic but curved, there are outliers, or the data is ordinal.

Under the hood: ranking discards magnitude, which is exactly what buys robustness to outliers.

Gotcha: both are single numbers that can hide wildly different structure — Anscombe's quartet gives four datasets with identical correlation and completely different shapes. Always plot.`},{front:"Multicollinearity and VIF",back:`Predictors that are highly correlated with each other. The model still predicts fine, but individual coefficients become unstable and uninterpretable.

Under the hood: XᵀX becomes near-singular, so its inverse blows up — tiny data changes swing coefficients wildly, sometimes flipping their sign.

Detect: Variance Inflation Factor. VIF > 5-10 is a warning sign.

Key distinction: it hurts INFERENCE, not prediction. If you only care about accuracy you can often ignore it. Ridge regression fixes it directly by making the matrix invertible again.`},{front:"Heteroscedasticity",back:`The variance of the residuals changes across the range of the predictors — a fan/cone shape in a residual plot.

Under the hood: OLS coefficients stay unbiased, but the standard errors are wrong, so your p-values and confidence intervals are misleading.

Fixes: robust (sandwich) standard errors, weighted least squares, or a variance-stabilising transform such as log.

Example: predicting spend from income — variability of spend is far larger among high earners.`},{front:"R² — and why adjusted R² exists",back:`Fraction of variance in y explained by the model: 1 − SS_res/SS_tot.

Pitfall: R² NEVER decreases when you add a predictor, even pure noise. So it cannot be used for model selection. Adjusted R² penalises parameter count to compensate.

Gotcha: R² can be negative on a test set — it means you are doing worse than predicting the mean.

Bigger point: a high R² does not imply a correct or causal model, and a low R² is expected and fine in genuinely noisy domains.`},{front:"Missing data: MCAR, MAR, MNAR",back:`MCAR — missingness is unrelated to anything; dropping rows is unbiased, just wasteful. MAR — missingness depends on OBSERVED variables; imputation conditioned on those works. MNAR — missingness depends on the UNOBSERVED value itself; no imputation fully fixes it.

Example of MNAR: high earners declining to state income. The missingness is informative.

Practical tip: add a binary "was_missing" indicator column. If missingness carries signal, the model can use it — and it often does.`},{front:"Class imbalance — why accuracy lies",back:`When one class dominates, a model predicting only the majority achieves high accuracy while being useless.

Example: 99.9% of transactions are legitimate. "Always predict legitimate" = 99.9% accurate and catches zero fraud.

Use instead: precision, recall, F1, and PR-AUC.

Handling: class weights, threshold tuning, resampling (SMOTE), or a different loss (focal loss).

Gotcha: resampling distorts predicted probabilities. If you need calibrated probabilities, prefer class weights or recalibrate afterwards.`},{front:"ROC-AUC vs PR-AUC — when does the choice matter?",back:`ROC-AUC plots TPR against FPR; it is the probability a random positive is ranked above a random negative. PR-AUC plots precision against recall.

Key difference: ROC-AUC uses FPR, whose denominator is the large negative class, so a flood of false positives barely moves it. PR-AUC uses precision, whose denominator is your positive predictions.

So: on heavily imbalanced problems ROC-AUC looks deceptively good — 0.95 while precision at your operating point is 5%. Prefer PR-AUC when positives are rare and you care about them.`},{front:"Calibration and the Brier score",back:`A model is calibrated when, among predictions of 0.7, about 70% are actually positive. Ranking quality (AUC) and calibration are INDEPENDENT — a model can rank perfectly and be badly calibrated.

Measure: reliability diagram, expected calibration error, or Brier score (mean squared error on probabilities).

Fix: Platt scaling (fit a logistic on held-out scores) or isotonic regression (non-parametric, needs more data).

Why it matters: any downstream expected-value decision — bidding, risk, thresholding on cost — needs true probabilities, not just good ordering.`},{front:"Entropy and cross-entropy",back:`Entropy H(p) = −Σ p log p: the average information content, i.e. the optimal average code length for samples from p. Maximal for a uniform distribution, zero when one outcome is certain.

Cross-entropy H(p,q) = −Σ p log q: the cost of coding samples from p using a code optimised for q.

Under the hood: H(p,q) = H(p) + KL(p‖q). Since H(p) is fixed by the data, MINIMISING CROSS-ENTROPY LOSS IS EXACTLY MINIMISING KL DIVERGENCE from your model to the true labels.`},{front:"KL divergence — and why it is not a distance",back:`KL(P‖Q) = Σ P(x) log(P(x)/Q(x)): the expected extra bits from using Q to model data that truly comes from P.

Not a metric: it is ASYMMETRIC (KL(P‖Q) ≠ KL(Q‖P)) and violates the triangle inequality.

The asymmetry has real consequences: minimising KL(P‖Q) is mode-COVERING (Q must put mass everywhere P does), while KL(Q‖P) is mode-SEEKING (Q collapses onto one mode). This drives behaviour in variational inference and generative models.

Gotcha: infinite when Q=0 where P>0. Use Jensen-Shannon for a symmetric, bounded alternative.`},{front:"Covariate shift, label shift, and concept drift",back:`Covariate shift: P(X) changes, P(Y|X) stays. Label shift: P(Y) changes, P(X|Y) stays. Concept drift: P(Y|X) itself changes — the relationship you learned is now wrong.

Why the distinction matters: covariate shift can often be corrected by importance weighting on the inputs. Concept drift cannot — it requires new labels and retraining.

Example: a spam filter facing new vocabulary (covariate shift) versus spammers actively adapting to evade it (concept drift).

Detect: PSI or KS test on features; monitor performance once labels arrive.`},{front:"Survivorship bias",back:`Analysing only the entities that "survived" some selection process, while the ones that dropped out are invisible in your data.

Canonical example: WWII bombers returning with bullet holes in the wings. Reinforcing the wings is wrong — planes hit in the ENGINES never came back. Armour the untouched areas.

ML relevance: training a churn model only on active users; evaluating a trading strategy on companies still listed today; learning from products that were never taken off the shelf.

Ask always: what data was destroyed or never recorded before it reached me?`},{front:"Regression to the mean",back:`Extreme observations tend to be followed by less extreme ones, purely because extremes partly reflect luck that does not repeat.

Under the hood: any measurement = signal + noise. Selecting on an extreme value selects partly for extreme noise, which by definition does not persist.

Trap: it manufactures fake causal stories. "We coached the worst performers and they improved" — they would have improved anyway.

ML relevance: this is why targeting an intervention at the worst-performing segment makes almost any intervention look effective without a control group.`},{front:"A/B test sample size — what drives it?",back:`n per arm ≈ 16σ²/Δ², where Δ is the minimum effect you want to detect (for 80% power, α=0.05).

The critical property: n scales with 1/Δ². Halving the detectable effect QUADRUPLES the required sample. This is why detecting small lifts is so expensive.

Decide before running: baseline rate, minimum detectable effect, α, and power.

Pitfall: computing sample size after peeking at results, or powering for a lift far larger than anything plausible so the test is guaranteed to be inconclusive.`},{front:"CUPED (variance reduction in experiments)",back:`Use pre-experiment data as a covariate to strip out predictable variance: Y_adj = Y − θ(X_pre − E[X_pre]), with θ chosen as Cov(Y,X)/Var(X).

Under the hood: X_pre cannot have been affected by the treatment, so subtracting its variation removes noise WITHOUT biasing the treatment effect.

Payoff: variance reduction of 30-50% is common, which is equivalent to a much larger sample for free — and since n scales as 1/Δ², that meaningfully shrinks the detectable effect.

Requires: a pre-period metric correlated with the outcome.`},{front:"Novelty and primacy effects in experiments",back:`Novelty: users engage with anything new simply because it is new, so early results overstate the true effect. Primacy: users trained on the old design temporarily do WORSE with a better new one.

Under the hood: both are transient behavioural responses to CHANGE, not to the change's quality. They decay over time.

Detect: plot the treatment effect by day. A curve trending toward zero signals novelty.

Fix: run long enough for the effect to stabilise, and analyse new users separately since they have no prior expectation to unlearn.`},{front:"Robust statistics — median, MAD, and trimming",back:`The mean and standard deviation have a breakdown point of 0: ONE extreme value can move them arbitrarily. The median has a breakdown point of 50%.

Robust alternatives: median for location, MAD (median absolute deviation) or IQR for spread, Huber loss for regression (quadratic near zero, linear in the tails).

When it matters: heavy-tailed data — revenue, latency, session length are all right-skewed.

Gotcha: mean latency is nearly meaningless; SLAs are written on p95/p99 precisely because the tail is what users feel.`},{front:"Why log-transform a skewed variable?",back:`It compresses the right tail, turning multiplicative relationships into additive ones and often stabilising variance.

Under the hood: log turns y = a·x^b into log y = log a + b·log x, so a power law becomes linear and coefficients read as elasticities (a 1% change in x → b% change in y).

Use for: income, prices, counts, page views, durations.

Gotchas: undefined at 0 (use log1p), and E[log Y] ≠ log E[Y] by Jensen's inequality — so back-transforming a mean prediction underestimates the true mean.`}],i=[{front:"Probability vs likelihood — what is the difference?",back:`Both come from the same function P(data | θ), read in opposite directions.

Probability: θ is FIXED, data varies. "Given a fair coin, how likely is 8 heads in 10?"

Likelihood: DATA is fixed, θ varies. "Given I saw 8 heads, how well does p=0.5 explain it?"

Under the hood: likelihood is a function of the parameter, and it does NOT integrate to 1 over θ. That is why it is not a probability distribution over parameters — turning it into one is exactly what a prior and Bayes' rule are for.

Gotcha: "the likelihood that the model is right" is a category error unless you are being Bayesian.`},{front:"Linearity of expectation — and what it does NOT require",back:`E[aX + bY] = aE[X] + bE[Y], ALWAYS. No independence needed.

Why it matters: this is the single most useful trick in probability interviews. Problems that look like they need a joint distribution collapse into a sum.

Example: expected number of fixed points in a random permutation of n items. Define an indicator per position, each with E = 1/n. Sum = 1. The indicators are dependent, and it does not matter.

Gotcha: linearity does NOT extend to products or variances. E[XY] = E[X]E[Y] requires independence, and Var(X+Y) needs the covariance term.`},{front:"Variance algebra — Var(aX+b) and Var(X+Y)",back:`Var(aX + b) = a²Var(X). The shift b vanishes; the scale is squared.

Var(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y). Only if independent does the covariance drop out.

Under the hood: variance is a squared quantity, so it is not linear — this is why standard deviations do not add but variances (of independent terms) do.

Example: the standard error of a mean. Var(X̄) = Var(X)/n, so SE = σ/√n. The √n comes directly from the squared scaling.

Gotcha: averaging correlated observations does not reduce variance by 1/n — positive correlation makes your effective sample size smaller than n.`},{front:"Law of total expectation (and total variance)",back:`E[X] = E[E[X|Y]] — average the conditional means, weighted by how often each condition occurs.

Total variance: Var(X) = E[Var(X|Y)] + Var(E[X|Y]) — "within-group variance" plus "between-group variance."

Why it matters in ML: this IS the bias-variance style decomposition, and it is how you reason about hierarchical/grouped data.

Example: overall conversion rate = weighted average of per-segment rates. If you weight wrong, you get Simpson's paradox.

Use when: a quantity is easier to reason about conditionally than marginally — condition, then average back.`},{front:"Independence vs conditional independence",back:`Independent: P(A,B) = P(A)P(B). Conditionally independent given C: P(A,B|C) = P(A|C)P(B|C).

Critical point: neither implies the other. Two variables can be dependent marginally but independent once you condition, and independent marginally but dependent once you condition.

Example of the second: two independent coin flips become dependent once you know their sum. Conditioning on a common EFFECT creates dependence — that is collider bias.

ML relevance: Naive Bayes assumes conditional independence given the class, not marginal independence. Graphical models are essentially bookkeeping for which conditional independencies hold.`},{front:"Law of Large Numbers vs Central Limit Theorem",back:`LLN: the sample mean CONVERGES to the true mean as n grows. It tells you WHERE you end up.

CLT: the sample mean's distribution around that value becomes normal with spread σ/√n. It tells you HOW FAR OFF you typically are.

So: LLN gives consistency, CLT gives the error bars. You need CLT, not LLN, to build a confidence interval.

Gotcha: LLN needs a finite mean; CLT additionally needs finite variance. For a Cauchy distribution the sample mean never settles at all — averaging more data does not help.`},{front:"Jensen's inequality",back:`For a CONVEX function f: E[f(X)] ≥ f(E[X]). Reversed for concave f. Equality only if f is linear or X is constant.

Why it matters: it says "the average of a transform ≠ the transform of the average," which quietly breaks a lot of intuition.

Example: E[log Y] < log E[Y]. So back-transforming a mean prediction from log space UNDERESTIMATES the mean on the original scale.

ML relevance: it is the reason the ELBO in variational inference is a lower bound, and why log-loss and geometric means behave the way they do.`},{front:"Chebyshev's inequality",back:`P(|X − μ| ≥ kσ) ≤ 1/k². At least 75% of any distribution lies within 2σ, at least 89% within 3σ.

What makes it useful: it assumes NOTHING about the shape — no normality required. That generality is also why it is loose.

Contrast: for a normal distribution, 2σ actually captures 95%, not merely 75%. Chebyshev is a worst-case guarantee.

Use when: you need a distribution-free bound, or you want to show a result holds without assuming Gaussianity. It is also the standard tool for proving the Law of Large Numbers.`},{front:"Odds, log-odds, and the logit",back:`Odds = p/(1−p), ranging over (0,∞). Log-odds (logit) = log(p/(1−p)), ranging over (−∞,∞).

Under the hood: this is exactly why logistic regression models the LOGIT as linear — a linear function can output any real number, while p must stay in [0,1]. The logit is the bridge.

Interpretation: a coefficient β means a one-unit change in x multiplies the odds by e^β.

Gotcha: odds ratios and risk ratios are different numbers and are routinely confused. With rare events they nearly coincide; with common events they diverge badly.`},{front:"Standard deviation vs standard error",back:`SD describes the SPREAD OF THE DATA. SE describes the UNCERTAINTY OF AN ESTIMATE: SE = σ/√n.

The key difference: SD does not shrink as you collect more data — the population is as variable as it is. SE shrinks as √n, because your estimate of the mean gets sharper.

Gotcha: plotting SE error bars and calling them "variability" makes results look far more precise than they are. Show SD for describing a distribution; SE (or a CI) for describing an estimate.

Interview trap: "what happens to SD and SE if you quadruple n?" SD: unchanged. SE: halves.`},{front:"Bessel's correction — why divide by n−1?",back:`The sample variance divides by n−1, not n, to be an UNBIASED estimator of population variance.

Under the hood: you compute deviations from the SAMPLE mean, which is itself fitted to the data and sits closer to the points than the true mean does. That makes the sum of squared deviations systematically too small; n−1 corrects for it exactly.

Degrees of freedom view: estimating the mean consumes one degree of freedom, leaving n−1.

Gotcha: MLE of variance uses n and IS biased. NumPy defaults to ddof=0 (biased); pandas defaults to ddof=1. They silently disagree.`},{front:"Degrees of freedom — what are you actually counting?",back:`The number of independent pieces of information left after the parameters you estimated from the data.

Rule of thumb: df = n − (number of parameters estimated).

Examples: sample variance has n−1 (the mean was estimated). A two-sample t-test has n₁+n₂−2. A chi-squared test of independence on an r×c table has (r−1)(c−1), because the margins are fixed.

Why it matters: df determines the reference distribution, so getting it wrong gives the wrong p-value. It also explains why heavily parameterised models need much more data before their estimates mean anything.`},{front:"Monte Carlo estimation",back:`Approximate an expectation by sampling: E[f(X)] ≈ (1/n)Σ f(xᵢ).

The crucial property: the error shrinks as 1/√n REGARDLESS OF DIMENSION. Deterministic quadrature degrades exponentially with dimension, which is why Monte Carlo dominates in high-dimensional problems.

Cost implication: one extra decimal digit of accuracy needs 100× the samples. Monte Carlo is robust but never precise cheaply.

ML uses: dropout at inference, bootstrap, MCMC posteriors, policy-gradient estimates, and any expectation you cannot integrate in closed form.`},{front:"Importance sampling",back:`Estimate an expectation under p using samples from a different distribution q, reweighting by w = p(x)/q(x): E_p[f] = E_q[f·w].

Why you need it: often you cannot sample from p, or the events you care about are rare under it.

Requirement: q must cover the support of p. Where q(x)=0 and p(x)>0, that region is invisible and the estimate is silently biased.

Gotcha: if q is a poor match, a few samples get enormous weights and the variance explodes — the effective sample size collapses to a handful of points. Clipped or self-normalised weights are the standard defence.

ML relevance: exactly the machinery behind off-policy evaluation and IPS in recommenders.`}],s=[{front:"Bernoulli and Binomial — and when the Binomial breaks",back:`Bernoulli: a single trial, P(success)=p. Mean p, variance p(1−p).

Binomial: the number of successes in n INDEPENDENT trials with CONSTANT p. Mean np, variance np(1−p).

Under the hood: variance is maximal at p=0.5 and vanishes at 0 or 1 — extreme rates are inherently less variable, which is why conversion tests on very rare events need far more traffic than the raw rate suggests.

Gotcha: the two assumptions fail constantly in practice. Repeated visits by the same user break independence; a p that drifts over the test window breaks constancy. Both make the true variance larger than the formula, so your p-values are too optimistic.`},{front:"Poisson distribution — when does it apply?",back:`Counts of events in a fixed interval, when events are independent and occur at constant rate λ. Mean = variance = λ.

That equality is the signature: if your count data has variance far exceeding the mean, it is OVERDISPERSED and Poisson is the wrong model — use negative binomial.

Example: requests per second, clicks per session, defects per batch.

Under the hood: it is the limit of a Binomial as n→∞ and p→0 with np=λ fixed — the "many chances, each unlikely" regime.

Gotcha: real traffic is bursty and rate-varying, which produces overdispersion almost by default.`},{front:"Exponential distribution and memorylessness",back:`Models the WAITING TIME between Poisson events. Mean 1/λ.

Memoryless: P(T > s+t | T > s) = P(T > t). Having waited already tells you nothing about how much longer you will wait — the exponential is the only continuous distribution with this property.

Example: if session length were exponential, a user 10 minutes in has the same expected remaining time as a fresh one.

Gotcha: real durations are usually NOT memoryless. Session length, tenure and failure times typically show either "the longer you have stayed, the longer you will stay" or wear-out. Use Weibull or log-normal when the hazard rate is not constant.`},{front:"The Normal distribution — why is it everywhere?",back:`Three independent reasons: (1) CLT — sums/averages of many small independent effects converge to it; (2) it is the MAXIMUM ENTROPY distribution for a given mean and variance, so it is the least-assuming choice when you only know those two; (3) it is mathematically convenient — closed under linear combinations and conditioning.

Properties: fully described by μ and σ; uncorrelated jointly-normal variables are independent (true for the normal, NOT in general).

Gotcha: it has thin tails, so it badly underestimates extreme events in finance, latency and network traffic. Assuming normality where tails are heavy is how risk models fail.`},{front:"Student's t distribution — why the heavier tails?",back:`The sampling distribution of a mean when σ is UNKNOWN and estimated from the same small sample.

Under the hood: you are dividing by an estimated standard deviation that is itself noisy. Sometimes you underestimate it, inflating the ratio — so extreme values happen more often than under a normal. Hence fatter tails.

Behaviour: as df→∞ it converges to the normal, because σ̂ becomes reliable. By n≈30 the difference is small.

Use when: small samples with unknown variance. Also useful deliberately as a heavy-tailed likelihood for robust regression.`},{front:"Chi-squared distribution — where does it come from?",back:`The sum of k squared independent standard normals. Mean k, variance 2k. Strictly positive and right-skewed.

Why it shows up: whenever you sum squared deviations. It is the reference distribution for sample variance, for goodness-of-fit tests, and for likelihood ratio tests (−2 log Λ is asymptotically chi-squared).

Under the hood: the df equals the number of independent squared terms after subtracting estimated parameters — which is exactly why df bookkeeping matters so much in these tests.

Example: comparing observed vs expected counts across categories.`},{front:"Beta distribution — the natural prior for a rate",back:`Defined on [0,1], parameterised by α and β. Mean α/(α+β).

Why it pairs with the Binomial: it is the CONJUGATE prior. Observing s successes and f failures updates Beta(α,β) → Beta(α+s, β+f). The update is literally addition — no integration needed.

Intuition: α−1 and β−1 act as "prior successes and failures." Beta(1,1) is uniform, i.e. no information.

Use in ML: Bayesian A/B testing, Thompson sampling for bandits, and smoothing sparse rates — a new item with 1 click from 2 impressions gets pulled toward the prior instead of being scored 50%.`},{front:"Log-normal distribution",back:`X is log-normal if log(X) is normal. Strictly positive and right-skewed.

Why it appears so often: it arises from MULTIPLICATIVE processes, just as the normal arises from additive ones. Anything produced by repeated proportional growth tends log-normal.

Examples: income, house prices, session length, latency, file sizes, revenue per user.

Gotcha: mean ≠ median, and the mean is pulled well above the median by the tail. Reporting a "mean revenue per user" on log-normal data describes almost nobody. E[X] = exp(μ + σ²/2), NOT exp(μ) — which is why naive back-transformation understates the mean.`},{front:"Power laws and heavy tails",back:`P(X > x) ∝ x^(−α). Scale-free: no typical value, and the tail dominates all the totals.

Consequences: for α ≤ 2 the variance is INFINITE, and for α ≤ 1 even the mean is. Sample statistics simply never stabilise — collecting more data can make the sample mean jump rather than settle.

Examples: item popularity, city sizes, word frequency, degree distributions in networks, wealth.

ML relevance: this is why recommender catalogues have a long tail, why "average" popularity is meaningless, and why CLT-based confidence intervals silently fail on such metrics. Work on logs, use medians, or model the tail explicitly.`},{front:"Skewness and kurtosis",back:`Skewness: asymmetry. Positive = long right tail (mean > median). Kurtosis: tail weight relative to a normal (excess kurtosis > 0 means fatter tails and more outliers).

Why they matter operationally: positive skew makes the mean a poor summary and inflates the variance of the sample mean, so tests lose power. High kurtosis means extreme values arrive more often than any normal-based interval expects.

Gotcha: both are extremely sensitive to outliers — they are built from third and fourth powers, so a single extreme point can dominate the estimate.

Fix: log or Box-Cox transform, winsorise, or switch to rank-based methods.`},{front:"QQ plot — how do you read one?",back:`Plots sample quantiles against theoretical quantiles. A straight line means the distribution matches.

Reading the deviations: an S-curve means the tails are wrong — ends bending UP above the line indicates heavier tails than assumed. A convex or concave bow indicates skew. A single point far off the line is an outlier.

Why prefer it over a histogram: histograms depend heavily on bin width and hide tail behaviour, which is exactly where model assumptions break.

Use when: checking residual normality, or deciding whether a transform actually worked — compare QQ plots before and after.`},{front:"Mixture distributions — and why they fool summary statistics",back:`A distribution formed by drawing from several component distributions with some probability each.

Why it matters in practice: almost all real data is a mixture over unobserved segments — device types, new vs returning users, bot vs human traffic.

Gotcha: a mixture can be bimodal, so the MEAN falls in the valley between the two humps and describes no actual member of the population. Reported alone it is actively misleading.

Signals: bimodal histograms, variance far larger than any component, or a metric that moves without any component moving (the mix shifted). This is the mechanism behind Simpson's paradox and behind drift caused purely by traffic composition.`},{front:"Choosing a likelihood for your target variable",back:`The output distribution should match the data type — this is what picking a loss really means.

Continuous, symmetric → Normal (squared error). Continuous, positive and skewed → log-normal or Gamma (often: model log y). Binary → Bernoulli (cross-entropy). Counts → Poisson, or negative binomial if overdispersed. Counts with an exposure → Poisson with an offset. Bounded proportions → Beta. Time-to-event with censoring → survival model, not regression.

Gotcha: fitting squared error to skewed positive data chases the tail and predicts negative values. Fitting Poisson to overdispersed counts gives confident, wrong standard errors.`}],o=[{front:"Estimator properties: bias, consistency, efficiency",back:`Unbiased: E[θ̂] = θ — correct on average across samples. Consistent: θ̂ → θ as n → ∞. Efficient: achieves the lowest possible variance among a class of estimators.

Critical point: these are independent. An estimator can be unbiased but inconsistent, or BIASED YET CONSISTENT — the MLE of variance divides by n, is biased, and still converges.

Why ML cares: we routinely PREFER biased estimators. Ridge regression is deliberately biased because the variance reduction more than pays for it. Unbiasedness is a nice property, not a goal.`},{front:"MSE of an estimator = bias² + variance",back:`E[(θ̂ − θ)²] = (E[θ̂] − θ)² + Var(θ̂).

Why this is the central idea in ML: it licences trading bias for variance. A little bias that buys a large variance reduction lowers total error.

Examples: shrinking a noisy per-item conversion rate toward the global mean is biased but has far lower MSE for sparse items. Regularisation, early stopping and ensembling are all this trade in different clothing.

Gotcha: it is defined for SQUARED loss. Under other losses the decomposition does not split so cleanly, which is why the "bias-variance" story is fuzzier for classification.`},{front:"Fisher information and the Cramér-Rao bound",back:`Fisher information I(θ) measures how sharply the log-likelihood peaks — how much the data actually tells you about θ. It is the expected curvature (negative second derivative) of the log-likelihood.

Cramér-Rao bound: any unbiased estimator has Var(θ̂) ≥ 1/I(θ). There is a hard floor on precision set by the data itself.

Consequences: MLE asymptotically ACHIEVES this bound, which is what "asymptotically efficient" means. The inverse Hessian at the optimum is the standard way to get standard errors for fitted parameters.

Intuition: a flat likelihood means many parameter values explain the data equally well, so the estimate is inherently imprecise.`},{front:"Method of moments",back:`Set sample moments equal to theoretical moments and solve for the parameters. To fit a Gamma, match the sample mean and variance to λ and k.

Strengths: simple, closed-form, needs no optimisation, and gives good starting values for MLE.

Weaknesses: generally less efficient than MLE (higher variance), can produce estimates outside the valid parameter range, and ignores information beyond the moments used.

Why it still appears: it is the practical way to fit a prior from historical data in empirical Bayes, and it is a common interview question because it exposes whether you understand what an estimator IS.`},{front:"Sufficient statistic",back:`A statistic T(X) is sufficient for θ if the data carries no further information about θ once you know T(X).

Examples: for a Bernoulli sample, the COUNT of successes is sufficient — the order of the flips is irrelevant. For a normal with known variance, the sample mean is sufficient.

Why it matters practically: sufficiency is what makes summarisation lossless. It tells you exactly what you must store or stream to fit a model, which is the basis of online/streaming estimation and of what a feature store really needs to keep.

Connection: exponential-family distributions are precisely those with simple sufficient statistics, which is why they dominate GLMs.`},{front:"Delta method",back:`Gives the approximate variance of a FUNCTION of an estimator: Var(g(θ̂)) ≈ g'(θ̂)²·Var(θ̂).

Why experimentation needs it: many key metrics are RATIOS — clicks per session, revenue per user — where the numerator and denominator are both random and correlated. The naive standard error is wrong.

Example: for a ratio R = X/Y, the delta method gives the variance including the covariance term, which is how you build a correct confidence interval for CTR when sessions per user varies.

Gotcha: it is a first-order Taylor approximation, so it degrades for strongly non-linear g or small samples. Bootstrap is the assumption-light alternative.`},{front:"Conjugate priors",back:`A prior is conjugate when the posterior belongs to the same family, so updating is closed-form.

The standard pairs: Beta-Binomial (rates), Gamma-Poisson (counts), Normal-Normal (means with known variance), Dirichlet-Multinomial (category proportions).

Why they matter: the posterior update becomes arithmetic instead of integration, which makes online/streaming Bayesian updates trivial — exactly what bandits need to run per-request.

Gotcha: conjugacy is a convenience, not a truth. If the conjugate family cannot express your actual prior belief, you are letting tractability pick your assumptions. With modern MCMC/variational tools that trade is often unnecessary.`},{front:"Beta-Binomial updating in practice",back:`Start with Beta(α,β). Observe s successes and f failures. Posterior = Beta(α+s, β+f). Posterior mean = (α+s)/(α+β+s+f).

Why this is so useful: it is principled smoothing. An item with 1 click in 2 impressions has a raw rate of 50%; with a Beta(1,20) prior its posterior mean is about 9% — pulled sensibly toward the population rate.

Interpretation: α+β acts as the strength of the prior, measured in pseudo-observations. Fit them from your historical rate distribution (empirical Bayes) rather than guessing.

Use in ML: ranking sparse items, cold-start scoring, and Thompson sampling for exploration.`},{front:"Credible interval vs confidence interval",back:`Credible interval (Bayesian): given this data and prior, there is a 95% probability the parameter lies in here. A statement about the PARAMETER.

Confidence interval (frequentist): a procedure that captures the true parameter 95% of the time across repeated samples. A statement about the PROCEDURE.

Why people conflate them: the natural-language reading of a CI is actually the definition of a credible interval. With a flat prior and lots of data the two often coincide numerically — which reinforces the confusion.

When the difference bites: small samples and strong priors, where they can diverge substantially.`},{front:"Posterior predictive distribution",back:`The distribution of a NEW observation, averaging the likelihood over the whole posterior rather than plugging in a single best-fit parameter.

Why it matters: it propagates parameter uncertainty into the prediction. A point estimate gives you one number; the posterior predictive gives an interval that widens honestly when you have little data.

Example: predicting next month's conversions from 10 historical days should be far more uncertain than from 1000 — plugging in θ̂ hides that entirely.

ML relevance: this is precisely what deep ensembles and MC-dropout approximate, and why they give better-calibrated uncertainty than a single network.`},{front:"Empirical Bayes and shrinkage",back:`Estimate the PRIOR from the data itself (across all groups), then use it to shrink each group's individual estimate toward the global mean.

Under the hood: the amount of shrinkage is automatic — groups with little data get pulled hard toward the population, groups with lots of data barely move. It is a principled bias-variance trade per group.

Example: ranking sellers by rating when some have 3 reviews and others 3000. Raw averages put a 3-review 5.0 above a 3000-review 4.8, which is obviously wrong; shrinkage fixes it.

Also called: James-Stein estimation, hierarchical/partial pooling. The surprising result is that shrinkage beats raw means in total squared error even when it biases every individual estimate.`},{front:"Bayesian A/B testing",back:`Model each arm's rate with a posterior and report P(B > A) and the distribution of the lift, instead of a p-value.

Advantages: no fixed sample size required, so continuous monitoring is legitimate (you are not repeatedly testing a null); results are directly decision-shaped ("87% chance B is better, expected loss if we ship B is 0.2%"); it handles small samples gracefully via the prior.

Gotchas: the prior is a real choice and a strong one can drive conclusions on small data; "probability B is better" is NOT a false-positive rate, so it does not bound errors the way α does; and stopping as soon as P(B>A) looks good still inflates the chance of shipping a loser.`},{front:"Prior sensitivity and weakly informative priors",back:`A prior is defensible when either the data overwhelms it or you can justify it substantively.

Weakly informative: broad enough not to drive the conclusion, tight enough to rule out absurdity — e.g. a conversion-rate prior that excludes 90% but allows anything plausible. Preferred over "uninformative" flat priors, which are often not actually uninformative after reparameterisation and can put most of their mass on nonsense.

What to do: run a sensitivity analysis — refit under two or three reasonable priors. If the conclusion flips, say so; the data is not deciding the question.

Gotcha: with sparse or heavily imbalanced data, the prior IS the answer. Report that honestly.`}],r=[{front:"t-test — the three variants and when to use each",back:`One-sample: is this mean different from a fixed value? Two-sample (independent): do two groups differ? Paired: do matched observations differ (before/after, same user under both conditions)?

Why paired matters: pairing removes between-subject variability from the comparison, so it is far more powerful for the same n. If your design has a natural pairing and you run an unpaired test, you are throwing away power.

Assumptions: roughly normal sampling distribution of the mean (CLT usually covers it), independent observations, and — for the classic version — equal variances.

Gotcha: repeated measurements from the same user are not independent observations.`},{front:"z-test vs t-test",back:`z-test: population σ known, or n large enough that σ̂ is effectively exact. t-test: σ estimated from the sample.

In practice: you almost never know σ, so the t-test is the honest default. The two converge as n grows — beyond n≈30 the difference in critical values is negligible.

Why it still matters: with small n, using z instead of t gives intervals that are too NARROW and p-values that are too small, because it ignores the uncertainty in your variance estimate.

Proportions: for large-sample proportion tests a z-test is standard, since the variance is determined by p itself rather than estimated separately.`},{front:"Welch's t-test — and why it should be your default",back:`A two-sample t-test that does NOT assume equal variances, adjusting the degrees of freedom instead.

Why default to it: the equal-variance assumption is usually false, and Student's version is not robust to violating it — especially with unequal group sizes, where it gives badly wrong error rates. Welch costs almost nothing in power when variances ARE equal.

Gotcha: the common ritual of running Levene's test first and then choosing is itself a form of multiple testing that distorts the error rate. Just use Welch.

Relevance to A/B tests: treatment often changes the variance as well as the mean, so unequal variances are the norm.`},{front:"Chi-squared test of independence",back:`Tests whether two categorical variables are associated, comparing observed counts to those expected under independence: Σ(O−E)²/E, with df = (r−1)(c−1).

Use for: conversion by variant, feature category vs outcome, any contingency table.

Assumptions: independent observations and adequate expected counts — the usual rule is all expected counts ≥ 5. Below that the chi-squared approximation breaks and you should use Fisher's exact test.

Gotcha: it tells you THAT there is an association, not where or how strong. With large n, trivial associations become significant, so pair it with an effect size such as Cramér's V.`},{front:"Fisher's exact test",back:`Computes the exact probability of the observed 2×2 table (and more extreme ones) under independence, using the hypergeometric distribution rather than an approximation.

Use when: small samples or sparse cells, where chi-squared's expected-count assumption fails.

Under the hood: it conditions on the observed margins and enumerates possible tables — exact, but combinatorially expensive for large tables.

Gotcha: it is somewhat CONSERVATIVE (actual error rate below nominal), so it can be underpowered. For large samples chi-squared is fine and much cheaper.`},{front:"ANOVA and the F-test",back:`Tests whether three or more group means differ, via the F ratio = between-group variance / within-group variance.

Why not many t-tests: comparing k groups pairwise inflates the false positive rate. ANOVA gives one omnibus test at the intended α.

Critical limitation: a significant F tells you SOME groups differ, not which. You then need post-hoc comparisons with correction (Tukey HSD) — and that step is where people quietly reintroduce the multiple-comparisons problem.

Assumptions: normality of residuals, independence, and equal variances across groups (use Welch's ANOVA otherwise).`},{front:"Mann-Whitney U / Wilcoxon rank-sum",back:`A non-parametric alternative to the two-sample t-test, operating on RANKS rather than values. Tests whether one group tends to produce larger values.

Use when: heavy skew, outliers, ordinal data, or small samples where normality is doubtful.

Under the hood: replacing values with ranks caps the influence of any single extreme point, which is where the robustness comes from — and also what it costs you, since magnitude information is discarded.

Gotcha: it is NOT a test of medians in general — it tests stochastic dominance. If the two distributions have different shapes, a significant result can occur with equal medians. Wilcoxon SIGNED-rank is the paired version.`},{front:"Kolmogorov-Smirnov test",back:`Compares two distributions (or one against a theoretical one) using the maximum vertical distance between their empirical CDFs.

Use in ML: the standard drift detector for continuous features — compare the live feature distribution against the training one.

Strength: distribution-free and sensitive to any difference in shape, not just location.

Gotchas: it is most sensitive near the CENTRE of the distribution and comparatively blind in the tails, which is often where drift matters most. With large n it flags statistically significant but practically irrelevant differences — so monitor the KS STATISTIC as an effect size, not its p-value. It also only handles continuous data.`},{front:"One-tailed vs two-tailed tests",back:`Two-tailed: is there any difference? One-tailed: is it specifically in this direction?

The trade-off: a one-tailed test at α=0.05 puts the whole rejection region on one side, so it has more power to detect an effect in that direction — but ZERO ability to detect the opposite.

Gotcha: choosing one-tailed AFTER seeing the direction of your result effectively doubles your false positive rate. The direction must be committed to in advance for a substantive reason.

Practical guidance: use two-tailed almost always in experimentation. You genuinely do want to know if your new model made things worse.`},{front:"Effect size and Cohen's d",back:`Effect size measures MAGNITUDE independently of sample size. Cohen's d = (mean₁ − mean₂)/pooled SD — the difference expressed in standard deviations.

Rules of thumb: 0.2 small, 0.5 medium, 0.8 large.

Why it is essential: p-values conflate effect size with sample size. With n large enough, everything is significant. The effect size is what tells you whether anyone should care.

Other forms: Cramér's V for categorical association, r or R² for variance explained, odds ratio for binary outcomes, and absolute lift for business decisions.

Interview answer: always report an effect size and a confidence interval alongside any p-value.`},{front:"FWER vs FDR — which should you control?",back:`Family-Wise Error Rate: P(at least one false positive anywhere). Controlled by Bonferroni. Very strict, and power collapses as tests multiply.

False Discovery Rate: the expected PROPORTION of your rejections that are false. Controlled by Benjamini-Hochberg.

Choosing: control FWER when a single false positive is costly and you will act on each finding individually — a confirmatory experiment, a regulatory claim. Control FDR when you are screening many candidates and will follow up in bulk — feature selection, gene screens, scanning many segments.

Gotcha: Bonferroni on 500 tests makes almost nothing significant, so people quietly drop the correction. FDR is the honest middle ground.`},{front:"Equivalence and non-inferiority testing",back:`Standard tests can never prove "no difference" — failing to reject the null is not evidence of equivalence.

Equivalence testing inverts the logic: define a margin δ of practical indifference, and test whether the difference lies entirely INSIDE (−δ, +δ). TOST (two one-sided tests) is the usual implementation.

Why ML teams need it: "the smaller, cheaper model is no worse than the big one" is an equivalence claim. So is "this refactor did not change behaviour."

Gotcha: the margin δ must be chosen on substantive grounds before the test. Choosing it after seeing the data makes the whole thing meaningless.`},{front:"Parametric vs non-parametric — the real trade-off",back:`Parametric tests assume a distributional form and estimate its parameters. Non-parametric tests assume much less, usually working through ranks or resampling.

The trade-off: if the parametric assumptions hold, those tests have MORE POWER for the same n. If they fail, the parametric error rates are simply wrong.

Practical guidance: with large n, the CLT makes mean-based parametric tests robust to non-normality, so use them. With small n, heavy skew, or extreme outliers, prefer rank-based tests, a permutation test, or a bootstrap.

Gotcha: non-parametric does NOT mean assumption-free — most still require independence and exchangeability.`},{front:"Statistical vs practical significance",back:`Statistical significance says an effect is probably not zero. Practical significance says it is big enough to act on. They are unrelated questions.

Four possible outcomes, and two are traps: significant but trivially small (huge n detecting a 0.01% lift that costs more to ship than it earns), and non-significant but potentially large (underpowered test, wide interval that includes both a big win and a big loss — that is "we do not know," not "no effect").

What to report: the effect size with a confidence interval, compared against a pre-declared minimum meaningful effect. Then the decision follows from where the interval sits relative to that threshold.`}],l=[{front:'Gauss-Markov theorem — what makes OLS "BLUE"?',back:`Under linearity, exogeneity (E[ε|X]=0), homoscedasticity, and no autocorrelation, OLS is the Best Linear Unbiased Estimator — lowest variance among all linear unbiased estimators.

Note what is NOT required: normality of errors. Normality is needed for exact t and F inference in small samples, not for OLS to be BLUE.

Why "linear unbiased" is a real limitation: it says nothing about biased estimators. Ridge is biased and can have far lower MSE — Gauss-Markov does not contradict that, it simply excludes it from the comparison.

Which assumption matters most: exogeneity. Violate it and OLS is BIASED, not merely inefficient.`},{front:"Omitted variable bias",back:`Leaving out a variable that affects Y and is correlated with an included X biases that X's coefficient.

Direction: bias = (effect of omitted on Y) × (correlation of omitted with X). So you can often SIGN the bias even without the data — a genuinely useful interview move.

Example: regressing salary on years of education without ability. Ability raises salary and correlates with education, so education's coefficient absorbs part of ability's effect and is overstated.

Why it matters in ML: it is why coefficients from an observational model are not causal effects, and why "the model says feature X drives Y" is an unsafe claim.`},{front:"Leverage, influence, and Cook's distance",back:`Leverage: how unusual a point's X values are — its potential to move the fit. Influence: how much it ACTUALLY moves the fit. Cook's distance combines both.

Key distinction: high leverage is not automatically a problem. A point far out in X that sits on the trend line has high leverage and low influence. Danger comes from high leverage COMBINED with a large residual.

Rule of thumb: investigate Cook's distance > 4/n.

What to do: never delete points merely for being influential. Check whether they are data errors, and if they are genuine, report the fit with and without them, or use a robust regression that limits their pull.`},{front:"Residual diagnostics — what to plot and what it means",back:`Residuals vs fitted: should be a formless band around zero. Curvature means a missing non-linear term; a fan shape means heteroscedasticity.

QQ plot of residuals: checks normality, which matters for small-sample inference.

Residuals vs each predictor: reveals which variable needs a transform or an interaction.

Residuals vs time or index: any pattern means autocorrelation, so your standard errors are wrong.

Why bother: R² can look fine while the model is structurally wrong. The residuals are where the misspecification shows, and they tell you what to fix rather than just that something is off.`},{front:"Interaction terms — and the rule people break",back:`An interaction X₁·X₂ lets the effect of one variable depend on the level of the other.

The rule: if you include an interaction, you must include both MAIN EFFECTS. Omitting one forces an implausible constraint through the origin and makes the interaction coefficient uninterpretable.

Interpretation shift: with an interaction present, the coefficient on X₁ is no longer "the effect of X₁" — it is the effect when X₂ = 0. If X₂ is never near zero, that number is meaningless. CENTRE the variables so the main effects read at average values.

Why trees do this for free: any tree or boosted ensemble captures interactions implicitly by splitting, which is a large part of why they beat linear models on tabular data.`},{front:"Dummy variable trap",back:`Encoding a k-level category as k dummies AND keeping an intercept makes the design matrix singular — the dummies sum to the intercept, so the coefficients are not identified.

Fix: drop one level as the reference (k−1 dummies), or drop the intercept.

Interpretation: each coefficient is then the difference from the reference level, not an absolute effect. Changing the reference changes all the numbers without changing the model's predictions.

When it does NOT matter: regularised models (ridge/lasso) and tree models handle full one-hot encoding fine, since regularisation resolves the degeneracy. It is specifically an unregularised-OLS inference problem.`},{front:"GLMs and link functions",back:`A GLM has three parts: a distribution for Y from the exponential family, a linear predictor Xβ, and a LINK function g mapping the mean to that linear scale: g(μ) = Xβ.

Why the link exists: it keeps predictions in the valid range. Logit keeps probabilities in (0,1); log keeps rates positive. Fitting a plain linear model to a probability happily predicts 1.4.

Standard pairings: Normal + identity = OLS. Bernoulli + logit = logistic regression. Poisson + log = count regression. Gamma + log = positive skewed outcomes.

Unified view: choosing a loss in ML is usually choosing a distribution here — and cross-entropy is exactly the Bernoulli GLM's likelihood.`},{front:"Poisson regression and overdispersion",back:`Models counts with a log link, so coefficients read as multiplicative effects on the rate.

The built-in assumption: variance = mean. Real count data usually has variance much LARGER (overdispersion), caused by unobserved heterogeneity or clustering.

Consequence: standard errors are understated, so everything looks significant. The point estimates are often fine; the inference is not.

Fixes: negative binomial regression (adds a dispersion parameter), quasi-Poisson (inflates the standard errors), or robust/cluster-robust standard errors.

Also: use an OFFSET (log of exposure) when counts come from unequal windows or populations, otherwise you are modelling volume rather than rate.`},{front:"Quantile regression",back:`Models a chosen QUANTILE of Y given X rather than the mean, by minimising an asymmetric absolute loss (the pinball loss).

Why it is useful: the relationship can differ across the distribution. A feature may barely move median latency while strongly affecting the 99th percentile — which is precisely the part users feel.

Advantages: no distributional assumption, robust to outliers, and gives genuine prediction INTERVALS by fitting several quantiles.

ML relevance: this is how gradient boosting produces prediction intervals, and how demand forecasting handles asymmetric costs — overstock and stockout rarely cost the same, so the optimal forecast is not the mean.`},{front:"Measurement error and regression dilution",back:`Random noise in a PREDICTOR biases its coefficient TOWARD ZERO — attenuation. Noise in the outcome inflates standard errors but does not bias the coefficient.

Under the hood: noise adds variance to X without adding covariance with Y, and the OLS slope is Cov(X,Y)/Var(X). A larger denominator with an unchanged numerator shrinks the slope.

Consequence: a poorly measured feature looks unimportant even when the underlying quantity matters a lot — which can lead you to drop the right variable for the wrong reason.

Worse in multivariable models: attenuation on one variable spills bias onto the others, in either direction.`},{front:"Anscombe's quartet and the Datasaurus",back:`Four datasets with identical means, variances, correlation and regression line — yet completely different shapes: one linear, one curved, one with an outlier driving everything, one where a single point creates the entire slope.

The Datasaurus takes it further: a dozen datasets sharing summary statistics to two decimals, one of which is a dinosaur.

The lesson: summary statistics are lossy in ways that can invert your conclusion, and no amount of care choosing WHICH statistics fixes it.

Practical rule: plot the data before modelling, and plot the residuals after. In ML the equivalent is slicing metrics by segment — an aggregate number hides the same kinds of structure.`}],c=[{front:"Potential outcomes framework",back:`Each unit has two potential outcomes: Y(1) if treated and Y(0) if not. The causal effect for that unit is Y(1) − Y(0).

The fundamental problem of causal inference: you only ever OBSERVE one of them. The other is counterfactual and permanently missing, so an individual causal effect is never directly measurable.

Consequence: all causal inference is about estimating AVERAGE effects by finding a credible stand-in for the missing outcome — a comparable control group.

Why this framing helps: it reframes causal questions as a missing-data problem, which makes the assumptions you need explicit rather than implicit.`},{front:"ATE, ATT, and CATE",back:`ATE — Average Treatment Effect over the whole population: E[Y(1) − Y(0)]. ATT — the effect among those actually TREATED. CATE — the effect conditional on covariates X, i.e. the effect for a specific subgroup.

Why they differ: if treatment was not randomly assigned, the treated group is not representative. A voluntary feature's ATT (effect on people who chose it) can be large while the ATE (effect if forced on everyone) is near zero.

Which you want: ATE for "should we ship to everyone?", ATT for "did this campaign work on those we targeted?", CATE for personalisation and targeting — CATE estimation is what uplift modelling does.`},{front:"Why does randomisation actually work?",back:`Random assignment makes treatment INDEPENDENT of every pre-treatment variable — observed and unobserved alike.

Under the hood: that independence means the control group is a valid estimate of what would have happened to the treated group. It closes every back-door path at once, which is why no covariate adjustment is required for an unbiased estimate.

The key advantage over any observational method: it handles CONFOUNDERS YOU DID NOT THINK OF. Propensity matching can only balance what you measured.

Gotcha: randomisation guarantees balance in EXPECTATION, not in your particular sample. Small experiments can still be visibly imbalanced — check, and stratify if it matters.`},{front:"SUTVA — the assumption everyone forgets",back:`Stable Unit Treatment Value Assumption, two parts: (1) NO INTERFERENCE — one unit's treatment does not affect another unit's outcome; (2) consistency — there is only one version of the treatment.

Where it breaks in tech: social networks (your treated friend changes your behaviour), marketplaces (treated buyers consume supply the control group needed), and anything with shared resources or shared caches.

Consequence: when SUTVA fails, even a perfectly randomised A/B test is biased — the control group has been contaminated by the treatment.

Fix: randomise at a higher level — cluster/graph-based randomisation, or geographic or time-based splits.`},{front:"DAGs and the back-door criterion",back:`Draw variables as nodes and causal arrows as edges. A "back-door path" from X to Y is a non-causal path that creates spurious association.

Back-door criterion: to identify the causal effect of X on Y, condition on a set of variables that blocks every back-door path WITHOUT including any descendant of X.

Why this beats intuition: it tells you precisely which variables to control for — and, crucially, which you must NOT. "Control for everything available" is wrong and can introduce bias.

The three structures: chain (X→Z→Y, conditioning on Z blocks it), fork (X←Z→Y, confounder, condition on it), collider (X→Z←Y, do NOT condition).`},{front:"Collider bias",back:`A collider is a common EFFECT of two variables (X→Z←Y). Conditioning on it creates an association between X and Y that does not exist in the population.

Intuition: among people admitted to hospital, being young and being severely ill become negatively correlated — because you generally need one or the other to be admitted at all.

Why this is the most dangerous causal error: it means adding a control variable can CREATE bias where there was none. It is the formal reason "control for more covariates" is not automatically safer.

ML relevance: selecting your training set on a variable downstream of both features and label induces exactly this — the model learns a relationship that vanishes in production.`},{front:"Berkson's paradox",back:`A spurious NEGATIVE association arising from selection on a variable that both causes influence — collider bias in the guise of a sampling rule.

Classic example: at a selective university, SAT score and GPA appear negatively correlated, because admission required a high combination of the two. Anyone low on both was never admitted.

Tech example: among users who converted, ad exposure and organic intent look substitutable, because either alone was enough to convert.

Why it matters: it makes genuinely positive relationships look negative inside a selected sample. Always ask what filter produced this dataset before interpreting a correlation within it.`},{front:"Propensity score matching",back:`Model P(treated | covariates), then compare treated and control units with similar propensity scores.

Under the hood: it collapses many covariates into one dimension, which makes matching feasible in high dimensions. Balancing on the score balances the covariates that went into it.

The assumption that decides everything: NO UNMEASURED CONFOUNDERS. It only balances what you measured, so unobserved selection remains fully intact.

Checks: assess covariate balance after matching (standardised mean differences), and verify overlap — units with no comparable counterpart must be dropped, which changes your estimand from ATE to something narrower.`},{front:"Difference-in-differences",back:`Compare the CHANGE in a treated group to the change in an untreated group: (After−Before)_treated − (After−Before)_control.

Why it helps: differencing removes any time-invariant confounder, even unobserved ones, and the control group removes any common time trend.

The critical assumption — PARALLEL TRENDS: absent treatment, both groups would have moved the same way. This is untestable for the treatment period, but you can look for it in pre-period data (an "event study" plot).

Gotchas: fails if treatment timing correlates with a differential shock; and with staggered adoption across many units, the standard two-way fixed-effects estimator is biased — use a modern staggered DiD estimator.`},{front:"Regression discontinuity",back:`When treatment is assigned by a THRESHOLD on a continuous variable, units just above and just below the cutoff are nearly identical apart from treatment. Compare them.

Why it is compelling: near the cutoff, assignment is effectively random, so it approximates a local experiment without one.

Examples: a credit score cutoff for loan approval, a spend threshold that unlocks a loyalty tier, a rank cutoff for being featured.

Gotchas: the estimate is LOCAL to the cutoff and may not generalise elsewhere. Check for manipulation — bunching just above the threshold means people are gaming it, which breaks the design. Also verify no other policy uses the same cutoff.`},{front:"Instrumental variables",back:`An instrument Z affects treatment X but influences the outcome Y ONLY through X. Use the variation in X driven by Z to estimate the causal effect, bypassing confounding.

Three requirements: relevance (Z genuinely moves X), exclusion (Z has no direct path to Y), and independence (Z is unconfounded).

Classic tech instrument: a randomised NUDGE. If you randomise who is prompted to try a feature, the prompt is an instrument for actually using it — this recovers the effect of usage despite self-selection.

Gotchas: a WEAK instrument gives wildly unstable estimates and amplifies any small violation of exclusion. Exclusion is untestable and is where most IV analyses fail.`},{front:"Intention-to-treat vs per-protocol",back:`ITT: analyse everyone by the group they were ASSIGNED to, regardless of whether they complied. Per-protocol: analyse only those who actually complied.

Why ITT is the default: assignment was randomised, compliance was not. Filtering to compliers reintroduces selection bias, because compliers differ systematically from non-compliers.

The trade-off: ITT answers "what happens if we launch this?" (the real business question) but DILUTES the effect toward zero when compliance is low. Per-protocol estimates the effect of the treatment itself — but with confounding back in.

Best of both: use ITT as the headline, and an IV/CACE analysis to estimate the effect among compliers without the selection bias.`},{front:"Heterogeneous treatment effects (and uplift modelling)",back:`The average effect can be near zero while hiding a large positive effect in one segment and a negative one in another.

Why it matters commercially: shipping to everyone leaves value on the table if you could target. Uplift/CATE models predict the INDIVIDUAL treatment effect rather than the outcome, so you treat only those who respond.

Methods: causal forests, T/S/X-learners, and direct uplift trees splitting on effect difference.

The hard part: you never observe an individual's treatment effect, so there is no ground-truth label to validate against. Evaluation uses Qini/uplift curves on held-out randomised data.

Gotcha: hunting subgroups post hoc until one is significant is p-hacking. Pre-specify, or correct for multiplicity.`}],d=[{front:"Randomisation unit vs analysis unit",back:`They must MATCH. If you randomise by user but analyse by page view, your observations are not independent — one user contributes many correlated rows.

Consequence: the standard error is computed as though you had far more independent data than you do, so confidence intervals are too narrow and false positives soar. This is one of the most common real-world A/B testing bugs.

Fix: analyse at the randomisation unit (aggregate to per-user metrics), or use cluster-robust standard errors / the delta method to account for within-user correlation.

Rule: the more page views per user, the worse the inflation.`},{front:"Cluster randomisation — when and what it costs",back:`Randomise groups (schools, cities, accounts, sessions-by-region) rather than individuals.

Why: it prevents contamination when units interact, so it is the standard answer to SUTVA violations from network effects or shared marketplace supply.

The cost: your EFFECTIVE SAMPLE SIZE is closer to the number of clusters than the number of individuals. Ten cities is ten data points, however many users they contain — so power drops sharply.

Quantified by: the intra-cluster correlation. Higher ICC means members of a cluster are more alike and the effective n is smaller.

Implication: cluster-randomised tests need many more users to detect the same effect.`},{front:"Sample Ratio Mismatch (SRM)",back:`You intended a 50/50 split but observe 50.4/49.6. With large n a chi-squared test on the assignment counts rejects decisively — signalling a bug.

Why it is the single most valuable A/B guardrail: it does not test your metric, it tests your EXPERIMENT. An SRM means assignment, logging, or filtering is broken, so every result from that test is untrustworthy regardless of how good it looks.

Common causes: redirect-based assignment losing slow clients, bot filtering applied unevenly, a crash affecting one variant, or joining on a table that drops rows for one arm.

Rule: if SRM fires, DEBUG — never interpret the metrics. A "winning" test with SRM is usually a broken test.`},{front:"Guardrail metrics",back:`Metrics you do not expect to improve but must not damage: latency, crash rate, unsubscribes, support tickets, and overall revenue.

Why they are essential: teams optimise a single success metric, and the cheapest way to move it is often to harm something else. A recommendation change can raise CTR by degrading page latency or by cannibalising another surface.

How to use them: monitor them for DEGRADATION at a looser threshold, and treat any regression as blocking regardless of the win on the primary metric.

Also include invariants: metrics that logically cannot change (assignment ratio, counts of unaffected surfaces). If they move, you have a bug.`},{front:"Network effects and interference in experiments",back:`Treatment leaks from treated to control units, so the control group is no longer a clean counterfactual.

Mechanisms: social spillover (treated users message untreated ones), marketplace competition (treated buyers take inventory), and shared models or caches trained on pooled traffic.

Direction of the bias: usually it SHRINKS the measured effect, because control is partly treated — so you underestimate a real win. With marketplace competition it can INFLATE it, because the treatment steals from control rather than growing the pie.

Fixes: cluster or graph-partition randomisation, geo splits, time-based switchbacks, or two-sided designs that randomise both sides of a marketplace.`},{front:"Sequential testing and always-valid p-values",back:`Methods designed for CONTINUOUS monitoring, so you can stop as soon as the evidence is sufficient without inflating the false positive rate.

Approaches: group sequential designs with pre-specified interim looks and adjusted boundaries (O'Brien-Fleming), or always-valid p-values / confidence sequences based on martingale bounds.

The trade-off: they are more conservative at any single look than a fixed-n test, so if the effect is large you stop much sooner, and if it is small you may need more data than a fixed design would have.

Why it matters: it makes the natural human behaviour — checking the dashboard daily — statistically legitimate instead of a source of false wins.`},{front:"Stratification and blocking",back:`Randomise WITHIN strata (country, device, new vs returning, pre-period activity level) so each arm gets balanced representation.

Why it helps: it removes between-stratum variance from the comparison, reducing the variance of the treatment effect estimate. Same n, more power — the same principle behind CUPED and paired tests.

When it matters most: small experiments where chance imbalance is likely, and populations with a few heavy strata that dominate the metric.

Gotcha: you must ANALYSE with the same stratification you randomised on, otherwise you forfeit the gain. And stratify only on PRE-treatment variables — stratifying on anything post-treatment biases the estimate.`},{front:"Ratio metrics and why their variance is tricky",back:`Metrics like clicks-per-session or revenue-per-order have a random NUMERATOR AND DENOMINATOR, often correlated.

The error: treating the ratio as a simple mean and using the usual standard error. That ignores denominator variance and the covariance, giving intervals that are wrong — often too narrow.

Fix: the delta method gives the correct variance including the covariance term; or bootstrap at the randomisation unit, which handles it without formulas.

Related trap: the ratio of averages ≠ the average of ratios. Per-user CTR averaged across users weights a one-impression user equally with a thousand-impression user. Decide which quantity you actually want.`},{front:"Winsorisation and capping for skewed metrics",back:`Revenue and session-length metrics are heavily right-skewed, so a single whale can dominate the difference between arms and make results swing unpredictably.

Winsorise: clip values above a high percentile (e.g. 99th) to that percentile. Trimming instead DISCARDS them, which changes the population you are describing.

Why it helps: it cuts variance dramatically, restoring power — the outliers were adding noise, not signal about the treatment.

Gotchas: it BIASES the metric (you are no longer estimating true mean revenue), so pre-declare the cap and apply it identically to both arms. If treatment genuinely works by creating whales, capping hides your actual effect.`},{front:"Twyman's law",back:`"Any figure that looks interesting or different is usually wrong."

Why it deserves to be a rule: the prior probability of a 40% lift from a button colour change is far lower than the probability of an instrumentation bug. Extraordinary results are evidence about your pipeline before they are evidence about user behaviour.

What to check first: SRM, logging duplication, filters applied to one arm, a metric definition change shipped in the same window, bot traffic, and whether the effect is concentrated in one platform or one day.

Practical discipline: require a mechanism. If nobody can explain HOW the change produced the effect, treat it as unverified.`},{front:"Interaction between concurrent experiments",back:`Most organisations run many tests simultaneously on overlapping traffic. Usually this is fine — effects are roughly additive and randomisation makes other tests balanced noise.

When it breaks: two tests changing the same surface, or one changing what the other measures. Then the effects are not additive and each test's "control" contains a mixture of the other's variants.

Defences: orthogonal/independent hashing per experiment so overlaps are balanced; mutually exclusive layers for tests known to conflict; and an interaction check on shared surfaces.

Gotcha: with many tests, some pair WILL show a spurious interaction by chance — do not chase every one; require a plausible mechanism.`},{front:"Long-term holdouts and why short tests mislead",back:`A permanent (or long) holdout group that never receives the accumulated changes, measured over months.

Why you need one: short tests capture novelty, miss habituation, and cannot see cumulative or compounding effects. A series of individually positive tests can sum to a negative long-run outcome — notifications that each lift engagement while collectively driving unsubscribes.

What it catches: metric erosion, user fatigue, ecosystem effects, and the gap between short-term proxies and retention.

Costs: some users permanently receive a worse product, it needs disciplined infrastructure to maintain, and the holdout population slowly becomes unrepresentative as it self-selects through churn.`},{front:"Goodhart's law and metric gaming",back:`"When a measure becomes a target, it ceases to be a good measure."

Mechanism: optimisation finds the cheapest path to the number, which is rarely the intended behaviour. The proxy and the goal diverge precisely because you applied pressure to the proxy.

ML examples: optimising CTR produces clickbait; optimising watch time produces autoplay traps; optimising "resolved tickets" produces prematurely closed tickets; optimising a reward model produces outputs that exploit the reward model.

Defences: pair the target with guardrails that capture the harm, use multiple objectives, measure long-term outcomes via holdouts, and re-validate periodically that the proxy still correlates with the goal.`}],h=[{front:"Confusion matrix — the four rates and their denominators",back:`The whole thing turns on which denominator each rate uses.

TPR / recall / sensitivity = TP/(TP+FN) — of the ACTUAL positives, how many did we catch? Specificity = TN/(TN+FP) — of the actual negatives, how many did we clear? Precision / PPV = TP/(TP+FP) — of our POSITIVE PREDICTIONS, how many were right? FPR = FP/(TN+FP) = 1 − specificity.

The key insight: recall and specificity condition on the TRUTH, so they are properties of the model that do not change with prevalence. Precision conditions on the PREDICTION, so it moves with prevalence — the same model has lower precision on rarer positives.`},{front:"Why does PPV collapse when the base rate is low?",back:`Because false positives are drawn from the huge negative class.

Worked example: prevalence 0.1%, sensitivity 99%, specificity 99%. Per 100,000: 100 positives → 99 caught. 99,900 negatives → 999 false positives. PPV = 99/1098 ≈ 9%.

So a "99% accurate" test is wrong about 91% of the people it flags.

Why interviewers love it: it separates people who memorised metric formulas from people who understand conditioning. It is Bayes' rule in applied form.

Implication for ML: on rare-event problems, report precision at your operating threshold — sensitivity and specificity alone will mislead every stakeholder in the room.`},{front:"F1, Fβ, and what F1 quietly assumes",back:`F1 is the HARMONIC mean of precision and recall: 2PR/(P+R). Harmonic, not arithmetic, so it is dominated by the weaker of the two — you cannot compensate for terrible recall with perfect precision.

Fβ generalises it: β>1 weights recall more (fraud, disease screening — misses are costly); β<1 weights precision more (spam filtering, automated actions — false alarms are costly).

What F1 assumes: that precision and recall matter EQUALLY. That is a real modelling choice, and usually a false one. β should come from the actual cost ratio.

Gotcha: F1 ignores true negatives entirely, so it is not symmetric under swapping which class you call positive.`},{front:"Log loss (cross-entropy) as an evaluation metric",back:`Mean of −log(predicted probability of the true class). Unbounded above: one confident wrong prediction can dominate the whole score.

What makes it valuable: it is a PROPER SCORING RULE — uniquely minimised by reporting your true beliefs. It rewards calibration, not just correct ranking, so unlike AUC it punishes overconfidence.

Gotcha: because it is unbounded, it is very sensitive to a handful of confidently wrong cases, and predictions of exactly 0 or 1 give infinite loss — hence clipping.

When to prefer it: whenever the probability itself is consumed downstream (expected-value decisions, bidding, thresholding on cost). Use AUC when only the ordering matters.`},{front:"Matthews correlation coefficient and Cohen's kappa",back:`MCC: correlation between predicted and true labels, in [−1,1]. It uses all four confusion-matrix cells, so unlike F1 it cannot be inflated by ignoring the negative class. High MCC requires doing well on both classes, which makes it a strong single summary under imbalance.

Cohen's kappa: agreement CORRECTED FOR CHANCE — (observed − expected)/(1 − expected). Originally for inter-rater agreement, also used for classifiers.

Why chance correction matters: with 95% of one class, a trivial classifier gets 95% raw agreement. Kappa reports roughly 0, which is the honest answer.

Gotcha: kappa is hard to interpret across different prevalences, so compare it only within a fixed data distribution.`},{front:"Choosing a decision threshold",back:`The model outputs a probability; the THRESHOLD is a separate business decision, and 0.5 is almost never the right one.

Principled approach: pick the threshold minimising expected cost. With cost C_FP and C_FN, the optimal threshold is C_FP/(C_FP + C_FN) — independent of the model. If a miss costs 9× a false alarm, threshold at 0.1.

Alternatives when costs are unknown: fix precision at the level the business can tolerate and take whatever recall follows, or fix the alert VOLUME your review team can actually process.

Gotcha: tune the threshold on a validation set, not the test set, and re-tune after any change in prevalence — the optimal threshold moves with the base rate.`},{front:"McNemar's test — comparing two classifiers properly",back:`Compares two models on the SAME test set using only the cases where they disagree: the counts where A is right and B wrong (b) versus B right and A wrong (c). Statistic ≈ (|b−c|−1)²/(b+c).

Why not a two-proportion test on the accuracies: those two accuracies are computed on the same examples, so they are strongly dependent. Treating them as independent samples overstates the uncertainty and wastes the pairing.

Under the hood: cases both models get right or both get wrong carry NO information about which is better, so they are correctly discarded.

Use when: choosing between two models on one held-out set — the standard "is this improvement real?" question.`},{front:"Comparing models across cross-validation folds",back:`The trap: running a paired t-test on per-fold scores. Folds SHARE TRAINING DATA, so the scores are correlated and the test's independence assumption is violated — it reports significance far too readily.

Better options: repeated k-fold with a corrected resampled t-test that accounts for the overlap; the 5×2cv paired t-test; or, best of all, a single large held-out set with McNemar or a bootstrap interval.

More honest still: report the mean AND spread across folds and ask whether the difference exceeds the fold-to-fold noise. If your improvement is smaller than the variation between folds, you have not shown anything.`},{front:"Bootstrap confidence intervals for a metric",back:`Resample the TEST SET with replacement, recompute the metric each time, and take percentiles of the resulting distribution.

Why it is the practical default: AUC, F1, precision at k and NDCG have no simple analytic standard error, and the bootstrap needs none.

What it reveals: how much of your "+0.3% AUC" is noise. A 95% interval of [−0.4%, +1.0%] settles the argument.

Gotchas: resample at the INDEPENDENT unit — by user, not by row, when a user contributes many rows. For ranking metrics, resample queries/sessions. And it captures only test-set sampling variability, not variance from retraining, so it understates total uncertainty.`},{front:"Nested cross-validation",back:`An outer loop estimates generalisation performance; an inner loop does hyperparameter selection within each outer training fold.

The problem it solves: tuning hyperparameters on the same CV folds you report scores from leaks information — you selected the configuration that happened to suit those folds, so the reported score is optimistically biased. With many configurations tried, that bias is substantial.

Cost: k_outer × k_inner model fits, which is often prohibitive.

Practical alternative: a three-way split — train / validation (for tuning) / test (touched once). Nested CV is mainly worth it when data is scarce enough that a single split is too noisy.`},{front:"Overfitting the validation set",back:`Every decision informed by validation performance — features, architecture, thresholds, early stopping, which experiment to pursue — leaks a little information from it. After hundreds of such choices, validation score is an optimistic estimate of generalisation.

Why it is invisible: no single step feels like cheating, and there is no error message. It is the multiple-comparisons problem applied to model development.

Symptom: a persistent gap where the test or production metric is consistently worse than validation, and the gap widens the longer a project runs.

Defences: hold a test set genuinely untouched until the end, refresh validation data periodically, and be suspicious of tiny improvements accumulated over many iterations.`}],u=[{front:"p-hacking and the garden of forking paths",back:`p-hacking: trying variations — subsets, outlier rules, covariates, transforms, metrics — until something clears p<0.05.

The garden of forking paths is the subtler version: you run ONE analysis, but the choices you made along the way were contingent on the data. No conscious cheating occurred, yet the effective number of tests is large, so the reported p-value is meaningless.

Why it is so common in ML: the analysis pipeline has dozens of defensible-looking decision points.

Defences: pre-register the primary metric and analysis, report every variant you tried, split exploratory from confirmatory work, and validate on genuinely fresh data.`},{front:"HARKing and the Texas sharpshooter fallacy",back:`HARKing: Hypothesising After the Results are Known — presenting a finding discovered in the data as though it had been predicted.

Texas sharpshooter: firing at a barn, then drawing the target around the tightest cluster of holes. Any large dataset contains striking patterns purely by chance; selecting the pattern first and the hypothesis second guarantees you find one.

Why it feels legitimate: the story is constructed after the fact and sounds entirely plausible — plausibility is not evidence.

Defence: exploratory findings are HYPOTHESES, not conclusions. They require confirmation on data that played no part in generating them. Say which mode you are in.`},{front:"Ecological fallacy (and its inverse)",back:`Ecological fallacy: inferring individual behaviour from group-level correlations. Regions with more immigrants may have higher literacy while immigrants individually have lower literacy — the group relationship need not hold at the individual level.

Atomistic fallacy: the reverse, inferring group effects from individual data.

Under the hood: aggregation destroys within-group variation, so group-level correlations are typically stronger and can even flip sign. It is the same machinery as Simpson's paradox.

ML relevance: features aggregated to a coarse level (city-average income as a user feature) do not carry the individual relationship you assume, and models built on them can behave very differently per person.`},{front:"Look-ahead bias and time-travel in features",back:`Any feature computed using information not available at prediction time. Offline metrics look excellent; production collapses.

Common sources: aggregates computed over the full dataset including the future; a label-derived field ("total_purchases" when predicting purchase); a status column that gets UPDATED in place, so the historical row shows today's value; joining a dimension table without effective dates.

The diagnostic question for every feature: would I have known this value, with this value, at the moment of the decision?

Defences: point-in-time correct joins, strictly temporal train/test splits, and immediate suspicion of any single feature with dominant importance.`},{front:"Winner's curse in model and variant selection",back:`When you pick the best of many candidates on a noisy estimate, the winner's TRUE performance is systematically worse than its observed score.

Under the hood: winning requires both genuine quality and favourable noise. Selection is partly selection on noise, which does not repeat — so the effect shrinks on re-measurement.

Consequences: the best of 50 A/B variants overstates its lift; the top Kaggle leaderboard model is partly lucky; the best hyperparameter configuration underperforms its search score.

Why this is regression to the mean with teeth: the more candidates and the noisier the estimate, the bigger the shortfall.

Fix: re-measure the winner on fresh data, or shrink the estimate.`},{front:"Stationarity and spurious regression",back:`A stationary series has constant mean, variance and autocovariance over time. Most business series are NOT stationary — they trend.

Spurious regression: two independent series that both trend upward will show a high R² and a significant coefficient with no relationship whatever. Regressing one random walk on another produces "significant" results the majority of the time.

Detect: an ADF or KPSS test for unit roots; visually, a series that never returns to a mean.

Fix: difference the series, model the trend explicitly, or use cointegration methods if a genuine long-run relationship is suspected. Never interpret a regression between two undifferenced trending series.`},{front:"Autocorrelation and effective sample size",back:`When observations are correlated with their own past, each new point carries less than one point's worth of information.

Consequence: your EFFECTIVE sample size is smaller than n, sometimes drastically. Standard errors computed as if independent are too small, so everything looks significant. With positive autocorrelation ρ, effective n is roughly n(1−ρ)/(1+ρ).

Where it appears: daily metrics, per-user event streams, sensor data, MCMC chains.

Detect: ACF plot, Durbin-Watson, or Ljung-Box test on residuals.

Fixes: aggregate to a coarser unit, use HAC/Newey-West standard errors, model the autocorrelation directly, or block-bootstrap rather than resampling points.`},{front:"Selecting on the dependent variable",back:`Studying only cases with the outcome you care about, with no comparison group.

Examples: analysing only converting users to find "what drives conversion"; studying only successful startups for lessons; reviewing only churned accounts to explain churn.

Why it cannot work: without the non-outcome group you cannot compute any conditional difference. If 90% of converters used feature X but so did 90% of non-converters, X explains nothing — and you would never know.

Under the hood: this is the base rate fallacy plus survivorship bias combined.

Fix: always assemble a comparison group, and think in terms of a 2×2 table rather than a single column.`},{front:"Aggregation and the choice of unit",back:`The same data yields different answers depending on the level you aggregate to, because different aggregations apply different implicit weights.

Example: average per-user CTR weights a user with one impression equally with one who had 10,000. Total clicks / total impressions weights by activity. Neither is wrong — they answer different questions, and they can move in opposite directions.

Gotcha: switching aggregation level mid-analysis, or comparing a metric defined one way against a historical version defined the other, produces changes that look like real effects.

Discipline: write the metric definition down including the unit and the weighting, and keep it fixed across comparisons.`},{front:"Multiple testing hidden inside feature selection",back:`Screening thousands of features for association with the target is thousands of hypothesis tests. At α=0.05, 1000 pure-noise features yield about 50 "significant" ones.

Consequence: features selected this way include many spurious ones that will not generalise, and any performance estimate computed on the same data that guided selection is optimistic.

The compounding error: doing the selection BEFORE cross-validation leaks the whole dataset into every fold. Selection must happen inside the fold.

Defences: fit selection within the CV pipeline, use FDR control if you need a defensible feature list, or prefer embedded regularisation (lasso) whose selection is part of the model being validated.`},{front:"Correlation of a metric with itself over time (Twyman meets drift)",back:`A metric can move because the underlying behaviour changed, or because the POPULATION MIX changed, or because the instrumentation changed. These are indistinguishable from the aggregate number alone.

Why it matters: a "model degradation" alert is frequently a traffic-mix shift, a new client version logging differently, or a bot wave — not the model at all.

Diagnostic sequence: decompose the metric by segment and check whether any segment moved, or only the weights did; check volumes for each segment; check whether the change aligns with a release.

Rule: before concluding a behavioural change, rule out composition and instrumentation. Mix shifts are more common than behaviour shifts.`}],m={deck:"Statistics for ML",cards:[...a,...i,...s,...o,...r,...l,...c,...d,...h,...u]},p={deck:"ML Algorithms",cards:[{front:"Linear regression — assumptions, and closed form vs gradient descent",back:`Fits y = Xβ by minimising squared error. Closed form: β = (XᵀX)⁻¹Xᵀy.

Assumptions: linearity, independent errors, constant error variance, and (for inference) normally distributed errors.

When to use which: the closed form is O(d³) in the number of features, so it is fine for small d and impossible for large d. Gradient descent scales to large d and huge n.

Gotcha: XᵀX is singular when features are collinear or d > n — the closed form simply does not exist. Ridge fixes this by adding λI, guaranteeing invertibility.`},{front:"Logistic regression — why not use squared error?",back:`Models log-odds as linear: log(p/(1−p)) = Xβ, so p = sigmoid(Xβ).

Why cross-entropy instead of MSE — two reasons: (1) MSE paired with a sigmoid is NON-CONVEX in the weights, so optimisation can get stuck; cross-entropy is convex. (2) MSE's gradient contains the sigmoid derivative, which vanishes when predictions are confidently wrong — learning stalls exactly when it should be fastest. Cross-entropy cancels that term.

Interpretation: exp(βⱼ) is the odds ratio for a one-unit change in feature j.`},{front:"L1 vs L2 regularization — why does L1 produce exact zeros?",back:`L2 (Ridge) adds λ‖β‖²; L1 (Lasso) adds λ‖β‖₁.

The geometric reason: the L1 constraint region is a diamond with CORNERS on the axes; the L2 region is a smooth circle. The loss contours are most likely to first touch the diamond at a corner — where some coefficients are exactly 0. A circle has no corners, so L2 shrinks smoothly but never to zero.

Analytic view: L1's gradient is constant (±λ) regardless of magnitude, so it keeps pushing to zero; L2's gradient shrinks proportionally and asymptotes.

Elastic Net blends both — needed when features are correlated, since Lasso arbitrarily picks one of a correlated group.`},{front:"Gradient descent variants: SGD, momentum, RMSProp, Adam",back:`Batch GD: exact gradient, slow, one update per epoch. SGD: one sample — noisy but fast, and the noise helps escape sharp minima. Mini-batch: the practical compromise.

Momentum: accumulates a velocity vector, damping oscillation across ravines and accelerating along consistent directions.

RMSProp: divides by a running average of squared gradients, giving each parameter its own effective learning rate.

Adam = momentum + RMSProp + bias correction. Fast and forgiving, but often generalises slightly worse than well-tuned SGD+momentum — which is why large vision models still often use the latter.`},{front:"Learning rate — the single most important hyperparameter",back:`Too high: divergence or oscillation. Too low: painfully slow, and more likely to settle in a poor local region.

Schedules: step decay, cosine annealing, and WARMUP (start small, ramp up) — warmup matters because early gradients are large and unrepresentative, especially with adaptive optimisers whose variance estimates are still unreliable.

Diagnostic: loss exploding to NaN → lower it. Loss flat from the start → probably too low, or a dead network.

Trick: the LR range test — sweep the rate upward and plot loss to find the steepest-descent region.`},{front:"Loss functions: MSE, MAE, Huber, cross-entropy, hinge",back:`MSE: penalises squared error, so it is dominated by outliers; its optimum is the conditional MEAN. MAE: linear penalty, robust, optimum is the conditional MEDIAN. Huber: quadratic near zero and linear in the tails — robust but differentiable everywhere.

Cross-entropy: for probabilistic classification; heavily penalises confident mistakes.

Hinge (SVM): zero loss once the margin is satisfied, so only boundary points matter.

Key insight: the loss encodes what you consider a good prediction. Choosing MSE on skewed revenue data silently commits you to chasing outliers.`},{front:"Decision trees — splitting criteria and why they overfit",back:`Recursively split to maximise purity. Gini = 1 − Σp²; entropy = −Σp log p. They behave near-identically; Gini is marginally cheaper. Regression trees split on variance reduction.

Why they overfit: a tree grown to full depth can isolate every training point, achieving zero training error and memorising noise.

Controls: max_depth, min_samples_leaf, min_impurity_decrease, and cost-complexity pruning.

Under the hood: splits are chosen GREEDILY and locally — a tree cannot look ahead, so it can miss combinations that only pay off jointly (e.g. XOR).`},{front:"Random Forest — what makes it work?",back:`Bagging (bootstrap samples) plus RANDOM FEATURE SUBSETS at each split, averaged over many deep trees.

The crucial part: bootstrapping alone leaves trees highly correlated, because one dominant feature is chosen first in nearly every tree. Averaging correlated models barely reduces variance. Restricting the candidate features at each split DECORRELATES the trees, which is where most of the benefit comes from.

Properties: reduces variance without increasing bias; hard to overfit by adding trees; gives free OOB validation.

Weakness: large memory footprint, and poor extrapolation beyond the training range.`},{front:"Bagging vs boosting",back:`Bagging: train models in PARALLEL on bootstrap samples and average. Targets VARIANCE. Base learners should be low-bias/high-variance (deep trees).

Boosting: train models SEQUENTIALLY, each correcting the previous one's errors. Targets BIAS. Base learners should be weak/high-bias (shallow stumps).

Under the hood: bagging averages independent errors away; boosting performs gradient descent in function space.

Consequence: boosting CAN overfit with too many rounds and needs early stopping; bagging essentially cannot. Boosting is usually more accurate but more sensitive to noisy labels.`},{front:'Gradient boosting — what is the "gradient"?',back:`Each new tree is fitted to the NEGATIVE GRADIENT of the loss with respect to the current predictions — the pseudo-residuals. For squared loss those are just the ordinary residuals, which is why the intuition "fit the errors" works.

Under the hood: this is gradient descent where each step is taken in function space rather than parameter space, with a tree approximating the descent direction.

Key knobs: learning rate (shrinkage) and n_estimators trade off against each other — lower rate needs more trees but generalises better. Subsampling adds stochasticity and helps.

XGBoost adds second-order (Newton) information and regularisation; LightGBM uses histogram binning and leaf-wise growth for speed.`},{front:"SVM and the kernel trick",back:`Finds the hyperplane maximising the MARGIN to the nearest points (support vectors). Soft margin allows violations via C: small C = wider margin, more tolerance; large C = fits training data harder.

Kernel trick: the optimisation depends on the data only through inner products, so replacing x·x' with K(x,x') implicitly maps to a high-dimensional space WITHOUT ever computing coordinates there. RBF corresponds to an infinite-dimensional space.

Gotcha: scales roughly O(n²)-O(n³), so it is impractical for very large n — a big reason SVMs lost ground to boosted trees and neural nets.`},{front:"k-Nearest Neighbours and the curse of dimensionality",back:`No training: at prediction time, find the k closest training points and vote or average.

Curse of dimensionality: as dimensions grow, points become nearly EQUIDISTANT — the ratio of nearest to farthest distance approaches 1 — so "nearest" stops being meaningful. Data needed grows exponentially with d.

Practical notes: features MUST be scaled, since distance is dominated by large-magnitude features. Small k = low bias/high variance; large k = the reverse.

Cost: training is free, inference is expensive — the opposite profile of most models.`},{front:"Naive Bayes — why does it work despite a false assumption?",back:`Applies Bayes' rule assuming all features are conditionally independent given the class — almost never true.

Why it still works: for CLASSIFICATION you only need the correct ARGMAX, not correct probabilities. Dependence distorts the magnitudes but often preserves their ordering.

Strengths: extremely fast, works with tiny data and very high dimensions (text), naturally online.

Gotchas: probabilities are badly calibrated (typically driven toward 0 or 1). An unseen feature-class pair gives probability 0 and annihilates the product — hence Laplace smoothing.`},{front:"k-means — assumptions and initialisation",back:`Alternates assigning points to the nearest centroid and recomputing centroids — Lloyd's algorithm, which converges to a LOCAL optimum only.

Hidden assumptions: clusters are spherical, similarly sized, and similarly dense. It fails badly on elongated or nested shapes because it minimises within-cluster squared distance.

Initialisation matters enormously: random init can converge terribly, so use k-means++ (spread initial centroids apart probabilistically).

Choosing k: elbow method, silhouette score, gap statistic — all heuristics. Features must be scaled first.`},{front:"DBSCAN vs k-means",back:`DBSCAN grows clusters from dense regions using eps (neighbourhood radius) and min_samples.

Advantages: finds ARBITRARY shapes, does not require choosing k, and explicitly labels outliers as noise.

Weaknesses: struggles when clusters have very different densities, and eps is hard to choose in high dimensions where distances concentrate.

Use DBSCAN when: shapes are irregular or outliers matter (anomaly detection). Use k-means when: clusters are roughly globular and you need speed at scale.

HDBSCAN removes the fixed-eps limitation by building a hierarchy over densities.`},{front:"PCA — what is it actually doing?",back:`Finds orthogonal directions of maximum variance; these are the eigenvectors of the covariance matrix, with eigenvalues giving variance explained.

Under the hood: it is the linear projection minimising reconstruction error. Equivalently, the SVD of the centred data matrix.

Critical preprocessing: you MUST centre, and standardise when features have different units — otherwise a feature measured in metres dominates one measured in kilometres purely by scale.

Limits: only captures LINEAR structure, and components are usually uninterpretable mixtures. Not a feature-selection method — it creates new features rather than choosing among existing ones.`},{front:"t-SNE and UMAP — and how to not misread them",back:`Non-linear methods that preserve LOCAL neighbourhood structure for visualisation.

Critical caveats: cluster SIZES are meaningless, distances BETWEEN clusters are largely meaningless, and results change with perplexity/seed. t-SNE has no meaningful global geometry.

UMAP preserves more global structure, is much faster, and can transform new points — t-SNE cannot embed new data without refitting.

Biggest mistake: treating a t-SNE plot as evidence that clusters are well separated in the original space, or feeding t-SNE coordinates into a downstream model.`},{front:"Backpropagation",back:`Applies the chain rule backwards through the computation graph, reusing intermediate results so all gradients cost roughly one forward pass.

Under the hood: the forward pass caches activations; the backward pass multiplies local Jacobians. Without this reuse, computing gradients numerically would cost one forward pass PER PARAMETER — completely infeasible.

Memory consequence: activations must be stored for the backward pass, which is why memory scales with depth × batch size. Gradient checkpointing trades compute for memory by recomputing them.`},{front:"Activation functions and the dying ReLU",back:`Sigmoid/tanh SATURATE: gradients approach zero for large |x|, which is a primary cause of vanishing gradients in deep nets.

ReLU: max(0,x). Cheap, non-saturating for positive inputs, and induces sparsity — it made deep nets trainable.

Dying ReLU: a unit pushed to always-negative pre-activation outputs 0 with gradient 0 FOREVER — it can never recover. Often triggered by too high a learning rate.

Fixes: Leaky ReLU / ELU / GELU keep a small negative slope. GELU is standard in transformers.`},{front:"Vanishing and exploding gradients",back:`Gradients are products of many terms across layers. If those terms are consistently < 1 the product decays to zero; if > 1 it explodes.

Symptoms: early layers stop learning (vanishing), or loss goes NaN (exploding).

Fixes: non-saturating activations (ReLU family), careful initialisation (Xavier for tanh, He for ReLU — both keep activation variance stable across layers), normalisation layers, RESIDUAL CONNECTIONS (which give gradients a direct path, the key enabler of very deep nets), and gradient clipping for explosions.`},{front:"Batch norm vs layer norm",back:`Batch norm normalises each feature ACROSS THE BATCH; layer norm normalises across FEATURES within each individual example.

Why the distinction matters: batch norm depends on batch statistics, so it behaves differently at train and inference time (it uses running averages), degrades with small batches, and is awkward for variable-length sequences. Layer norm has no batch dependence at all — which is why transformers use it.

Effect: originally credited to reducing "internal covariate shift"; the better-supported explanation is that it SMOOTHS THE LOSS LANDSCAPE, permitting higher learning rates.`},{front:"Dropout",back:`Randomly zeroes a fraction p of activations during training only.

Under the hood: prevents co-adaptation by making units unable to rely on any specific other unit, and approximates training an exponential ensemble of subnetworks that share weights.

At inference: dropout is OFF and activations are scaled (or, with inverse dropout, scaled during training instead) so expected magnitudes match.

Gotchas: forgetting model.eval() in PyTorch leaves dropout active and produces random predictions. Dropout interacts poorly with batch norm — modern architectures often use one or the other.`},{front:"CNNs: convolution, weight sharing, receptive field",back:`A small kernel slides across the input, so the same weights detect a pattern anywhere — giving translation equivariance and vastly fewer parameters than a dense layer.

Three structural priors: locality (nearby pixels relate), weight sharing (patterns are position-independent), and hierarchy (edges → textures → parts → objects).

Receptive field: the input region influencing one output unit. It grows with depth, kernel size, stride, and dilation — and if it is smaller than the object you care about, the network structurally cannot see it.

Pooling adds invariance and shrinks spatial dimensions.`},{front:"RNNs and LSTMs",back:`RNNs carry a hidden state across timesteps, sharing weights over time — but repeated multiplication through the same matrix causes vanishing/exploding gradients over long sequences.

LSTM fix: a CELL STATE with additive updates, plus gates (forget, input, output) controlling information flow. Because the cell state is updated additively rather than multiplicatively, gradients flow across many steps without decaying.

GRU: merges gates, fewer parameters, often comparable.

Why transformers replaced them: RNNs are inherently SEQUENTIAL and cannot parallelise across time, which caps training throughput.`},{front:"Attention and transformers",back:`Attention(Q,K,V) = softmax(QKᵀ/√d)V. Each position attends to every other, weighted by query-key similarity.

Why √d: without it, dot products grow with dimension, pushing softmax into saturation where gradients vanish.

Key advantages: any two positions are ONE step apart (no long-range decay), and the whole sequence is processed in parallel.

Multi-head: several attention subspaces capture different relation types.

Costs: O(n²) in sequence length for both time and memory — the central bottleneck driving FlashAttention and sparse/linear attention variants. Positional encodings are required since attention is permutation-invariant.`},{front:"Embeddings",back:`Dense low-dimensional vectors representing discrete items, learned so that geometric closeness reflects semantic or behavioural similarity.

Why not one-hot: one-hot is huge, sparse, and treats every pair of items as equally dissimilar — it carries no notion of relatedness.

Under the hood: an embedding layer is just a lookup into a learned matrix, mathematically equivalent to multiplying a one-hot vector by a weight matrix but implemented as indexing.

Sizing heuristic: roughly the fourth root of cardinality. Gotcha: high-cardinality embeddings hold most of a recommender's parameters and can dominate memory.`},{front:"Transfer learning and fine-tuning",back:`Reuse a model pretrained on a large corpus, then adapt it to your task — early layers hold general features, later layers task-specific ones.

Strategy by data size: very little data → freeze the backbone and train only the head. More data → unfreeze progressively with a LOW learning rate, since large updates destroy pretrained features (catastrophic forgetting).

Under the hood: pretraining supplies a far better initialisation than random, so you need orders of magnitude less labelled data.

Modern variants: LoRA and adapters tune a small number of extra parameters, making fine-tuning cheap and letting many tasks share one base model.`},{front:"Cross-validation strategies — and when k-fold is wrong",back:`k-fold: split into k parts, train on k−1, validate on the rest. Stratified k-fold preserves class proportions and should be the default for classification.

When standard k-fold is INVALID: (1) time series — random folds let the model train on the future and predict the past; use forward-chaining splits. (2) Grouped data — multiple rows per user must stay in the same fold, or the model memorises the user; use GroupKFold.

Gotcha: any preprocessing fitted on the full dataset (scaling, imputation, feature selection) leaks validation information. Fit it INSIDE the fold, via a pipeline.`},{front:"Data leakage — the most expensive bug in ML",back:`Information available at training time that will not exist at prediction time, producing brilliant offline metrics and a worthless production model.

Common sources: scaling/imputing before the split; target encoding computed over all data; features derived from the future (point-in-time violations); duplicate rows spanning splits; an ID that correlates with the label.

Tell-tale sign: suspiciously high performance, or one feature with overwhelming importance.

Defence: build every transform inside a pipeline fitted per fold, and for temporal data ask of each feature "would I truly have known this at decision time?"`},{front:"Hyperparameter search: grid, random, Bayesian",back:`Grid: exhaustive, cost explodes exponentially with dimensions. Random: samples independently — provably better than grid in high dimensions, because most hyperparameters barely matter and random search spends more distinct trials on the ones that do.

Bayesian optimisation: builds a surrogate model of the objective and picks the most promising next point. Sample-efficient, best when each run is expensive.

Hyperband/ASHA: allocate compute adaptively, killing bad runs early — usually the best value in practice.

Gotcha: tuning against the test set is leakage. Use a separate validation set or nested CV.`},{front:"Generative vs discriminative models",back:`Discriminative models learn P(Y|X) directly (logistic regression, trees, most neural nets). Generative models learn P(X,Y) or P(X|Y)·P(Y) and apply Bayes' rule (Naive Bayes, GMMs, diffusion models, LLMs).

Trade-off: discriminative models usually win on pure classification accuracy given enough data, since they solve the easier problem directly. Generative models converge faster with LITTLE data, can synthesise samples, handle missing features naturally, and support anomaly detection through likelihood.

Rule of thumb: if you only need a decision boundary, modelling the full input distribution is wasted effort.`},{front:"Handling class imbalance in training",back:`Options: class weights in the loss (cheapest, keeps data intact), oversampling the minority (SMOTE interpolates synthetic points), undersampling the majority (discards data), or focal loss (down-weights easy examples so training focuses on hard ones).

Critical rule: resample ONLY the training fold. Applying SMOTE before splitting leaks synthetic points derived from validation data.

Gotcha: any resampling distorts predicted probabilities, so calibration breaks. If probabilities matter, prefer class weights or recalibrate afterwards.

Often the best lever is not resampling at all — just move the decision THRESHOLD.`},{front:"No Free Lunch theorem",back:`Averaged over ALL possible problems, every algorithm performs identically. No learner is universally superior.

What it actually means: performance comes from an algorithm's INDUCTIVE BIAS matching the structure of your specific problem. CNNs beat MLPs on images because locality and translation equivariance are true of images, not because convolution is inherently better.

Practical takeaway: this is why "which model is best?" has no answer without the data. It also justifies empirical benchmarking — and explains why boosted trees still beat deep nets on most tabular problems.`}]},f={deck:"ML Deployment (MLOps)",cards:[{front:"Training/serving skew",back:`The model sees differently-computed features in production than it did in training, so live performance silently falls short of offline metrics.

Common causes: features computed by separate code paths (Spark for training, Java service for serving); different default/missing-value handling; time-zone or unit mismatches; a training pipeline that had access to data arriving only after the decision point.

Detect: log the actual features used at serving and compare their distributions to training.

Fix: share ONE feature definition between both paths — the core motivation for a feature store.`},{front:"Feature store — what problem does it actually solve?",back:`A central system for defining, computing, storing and serving features, with an offline store (historical, for training) and an online store (low-latency, for inference).

The two real problems it solves: (1) training/serving skew, by making one definition serve both paths; (2) point-in-time correctness, by reconstructing feature values AS THEY WERE at each historical event.

Secondary benefit: reuse across teams and models.

Gotcha: it is significant infrastructure. For one model with simple features it is overkill — the payoff comes with many models sharing features.`},{front:"Point-in-time correctness",back:`When building a training set, each feature must carry the value it HAD at the moment of the event — not its current value.

Why it is subtle: joining a feature table naively attaches today's value to a year-old event, leaking the future into training. The model learns from information that did not exist at decision time and collapses in production.

Example: "customer_lifetime_value" attached to a purchase from last year already includes that purchase and everything after it.

Implementation: as-of joins on event timestamps, and versioned/append-only feature tables rather than mutable ones.`},{front:"Batch vs online (real-time) inference",back:`Batch: precompute predictions on a schedule, store them, serve by lookup. Cheap, simple, trivially scalable, and lookup latency is microseconds.

Online: compute on request. Needed when inputs are only known at request time or freshness matters.

Choose batch when: the input space is enumerable and predictions stay valid for hours (churn scores, weekly recommendations).

Choose online when: inputs include real-time context (current session, search query, live pricing).

Hybrid is common: precompute expensive embeddings/candidates in batch, do light ranking online.`},{front:"Model registry and versioning — what must be versioned?",back:`Reproducibility requires versioning FOUR things together: code, data, model artefact, and environment. Versioning only the model weights is not enough to reproduce a result.

A registry stores model versions with metadata: training data snapshot, hyperparameters, metrics, lineage, and stage (staging/production/archived).

Why it matters operationally: rollback needs the exact previous artefact, and incident investigation needs to know precisely what was serving at a given time.

Gotcha: "we can just retrain it" is not reproducibility — nondeterminism in sampling, GPU ops and library versions means you will not get the same model back.`},{front:"Shadow deployment",back:`Run the new model alongside the current one on real production traffic, log its predictions, but DO NOT serve them to users.

What it validates: latency and resource use under real load, absence of crashes on real inputs, and how prediction distributions compare to the incumbent.

What it CANNOT validate: business impact — nobody sees the outputs, so there is no feedback on whether the new model would have changed user behaviour.

Use it as the safety gate before a canary, not as a substitute for an A/B test.

Cost: doubles inference compute for the shadow period.`},{front:"Canary release vs blue-green vs A/B test",back:`Canary: route a small share of traffic (1-5%) to the new version, watch health metrics, ramp up gradually. Optimised for LIMITING BLAST RADIUS.

Blue-green: two full environments; switch all traffic at once. Instant rollback, but doubles infrastructure and exposes everyone simultaneously.

A/B test: randomised assignment with statistical analysis. Optimised for MEASURING EFFECT, not for safety.

Key distinction that interviewers probe: canarying answers "is it broken?" while A/B testing answers "is it better?" They serve different purposes and mature systems use both in sequence.`},{front:"Data drift vs concept drift — and why the difference matters",back:`Data (covariate) drift: the input distribution P(X) changes. Concept drift: the relationship P(Y|X) changes.

Why the distinction is operationally critical: data drift may be harmless — if the model handles the new region well, accuracy is fine. Concept drift ALWAYS degrades the model, because what it learned is now wrong.

Consequence: drift alerts on inputs are a leading indicator, not proof of damage. Alerting on every input shift produces alert fatigue.

Detect: PSI or KS tests on features for data drift; performance monitoring against delayed labels for concept drift.`},{front:"Population Stability Index (PSI) and KS test for drift",back:`PSI = Σ (actual% − expected%) · ln(actual%/expected%) over bins.

Rules of thumb: PSI < 0.1 no meaningful shift; 0.1-0.25 moderate, investigate; > 0.25 significant shift.

KS test: max distance between two empirical CDFs. Good for continuous features, but with large n it flags statistically significant yet practically irrelevant differences — so use effect size, not just the p-value.

Practical notes: monitor the PREDICTION distribution too, since it aggregates all input drift into one signal. Watch categorical features for new unseen categories, a common silent breakage.`},{front:"Ground truth delay and the feedback loop in monitoring",back:`Labels usually arrive long after predictions — days for conversions, months for loan defaults, sometimes never.

Consequence: you cannot monitor accuracy in real time, so you need PROXY signals in the meantime: input drift, prediction drift, and business KPIs.

Worse: for many systems the label depends on the model's own action. If you decline a loan you never learn whether it would have defaulted — so your training data only ever covers approvals.

Mitigate: reserve a small randomised holdout that bypasses the model, giving unbiased ground truth. It costs a little revenue and is often the only path to unbiased evaluation.`},{front:"Retraining strategy — cadence vs trigger",back:`Scheduled: retrain on a fixed cadence. Simple and predictable, but arbitrary — it retrains when nothing changed and lags when something did.

Triggered: retrain on drift detection or a performance drop. Responsive, but needs reliable monitoring and can thrash.

Design questions that matter more than the schedule: what training window (all history vs recent only)? Warm start or from scratch? Who approves promotion? Is there an automatic rollback if the new model underperforms?

Gotcha: automated retraining on contaminated data will faithfully automate the contamination. Always gate on validation against a trusted holdout.`},{front:"Latency budget: p50 vs p95 vs p99",back:`Always measure percentiles, never the mean — latency distributions are right-skewed, so the mean hides the tail that users actually feel.

Why p99 dominates design: if a page makes 10 backend calls, the chance that at least one hits the p99 tail is roughly 1 − 0.99¹⁰ ≈ 10%. Tail latency COMPOUNDS across a fan-out. This is why tail latency, not average latency, sets the user experience.

Budget breakdown: feature fetch + model compute + network + serialisation.

Levers: caching, smaller/quantised models, batching, and cutting feature-store round trips.`},{front:"Dynamic batching for inference",back:`Queue incoming requests briefly and run them as one batch to exploit GPU parallelism.

The trade-off: throughput up, per-request latency up (each request waits for the batch to fill or the timeout to expire). Tuned by max batch size and max wait time.

Why it works: GPUs are heavily underutilised on batch size 1 — the kernel launch and memory transfer dominate, so a batch of 32 often costs barely more wall-clock time than a batch of 1.

When NOT to use it: strict low-latency paths where added queueing delay breaks the budget, or genuinely low traffic where batches never fill.`},{front:"Quantization",back:`Represent weights/activations in lower precision — FP32 → FP16/BF16 → INT8 → INT4.

Gains: memory scales down roughly linearly, and lower-precision arithmetic is faster on supporting hardware. INT8 typically gives ~4x smaller models with minimal accuracy loss.

Post-training quantization: fast, no retraining, small accuracy drop. Quantization-aware training: simulates quantization during training, recovering most of the loss — needed for aggressive bit widths.

Gotcha: accuracy loss is uneven — outlier activations are what break naive quantization, which is why per-channel scales and outlier-aware schemes exist.`},{front:"Knowledge distillation and pruning",back:`Distillation: train a small "student" to match a large "teacher's" outputs. Crucially it matches the SOFT probability distribution, not just hard labels — the relative probabilities of wrong classes carry "dark knowledge" about similarity structure, which is why the student beats one trained on labels alone.

Pruning: remove weights or whole structures. Unstructured pruning gives high sparsity but needs special hardware to pay off; structured pruning (whole channels/heads) yields real speedups on ordinary hardware.

Use together with quantization — they compound.`},{front:"Caching in ML serving — what and where",back:`Layers: prediction cache (same input → same output), feature cache (avoid repeated store lookups), and embedding cache (hot items kept in memory).

When a prediction cache works: repeated identical inputs and outputs stable over the TTL. It fails when inputs include a timestamp or session context, since the hit rate collapses.

Critical gotcha: a cache must be INVALIDATED ON MODEL DEPLOY, or you serve the old model's predictions after shipping a new one — a genuinely common and confusing production bug.

Also watch: cache stampede on expiry, and stale features producing inconsistent decisions.`},{front:"Graceful degradation and fallbacks",back:`When the model or its dependencies fail, the product must still work.

Fallback ladder, in order: full model → simpler/cached model → heuristic or popularity baseline → static default. Never a 500 error.

Design requirements: timeouts on every dependency (especially feature fetches), circuit breakers to stop hammering a failing service, and defaults for missing features that the model was actually trained to handle.

Gotcha: silent fallbacks are dangerous — if you do not ALERT when the fallback engages, you can serve the popularity baseline for weeks while metrics quietly sag and nobody notices.`},{front:"CI/CD for ML — how it differs from software CI/CD",back:`Ordinary CI/CD tests code. ML pipelines must also validate DATA and MODEL behaviour, because the code can be correct while the model is broken.

Additional gates: schema and data-quality checks, training reproducibility, model performance above a threshold on a trusted holdout, per-SEGMENT performance (to catch regressions hidden by aggregates), fairness/bias checks, and latency/size limits.

The deeper difference: the artefact depends on data that changes independently of any commit — so a pipeline can start producing worse models with zero code changes. Continuous training needs continuous validation.`},{front:"Rollback strategy for models",back:`Requirements: the previous model artefact retained and immediately loadable, automated health checks that can trigger rollback, and feature-pipeline compatibility with the old version.

The hard part people miss: if the new model changed the FEATURE SCHEMA, rolling back the model alone breaks — you must roll back the feature pipeline too. Model and features must be versioned and rolled back TOGETHER.

Also: caches must be invalidated on rollback, and any downstream system that stored the new model's outputs may need reprocessing.

Rehearse it — an untested rollback path is not a rollback path.`},{front:"Monitoring an ML system: what to actually alert on",back:`Four layers: (1) SYSTEM — latency p99, error rate, throughput, saturation. (2) DATA — schema violations, null rates, unseen categories, feature drift. (3) MODEL — prediction distribution shift, confidence distribution, and accuracy once labels land. (4) BUSINESS — the KPI the model exists to move.

Alerting discipline: page on system and business metrics; make drift a ticket, not a page, since drift is noisy and usually not urgent.

Most valuable single signal: prediction distribution shift — it is available immediately, requires no labels, and aggregates every upstream problem into one number.`},{front:"Model explainability in production: SHAP and LIME",back:`SHAP: attributes a prediction to features using Shapley values from cooperative game theory — the unique attribution satisfying efficiency, symmetry and additivity. TreeSHAP computes it exactly and fast for tree ensembles.

LIME: fits a simple local surrogate around one prediction. Faster but less stable — repeated runs can give different explanations.

Production uses: regulatory requirements (adverse action notices), debugging, and trust.

Gotcha: SHAP shows what the MODEL used, not what CAUSES the outcome. With correlated features, attribution splits arbitrarily among them. It is not causal evidence.`},{front:"Reproducibility: sources of nondeterminism",back:`Sources: random seeds (init, shuffling, dropout, augmentation), GPU non-determinism (atomic float ops reduce in nondeterministic order), library and driver versions, data ordering, and parallel/distributed reduction order.

Controls: set seeds for every RNG (Python, NumPy, framework), enable deterministic algorithm flags, pin all dependency versions, containerise, and snapshot/version the training data.

Cost: deterministic GPU kernels can be meaningfully slower — a real trade-off.

Why it matters: without reproducibility you cannot attribute a metric change to your code change rather than to noise.`},{front:"Cost per inference — and where the money actually goes",back:`Levers: model size and precision, hardware choice, batch size, cache hit rate, and autoscaling policy.

CPU vs GPU: GPUs win on large batches and big models; for small models at low QPS, CPU is often cheaper because the GPU sits idle. Idle GPU time is the usual source of waste.

Big structural lever: move work from online to BATCH wherever freshness permits — precomputed predictions are orders of magnitude cheaper than per-request inference.

Watch: scale-to-zero introduces cold starts (model loading can take tens of seconds), so it trades cost against tail latency.`},{front:"Autoscaling ML services — why it is harder than for stateless apps",back:`Complications: model loading makes cold starts slow (seconds to minutes), GPU nodes are expensive and scarce, and memory footprint is large and fixed.

Scaling signal: CPU utilisation is a poor proxy for a GPU service. Prefer queue depth, request concurrency, or inference latency.

Tactics: keep a warm pool for baseline traffic and scale burst capacity on top; pre-load models at container start with a readiness probe that only passes after the model is loaded — otherwise traffic routes to a pod that cannot serve it.

Gotcha: aggressive scale-down thrashes; use stabilisation windows.`},{front:"Online/offline consistency checking",back:`A continuous test that the production path reproduces the training path: take logged serving inputs, re-run them through the offline pipeline, and compare predictions.

What it catches: training/serving skew, feature-pipeline bugs, version mismatches, and silent library upgrades that alter behaviour.

How to run it: sample a small fraction of live traffic, recompute offline, and alert when the mismatch rate crosses a threshold.

Why it is worth the effort: skew bugs are silent — no error is thrown, metrics degrade gradually, and without this check they are typically found weeks later, if ever.`},{front:"Multi-model serving and model routing",back:`Patterns: one model per user segment or region, ensembles combining several models, cascades (cheap model first, escalate uncertain cases to an expensive one), and champion/challenger for continuous evaluation.

Cascade economics: if a cheap model confidently handles 90% of traffic, average cost collapses while accuracy on hard cases is preserved — one of the highest-leverage serving optimisations.

Operational cost: many models multiply monitoring, retraining and rollback surface area. Each variant needs its own drift tracking and its own performance baseline, which is why per-segment models are easy to launch and painful to maintain.`},{front:"Containerisation and dependency pinning for ML",back:`Containers package code, dependencies, system libraries and CUDA runtime so the environment is identical across dev, CI and production.

ML-specific pain: images are huge (multi-GB with CUDA), builds are slow, and dependency resolution is fragile — framework, CUDA, driver, and cuDNN versions form a tightly coupled matrix.

Practices: pin EXACT versions (never a floating tag or unpinned pip install), use multi-stage builds to strip build tooling, and keep model weights OUT of the image so one image serves many model versions.

Gotcha: "latest" tags make deployments unreproducible and turn rollback into guesswork.`},{front:"Preventing feedback loops in deployed models",back:`The model influences the data that trains its successor, so errors and biases compound over generations of retraining.

Examples: a fraud model that declines a segment never observes their good behaviour; a recommender that never surfaces an item never learns it was good; predictive policing directing patrols to areas it already flagged.

Detection: monitor whether the training distribution is narrowing over time — coverage, entropy, and share of traffic to the top items.

Mitigations: randomised exploration holdouts, propensity logging with IPS correction, and periodically training on data from a randomised slice rather than model-selected traffic.`}]},g={deck:"Recommendation Systems",cards:[{front:"Collaborative filtering — user-based vs item-based",back:`Recommend using behaviour patterns across users, with no content features at all. User-based: find similar users, recommend what they liked. Item-based: find items co-liked by the same users.

Under the hood: item-based is usually preferred in production because item-item similarities are far more stable over time than user tastes, so they can be precomputed and cached.

Strength: discovers non-obvious associations no content feature would reveal.

Weakness: total cold start — a brand-new item has no interactions, so it is invisible.`},{front:"Matrix factorization (ALS / SVD-style)",back:`Factor the sparse user-item interaction matrix R (n×m) into U (n×k) and V (m×k) so R ≈ U·Vᵀ. Each user and item becomes a k-dimensional latent vector; a prediction is their dot product.

Under the hood: k is far smaller than n or m, so the model is forced to compress taste into a few latent factors — it generalises rather than memorising.

Why ALS: fixing U makes solving for V a plain least-squares problem, and vice versa. Alternating is convex in each step and parallelises well.

Gotcha: "SVD" in recsys is not true SVD — the matrix is mostly missing, not zero.`},{front:"Implicit vs explicit feedback",back:`Explicit: the user states a preference (star rating). Implicit: behaviour is used as a proxy (click, watch, purchase, dwell time).

The hard part of implicit: there are NO TRUE NEGATIVES. A non-click may mean dislike, or never seen. Absence of interaction is ambiguous.

Standard treatment: treat unobserved pairs as weak negatives with low confidence, and observed ones with confidence rising in the interaction strength (c = 1 + αr).

Pitfall: naively labelling everything unseen as a hard negative teaches the model that unpopular-but-relevant items are bad.`},{front:"Content-based filtering, and hybrid recommenders",back:`Content-based scores items by feature similarity to what the user already liked (text, category, embeddings), ignoring other users entirely.

Strength: handles new items immediately — features exist before any interaction does. Also explainable.

Weakness: over-specialisation. It keeps recommending more of the same and never surprises the user.

Hybrid: combine with collaborative signals — weighted blend, switching by data availability, or a single model taking both as features. Almost every production system is a hybrid, using content to cover cold start and CF to drive quality once data arrives.`},{front:"Cold start — the three kinds",back:`New USER: no history. New ITEM: no interactions. New SYSTEM: no data at all.

Fixes by type — new user: onboarding preferences, demographics, popularity/trending defaults, contextual bandits to learn fast. New item: content features and embeddings, plus deliberate exploration traffic. New system: content-based or rules until interaction data accumulates.

Under the hood: cold start is fundamentally an EXPLORATION problem — you cannot learn about an item you never show.

Gotcha: a pure exploit policy makes item cold start permanent, since new items never get impressions to earn their ranking.`},{front:"Two-stage architecture: candidate generation → ranking",back:`Stage 1 (retrieval): cheaply narrow millions of items to a few hundred, optimised for RECALL. Stage 2 (ranking): apply an expensive, feature-rich model to those few hundred, optimised for PRECISION at the top.

Under the hood: you cannot run a heavy model over the whole catalogue within a latency budget. Cost per item forces the split.

Key consequence: THE RANKER CAN ONLY BE AS GOOD AS RETRIEVAL. Anything retrieval misses is unrecoverable, so measure recall@K of the candidate stage separately.

Often a third re-ranking stage adds diversity and business rules.`},{front:"Two-tower model",back:`One encoder tower for the user/context, another for the item, trained so that dot product (or cosine) of their embeddings predicts relevance.

Why it dominates retrieval: the towers are INDEPENDENT. Item embeddings are precomputed offline for the whole catalogue; at request time you encode only the user and do an approximate nearest-neighbour search. That is what makes million-item retrieval feasible in milliseconds.

Trade-off: because the towers never interact until the final dot product, it cannot model fine-grained user-item feature crosses — which is exactly what the ranking stage adds.`},{front:"Approximate nearest neighbour search (HNSW, IVF, FAISS)",back:`Finds near-neighbours in embedding space without scanning every item — trading a little recall for orders-of-magnitude speed.

HNSW: a navigable small-world graph; greedy descent through layers. Excellent recall/latency, memory-hungry. IVF: cluster the space, search only the nearest few cells. PQ: compress vectors to cut memory at some accuracy cost.

Knobs: efSearch / nprobe trade recall against latency at query time.

Gotcha: index freshness. New items are invisible until reindexed, so an ANN index quietly reintroduces item cold start.`},{front:"Popularity bias",back:`Popular items get recommended disproportionately, beyond what their actual relevance warrants.

Under the hood: popular items have the most interaction data, so the model is most confident about them; and training data is itself dominated by them, so the loss is minimised by favouring them.

Effect: the long tail is starved, catalogue coverage collapses, and the system becomes a bestseller list rather than a recommender.

Mitigate: popularity-debiased sampling, inverse-propensity weighting, explicit diversity in re-ranking, or penalising item frequency in the loss.`},{front:"Position bias",back:`Users click higher-ranked items far more often regardless of relevance, simply because those items are seen first.

Why it is dangerous: you train on clicks, so the model learns "position 1 items are good" — but position 1 was chosen BY THE PREVIOUS MODEL. You are learning your own past decisions, not user preference.

Measure it: randomised position swaps, or intervention harvesting from natural ranking variation.

Correct it: inverse propensity weighting, where each click is weighted by 1/P(examined at that position), or model position explicitly as a feature and set it to a constant at serving time.`},{front:"The feedback loop / rich-get-richer effect",back:`A recommender surfaces an item → it gets more impressions → more clicks purely from exposure → the model reads that as higher quality → it ranks even higher. The advantage compounds regardless of true relevance.

Under the hood: the model TRAINS ON DATA IT GENERATED. Exposure and quality become statistically inseparable, so the system is no longer measuring preference — it is measuring its own past choices.

Example: a job posting recommended early accumulates clicks, locks into the top slot, and equally good postings never surface.

Mitigate: exploration traffic, propensity weighting, diversity constraints, and monitoring catalogue coverage/Gini over time.`},{front:"Filter bubbles and echo chambers",back:`Personalisation progressively narrows what a user is shown until they only see reinforcement of existing preferences.

Under the hood: a direct consequence of the feedback loop at the USER level. The model optimises short-term engagement, which is maximised by familiarity, so the exploration radius shrinks with every interaction.

Harm: user boredom and churn, plus societal effects for content platforms.

Mitigate: inject diversity and serendipity, optimise for long-term value rather than next-click, and monitor per-user intra-list diversity and topic entropy over time — not just CTR.`},{front:"Exploration vs exploitation",back:`Exploit: show what the model believes is best now. Explore: show uncertain items to LEARN their value.

Why pure exploitation fails: the model never gathers data that could change its mind, so early mistakes become permanent and new items can never break in.

Strategies: ε-greedy (simple, wasteful), UCB (optimism proportional to uncertainty), Thompson sampling (sample from the posterior — usually best in practice and trivially parallel).

Framing: exploration is the cost you pay to keep the training distribution from collapsing onto your own predictions.`},{front:"Multi-armed bandits and Thompson sampling",back:`Bandits choose actions to maximise cumulative reward while learning, balancing exploration and exploitation online rather than in fixed A/B splits.

Thompson sampling: keep a posterior over each arm's reward, SAMPLE one value per arm, play the argmax. Arms with wide uncertainty occasionally sample high and get tried.

Why it suits recsys: adapts continuously, wastes far less traffic on clear losers than a fixed A/B test, and handles the new-item problem naturally.

Contextual bandits condition on user features — the bridge between bandits and full recommenders.`},{front:"Learning to rank: pointwise, pairwise, listwise",back:`Pointwise: predict a score per item independently (plain regression/classification). Simple, but optimises absolute values when only ORDER matters.

Pairwise: learn which of two items should rank higher (RankNet, LambdaRank). Directly targets ordering.

Listwise: optimise a whole-list metric such as NDCG directly (LambdaMART, ListNet).

Under the hood: ranking metrics are flat or discontinuous in the scores, so they have no usable gradient. LambdaRank's trick is to define the gradient directly — weighting each pair by how much swapping it would change NDCG.`},{front:"Ranking metrics: Precision@K, Recall@K, MRR, MAP, NDCG",back:`Precision@K: fraction of the top K that are relevant. Recall@K: fraction of all relevant items captured in the top K. MRR: 1/rank of the first relevant item — good when a single right answer matters. MAP: mean of average precision, position-aware across all relevant items.

NDCG: discounted cumulative gain normalised by the ideal ordering. Uses a log discount so higher positions count more, and it is the only common metric that handles GRADED relevance rather than binary.

Choosing: NDCG for graded relevance, MRR for known-item search, Recall@K for the retrieval stage.`},{front:"Offline/online metric mismatch",back:`A model that wins on logged offline data frequently fails to move live metrics — one of the most common surprises in recsys.

Why: offline evaluation replays a distribution generated by the OLD policy. A new model that would have shown different items has no logged feedback for them, so it is scored only where it agrees with the incumbent. It also cannot capture novelty, position effects, or user adaptation.

Implication: offline metrics are a filter for what deserves an online test, not a substitute for one. Always ship behind an A/B test or interleaving.`},{front:"Counterfactual evaluation and Inverse Propensity Scoring (IPS)",back:`Estimates how a NEW policy would have performed using data logged under an OLD one, by reweighting each logged event by 1/P(action taken | old policy).

Under the hood: it turns a biased sample into an unbiased estimate of the new policy's value — the same trick as importance sampling.

Requirements: the logging policy must be stochastic and its propensities recorded. If P(action) was 0, that region is unobservable and no reweighting can recover it.

Gotcha: high variance when propensities are tiny. Use clipped/self-normalised IPS or doubly robust estimators.`},{front:"Negative sampling in recommenders",back:`With millions of items, computing a full softmax is infeasible, so you contrast each positive against a sample of negatives.

Choices: uniform random negatives are easy but too easy — the model learns only coarse distinctions. In-batch negatives are cheap and popular for two-tower models. HARD negatives (plausible but wrong) sharpen the decision boundary most.

Gotcha: in-batch negatives are sampled by popularity, so popular items appear as negatives too often. Correct with logQ / sampled-softmax correction, otherwise you systematically suppress popular items.

Also: watch false negatives — a "negative" the user simply had not seen yet.`},{front:"Diversity, novelty, serendipity, coverage",back:`Diversity: how dissimilar the items within one list are. Novelty: how unknown/unpopular an item is to this user. Serendipity: relevant AND surprising — the genuinely hard one. Coverage: what fraction of the catalogue ever gets recommended.

Why they matter: accuracy alone produces a monotonous, redundant list (five near-identical items) that suppresses long-term engagement.

Implementation: Maximal Marginal Relevance trades relevance against similarity to already-selected items; determinantal point processes do this more principledly.

Tension: these metrics trade against short-term CTR, which is exactly why they need explicit objectives.`},{front:"Selection bias in logged recommendation data",back:`You only observe feedback for items the system CHOSE to show. The data is Missing Not At Random by construction.

Under the hood: training on it means learning P(click | shown), while what you actually want is P(relevant) over the whole catalogue. The gap between them is the bias.

Consequence: the model is confident where the old policy was active and blind everywhere else — and that blindness is self-reinforcing.

Mitigate: reserve a small randomised exploration slice as an unbiased evaluation set, log propensities, and use IPS or doubly robust estimators.`},{front:"Session-based and sequential recommendation",back:`Models the ORDER of interactions within a session rather than a static user profile. GRU4Rec uses an RNN; SASRec/BERT4Rec use self-attention.

Why sequence matters: intent is short-lived and order-dependent. Someone who just bought a phone wants a case, not another phone.

Under the hood: self-attention lets any earlier item directly influence the prediction, so it captures long-range dependencies better than an RNN and trains in parallel.

Key design decision: separate short-term session intent from long-term stable taste — most strong systems model both and combine them.`},{front:"Delayed and sparse feedback",back:`The signal you truly care about (purchase, retention, subscription) arrives long after the recommendation, if ever.

Problem: attribution windows are ambiguous, and training on the immediate proxy (clicks) optimises the wrong objective — the classic route to clickbait.

Handling: multi-task models predicting click AND conversion, delayed-feedback models treating unconverted events as censored rather than negative, and proxy metrics validated against long-term outcomes via holdouts.

Gotcha: if you label "no conversion yet" as negative, you systematically mislabel recent events — creating a bias toward older data.`},{front:"Multi-objective recommendation",back:`Real systems optimise several competing goals at once: relevance, revenue, diversity, freshness, creator fairness, long-term retention.

Approaches: scalarisation (weighted sum of predicted objectives — simple, requires tuning weights), constrained optimisation (maximise relevance subject to diversity ≥ X), or Pareto-front methods.

Under the hood: usually one model per objective feeding a blending layer, since the objectives have different label densities and delays.

Gotcha: weights get tuned to short-term metrics and silently drift the product. Tie weight changes to long-term holdout experiments.`},{front:"Presentation and trust bias",back:`Beyond position, HOW an item is displayed changes clicks: thumbnail quality, badges ("Sponsored", "Top pick"), card size, whether it is above the fold.

Trust bias specifically: users click higher results partly because they TRUST the system's ordering — so clicks reflect confidence in the ranker, not just relevance.

Consequence: your click labels encode UI decisions. A UI change silently shifts the label distribution and can look like model degradation.

Mitigate: log UI treatment as a feature, and re-baseline metrics after any presentation change.`},{front:"Wide & Deep, DeepFM, and feature crosses",back:`Wide & Deep: a linear "wide" part MEMORISES specific feature crosses seen in training; a deep part GENERALISES via embeddings. Trained jointly.

Why both: memorisation captures exceptions and strong co-occurrences; generalisation covers unseen combinations. Either alone underperforms.

DeepFM removes the manual feature-engineering burden by learning second-order interactions with a factorisation machine, sharing embeddings with the deep part.

Under the hood: these exist because plain MLPs are surprisingly bad at learning multiplicative feature interactions from one-hot inputs.`},{front:"Graph-based recommendation (GNNs)",back:`Model users and items as nodes in a bipartite interaction graph and propagate embeddings along edges, so a user's representation absorbs information from items, their other users, and outward.

Under the hood: message passing over k hops is effectively higher-order collaborative filtering — it captures "users like me liked items like this" transitively. LightGCN strips out non-linearities and shows the propagation itself does the work.

Strength: helps sparse users by borrowing signal from graph neighbours.

Cost: expensive to train and serve at scale; neighbour sampling is required.`},{front:"Evaluating a recommender: what should you actually measure?",back:`Offline: Recall@K for retrieval, NDCG for ranking, plus coverage and intra-list diversity so accuracy gains are not bought with catalogue collapse.

Online: CTR is the tempting default but is short-term and clickbait-prone. Prefer downstream conversion, session depth, return rate, and long-term retention holdouts.

Guardrails: catalogue coverage/Gini, share of impressions to the head, latency p99, and per-segment metrics to catch Simpson-style reversals.

Rule of thumb: if a change raises CTR while lowering coverage and diversity, you have probably strengthened the feedback loop rather than the product.`}]},n=[m,p,f,g],y=n.reduce((e,t)=>e+t.cards.length,0);function b(){return n.flatMap(e=>e.cards.map(t=>({deck:e.deck,front:t.front,back:t.back})))}export{y as STARTER_CARD_COUNT,n as STARTER_DECKS,b as starterCards};
