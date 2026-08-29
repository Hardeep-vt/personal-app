// Fallacies, biases and time-series traps that break real analyses.

export default [
  {
    front: 'p-hacking and the garden of forking paths',
    back: 'p-hacking: trying variations — subsets, outlier rules, extra covariates, transforms, alternative metrics — until something clears p < 0.05.\n\nThe garden of forking paths (the subtler version):\n- You run ONE analysis, but every choice along the way was contingent on the data. No conscious cheating, yet the effective number of tests is large, so the reported p-value is meaningless.\n\nWhy it is so common in ML:\n- The analysis pipeline has dozens of defensible-looking decision points.\n\nDefences:\n- Pre-register the primary metric and analysis, report every variant you tried, keep exploratory work separate from confirmatory, and validate on genuinely fresh data.',
  },
  {
    front: 'HARKing and the Texas sharpshooter fallacy',
    back: 'HARKing: Hypothesising After the Results are Known — presenting a pattern you FOUND in the data as though you had predicted it in advance.\n\nTexas sharpshooter:\n- Fire at a barn, then draw the target around the tightest cluster of holes. Any large dataset contains striking patterns by chance; picking the pattern first and the hypothesis second guarantees you "find" one.\n\nWhy it feels legitimate:\n- The story is built after the fact and sounds entirely plausible. Plausibility is not evidence.\n\nDefence:\n- Exploratory findings are HYPOTHESES, not conclusions. They need confirmation on data that played no part in generating them. Say which mode you are in.',
  },
  {
    front: 'Ecological fallacy (and its inverse)',
    back: 'Ecological fallacy: inferring INDIVIDUAL behaviour from GROUP-level correlations.\n- Regions with more immigrants may have higher literacy while immigrants individually have lower literacy. The group relationship need not hold at the individual level.\n\nAtomistic fallacy: the reverse — inferring group effects from individual data.\n\nMechanism:\n- Aggregation destroys within-group variation, so group-level correlations are typically stronger and can even flip sign. Same machinery as Simpson\'s paradox.\n\nML relevance:\n- A feature aggregated to a coarse level (city-average income as a user feature) does not carry the individual relationship you assume, and models built on it can behave very differently per person.',
  },
  {
    front: 'Look-ahead bias and time-travel in features',
    back: 'Any feature computed using information that would not have been available at prediction time. Offline metrics look excellent; production collapses.\n\nCommon sources:\n- Aggregates computed over the full dataset, including the future.\n- A label-derived field ("total_purchases" when predicting purchase).\n- A status column that gets UPDATED in place, so the historical row now shows today\'s value.\n- Joining a dimension table without effective dates.\n\nThe diagnostic question for every feature:\n- Would I have known this value, WITH THIS VALUE, at the moment of the decision?\n\nDefences:\n- Point-in-time correct joins, strictly temporal train/test splits, and immediate suspicion of any single feature with dominant importance.',
  },
  {
    front: "Winner's curse in model and variant selection",
    back: 'When you pick the best of many candidates based on a noisy estimate, the winner\'s TRUE performance is systematically worse than its observed score.\n\nMechanism:\n- Winning requires both genuine quality and favourable noise. Selection is partly selection on noise, which does not repeat — so the estimate shrinks on re-measurement.\n\nConsequences:\n- The best of 50 A/B variants overstates its lift.\n- The top Kaggle leaderboard model is partly lucky.\n- The best hyperparameter configuration underperforms its search score.\n\nWhy it is regression to the mean with teeth:\n- The more candidates and the noisier the estimate, the bigger the shortfall.\n\nFix:\n- Re-measure the winner on fresh data, or shrink the estimate.',
  },
  {
    front: 'Stationarity and spurious regression',
    back: 'A stationary series has constant mean, variance and autocovariance over time. Most business series are NOT stationary — they trend.\n\nSpurious regression:\n- Two independent series that both trend upward will show a high R² and a "significant" coefficient with no real relationship. Regressing one random walk on another produces significant results most of the time.\n\nDetect:\n- An ADF or KPSS test for unit roots; visually, a series that never returns to a mean.\n\nFix:\n- Difference the series, model the trend explicitly, or use cointegration methods if a genuine long-run relationship is suspected. Never interpret a regression between two undifferenced trending series.',
  },
  {
    front: 'Autocorrelation and effective sample size',
    back: 'When observations are correlated with their own recent past, each new point carries LESS than one point\'s worth of new information.\n\nConsequence:\n- Your EFFECTIVE sample size is smaller than n, sometimes drastically. Standard errors computed as if independent are too small, so everything looks significant. With positive autocorrelation ρ, effective n ≈ n·(1 − ρ) / (1 + ρ).\n\nWhere it appears:\n- Daily metrics, per-user event streams, sensor data, MCMC chains.\n\nDetect:\n- ACF plot, Durbin-Watson, or Ljung-Box test on residuals.\n\nFixes:\n- Aggregate to a coarser unit, use HAC / Newey-West standard errors, model the autocorrelation directly, or block-bootstrap instead of resampling points.',
  },
  {
    front: 'Selecting on the dependent variable',
    back: 'Studying only the cases that have the outcome you care about, with no comparison group.\n\nExamples:\n- Analysing only converting users to find "what drives conversion".\n- Studying only successful startups for lessons.\n- Reviewing only churned accounts to explain churn.\n\nWhy it cannot work:\n- Without the non-outcome group you cannot compute any conditional difference. If 90% of converters used feature X but so did 90% of non-converters, X explains nothing — and you would never know.\n\nMechanism:\n- The base rate fallacy plus survivorship bias combined.\n\nFix:\n- Always assemble a comparison group, and think in terms of a 2×2 table, not a single column.',
  },
  {
    front: 'Aggregation and the choice of unit',
    back: 'The same data gives different answers depending on the level you aggregate to, because different aggregations apply different implicit weights.\n\nExample:\n- Average per-user CTR weights a one-impression user the same as a 10,000-impression user.\n- Total clicks / total impressions weights by activity.\n- Neither is wrong — they answer different questions, and they can move in opposite directions.\n\nGotcha:\n- Switching aggregation level mid-analysis, or comparing a metric defined one way against a historical version defined the other way, produces changes that look like real effects.\n\nDiscipline:\n- Write the metric definition down, including the unit and the weighting, and keep it fixed across comparisons.',
  },
  {
    front: 'Multiple testing hidden inside feature selection',
    back: 'Screening thousands of features for association with the target IS thousands of hypothesis tests. At α = 0.05, 1000 pure-noise features yield about 50 "significant" ones.\n\nConsequence:\n- Features selected this way include many spurious ones that will not generalise, and any performance estimate computed on the same data that guided selection is optimistic.\n\nThe compounding error:\n- Doing selection BEFORE cross-validation leaks the whole dataset into every fold. Selection must happen inside the fold.\n\nDefences:\n- Fit selection within the CV pipeline, use FDR control if you need a defensible feature list, or prefer embedded regularisation (lasso) whose selection is part of the model being validated.',
  },
  {
    front: 'Correlation of a metric with itself over time (Twyman meets drift)',
    back: 'A metric can move for three indistinguishable reasons:\n- The underlying behaviour changed.\n- The POPULATION MIX changed.\n- The instrumentation changed.\nThe aggregate number alone cannot tell them apart.\n\nWhy it matters:\n- A "model degradation" alert is frequently a traffic-mix shift, a new client version logging differently, or a bot wave — not the model at all.\n\nDiagnostic sequence:\n- Decompose the metric by segment: did any segment move, or only the weights?\n- Check the volume of each segment.\n- Check whether the change aligns with a release.\n\nRule:\n- Before concluding a behavioural change, rule out composition and instrumentation. Mix shifts are more common than behaviour shifts.',
  },
]
