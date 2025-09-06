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

    // ユーザーのプロフィール情報を取得
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // ユーザーの組織IDを取得
    const { data: userOrg, error: userError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    console.log('User data query result:', { userProfile, userOrg, profileError, userError });

    if (profileError || userError) {
      console.error('User data fetch error:', { profileError, userError });
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: profileError?.message || userError?.message },
        { status: 500 }
      );
    }

    if (!userOrg?.organization_id) {
      console.error('User has no organization');
      return NextResponse.json(
        { error: 'User has no organization' },
        { status: 400 }
      );
    }

    // プロジェクト一覧を取得
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
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

    // すべてのプロジェクトのタグを一度に取得
    const projectIds = projects.map(p => p.id);
    const { data: allProjectTags } = await supabase
      .from('project_tags')
      .select(`
        project_id,
        tags (
          name
        )
      `)
      .in('project_id', projectIds);

    // プロジェクトごとのタグマップを作成
    const tagsMap = new Map<string, string[]>();
    allProjectTags?.forEach(pt => {
      if (pt.tags?.name) {
        if (!tagsMap.has(pt.project_id)) {
          tagsMap.set(pt.project_id, []);
        }
        tagsMap.get(pt.project_id)!.push(pt.tags.name);
      }
    });

    // 担当者の名前をprofilesテーブルから取得
    const assigneeIds = projects.map(p => p.assigned_to).filter(Boolean);
    const { data: assigneeProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', assigneeIds);

    // 担当者名のマップを作成
    const assigneeMap = new Map<string, string>();
    assigneeProfiles?.forEach(profile => {
      assigneeMap.set(profile.id, profile.full_name || '名前未設定');
    });

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
      assignee: project.assigned_to ? (assigneeMap.get(project.assigned_to) || '名前未設定') : '未割り当て',
      lastEditor: userProfile.full_name || '不明',
      tags: tagsMap.get(project.id) || [],
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