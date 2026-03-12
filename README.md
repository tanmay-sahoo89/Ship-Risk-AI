# Ship Risk AI

## 1. Project Overview

Ship Risk AI is a comprehensive, full-stack platform for predictive risk management in maritime logistics. It leverages advanced machine learning, robust data engineering, and a modern web dashboard to analyze shipment data, score risks, generate actionable recommendations, and provide real-time analytics. The system is designed for extensibility, automation, transparency, and operational insight.

---

## 2. Tech Stack

- **Backend:** Python 3.x, Pandas, NumPy, scikit-learn, FastAPI (REST API), Firebase Admin SDK
- **ML Models:**
  - `LogisticRegression` (scikit-learn)
  - `RandomForestClassifier` (scikit-learn)
  - `GradientBoostingClassifier` (scikit-learn)
  - `ExtraTreesClassifier` (scikit-learn)
- **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS, Recharts, Firebase JS SDK
- **DevOps:** Firebase Hosting, Firestore, GitHub Actions (optional)
- **Data Storage:** Firestore (NoSQL, real-time sync), CSV artifacts

---

## 3. Data & ML Pipeline

![Ship Risk AI - Data & ML Pipeline](docs/ship-risk-ai-data-ml-pipeline.png)

---

## 4. Architecture Overview

![Ship Risk AI - Architecture Overview](docs/ship-risk-ai-architecture-overview.png)

---

## 5. Data Pipeline (Detailed)

### a. Data Generation (`data_generator.py`)

- **Randomized Synthetic Data:**
  - Generates realistic shipment records with fields: `shipment_id`, `carrier`, `origin`, `destination`, `transport_mode`, `shipment_status`, `weather_condition`, `disruption_type`, `package_weight_kg`, `days_in_transit`, `planned_transit_days`, etc.
  - Uses dictionaries for carrier reliability, weather severity, disruption impact, and route risk.
- **Labeling Heuristic:**
  - `is_delayed` is assigned using a deterministic function:
    - Weighted sum of: `weather_severity_score`, `traffic_congestion_level`, `carrier_reliability_score`, `disruption_impact_score`, `route_risk_score`, `historical_delay_rate`, `port_congestion_score`, and random noise.
  - Ensures a realistic, imbalanced dataset for binary classification.

### b. Feature Engineering (`feature_engineering.py`)

- **Cleaning:**
  - Drops duplicate shipments by `shipment_id`.
  - Clamps numeric features to valid ranges (e.g., scores between 0–10, rates between 0–1).
  - Fills missing values: categoricals with 'Unknown', numerics with median.
- **Feature Creation:**
  - `transit_progress_ratio`: `days_in_transit` / `planned_transit_days` (clipped, handles division by zero)
  - `composite_risk_score`: Weighted sum of risk signals (weather, traffic, disruption, port congestion, carrier reliability, historical delay, route risk, customs clearance flag)
  - `log_weight`: Log-transformed package weight to reduce outlier influence
  - `sla_pressure`: Days left to meet planned ETA (clipped)
- **Encoding:**
  - Label encodes all categorical columns: `carrier`, `transport_mode`, `origin`, `destination`, `shipment_status`, `weather_condition`, `disruption_type`
- **Scaling:**
  - MinMaxScaler applied to all numeric features for model compatibility
- **Splitting:**
  - Stratified train/validation/test split (70/15/15) using `train_test_split` from scikit-learn
- **Artifacts:**
  - Saves encoders, scaler, and feature columns for reproducibility (`artifacts/`)
  - Saves processed data as CSV for transparency

#### **Feature Table**

| Feature Name              | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| carrier                   | Shipping company (categorical, label encoded)           |
| transport_mode            | Mode of transport (Air, Sea, Road, Rail; label encoded) |
| origin, destination       | Start and end locations (label encoded)                 |
| shipment_status           | Status (In Transit, Customs Hold, etc.; label encoded)  |
| weather_condition         | Weather at shipment location (label encoded)            |
| disruption_type           | Type of disruption (label encoded)                      |
| weather_severity_score    | Numeric, 0–10                                           |
| traffic_congestion_level  | Numeric, 1–10                                           |
| port_congestion_score     | Numeric, 1–10                                           |
| disruption_impact_score   | Numeric, 0–10                                           |
| carrier_reliability_score | Numeric, 0–1                                            |
| historical_delay_rate     | Numeric, 0–1                                            |
| route_risk_score          | Numeric, 0–1                                            |
| days_in_transit           | Integer, days shipment has been in transit              |
| planned_transit_days      | Integer, planned days for delivery                      |
| package_weight_kg         | Numeric, package weight                                 |
| num_stops                 | Integer, number of stops                                |
| customs_clearance_flag    | Binary, 1 if customs clearance needed                   |
| transit_progress_ratio    | Derived, progress through journey                       |
| composite_risk_score      | Derived, weighted sum of risk signals                   |
| log_weight                | Derived, log(1 + package_weight_kg)                     |
| sla_pressure              | Derived, days left to meet planned ETA                  |
| ...\_enc                  | Encoded versions of categoricals                        |

