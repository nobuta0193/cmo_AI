'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { WorkflowStepper } from '@/components/project/WorkflowStepper';
import { StageContent } from '@/components/project/StageContent';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// プロジェクトの型定義
interface Project {
  id: string;
  name: string;
  description: string;
  stage: number;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  userId: string;
  assignee?: string;
  createdBy?: string;
  dueDate?: string;
  totalStages?: number;
}

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
  const [project, setProject] = useState<Project | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading project:', projectId);
        
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'プロジェクトの取得に失敗しました');
        }

        const projectData = await response.json();
        console.log('Project data loaded:', projectData);
        
        setProject(projectData);
        setCurrentStage(projectData.stage || 1);
      } catch (error) {
        console.error('Failed to load project:', error);
        setError(error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleStageChange = (stage: number) => {
    setCurrentStage(stage);
  };

  const handleStageComplete = async () => {
    // Reload project data to get updated stage
    if (projectId) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
          setCurrentStage(projectData.stage || 1);
        }
      } catch (error) {
        console.error('Failed to reload project:', error);
      }
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">エラーが発生しました</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">プロジェクトが見つかりません</h2>
            <p className="text-white/70">指定されたプロジェクトは存在しないか、アクセス権限がありません。</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleProjectUpdate = async () => {
    // プロジェクト情報を再読み込み
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      }
    } catch (error) {
      console.error('Failed to reload project:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProjectHeader project={project} onProjectUpdate={handleProjectUpdate} />
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
          <WorkflowStepper
            stages={workflowStages}
            currentStage={currentStage}
            completedStage={project.stage >= 6 ? 6 : Math.max(0, project.stage - 1)}
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