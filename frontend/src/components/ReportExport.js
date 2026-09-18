import React from "react";

function ReportExport({ results }) {
  if (!results) {
    return null;
  }

  const detections = results.detections ?? results.objects ?? results.results ?? [];

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const json = JSON.stringify(results, null, 2);
    downloadFile(json, "aquavision-results.json", "application/json");
  };

  const exportCSV = () => {
    const headers = ["Class", "Confidence", "Latitude", "Longitude", "Dimensions"];

    const rows = detections.map((item) => {
      const confidence = item.confidence ?? item.bbox?.confidence ?? "";
      const latitude = item.latitude ?? "";
      const longitude = item.longitude ?? "";
      const dimensions =
        typeof item.dimensions === "object"
          ? JSON.stringify(item.dimensions)
          : item.dimensions ||
            (item.bbox
              ? JSON.stringify({
                  width: Math.abs(Number(item.bbox.x2 ?? 0) - Number(item.bbox.x1 ?? 0)),
                  height: Math.abs(Number(item.bbox.y2 ?? 0) - Number(item.bbox.y1 ?? 0))
                })
              : "" );

      return [
        item.class_name || item.class || item.label || item.name || "",
        confidence,
        latitude,
        longitude,
        dimensions
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    downloadFile(csv, "aquavision-results.csv", "text/csv");
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="export-buttons">
      <button className="secondary-button" onClick={exportJSON}>
        ↓ JSON
      </button>

      <button className="secondary-button" onClick={exportCSV}>
        ↓ CSV
      </button>

      <button className="primary-button" onClick={exportPDF}>
        🖨 PDF / Print
      </button>
    </div>
  );
}

export default ReportExport;
