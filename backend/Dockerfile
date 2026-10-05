# FastAPI backend за RepoRun (Docker)
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001
# При старт backend-от сам ги креира табелите и демо податоците ако базата е празна
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
