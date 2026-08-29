// Estimation theory and the Bayesian toolkit.

export default [
  {
    front: 'Estimator properties: bias, consistency, efficiency',
    back: 'An estimator is a recipe for guessing a parameter θ (a mean, a variance, a rate) from a finite sample. Three standard ways to judge one:\n\n- Unbiased: E[θ̂] = θ. Right on average across many samples.\n- Consistent: θ̂ → θ as sample size n → ∞. Right in the limit.\n- Efficient: smallest variance among a stated class of estimators.\n\nGotcha:\n- The three are independent. An estimator can be biased yet consistent — the MLE of variance divides by n, is biased for any finite n, and still converges.\n\nWhy ML cares:\n- We often PREFER a biased estimator. Ridge regression is biased on purpose because the fall in variance more than pays for it. Unbiasedness is a nice-to-have, not the goal.',
  },
  {
    front: 'MSE of an estimator = bias² + variance',
    back: 'How wrong an estimate is on average, squared, splits into exactly two parts:\n\n- E[(θ̂ − θ)²] = (E[θ̂] − θ)²  +  Var(θ̂)\n- bias² = how far off the average guess is. variance = how much the guess jumps between samples.\n\nWhy it is the central idea in ML:\n- It licenses trading bias for variance. A little bias that buys a large variance cut lowers total error.\n- Regularisation, early stopping, and ensembling are all this same trade in different clothes.\n\nExample:\n- Pulling a noisy per-item conversion rate toward the global average is biased, but has far lower MSE for items with few observations.\n\nGotcha:\n- This clean split is for SQUARED loss. Under other losses it does not decompose so neatly, which is why the "bias-variance" story is fuzzier for classification.',
  },
  {
    front: 'Fisher information and the Cramér-Rao bound',
    back: 'Fisher information I(θ) measures how much a sample actually tells you about a parameter θ.\n\nMechanism:\n- It is the expected sharpness (curvature) of the log-likelihood peak. A sharp peak = one parameter value clearly fits best = lots of information.\n- A flat log-likelihood means many values of θ explain the data equally well, so any estimate is inherently imprecise.\n\nCramér-Rao bound:\n- Any unbiased estimator has Var(θ̂) ≥ 1/I(θ). There is a hard floor on precision, set by the data itself.\n\nWhy it matters:\n- The MLE reaches this floor as n grows — that is what "asymptotically efficient" means.\n- The inverse curvature at the fitted optimum is the standard way to get standard errors for model parameters.',
  },
  {
    front: 'Method of moments',
    back: 'A quick way to fit a distribution: set its theoretical moments (mean, variance, …) equal to the sample versions and solve for the parameters.\n\nExample:\n- To fit a Gamma, match the sample mean and sample variance to the Gamma\'s mean and variance formulas, then solve the two equations.\n\nStrengths:\n- Closed-form, no optimisation, and gives good starting values for MLE.\n\nLimitations:\n- Usually higher variance than MLE (less efficient).\n- Can return estimates outside the valid parameter range.\n- Ignores any information beyond the moments you matched.\n\nWhere it still shows up:\n- Fitting a prior from historical data in empirical Bayes, and as an interview check of whether you understand what an estimator is.',
  },
  {
    front: 'Sufficient statistic',
    back: 'A summary T(X) of the data is sufficient for θ if, once you know T(X), the raw data holds no further information about θ.\n\nExamples:\n- Bernoulli trials: the COUNT of successes is sufficient — the order of the flips is irrelevant.\n- Normal with known variance: the sample mean is sufficient.\n\nWhy it matters in practice:\n- Sufficiency is what makes a summary lossless. It tells you the minimum you must store or stream to fit a model later — the basis of online/streaming estimation.\n\nConnection:\n- Exponential-family distributions are exactly the ones with simple fixed-size sufficient statistics, which is why they dominate GLMs.',
  },
  {
    front: 'Delta method',
    back: 'A formula for the uncertainty of a FUNCTION of an estimate, when you already know the uncertainty of the estimate.\n\n- Var(g(θ̂))  ≈  g\'(θ̂)²  ·  Var(θ̂)\n- In words: run the estimate\'s variance through the local slope of g, squared.\n\nWhy experimentation needs it:\n- Many key metrics are RATIOS — clicks per session, revenue per user — where numerator and denominator are both random and correlated. The naive standard error is wrong.\n- For R = X/Y the delta method gives the variance including the covariance term, which is how you build a correct confidence interval for CTR when sessions-per-user varies.\n\nGotcha:\n- It is a first-order (linear) approximation, so it degrades for strongly curved g or small samples. Bootstrap is the assumption-light alternative.',
  },
  {
    front: 'Conjugate priors',
    back: 'A prior is "conjugate" to a likelihood when the posterior comes out in the SAME distribution family as the prior — so Bayesian updating is just arithmetic, no integration.\n\nThe standard pairs:\n- Beta prior + Binomial data → Beta posterior (rates)\n- Gamma + Poisson → Gamma (counts)\n- Normal + Normal (known variance) → Normal (means)\n- Dirichlet + Multinomial → Dirichlet (category shares)\n\nWhy they matter:\n- The update is closed-form, so you can revise beliefs per request. This is exactly what bandits need to run online.\n\nGotcha:\n- Conjugacy is a convenience, not a fact about the world. If the conjugate family cannot express your real prior belief, you are letting maths pick your assumptions. Modern MCMC / variational tools often make the trade unnecessary.',
  },
  {
    front: 'Beta-Binomial updating in practice',
    back: 'The workhorse for estimating a rate (click-through, conversion, pass rate) with honest uncertainty.\n\nThe update:\n- Start with a prior Beta(α, β).\n- Observe s successes and f failures.\n- Posterior = Beta(α + s, β + f). Posterior mean = (α + s) / (α + β + s + f).\n\nWhy it is so useful:\n- It is principled smoothing. An item with 1 click in 2 impressions has a raw rate of 50%; under a Beta(1, 20) prior its posterior mean is about 9% — sensibly pulled toward the population rate.\n\nReading the prior:\n- α + β is the prior\'s strength, in "pseudo-observations". Fit α and β from your historical rate distribution (empirical Bayes) rather than guessing.\n\nUse it when:\n- Ranking sparse items, cold-start scoring, and Thompson sampling for exploration.',
  },
  {
    front: 'Credible interval vs confidence interval',
    back: 'Two intervals that look identical but answer different questions.\n\n- Credible interval (Bayesian): "given this data and prior, there is a 95% probability the parameter is in here." A statement about the PARAMETER.\n- Confidence interval (frequentist): "this procedure captures the true parameter 95% of the time across repeated samples." A statement about the PROCEDURE, not this one interval.\n\nWhy people conflate them:\n- The plain-English reading of a confidence interval is actually the definition of a credible interval.\n- With a flat prior and plenty of data the two often coincide numerically, which hides the distinction.\n\nWhen the difference bites:\n- Small samples and strong priors, where the two can diverge a lot.',
  },
  {
    front: 'Posterior predictive distribution',
    back: 'The predicted distribution of a NEW data point, obtained by averaging the model over every plausible parameter value rather than plugging in one best-fit value.\n\nWhy it matters:\n- It carries parameter uncertainty into the prediction. A point estimate gives one number; the posterior predictive gives an interval that widens honestly when data is scarce.\n\nExample:\n- Forecasting next month\'s conversions from 10 days of history should be far more uncertain than from 1000 days. Plugging in a single θ̂ hides that entirely.\n\nML relevance:\n- This is what deep ensembles and MC-dropout approximate, and why they give better-calibrated uncertainty than a single network.',
  },
  {
    front: 'Empirical Bayes and shrinkage',
    back: 'Estimate the PRIOR from the data itself (pooling across all groups), then use it to pull each group\'s own estimate toward the overall mean.\n\nMechanism:\n- The amount of pull is automatic: groups with little data get pulled hard toward the population, groups with lots of data barely move. A per-group bias-variance trade.\n\nExample:\n- Ranking sellers by rating when some have 3 reviews and others 3000. Raw averages put a 3-review 5.0 above a 3000-review 4.8, which is wrong. Shrinkage fixes it.\n\nAlso known as:\n- James-Stein estimation, hierarchical / partial pooling.\n\nThe surprising result:\n- Shrinkage beats raw averages in total squared error even though it biases every single group estimate.',
  },
  {
    front: 'Bayesian A/B testing',
    back: 'Instead of a p-value, model each arm\'s rate with a posterior distribution and report things like P(B > A) and the distribution of the lift.\n\nAdvantages:\n- No fixed sample size required, so checking the results as they come in is legitimate (you are not repeatedly testing a null).\n- Output is decision-shaped: "87% chance B is better; expected loss if we ship B is 0.2%".\n- Handles small samples gracefully via the prior.\n\nGotcha:\n- The prior is a real choice; a strong one can drive the conclusion on small data.\n- "Probability B is better" is NOT a false-positive rate — it does not bound error the way α does.\n- Stopping the moment P(B > A) looks good still inflates the chance of shipping a loser.',
  },
  {
    front: 'Prior sensitivity and weakly informative priors',
    back: 'A prior is defensible only if the data overwhelms it OR you can justify it on real-world grounds.\n\nWeakly informative prior:\n- Broad enough not to drive the conclusion, tight enough to rule out the absurd — e.g. a conversion-rate prior that excludes 90% but allows anything plausible.\n- Preferred over "uninformative" flat priors, which are often not actually uninformative after a change of variables and can put most of their mass on nonsense.\n\nWhat to do:\n- Run a sensitivity analysis: refit under two or three reasonable priors. If the conclusion flips, say so — the data is not deciding the question.\n\nGotcha:\n- With sparse or heavily imbalanced data, the prior IS the answer. Report that honestly.',
  },
]
