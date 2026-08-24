// Hypothesis testing: the specific tests interviewers expect you to name and justify.

export default [
  {
    front: 't-test — the three variants and when to use each',
    back: 'One-sample: is this mean different from a fixed value? Two-sample (independent): do two groups differ? Paired: do matched observations differ (before/after, same user under both conditions)?\n\nWhy paired matters: pairing removes between-subject variability from the comparison, so it is far more powerful for the same n. If your design has a natural pairing and you run an unpaired test, you are throwing away power.\n\nAssumptions: roughly normal sampling distribution of the mean (CLT usually covers it), independent observations, and — for the classic version — equal variances.\n\nGotcha: repeated measurements from the same user are not independent observations.',
  },
  {
    front: 'z-test vs t-test',
    back: 'z-test: population σ known, or n large enough that σ̂ is effectively exact. t-test: σ estimated from the sample.\n\nIn practice: you almost never know σ, so the t-test is the honest default. The two converge as n grows — beyond n≈30 the difference in critical values is negligible.\n\nWhy it still matters: with small n, using z instead of t gives intervals that are too NARROW and p-values that are too small, because it ignores the uncertainty in your variance estimate.\n\nProportions: for large-sample proportion tests a z-test is standard, since the variance is determined by p itself rather than estimated separately.',
  },
  {
    front: "Welch's t-test — and why it should be your default",
    back: 'A two-sample t-test that does NOT assume equal variances, adjusting the degrees of freedom instead.\n\nWhy default to it: the equal-variance assumption is usually false, and Student\'s version is not robust to violating it — especially with unequal group sizes, where it gives badly wrong error rates. Welch costs almost nothing in power when variances ARE equal.\n\nGotcha: the common ritual of running Levene\'s test first and then choosing is itself a form of multiple testing that distorts the error rate. Just use Welch.\n\nRelevance to A/B tests: treatment often changes the variance as well as the mean, so unequal variances are the norm.',
  },
  {
    front: 'Chi-squared test of independence',
    back: 'Tests whether two categorical variables are associated, comparing observed counts to those expected under independence: Σ(O−E)²/E, with df = (r−1)(c−1).\n\nUse for: conversion by variant, feature category vs outcome, any contingency table.\n\nAssumptions: independent observations and adequate expected counts — the usual rule is all expected counts ≥ 5. Below that the chi-squared approximation breaks and you should use Fisher\'s exact test.\n\nGotcha: it tells you THAT there is an association, not where or how strong. With large n, trivial associations become significant, so pair it with an effect size such as Cramér\'s V.',
  },
  {
    front: "Fisher's exact test",
    back: 'Computes the exact probability of the observed 2×2 table (and more extreme ones) under independence, using the hypergeometric distribution rather than an approximation.\n\nUse when: small samples or sparse cells, where chi-squared\'s expected-count assumption fails.\n\nUnder the hood: it conditions on the observed margins and enumerates possible tables — exact, but combinatorially expensive for large tables.\n\nGotcha: it is somewhat CONSERVATIVE (actual error rate below nominal), so it can be underpowered. For large samples chi-squared is fine and much cheaper.',
  },
  {
    front: 'ANOVA and the F-test',
    back: 'Tests whether three or more group means differ, via the F ratio = between-group variance / within-group variance.\n\nWhy not many t-tests: comparing k groups pairwise inflates the false positive rate. ANOVA gives one omnibus test at the intended α.\n\nCritical limitation: a significant F tells you SOME groups differ, not which. You then need post-hoc comparisons with correction (Tukey HSD) — and that step is where people quietly reintroduce the multiple-comparisons problem.\n\nAssumptions: normality of residuals, independence, and equal variances across groups (use Welch\'s ANOVA otherwise).',
  },
  {
    front: 'Mann-Whitney U / Wilcoxon rank-sum',
    back: 'A non-parametric alternative to the two-sample t-test, operating on RANKS rather than values. Tests whether one group tends to produce larger values.\n\nUse when: heavy skew, outliers, ordinal data, or small samples where normality is doubtful.\n\nUnder the hood: replacing values with ranks caps the influence of any single extreme point, which is where the robustness comes from — and also what it costs you, since magnitude information is discarded.\n\nGotcha: it is NOT a test of medians in general — it tests stochastic dominance. If the two distributions have different shapes, a significant result can occur with equal medians. Wilcoxon SIGNED-rank is the paired version.',
  },
  {
    front: 'Kolmogorov-Smirnov test',
    back: 'Compares two distributions (or one against a theoretical one) using the maximum vertical distance between their empirical CDFs.\n\nUse in ML: the standard drift detector for continuous features — compare the live feature distribution against the training one.\n\nStrength: distribution-free and sensitive to any difference in shape, not just location.\n\nGotchas: it is most sensitive near the CENTRE of the distribution and comparatively blind in the tails, which is often where drift matters most. With large n it flags statistically significant but practically irrelevant differences — so monitor the KS STATISTIC as an effect size, not its p-value. It also only handles continuous data.',
  },
  {
    front: 'One-tailed vs two-tailed tests',
    back: 'Two-tailed: is there any difference? One-tailed: is it specifically in this direction?\n\nThe trade-off: a one-tailed test at α=0.05 puts the whole rejection region on one side, so it has more power to detect an effect in that direction — but ZERO ability to detect the opposite.\n\nGotcha: choosing one-tailed AFTER seeing the direction of your result effectively doubles your false positive rate. The direction must be committed to in advance for a substantive reason.\n\nPractical guidance: use two-tailed almost always in experimentation. You genuinely do want to know if your new model made things worse.',
  },
  {
    front: "Effect size and Cohen's d",
    back: 'Effect size measures MAGNITUDE independently of sample size. Cohen\'s d = (mean₁ − mean₂)/pooled SD — the difference expressed in standard deviations.\n\nRules of thumb: 0.2 small, 0.5 medium, 0.8 large.\n\nWhy it is essential: p-values conflate effect size with sample size. With n large enough, everything is significant. The effect size is what tells you whether anyone should care.\n\nOther forms: Cramér\'s V for categorical association, r or R² for variance explained, odds ratio for binary outcomes, and absolute lift for business decisions.\n\nInterview answer: always report an effect size and a confidence interval alongside any p-value.',
  },
  {
    front: 'FWER vs FDR — which should you control?',
    back: 'Family-Wise Error Rate: P(at least one false positive anywhere). Controlled by Bonferroni. Very strict, and power collapses as tests multiply.\n\nFalse Discovery Rate: the expected PROPORTION of your rejections that are false. Controlled by Benjamini-Hochberg.\n\nChoosing: control FWER when a single false positive is costly and you will act on each finding individually — a confirmatory experiment, a regulatory claim. Control FDR when you are screening many candidates and will follow up in bulk — feature selection, gene screens, scanning many segments.\n\nGotcha: Bonferroni on 500 tests makes almost nothing significant, so people quietly drop the correction. FDR is the honest middle ground.',
  },
  {
    front: 'Equivalence and non-inferiority testing',
    back: 'Standard tests can never prove "no difference" — failing to reject the null is not evidence of equivalence.\n\nEquivalence testing inverts the logic: define a margin δ of practical indifference, and test whether the difference lies entirely INSIDE (−δ, +δ). TOST (two one-sided tests) is the usual implementation.\n\nWhy ML teams need it: "the smaller, cheaper model is no worse than the big one" is an equivalence claim. So is "this refactor did not change behaviour."\n\nGotcha: the margin δ must be chosen on substantive grounds before the test. Choosing it after seeing the data makes the whole thing meaningless.',
  },
  {
    front: 'Parametric vs non-parametric — the real trade-off',
    back: 'Parametric tests assume a distributional form and estimate its parameters. Non-parametric tests assume much less, usually working through ranks or resampling.\n\nThe trade-off: if the parametric assumptions hold, those tests have MORE POWER for the same n. If they fail, the parametric error rates are simply wrong.\n\nPractical guidance: with large n, the CLT makes mean-based parametric tests robust to non-normality, so use them. With small n, heavy skew, or extreme outliers, prefer rank-based tests, a permutation test, or a bootstrap.\n\nGotcha: non-parametric does NOT mean assumption-free — most still require independence and exchangeability.',
  },
  {
    front: 'Statistical vs practical significance',
    back: 'Statistical significance says an effect is probably not zero. Practical significance says it is big enough to act on. They are unrelated questions.\n\nFour possible outcomes, and two are traps: significant but trivially small (huge n detecting a 0.01% lift that costs more to ship than it earns), and non-significant but potentially large (underpowered test, wide interval that includes both a big win and a big loss — that is "we do not know," not "no effect").\n\nWhat to report: the effect size with a confidence interval, compared against a pre-declared minimum meaningful effect. Then the decision follows from where the interval sits relative to that threshold.',
  },
]
