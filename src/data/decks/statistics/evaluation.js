// The statistics of evaluating models — metrics and comparing them honestly.

export default [
  {
    front: 'Confusion matrix — the four rates and their denominators',
    back: 'Every classification rate is TP, TN, FP or FN over a chosen denominator — and the denominator is the whole story.\n\n- TPR / recall / sensitivity = TP / (TP + FN): of the ACTUAL positives, how many did we catch?\n- Specificity = TN / (TN + FP): of the actual negatives, how many did we clear?\n- Precision / PPV = TP / (TP + FP): of our POSITIVE PREDICTIONS, how many were right?\n- FPR = FP / (TN + FP) = 1 − specificity.\n\nKey insight:\n- Recall and specificity condition on the TRUTH, so they do not change with prevalence — they are properties of the model.\n- Precision conditions on the PREDICTION, so it moves with prevalence — the same model has lower precision when positives are rarer.',
  },
  {
    front: 'Why does PPV collapse when the base rate is low?',
    back: 'Because the false positives are drawn from a huge negative class.\n\nWorked example (prevalence 0.1%, sensitivity 99%, specificity 99%), per 100,000 people:\n- 100 positives → 99 caught.\n- 99,900 negatives → 999 false positives.\n- PPV = 99 / (99 + 999) ≈ 9%.\n\nSo:\n- A "99% accurate" test is wrong about 91% of the people it flags.\n\nWhy interviewers love it:\n- It separates people who memorised metric formulas from people who understand conditioning. It is Bayes\' rule in applied form.\n\nImplication:\n- On rare-event problems, report precision at your operating threshold. Sensitivity and specificity alone will mislead everyone.',
  },
  {
    front: 'F1, Fβ, and what F1 quietly assumes',
    back: 'F1 is the HARMONIC mean of precision and recall: 2PR / (P + R). Harmonic, not arithmetic, so it is dragged down by the weaker of the two — perfect precision cannot rescue terrible recall.\n\nFβ generalises it:\n- β > 1 weights recall more (fraud, disease screening — misses are costly).\n- β < 1 weights precision more (spam filtering, automated actions — false alarms are costly).\n\nWhat F1 assumes:\n- That precision and recall matter EQUALLY. That is a modelling choice, usually a false one. β should come from the real cost ratio.\n\nGotcha:\n- F1 ignores true negatives entirely, so it is not symmetric under swapping which class you call positive.',
  },
  {
    front: 'Log loss (cross-entropy) as an evaluation metric',
    back: 'The mean of −log(predicted probability of the true class). Unbounded above — one confident wrong prediction can dominate the whole score.\n\nWhat makes it valuable:\n- It is a PROPER SCORING RULE: uniquely minimised by reporting your true beliefs. It rewards calibration, not just correct ranking, so unlike AUC it punishes overconfidence.\n\nGotcha:\n- Because it is unbounded, a handful of confidently wrong cases can swamp it.\n- Predictions of exactly 0 or 1 give infinite loss — hence clipping.\n\nWhen to prefer it:\n- Whenever the probability itself is used downstream (expected-value decisions, bidding, cost-based thresholds). Use AUC when only the ordering matters.',
  },
  {
    front: "Matthews correlation coefficient and Cohen's kappa",
    back: 'Two single-number summaries that stay honest under imbalance:\n- MCC: the correlation between predicted and true labels, in [−1, 1]. Uses all four confusion-matrix cells, so unlike F1 it cannot be inflated by ignoring the negative class. High MCC requires doing well on BOTH classes.\n- Cohen\'s kappa: agreement CORRECTED FOR CHANCE — (observed − expected) / (1 − expected). Originally for inter-rater agreement, also used for classifiers.\n\nWhy chance correction matters:\n- With 95% of one class, a trivial classifier gets 95% raw agreement. Kappa reports roughly 0 — the honest answer.\n\nGotcha:\n- Kappa is hard to compare across different prevalences, so compare it only within one fixed data distribution.',
  },
  {
    front: 'Choosing a decision threshold',
    back: 'The model outputs a probability; the THRESHOLD that turns it into a decision is a separate business choice, and 0.5 is almost never right.\n\nPrincipled approach:\n- Pick the threshold that minimises expected cost. With costs C_FP and C_FN, the optimal threshold is C_FP / (C_FP + C_FN) — independent of the model. If a miss costs 9× a false alarm, threshold at 0.1.\n\nWhen costs are unknown:\n- Fix precision at the level the business tolerates and take whatever recall follows, or fix the alert VOLUME your review team can process.\n\nGotcha:\n- Tune the threshold on a validation set, not the test set, and re-tune after any change in prevalence — the optimal threshold moves with the base rate.',
  },
  {
    front: "McNemar's test — comparing two classifiers properly",
    back: 'Compares two models on the SAME test set, using only the cases where they disagree:\n- b = count where A is right and B wrong.\n- c = count where B is right and A wrong.\n- Statistic ≈ (|b − c| − 1)² / (b + c).\n\nWhy not a two-proportion test on the two accuracies:\n- Those accuracies are computed on the same examples, so they are strongly dependent. Treating them as independent overstates the uncertainty and wastes the pairing.\n\nMechanism:\n- Cases both models get right, or both wrong, carry NO information about which is better, so they are correctly discarded.\n\nUse it when:\n- Choosing between two models on one held-out set.',
  },
  {
    front: 'Comparing models across cross-validation folds',
    back: 'The trap: running a paired t-test on the per-fold scores. Folds SHARE training data, so the scores are correlated and the test\'s independence assumption is violated — it declares significance far too readily.\n\nBetter options:\n- Repeated k-fold with a corrected resampled t-test that accounts for the overlap.\n- The 5×2cv paired t-test.\n- Best of all: a single large held-out set with McNemar or a bootstrap interval.\n\nMore honest still:\n- Report the mean AND spread across folds. If your improvement is smaller than the fold-to-fold noise, you have not shown anything.',
  },
  {
    front: 'Bootstrap confidence intervals for a metric',
    back: 'Resample the TEST SET with replacement, recompute the metric each time, and take percentiles of the resulting distribution.\n\nWhy it is the practical default:\n- AUC, F1, precision@k and NDCG have no simple analytic standard error, and the bootstrap needs none.\n\nWhat it reveals:\n- How much of your "+0.3% AUC" is noise. A 95% interval of [−0.4%, +1.0%] settles the argument.\n\nGotchas:\n- Resample at the INDEPENDENT unit — by user, not by row, when a user contributes many rows. For ranking metrics, resample queries / sessions.\n- It captures only test-set sampling noise, not variance from retraining, so it understates total uncertainty.',
  },
  {
    front: 'Nested cross-validation',
    back: 'Two nested loops: an outer loop estimates generalisation performance, and an inner loop does hyperparameter selection within each outer training fold.\n\nThe problem it solves:\n- Tuning hyperparameters on the same CV folds you report scores from leaks information — you picked the configuration that happened to suit those folds, so the reported score is optimistically biased. With many configurations tried, that bias is large.\n\nCost:\n- k_outer × k_inner model fits — often prohibitive.\n\nPractical alternative:\n- A three-way split: train / validation (for tuning) / test (touched once). Nested CV is mainly worth it when data is scarce enough that a single split is too noisy.',
  },
  {
    front: 'Overfitting the validation set',
    back: 'Every decision guided by validation performance — features, architecture, thresholds, early stopping, which experiment to pursue — leaks a little information from it. After hundreds of such choices, the validation score is an optimistic estimate of true performance.\n\nWhy it is invisible:\n- No single step feels like cheating, and there is no error message. It is the multiple-comparisons problem applied to model development.\n\nSymptom:\n- A persistent gap where the test or production metric is consistently worse than validation, and the gap widens the longer a project runs.\n\nDefences:\n- Keep a test set genuinely untouched until the end, refresh the validation data periodically, and be suspicious of tiny gains accumulated over many iterations.',
  },
]
