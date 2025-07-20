
---

```markdown
# 🌐 AuraFlow – AI Workflow Engine

A full-stack AI workflow builder powered by **React + Vite** on the frontend and **FastAPI** on the backend. Easily design, deploy, and chat with your custom AI workflows.

---

## 📁 Project Structure

```

auraflow/
├── auraflow-frontend/     # React + Vite frontend
└── backend/               # FastAPI backend

````

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) ≥ 16.x
- [Python](https://www.python.org/downloads/) ≥ 3.10
- [Git](https://git-scm.com/)
- (Optional) [Postman](https://www.postman.com/) for testing APIs

---

## ⚙️ Backend Setup (FastAPI)

### 📂 Navigate to the backend folder

```bash
cd backend
````

### 🧪 Create and activate a virtual environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment (use one of the following)

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 📦 Install dependencies

```bash
pip install -r requirements.txt
```

> Make sure `python-multipart` is included in `requirements.txt` if you’re using `FormData`.

### ▶️ Run the FastAPI server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Your FastAPI server will be available at:
➡️ `http://localhost:8000`

---

## 🌐 Frontend Setup (React + Vite)

### 📂 Navigate to the frontend folder

```bash
cd ../auraflow-frontend
```

### 📦 Install Node dependencies

```bash
npm install
```

or

```bash
yarn
```

### ▶️ Run the frontend dev server

```bash
npm run dev
```

or

```bash
yarn dev
```

This starts the app at:
➡️ `http://localhost:5173`

---

## 🌍 CORS Note

Make sure to configure **CORS in FastAPI** for development:

```python
# backend/main.py

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",           # frontend dev
    "https://your-vercel-site.vercel.app",  # production frontend (optional)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Common Commands

### ✅ Create `requirements.txt`

```bash
pip freeze > requirements.txt
```

### 🔄 If virtual environment issues occur

```bash
# Deactivate venv
deactivate

# Re-activate or recreate it
source venv/bin/activate
```

---

## 🚀 Deployment Tips

### Vercel (Frontend)

* Push `auraflow-frontend` to GitHub
* Connect to Vercel
* Set `build` command: `npm run build`
* Set `output` directory: `dist`

### Render (Backend)

* Push `backend` to GitHub
* Create new Web Service on [Render](https://render.com/)
* Set:

  * Start command: `uvicorn main:app --host=0.0.0.0 --port=8000`
  * Python build: Auto detected
* Add required **environment variables**

---

## 📬 API Endpoint

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/api/execute-workflow` | Run a workflow (FormData) |
| POST   | `/api/chat-with-stack`  | Chat with workflow engine |

---

## 🧪 Testing

You can test the API using tools like:

* [Postman](https://www.postman.com/)
* [curl](https://curl.se/)

Example:

```bash
curl -X POST http://localhost:8000/api/execute-workflow \
  -F 'stack_id=test_stack' \
  -F 'nodes=[{"id":"node_1",...}]' \
  -F 'edges=[{"source":"node_1",...}]'
```

---

## 🤖 Tech Stack

* **Frontend:** React, Vite, TailwindCSS, shadcn/ui, React Flow
* **Backend:** FastAPI, Python, Uvicorn
* **LLM APIs:** OpenAI / Gemini (configurable)

---

## 🧠 Credits

Built with ❤️ by [@muzammilx07](https://github.com/muzammilx07)

---

## 📄 License

This project is licensed under the MIT License.

```

---

Let me know if you'd like to also auto-deploy it via GitHub Actions or want a `.env` version of this too.
```
