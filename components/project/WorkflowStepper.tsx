'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Circle } from 'lucide-react';

interface WorkflowStepperProps {
  stages: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  currentStage: number;
  completedStage: number;
  onStageClick: (stage: number) => void;
}

export function WorkflowStepper({ stages, currentStage, completedStage, onStageClick }: WorkflowStepperProps) {
  const getStageStatus = (stageId: number) => {
    // completedStageが6（全完了）の場合、全てのステージを完了扱いにする
    if (completedStage >= 6) {
      return 'completed';
    }
    // completedStageは完了したステージ数なので、stageId <= completedStageなら完了
    if (stageId <= completedStage) return 'completed';
    // 現在のステージはcurrentStageで判定
    if (stageId === currentStage) return 'current';
    return 'next'; // すべてのステージを次のステップとして表示
  };

  const getStageIcon = (stageId: number) => {
    const status = getStageStatus(stageId);
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5" />;
      case 'current':
      case 'next':
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStageColors = (stageId: number) => {
    const status = getStageStatus(stageId);
    const isSelected = stageId === currentStage;
    
    switch (status) {
      case 'completed':
        return isSelected
          ? 'bg-green-500 text-white border-green-500'
          : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30';
      case 'current':
        return isSelected
          ? 'bg-purple-500 text-white border-purple-500'
          : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30';
      case 'next':
        return isSelected
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30';
    }
  };

  const canClickStage = (stageId: number) => {
    return true; // すべてのステージを最初からクリック可能に
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">プロジェクト進行状況</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage, index) => {
          const isClickable = canClickStage(stage.id);
          const colors = getStageColors(stage.id);
          
          return (
            <div key={stage.id} className="relative">
              <Button
                variant="outline"
                onClick={() => isClickable && onStageClick(stage.id)}
                disabled={!isClickable}
                className={cn(
                  "w-full h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200",
                  colors
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                  {getStageIcon(stage.id)}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs opacity-80 mt-1">{stage.description}</div>
                </div>
              </Button>
              
              {/* Connection line */}
              {index < stages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-white/20 transform -translate-y-1/2 z-0" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-green-300" />
          </div>
          <span>完了</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Circle className="w-2.5 h-2.5 text-purple-300" />
          </div>
          <span>進行中</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Circle className="w-2.5 h-2.5 text-blue-300" />
          </div>
          <span>次のステップ</span>
        </div>
      </div>
    </div>
  );
}