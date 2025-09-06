import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('GET /api/projects: Start');
  
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
    console.log('Auth check result:', { user: user?.id, error: authError });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // ユーザーの組織IDを取得（RLSが無効なので直接アクセス可能）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    console.log('User data query result:', { userData, error: userError });

    if (userError) {
      console.error('User data fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userError.message },
        { status: 500 }
      );
    }

    if (!userData?.organization_id) {
      console.error('User has no organization');
      return NextResponse.json(
        { error: 'User has no organization' },
        { status: 400 }
      );
    }

    // プロジェクト一覧を取得
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        assigned_to:users!projects_assigned_to_fkey(
          full_name
        )
      `)
      .eq('organization_id', userData.organization_id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    console.log('Projects query result:', {
      count: projects?.length,
      error: projectsError,
      sql: projectsError?.message
    });

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: projectsError.message },
        { status: 500 }
      );
    }

    // プロジェクトデータを整形
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status || '初期情報登録',
      stage: project.stage || 1,
      totalStages: project.total_stages || 5,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      dueDate: project.due_date || project.created_at,
      assignee: project.assigned_to?.full_name || '未割り当て',
      lastEditor: userData.full_name,
      tags: [], // TODO: タグ情報を取得
      teamMembers: 1 // TODO: チームメンバー数を取得
    }));

    console.log('Returning formatted projects:', {
      count: formattedProjects.length,
      sample: formattedProjects[0]
    });

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}