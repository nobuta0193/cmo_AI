'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from './ProjectCard';

interface OrganizationUser {
  id: string;
  full_name: string;
  email: string;
}

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onProjectUpdated?: () => void;
}

export function EditProjectDialog({ open, onOpenChange, project, onProjectUpdated }: EditProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { toast } = useToast();

  // 組織のユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      
      setUsersLoading(true);
      try {
        const response = await fetch('/api/organization/users', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch users:', response.status, response.statusText, errorData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [open]);

  // プロジェクトデータが変更されたときにフォームを初期化
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setTags(project.tags || []);
      // 期日をYYYY-MM-DD形式に変換
      if (project.dueDate) {
        const date = new Date(project.dueDate);
        const formattedDate = date.toISOString().split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    }
  }, [project]);

  // ユーザー一覧が読み込まれた後に現在の担当者を設定
  useEffect(() => {
    if (project && users.length > 0) {
      // プロジェクトの担当者名から対応するユーザーIDを見つける
      const currentAssignee = users.find(user => user.full_name === project.assignee);
      setAssigneeId(currentAssignee?.id || '');
    }
  }, [project, users]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;
    
    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "プロジェクト名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
          tags: tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロジェクトの更新に失敗しました');
      }

      toast({
        title: "更新完了",
        description: "プロジェクト情報を更新しました。",
      });

      onOpenChange(false);
      onProjectUpdated?.();
    } catch (error) {
      console.error('Project update error:', error);
      toast({
        title: "更新エラー",
        description: error instanceof Error ? error.message : "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // フォームをリセット
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setTags(project.tags || []);
      // 担当者IDもリセット
      const currentAssignee = users.find(user => user.full_name === project.assignee);
      setAssigneeId(currentAssignee?.id || '');
      // 期日もリセット
      if (project.dueDate) {
        const date = new Date(project.dueDate);
        const formattedDate = date.toISOString().split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    }
    setNewTag('');
    onOpenChange(false);
  };

  // おすすめタグ
  const suggestedTags = [
    'ユーザー情報', '広告情報', 'B2B', 'B2C', 'EC',
    'ファッション', 'セール', '商品情報', '健康・美容', 'テック'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">プロジェクト編集</DialogTitle>
          <DialogDescription className="text-gray-400">
            プロジェクトの基本情報を編集できます
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              プロジェクト名 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プロジェクト名を入力"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">プロジェクト概要</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの概要を入力"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white">期日</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">担当者</Label>
            <Select value={assigneeId || "unassigned"} onValueChange={(value) => setAssigneeId(value === "unassigned" ? "" : value)} disabled={usersLoading}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={usersLoading ? "読み込み中..." : "担当者を選択"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">未割り当て</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{user.full_name}</span>
                      <span className="text-sm text-gray-500">({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">タグ</Label>
            
            {/* 現在のタグ */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-purple-500/30 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* おすすめタグ */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">おすすめタグ:</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.filter(tag => !tags.includes(tag)).map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTags([...tags, tag])}
                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 text-xs h-7"
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* カスタムタグ追加 */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="カスタムタグを追加"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
