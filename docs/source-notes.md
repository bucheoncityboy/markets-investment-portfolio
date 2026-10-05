# Portfolio source notes

Sources checked for this revision on 2026-10-05. Links below pin the reviewed repository versions. The page distinguishes research calculations, implementation evidence, and the author's reported operational records; these are different kinds of evidence.

## BOK and KRW rates

- Primary artifact: [KRW Rates Integrated Research Portfolio](https://github.com/bucheoncityboy/krw-rates-integrated-research/blob/a16cabc90bf229e6a8e32002e228f42fc4e80f89/KRW_Rates_Integrated_Research_Portfolio.pptx), slides 4, 7, and 12–14.
- The reviewed final artifact supports **36 MPC events**, **1,084 common observation dates**, **D-1 / D+1 / D+5** event windows, **19 D+1 curve-widening observations**, and **21 observations with a larger absolute 3Y move than 10Y**. The brief's provisional 38 / 1,151 / 20 / 23 figures were not used.
- The policy-type split is **8 hikes / 24 holds / 4 cuts**. The plotted responses show both steepening and flattening across all three policy types; decision type alone does not consistently determine curve direction.
- The Equal-DV01 position is an illustrative cash-bond calculation using notional amounts and assumed durations. It is not measured futures DV01, a KRX futures execution test, or an achieved trading return. Transaction costs, basis, carry/roll, funding, and residual risks form an execution review framework.

## US systematic investing and account execution

- Reviewed source version: [`us-robust-live-ops` at f0bcd3e7033abd1307c02c3c182ac5d86d1468d8](https://github.com/bucheoncityboy/us-robust-live-ops/tree/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8).
- [Validation documentation](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/results/fixed_strategy_validation/README.md) and [walk-forward documentation](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/results/walk_forward_validation/README.md) describe fixed-strategy validation, chronological folds, out-of-sample testing, costs, and robustness checks. The page retains five-fold validation and a 10bp round-trip cost assumption without promoting a backtest return as investment performance.
- [Policy configuration](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/ops/ops_us_policy.py#L20-L39) and [monthly account/target comparison](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/ops/ops_monthly_run.py#L978-L991) support the signal-to-target-weight and rebalance workflow.
- The frozen policy config records a **150-stock** top-N universe, **60 / 20 / 20%** Leader / Mom63 / LowVol sleeve weights, a **15%** single-name cap, and a **40% best-effort** sector cap. The page summarizes Leader as core momentum and Mom63 as intermediate momentum.
- [Order and fill handling](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/ops/ops_execute.py#L356-L406), [account/ledger integration](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/ops/ops_execute.py#L117-L150), and [Excel reconciliation](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/ops/ops_excel_write.py#L405-L504) show implemented execution and reconciliation paths.
- **29 buy and 29 sell fills** are the author's order-route test record, already published in the [base portfolio](https://github.com/bucheoncityboy/investment-portfolio/blob/ea69fe0ef761613e82713231147802748680a606/index.html#L149-L155). Raw operational outputs are [excluded from version control](https://github.com/bucheoncityboy/us-robust-live-ops/blob/f0bcd3e7033abd1307c02c3c182ac5d86d1468d8/.gitignore#L21-L27). Public code supports the workflow but does not independently prove these fill counts. The page states that the counts are order-path testing, not long-term investment performance.

## Global markets and Morning Briefing

- Reviewed source version: [`multi-asset-morning-briefing` at 4957d4e28abf15446ea0f549cd969a31c80b7f25](https://github.com/bucheoncityboy/multi-asset-morning-briefing/tree/4957d4e28abf15446ea0f549cd969a31c80b7f25).
- [Market data sources](https://github.com/bucheoncityboy/multi-asset-morning-briefing/blob/4957d4e28abf15446ea0f549cd969a31c80b7f25/scripts/market_data.py#L33-L47) and [data/date processing](https://github.com/bucheoncityboy/multi-asset-morning-briefing/blob/4957d4e28abf15446ea0f549cd969a31c80b7f25/scripts/market_data.py#L718-L866) support the official-source and trading-date checks.
- The **approximately 40 minutes to under 10 minutes** preparation-time improvement is the author's personal briefing workflow record, not an independently timed benchmark. It is labeled self-reported on the page.
- Feature adoption is supported by [K-Skill PR #675](https://github.com/NomaDamas/k-skill/pull/675), its [main release PR #677](https://github.com/NomaDamas/k-skill/pull/677), and the [released official feature documentation](https://github.com/NomaDamas/k-skill/blob/d1b9952d05ba10b18c6747a071d5910bd17b0b3e/docs/features/multi-asset-morning-briefing.md). “Official contributor” describes the accepted open-source contribution; it is not an appointed employment role.
- The global-IB research vignette's sector-quarter counts and **12.5%** production figure are reproduced from the author's supplied summary of a member-shared report. That report was not present in the repository or publicly linked, so those figures were not independently checked against the report itself.

## Dynamic FX hedging and risk

- Reviewed source version: [`Dynamic-Shield-K-ICS-AI` at e656e3427a81d9852d29e87f23db55831cfa820a](https://github.com/bucheoncityboy/Dynamic-Shield-K-ICS-AI/tree/e656e3427a81d9852d29e87f23db55831cfa820a).
- The [risk-paradox calculation](https://github.com/bucheoncityboy/Dynamic-Shield-K-ICS-AI/blob/e656e3427a81d9852d29e87f23db55831cfa820a/src/validation/proof_risk_paradox.py#L25-L50) produces a maximum **10.3759%**, rounded to **10.38%**, model-implied SCR decrease against a 100% fixed-hedge baseline. The cited scenario assumes asset/FX correlation **ρ = -0.6** and uses **h = 0** at the maximum.
- This is a calculation under internal-model assumptions. It is not an observed hedge-cost saving, realized return, or a dated PPO backtest result. HMM and PPO are described as tools within the research prototype; the percentage is not attributed to live use of those models.

The revision reviewed the cited public artifacts and code. It did not rerun every project's historical data pipeline or gain access to private account records.
