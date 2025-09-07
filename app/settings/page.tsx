'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  User,
  Mail,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Key,
  Save,
  Camera,
  Settings as SettingsIcon,
  LogOut,
  Upload
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  username?: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  organization_name?: string;
  role: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });
  const router = useRouter();
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // ユーザープロフィール情報を取得
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url
        `)
        .eq('id', user.id)
        .single();

      // 組織情報を取得
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select(`
          role,
          organizations:organization_id(name)
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('プロフィール取得エラー:', profileError);
        toast({
          title: 'エラー',
          description: 'プロフィール情報の取得に失敗しました。',
          variant: 'destructive',
        });
        return;
      }

      const profileData = {
        ...(userProfile as any || {}),
        email: user.email || '',
        organization_name: (userOrg as any)?.organizations?.name || '未設定',
        role: (userOrg as any)?.role || 'member',
        organization_id: (userOrg as any)?.organizations?.id || null
      };

      setProfile(profileData);
      setFormData({
        full_name: (userProfile as any)?.full_name || '',
        email: user.email || '',
        avatar_url: (userProfile as any)?.avatar_url || ''
      });
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
      toast({
        title: 'エラー',
        description: 'プロフィール情報の読み込みに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Supabase Authのメタデータを更新
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url
        }
      });

      if (authError) {
        throw authError;
      }

      // profilesテーブルも更新
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (profileError) {
        throw profileError;
      }

      // ローカルステートを更新
      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url
      } : null);

      toast({
        title: '成功',
        description: 'プロフィールを更新しました。',
      });
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      toast({
        title: 'エラー',
        description: 'プロフィールの更新に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/auth/signin');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">設定</h1>
            <p className="text-gray-400 mt-1">アカウント情報とプリファレンスを管理</p>
          </div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* プロフィール情報 */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  プロフィール情報
                </CardTitle>
                <CardDescription className="text-gray-400">
                  あなたの基本情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* アバター */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                      {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700">
                        <Camera className="w-4 h-4 mr-2" />
                        画像を変更
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400">JPG、PNG形式、最大2MB</p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* フォーム */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">表示名</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="あなたの名前を入力"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-slate-700/30 border-slate-600 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400">メールアドレスは変更できません</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url" className="text-white">アバターURL（オプション）</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '変更を保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 組織情報 */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  組織情報
                </CardTitle>
                <CardDescription className="text-gray-400">
                  あなたが所属する組織の情報
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">組織名</Label>
                    <p className="text-gray-300 mt-1">{profile?.organization_name || '未設定'}</p>
                  </div>
                  <div>
                    <Label className="text-white">役割</Label>
                    <Badge variant="secondary" className="mt-1 bg-purple-600 text-white">
                      {profile?.role === 'admin' ? '管理者' : 
                       profile?.role === 'member' ? 'メンバー' : 
                       profile?.role === 'viewer' ? '閲覧者' : profile?.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アカウント情報 */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">アカウント情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">メール認証</span>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    確認済み
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">アカウント作成</span>
                  <span className="text-gray-300 text-sm">2024年1月</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">最終ログイン</span>
                  <span className="text-gray-300 text-sm">今日</span>
                </div>
              </CardContent>
            </Card>

            {/* プリファレンス */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">プリファレンス</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                  <Bell className="w-4 h-4 mr-2" />
                  通知設定
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                  <Shield className="w-4 h-4 mr-2" />
                  セキュリティ
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                  <Key className="w-4 h-4 mr-2" />
                  APIキー管理
                </Button>
              </CardContent>
            </Card>

            {/* ログアウト */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
