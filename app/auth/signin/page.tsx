'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sparkles, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "ログイン成功",
        description: "ダッシュボードにリダイレクトします...",
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "ログインエラー",
        description: error.message || "メールアドレスまたはパスワードが正しくありません。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-2xl text-white text-center">ログイン</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              アカウントにログインして、台本制作を開始しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                パスワードを忘れた方はこちら
              </Link>
            </div>

            <Separator className="bg-white/20" />

            <div className="text-center text-sm text-gray-400">
              アカウントをお持ちでない方は{' '}
              <Link
                href="/auth/signup"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                新規登録
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}