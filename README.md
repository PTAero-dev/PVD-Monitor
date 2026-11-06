# AEROTHAI PVD Monitor — Portfolio & Wealth Intelligence

An executive web application for monitoring, analyzing, and projecting the **AEROTHAI Registered Provident Fund** (`กองทุนสำรองเลี้ยงชีพ พนักงานบริษัท วิทยุการบินแห่งประเทศไทย จำกัด ซึ่งจดทะเบียนแล้ว`) across **PC, Tablet, and Mobile**.

## Key Capabilities

1. **Executive Overview Dashboard**:
   - Real-time KPI tracking of **Total Balance** (`฿3,227,151.61` as of `Q3/2026`), **Member Portion** (`฿1,700,462.99`), **AEROTHAI Portion** (`฿1,526,688.62`), **Cumulative Principal** (`฿2,854,897.50`), **Cumulative Net Profit** (`+฿372,254.11`), and **YTD `i-Return`** (`+7.91%`).
   - Interactive Portfolio Wealth & Principal Trajectory (`Quarterly` & `Yearly` views, `Total vs Principal` and `Stacked Member / AEROTHAI / Profit` modes).
   - Single-Quarter Cashflow vs. Market Gain/Loss Decomposition & Multi-Metric Return Analysis (`YTD i-Return %`, `Single-Quarter Modified Dietz Return %`, `YoY Balance Growth %`).

2. **Sub-Fund Policies & Co-Manager Battle (`UOBAM` vs `TISCO`)**:
   - Tracks all 6 AEROTHAI sub-funds across all 27 quarters (`2020 Q1` – `2026 Q3`):
     - **Fixed Income (`ตราสารหนี้`)**: `AERO1-UOB` & `AERO1-TIS`
     - **Mixed Policy (`ผสม`)**: `AERO2-UOB` & `AERO2-TIS`
     - **Foreign Equity (`ตราสารทุนต่างประเทศ`)**: `AERO3-UOB` & `AERO3-TIS`
   - Head-to-head UOBAM vs. TISCO performance comparison, NAV trajectory chart (Normalized Base-100 & Actual NAV in Baht), and Target vs. Actual Allocation Drift & Rebalance Calculator.

3. **Official Digital Statement Inspector**:
   - Digital replica of the UOBAM × TISCO Individual Statement of Provident Fund Account for any of the 27 quarters (`2020 Q1` through `2026 Q3`), including isolated single-quarter cashflows and annual Thai Revenue Code tax-deductible summary.

4. **Retirement Wealth Cone & Thai PVD Tax Shield Simulator**:
   - Interactive compound wealth projection to retirement (Base, Optimistic, Conservative, and Principal-Only trajectories), Milestone Crossing Calculator (`฿5M`, `฿10M`, `฿15M`, `฿20M`), 4% SWR / 20-Year Monthly Retirement Pension estimator, and Marginal Tax Bracket Rebate + AEROTHAI 100% Match analyzer.

5. **Cloud Sync & Export/Import Hub**:
   - Powered by **Firebase Cloud Firestore** (`pvd-monitor-aero`) with automatic offline caching and multi-sheet Excel (`.xlsx`) & PDF export.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite 7, Recharts, Lucide Icons
- **Database**: Firebase Cloud Firestore (`pvd-monitor-aero`, `asia-southeast1`)
- **Deployment**: Cloudflare Pages
