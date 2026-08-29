// Practical experimentation — what actually goes wrong in real A/B tests.

export default [
  {
    front: 'Randomisation unit vs analysis unit',
    back: 'The unit you randomise on and the unit you analyse on must MATCH.\n- Randomise by user but analyse by page view, and your observations are not independent — one user contributes many correlated rows.\n\nConsequence:\n- The standard error is computed as though you had far more independent data than you do. Confidence intervals come out too narrow and false positives soar. One of the most common real-world A/B bugs.\n\nFix:\n- Analyse at the randomisation unit (aggregate to per-user metrics), or use cluster-robust standard errors / the delta method to account for within-user correlation.\n\nRule:\n- The more page views per user, the worse the inflation.',
  },
  {
    front: 'Cluster randomisation — when and what it costs',
    back: 'Randomise whole GROUPS (schools, cities, accounts, regions) rather than individuals.\n\nWhy:\n- It prevents contamination when units interact — the standard answer to network effects or shared marketplace supply.\n\nThe cost:\n- Your EFFECTIVE sample size is closer to the number of clusters than the number of individuals. Ten cities is ten data points, however many users they contain — so power drops sharply.\n\nQuantified by:\n- The intra-cluster correlation (ICC). Higher ICC means members of a cluster are more alike, so the effective n is smaller.\n\nImplication:\n- Cluster-randomised tests need many more users to detect the same effect.',
  },
  {
    front: 'Sample Ratio Mismatch (SRM)',
    back: 'You intended a 50/50 split but observe, say, 50.4 / 49.6. With large n a chi-squared test on the assignment counts rejects decisively — a signal that something is broken.\n\nWhy it is the single most valuable A/B guardrail:\n- It does not test your metric, it tests your EXPERIMENT. An SRM means assignment, logging, or filtering is broken, so every result from that test is untrustworthy however good it looks.\n\nCommon causes:\n- Redirect-based assignment losing slow clients, bot filtering applied unevenly, a crash affecting one variant, or a join that drops rows for one arm.\n\nRule:\n- If SRM fires, DEBUG — never interpret the metrics. A "winning" test with SRM is usually a broken test.',
  },
  {
    front: 'Guardrail metrics',
    back: 'Metrics you do not expect to improve but must not damage: latency, crash rate, unsubscribes, support tickets, overall revenue.\n\nWhy they are essential:\n- Teams optimise one success metric, and the cheapest way to move it is often to harm something else. A recommendation change can raise CTR by degrading page latency or by cannibalising another surface.\n\nHow to use them:\n- Monitor for DEGRADATION at a looser threshold, and treat any regression as blocking regardless of the win on the primary metric.\n\nAlso include invariants:\n- Metrics that logically cannot change (assignment ratio, counts on unaffected surfaces). If they move, you have a bug.',
  },
  {
    front: 'Network effects and interference in experiments',
    back: 'Treatment leaks from treated users to control users, so the control group stops being a clean counterfactual.\n\nMechanisms:\n- Social spillover (a treated user messages an untreated one), marketplace competition (treated buyers take inventory), shared models or caches trained on pooled traffic.\n\nDirection of the bias:\n- Usually SHRINKS the measured effect, because control is partly treated — you underestimate a real win.\n- With marketplace competition it can INFLATE it, because the treatment steals from control rather than growing the pie.\n\nFixes:\n- Cluster or graph-partition randomisation, geo splits, time-based switchbacks, or two-sided designs that randomise both sides of a marketplace.',
  },
  {
    front: 'Sequential testing and always-valid p-values',
    back: 'Methods built for CONTINUOUS monitoring, so you can stop as soon as the evidence is sufficient without inflating the false-positive rate.\n\nApproaches:\n- Group sequential designs with pre-specified interim looks and adjusted boundaries (O\'Brien-Fleming).\n- Always-valid p-values / confidence sequences based on martingale bounds.\n\nThe trade-off:\n- They are more conservative at any single look than a fixed-n test. If the effect is large you stop much sooner; if it is small you may need more data than a fixed design would have.\n\nWhy it matters:\n- It makes the natural human behaviour — checking the dashboard daily — statistically legitimate instead of a source of false wins.',
  },
  {
    front: 'Stratification and blocking',
    back: 'Randomise WITHIN strata (country, device, new vs returning, prior activity level) so each arm gets a balanced mix.\n\nWhy it helps:\n- It removes between-stratum variance from the comparison, cutting the variance of the treatment-effect estimate. Same n, more power — the same principle as CUPED and paired tests.\n\nWhen it matters most:\n- Small experiments where chance imbalance is likely, and populations with a few heavy strata that dominate the metric.\n\nGotcha:\n- You must ANALYSE with the same stratification you randomised on, or you forfeit the gain.\n- Stratify only on PRE-treatment variables. Stratifying on anything measured after treatment biases the estimate.',
  },
  {
    front: 'Ratio metrics and why their variance is tricky',
    back: 'Metrics like clicks-per-session or revenue-per-order have a random NUMERATOR AND DENOMINATOR, often correlated.\n\nThe error:\n- Treating the ratio as a simple mean and using the usual standard error. That ignores denominator variance and the covariance, giving intervals that are wrong — usually too narrow.\n\nFix:\n- The delta method gives the correct variance including the covariance term; or bootstrap at the randomisation unit, which handles it with no formula.\n\nRelated trap:\n- The ratio of averages ≠ the average of ratios. Per-user CTR averaged across users weights a one-impression user the same as a thousand-impression user. Decide which quantity you actually want.',
  },
  {
    front: 'Winsorisation and capping for skewed metrics',
    back: 'Revenue and session-length metrics are heavily right-skewed, so a single "whale" can dominate the difference between arms and make results swing unpredictably.\n\nWinsorise:\n- Clip values above a high percentile (e.g. the 99th) down to that percentile. Trimming instead DISCARDS them, which changes the population you are describing.\n\nWhy it helps:\n- It cuts variance sharply, restoring power — those outliers were adding noise, not signal about the treatment.\n\nGotchas:\n- It BIASES the metric (you are no longer estimating true mean revenue), so pre-declare the cap and apply it identically to both arms.\n- If the treatment genuinely works by creating whales, capping hides your real effect.',
  },
  {
    front: "Twyman's law",
    back: '"Any figure that looks interesting or different is usually wrong."\n\nWhy it deserves to be a rule:\n- The prior probability of a 40% lift from a button-colour change is far lower than the probability of an instrumentation bug. An extraordinary result is evidence about your pipeline before it is evidence about user behaviour.\n\nWhat to check first:\n- SRM, logging duplication, filters applied to one arm, a metric-definition change shipped in the same window, bot traffic, and whether the effect is concentrated in one platform or one day.\n\nDiscipline:\n- Require a mechanism. If nobody can explain HOW the change produced the effect, treat it as unverified.',
  },
  {
    front: 'Interaction between concurrent experiments',
    back: 'Most organisations run many tests at once on overlapping traffic. Usually this is fine — effects are roughly additive and randomisation makes other tests balanced noise.\n\nWhen it breaks:\n- Two tests changing the same surface, or one changing what the other measures. Then the effects are not additive, and each test\'s "control" contains a mixture of the other\'s variants.\n\nDefences:\n- Orthogonal / independent hashing per experiment so overlaps stay balanced.\n- Mutually exclusive layers for tests known to conflict.\n- An interaction check on shared surfaces.\n\nGotcha:\n- With many tests, some pair WILL show a spurious interaction by chance. Do not chase every one; require a plausible mechanism.',
  },
  {
    front: 'Long-term holdouts and why short tests mislead',
    back: 'A permanent (or long-running) holdout group that never receives the accumulated changes, measured over months.\n\nWhy you need one:\n- Short tests capture novelty, miss habituation, and cannot see cumulative or compounding effects. A series of individually positive tests can sum to a negative long-run outcome — notifications that each lift engagement while collectively driving unsubscribes.\n\nWhat it catches:\n- Metric erosion, user fatigue, ecosystem effects, and the gap between short-term proxies and retention.\n\nCosts:\n- Some users permanently get a worse product, it needs disciplined infrastructure, and the holdout population slowly becomes unrepresentative as it self-selects through churn.',
  },
  {
    front: "Goodhart's law and metric gaming",
    back: '"When a measure becomes a target, it ceases to be a good measure."\n\nMechanism:\n- Optimisation finds the cheapest path to the number, which is rarely the intended behaviour. The proxy and the goal diverge precisely because you applied pressure to the proxy.\n\nML examples:\n- Optimising CTR → clickbait.\n- Optimising watch time → autoplay traps.\n- Optimising "resolved tickets" → prematurely closed tickets.\n- Optimising a reward model → outputs that exploit the reward model.\n\nDefences:\n- Pair the target with guardrails that capture the harm, use multiple objectives, measure long-term outcomes via holdouts, and periodically re-check that the proxy still correlates with the goal.',
  },
]
