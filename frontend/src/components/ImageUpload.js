import React, { useState } from "react";

function ImageUpload({ onFileSelected, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    setFileName(file.name);
    onFileSelected(file);
  };

  const handleChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    if (disabled) return;

    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`upload-box ${dragActive ? "drag-active" : ""}`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
    >
      <div className="upload-icon">🌊</div>

      <h3>Upload Side-Scan Sonar Image</h3>

      <p>
        Drag & drop your sonar image here
        <br />
        or
      </p>

      <label className="upload-button">
        Choose Image
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
          hidden
        />
      </label>

      {fileName && (
        <div className="selected-file">
          Selected: <strong>{fileName}</strong>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
