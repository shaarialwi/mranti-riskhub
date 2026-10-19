# MRANTI RiskHub — Enterprise Risk Management MVP

**Status:** Working GitHub Pages demonstration, with optional Firebase backend for authenticated multi-user use. This project has **not** been deployed to MRANTI's GitHub or Firebase accounts.

## 1. What this system does

MRANTI staff can register a new risk, record likelihood and impact, explain root causes and consequences, document existing controls, and propose multiple mitigation actions with accountable owners and deadlines. Staff can save drafts or submit them to the Risk Management Team.

The **Risk Team reviewer** can open submitted assessments, adjust scoring during validation, start review, approve action plans, or return them with explanatory remarks. Once a plan is approved, the risk owner can update its progress. Risk Team users can close a risk after all actions are marked completed. Approval of an action plan does **not** automatically close the risk.

Screens: Overview, Risk Register, Submit New Risk, Risk Approvals, Action Tracker, Risk Matrix, Settings & Guide. CSV export, demo CSV import, 5×5 scoring and activity history are included.

## 2. How the uploaded workbook was mapped

Source workbook: `Risk Register_Strategy.xlsx`, sheets `DRR_Strategy`, `CRR_Strategy - Data`, other departmental CRR sheets, `Compliance Monitoring Strategy`, and `Risk Assessment_Guide`.

| Workbook | RiskHub data field |
|---|---|
| Ref. No | Risk ID |
| Risk Category / Risk Title / Description | Category / Title / Description |
| Root Cause / Consequences | Root cause / Consequences |
| Division / Department / Risk Owner | Division / Department / Owner |
| Inherent Likelihood / Impact / Rating | Inherent 5×5 assessment (rating calculated) |
| Risk Response Strategy | Reduce / Transfer / Accept / Avoid |
| Current Controls / Effectiveness | Existing controls / Control effectiveness |
| Residual Likelihood / Impact / Rating | Residual 5×5 assessment (rating calculated) |
| Additional Controls / Action Plans | Multiple action-plan items |
| Action Plan Status / Progress Updates | Per-action status, percentage and updates |
| Timeline Start / End | Due dates (MVP); additional start dates in later release |
| Additional Remarks / Evidence | Reviewer remarks / update references (no attachments yet) |

### Exact MRANTI scoring rubric
- Likelihood: 1 Rare, 2 Unlikely, 3 Likely, 4 Almost Certain, 5 Certain.
- Impact: 1 Insignificant, 2 Minor, 3 Moderate, 4 Major, 5 Catastrophic.
- Score = likelihood × impact.
- Low: 1–4, Moderate: 5–10, Significant: 12–16, High: 20–25. (The mathematical product of two integer scores 1–5 does not produce 11, 13–14, 17–19, or 21–24.)

The sample records in this package are **fabricated demonstration cases**; none of your actual Strategy risk-register rows is published in this code.

## 3. Test locally (no backend required)

From the project folder, run:

```bash
python3 -m http.server 8000
```

Visit `http://localhost:8000`.

You can also open the `index.html` file, although a local HTTP server is preferable for JavaScript modules. Start as **Demo Staff**, create a risk and submit it, then go to **Settings & Guide → Switch demo role → Risk Team Reviewer** to approve or return it. Return to Staff to update an approved action plan. Demo data lives in your browser's `localStorage`; clearing browser data will remove changes. The role switch is for testing and **is not authentication**.

## 4. Publish on GitHub Pages — demonstration

1. Create a GitHub repository, e.g. `mranti-riskhub`.
2. Upload all files from this folder into the repository root. Keep `assets/`, `functions/`, and the `.js` / `.css` files in the same relative structure.
3. Go to repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
5. GitHub will show the resulting Pages URL (usually `https://YOUR-USERNAME.github.io/mranti-riskhub/`).
6. Test the demo workflow from a browser.

**WARNING:** GitHub Pages serves public static files, even when the repository is private. Do not embed real MRANTI risk data, credentials, contracts or sensitive information in repository files, seed scripts or HTML. Demo records are intentionally fictional.

## 5. Optional: enable authenticated shared records via Firebase

GitHub Pages hosts only static HTML/CSS/JS. For MRANTI staff to use a *shared* system, a proper backend with access control is necessary. This starter integrates Google Sign-In and Cloud Firestore; the Firebase project and deployment must be performed by an authorised MRANTI administrator.

