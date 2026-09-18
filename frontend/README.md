# AquaVision AI Frontend

AI-powered underwater marine debris detection dashboard.

## Technology

- React
- Axios
- Leaflet
- React Leaflet
- CSS

## Features

- Side-scan sonar image upload
- Drag and drop
- AI analysis
- Detection results
- Confidence scores
- Bounding box visualization
- Geographic visualization
- JSON export
- CSV export
- PDF/Print report

## Installation

Open the frontend folder in VS Code.

Run:

npm install

Then:

npm start

The application will open at:

http://localhost:3000

## Backend

The frontend expects the backend to run at:

http://localhost:8000

Change the URL in:

src/config.js

Example:

API_BASE_URL: "http://localhost:8000"

## Backend API

The current frontend expects:

POST /pipeline/run

with a multipart form field:

file

Health check:

GET /health

If your backend uses different routes, change them in:

src/config.js

