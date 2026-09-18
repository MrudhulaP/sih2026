import React from "react";

const formatConfidenceValue = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  const numericValue = Number(value);
  const percent = numericValue > 1 ? numericValue : numericValue * 100;

  return `${percent.toFixed(1)}%`;
};

const normalizeDetections = (results) => {
  if (!results) return [];

  const source = results.detections ?? results.objects ?? results.results ?? [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item, index) => {
    const bbox = item.bbox ?? {};
    const className =
      item.class_name ?? item.class ?? item.label ?? item.name ?? "Unknown";

    const confidence =
      item.confidence ?? bbox.confidence ?? item.score ?? item.accuracy ?? 0;

    const width =
      bbox.x2 !== undefined && bbox.x1 !== undefined
        ? Math.abs(Number(bbox.x2) - Number(bbox.x1))
        : null;

    const height =
      bbox.y2 !== undefined && bbox.y1 !== undefined
        ? Math.abs(Number(bbox.y2) - Number(bbox.y1))
        : null;

    return {
      ...item,
      displayClass: className,
      confidence,
      dimensions:
        item.dimensions ??
        (width !== null && height !== null
          ? { width: Math.round(width), height: Math.round(height) }
          : undefined),
      latitude:
        item.latitude ?? item.location?.latitude ?? item.location?.lat ?? null,
      longitude:
        item.longitude ?? item.location?.longitude ?? item.location?.lng ?? null
    };
  });
};

function ResultsDashboard({ results, selectedDetection, onSelectDetection }) {
  if (!results) {
    return (
      <div className="results-empty">
        <div className="empty-icon">🔎</div>
        <h3>No analysis results yet</h3>
        <p>Upload a sonar image and run the AI analysis.</p>
      </div>
    );
  }

  const detections = normalizeDetections(results);
  const count = results.count ?? detections.length;
  const averageConfidence =
    detections.length > 0
      ? detections.reduce(
          (sum, item) => sum + (Number(item.confidence) || 0),
          0
        ) / detections.length
      : 0;

  const surveyDepth =
    results.survey?.depth_m ?? results.surveyDepth ?? results.depth ?? 125;
  const pingRate =
    results.survey?.ping_rate_hz ?? results.pingRate ?? 20;
  const noiseLevel =
    results.survey?.speckle_noise ?? results.noiseLevel ?? "Medium";
  const derivedLatitude =
    results.derived_location?.latitude ??
    results.derivedLocation?.latitude ??
    results.latitude ??
    (detections[0]?.latitude ?? 19.076);
  const derivedLongitude =
    results.derived_location?.longitude ??
    results.derivedLocation?.longitude ??
    results.longitude ??
    (detections[0]?.longitude ?? 72.8777);

  return (
    <div className="results-dashboard">
      <div className="result-summary">
        <div className="result-card">
          <span className="result-label">Objects Detected</span>
          <strong>{count}</strong>
        </div>

        <div className="result-card">
          <span className="result-label">Confidence</span>
          <strong>
            {detections.length > 0
              ? formatConfidenceValue(averageConfidence)
              : "—"}
          </strong>
        </div>

        <div className="result-card">
          <span className="result-label">Status</span>
          <strong className="status-success">Complete</strong>
        </div>
      </div>

      <div className="survey-grid">
        <div className="survey-card">
          <span className="result-label">Survey Depth</span>
          <strong>{surveyDepth} m</strong>
        </div>

        <div className="survey-card">
          <span className="result-label">Ping Rate</span>
          <strong>{pingRate} Hz</strong>
        </div>

        <div className="survey-card">
          <span className="result-label">Speckle / Acoustic Noise</span>
          <strong>{noiseLevel}</strong>
        </div>

        <div className="survey-card">
          <span className="result-label">Derived Latitude</span>
          <strong>{derivedLatitude.toFixed(4)}°</strong>
        </div>

        <div className="survey-card">
          <span className="result-label">Derived Longitude</span>
          <strong>{derivedLongitude.toFixed(4)}°</strong>
        </div>
      </div>

      <div className="detection-table-container">
        <h3>Detected Objects</h3>

        {detections.length === 0 ? (
          <p className="no-detections">No objects detected.</p>
        ) : (
          <table className="detection-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Class</th>
                <th>Confidence</th>
                <th>Dimensions</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {detections.map((item, index) => {
                const dimensions = item.dimensions;
                const dimensionsText =
                  dimensions && typeof dimensions === "object"
                    ? `${dimensions.width ?? "?"} × ${dimensions.height ?? "?"}`
                    : dimensions ?? "—";

                const locationText =
                  item.latitude !== null && item.longitude !== null
                    ? `${item.latitude}, ${item.longitude}`
                    : item.location || "—";

                const isSelected =
                  selectedDetection &&
                  (selectedDetection.object_id ?? selectedDetection.id ?? selectedDetection.name) ===
                    (item.object_id ?? item.id ?? item.name ?? index);

                return (
                  <tr
                    key={item.object_id ?? index}
                    className={isSelected ? "detection-row selected" : "detection-row"}
                    onClick={() => onSelectDetection && onSelectDetection(item)}
                  >
                    <td>{index + 1}</td>

                    <td>
                      <span className="class-badge">{item.displayClass}</span>
                    </td>

                    <td>{formatConfidenceValue(item.confidence)}</td>

                    <td>{dimensionsText}</td>

                    <td>{locationText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ResultsDashboard;
