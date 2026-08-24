// Causal inference — increasingly the core of senior ML/DS interviews.

export default [
  {
    front: 'Potential outcomes framework',
    back: 'Each unit has two potential outcomes: Y(1) if treated and Y(0) if not. The causal effect for that unit is Y(1) − Y(0).\n\nThe fundamental problem of causal inference: you only ever OBSERVE one of them. The other is counterfactual and permanently missing, so an individual causal effect is never directly measurable.\n\nConsequence: all causal inference is about estimating AVERAGE effects by finding a credible stand-in for the missing outcome — a comparable control group.\n\nWhy this framing helps: it reframes causal questions as a missing-data problem, which makes the assumptions you need explicit rather than implicit.',
  },
  {
    front: 'ATE, ATT, and CATE',
    back: 'ATE — Average Treatment Effect over the whole population: E[Y(1) − Y(0)]. ATT — the effect among those actually TREATED. CATE — the effect conditional on covariates X, i.e. the effect for a specific subgroup.\n\nWhy they differ: if treatment was not randomly assigned, the treated group is not representative. A voluntary feature\'s ATT (effect on people who chose it) can be large while the ATE (effect if forced on everyone) is near zero.\n\nWhich you want: ATE for "should we ship to everyone?", ATT for "did this campaign work on those we targeted?", CATE for personalisation and targeting — CATE estimation is what uplift modelling does.',
  },
  {
    front: 'Why does randomisation actually work?',
    back: 'Random assignment makes treatment INDEPENDENT of every pre-treatment variable — observed and unobserved alike.\n\nUnder the hood: that independence means the control group is a valid estimate of what would have happened to the treated group. It closes every back-door path at once, which is why no covariate adjustment is required for an unbiased estimate.\n\nThe key advantage over any observational method: it handles CONFOUNDERS YOU DID NOT THINK OF. Propensity matching can only balance what you measured.\n\nGotcha: randomisation guarantees balance in EXPECTATION, not in your particular sample. Small experiments can still be visibly imbalanced — check, and stratify if it matters.',
  },
  {
    front: 'SUTVA — the assumption everyone forgets',
    back: 'Stable Unit Treatment Value Assumption, two parts: (1) NO INTERFERENCE — one unit\'s treatment does not affect another unit\'s outcome; (2) consistency — there is only one version of the treatment.\n\nWhere it breaks in tech: social networks (your treated friend changes your behaviour), marketplaces (treated buyers consume supply the control group needed), and anything with shared resources or shared caches.\n\nConsequence: when SUTVA fails, even a perfectly randomised A/B test is biased — the control group has been contaminated by the treatment.\n\nFix: randomise at a higher level — cluster/graph-based randomisation, or geographic or time-based splits.',
  },
  {
    front: 'DAGs and the back-door criterion',
    back: 'Draw variables as nodes and causal arrows as edges. A "back-door path" from X to Y is a non-causal path that creates spurious association.\n\nBack-door criterion: to identify the causal effect of X on Y, condition on a set of variables that blocks every back-door path WITHOUT including any descendant of X.\n\nWhy this beats intuition: it tells you precisely which variables to control for — and, crucially, which you must NOT. "Control for everything available" is wrong and can introduce bias.\n\nThe three structures: chain (X→Z→Y, conditioning on Z blocks it), fork (X←Z→Y, confounder, condition on it), collider (X→Z←Y, do NOT condition).',
  },
  {
    front: 'Collider bias',
    back: 'A collider is a common EFFECT of two variables (X→Z←Y). Conditioning on it creates an association between X and Y that does not exist in the population.\n\nIntuition: among people admitted to hospital, being young and being severely ill become negatively correlated — because you generally need one or the other to be admitted at all.\n\nWhy this is the most dangerous causal error: it means adding a control variable can CREATE bias where there was none. It is the formal reason "control for more covariates" is not automatically safer.\n\nML relevance: selecting your training set on a variable downstream of both features and label induces exactly this — the model learns a relationship that vanishes in production.',
  },
  {
    front: "Berkson's paradox",
    back: 'A spurious NEGATIVE association arising from selection on a variable that both causes influence — collider bias in the guise of a sampling rule.\n\nClassic example: at a selective university, SAT score and GPA appear negatively correlated, because admission required a high combination of the two. Anyone low on both was never admitted.\n\nTech example: among users who converted, ad exposure and organic intent look substitutable, because either alone was enough to convert.\n\nWhy it matters: it makes genuinely positive relationships look negative inside a selected sample. Always ask what filter produced this dataset before interpreting a correlation within it.',
  },
  {
    front: 'Propensity score matching',
    back: 'Model P(treated | covariates), then compare treated and control units with similar propensity scores.\n\nUnder the hood: it collapses many covariates into one dimension, which makes matching feasible in high dimensions. Balancing on the score balances the covariates that went into it.\n\nThe assumption that decides everything: NO UNMEASURED CONFOUNDERS. It only balances what you measured, so unobserved selection remains fully intact.\n\nChecks: assess covariate balance after matching (standardised mean differences), and verify overlap — units with no comparable counterpart must be dropped, which changes your estimand from ATE to something narrower.',
  },
  {
    front: 'Difference-in-differences',
    back: 'Compare the CHANGE in a treated group to the change in an untreated group: (After−Before)_treated − (After−Before)_control.\n\nWhy it helps: differencing removes any time-invariant confounder, even unobserved ones, and the control group removes any common time trend.\n\nThe critical assumption — PARALLEL TRENDS: absent treatment, both groups would have moved the same way. This is untestable for the treatment period, but you can look for it in pre-period data (an "event study" plot).\n\nGotchas: fails if treatment timing correlates with a differential shock; and with staggered adoption across many units, the standard two-way fixed-effects estimator is biased — use a modern staggered DiD estimator.',
  },
  {
    front: 'Regression discontinuity',
    back: 'When treatment is assigned by a THRESHOLD on a continuous variable, units just above and just below the cutoff are nearly identical apart from treatment. Compare them.\n\nWhy it is compelling: near the cutoff, assignment is effectively random, so it approximates a local experiment without one.\n\nExamples: a credit score cutoff for loan approval, a spend threshold that unlocks a loyalty tier, a rank cutoff for being featured.\n\nGotchas: the estimate is LOCAL to the cutoff and may not generalise elsewhere. Check for manipulation — bunching just above the threshold means people are gaming it, which breaks the design. Also verify no other policy uses the same cutoff.',
  },
  {
    front: 'Instrumental variables',
    back: 'An instrument Z affects treatment X but influences the outcome Y ONLY through X. Use the variation in X driven by Z to estimate the causal effect, bypassing confounding.\n\nThree requirements: relevance (Z genuinely moves X), exclusion (Z has no direct path to Y), and independence (Z is unconfounded).\n\nClassic tech instrument: a randomised NUDGE. If you randomise who is prompted to try a feature, the prompt is an instrument for actually using it — this recovers the effect of usage despite self-selection.\n\nGotchas: a WEAK instrument gives wildly unstable estimates and amplifies any small violation of exclusion. Exclusion is untestable and is where most IV analyses fail.',
  },
  {
    front: 'Intention-to-treat vs per-protocol',
    back: 'ITT: analyse everyone by the group they were ASSIGNED to, regardless of whether they complied. Per-protocol: analyse only those who actually complied.\n\nWhy ITT is the default: assignment was randomised, compliance was not. Filtering to compliers reintroduces selection bias, because compliers differ systematically from non-compliers.\n\nThe trade-off: ITT answers "what happens if we launch this?" (the real business question) but DILUTES the effect toward zero when compliance is low. Per-protocol estimates the effect of the treatment itself — but with confounding back in.\n\nBest of both: use ITT as the headline, and an IV/CACE analysis to estimate the effect among compliers without the selection bias.',
  },
  {
    front: 'Heterogeneous treatment effects (and uplift modelling)',
    back: 'The average effect can be near zero while hiding a large positive effect in one segment and a negative one in another.\n\nWhy it matters commercially: shipping to everyone leaves value on the table if you could target. Uplift/CATE models predict the INDIVIDUAL treatment effect rather than the outcome, so you treat only those who respond.\n\nMethods: causal forests, T/S/X-learners, and direct uplift trees splitting on effect difference.\n\nThe hard part: you never observe an individual\'s treatment effect, so there is no ground-truth label to validate against. Evaluation uses Qini/uplift curves on held-out randomised data.\n\nGotcha: hunting subgroups post hoc until one is significant is p-hacking. Pre-specify, or correct for multiplicity.',
  },
]
