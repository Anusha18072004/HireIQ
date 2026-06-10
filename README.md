# HireIQ - AI-Powered Recruitment Platform

HireIQ is a modern, AI-assisted recruitment and candidate-job matching platform. It bridges the gap between recruiters and candidates by utilizing large language models (LLMs) to analyze resumes, evaluate compatibility, provide smart career suggestions, and run customized candidate evaluations.

---

## 🚀 Key Features

### For Candidates
*   **Resume Parsing & Profile Builder**: Upload resumes (backed by Cloudinary storage) and construct dynamic candidate profiles.
*   **AI Match Scoring**: Get real-time feedback on how well your profile aligns with active job descriptions.
*   **Tailored Career Suggestions**: Receive automated, AI-driven recommendations on how to improve your resume, acquire missing skills, and build project portfolios.
*   **Interactive Assessments**: Take customized tests mapped to job specifications with automated scoring and timed assessments.

### For Recruiters
*   **Job Postings**: Create, edit, and manage comprehensive job listings.
*   **Applicant Dashboard**: View candidate scores, profile completion percentages, and detailed match ratings.
*   **Automated Verification**: Evaluate test performances and rank candidates dynamically.

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: Spring Boot 3+ (Java)
*   **Security**: Spring Security & JSON Web Tokens (JWT) for secure authentication
*   **Database**: PostgreSQL
*   **ORM**: Spring Data JPA & Hibernate
*   **AI Integration**: Spring AI (OpenAI API interface connected to Groq Llama 3.3 70B model)
*   **File Uploads**: Cloudinary API
*   **Notification Engine**: JavaMailSender configured with Gmail SMTP

### Frontend
*   **Library**: React (JS)
*   **Build Tool**: Vite
*   **Styling**: Vanilla CSS (Premium Dark/Glassmorphic Themes)
*   **HTTP Client**: Axios

---

## ⚙️ Configuration & Environment Variables

All critical credentials and secrets have been externalized to keep the source code secure. To run the application locally, you need to provide the following configuration values.

### Environment variables list:
*   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
*   `CLOUDINARY_API_KEY`: Your Cloudinary API key.
*   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.
*   `GROQ_API_KEY`: Your Groq console API key (`gsk_...`).
*   `GMAIL_USERNAME`: Gmail address used to send verification/updates.
*   `GMAIL_PASSWORD`: Gmail App Password (16 characters, without spaces).

For convenience, your local secrets have been backed up in a Git-ignored file named `dev-env.txt` in the root directory.

---

## 🏃 Getting Started

### 1. Database Setup
Ensure PostgreSQL is running locally. Create a database named `hireiq_db`:
```sql
CREATE DATABASE hireiq_db;
```

### 2. Running the Backend
Configure the required environment variables in your system, or pass them when running:
```bash
# From the root directory
./mvnw spring-boot:run
```
*The Spring Boot server starts on port `8082`.*

### 3. Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
*The frontend development server starts on port `3000`.*

---

## 🔒 Security & Best Practices
*   **Sanitized Commits**: Hardcoded API keys, database passwords, and SMTP app secrets are completely removed from the Git history.
*   **Ignored Files**: External dependencies (`node_modules`), build directories (`target`), IDE files (`.idea`, `.vscode`), and local environment backups (`dev-env.txt`) are excluded via `.gitignore`.
