// Distributions and their assumptions — common interview territory.

export default [
  {
    front: 'Bernoulli and Binomial — and when the Binomial breaks',
    back: 'Two building-block distributions for yes/no data:\n- Bernoulli: a single trial, P(success) = p. Mean p, variance p(1 − p).\n- Binomial: the number of successes in n INDEPENDENT trials with CONSTANT p. Mean np, variance np(1 − p).\n\nMechanism:\n- Variance is maximal at p = 0.5 and vanishes at 0 or 1. Extreme rates are inherently less variable, which is why a conversion test on a very rare event needs far more traffic than the raw rate suggests.\n\nGotcha:\n- Both assumptions fail in practice. Repeat visits by the same user break independence; a p that drifts over the test window breaks constancy. Either makes the true variance larger than the formula, so your p-values come out too optimistic.',
  },
  {
    front: 'Poisson distribution — when does it apply?',
    back: 'Counts of events in a fixed window, when events are independent and arrive at a constant average rate λ. Mean = variance = λ.\n\nThe signature:\n- Mean equals variance. If your count data has variance far above the mean it is OVERDISPERSED and Poisson is the wrong model — use negative binomial.\n\nExamples:\n- Requests per second, clicks per session, defects per batch.\n\nMechanism:\n- It is the limit of a Binomial as n → ∞ and p → 0 with np = λ fixed — the "many chances, each unlikely" regime.\n\nGotcha:\n- Real traffic is bursty and rate-varying, which produces overdispersion almost by default.',
  },
  {
    front: 'Exponential distribution and memorylessness',
    back: 'Models the WAITING TIME between events that arrive as a Poisson process. Mean 1/λ.\n\nMemoryless:\n- P(T > s + t | T > s) = P(T > t). Having already waited tells you nothing about how much longer you will wait. The exponential is the only continuous distribution with this property.\n\nExample:\n- If session length were exponential, a user 10 minutes in has the same expected remaining time as a brand-new one.\n\nGotcha:\n- Real durations are usually NOT memoryless. Session length, tenure and time-to-failure typically show "the longer you have stayed, the longer you will stay" or wear-out. Use Weibull or log-normal when the risk of the event is not constant over time.',
  },
  {
    front: 'The Normal distribution — why is it everywhere?',
    back: 'Three independent reasons it shows up so often:\n- CLT: sums / averages of many small independent effects converge to it.\n- Maximum entropy: it is the least-assuming distribution once you fix a mean and variance.\n- Convenience: closed under linear combinations and under conditioning.\n\nProperties:\n- Fully described by μ and σ.\n- Uncorrelated jointly-normal variables are independent (true for the normal, NOT in general).\n\nGotcha:\n- It has thin tails, so it badly underestimates extreme events in finance, latency and network traffic. Assuming normality where the tails are heavy is how risk models fail.',
  },
  {
    front: "Student's t distribution — why the heavier tails?",
    back: 'The distribution of a sample mean when the standard deviation σ is UNKNOWN and estimated from the same small sample.\n\nMechanism:\n- You are dividing by an estimated SD that is itself noisy. Sometimes you underestimate it, which inflates the ratio — so extreme values happen more often than under a normal. Hence the fatter tails.\n\nBehaviour:\n- As degrees of freedom → ∞ it converges to the normal (the SD estimate becomes reliable). By n ≈ 30 the difference is small.\n\nUse it when:\n- Small samples with unknown variance. Also used deliberately as a heavy-tailed likelihood for robust regression.',
  },
  {
    front: 'Chi-squared distribution — where does it come from?',
    back: 'The distribution of a SUM of k squared independent standard-normal variables. Mean k, variance 2k. Strictly positive, right-skewed.\n\nWhy it shows up:\n- Whenever you sum squared deviations. It is the reference distribution for sample variance, for goodness-of-fit tests, and for likelihood-ratio tests (−2 log Λ is asymptotically chi-squared).\n\nMechanism:\n- The degrees of freedom = number of independent squared terms after subtracting estimated parameters. This is why df bookkeeping matters so much in these tests.\n\nExample:\n- Comparing observed vs expected counts across categories.',
  },
  {
    front: 'Beta distribution — the natural prior for a rate',
    back: 'A distribution over the interval [0, 1], shaped by two parameters α and β. Mean α / (α + β).\n\nWhy it pairs with the Binomial:\n- It is the CONJUGATE prior. Observing s successes and f failures updates Beta(α, β) → Beta(α + s, β + f). The update is literally addition — no integration.\n\nIntuition:\n- α − 1 and β − 1 act like "prior successes and failures". Beta(1, 1) is uniform — no information.\n\nUse in ML:\n- Bayesian A/B testing, Thompson sampling for bandits, and smoothing sparse rates — a new item with 1 click in 2 impressions gets pulled toward the prior instead of scored 50%.',
  },
  {
    front: 'Log-normal distribution',
    back: 'X is log-normal if log(X) is normally distributed. Strictly positive, right-skewed.\n\nWhy it appears so often:\n- It arises from MULTIPLICATIVE processes, just as the normal arises from additive ones. Anything built by repeated proportional growth trends log-normal.\n\nExamples:\n- Income, house prices, session length, latency, file sizes, revenue per user.\n\nGotcha:\n- Mean ≠ median; the mean is pulled well above the median by the tail. A "mean revenue per user" on log-normal data describes almost nobody.\n- E[X] = exp(μ + σ²/2), NOT exp(μ) — which is why naive back-transformation understates the mean.',
  },
  {
    front: 'Power laws and heavy tails',
    back: 'A distribution where P(X > x) ∝ x^(−α). Scale-free: there is no typical value, and the tail dominates every total.\n\nConsequences:\n- For α ≤ 2 the variance is INFINITE; for α ≤ 1 even the mean is.\n- Sample statistics never stabilise — collecting more data can make the sample mean JUMP rather than settle.\n\nExamples:\n- Item popularity, city sizes, word frequency, network degree, wealth.\n\nML relevance:\n- Why recommender catalogues have a long tail, why "average" popularity is meaningless, and why CLT-based confidence intervals silently fail on such metrics. Work on logs, use medians, or model the tail explicitly.',
  },
  {
    front: 'Skewness and kurtosis',
    back: 'Two shape numbers beyond mean and variance:\n- Skewness: asymmetry. Positive = long right tail (mean > median).\n- Kurtosis: tail weight relative to a normal. Excess kurtosis > 0 means fatter tails and more outliers.\n\nWhy they matter operationally:\n- Positive skew makes the mean a poor summary and inflates the variance of the sample mean, so tests lose power.\n- High kurtosis means extreme values arrive more often than any normal-based interval expects.\n\nGotcha:\n- Both are extremely sensitive to outliers — they are built from third and fourth powers, so one extreme point can dominate the estimate.\n\nFix:\n- Log or Box-Cox transform, winsorise, or switch to rank-based methods.',
  },
  {
    front: 'QQ plot — how do you read one?',
    back: 'Plots your sample\'s quantiles against the quantiles a reference distribution would predict. A straight 45° line means the distribution matches.\n\nReading the deviations:\n- S-shape: the tails are wrong. Ends bending UP above the line = heavier tails than assumed.\n- A convex or concave bow: skew.\n- One point far off the line: an outlier.\n\nWhy prefer it to a histogram:\n- Histograms depend heavily on bin width and hide tail behaviour — which is exactly where model assumptions break.\n\nUse it when:\n- Checking residual normality, or deciding whether a transform actually worked (compare QQ plots before and after).',
  },
  {
    front: 'Mixture distributions — and why they fool summary statistics',
    back: 'A distribution formed by drawing from several component distributions, each with some probability.\n\nWhy it matters in practice:\n- Almost all real data is a mixture over unobserved segments — device types, new vs returning users, bot vs human traffic.\n\nGotcha:\n- A mixture can be bimodal, so the MEAN falls in the valley between the two humps and describes no actual member of the population. Reported alone it is actively misleading.\n\nSignals:\n- Bimodal histograms; variance far larger than any single component; a metric that moves without any component moving (the mix shifted).\n- This is the mechanism behind Simpson\'s paradox and behind drift caused purely by traffic composition.',
  },
  {
    front: 'Choosing a likelihood for your target variable',
    back: 'Match the assumed output distribution to the data type — this is what "picking a loss" really means.\n\n- Continuous, symmetric → Normal (squared error).\n- Continuous, positive and skewed → log-normal or Gamma (often: model log y).\n- Binary → Bernoulli (cross-entropy).\n- Counts → Poisson, or negative binomial if overdispersed.\n- Counts with an exposure → Poisson with an offset.\n- Bounded proportions → Beta.\n- Time-to-event with censoring → a survival model, not regression.\n\nGotcha:\n- Squared error on skewed positive data chases the tail and predicts negative values.\n- Poisson on overdispersed counts gives confident, wrong standard errors.',
  },
]
