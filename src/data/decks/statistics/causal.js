// Causal inference — increasingly the core of senior ML/DS interviews.

export default [
  {
    front: 'Potential outcomes framework',
    back: 'Each unit has two potential outcomes: Y(1) if treated and Y(0) if not. The causal effect for that unit is Y(1) − Y(0).\n\nThe fundamental problem of causal inference:\n- You only ever OBSERVE one of them. The other is counterfactual and permanently missing, so an individual causal effect can never be measured directly.\n\nConsequence:\n- All causal inference is about estimating AVERAGE effects by finding a credible stand-in for the missing outcome — a comparable control group.\n\nWhy this framing helps:\n- It reframes a causal question as a missing-data problem, which forces the assumptions you need to be explicit.',
  },
  {
    front: 'ATE, ATT, and CATE',
    back: 'Three treatment effects at different scopes:\n- ATE — Average Treatment Effect over the whole population: E[Y(1) − Y(0)].\n- ATT — the effect among those actually TREATED.\n- CATE — the effect conditional on covariates X, i.e. for a specific subgroup.\n\nWhy they differ:\n- If treatment was not randomly assigned, the treated group is not representative. A voluntary feature\'s ATT (effect on people who chose it) can be large while its ATE (effect if forced on everyone) is near zero.\n\nWhich you want:\n- ATE for "should we ship to everyone?"\n- ATT for "did this campaign work on those we targeted?"\n- CATE for personalisation and targeting — CATE estimation is what uplift modelling does.',
  },
  {
    front: 'Why does randomisation actually work?',
    back: 'Random assignment makes treatment INDEPENDENT of every pre-treatment variable — observed and unobserved alike.\n\nMechanism:\n- That independence makes the control group a valid estimate of what would have happened to the treated group. It closes every back-door path at once, so no covariate adjustment is needed for an unbiased estimate.\n\nThe key advantage over any observational method:\n- It handles CONFOUNDERS YOU DID NOT THINK OF. Propensity matching can only balance what you measured.\n\nGotcha:\n- Randomisation guarantees balance in EXPECTATION, not in your particular sample. Small experiments can still be visibly imbalanced — check, and stratify if it matters.',
  },
  {
    front: 'SUTVA — the assumption everyone forgets',
    back: 'Stable Unit Treatment Value Assumption, two parts:\n- No interference: one unit\'s treatment does not affect another unit\'s outcome.\n- Consistency: there is only one version of the treatment.\n\nWhere it breaks in tech:\n- Social networks (your treated friend changes your behaviour).\n- Marketplaces (treated buyers consume supply the control group needed).\n- Anything with shared resources or shared caches.\n\nConsequence:\n- When SUTVA fails, even a perfectly randomised A/B test is biased — the control group has been contaminated by the treatment.\n\nFix:\n- Randomise at a higher level: cluster / graph-based randomisation, or geographic or time-based splits.',
  },
  {
    front: 'DAGs and the back-door criterion',
    back: 'A DAG (directed acyclic graph) draws variables as nodes and causal arrows as edges. A "back-door path" from X to Y is a non-causal path connecting them that creates spurious association.\n\nBack-door criterion:\n- To identify the causal effect of X on Y, condition on a set of variables that blocks every back-door path WITHOUT including any descendant of X.\n\nWhy this beats intuition:\n- It tells you exactly which variables to control for — and, crucially, which you must NOT. "Control for everything available" is wrong.\n\nThe three building blocks:\n- Chain X→Z→Y: conditioning on Z blocks it.\n- Fork X←Z→Y: Z is a confounder — condition on it.\n- Collider X→Z←Y: do NOT condition on Z.',
  },
  {
    front: 'Collider bias',
    back: 'A collider is a variable that is a common EFFECT of two others (X→Z←Y). Conditioning on it creates an association between X and Y that does not exist in the full population.\n\nIntuition:\n- Among people admitted to hospital, being young and being severely ill become negatively correlated — because you generally need one or the other to be admitted at all.\n\nWhy it is the most dangerous causal error:\n- Adding a control variable can CREATE bias where there was none. This is the formal reason "control for more covariates" is not automatically safer.\n\nML relevance:\n- Selecting your training set on a variable that is downstream of both features and label induces exactly this — the model learns a relationship that vanishes in production.',
  },
  {
    front: "Berkson's paradox",
    back: 'A spurious NEGATIVE association that appears because the sample was selected on a variable both inputs influence — collider bias disguised as a sampling rule.\n\nClassic example:\n- At a selective university, SAT score and GPA look negatively correlated, because admission required a high combination of the two. Anyone low on both was never admitted.\n\nTech example:\n- Among users who converted, ad exposure and organic intent look like substitutes, because either alone was enough to convert.\n\nWhy it matters:\n- It can make genuinely positive relationships look negative inside a selected sample. Always ask what filter produced this dataset before interpreting a correlation within it.',
  },
  {
    front: 'Propensity score matching',
    back: 'Model P(treated | covariates), then compare treated and control units that have similar propensity scores.\n\nMechanism:\n- It collapses many covariates into one number, which makes matching feasible in high dimensions. Balancing on the score balances the covariates that went into it.\n\nThe assumption that decides everything:\n- NO UNMEASURED CONFOUNDERS. It only balances what you measured; unobserved selection stays fully intact.\n\nChecks:\n- Assess covariate balance after matching (standardised mean differences).\n- Verify overlap — units with no comparable counterpart must be dropped, which narrows your estimand from ATE to something local.',
  },
  {
    front: 'Difference-in-differences',
    back: 'Compare the CHANGE in a treated group to the change in an untreated group over the same period:\n- (After − Before)_treated  −  (After − Before)_control.\n\nWhy it helps:\n- Differencing removes any time-invariant confounder, even unobserved ones. The control group removes any common time trend.\n\nThe critical assumption — PARALLEL TRENDS:\n- Absent treatment, both groups would have moved the same way. Untestable for the treatment period, but you can check it in pre-period data (an "event study" plot).\n\nGotchas:\n- Fails if treatment timing correlates with a differential shock.\n- With staggered adoption across many units, the standard two-way fixed-effects estimator is biased — use a modern staggered-DiD estimator.',
  },
  {
    front: 'Regression discontinuity',
    back: 'When treatment is assigned by a THRESHOLD on a continuous score, units just above and just below the cutoff are nearly identical apart from treatment. Compare them.\n\nWhy it is compelling:\n- Near the cutoff, assignment is effectively random, so you get a local experiment without running one.\n\nExamples:\n- A credit-score cutoff for loan approval, a spend threshold that unlocks a loyalty tier, a rank cutoff for being featured.\n\nGotchas:\n- The estimate is LOCAL to the cutoff and may not generalise elsewhere.\n- Check for manipulation — bunching just above the threshold means people are gaming it, which breaks the design.\n- Verify no other policy uses the same cutoff.',
  },
  {
    front: 'Instrumental variables',
    back: 'An instrument Z affects the treatment X but influences the outcome Y ONLY through X. Use the part of X\'s variation that is driven by Z to estimate the causal effect, sidestepping confounding.\n\nThree requirements:\n- Relevance: Z genuinely moves X.\n- Exclusion: Z has no direct path to Y.\n- Independence: Z is itself unconfounded.\n\nClassic tech instrument:\n- A randomised NUDGE. If you randomise who is prompted to try a feature, the prompt is an instrument for actually using it — this recovers the effect of usage despite self-selection.\n\nGotchas:\n- A WEAK instrument gives wildly unstable estimates and amplifies any small violation of exclusion.\n- Exclusion is untestable and is where most IV analyses fail.',
  },
  {
    front: 'Intention-to-treat vs per-protocol',
    back: 'Two ways to analyse an experiment with imperfect compliance:\n- ITT: analyse everyone by the group they were ASSIGNED to, regardless of whether they complied.\n- Per-protocol: analyse only those who actually complied.\n\nWhy ITT is the default:\n- Assignment was randomised; compliance was not. Filtering to compliers reintroduces selection bias, because compliers differ systematically from non-compliers.\n\nThe trade-off:\n- ITT answers "what happens if we launch this?" (the real business question) but DILUTES the effect toward zero when compliance is low.\n- Per-protocol estimates the effect of the treatment itself — but with confounding back in.\n\nBest of both:\n- Report ITT as the headline, and use an IV / CACE analysis to estimate the effect among compliers without the selection bias.',
  },
  {
    front: 'Heterogeneous treatment effects (and uplift modelling)',
    back: 'The average effect can be near zero while hiding a large positive effect in one segment and a negative one in another.\n\nWhy it matters commercially:\n- Shipping to everyone leaves value on the table if you could target. Uplift / CATE models predict the INDIVIDUAL treatment effect rather than the outcome, so you treat only those who respond.\n\nMethods:\n- Causal forests, T / S / X-learners, and direct uplift trees that split on the difference in effect.\n\nThe hard part:\n- You never observe an individual\'s treatment effect, so there is no ground-truth label. Evaluation uses Qini / uplift curves on held-out randomised data.\n\nGotcha:\n- Hunting for subgroups post hoc until one is significant is p-hacking. Pre-specify, or correct for multiplicity.',
  },
]