### c. Model Training & Selection (`model_training.py`)

- **Logistic Regression:**
  - `sklearn.linear_model.LogisticRegression` (C=0.5, class_weight='balanced', max_iter=1000)
  - Baseline linear classifier for binary delay prediction
- **Random Forest Classifier:**
  - `sklearn.ensemble.RandomForestClassifier` (n_estimators=200, max_depth=12, min_samples_leaf=5, class_weight='balanced')
  - Ensemble of decision trees, robust to overfitting, interpretable feature importances
- **Gradient Boosting Classifier:**
  - `sklearn.ensemble.GradientBoostingClassifier` (n_estimators=200, learning_rate=0.05, max_depth=5, subsample=0.8)
  - Sequential tree boosting, excels at tabular data, optimizes ROC-AUC and F1
- **Extra Trees Classifier:**
  - `sklearn.ensemble.ExtraTreesClassifier` (n_estimators=200, max_depth=12, min_samples_leaf=5, class_weight='balanced')
  - More randomization than Random Forest, often improves generalization
- **Evaluation Metrics:**
  - ROC-AUC, F1, Precision, Recall, Confusion Matrix, Classification Report
- **Model Selection:**
  - Best model chosen by highest validation ROC-AUC, then evaluated on test set
  - Feature importances and model comparison saved to `artifacts/`

---

## 6. Risk Scoring Engine (`risk_scoring.py`)

- **Risk Probability:**
  - Uses the best ML model to assign a delay probability to each shipment
- **Risk Tiers:**
  - LOW (0.00–0.30, green), MEDIUM (0.30–0.60, amber), HIGH (0.60–0.90, orange), CRITICAL (0.90–1.00, red)
- **Alert Generation:**
  - Alerts include shipment details, risk tier, top risk factors, ETA, hours to SLA, and recommended action
  - Each tier has a color, action guideline, and triggers for escalation
- **Alert Example:**
  ```json
  {
    "shipment_id": "SHP12345",
    "risk_tier": "HIGH",
    "delay_probability": 0.82,
    "eta": "2026-03-15T12:00:00Z",
    "hours_to_sla": 36.0,
    "origin": "Shanghai",
    "destination": "New York",
    "carrier": "Maersk",
    "transport_mode": "Sea",
    "top_risk_factors": ["Port Strike", "Heavy Rain"],
    "action_required": "Trigger intervention protocol immediately.",
    "alert_generated_at": "2026-03-12T10:00:00Z",
    "alert_type": "IMMEDIATE"
  }
  ```

---

## 7. Recommendation Engine (`recommendation_engine.py`)

- **Intervention Mapping:**
  - Maps risk factors and operational context to specific interventions
- **Intervention Types:**
  - **Reroute Shipment:** Divert to alternative path (trigger: port strike, natural disaster)
  - **Assign Alternative Carrier:** Switch to more reliable carrier (trigger: equipment failure, low reliability)
  - **Upgrade to Air Freight:** Expedite via air (trigger: high delay probability, SLA breach imminent)
  - **Priority/Express Handling:** Expedited processing at next node (trigger: customs hold, port congestion)
  - **Customer Pre-Alert:** Notify customer of potential delay (trigger: any high risk)
  - **Expedite Customs Clearance:** Accelerate customs (trigger: customs hold)
- **Each recommendation includes:**
  - Description, triggers, applicable transport modes, cost/time/SLA impact
- **Recommendation Example:**
  ```json
  {
    "shipment_id": "SHP12345",
    "recommendations": [
      {
        "label": "Reroute Shipment",
        "description": "Divert the shipment to an alternative transit path that avoids the disrupted corridor.",
        "cost_impact": "Medium",
        "time_saving": "12–48 hours",
        "sla_impact": "High"
      },
      {
        "label": "Customer Pre-Alert",
        "description": "Proactively notify the customer of potential delay, revised ETA, and mitigation steps.",
        "cost_impact": "None",
        "time_saving": "N/A",
        "sla_impact": "Low (goodwill)"
      }
    ]
  }
  ```

