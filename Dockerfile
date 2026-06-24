ARG VITE_GITHUB_CLIENT_ID=""
ARG VITE_GOOGLE_CLIENT_ID=""

FROM node:22 AS frontend
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_ID
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID} VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=frontend /frontend/dist /app/static
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
