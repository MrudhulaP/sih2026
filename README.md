# AquaVision AI 🌊
> **SIH Problem Statement ID:** SIH26057  
> **Ministry:** Ministry of Earth Sciences (MoES)  
> **Problem Title:** AI-Powered Automated Underwater Marine Debris and Anomaly Detection System using Side-Scan Sonar Imagery

---

## 📌 Problem Overview
Side-Scan Sonar (SSS) imagery is vital for marine environmental monitoring and underwater anomaly detection. However, manual inspection of acoustic sonar logs is labor-intensive, time-consuming, and prone to false positives caused by speckle noise, varying sea depths, and complex seabed topographies.

**AquaVision AI** provides an end-to-end, automated deep-learning and acoustic DSP pipeline tailored specifically for Side-Scan Sonar (SSS) data to detect, segment, and geotag marine debris (e.g., ghost fishing nets, sunken tires, metal containers) in real time.

---

## 🚀 Key Features
- **Acoustic Pre-Processing Engine:** Applies spatial denoising (Lee / Kuan filters) and Time-Varying Gain (TVG) normalization to eliminate reverberation noise and range attenuation.
- **Shadow-Aware AI Detection:** Utilizes object detection (YOLOv10) and semantic segmentation (U-Net) to identify high-contrast acoustic highlights paired with trailing acoustic shadows, drastically reducing false alarms.
- **Geospatial Geo-Parsing:** Translates ping headers and navigation logs directly into precise geographical coordinates (Latitude / Longitude).
- **Interactive UI & Mapping Console:** Real-time side-scan waterfall display with integrated GIS hazard mapping and JSON/CSV log export functionality.

---

## 🛠️ Project Architecture & Tech Stack

### Backend & AI
- **Language:** Python 3.14+
- **Computer Vision / Deep Learning:** PyTorch, Ultralytics YOLO, OpenCV
- **Acoustic & Signal Processing:** NumPy, SciPy, GDAL, PySonar
- **Containerization:** Docker / Dockerfile

### Frontend & GIS
- **Dashboard:** HTML5, Tailwind CSS, JavaScript (Canvas API)
- **Mapping:** Leaflet.js, OpenStreetMap / PostGIS

---

## 📂 Repository Structure

```text
sih2026/
├── backend/            # Processing pipeline, model inference, and API code
├── Dockerfile          # Docker setup for consistent deployment
└── README.md           # Project documentation
