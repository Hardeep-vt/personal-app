// Hypothesis testing: the specific tests interviewers expect you to name and justify.

export default [
  {
    front: 't-test — the three variants and when to use each',
    back: 'A test for whether means differ, in three forms:\n- One-sample: is this mean different from a fixed reference value?\n- Two-sample (independent): do two separate groups differ?\n- Paired: do matched observations differ (before/after, or the same user under both conditions)?\n\nWhy paired matters:\n- Pairing removes between-subject variability from the comparison, so it has far more power for the same n. If your design has a natural pairing and you run an unpaired test, you throw away power.\n\nAssumptions:\n- Roughly normal sampling distribution of the mean (the CLT usually covers it), independent observations, and — for the classic version — equal variances.\n\nGotcha:\n- Repeated measurements from the same user are not independent observations.',
  },
  {
    front: 'z-test vs t-test',
    back: 'Same idea, different assumption about the standard deviation:\n- z-test: population σ is known, or n is large enough that the estimate σ̂ is effectively exact.\n- t-test: σ is estimated from the sample.\n\nIn practice:\n- You almost never know σ, so the t-test is the honest default. The two converge as n grows — beyond n ≈ 30 the difference in critical values is negligible.\n\nWhy it still matters:\n- With small n, using z instead of t gives intervals that are too NARROW and p-values that are too small, because it ignores the uncertainty in your variance estimate.\n\nProportions:\n- For large-sample proportion tests a z-test is standard, since the variance is set by p itself rather than estimated separately.',
  },
  {
    front: "Welch's t-test — and why it should be your default",
    back: 'A two-sample t-test that does NOT assume the two groups have equal variance — it adjusts the degrees of freedom instead.\n\nWhy default to it:\n- The equal-variance assumption is usually false, and the classic (Student) version is not robust to violating it — especially with unequal group sizes, where its error rate goes badly wrong.\n- Welch costs almost nothing in power when the variances ARE equal.\n\nGotcha:\n- Running Levene\'s test first and then choosing is itself a form of multiple testing that distorts the error rate. Just use Welch.\n\nRelevance to A/B tests:\n- A treatment often changes the variance as well as the mean, so unequal variances are the norm.',
  },
  {
    front: 'Chi-squared test of independence',
    back: 'Tests whether two categorical variables are associated, by comparing observed counts to the counts you would expect if they were independent: Σ (O − E)² / E, with df = (r − 1)(c − 1).\n\nUse for:\n- Conversion by variant, feature category vs outcome, any contingency table.\n\nAssumptions:\n- Independent observations, and adequate expected counts — the usual rule is all expected counts ≥ 5. Below that the approximation breaks; use Fisher\'s exact test.\n\nGotcha:\n- It tells you THAT there is an association, not where or how strong. With large n, trivial associations become significant, so pair it with an effect size such as Cramér\'s V.',
  },
  {
    front: "Fisher's exact test",
    back: 'Computes the EXACT probability of your observed 2×2 table (and any more extreme table) under independence, using the hypergeometric distribution instead of an approximation.\n\nUse it when:\n- Small samples or sparse cells, where chi-squared\'s "expected counts ≥ 5" rule fails.\n\nMechanism:\n- It fixes the observed row and column totals and enumerates the possible tables. Exact, but combinatorially expensive for large tables.\n\nGotcha:\n- It is somewhat CONSERVATIVE (true error rate below the nominal α), so it can be underpowered. For large samples, chi-squared is fine and much cheaper.',
  },
  {
    front: 'ANOVA and the F-test',
    back: 'Tests whether three or more group means differ, via the F ratio = between-group variance / within-group variance.\n\nWhy not many t-tests:\n- Comparing k groups pairwise inflates the false-positive rate. ANOVA gives one omnibus test at the intended α.\n\nKey limitation:\n- A significant F says SOME groups differ, not which. You then need post-hoc pairwise comparisons with correction (Tukey HSD) — and that step is where people quietly reintroduce the multiple-comparisons problem.\n\nAssumptions:\n- Normality of residuals, independence, and equal variances across groups (use Welch\'s ANOVA otherwise).',
  },
  {
    front: 'Mann-Whitney U / Wilcoxon rank-sum',
    back: 'A non-parametric alternative to the two-sample t-test. It works on the RANKS of the pooled data, not the raw values, and tests whether one group tends to produce larger values.\n\nUse it when:\n- Heavy skew, outliers, ordinal data, or small samples where normality is doubtful.\n\nMechanism:\n- Replacing values with ranks caps the influence of any single extreme point — that is where the robustness comes from, and also what it costs you (magnitude information is discarded).\n\nGotcha:\n- It is NOT a test of medians in general — it tests stochastic dominance. With differently shaped distributions a significant result can occur with equal medians. The paired version is the Wilcoxon SIGNED-rank test.',
  },
  {
    front: 'Kolmogorov-Smirnov test',
    back: 'Compares two distributions (or one sample against a theoretical distribution) using the maximum vertical gap between their cumulative distribution curves.\n\nUse in ML:\n- The standard drift detector for a continuous feature — compare the live distribution against the training one.\n\nStrength:\n- Distribution-free, and sensitive to any difference in shape, not just a shift in location.\n\nGotchas:\n- Most sensitive near the CENTRE of the distribution and comparatively blind in the tails — often where drift matters most.\n- With large n it flags statistically significant but practically irrelevant differences. Monitor the KS STATISTIC as an effect size, not its p-value.\n- Continuous data only.',
  },
  {
    front: 'One-tailed vs two-tailed tests',
    back: 'What question you are asking:\n- Two-tailed: is there ANY difference?\n- One-tailed: is it specifically in this pre-chosen direction?\n\nThe trade-off:\n- A one-tailed test at α = 0.05 puts the whole rejection region on one side, so it has more power to detect an effect in that direction — but ZERO ability to detect the opposite.\n\nGotcha:\n- Choosing one-tailed AFTER seeing which way your result went effectively doubles your false-positive rate. The direction must be committed in advance for a substantive reason.\n\nGuidance:\n- Use two-tailed almost always in experimentation. You genuinely do want to know if your change made things worse.',
  },
  {
    front: "Effect size and Cohen's d",
    back: 'Effect size measures the MAGNITUDE of a difference, independently of sample size.\n- Cohen\'s d = (mean₁ − mean₂) / pooled SD — the gap expressed in standard deviations.\n- Rough scale: 0.2 small, 0.5 medium, 0.8 large.\n\nWhy it is essential:\n- A p-value blends effect size with sample size. With n large enough, everything is significant. The effect size tells you whether anyone should care.\n\nOther forms:\n- Cramér\'s V for categorical association, r or R² for variance explained, odds ratio for binary outcomes, absolute lift for business decisions.\n\nInterview answer:\n- Always report an effect size and a confidence interval alongside any p-value.',
  },
  {
    front: 'FWER vs FDR — which should you control?',
    back: 'Two ways to keep multiple testing honest:\n- Family-Wise Error Rate: P(at least one false positive anywhere). Controlled by Bonferroni. Very strict; power collapses as tests multiply.\n- False Discovery Rate: the expected PROPORTION of your rejections that are false. Controlled by Benjamini-Hochberg.\n\nChoosing:\n- Control FWER when a single false positive is costly and you act on each finding individually — a confirmatory experiment, a regulatory claim.\n- Control FDR when you are screening many candidates and will follow up in bulk — feature selection, scanning many segments.\n\nGotcha:\n- Bonferroni on 500 tests makes almost nothing significant, so people quietly drop the correction. FDR is the honest middle ground.',
  },
  {
    front: 'Equivalence and non-inferiority testing',
    back: 'A standard test can never PROVE "no difference" — failing to reject the null is not evidence of equivalence.\n\nEquivalence testing flips the logic:\n- Define a margin δ of practical indifference.\n- Test whether the whole confidence interval for the difference sits INSIDE (−δ, +δ).\n- TOST (two one-sided tests) is the usual implementation.\n\nWhy ML teams need it:\n- "The smaller, cheaper model is no worse than the big one" is an equivalence claim. So is "this refactor did not change behaviour."\n\nGotcha:\n- The margin δ must be chosen on substantive grounds BEFORE the test. Choosing it after seeing the data makes the whole thing meaningless.',
  },
  {
    front: 'Parametric vs non-parametric — the real trade-off',
    back: 'Two families of test:\n- Parametric: assume a distributional form and estimate its parameters.\n- Non-parametric: assume much less, usually working through ranks or resampling.\n\nThe trade-off:\n- If the parametric assumptions hold, those tests have MORE POWER for the same n.\n- If they fail, the parametric error rates are simply wrong.\n\nGuidance:\n- Large n: the CLT makes mean-based parametric tests robust to non-normality — use them.\n- Small n, heavy skew, or extreme outliers: prefer a rank-based test, a permutation test, or a bootstrap.\n\nGotcha:\n- "Non-parametric" does not mean assumption-free — most still require independence and exchangeability.',
  },
  {
    front: 'Statistical vs practical significance',
    back: 'Two unrelated questions:\n- Statistical significance: is the effect probably not zero?\n- Practical significance: is it big enough to act on?\n\nFour outcomes, two of them traps:\n- Significant but trivially small: huge n detecting a 0.01% lift that costs more to ship than it earns.\n- Non-significant but potentially large: an underpowered test with a wide interval that includes both a big win and a big loss. That is "we do not know", not "no effect".\n\nWhat to report:\n- The effect size with a confidence interval, compared against a pre-declared minimum meaningful effect. The decision follows from where the interval sits relative to that threshold.',
  },
]
