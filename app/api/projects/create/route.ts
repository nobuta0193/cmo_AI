import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
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

    // リクエストボディの取得
    const { name, description, tags } = await request.json();

    // プロジェクト名のバリデーション
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Invalid project name', details: 'Project name must be between 3 and 100 characters' },
        { status: 400 }
      );
    }

    // ユーザーの組織IDを取得
    const { data: userData, error: userError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userError.message },
        { status: 500 }
      );
    }

    if (!userData?.organization_id) {
      return NextResponse.json(
        { error: 'User has no organization' },
        { status: 400 }
      );
    }

    // プロジェクトの作成
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description: description || '',
          status: 'active',
          organization_id: userData.organization_id,
          created_by: user.id,
          assigned_to: user.id,
          stage: 1,
          total_stages: 5
        }
      ])
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError.message },
        { status: 500 }
      );
    }

    // デフォルトのプロジェクトコンテンツを作成
    const stageTypes = ['product_summary', 'education_content', 'creative_parts', 'script'];
    const contentPromises = stageTypes.map(stageType => 
      supabase
        .from('project_contents')
        .insert({
          project_id: project.id,
          stage_type: stageType,
          content: '',
          status: 'draft',
          created_by: user.id
        })
    );

    const contentResults = await Promise.all(contentPromises);
    const contentErrors = contentResults.filter(result => result.error);

    if (contentErrors.length > 0) {
      console.error('Content creation errors:', contentErrors);
      return NextResponse.json(
        { error: 'Failed to create project contents', details: contentErrors[0]?.error?.message || 'Unknown error' },
        { status: 500 }
      );
    }

    // タグの作成と関連付け
    if (tags && tags.length > 0) {
      // 既存のタグを取得
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tags);

      const existingTagNames = (existingTags as any)?.map((tag: any) => tag.name) || [];
      const newTags = (tags as string[]).filter((tag: string) => !existingTagNames.includes(tag));

      // 新しいタグを作成
      if (newTags.length > 0) {
        const { error: tagError } = await supabase
          .from('tags')
          .insert(newTags.map(name => ({ name })));

        if (tagError) {
          console.error('Tag creation error:', tagError);
        }
      }

      // プロジェクトとタグを関連付け
      const { data: allTags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tags);

      if (allTags) {
        const { error: tagLinkError } = await supabase
          .from('project_tags')
          .insert(allTags.map(tag => ({
            project_id: project.id,
            tag_id: tag.id
          })));

        if (tagLinkError) {
          console.error('Tag linking error:', tagLinkError);
        }
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Unexpected error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}