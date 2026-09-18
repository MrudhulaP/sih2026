import React, { useState, useEffect } from "react";

import ImageUpload from "../components/ImageUpload";
import PipelineSteps from "../components/PipelineSteps";
import ResultsDashboard from "../components/ResultsDashboard";
import MapView from "../components/MapView";
import ReportExport from "../components/ReportExport";

import { analyzeSonarImage, checkBackendHealth } from "../api/backend";

function Analysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [selectedDetection, setSelectedDetection] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      const response = await checkBackendHealth();

      if (!response.success) {
        setError(response.error);
      }
    };

    checkHealth();
  }, []);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setResults(null);
    setSelectedDetection(null);
    setError("");
    setCurrentStep(0);

    const imageURL = URL.createObjectURL(file);
    setPreview(imageURL);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload a sonar image first.");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentStep(1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStep(2);

      const response = await analyzeSonarImage(selectedFile);

      if (!response.success) {
        throw new Error(response.error);
      }

      setCurrentStep(3);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentStep(4);

      setResults(response.data);
      const detections = response.data?.detections ?? response.data?.objects ?? [];
      if (detections.length > 0) {
        setSelectedDetection(detections[0]);
      }
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis failed.");
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getDetections = () => {
    if (!results) return [];

    const source = results.detections ?? results.objects ?? results.results ?? [];
    return Array.isArray(source) ? source : [];
  };

  const renderBoundingBoxes = () => {
    if (!preview) return null;

    const detections = getDetections();

    return detections.map((item, index) => {
      const bbox = item.bbox ?? {};
      const hasBBox =
        bbox &&
        (bbox.x1 !== undefined ||
          bbox.y1 !== undefined ||
          bbox.x2 !== undefined ||
          bbox.y2 !== undefined ||
          bbox.x !== undefined ||
          bbox.y !== undefined);

      if (!hasBBox) {
        return null;
      }

      const imageWidth = Number(results?.image_width || 100);
      const imageHeight = Number(results?.image_height || 100);

      const x1 = Number(bbox.x1 ?? bbox.x ?? 0);
      const y1 = Number(bbox.y1 ?? bbox.y ?? 0);
      const x2 = Number(bbox.x2 ?? bbox.x ?? 0) + Number(bbox.width ?? 0);
      const y2 = Number(bbox.y2 ?? bbox.y ?? 0) + Number(bbox.height ?? 0);

      const left = Math.min(x1, x2) / imageWidth * 100;
      const top = Math.min(y1, y2) / imageHeight * 100;
      const width = Math.abs(x2 - x1) / imageWidth * 100;
      const height = Math.abs(y2 - y1) / imageHeight * 100;

      return (
        <div
          key={item.object_id ?? index}
          className="bounding-box"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`
          }}
        >
          <span>{item.class_name || item.class || item.label || "Object"}</span>
        </div>
      );
    });
  };

  return (
    <div className="analysis-page">
      <div className="page-header">
        <div>
          <div className="small-label">AI ANALYSIS</div>
          <h1>Sonar Analysis Dashboard</h1>
          <p>Upload a side-scan sonar image to detect underwater objects.</p>
        </div>

        <div className={`backend-status ${loading ? "processing" : "ready"}`}>
          <span />
          {loading ? "Processing" : "System Ready"}
        </div>
      </div>

      <PipelineSteps currentStep={currentStep} />

      <div className="analysis-grid">
        <div className="panel upload-panel">
          <div className="panel-header">
            <h2>Input Image</h2>
          </div>

          <ImageUpload onFileSelected={handleFileSelected} disabled={loading} />

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Sonar preview" className="sonar-preview" />
            </div>
          )}

          {error && <div className="error-message">⚠ {error}</div>}

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
          >
            {loading ? "Analyzing..." : "▶ Run AI Detection"}
          </button>
        </div>

        <div className="panel output-panel">
          <div className="panel-header">
            <div>
              <h2>Detection Results</h2>
              <p>AI-generated analysis</p>
            </div>

            <ReportExport results={results} />
          </div>

          <ResultsDashboard
            results={results}
            selectedDetection={selectedDetection}
            onSelectDetection={setSelectedDetection}
          />
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Sonar Visualization</h2>
              <p>Analysis image and detection information</p>
            </div>
          </div>

          <div className="visualization-area">
            {preview ? (
              <div className="visualization-image">
                <img src={preview} alt="Sonar analysis" />
                {renderBoundingBoxes()}
              </div>
            ) : (
              <div className="visualization-empty">
                Upload an image to visualize sonar analysis.
              </div>
            )}
          </div>
        </div>

        <div className="panel map-panel">
          <div className="panel-header">
            <div>
              <h2>Detection Map</h2>
              <p>Geographic location when metadata is available</p>
            </div>
          </div>

          <MapView
            detections={getDetections()}
            selectedDetection={selectedDetection}
            onDetectionSelect={setSelectedDetection}
          />
        </div>
      </div>
    </div>
  );
}

export default Analysis;