1. At [Firebase Console](https://console.firebase.google.com/), create a project approved for MRANTI data and select the appropriate Google Cloud region. Confirm MRANTI data residency, security, retention and procurement requirements before storing real risk records.
2. In **Build → Authentication → Sign-in method**, enable **Google**. In **Authentication → Settings → Authorized domains**, add your Pages **hostname** (e.g. `YOUR-USERNAME.github.io`), not the full URL path.
3. Enable **Cloud Firestore** in production mode. Select an approved region. Do not use open, test-mode security rules.
4. In **Project settings → Your apps**, register a Web app. Copy the public Firebase **web configuration** (apiKey, authDomain, projectId, appId) into `firebase-config.js`:

   ```javascript
   window.RISKHUB_FIREBASE_CONFIG = {
     apiKey: 'YOUR_PUBLIC_WEB_API_KEY',
     authDomain: 'YOUR-PROJECT.firebaseapp.com',
     projectId: 'YOUR-PROJECT',
     appId: 'YOUR-WEB-APP-ID'
   };
   ```

5. Install the Firebase CLI (`npm install -g firebase-tools`), authenticate (`firebase login`) and associate this folder with your Firebase project (`firebase use --add`). Deploy the supplied rules: `firebase deploy --only firestore:rules`.
6. Sign in using a verified `@mranti.my` Google Workspace account. The Firestore rules enforce your MRANTI email domain, risk owner visibility, Risk Team approval rights and allowed workflow transitions. The client-side Google `hd` parameter alone is **not** the security barrier; Firestore rules are.
7. To give an authorised Risk Team user reviewer rights, find their **Firebase Authentication UID**, then use Firebase Console → Firestore to create document `roles/USER_UID`, with a string field `role = reviewer`. Only an authorised admin can assign these role documents. Other verified MRANTI accounts default to Staff.
8. Reload the app. Staff can see only risks they created. Risk Team reviewers can see the entire register and the approval queue. Test with two actual test accounts before migration.

**Important:** Use the included rules as a starting baseline and arrange a security review before production. They restrict who may approve risks, but the MVP does not enforce immutable approved action descriptions at field level and only the user interface verifies all actions are completed before closure. For a regulated production system, move approval and closure decisions into trusted Cloud Functions, make approved-plan fields immutable, and enforce per-action completion server-side. Introduce a controlled exception / escalation process for urgent changes. Do not use this MVP to make legally binding risk approvals without those controls.

### Optional server-recorded audit events

The supplied `functions/index.js` listens for risk changes and records their authenticated actor, old/new status and changed field names in `audit_events` (without replicating entire sensitive record contents). These events cannot be modified through the app. Deployment requires a paid Firebase billing plan and authorised setup:

```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

The app's existing activity timeline is user-submitted activity data, **not a tamper-proof audit log**. The optional server-generated collection should be used for formal audit and investigation, with appropriate permissions, retention and validation.

## 6. Suggested next development phases

**Phase 1 — MVP / UAT:** Validate the Q3 2026 MRANTI risk matrix and thresholds with the risk owner and secretariat; validate divisions, score descriptors, role list, notification SLAs, owner sign-off and risk acceptance policy. Confirm approval authority and segregation of duties.

**Phase 2 — production hardening:** Secure server-side decision transactions; evidence uploads with private storage rules; immutable approval snapshots; server-side deadline checks, reminder emails, review cycle by quarter, reporting access for division heads, risk appetite, escalations, versioned assessments, periodic reassessment, action owner acknowledgement and policy-based acceptance.

**Phase 3 — migration and reporting:** Map the original DRR and CRR worksheets to a canonical risk schema, preserve legacy reference numbers, de-duplicate cross-register risks, normalise multiline action plans, and obtain approval before loading real records. Integrate Power BI / Snowflake for authorised consolidated analytics.

### Reference implementations / principles
- MRANTI Enterprise Risk Management — `Risk Assessment_Guide` sheet in uploaded `Risk Register_Strategy.xlsx` (Q3 2026).
- [ISO 31000 Risk Management Guidelines](https://www.iso.org/standard/65694.html?page=5).
- [COSO Enterprise Risk Management](https://www.coso.org/enterprise-risk-management).
- [ServiceNow Risk Response Task Workflow](https://www.servicenow.com/docs/r/governance-risk-compliance/grc-risk-management-workspace/workflow-of-risk-response-task.html).
- [Firebase Firestore Security Rules — Field Restrictions](https://firebase.google.com/docs/firestore/security/rules-fields).

## 7. Files

```text
mranti-riskhub/
├── index.html              # App shell
├── styles.css              # Responsive MRANTI-inspired theme
├── app.js                  # UI, risk register, approvals, CSV and demo storage
├── firebase-config.js      # Null for demo, web config for live mode
├── firebase-adapter.js     # Firebase Authentication / Firestore adapter
├── firestore.rules         # Baseline member / reviewer / owner access rules
├── firebase.json           # Firebase CLI project config
├── sample-risk-import.csv  # Fictional CSV demo import template
├── assets/favicon.svg      # App icon
├── functions/
│   ├── index.js            # Optional server-recorded audit events
│   └── package.json
└── README.md
```
