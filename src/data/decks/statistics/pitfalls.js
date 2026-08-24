// Fallacies, biases and time-series traps that break real analyses.

export default [
  {
    front: 'p-hacking and the garden of forking paths',
    back: 'p-hacking: trying variations — subsets, outlier rules, covariates, transforms, metrics — until something clears p<0.05.\n\nThe garden of forking paths is the subtler version: you run ONE analysis, but the choices you made along the way were contingent on the data. No conscious cheating occurred, yet the effective number of tests is large, so the reported p-value is meaningless.\n\nWhy it is so common in ML: the analysis pipeline has dozens of defensible-looking decision points.\n\nDefences: pre-register the primary metric and analysis, report every variant you tried, split exploratory from confirmatory work, and validate on genuinely fresh data.',
  },
  {
    front: 'HARKing and the Texas sharpshooter fallacy',
    back: 'HARKing: Hypothesising After the Results are Known — presenting a finding discovered in the data as though it had been predicted.\n\nTexas sharpshooter: firing at a barn, then drawing the target around the tightest cluster of holes. Any large dataset contains striking patterns purely by chance; selecting the pattern first and the hypothesis second guarantees you find one.\n\nWhy it feels legitimate: the story is constructed after the fact and sounds entirely plausible — plausibility is not evidence.\n\nDefence: exploratory findings are HYPOTHESES, not conclusions. They require confirmation on data that played no part in generating them. Say which mode you are in.',
  },
  {
    front: 'Ecological fallacy (and its inverse)',
    back: 'Ecological fallacy: inferring individual behaviour from group-level correlations. Regions with more immigrants may have higher literacy while immigrants individually have lower literacy — the group relationship need not hold at the individual level.\n\nAtomistic fallacy: the reverse, inferring group effects from individual data.\n\nUnder the hood: aggregation destroys within-group variation, so group-level correlations are typically stronger and can even flip sign. It is the same machinery as Simpson\'s paradox.\n\nML relevance: features aggregated to a coarse level (city-average income as a user feature) do not carry the individual relationship you assume, and models built on them can behave very differently per person.',
  },
  {
    front: 'Look-ahead bias and time-travel in features',
    back: 'Any feature computed using information not available at prediction time. Offline metrics look excellent; production collapses.\n\nCommon sources: aggregates computed over the full dataset including the future; a label-derived field ("total_purchases" when predicting purchase); a status column that gets UPDATED in place, so the historical row shows today\'s value; joining a dimension table without effective dates.\n\nThe diagnostic question for every feature: would I have known this value, with this value, at the moment of the decision?\n\nDefences: point-in-time correct joins, strictly temporal train/test splits, and immediate suspicion of any single feature with dominant importance.',
  },
  {
    front: "Winner's curse in model and variant selection",
    back: 'When you pick the best of many candidates on a noisy estimate, the winner\'s TRUE performance is systematically worse than its observed score.\n\nUnder the hood: winning requires both genuine quality and favourable noise. Selection is partly selection on noise, which does not repeat — so the effect shrinks on re-measurement.\n\nConsequences: the best of 50 A/B variants overstates its lift; the top Kaggle leaderboard model is partly lucky; the best hyperparameter configuration underperforms its search score.\n\nWhy this is regression to the mean with teeth: the more candidates and the noisier the estimate, the bigger the shortfall.\n\nFix: re-measure the winner on fresh data, or shrink the estimate.',
  },
  {
    front: 'Stationarity and spurious regression',
    back: 'A stationary series has constant mean, variance and autocovariance over time. Most business series are NOT stationary — they trend.\n\nSpurious regression: two independent series that both trend upward will show a high R² and a significant coefficient with no relationship whatever. Regressing one random walk on another produces "significant" results the majority of the time.\n\nDetect: an ADF or KPSS test for unit roots; visually, a series that never returns to a mean.\n\nFix: difference the series, model the trend explicitly, or use cointegration methods if a genuine long-run relationship is suspected. Never interpret a regression between two undifferenced trending series.',
  },
  {
    front: 'Autocorrelation and effective sample size',
    back: 'When observations are correlated with their own past, each new point carries less than one point\'s worth of information.\n\nConsequence: your EFFECTIVE sample size is smaller than n, sometimes drastically. Standard errors computed as if independent are too small, so everything looks significant. With positive autocorrelation ρ, effective n is roughly n(1−ρ)/(1+ρ).\n\nWhere it appears: daily metrics, per-user event streams, sensor data, MCMC chains.\n\nDetect: ACF plot, Durbin-Watson, or Ljung-Box test on residuals.\n\nFixes: aggregate to a coarser unit, use HAC/Newey-West standard errors, model the autocorrelation directly, or block-bootstrap rather than resampling points.',
  },
  {
    front: 'Selecting on the dependent variable',
    back: 'Studying only cases with the outcome you care about, with no comparison group.\n\nExamples: analysing only converting users to find "what drives conversion"; studying only successful startups for lessons; reviewing only churned accounts to explain churn.\n\nWhy it cannot work: without the non-outcome group you cannot compute any conditional difference. If 90% of converters used feature X but so did 90% of non-converters, X explains nothing — and you would never know.\n\nUnder the hood: this is the base rate fallacy plus survivorship bias combined.\n\nFix: always assemble a comparison group, and think in terms of a 2×2 table rather than a single column.',
  },
  {
    front: 'Aggregation and the choice of unit',
    back: 'The same data yields different answers depending on the level you aggregate to, because different aggregations apply different implicit weights.\n\nExample: average per-user CTR weights a user with one impression equally with one who had 10,000. Total clicks / total impressions weights by activity. Neither is wrong — they answer different questions, and they can move in opposite directions.\n\nGotcha: switching aggregation level mid-analysis, or comparing a metric defined one way against a historical version defined the other, produces changes that look like real effects.\n\nDiscipline: write the metric definition down including the unit and the weighting, and keep it fixed across comparisons.',
  },
  {
    front: 'Multiple testing hidden inside feature selection',
    back: 'Screening thousands of features for association with the target is thousands of hypothesis tests. At α=0.05, 1000 pure-noise features yield about 50 "significant" ones.\n\nConsequence: features selected this way include many spurious ones that will not generalise, and any performance estimate computed on the same data that guided selection is optimistic.\n\nThe compounding error: doing the selection BEFORE cross-validation leaks the whole dataset into every fold. Selection must happen inside the fold.\n\nDefences: fit selection within the CV pipeline, use FDR control if you need a defensible feature list, or prefer embedded regularisation (lasso) whose selection is part of the model being validated.',
  },
  {
    front: 'Correlation of a metric with itself over time (Twyman meets drift)',
    back: 'A metric can move because the underlying behaviour changed, or because the POPULATION MIX changed, or because the instrumentation changed. These are indistinguishable from the aggregate number alone.\n\nWhy it matters: a "model degradation" alert is frequently a traffic-mix shift, a new client version logging differently, or a bot wave — not the model at all.\n\nDiagnostic sequence: decompose the metric by segment and check whether any segment moved, or only the weights did; check volumes for each segment; check whether the change aligns with a release.\n\nRule: before concluding a behavioural change, rule out composition and instrumentation. Mix shifts are more common than behaviour shifts.',
  },
]
