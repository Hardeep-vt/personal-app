// Statistical properties of regression models and their diagnostics.

export default [
  {
    front: 'Gauss-Markov theorem — what makes OLS "BLUE"?',
    back: 'Under four conditions — linearity, exogeneity (E[ε|X] = 0), constant error variance, and no autocorrelation — ordinary least squares is the Best Linear Unbiased Estimator: the lowest-variance option among all linear unbiased estimators.\n\nNote what is NOT required:\n- Normality of the errors. Normality is needed for exact t and F inference in small samples, not for OLS to be BLUE.\n\nWhy "linear unbiased" is a real limit:\n- It says nothing about BIASED estimators. Ridge is biased and can have far lower MSE — Gauss-Markov does not contradict that, it just excludes it from the comparison.\n\nWhich assumption matters most:\n- Exogeneity. Violate it and OLS is BIASED, not merely inefficient.',
  },
  {
    front: 'Omitted variable bias',
    back: 'Leaving out a variable that affects Y and is also correlated with an included predictor X biases the coefficient on X.\n\nDirection:\n- bias ≈ (effect of the omitted variable on Y) × (correlation of the omitted variable with X). You can often SIGN the bias without any data.\n\nExample:\n- Regressing salary on years of education, with ability omitted. Ability raises salary and correlates with education, so education\'s coefficient soaks up part of ability\'s effect and comes out overstated.\n\nWhy it matters in ML:\n- It is why coefficients from an observational model are not causal effects, and why "the model says feature X drives Y" is an unsafe claim.',
  },
  {
    front: "Leverage, influence, and Cook's distance",
    back: 'Three related diagnostics for a single data point:\n- Leverage: how unusual the point\'s X values are — its POTENTIAL to move the fit.\n- Influence: how much it ACTUALLY moves the fit.\n- Cook\'s distance: combines both into one number.\n\nKey distinction:\n- High leverage is not automatically a problem. A point far out in X that sits on the trend line has high leverage and low influence.\n- The danger is high leverage COMBINED with a large residual.\n\nRule of thumb:\n- Investigate points with Cook\'s distance > 4/n.\n\nWhat to do:\n- Never delete points just for being influential. Check if they are data errors; if genuine, report the fit with and without them, or use a robust regression.',
  },
  {
    front: 'Residual diagnostics — what to plot and what it means',
    back: 'The residuals are where a misspecified model shows itself. Plot them four ways:\n- Residuals vs fitted: should be a formless band around zero. Curvature = a missing non-linear term; a fan shape = non-constant variance.\n- QQ plot of residuals: checks normality, which matters for small-sample inference.\n- Residuals vs each predictor: shows which variable needs a transform or an interaction.\n- Residuals vs time / row order: any pattern means autocorrelation, so your standard errors are wrong.\n\nWhy bother:\n- R² can look fine while the model is structurally wrong. The residuals tell you WHAT to fix, not just that something is off.',
  },
  {
    front: 'Interaction terms — and the rule people break',
    back: 'An interaction term X₁·X₂ lets the effect of one variable depend on the level of the other.\n\nThe rule:\n- If you include an interaction, you MUST include both main effects (X₁ and X₂ on their own). Omitting one forces an implausible constraint and makes the interaction coefficient uninterpretable.\n\nInterpretation shift:\n- With an interaction present, the coefficient on X₁ is the effect of X₁ WHEN X₂ = 0. If X₂ is never near zero, that number is meaningless. CENTRE the variables so main effects read at average values.\n\nWhy trees get this for free:\n- Any tree or boosted ensemble captures interactions implicitly by splitting — a big part of why they beat linear models on tabular data.',
  },
  {
    front: 'Dummy variable trap',
    back: 'Encoding a k-level category as k separate 0/1 dummies AND keeping an intercept makes the design matrix singular — the dummies add up to the intercept, so the coefficients cannot be identified.\n\nFix:\n- Drop one level as the reference (k − 1 dummies), or drop the intercept.\n\nInterpretation:\n- Each coefficient is then the difference from the reference level, not an absolute effect. Changing the reference changes all the numbers but not the predictions.\n\nWhen it does NOT matter:\n- Regularised models (ridge / lasso) and tree models handle full one-hot encoding fine — regularisation resolves the degeneracy. It is specifically an unregularised-OLS inference problem.',
  },
  {
    front: 'GLMs and link functions',
    back: 'A Generalised Linear Model has three parts:\n- A distribution for Y from the exponential family.\n- A linear predictor Xβ.\n- A LINK function g that maps the mean to the linear scale: g(μ) = Xβ.\n\nWhy the link exists:\n- It keeps predictions in the valid range. The logit link keeps probabilities in (0, 1); the log link keeps rates positive. A plain linear model on a probability will happily predict 1.4.\n\nStandard pairings:\n- Normal + identity = OLS.\n- Bernoulli + logit = logistic regression.\n- Poisson + log = count regression.\n- Gamma + log = positive skewed outcomes.\n\nUnified view:\n- Choosing a loss in ML is usually choosing a distribution here — cross-entropy is exactly the Bernoulli GLM\'s likelihood.',
  },
  {
    front: 'Poisson regression and overdispersion',
    back: 'Models count outcomes with a log link, so coefficients read as multiplicative effects on the event rate.\n\nThe built-in assumption:\n- Variance = mean. Real count data usually has variance much LARGER (overdispersion), from unobserved heterogeneity or clustering.\n\nConsequence:\n- Standard errors are understated, so everything looks significant. The point estimates are often fine; the inference is not.\n\nFixes:\n- Negative binomial regression (adds a dispersion parameter), quasi-Poisson (inflates the standard errors), or robust / cluster-robust standard errors.\n\nAlso:\n- Use an OFFSET (log of exposure) when counts come from windows or populations of different size, otherwise you are modelling volume rather than rate.',
  },
  {
    front: 'Quantile regression',
    back: 'Models a chosen QUANTILE of Y given X (the median, the 90th percentile, …) instead of the mean, by minimising an asymmetric absolute loss (the pinball loss).\n\nWhy it is useful:\n- The relationship can differ across the distribution. A feature may barely move median latency while strongly affecting the 99th percentile — the part users actually feel.\n\nAdvantages:\n- No distributional assumption, robust to outliers, and gives genuine prediction INTERVALS by fitting several quantiles.\n\nML relevance:\n- How gradient boosting produces prediction intervals, and how demand forecasting handles asymmetric costs — overstock and stockout rarely cost the same, so the best forecast is not the mean.',
  },
  {
    front: 'Measurement error and regression dilution',
    back: 'Random noise in a PREDICTOR biases its coefficient TOWARD ZERO (attenuation). Noise in the OUTCOME inflates standard errors but does not bias the coefficient.\n\nMechanism:\n- Noise adds variance to X without adding covariance with Y. The OLS slope is Cov(X, Y) / Var(X) — a bigger denominator with an unchanged numerator shrinks the slope.\n\nConsequence:\n- A poorly measured feature looks unimportant even when the underlying quantity matters a lot — so you can drop the right variable for the wrong reason.\n\nWorse in multivariable models:\n- Attenuation on one variable spills bias onto the others, in either direction.',
  },
  {
    front: "Anscombe's quartet and the Datasaurus",
    back: 'Anscombe\'s quartet: four datasets with identical means, variances, correlation and regression line — yet completely different shapes. One linear, one curved, one with a single outlier driving everything, one where one point creates the whole slope.\n\nThe Datasaurus goes further:\n- A dozen datasets sharing summary statistics to two decimal places, one of which is literally a dinosaur.\n\nThe lesson:\n- Summary statistics are lossy in ways that can invert your conclusion, and no amount of care choosing WHICH statistics fixes it.\n\nPractical rule:\n- Plot the data before modelling and the residuals after. In ML the equivalent is slicing metrics by segment.',
  },
]
