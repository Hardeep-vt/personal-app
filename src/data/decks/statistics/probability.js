// Probability foundations that ML interviews actually test.

export default [
  {
    front: 'Probability vs likelihood — what is the difference?',
    back: 'Both come from the same function P(data | θ), read in opposite directions.\n\n- Probability: θ is FIXED, the data varies. "Given a fair coin, how likely is 8 heads in 10 tosses?"\n- Likelihood: the DATA is fixed, θ varies. "Given I saw 8 heads, how well does p = 0.5 explain it?"\n\nMechanism:\n- Likelihood is a function of the parameter, and it does NOT integrate to 1 over θ. So it is not a probability distribution over parameters — turning it into one is exactly what a prior plus Bayes\' rule are for.\n\nGotcha:\n- "The likelihood that the model is right" is a category error unless you are being explicitly Bayesian.',
  },
  {
    front: 'Linearity of expectation — and what it does NOT require',
    back: 'E[aX + bY] = aE[X] + bE[Y], ALWAYS. No independence required.\n\nWhy it matters:\n- Problems that look like they need a joint distribution collapse into a sum. It is the most useful single trick in probability interviews.\n\nExample:\n- Expected number of fixed points in a random permutation of n items. Put an indicator on each position, each with E = 1/n. Sum = 1. The indicators are dependent, and it does not matter.\n\nGotcha:\n- Linearity does NOT extend to products or variances. E[XY] = E[X]E[Y] needs independence, and Var(X + Y) needs the covariance term.',
  },
  {
    front: 'Variance algebra — Var(aX+b) and Var(X+Y)',
    back: 'Two identities you must know cold:\n- Var(aX + b) = a²·Var(X). The shift b vanishes; the scale is SQUARED.\n- Var(X + Y) = Var(X) + Var(Y) + 2·Cov(X, Y). The covariance term drops out only if X and Y are independent.\n\nMechanism:\n- Variance is a squared quantity, so it is not linear. This is why standard deviations do not add, but variances of independent terms do.\n\nExample:\n- Standard error of a mean: Var(X̄) = Var(X)/n, so SE = σ/√n. The √n comes straight from the squared scaling.\n\nGotcha:\n- Averaging CORRELATED observations does not cut variance by 1/n. Positive correlation makes your effective sample size smaller than n.',
  },
  {
    front: 'Law of total expectation (and total variance)',
    back: 'A way to compute an average by splitting on another variable:\n- E[X] = E[E[X|Y]] — average the conditional means, weighted by how often each condition occurs.\n- Var(X) = E[Var(X|Y)] + Var(E[X|Y]) — "within-group variance" plus "between-group variance".\n\nWhy it matters in ML:\n- This IS the bias-variance style decomposition, and it is how you reason about grouped / hierarchical data.\n\nExample:\n- Overall conversion rate = weighted average of per-segment rates. Weight it wrong and you get Simpson\'s paradox.\n\nUse it when:\n- A quantity is easier to reason about conditionally than directly — condition, then average back.',
  },
  {
    front: 'Independence vs conditional independence',
    back: 'Two separate notions:\n- Independent: P(A, B) = P(A)·P(B).\n- Conditionally independent given C: P(A, B | C) = P(A|C)·P(B|C).\n\nKey point:\n- Neither implies the other. Variables can be dependent overall but independent once you condition, and vice versa.\n\nExample:\n- Two independent coin flips become DEPENDENT once you know their sum. Conditioning on a common effect creates dependence — that is collider bias.\n\nML relevance:\n- Naive Bayes assumes conditional independence given the class, not marginal independence.\n- Graphical models are basically bookkeeping for which conditional independencies hold.',
  },
  {
    front: 'Law of Large Numbers vs Central Limit Theorem',
    back: 'Two different guarantees about the sample mean:\n- LLN: the sample mean CONVERGES to the true mean as n grows. Tells you WHERE you end up.\n- CLT: the sample mean\'s distribution around that value becomes normal, with spread σ/√n. Tells you HOW FAR OFF you typically are.\n\nSo:\n- LLN gives consistency; CLT gives the error bars. You need the CLT, not the LLN, to build a confidence interval.\n\nGotcha:\n- LLN needs a finite mean; the CLT additionally needs finite variance. For a Cauchy distribution the sample mean never settles — more data does not help.',
  },
  {
    front: "Jensen's inequality",
    back: 'For a CONVEX function f: E[f(X)] ≥ f(E[X]). Reversed for a concave f. Equality only if f is linear or X is constant.\n\nPlain meaning:\n- The average of a transformed variable ≠ the transform of the average. This quietly breaks a lot of intuition.\n\nExample:\n- E[log Y] < log E[Y]. So back-transforming a mean prediction from log space UNDERESTIMATES the mean on the original scale.\n\nML relevance:\n- It is why the ELBO in variational inference is a lower bound, and why log-loss and geometric means behave as they do.',
  },
  {
    front: "Chebyshev's inequality",
    back: 'A distribution-free bound on how often a variable is far from its mean:\n- P(|X − μ| ≥ kσ) ≤ 1/k².\n- So at least 75% of ANY distribution lies within 2σ, at least 89% within 3σ.\n\nWhy it is useful:\n- It assumes nothing about the shape — no normality needed.\n\nWhy it is loose:\n- That same generality. For a normal distribution 2σ actually captures 95%, not merely 75%. Chebyshev is a worst-case guarantee.\n\nUse it when:\n- You need a bound without assuming Gaussianity. It is also the standard tool for proving the Law of Large Numbers.',
  },
  {
    front: 'Odds, log-odds, and the logit',
    back: 'Three ways to express a probability p:\n- Odds = p / (1 − p), ranging over (0, ∞).\n- Log-odds (the logit) = log(p / (1 − p)), ranging over (−∞, ∞).\n\nWhy it matters:\n- Logistic regression models the LOGIT as linear because a linear function can output any real number, while p must stay in [0, 1]. The logit is the bridge.\n\nInterpretation:\n- A coefficient β means a one-unit change in x multiplies the odds by e^β.\n\nGotcha:\n- Odds ratios and risk ratios are different numbers and get confused constantly. They nearly coincide for rare events and diverge badly for common ones.',
  },
  {
    front: 'Standard deviation vs standard error',
    back: 'Two things that both look like "±something":\n- SD describes the SPREAD OF THE DATA.\n- SE describes the UNCERTAINTY OF AN ESTIMATE: SE = σ/√n.\n\nKey difference:\n- SD does not shrink as you collect more data — the population is as variable as it is.\n- SE shrinks as √n, because your estimate of the mean gets sharper.\n\nGotcha:\n- Plotting SE bars and calling them "variability" makes results look far more precise than they are. Show SD to describe a distribution; SE or a CI to describe an estimate.\n\nInterview trap:\n- Quadruple n: SD unchanged, SE halves.',
  },
  {
    front: "Bessel's correction — why divide by n−1?",
    back: 'Sample variance divides by n − 1, not n, so that it is an UNBIASED estimate of the population variance.\n\nMechanism:\n- You measure deviations from the SAMPLE mean, which is fitted to the data and sits closer to the points than the true mean does.\n- That makes the sum of squared deviations systematically too small; dividing by n − 1 corrects it exactly.\n\nDegrees-of-freedom view:\n- Estimating the mean uses up one degree of freedom, leaving n − 1.\n\nGotcha:\n- The MLE of variance uses n and IS biased. NumPy defaults to ddof = 0 (biased); pandas defaults to ddof = 1. They silently disagree.',
  },
  {
    front: 'Degrees of freedom — what are you actually counting?',
    back: 'The number of independent pieces of information left AFTER subtracting the parameters you estimated from the same data.\n\nRule of thumb:\n- df = n − (number of parameters estimated).\n\nExamples:\n- Sample variance: n − 1 (the mean was estimated).\n- Two-sample t-test: n₁ + n₂ − 2.\n- Chi-squared test of independence on an r×c table: (r − 1)(c − 1), because the row and column totals are fixed.\n\nWhy it matters:\n- df picks the reference distribution, so getting it wrong gives the wrong p-value.\n- It also explains why heavily parameterised models need much more data before their estimates mean anything.',
  },
  {
    front: 'Monte Carlo estimation',
    back: 'Approximate an expectation you cannot compute in closed form by averaging over random samples: E[f(X)] ≈ (1/n)·Σ f(xᵢ).\n\nThe key property:\n- The error shrinks as 1/√n REGARDLESS OF DIMENSION. Deterministic numerical integration degrades exponentially with dimension, which is why Monte Carlo dominates high-dimensional problems.\n\nCost:\n- One extra decimal digit of accuracy needs 100× the samples. Robust, but never precise cheaply.\n\nML uses:\n- Dropout at inference, the bootstrap, MCMC posteriors, policy-gradient estimates — any expectation with no closed form.',
  },
  {
    front: 'Importance sampling',
    back: 'Estimate an expectation under distribution p using samples drawn from a DIFFERENT distribution q, then correct with weights w = p(x) / q(x):  E_p[f] = E_q[f·w].\n\nWhy you need it:\n- You often cannot sample from p, or the events you care about are rare under it.\n\nRequirement:\n- q must cover the support of p. Anywhere q(x) = 0 but p(x) > 0 is invisible, and the estimate is silently biased.\n\nGotcha:\n- If q is a poor match, a few samples get enormous weights and the variance explodes — effective sample size collapses to a handful of points. Clipped or self-normalised weights are the standard defence.\n\nML relevance:\n- Exactly the machinery behind off-policy evaluation and inverse-propensity scoring in recommenders.',
  },
]
