// The statistics of evaluating models — metrics and comparing them honestly.

export default [
  {
    front: 'Confusion matrix — the four rates and their denominators',
    back: 'The whole thing turns on which denominator each rate uses.\n\nTPR / recall / sensitivity = TP/(TP+FN) — of the ACTUAL positives, how many did we catch? Specificity = TN/(TN+FP) — of the actual negatives, how many did we clear? Precision / PPV = TP/(TP+FP) — of our POSITIVE PREDICTIONS, how many were right? FPR = FP/(TN+FP) = 1 − specificity.\n\nThe key insight: recall and specificity condition on the TRUTH, so they are properties of the model that do not change with prevalence. Precision conditions on the PREDICTION, so it moves with prevalence — the same model has lower precision on rarer positives.',
  },
  {
    front: 'Why does PPV collapse when the base rate is low?',
    back: 'Because false positives are drawn from the huge negative class.\n\nWorked example: prevalence 0.1%, sensitivity 99%, specificity 99%. Per 100,000: 100 positives → 99 caught. 99,900 negatives → 999 false positives. PPV = 99/1098 ≈ 9%.\n\nSo a "99% accurate" test is wrong about 91% of the people it flags.\n\nWhy interviewers love it: it separates people who memorised metric formulas from people who understand conditioning. It is Bayes\' rule in applied form.\n\nImplication for ML: on rare-event problems, report precision at your operating threshold — sensitivity and specificity alone will mislead every stakeholder in the room.',
  },
  {
    front: 'F1, Fβ, and what F1 quietly assumes',
    back: 'F1 is the HARMONIC mean of precision and recall: 2PR/(P+R). Harmonic, not arithmetic, so it is dominated by the weaker of the two — you cannot compensate for terrible recall with perfect precision.\n\nFβ generalises it: β>1 weights recall more (fraud, disease screening — misses are costly); β<1 weights precision more (spam filtering, automated actions — false alarms are costly).\n\nWhat F1 assumes: that precision and recall matter EQUALLY. That is a real modelling choice, and usually a false one. β should come from the actual cost ratio.\n\nGotcha: F1 ignores true negatives entirely, so it is not symmetric under swapping which class you call positive.',
  },
  {
    front: 'Log loss (cross-entropy) as an evaluation metric',
    back: 'Mean of −log(predicted probability of the true class). Unbounded above: one confident wrong prediction can dominate the whole score.\n\nWhat makes it valuable: it is a PROPER SCORING RULE — uniquely minimised by reporting your true beliefs. It rewards calibration, not just correct ranking, so unlike AUC it punishes overconfidence.\n\nGotcha: because it is unbounded, it is very sensitive to a handful of confidently wrong cases, and predictions of exactly 0 or 1 give infinite loss — hence clipping.\n\nWhen to prefer it: whenever the probability itself is consumed downstream (expected-value decisions, bidding, thresholding on cost). Use AUC when only the ordering matters.',
  },
  {
    front: "Matthews correlation coefficient and Cohen's kappa",
    back: 'MCC: correlation between predicted and true labels, in [−1,1]. It uses all four confusion-matrix cells, so unlike F1 it cannot be inflated by ignoring the negative class. High MCC requires doing well on both classes, which makes it a strong single summary under imbalance.\n\nCohen\'s kappa: agreement CORRECTED FOR CHANCE — (observed − expected)/(1 − expected). Originally for inter-rater agreement, also used for classifiers.\n\nWhy chance correction matters: with 95% of one class, a trivial classifier gets 95% raw agreement. Kappa reports roughly 0, which is the honest answer.\n\nGotcha: kappa is hard to interpret across different prevalences, so compare it only within a fixed data distribution.',
  },
  {
    front: 'Choosing a decision threshold',
    back: 'The model outputs a probability; the THRESHOLD is a separate business decision, and 0.5 is almost never the right one.\n\nPrincipled approach: pick the threshold minimising expected cost. With cost C_FP and C_FN, the optimal threshold is C_FP/(C_FP + C_FN) — independent of the model. If a miss costs 9× a false alarm, threshold at 0.1.\n\nAlternatives when costs are unknown: fix precision at the level the business can tolerate and take whatever recall follows, or fix the alert VOLUME your review team can actually process.\n\nGotcha: tune the threshold on a validation set, not the test set, and re-tune after any change in prevalence — the optimal threshold moves with the base rate.',
  },
  {
    front: "McNemar's test — comparing two classifiers properly",
    back: 'Compares two models on the SAME test set using only the cases where they disagree: the counts where A is right and B wrong (b) versus B right and A wrong (c). Statistic ≈ (|b−c|−1)²/(b+c).\n\nWhy not a two-proportion test on the accuracies: those two accuracies are computed on the same examples, so they are strongly dependent. Treating them as independent samples overstates the uncertainty and wastes the pairing.\n\nUnder the hood: cases both models get right or both get wrong carry NO information about which is better, so they are correctly discarded.\n\nUse when: choosing between two models on one held-out set — the standard "is this improvement real?" question.',
  },
  {
    front: 'Comparing models across cross-validation folds',
    back: 'The trap: running a paired t-test on per-fold scores. Folds SHARE TRAINING DATA, so the scores are correlated and the test\'s independence assumption is violated — it reports significance far too readily.\n\nBetter options: repeated k-fold with a corrected resampled t-test that accounts for the overlap; the 5×2cv paired t-test; or, best of all, a single large held-out set with McNemar or a bootstrap interval.\n\nMore honest still: report the mean AND spread across folds and ask whether the difference exceeds the fold-to-fold noise. If your improvement is smaller than the variation between folds, you have not shown anything.',
  },
  {
    front: 'Bootstrap confidence intervals for a metric',
    back: 'Resample the TEST SET with replacement, recompute the metric each time, and take percentiles of the resulting distribution.\n\nWhy it is the practical default: AUC, F1, precision at k and NDCG have no simple analytic standard error, and the bootstrap needs none.\n\nWhat it reveals: how much of your "+0.3% AUC" is noise. A 95% interval of [−0.4%, +1.0%] settles the argument.\n\nGotchas: resample at the INDEPENDENT unit — by user, not by row, when a user contributes many rows. For ranking metrics, resample queries/sessions. And it captures only test-set sampling variability, not variance from retraining, so it understates total uncertainty.',
  },
  {
    front: 'Nested cross-validation',
    back: 'An outer loop estimates generalisation performance; an inner loop does hyperparameter selection within each outer training fold.\n\nThe problem it solves: tuning hyperparameters on the same CV folds you report scores from leaks information — you selected the configuration that happened to suit those folds, so the reported score is optimistically biased. With many configurations tried, that bias is substantial.\n\nCost: k_outer × k_inner model fits, which is often prohibitive.\n\nPractical alternative: a three-way split — train / validation (for tuning) / test (touched once). Nested CV is mainly worth it when data is scarce enough that a single split is too noisy.',
  },
  {
    front: 'Overfitting the validation set',
    back: 'Every decision informed by validation performance — features, architecture, thresholds, early stopping, which experiment to pursue — leaks a little information from it. After hundreds of such choices, validation score is an optimistic estimate of generalisation.\n\nWhy it is invisible: no single step feels like cheating, and there is no error message. It is the multiple-comparisons problem applied to model development.\n\nSymptom: a persistent gap where the test or production metric is consistently worse than validation, and the gap widens the longer a project runs.\n\nDefences: hold a test set genuinely untouched until the end, refresh validation data periodically, and be suspicious of tiny improvements accumulated over many iterations.',
  },
]
