'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, ArrowLeft, Mail, Lock, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "パスワードエラー",
        description: "パスワードが一致しません。",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "利用規約への同意が必要です",
        description: "利用規約とプライバシーポリシーに同意してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      toast({
        title: "確認メールを送信しました",
        description: "メールを確認してアカウントを有効化してください。",
      });
      
      router.push('/auth/signin');
      
      toast({
        title: "アカウント作成完了",
        description: "確認メールを送信しました。メールを確認してアカウントを有効化してください。",
      });
      
      router.push('/auth/signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = "アカウントの作成に失敗しました。もう一度お試しください。";
      
      if (error.status === 429) {
        errorMessage = "しばらく時間をおいてから再度お試しください。";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "アカウント作成エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-gray-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CMO AI</span>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">新規登録</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              無料アカウントを作成して、AI台本生成を始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">お名前</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="田中 太郎"
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="example@company.com"
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-white">組織名</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="organization"
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => updateFormData('organizationName', e.target.value)}
                    placeholder="株式会社サンプル"
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="8文字以上"
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">パスワード確認</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData('acceptTerms', checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-300">
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300">利用規約</Link>
                  {' '}と{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300">プライバシーポリシー</Link>
                  に同意します
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {loading ? "アカウント作成中..." : "アカウント作成"}
              </Button>
            </form>

            <Separator className="bg-white/20" />

            <div className="text-center text-sm text-gray-400">
              既にアカウントをお持ちの方は{' '}
              <Link
                href="/auth/signin"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                ログイン
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}