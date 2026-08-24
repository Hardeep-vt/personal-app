// Statistical properties of regression models and their diagnostics.

export default [
  {
    front: 'Gauss-Markov theorem — what makes OLS "BLUE"?',
    back: 'Under linearity, exogeneity (E[ε|X]=0), homoscedasticity, and no autocorrelation, OLS is the Best Linear Unbiased Estimator — lowest variance among all linear unbiased estimators.\n\nNote what is NOT required: normality of errors. Normality is needed for exact t and F inference in small samples, not for OLS to be BLUE.\n\nWhy "linear unbiased" is a real limitation: it says nothing about biased estimators. Ridge is biased and can have far lower MSE — Gauss-Markov does not contradict that, it simply excludes it from the comparison.\n\nWhich assumption matters most: exogeneity. Violate it and OLS is BIASED, not merely inefficient.',
  },
  {
    front: 'Omitted variable bias',
    back: 'Leaving out a variable that affects Y and is correlated with an included X biases that X\'s coefficient.\n\nDirection: bias = (effect of omitted on Y) × (correlation of omitted with X). So you can often SIGN the bias even without the data — a genuinely useful interview move.\n\nExample: regressing salary on years of education without ability. Ability raises salary and correlates with education, so education\'s coefficient absorbs part of ability\'s effect and is overstated.\n\nWhy it matters in ML: it is why coefficients from an observational model are not causal effects, and why "the model says feature X drives Y" is an unsafe claim.',
  },
  {
    front: 'Leverage, influence, and Cook\'s distance',
    back: 'Leverage: how unusual a point\'s X values are — its potential to move the fit. Influence: how much it ACTUALLY moves the fit. Cook\'s distance combines both.\n\nKey distinction: high leverage is not automatically a problem. A point far out in X that sits on the trend line has high leverage and low influence. Danger comes from high leverage COMBINED with a large residual.\n\nRule of thumb: investigate Cook\'s distance > 4/n.\n\nWhat to do: never delete points merely for being influential. Check whether they are data errors, and if they are genuine, report the fit with and without them, or use a robust regression that limits their pull.',
  },
  {
    front: 'Residual diagnostics — what to plot and what it means',
    back: 'Residuals vs fitted: should be a formless band around zero. Curvature means a missing non-linear term; a fan shape means heteroscedasticity.\n\nQQ plot of residuals: checks normality, which matters for small-sample inference.\n\nResiduals vs each predictor: reveals which variable needs a transform or an interaction.\n\nResiduals vs time or index: any pattern means autocorrelation, so your standard errors are wrong.\n\nWhy bother: R² can look fine while the model is structurally wrong. The residuals are where the misspecification shows, and they tell you what to fix rather than just that something is off.',
  },
  {
    front: 'Interaction terms — and the rule people break',
    back: 'An interaction X₁·X₂ lets the effect of one variable depend on the level of the other.\n\nThe rule: if you include an interaction, you must include both MAIN EFFECTS. Omitting one forces an implausible constraint through the origin and makes the interaction coefficient uninterpretable.\n\nInterpretation shift: with an interaction present, the coefficient on X₁ is no longer "the effect of X₁" — it is the effect when X₂ = 0. If X₂ is never near zero, that number is meaningless. CENTRE the variables so the main effects read at average values.\n\nWhy trees do this for free: any tree or boosted ensemble captures interactions implicitly by splitting, which is a large part of why they beat linear models on tabular data.',
  },
  {
    front: 'Dummy variable trap',
    back: 'Encoding a k-level category as k dummies AND keeping an intercept makes the design matrix singular — the dummies sum to the intercept, so the coefficients are not identified.\n\nFix: drop one level as the reference (k−1 dummies), or drop the intercept.\n\nInterpretation: each coefficient is then the difference from the reference level, not an absolute effect. Changing the reference changes all the numbers without changing the model\'s predictions.\n\nWhen it does NOT matter: regularised models (ridge/lasso) and tree models handle full one-hot encoding fine, since regularisation resolves the degeneracy. It is specifically an unregularised-OLS inference problem.',
  },
  {
    front: 'GLMs and link functions',
    back: 'A GLM has three parts: a distribution for Y from the exponential family, a linear predictor Xβ, and a LINK function g mapping the mean to that linear scale: g(μ) = Xβ.\n\nWhy the link exists: it keeps predictions in the valid range. Logit keeps probabilities in (0,1); log keeps rates positive. Fitting a plain linear model to a probability happily predicts 1.4.\n\nStandard pairings: Normal + identity = OLS. Bernoulli + logit = logistic regression. Poisson + log = count regression. Gamma + log = positive skewed outcomes.\n\nUnified view: choosing a loss in ML is usually choosing a distribution here — and cross-entropy is exactly the Bernoulli GLM\'s likelihood.',
  },
  {
    front: 'Poisson regression and overdispersion',
    back: 'Models counts with a log link, so coefficients read as multiplicative effects on the rate.\n\nThe built-in assumption: variance = mean. Real count data usually has variance much LARGER (overdispersion), caused by unobserved heterogeneity or clustering.\n\nConsequence: standard errors are understated, so everything looks significant. The point estimates are often fine; the inference is not.\n\nFixes: negative binomial regression (adds a dispersion parameter), quasi-Poisson (inflates the standard errors), or robust/cluster-robust standard errors.\n\nAlso: use an OFFSET (log of exposure) when counts come from unequal windows or populations, otherwise you are modelling volume rather than rate.',
  },
  {
    front: 'Quantile regression',
    back: 'Models a chosen QUANTILE of Y given X rather than the mean, by minimising an asymmetric absolute loss (the pinball loss).\n\nWhy it is useful: the relationship can differ across the distribution. A feature may barely move median latency while strongly affecting the 99th percentile — which is precisely the part users feel.\n\nAdvantages: no distributional assumption, robust to outliers, and gives genuine prediction INTERVALS by fitting several quantiles.\n\nML relevance: this is how gradient boosting produces prediction intervals, and how demand forecasting handles asymmetric costs — overstock and stockout rarely cost the same, so the optimal forecast is not the mean.',
  },
  {
    front: 'Measurement error and regression dilution',
    back: 'Random noise in a PREDICTOR biases its coefficient TOWARD ZERO — attenuation. Noise in the outcome inflates standard errors but does not bias the coefficient.\n\nUnder the hood: noise adds variance to X without adding covariance with Y, and the OLS slope is Cov(X,Y)/Var(X). A larger denominator with an unchanged numerator shrinks the slope.\n\nConsequence: a poorly measured feature looks unimportant even when the underlying quantity matters a lot — which can lead you to drop the right variable for the wrong reason.\n\nWorse in multivariable models: attenuation on one variable spills bias onto the others, in either direction.',
  },
  {
    front: "Anscombe's quartet and the Datasaurus",
    back: 'Four datasets with identical means, variances, correlation and regression line — yet completely different shapes: one linear, one curved, one with an outlier driving everything, one where a single point creates the entire slope.\n\nThe Datasaurus takes it further: a dozen datasets sharing summary statistics to two decimals, one of which is a dinosaur.\n\nThe lesson: summary statistics are lossy in ways that can invert your conclusion, and no amount of care choosing WHICH statistics fixes it.\n\nPractical rule: plot the data before modelling, and plot the residuals after. In ML the equivalent is slicing metrics by segment — an aggregate number hides the same kinds of structure.',
  },
]
