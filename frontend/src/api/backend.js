import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 120000
});

const mockDetections = [
  {
    object_id: 1,
    class_name: "Debris Cluster",
    confidence: 0.92,
    bbox: { x1: 74, y1: 54, x2: 158, y2: 116, confidence: 0.92 },
    dimensions: { width: 84, height: 62 },
    latitude: 19.076,
    longitude: 72.8777,
    is_valid: true,
    validation_reason: "High-confidence debris signature in sonar image"
  },
  {
    object_id: 2,
    class_name: "Metal Fragment",
    confidence: 0.86,
    bbox: { x1: 260, y1: 120, x2: 332, y2: 178, confidence: 0.86 },
    dimensions: { width: 72, height: 58 },
    latitude: 19.082,
    longitude: 72.882,
    is_valid: true,
    validation_reason: "Object shape matched suspicious metal debris profile"
  },
  {
    object_id: 3,
    class_name: "Plastic Debris",
    confidence: 0.74,
    bbox: { x1: 330, y1: 210, x2: 410, y2: 258, confidence: 0.74 },
    dimensions: { width: 80, height: 48 },
    latitude: 19.088,
    longitude: 72.887,
    is_valid: true,
    validation_reason: "Area falls within expected anomaly threshold"
  }
];

const buildMockPayload = (fileName = "sample-sonar-image.png") => ({
  image_id: "demo-001",
  filename: fileName,
  image_width: 640,
  image_height: 360,
  num_detections_raw: mockDetections.length,
  num_detections_valid: mockDetections.length,
  count: mockDetections.length,
  objects: mockDetections,
  detections: mockDetections,
  survey: {
    depth_m: 125,
    ping_rate_hz: 20,
    speckle_noise: "Medium"
  },
  derived_location: {
    latitude: 19.076,
    longitude: 72.8777
  },
  result_json_path: "/mock/aquavision-results.json",
  result_csv_path: "/mock/aquavision-results.csv",
  status: "demo-mode",
  message: "Demo mode active. Connect the real backend later."
});

const getFriendlyErrorMessage = (error) => {
  if (error?.code === "ERR_NETWORK") {
    return "Backend is not running or unreachable. This frontend is intentionally running in demo mode until the real backend is connected.";
  }

  if (error?.response?.status === 404) {
    return `Backend route not found: ${config.ENDPOINTS.ANALYZE}. The app is still in frontend-only demo mode.`;
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Unable to connect to backend"
  );
};

/**
 * Health check for the future real backend integration.
 * In the current frontend-only workflow, this returns mock success.
 */
export const checkBackendHealth = async () => {
  if (config.USE_MOCK_DATA) {
    return {
      success: true,
      mode: "mock",
      data: {
        status: "demo",
        message: "Frontend demo mode active. Real backend integration pending."
      }
    };
  }

  try {
    const response = await api.get(config.ENDPOINTS.HEALTH);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: getFriendlyErrorMessage(error)
    };
  }
};

/**
 * Send sonar image to the AI backend.
 * Currently uses mock data so the frontend can be tested independently.
 */
export const analyzeSonarImage = async (file) => {
  if (config.USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    return {
      success: true,
      mode: "mock",
      data: buildMockPayload(file?.name || "sample-sonar-image.png")
    };
  }

  const formData = new FormData();

  formData.append("file", file);

  try {
    const response = await api.post(config.ENDPOINTS.ANALYZE, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Backend analysis error:", error);

    return {
      success: false,
      error: getFriendlyErrorMessage(error)
    };
  }
};

export default api;
