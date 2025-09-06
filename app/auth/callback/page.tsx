'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;

        if (user) {
          // 組織の作成
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([
              { 
                name: user.user_metadata.organization_name || 'My Organization',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (orgError) throw orgError;

          // ユーザーと組織の紐付け
          const { error: linkError } = await supabase
            .from('user_organizations')
            .insert([
              { 
                user_id: user.id,
                organization_id: orgData.id,
                role: 'owner'
              }
            ]);

          if (linkError) throw linkError;
        }

        router.push('/dashboard');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/auth/signin');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">認証中...</h2>
        <p>しばらくお待ちください</p>
      </div>
    </div>
  );
}
