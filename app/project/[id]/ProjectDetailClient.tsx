'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { WorkflowStepper } from '@/components/project/WorkflowStepper';
import { StageContent } from '@/components/project/StageContent';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock project data - will be replaced with Supabase data
const mockProject = {
  id: 1,
  name: "健康サプリメント春キャンペーン",
  description: "新商品「ビタミンDサプリ」のInstagram Reels用広告台本制作プロジェクト",
  stage: 3,
  status: "クリエイティブパーツ生成",
  tags: ["商品情報", "健康・美容"],
  createdAt: "2024-01-15",
  updatedAt: "2024-01-16",
  organizationId: "org-1",
  userId: "user-1"
};

const workflowStages = [
  { id: 1, name: '一次情報登録', description: '基本情報とデータを登録' },
  { id: 2, name: '商品情報サマリー', description: '商品の特徴とメリットを整理' },
  { id: 3, name: '教育コンテンツ', description: '顧客教育要素を抽出' },
  { id: 4, name: 'クリエイティブパーツ', description: '売れる要素を自動抽出' },
  { id: 5, name: '広告台本生成', description: '最終的な広告台本を生成' }
];

interface ProjectDetailClientProps {
  projectId: string;
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const [project, setProject] = useState(mockProject);
  const [currentStage, setCurrentStage] = useState(mockProject.stage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Load project data from Supabase
    const loadProject = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Project data would be loaded here using projectId
        console.log('Loading project:', projectId);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleStageChange = (stage: number) => {
    setCurrentStage(stage);
  };

  const handleStageComplete = (stage: number) => {
    if (stage === currentStage && stage < 5) {
      setCurrentStage(stage + 1);
      setProject(prev => ({ ...prev, stage: stage + 1 }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full bg-white/10" />
          <Skeleton className="h-16 w-full bg-white/10" />
          <Skeleton className="h-96 w-full bg-white/10" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProjectHeader project={project} />
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
          <WorkflowStepper
            stages={workflowStages}
            currentStage={currentStage}
            completedStage={project.stage}
            onStageClick={handleStageChange}
          />
        </Card>

        <StageContent
          projectId={project.id}
          stage={currentStage}
          onStageComplete={handleStageComplete}
        />
      </div>
    </DashboardLayout>
  );
}