'use client';

import { InitialDataStage } from './stages/InitialDataStage';
import { ProductSummaryStage } from './stages/ProductSummaryStage';
import { EducationContentStage } from './stages/EducationContentStage';
import { CreativePartsStage } from './stages/CreativePartsStage';
import { ScriptGenerationStage } from './stages/ScriptGenerationStage';

interface StageContentProps {
  projectId: number;
  stage: number;
  onStageComplete: (stage: number) => void;
}

export function StageContent({ projectId, stage, onStageComplete }: StageContentProps) {
  const renderStageContent = () => {
    switch (stage) {
      case 1:
        return <InitialDataStage projectId={projectId} onComplete={() => onStageComplete(1)} />;
      case 2:
        return <ProductSummaryStage projectId={projectId} onComplete={() => onStageComplete(2)} />;
      case 3:
        return <EducationContentStage projectId={projectId} onComplete={() => onStageComplete(3)} />;
      case 4:
        return <CreativePartsStage projectId={projectId} onComplete={() => onStageComplete(4)} />;
      case 5:
        return <ScriptGenerationStage projectId={projectId} onComplete={() => onStageComplete(5)} />;
      default:
        return <InitialDataStage projectId={projectId} onComplete={() => onStageComplete(1)} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderStageContent()}
    </div>
  );
}