---

## 8. Backend API & Firebase Integration

- **API (FastAPI, `api_server.py`):**
  - `/` — Health check
  - `/shipments` — Get all shipments
  - `/alerts` — Get all risk alerts
  - `/recommendations` — Get recommendations for a shipment
  - `/metrics` — Get risk analytics
- **API Example:**
  - **Request:** `GET /alerts`
  - **Response:**
    ```json
    [
      {
        "shipment_id": "SHP12345",
        "risk_tier": "HIGH",
        ...
      },
      ...
    ]
    ```
- **Firebase Uploader (`firebase_uploader.py`):**
  - Pushes shipments, alerts, recommendations, and metrics to Firestore
  - Cleans and type-casts data for Firestore compatibility
  - Collections: `shipments`, `alerts`, `recommendations`, `metrics`

---

## 9. Frontend Dashboard (React, Vite, TypeScript)

- **Features:**
  - Real-time shipment risk monitoring
  - Risk distribution (pie chart), alert trends (line chart), delay probability analytics
  - List of active alerts with risk factors and recommendations
  - Responsive, modern UI (Tailwind CSS)
- **Data Flow:**
  - Fetches data from Firestore via Firebase JS SDK
  - Context providers manage state for shipments, alerts, notifications
- **Key Components:**
  - `RiskDistributionChart`: Pie chart of risk tiers
  - `AlertTrendChart`: Line chart of alert counts over time
  - `DelayProbabilityChart`: Distribution of delay probabilities
  - `ShipmentAlerts`: List of current alerts
  - `RiskMetrics`: Summary statistics (total shipments, delayed, on-time, etc.)
- **Pages:**
  - Dashboard, Analytics, Shipments, Alerts, Recommendations, Login/Signup
- **UI/UX:**
  - Mobile responsive, dark/light mode, notification toasts

---

## 10. File Structure (Key Files & Folders)

```
project/
├── api_server.py              # FastAPI backend for serving ML results
├── data_generator.py          # Synthetic data generation logic
├── feature_engineering.py     # Data cleaning, feature engineering, encoding
├── model_training.py          # ML model zoo, training, evaluation, selection
├── risk_scoring.py            # Risk scoring, alert generation, tier logic
├── recommendation_engine.py   # Intervention logic, mapping triggers to actions
├── firebase_uploader.py       # Pushes results to Firestore
├── main_pipeline.py           # Orchestrates the full ML pipeline
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
│
├── artifacts/                 # Model artifacts, feature importances, comparison
├── data/                      # Raw and live shipment data
├── outputs/                   # Generated alerts and recommendations
│
├── ship-risk-ai/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Charts, Dashboard, Risk, Common UI
│   │   ├── contexts/          # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page-level components (Dashboard, Analytics, etc.)
│   │   ├── services/          # API, Firebase, export logic
│   │   ├── styles/            # Global and component styles
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── ...
│
└── serviceAccountKey.json     # Firebase service account (keep secret!)
```

---

## 11. Deployment

### a. Backend (Python)

- Run the ML pipeline:
  ```bash
  python main_pipeline.py
  ```
- Upload results to Firestore:
  ```bash
  python firebase_uploader.py
  ```
- (Optional) Start API server:
  ```bash
  uvicorn api_server:app --reload
  ```

### b. Frontend (React/Vite)

- Go to frontend directory:
  ```bash
  cd ship-risk-ai
  npm install
  npm run dev
  # For production:
  npm run build
  npm run deploy  # or firebase deploy
  ```

---

## 12. Unwanted Files & File Management

- Remove: `__pycache__/`, `.pyc` files, unused scripts, temp/test data, backup files
- Add `serviceAccountKey.json` and `.env` to `.gitignore`
- Regularly clean `artifacts/` and `outputs/`
- For large projects, group backend code into `backend/` or `ml/` with subfolders for `data_processing/`, `models/`, `utils/`
- Place tests in a `tests/` folder mirroring the source structure
- Keep growing docs in a `docs/` folder
- Use environment variables for secrets and config
- Use pre-commit hooks for linting and formatting

---

## 13. Getting Started

1. Clone the repo and set up Python and Node.js environments
2. Install backend and frontend dependencies
3. Configure Firebase (add your own `serviceAccountKey.json` and Firebase config)
4. Run the backend pipeline and upload results
5. Start the frontend and explore the dashboard

---
