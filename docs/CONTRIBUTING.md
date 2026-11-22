# Contributing Guidelines — Mandi Mitra

Thank you for contributing to Mandi Mitra! This document outlines code standards, git workflows, and contribution practices.

---

## 1. Development Principles

1. **Farmer-First Design**: UI components must remain clean, accessible, and responsive on mobile devices with high-contrast text.
2. **Explainable Logic**: Avoid black-box machine learning algorithms for price predictions. Calculations must remain transparent, verifiable, and rule-based.
3. **Honest Data Provenance**: Never label demo, sample, or benchmark prices as live government quotes.

---

## 2. Git Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make targeted, focused commits:
   ```bash
   git commit -m "feat(advisor): add storage moisture loss risk adjustment"
   ```
3. Never commit `.env` files, database binaries (`*.db`), or `node_modules`.

---

## 3. Pre-Pull Request Checklist

Before submitting a Pull Request, run the local verification suite:

```powershell
# 1. Run backend tests (all 16 must pass)
python -m pytest backend/tests -v

# 2. Run system verification
python scripts/verify_system.py

# 3. Verify frontend build
cd frontend
npm run build
```

---

## 4. Coding Conventions

- **Python**: Follow PEP 8 style guidelines. Use Pydantic schemas for request and response validation.
- **React**: Functional components with React hooks. Use Tailwind CSS utility classes.
- **Localization**: When adding new UI strings, provide entries across all supported languages in `frontend/src/utils/translations.js` (`en`, `te`, `hi`).
