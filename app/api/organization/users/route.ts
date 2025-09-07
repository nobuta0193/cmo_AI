import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // ユーザー認証の確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error', details: authError.message },
        { status: 401 }
      );
    }
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // ユーザーの組織IDを取得
    const { data: userOrg, error: userError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      console.error('User organization fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user organization', details: userError.message },
        { status: 500 }
      );
    }

    if (!userOrg?.organization_id) {
      return NextResponse.json(
        { error: 'User has no organization' },
        { status: 400 }
      );
    }

    // 組織のユーザー一覧を取得（usersテーブルから直接取得）
    const { data: organizationUsers, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('organization_id', userOrg.organization_id);

    if (usersError) {
      console.error('Organization users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch organization users', details: usersError.message },
        { status: 500 }
      );
    }

    // データを整形
    const users = organizationUsers?.map(user => ({
      id: user.id,
      full_name: user.full_name || '名前未設定',
      email: user.email || ''
    })) || [];

    return NextResponse.json(users);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
