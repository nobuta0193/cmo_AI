'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, Users, MoreVertical, Edit2, Copy, Trash2, Play, Calendar, User } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  stage: number;
  totalStages: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  assignee: string;
  lastEditor: string;
  tags: string[];
  teamMembers: number;
  scriptVariants?: {
    count: number;
    selectedVariant?: string;
    variants: string[];
    lastUpdated: string;
  };
}

interface ProjectCardProps {
  project: Project;
  viewMode?: 'large' | 'medium' | 'small' | 'list';
}

export function ProjectCard({ project, viewMode = 'large' }: ProjectCardProps) {
  const router = useRouter();
  // 進捗は「完了したステージ数 / 総ステージ数」で計算
  // project.stageは現在実行中のステージなので、完了ステージ数は stage - 1
  // ただし、stage >= 6（全完了）の場合は全ステージ完了とする
  const completedStages = project.stage >= 6 ? project.totalStages : Math.max(0, project.stage - 1);
  const progress = (completedStages / project.totalStages) * 100;

  const VariantInfo = ({ variants }: { variants: ProjectCardProps['project']['scriptVariants'] }) => {
    if (!variants) return null;

    return (
      <div className="text-xs text-gray-400 mt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            バリエーション: {variants.variants.join(', ')}生成済み
            {variants.count > 0 && ` (${variants.count}個)`}
          </span>
          <span className="text-gray-500">|</span>
          <span>
            選択中: {variants.selectedVariant || '未選択'}
          </span>
          <span className="text-gray-500">|</span>
          <span>
            最終更新: {new Date(variants.lastUpdated).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>
    );
  };

  const getStageColor = (stage: number, totalStages: number) => {
    const progress = stage / totalStages;
    if (progress >= 1) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    } else if (progress >= 0.6) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    } else if (progress >= 0.4) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const handleOpenProject = () => {
    router.push(`/project/${project.id}`);
  };

  const handleDuplicateProject = () => {
    // TODO: Implement project duplication
    console.log('Duplicate project:', project.id);
  };

  const handleDeleteProject = () => {
    // TODO: Implement project deletion
    console.log('Delete project:', project.id);
  };

  // List view - horizontal layout
  if (viewMode === 'list') {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="space-y-1">
                <h3 className="text-white font-medium text-sm">{project.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-1">{project.description}</p>
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={getStageColor(project.stage, project.totalStages) + " text-xs"}>
                ステージ {project.stage}/{project.totalStages}
                {project.scriptVariants && project.stage === project.totalStages && ` (${project.scriptVariants.count}バリエーション)`}
              </Badge>
              
              <div className="text-xs text-gray-400 min-w-[80px]">
                {completedStages}/{project.totalStages} 完了
                {project.scriptVariants?.selectedVariant && (
                  <span className="ml-1 text-green-400">| 選択: {project.scriptVariants.selectedVariant}</span>
                )}
              </div>
              
              <div className="text-xs text-gray-400 min-w-[60px]">
                {project.assignee}
              </div>
              
              <div className="text-xs text-gray-400 min-w-[80px]">
                {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
              </div>
              
              <Button
                onClick={handleOpenProject}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                開く
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Small view - compact card
  if (viewMode === 'small') {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-white text-sm leading-tight line-clamp-2">{project.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-white/10 w-6 h-6"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenProject}>
                  <Play className="mr-2 h-3 w-3" />
                  開く
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicateProject}>
                  <Copy className="mr-2 h-3 w-3" />
                  複製
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Badge className={getStageColor(project.stage, project.totalStages) + " text-xs"}>
            ステージ {project.stage}/{project.totalStages}
            {project.scriptVariants && project.stage === project.totalStages && ` (${project.scriptVariants.count}バリエーション)`}
          </Badge>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">進捗</span>
              <span className="text-white">
                {completedStages}/{project.totalStages}
                {project.scriptVariants?.selectedVariant && (
                  <span className="ml-1 text-green-400">| 選択: {project.scriptVariants.selectedVariant}</span>
                )}
              </span>
            </div>
            <Progress value={progress} className="h-1" />
            {project.scriptVariants && project.status === '広告台本生成完了' && (
              <div className="text-xs text-gray-400">
                バリエーション: {project.scriptVariants.variants.join(', ')}
              </div>
            )}
          </div>

          <Button
            onClick={handleOpenProject}
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-xs py-1"
          >
            開く
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Medium view - reduced content
  if (viewMode === 'medium') {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-white text-base leading-tight line-clamp-2">{project.name}</CardTitle>
              <CardDescription className="text-gray-400 text-sm line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenProject}>
                  <Play className="mr-2 h-4 w-4" />
                  開く
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicateProject}>
                  <Copy className="mr-2 h-4 w-4" />
                  複製
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={getStageColor(project.stage, project.totalStages)}>
                ステージ {project.stage}/{project.totalStages}
                {project.scriptVariants && project.stage === project.totalStages && ` (${project.scriptVariants.count}バリエーション)`}
              </Badge>
              <span className="text-xs text-gray-400">
                {completedStages}/{project.totalStages} 完了
                {project.scriptVariants?.selectedVariant && (
                  <span className="ml-1 text-green-400">| 選択: {project.scriptVariants.selectedVariant}</span>
                )}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {project.scriptVariants && project.status === '広告台本生成完了' && (
              <VariantInfo variants={project.scriptVariants} />
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{project.assignee}</span>
            <span>{new Date(project.updatedAt).toLocaleDateString('ja-JP')}</span>
          </div>

          <Button
            onClick={handleOpenProject}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            プロジェクトを開く
            <Play className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Large view - original full card (default)
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-white text-lg leading-tight">{project.name}</CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-white/10"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenProject}>
                <Play className="mr-2 h-4 w-4" />
                プロジェクトを開く
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateProject}>
                <Copy className="mr-2 h-4 w-4" />
                複製
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" />
                編集
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.map((tag) => (
              <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStageColor(project.stage, project.totalStages)}>
              ステージ {project.stage}/{project.totalStages}
              {project.scriptVariants && project.stage === project.totalStages && ` (${project.scriptVariants.count}バリエーション)`}
            </Badge>
            <span className="text-xs text-gray-400">
              {completedStages}/{project.totalStages} 完了
              {project.scriptVariants?.selectedVariant && (
                <span className="ml-1 text-green-400">| 選択: {project.scriptVariants.selectedVariant}</span>
              )}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {project.scriptVariants && project.status === '広告台本生成完了' && (
            <VariantInfo variants={project.scriptVariants} />
          )}
        </div>

        {/* Project Details */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{project.assignee}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{project.teamMembers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(project.updatedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>期日: {new Date(project.dueDate).toLocaleDateString('ja-JP')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>最終編集: {project.lastEditor}</span>
          </div>
        </div>
        {/* Action Button */}
        <Button
          onClick={handleOpenProject}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 mt-4"
        >
          プロジェクトを開く
          <Play className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}