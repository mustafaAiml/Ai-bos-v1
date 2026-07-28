# AI BOS – Permanent Master Project Rules & Standards

These rules apply permanently to every response, feature, screen, module, API, database schema, AI workflow, UI update, and code implementation for **AI BOS (AI Business Operating System)**.

---

## 1. PRIMARY OBJECTIVE
Build **AI BOS** as a real, commercial Business Operating System.
- **NEVER** build a demo, prototype, college project, or fake functionality.
- Everything must be designed and implemented to be enterprise-grade and production-ready on day one.

---

## 2. MULTI-DISCIPLINARY ROLES
Every decision must be reviewed simultaneously through the lenses of:
- Senior Product Manager & Software Architect
- Senior Python & AI/ML Engineer
- Senior Backend & Frontend Engineer
- Senior UI/UX Designer & Database Architect
- Senior Security, DevOps, & QA Engineer
- Senior ERP & Business Consultant

---

## 3. DEVELOPMENT STANDARDS & BANNED PATTERNS
- **Never do these**:
  - Fake APIs, fake AI, simulated responses, or mock authentication.
  - Hardcoded demo data, placeholder values, or Lorem Ipsum.
  - Exposing secrets, API keys, env vars, internal stack traces, debug pages, or testing routes.
  - Exposing technology names, developer branding, or "Built with..." inside the UI.

---

## 4. CORE ARCHITECTURE & STACK
- **Python Backend Engine**: Controls all Business Logic, AI Orchestration, ML Inference, Business Rules, Predictive Analytics, Reports, Background Jobs, Decision Engine, and Automation. The frontend must never hold business logic.
- **3-Layer AI Architecture**:
  1. **Generative AI Layer**: Conversational reasoning, NLU search, reports, invoice explanations.
  2. **Agentic AI Layer**: Autonomous inventory monitoring, purchase recommendations, supplier insights, smart workflows, task planning.
  3. **Machine Learning Layer**: Demand forecasting, sales predictions, customer behaviour analysis, profit prediction, anomaly detection.
- **Frontend**: Material Design 3 aesthetic, responsive, clean, high-contrast, zero clutter, professional, fast.

---

## 5. SECURITY & COMPLIANCE
- Authentication, Authorization, Input Validation, Audit Logging, Rate Limiting, Secure Storage, and Zero Secrets in source code.
- Environment variables configured strictly through `.env.example`.

---

## 6. WORKSPACE & MVP BOUNDARIES
- **Active Module**: **Commerce Suite** (Smart POS, Inventory Intelligence, Store/Shop Management, Voice Orders, Sales & Billing Analytics).
- **Locked Modules**: Personal Space, Finance Suite, and future extensions remain locked.
- **Business Onboarding Workflow**: Login → Location Permission → Business Search → Automated Research & Category Detection → User Confirmation → Automated Workspace Setup.
