// Estimation theory and the Bayesian toolkit.

export default [
  {
    front: 'Estimator properties: bias, consistency, efficiency',
    back: 'Unbiased: E[θ̂] = θ — correct on average across samples. Consistent: θ̂ → θ as n → ∞. Efficient: achieves the lowest possible variance among a class of estimators.\n\nCritical point: these are independent. An estimator can be unbiased but inconsistent, or BIASED YET CONSISTENT — the MLE of variance divides by n, is biased, and still converges.\n\nWhy ML cares: we routinely PREFER biased estimators. Ridge regression is deliberately biased because the variance reduction more than pays for it. Unbiasedness is a nice property, not a goal.',
  },
  {
    front: 'MSE of an estimator = bias² + variance',
    back: 'E[(θ̂ − θ)²] = (E[θ̂] − θ)² + Var(θ̂).\n\nWhy this is the central idea in ML: it licences trading bias for variance. A little bias that buys a large variance reduction lowers total error.\n\nExamples: shrinking a noisy per-item conversion rate toward the global mean is biased but has far lower MSE for sparse items. Regularisation, early stopping and ensembling are all this trade in different clothing.\n\nGotcha: it is defined for SQUARED loss. Under other losses the decomposition does not split so cleanly, which is why the "bias-variance" story is fuzzier for classification.',
  },
  {
    front: 'Fisher information and the Cramér-Rao bound',
    back: 'Fisher information I(θ) measures how sharply the log-likelihood peaks — how much the data actually tells you about θ. It is the expected curvature (negative second derivative) of the log-likelihood.\n\nCramér-Rao bound: any unbiased estimator has Var(θ̂) ≥ 1/I(θ). There is a hard floor on precision set by the data itself.\n\nConsequences: MLE asymptotically ACHIEVES this bound, which is what "asymptotically efficient" means. The inverse Hessian at the optimum is the standard way to get standard errors for fitted parameters.\n\nIntuition: a flat likelihood means many parameter values explain the data equally well, so the estimate is inherently imprecise.',
  },
  {
    front: 'Method of moments',
    back: 'Set sample moments equal to theoretical moments and solve for the parameters. To fit a Gamma, match the sample mean and variance to λ and k.\n\nStrengths: simple, closed-form, needs no optimisation, and gives good starting values for MLE.\n\nWeaknesses: generally less efficient than MLE (higher variance), can produce estimates outside the valid parameter range, and ignores information beyond the moments used.\n\nWhy it still appears: it is the practical way to fit a prior from historical data in empirical Bayes, and it is a common interview question because it exposes whether you understand what an estimator IS.',
  },
  {
    front: 'Sufficient statistic',
    back: 'A statistic T(X) is sufficient for θ if the data carries no further information about θ once you know T(X).\n\nExamples: for a Bernoulli sample, the COUNT of successes is sufficient — the order of the flips is irrelevant. For a normal with known variance, the sample mean is sufficient.\n\nWhy it matters practically: sufficiency is what makes summarisation lossless. It tells you exactly what you must store or stream to fit a model, which is the basis of online/streaming estimation and of what a feature store really needs to keep.\n\nConnection: exponential-family distributions are precisely those with simple sufficient statistics, which is why they dominate GLMs.',
  },
  {
    front: 'Delta method',
    back: 'Gives the approximate variance of a FUNCTION of an estimator: Var(g(θ̂)) ≈ g\'(θ̂)²·Var(θ̂).\n\nWhy experimentation needs it: many key metrics are RATIOS — clicks per session, revenue per user — where the numerator and denominator are both random and correlated. The naive standard error is wrong.\n\nExample: for a ratio R = X/Y, the delta method gives the variance including the covariance term, which is how you build a correct confidence interval for CTR when sessions per user varies.\n\nGotcha: it is a first-order Taylor approximation, so it degrades for strongly non-linear g or small samples. Bootstrap is the assumption-light alternative.',
  },
  {
    front: 'Conjugate priors',
    back: 'A prior is conjugate when the posterior belongs to the same family, so updating is closed-form.\n\nThe standard pairs: Beta-Binomial (rates), Gamma-Poisson (counts), Normal-Normal (means with known variance), Dirichlet-Multinomial (category proportions).\n\nWhy they matter: the posterior update becomes arithmetic instead of integration, which makes online/streaming Bayesian updates trivial — exactly what bandits need to run per-request.\n\nGotcha: conjugacy is a convenience, not a truth. If the conjugate family cannot express your actual prior belief, you are letting tractability pick your assumptions. With modern MCMC/variational tools that trade is often unnecessary.',
  },
  {
    front: 'Beta-Binomial updating in practice',
    back: 'Start with Beta(α,β). Observe s successes and f failures. Posterior = Beta(α+s, β+f). Posterior mean = (α+s)/(α+β+s+f).\n\nWhy this is so useful: it is principled smoothing. An item with 1 click in 2 impressions has a raw rate of 50%; with a Beta(1,20) prior its posterior mean is about 9% — pulled sensibly toward the population rate.\n\nInterpretation: α+β acts as the strength of the prior, measured in pseudo-observations. Fit them from your historical rate distribution (empirical Bayes) rather than guessing.\n\nUse in ML: ranking sparse items, cold-start scoring, and Thompson sampling for exploration.',
  },
  {
    front: 'Credible interval vs confidence interval',
    back: 'Credible interval (Bayesian): given this data and prior, there is a 95% probability the parameter lies in here. A statement about the PARAMETER.\n\nConfidence interval (frequentist): a procedure that captures the true parameter 95% of the time across repeated samples. A statement about the PROCEDURE.\n\nWhy people conflate them: the natural-language reading of a CI is actually the definition of a credible interval. With a flat prior and lots of data the two often coincide numerically — which reinforces the confusion.\n\nWhen the difference bites: small samples and strong priors, where they can diverge substantially.',
  },
  {
    front: 'Posterior predictive distribution',
    back: 'The distribution of a NEW observation, averaging the likelihood over the whole posterior rather than plugging in a single best-fit parameter.\n\nWhy it matters: it propagates parameter uncertainty into the prediction. A point estimate gives you one number; the posterior predictive gives an interval that widens honestly when you have little data.\n\nExample: predicting next month\'s conversions from 10 historical days should be far more uncertain than from 1000 — plugging in θ̂ hides that entirely.\n\nML relevance: this is precisely what deep ensembles and MC-dropout approximate, and why they give better-calibrated uncertainty than a single network.',
  },
  {
    front: 'Empirical Bayes and shrinkage',
    back: 'Estimate the PRIOR from the data itself (across all groups), then use it to shrink each group\'s individual estimate toward the global mean.\n\nUnder the hood: the amount of shrinkage is automatic — groups with little data get pulled hard toward the population, groups with lots of data barely move. It is a principled bias-variance trade per group.\n\nExample: ranking sellers by rating when some have 3 reviews and others 3000. Raw averages put a 3-review 5.0 above a 3000-review 4.8, which is obviously wrong; shrinkage fixes it.\n\nAlso called: James-Stein estimation, hierarchical/partial pooling. The surprising result is that shrinkage beats raw means in total squared error even when it biases every individual estimate.',
  },
  {
    front: 'Bayesian A/B testing',
    back: 'Model each arm\'s rate with a posterior and report P(B > A) and the distribution of the lift, instead of a p-value.\n\nAdvantages: no fixed sample size required, so continuous monitoring is legitimate (you are not repeatedly testing a null); results are directly decision-shaped ("87% chance B is better, expected loss if we ship B is 0.2%"); it handles small samples gracefully via the prior.\n\nGotchas: the prior is a real choice and a strong one can drive conclusions on small data; "probability B is better" is NOT a false-positive rate, so it does not bound errors the way α does; and stopping as soon as P(B>A) looks good still inflates the chance of shipping a loser.',
  },
  {
    front: 'Prior sensitivity and weakly informative priors',
    back: 'A prior is defensible when either the data overwhelms it or you can justify it substantively.\n\nWeakly informative: broad enough not to drive the conclusion, tight enough to rule out absurdity — e.g. a conversion-rate prior that excludes 90% but allows anything plausible. Preferred over "uninformative" flat priors, which are often not actually uninformative after reparameterisation and can put most of their mass on nonsense.\n\nWhat to do: run a sensitivity analysis — refit under two or three reasonable priors. If the conclusion flips, say so; the data is not deciding the question.\n\nGotcha: with sparse or heavily imbalanced data, the prior IS the answer. Report that honestly.',
  },
]
