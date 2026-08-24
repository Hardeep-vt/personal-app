// Practical experimentation — what actually goes wrong in real A/B tests.

export default [
  {
    front: 'Randomisation unit vs analysis unit',
    back: 'They must MATCH. If you randomise by user but analyse by page view, your observations are not independent — one user contributes many correlated rows.\n\nConsequence: the standard error is computed as though you had far more independent data than you do, so confidence intervals are too narrow and false positives soar. This is one of the most common real-world A/B testing bugs.\n\nFix: analyse at the randomisation unit (aggregate to per-user metrics), or use cluster-robust standard errors / the delta method to account for within-user correlation.\n\nRule: the more page views per user, the worse the inflation.',
  },
  {
    front: 'Cluster randomisation — when and what it costs',
    back: 'Randomise groups (schools, cities, accounts, sessions-by-region) rather than individuals.\n\nWhy: it prevents contamination when units interact, so it is the standard answer to SUTVA violations from network effects or shared marketplace supply.\n\nThe cost: your EFFECTIVE SAMPLE SIZE is closer to the number of clusters than the number of individuals. Ten cities is ten data points, however many users they contain — so power drops sharply.\n\nQuantified by: the intra-cluster correlation. Higher ICC means members of a cluster are more alike and the effective n is smaller.\n\nImplication: cluster-randomised tests need many more users to detect the same effect.',
  },
  {
    front: 'Sample Ratio Mismatch (SRM)',
    back: 'You intended a 50/50 split but observe 50.4/49.6. With large n a chi-squared test on the assignment counts rejects decisively — signalling a bug.\n\nWhy it is the single most valuable A/B guardrail: it does not test your metric, it tests your EXPERIMENT. An SRM means assignment, logging, or filtering is broken, so every result from that test is untrustworthy regardless of how good it looks.\n\nCommon causes: redirect-based assignment losing slow clients, bot filtering applied unevenly, a crash affecting one variant, or joining on a table that drops rows for one arm.\n\nRule: if SRM fires, DEBUG — never interpret the metrics. A "winning" test with SRM is usually a broken test.',
  },
  {
    front: 'Guardrail metrics',
    back: 'Metrics you do not expect to improve but must not damage: latency, crash rate, unsubscribes, support tickets, and overall revenue.\n\nWhy they are essential: teams optimise a single success metric, and the cheapest way to move it is often to harm something else. A recommendation change can raise CTR by degrading page latency or by cannibalising another surface.\n\nHow to use them: monitor them for DEGRADATION at a looser threshold, and treat any regression as blocking regardless of the win on the primary metric.\n\nAlso include invariants: metrics that logically cannot change (assignment ratio, counts of unaffected surfaces). If they move, you have a bug.',
  },
  {
    front: 'Network effects and interference in experiments',
    back: 'Treatment leaks from treated to control units, so the control group is no longer a clean counterfactual.\n\nMechanisms: social spillover (treated users message untreated ones), marketplace competition (treated buyers take inventory), and shared models or caches trained on pooled traffic.\n\nDirection of the bias: usually it SHRINKS the measured effect, because control is partly treated — so you underestimate a real win. With marketplace competition it can INFLATE it, because the treatment steals from control rather than growing the pie.\n\nFixes: cluster or graph-partition randomisation, geo splits, time-based switchbacks, or two-sided designs that randomise both sides of a marketplace.',
  },
  {
    front: 'Sequential testing and always-valid p-values',
    back: 'Methods designed for CONTINUOUS monitoring, so you can stop as soon as the evidence is sufficient without inflating the false positive rate.\n\nApproaches: group sequential designs with pre-specified interim looks and adjusted boundaries (O\'Brien-Fleming), or always-valid p-values / confidence sequences based on martingale bounds.\n\nThe trade-off: they are more conservative at any single look than a fixed-n test, so if the effect is large you stop much sooner, and if it is small you may need more data than a fixed design would have.\n\nWhy it matters: it makes the natural human behaviour — checking the dashboard daily — statistically legitimate instead of a source of false wins.',
  },
  {
    front: 'Stratification and blocking',
    back: 'Randomise WITHIN strata (country, device, new vs returning, pre-period activity level) so each arm gets balanced representation.\n\nWhy it helps: it removes between-stratum variance from the comparison, reducing the variance of the treatment effect estimate. Same n, more power — the same principle behind CUPED and paired tests.\n\nWhen it matters most: small experiments where chance imbalance is likely, and populations with a few heavy strata that dominate the metric.\n\nGotcha: you must ANALYSE with the same stratification you randomised on, otherwise you forfeit the gain. And stratify only on PRE-treatment variables — stratifying on anything post-treatment biases the estimate.',
  },
  {
    front: 'Ratio metrics and why their variance is tricky',
    back: 'Metrics like clicks-per-session or revenue-per-order have a random NUMERATOR AND DENOMINATOR, often correlated.\n\nThe error: treating the ratio as a simple mean and using the usual standard error. That ignores denominator variance and the covariance, giving intervals that are wrong — often too narrow.\n\nFix: the delta method gives the correct variance including the covariance term; or bootstrap at the randomisation unit, which handles it without formulas.\n\nRelated trap: the ratio of averages ≠ the average of ratios. Per-user CTR averaged across users weights a one-impression user equally with a thousand-impression user. Decide which quantity you actually want.',
  },
  {
    front: 'Winsorisation and capping for skewed metrics',
    back: 'Revenue and session-length metrics are heavily right-skewed, so a single whale can dominate the difference between arms and make results swing unpredictably.\n\nWinsorise: clip values above a high percentile (e.g. 99th) to that percentile. Trimming instead DISCARDS them, which changes the population you are describing.\n\nWhy it helps: it cuts variance dramatically, restoring power — the outliers were adding noise, not signal about the treatment.\n\nGotchas: it BIASES the metric (you are no longer estimating true mean revenue), so pre-declare the cap and apply it identically to both arms. If treatment genuinely works by creating whales, capping hides your actual effect.',
  },
  {
    front: "Twyman's law",
    back: '"Any figure that looks interesting or different is usually wrong."\n\nWhy it deserves to be a rule: the prior probability of a 40% lift from a button colour change is far lower than the probability of an instrumentation bug. Extraordinary results are evidence about your pipeline before they are evidence about user behaviour.\n\nWhat to check first: SRM, logging duplication, filters applied to one arm, a metric definition change shipped in the same window, bot traffic, and whether the effect is concentrated in one platform or one day.\n\nPractical discipline: require a mechanism. If nobody can explain HOW the change produced the effect, treat it as unverified.',
  },
  {
    front: 'Interaction between concurrent experiments',
    back: 'Most organisations run many tests simultaneously on overlapping traffic. Usually this is fine — effects are roughly additive and randomisation makes other tests balanced noise.\n\nWhen it breaks: two tests changing the same surface, or one changing what the other measures. Then the effects are not additive and each test\'s "control" contains a mixture of the other\'s variants.\n\nDefences: orthogonal/independent hashing per experiment so overlaps are balanced; mutually exclusive layers for tests known to conflict; and an interaction check on shared surfaces.\n\nGotcha: with many tests, some pair WILL show a spurious interaction by chance — do not chase every one; require a plausible mechanism.',
  },
  {
    front: 'Long-term holdouts and why short tests mislead',
    back: 'A permanent (or long) holdout group that never receives the accumulated changes, measured over months.\n\nWhy you need one: short tests capture novelty, miss habituation, and cannot see cumulative or compounding effects. A series of individually positive tests can sum to a negative long-run outcome — notifications that each lift engagement while collectively driving unsubscribes.\n\nWhat it catches: metric erosion, user fatigue, ecosystem effects, and the gap between short-term proxies and retention.\n\nCosts: some users permanently receive a worse product, it needs disciplined infrastructure to maintain, and the holdout population slowly becomes unrepresentative as it self-selects through churn.',
  },
  {
    front: "Goodhart's law and metric gaming",
    back: '"When a measure becomes a target, it ceases to be a good measure."\n\nMechanism: optimisation finds the cheapest path to the number, which is rarely the intended behaviour. The proxy and the goal diverge precisely because you applied pressure to the proxy.\n\nML examples: optimising CTR produces clickbait; optimising watch time produces autoplay traps; optimising "resolved tickets" produces prematurely closed tickets; optimising a reward model produces outputs that exploit the reward model.\n\nDefences: pair the target with guardrails that capture the harm, use multiple objectives, measure long-term outcomes via holdouts, and re-validate periodically that the proxy still correlates with the goal.',
  },
]
