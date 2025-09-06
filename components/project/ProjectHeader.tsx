'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Edit2, Copy, Trash2, Share2, Download, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description: string;
    stage: number;
    status: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
  onProjectUpdate?: () => void;
}

const suggestedTags = ['商品情報', 'ユーザー情報', '広告情報', 'B2B', 'B2C', 'EC', '健康・美容', 'ファッション', 'テック', 'セール'];

export function ProjectHeader({ project, onProjectUpdate }: ProjectHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    description: project.description,
    tags: project.tags || [],
    customTag: '',
  });
  const [loading, setLoading] = useState(false);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const addTag = (tag: string) => {
    if (tag && !editFormData.tags.includes(tag)) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        customTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleCustomTagAdd = () => {
    if (editFormData.customTag.trim()) {
      addTag(editFormData.customTag.trim());
    }
  };

  const handleEditProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          tags: editFormData.tags,
        }),
      });

      if (!response.ok) {
        throw new Error('プロジェクトの更新に失敗しました');
      }

      toast({
        title: "更新完了",
        description: "プロジェクト情報が更新されました。",
      });

      setIsEditDialogOpen(false);
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <>
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側: プロジェクト基本情報 */}
            <div className="lg:col-span-2 space-y-4">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="text-gray-400 hover:text-white hover:bg-white/10 -ml-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Button>
              
              <div className="space-y-3">
                <CardTitle className="text-2xl text-white">{project.name}</CardTitle>
                
                {/* タグ表示 */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>作成日: {new Date(project.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span>更新日: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}</span>
                  <span>ステージ: {project.stage}/5</span>
                </div>
              </div>
            </div>

            {/* 右側: プロジェクト概要と操作 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">プロジェクト概要</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
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
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {project.description || 'プロジェクトの概要が入力されていません。'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">プロジェクト編集</DialogTitle>
            <DialogDescription className="text-gray-400">
              プロジェクトの基本情報を編集できます
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* プロジェクト名 */}
            <div className="space-y-2">
              <Label htmlFor="editProjectName" className="text-white">
                プロジェクト名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="editProjectName"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>

            {/* プロジェクト概要 */}
            <div className="space-y-2">
              <Label htmlFor="editDescription" className="text-white">
                プロジェクト概要
              </Label>
              <Textarea
                id="editDescription"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="プロジェクトの目的や詳細を記述してください"
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                rows={4}
              />
            </div>

            {/* タグ編集 */}
            <div className="space-y-4">
              <Label className="text-white">タグ</Label>
              
              {/* 選択済みタグ */}
              {editFormData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editFormData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-red-500/20"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* おすすめタグ */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400">おすすめタグ:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !editFormData.tags.includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="border-white/30 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))
                  }
                </div>
              </div>

              {/* カスタムタグ入力 */}
              <div className="flex gap-2">
                <Input
                  value={editFormData.customTag}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, customTag: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                  placeholder="カスタムタグを追加"
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCustomTagAdd}
                  disabled={!editFormData.customTag.trim()}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 操作ボタン */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleEditProject}
                disabled={loading || !editFormData.name.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {loading ? "更新中..." : "更新"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}