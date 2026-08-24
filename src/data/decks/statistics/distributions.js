// Distributions and their assumptions — common interview territory.

export default [
  {
    front: 'Bernoulli and Binomial — and when the Binomial breaks',
    back: 'Bernoulli: a single trial, P(success)=p. Mean p, variance p(1−p).\n\nBinomial: the number of successes in n INDEPENDENT trials with CONSTANT p. Mean np, variance np(1−p).\n\nUnder the hood: variance is maximal at p=0.5 and vanishes at 0 or 1 — extreme rates are inherently less variable, which is why conversion tests on very rare events need far more traffic than the raw rate suggests.\n\nGotcha: the two assumptions fail constantly in practice. Repeated visits by the same user break independence; a p that drifts over the test window breaks constancy. Both make the true variance larger than the formula, so your p-values are too optimistic.',
  },
  {
    front: 'Poisson distribution — when does it apply?',
    back: 'Counts of events in a fixed interval, when events are independent and occur at constant rate λ. Mean = variance = λ.\n\nThat equality is the signature: if your count data has variance far exceeding the mean, it is OVERDISPERSED and Poisson is the wrong model — use negative binomial.\n\nExample: requests per second, clicks per session, defects per batch.\n\nUnder the hood: it is the limit of a Binomial as n→∞ and p→0 with np=λ fixed — the "many chances, each unlikely" regime.\n\nGotcha: real traffic is bursty and rate-varying, which produces overdispersion almost by default.',
  },
  {
    front: 'Exponential distribution and memorylessness',
    back: 'Models the WAITING TIME between Poisson events. Mean 1/λ.\n\nMemoryless: P(T > s+t | T > s) = P(T > t). Having waited already tells you nothing about how much longer you will wait — the exponential is the only continuous distribution with this property.\n\nExample: if session length were exponential, a user 10 minutes in has the same expected remaining time as a fresh one.\n\nGotcha: real durations are usually NOT memoryless. Session length, tenure and failure times typically show either "the longer you have stayed, the longer you will stay" or wear-out. Use Weibull or log-normal when the hazard rate is not constant.',
  },
  {
    front: 'The Normal distribution — why is it everywhere?',
    back: 'Three independent reasons: (1) CLT — sums/averages of many small independent effects converge to it; (2) it is the MAXIMUM ENTROPY distribution for a given mean and variance, so it is the least-assuming choice when you only know those two; (3) it is mathematically convenient — closed under linear combinations and conditioning.\n\nProperties: fully described by μ and σ; uncorrelated jointly-normal variables are independent (true for the normal, NOT in general).\n\nGotcha: it has thin tails, so it badly underestimates extreme events in finance, latency and network traffic. Assuming normality where tails are heavy is how risk models fail.',
  },
  {
    front: "Student's t distribution — why the heavier tails?",
    back: 'The sampling distribution of a mean when σ is UNKNOWN and estimated from the same small sample.\n\nUnder the hood: you are dividing by an estimated standard deviation that is itself noisy. Sometimes you underestimate it, inflating the ratio — so extreme values happen more often than under a normal. Hence fatter tails.\n\nBehaviour: as df→∞ it converges to the normal, because σ̂ becomes reliable. By n≈30 the difference is small.\n\nUse when: small samples with unknown variance. Also useful deliberately as a heavy-tailed likelihood for robust regression.',
  },
  {
    front: 'Chi-squared distribution — where does it come from?',
    back: 'The sum of k squared independent standard normals. Mean k, variance 2k. Strictly positive and right-skewed.\n\nWhy it shows up: whenever you sum squared deviations. It is the reference distribution for sample variance, for goodness-of-fit tests, and for likelihood ratio tests (−2 log Λ is asymptotically chi-squared).\n\nUnder the hood: the df equals the number of independent squared terms after subtracting estimated parameters — which is exactly why df bookkeeping matters so much in these tests.\n\nExample: comparing observed vs expected counts across categories.',
  },
  {
    front: 'Beta distribution — the natural prior for a rate',
    back: 'Defined on [0,1], parameterised by α and β. Mean α/(α+β).\n\nWhy it pairs with the Binomial: it is the CONJUGATE prior. Observing s successes and f failures updates Beta(α,β) → Beta(α+s, β+f). The update is literally addition — no integration needed.\n\nIntuition: α−1 and β−1 act as "prior successes and failures." Beta(1,1) is uniform, i.e. no information.\n\nUse in ML: Bayesian A/B testing, Thompson sampling for bandits, and smoothing sparse rates — a new item with 1 click from 2 impressions gets pulled toward the prior instead of being scored 50%.',
  },
  {
    front: 'Log-normal distribution',
    back: 'X is log-normal if log(X) is normal. Strictly positive and right-skewed.\n\nWhy it appears so often: it arises from MULTIPLICATIVE processes, just as the normal arises from additive ones. Anything produced by repeated proportional growth tends log-normal.\n\nExamples: income, house prices, session length, latency, file sizes, revenue per user.\n\nGotcha: mean ≠ median, and the mean is pulled well above the median by the tail. Reporting a "mean revenue per user" on log-normal data describes almost nobody. E[X] = exp(μ + σ²/2), NOT exp(μ) — which is why naive back-transformation understates the mean.',
  },
  {
    front: 'Power laws and heavy tails',
    back: 'P(X > x) ∝ x^(−α). Scale-free: no typical value, and the tail dominates all the totals.\n\nConsequences: for α ≤ 2 the variance is INFINITE, and for α ≤ 1 even the mean is. Sample statistics simply never stabilise — collecting more data can make the sample mean jump rather than settle.\n\nExamples: item popularity, city sizes, word frequency, degree distributions in networks, wealth.\n\nML relevance: this is why recommender catalogues have a long tail, why "average" popularity is meaningless, and why CLT-based confidence intervals silently fail on such metrics. Work on logs, use medians, or model the tail explicitly.',
  },
  {
    front: 'Skewness and kurtosis',
    back: 'Skewness: asymmetry. Positive = long right tail (mean > median). Kurtosis: tail weight relative to a normal (excess kurtosis > 0 means fatter tails and more outliers).\n\nWhy they matter operationally: positive skew makes the mean a poor summary and inflates the variance of the sample mean, so tests lose power. High kurtosis means extreme values arrive more often than any normal-based interval expects.\n\nGotcha: both are extremely sensitive to outliers — they are built from third and fourth powers, so a single extreme point can dominate the estimate.\n\nFix: log or Box-Cox transform, winsorise, or switch to rank-based methods.',
  },
  {
    front: 'QQ plot — how do you read one?',
    back: 'Plots sample quantiles against theoretical quantiles. A straight line means the distribution matches.\n\nReading the deviations: an S-curve means the tails are wrong — ends bending UP above the line indicates heavier tails than assumed. A convex or concave bow indicates skew. A single point far off the line is an outlier.\n\nWhy prefer it over a histogram: histograms depend heavily on bin width and hide tail behaviour, which is exactly where model assumptions break.\n\nUse when: checking residual normality, or deciding whether a transform actually worked — compare QQ plots before and after.',
  },
  {
    front: 'Mixture distributions — and why they fool summary statistics',
    back: 'A distribution formed by drawing from several component distributions with some probability each.\n\nWhy it matters in practice: almost all real data is a mixture over unobserved segments — device types, new vs returning users, bot vs human traffic.\n\nGotcha: a mixture can be bimodal, so the MEAN falls in the valley between the two humps and describes no actual member of the population. Reported alone it is actively misleading.\n\nSignals: bimodal histograms, variance far larger than any component, or a metric that moves without any component moving (the mix shifted). This is the mechanism behind Simpson\'s paradox and behind drift caused purely by traffic composition.',
  },
  {
    front: 'Choosing a likelihood for your target variable',
    back: 'The output distribution should match the data type — this is what picking a loss really means.\n\nContinuous, symmetric → Normal (squared error). Continuous, positive and skewed → log-normal or Gamma (often: model log y). Binary → Bernoulli (cross-entropy). Counts → Poisson, or negative binomial if overdispersed. Counts with an exposure → Poisson with an offset. Bounded proportions → Beta. Time-to-event with censoring → survival model, not regression.\n\nGotcha: fitting squared error to skewed positive data chases the tail and predicts negative values. Fitting Poisson to overdispersed counts gives confident, wrong standard errors.',
  },
]
