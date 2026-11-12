# 🏥 PathCareSync AI - Adaptive Care Intelligence 
**Patient Care Twin + Expected-vs-Actual Deviation Engine**

> ⚠️ **Project Status:** This repository contains a fully functional **demo working prototype** of the PathCareSync AI platform.
>
> *Bridging the gap between hospital discharge and long-term disease management. PathCareSync AI models a patient's expected care journey, detects when reality drifts from it, and helps the care team intelligently close the gap.*

---

## 🎯 The Motive
Most healthcare systems passively monitor patients. PathCareSync AI actively creates a **dynamic care pathway** for each patient. By comparing actual progress against an expected clinical trajectory, our AI orchestration layer detects meaningful deviations, understands the clinical context, and recommends the next-best intervention. 

We are specifically targeting the majority of India's Non-Communicable Disease (NCD) burden, providing specialized monitoring for **Hypertension, Type 2 Diabetes, Tuberculosis, Coronary Artery Disease, Chronic Kidney Disease, Stroke Recovery, and Depression.**

---

## 🔄 The Intelligence Workflow

`🏥 Discharge` ➔ `🧠 Build Trajectory` ➔ `📊 Monitor` ➔ `⚠ Detect Deviation` ➔ `💊 Intervene` ➔ `🔄 Adapt`

---

## ✨ Key Innovations

*   📝 **The Care Plan as a Living Contract:** Discharge instructions aren't static PDFs anymore. Every instruction becomes a measurable checkpoint with a timeline and expected value range.
*   🔍 **100% Auditable AI Alerts:** Every alert shows exactly *which* rule triggered, *what* data pattern was detected, and *which* model generated the explanation, ensuring total clinical accountability.
*   ⚡ **Proactive Prioritized Worklists:** Instead of doctors searching for who needs help, our recommendation engine delivers a prioritized daily list of patients needing attention based on medical urgency.
*   🇮🇳 **ABDM / ABHA Integration:** Built directly on top of India's digital health stack. Seamlessly plugs into the existing ABHA network (948M+ accounts) for immediate, national-scale deployment.
*   🏷️ **Three-Source AI Labelling:** Insights are transparently labeled by their source:
    *   *Rule-based* (Deterministic & Auditable)
    *   *ML-pattern* (XGBoost model-derived)
    *   *LLM-explanation* (Generated & clearly labeled)

---

## 💻 Tech Stack & Architecture

 Developer-First AI Pipeline Infrastructure, ensuring real-time processing, high availability, and secure clinical data handling. 

*For a detailed look at our system architecture, data flow, and the Human-in-the-Loop AI node pipeline, please refer to the architecture diagram: image_58cf89.png*

### **Frontend & Visualisation**
*   ⚛️ **React 18 & TypeScript** (Robust, type-safe UI)
*   🎨 **Tailwind CSS** (Responsive, modern styling)
*   📈 **Recharts** (Interactive Care Twin visualization)
*   🔌 **WebSocket** (Live AI pipeline status updates)

### **Backend & AI Orchestration**
*   🐍 **FastAPI / Python 3.11** (High-performance API)
*   🚀    Pipeline triggers & meta-harness
*   ⚙️ **Celery + Redis** (Asynchronous task queues)
*   🤖 **AI Models:** XGBoost (Deviation Scorer), Gemini 1.5 Flash (LLM Explanation), OpenAI Whisper (Audio Transcription)

### **Database & Integrations**
*   🐘 **PostgreSQL 15 + Supabase** (Auth & Row Level Security)
*   ⏱️ **TimescaleDB** (Time-series optimization for patient vitals)
*   🏛️ **ABDM / ABHA API** (National health stack integration)
*   ☁️ **Microsoft Azure Cloud** (One-click deployment)

---

## 👨‍💻 Contributors

Built with passion and technical rigor by:

*   **Anuj Saini** – B.Tech CSE (AI & ML), 2nd Year Student
*   **Yashpreet Singh Gujral** – B.Tech CSE (AI & ML), 2nd Year Student
