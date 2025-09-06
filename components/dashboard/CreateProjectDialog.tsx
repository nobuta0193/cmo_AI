'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestedTags = ['商品情報', 'ユーザー情報', '広告情報', 'B2B', 'B2C', 'EC', '健康・美容', 'ファッション', 'テック', 'セール'];

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    customTag: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "プロジェクト名が必要です",
        description: "プロジェクト名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Project creation failed:', error);
        throw new Error(error.details || error.error || 'プロジェクトの作成に失敗しました');
      }

      const project = await response.json();
      
      toast({
        title: "プロジェクト作成完了",
        description: "新しいプロジェクトが作成されました。",
      });
      
      // Close dialog first
      onOpenChange(false);
      
      // Reset form
      setFormData({ name: '', description: '', tags: [], customTag: '' });
      
      // Navigate to project detail page (5-stage workflow)
      router.push(`/project/${project.id}`);
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        customTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleCustomTagAdd = () => {
    if (formData.customTag.trim()) {
      addTag(formData.customTag.trim());
    }
  };

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">新規プロジェクト作成</DialogTitle>
          <DialogDescription className="text-gray-400">
            ショート動画広告台本制作の新しいプロジェクトを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-white">
              プロジェクト名 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="projectName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例: 春の新商品プロモーション"
              className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              プロジェクト概要
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="プロジェクトの目的や詳細を記述してください"
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white">タグ</Label>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
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

            {/* Suggested Tags */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">おすすめタグ:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter(tag => !formData.tags.includes(tag))
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

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                value={formData.customTag}
                onChange={(e) => setFormData(prev => ({ ...prev, customTag: e.target.value }))}
                onKeyPress={handleCustomTagKeyPress}
                placeholder="カスタムタグを追加"
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCustomTagAdd}
                disabled={!formData.customTag.trim()}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/30 text-white hover:bg-white/10"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              {loading ? "作成中..." : "プロジェクト作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}