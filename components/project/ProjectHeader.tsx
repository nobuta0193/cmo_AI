'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Edit2, Copy, Trash2, Share2, Download } from 'lucide-react';

interface ProjectHeaderProps {
  project: {
    id: number;
    name: string;
    description: string;
    stage: number;
    status: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case '初期情報登録':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case '商品情報サマリー生成':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case '教育コンテンツ生成':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'クリエイティブパーツ生成':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case '広告台本生成完了':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleDuplicateProject = () => {
    // TODO: Implement project duplication
    console.log('Duplicate project:', project.id);
  };

  const handleDeleteProject = () => {
    // TODO: Implement project deletion
    console.log('Delete project:', project.id);
  };

  const handleShareProject = () => {
    // TODO: Implement project sharing
    console.log('Share project:', project.id);
  };

  const handleExportProject = () => {
    // TODO: Implement project export
    console.log('Export project:', project.id);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="text-gray-400 hover:text-white hover:bg-white/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">{project.name}</CardTitle>
              <p className="text-gray-400">{project.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/10 text-white">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>作成日: {new Date(project.createdAt).toLocaleDateString('ja-JP')}</span>
              <span>更新日: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}</span>
              <span>ステージ: {project.stage}/5</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" />
                プロジェクト編集
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateProject}>
                <Copy className="mr-2 h-4 w-4" />
                プロジェクト複製
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareProject}>
                <Share2 className="mr-2 h-4 w-4" />
                プロジェクト共有
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportProject}>
                <Download className="mr-2 h-4 w-4" />
                エクスポート
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                プロジェクト削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
}