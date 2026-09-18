import React from "react";

const steps = [
  {
    number: "01",
    title: "Input",
    description: "Side-Scan Sonar Image",
    icon: "📡"
  },
  {
    number: "02",
    title: "Preprocessing",
    description: "Normalize & Denoise",
    icon: "⚙️"
  },
  {
    number: "03",
    title: "Detection",
    description: "Find Candidate Objects",
    icon: "🔍"
  },
  {
    number: "04",
    title: "Segmentation",
    description: "Generate Object Mask",
    icon: "◩"
  },
  {
    number: "05",
    title: "Validation",
    description: "Filter Natural Terrain",
    icon: "✓"
  },
  {
    number: "06",
    title: "Output",
    description: "Actionable Information",
    icon: "📊"
  }
];

function PipelineSteps({ currentStep = 0 }) {
  return (
    <div className="pipeline-container">
      {steps.map((step, index) => {
        const active = index <= currentStep;

        return (
          <React.Fragment key={step.number}>
            <div className={`pipeline-step ${active ? "pipeline-active" : ""}`}>
              <div className="pipeline-icon">{step.icon}</div>

              <div className="pipeline-number">{step.number}</div>

              <div className="pipeline-title">{step.title}</div>

              <div className="pipeline-description">{step.description}</div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`pipeline-line ${index < currentStep ? "line-active" : ""}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default PipelineSteps;
