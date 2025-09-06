'use client';

import { InitialDataStage } from './stages/InitialDataStage';
import { ProductSummaryStage } from './stages/ProductSummaryStage';
import { EducationContentStage } from './stages/EducationContentStage';
import { CreativePartsStage } from './stages/CreativePartsStage';
import { ScriptGenerationStage } from './stages/ScriptGenerationStage';

interface StageContentProps {
  projectId: string;
  stage: number;
  onStageComplete: () => void;
}

export function StageContent({ projectId, stage, onStageComplete }: StageContentProps) {
  const renderStageContent = () => {
    switch (stage) {
      case 1:
        return <InitialDataStage key={`${projectId}-stage-1`} projectId={projectId} onComplete={onStageComplete} />;
      case 2:
        return <ProductSummaryStage key={`${projectId}-stage-2`} projectId={projectId} onComplete={onStageComplete} />;
      case 3:
        return <EducationContentStage key={`${projectId}-stage-3`} projectId={projectId} onComplete={onStageComplete} />;
      case 4:
        return <CreativePartsStage key={`${projectId}-stage-4`} projectId={projectId} onComplete={onStageComplete} />;
      case 5:
        return <ScriptGenerationStage key={`${projectId}-stage-5`} projectId={projectId} onComplete={onStageComplete} />;
      default:
        return <InitialDataStage key={`${projectId}-stage-default`} projectId={projectId} onComplete={onStageComplete} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderStageContent()}
    </div>
  );
}