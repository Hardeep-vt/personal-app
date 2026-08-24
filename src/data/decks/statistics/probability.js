// Probability foundations that ML interviews actually test.

export default [
  {
    front: 'Probability vs likelihood — what is the difference?',
    back: 'Both come from the same function P(data | θ), read in opposite directions.\n\nProbability: θ is FIXED, data varies. "Given a fair coin, how likely is 8 heads in 10?"\n\nLikelihood: DATA is fixed, θ varies. "Given I saw 8 heads, how well does p=0.5 explain it?"\n\nUnder the hood: likelihood is a function of the parameter, and it does NOT integrate to 1 over θ. That is why it is not a probability distribution over parameters — turning it into one is exactly what a prior and Bayes\' rule are for.\n\nGotcha: "the likelihood that the model is right" is a category error unless you are being Bayesian.',
  },
  {
    front: 'Linearity of expectation — and what it does NOT require',
    back: 'E[aX + bY] = aE[X] + bE[Y], ALWAYS. No independence needed.\n\nWhy it matters: this is the single most useful trick in probability interviews. Problems that look like they need a joint distribution collapse into a sum.\n\nExample: expected number of fixed points in a random permutation of n items. Define an indicator per position, each with E = 1/n. Sum = 1. The indicators are dependent, and it does not matter.\n\nGotcha: linearity does NOT extend to products or variances. E[XY] = E[X]E[Y] requires independence, and Var(X+Y) needs the covariance term.',
  },
  {
    front: 'Variance algebra — Var(aX+b) and Var(X+Y)',
    back: 'Var(aX + b) = a²Var(X). The shift b vanishes; the scale is squared.\n\nVar(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y). Only if independent does the covariance drop out.\n\nUnder the hood: variance is a squared quantity, so it is not linear — this is why standard deviations do not add but variances (of independent terms) do.\n\nExample: the standard error of a mean. Var(X̄) = Var(X)/n, so SE = σ/√n. The √n comes directly from the squared scaling.\n\nGotcha: averaging correlated observations does not reduce variance by 1/n — positive correlation makes your effective sample size smaller than n.',
  },
  {
    front: 'Law of total expectation (and total variance)',
    back: 'E[X] = E[E[X|Y]] — average the conditional means, weighted by how often each condition occurs.\n\nTotal variance: Var(X) = E[Var(X|Y)] + Var(E[X|Y]) — "within-group variance" plus "between-group variance."\n\nWhy it matters in ML: this IS the bias-variance style decomposition, and it is how you reason about hierarchical/grouped data.\n\nExample: overall conversion rate = weighted average of per-segment rates. If you weight wrong, you get Simpson\'s paradox.\n\nUse when: a quantity is easier to reason about conditionally than marginally — condition, then average back.',
  },
  {
    front: 'Independence vs conditional independence',
    back: 'Independent: P(A,B) = P(A)P(B). Conditionally independent given C: P(A,B|C) = P(A|C)P(B|C).\n\nCritical point: neither implies the other. Two variables can be dependent marginally but independent once you condition, and independent marginally but dependent once you condition.\n\nExample of the second: two independent coin flips become dependent once you know their sum. Conditioning on a common EFFECT creates dependence — that is collider bias.\n\nML relevance: Naive Bayes assumes conditional independence given the class, not marginal independence. Graphical models are essentially bookkeeping for which conditional independencies hold.',
  },
  {
    front: 'Law of Large Numbers vs Central Limit Theorem',
    back: 'LLN: the sample mean CONVERGES to the true mean as n grows. It tells you WHERE you end up.\n\nCLT: the sample mean\'s distribution around that value becomes normal with spread σ/√n. It tells you HOW FAR OFF you typically are.\n\nSo: LLN gives consistency, CLT gives the error bars. You need CLT, not LLN, to build a confidence interval.\n\nGotcha: LLN needs a finite mean; CLT additionally needs finite variance. For a Cauchy distribution the sample mean never settles at all — averaging more data does not help.',
  },
  {
    front: "Jensen's inequality",
    back: 'For a CONVEX function f: E[f(X)] ≥ f(E[X]). Reversed for concave f. Equality only if f is linear or X is constant.\n\nWhy it matters: it says "the average of a transform ≠ the transform of the average," which quietly breaks a lot of intuition.\n\nExample: E[log Y] < log E[Y]. So back-transforming a mean prediction from log space UNDERESTIMATES the mean on the original scale.\n\nML relevance: it is the reason the ELBO in variational inference is a lower bound, and why log-loss and geometric means behave the way they do.',
  },
  {
    front: "Chebyshev's inequality",
    back: 'P(|X − μ| ≥ kσ) ≤ 1/k². At least 75% of any distribution lies within 2σ, at least 89% within 3σ.\n\nWhat makes it useful: it assumes NOTHING about the shape — no normality required. That generality is also why it is loose.\n\nContrast: for a normal distribution, 2σ actually captures 95%, not merely 75%. Chebyshev is a worst-case guarantee.\n\nUse when: you need a distribution-free bound, or you want to show a result holds without assuming Gaussianity. It is also the standard tool for proving the Law of Large Numbers.',
  },
  {
    front: 'Odds, log-odds, and the logit',
    back: 'Odds = p/(1−p), ranging over (0,∞). Log-odds (logit) = log(p/(1−p)), ranging over (−∞,∞).\n\nUnder the hood: this is exactly why logistic regression models the LOGIT as linear — a linear function can output any real number, while p must stay in [0,1]. The logit is the bridge.\n\nInterpretation: a coefficient β means a one-unit change in x multiplies the odds by e^β.\n\nGotcha: odds ratios and risk ratios are different numbers and are routinely confused. With rare events they nearly coincide; with common events they diverge badly.',
  },
  {
    front: 'Standard deviation vs standard error',
    back: 'SD describes the SPREAD OF THE DATA. SE describes the UNCERTAINTY OF AN ESTIMATE: SE = σ/√n.\n\nThe key difference: SD does not shrink as you collect more data — the population is as variable as it is. SE shrinks as √n, because your estimate of the mean gets sharper.\n\nGotcha: plotting SE error bars and calling them "variability" makes results look far more precise than they are. Show SD for describing a distribution; SE (or a CI) for describing an estimate.\n\nInterview trap: "what happens to SD and SE if you quadruple n?" SD: unchanged. SE: halves.',
  },
  {
    front: "Bessel's correction — why divide by n−1?",
    back: 'The sample variance divides by n−1, not n, to be an UNBIASED estimator of population variance.\n\nUnder the hood: you compute deviations from the SAMPLE mean, which is itself fitted to the data and sits closer to the points than the true mean does. That makes the sum of squared deviations systematically too small; n−1 corrects for it exactly.\n\nDegrees of freedom view: estimating the mean consumes one degree of freedom, leaving n−1.\n\nGotcha: MLE of variance uses n and IS biased. NumPy defaults to ddof=0 (biased); pandas defaults to ddof=1. They silently disagree.',
  },
  {
    front: 'Degrees of freedom — what are you actually counting?',
    back: 'The number of independent pieces of information left after the parameters you estimated from the data.\n\nRule of thumb: df = n − (number of parameters estimated).\n\nExamples: sample variance has n−1 (the mean was estimated). A two-sample t-test has n₁+n₂−2. A chi-squared test of independence on an r×c table has (r−1)(c−1), because the margins are fixed.\n\nWhy it matters: df determines the reference distribution, so getting it wrong gives the wrong p-value. It also explains why heavily parameterised models need much more data before their estimates mean anything.',
  },
  {
    front: 'Monte Carlo estimation',
    back: 'Approximate an expectation by sampling: E[f(X)] ≈ (1/n)Σ f(xᵢ).\n\nThe crucial property: the error shrinks as 1/√n REGARDLESS OF DIMENSION. Deterministic quadrature degrades exponentially with dimension, which is why Monte Carlo dominates in high-dimensional problems.\n\nCost implication: one extra decimal digit of accuracy needs 100× the samples. Monte Carlo is robust but never precise cheaply.\n\nML uses: dropout at inference, bootstrap, MCMC posteriors, policy-gradient estimates, and any expectation you cannot integrate in closed form.',
  },
  {
    front: 'Importance sampling',
    back: 'Estimate an expectation under p using samples from a different distribution q, reweighting by w = p(x)/q(x): E_p[f] = E_q[f·w].\n\nWhy you need it: often you cannot sample from p, or the events you care about are rare under it.\n\nRequirement: q must cover the support of p. Where q(x)=0 and p(x)>0, that region is invisible and the estimate is silently biased.\n\nGotcha: if q is a poor match, a few samples get enormous weights and the variance explodes — the effective sample size collapses to a handful of points. Clipped or self-normalised weights are the standard defence.\n\nML relevance: exactly the machinery behind off-policy evaluation and IPS in recommenders.',
  },
]
