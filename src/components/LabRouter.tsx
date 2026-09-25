import { ModelSimulatorLab } from "../labs/ModelSimulatorLab";
import { ToolWalkthroughLab } from "../labs/ToolWalkthroughLab";
import { CostCalculatorLab } from "../labs/CostCalculatorLab";
import { RolloutBuilderLab } from "../labs/RolloutBuilderLab";
import { RagPipelineLab } from "../labs/RagPipelineLab";
import { EvalWorkbenchLab } from "../labs/EvalWorkbenchLab";
import { DevWorkflowLab } from "../labs/DevWorkflowLab";
import { CustomerHealthLab } from "../labs/CustomerHealthLab";

export type LabId =
  | "model-simulator"
  | "tool-walkthrough"
  | "cost-calculator"
  | "rollout-builder"
  | "rag-pipeline"
  | "eval-workbench"
  | "dev-workflow"
  | "customer-health";

export interface LabRouterProps {
  labId: LabId | string;
}

export function LabRouter({ labId }: LabRouterProps) {
  switch (labId) {
    case "model-simulator":
      return <ModelSimulatorLab />;
    case "tool-walkthrough":
      return <ToolWalkthroughLab />;
    case "cost-calculator":
      return <CostCalculatorLab />;
    case "rollout-builder":
      return <RolloutBuilderLab />;
    case "rag-pipeline":
      return <RagPipelineLab />;
    case "eval-workbench":
      return <EvalWorkbenchLab />;
    case "dev-workflow":
      return <DevWorkflowLab />;
    case "customer-health":
      return <CustomerHealthLab />;
    default:
      return (
        <div className="card" role="status">
          <p>Unknown lab: {labId}</p>
        </div>
      );
  }
}
