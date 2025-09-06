import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('GET /api/projects/[id]: Start', { projectId: params.id });
  
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

    // ユーザーの組織IDを取得
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

    // 個別プロジェクトを取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        assigned_to:users!projects_assigned_to_fkey(
          full_name
        ),
        created_by_user:users!projects_created_by_fkey(
          full_name
        )
      `)
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single();
      
    // プロジェクトのタグを取得
    const { data: projectTags } = await supabase
      .from('project_tags')
      .select(`
        tags (
          name
        )
      `)
      .eq('project_id', params.id);
      
    const tags = projectTags?.map(pt => pt.tags?.name).filter(Boolean) || [];

    console.log('Project query result:', {
      project: project?.id,
      error: projectError
    });

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project', details: projectError.message },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // プロジェクトのコンテンツを取得
    const { data: projectContents } = await supabase
      .from('project_contents')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    // 一次情報を取得
    const { data: initialData } = await supabase
      .from('initial_data')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    console.log('Project contents query result:', {
      contentCount: projectContents?.length || 0,
      contents: projectContents?.map(c => ({ id: c.id, stage_type: c.stage_type, is_selected: c.is_selected })),
      initialDataCount: initialData?.length || 0
    });

    // 各ステージのコンテンツを整理
    const contentByStage: { [key: string]: any } = {};
    
    if (projectContents) {
      for (const content of projectContents) {
        try {
          const parsedContent = content.content ? JSON.parse(content.content) : null;
          
          if (!contentByStage[content.stage_type]) {
            contentByStage[content.stage_type] = {
              stageType: content.stage_type,
              content: parsedContent,
              isSelected: content.is_selected,
              createdAt: content.created_at,
              updatedAt: content.updated_at
            };
          }
          
          // is_selectedがtrueのコンテンツがあれば優先
          if (content.is_selected) {
            contentByStage[content.stage_type] = {
              stageType: content.stage_type,
              content: parsedContent,
              isSelected: content.is_selected,
              createdAt: content.created_at,
              updatedAt: content.updated_at
            };
          }
        } catch (parseError) {
          console.error('Failed to parse content JSON:', parseError, content.content);
        }
      }
    }

    // 一次情報をコンテンツに追加
    if (initialData && initialData.length > 0) {
      contentByStage['initial_data'] = {
        stageType: 'initial_data',
        content: initialData,
        isSelected: true,
        createdAt: initialData[0].created_at,
        updatedAt: initialData[0].updated_at
      };
    }

    // プロジェクトデータを整形
    const formattedProject = {
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
      createdBy: project.created_by_user?.full_name || '不明',
      organizationId: project.organization_id,
      userId: project.created_by,
      tags: tags,
      // 各ステージのコンテンツを追加
      contents: contentByStage,
      // scriptステージのデータがあれば、それを直接含める（後方互換性のため）
      ...(contentByStage.script && {
        stageType: 'script',
        content: contentByStage.script.content
      })
    };

    console.log('Returning formatted project:', formattedProject);

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('PUT /api/projects/[id]: Start', { projectId: params.id });
  
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

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ユーザーの組織IDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json(
        { error: 'User organization not found' },
        { status: 400 }
      );
    }

    // リクエストボディを解析
    const body = await request.json();
    console.log('Update request body:', body);

    const { stage, status, content, stageType } = body;

    // プロジェクトの更新
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (stage !== undefined) updateData.stage = stage;
    if (status !== undefined) updateData.status = status;

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single();

    if (updateError) {
      console.error('Project update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update project', details: updateError.message },
        { status: 500 }
      );
    }

    // 一次情報の保存処理
    if (content && stageType === 'initial_data') {
      console.log('Saving initial data:', { contentLength: JSON.stringify(content).length });

      try {
        // 既存の一次情報を削除
        await supabase
          .from('initial_data')
          .delete()
          .eq('project_id', params.id);

        // 新しい一次情報を挿入
        const initialDataInserts = content.map((item: any) => ({
          project_id: params.id,
          title: item.title,
          content: item.content,
          data_type: item.type,
          created_by: user.id,
          last_edited_by: user.id,
        }));

        const { error: initialDataError } = await supabase
          .from('initial_data')
          .insert(initialDataInserts);

        if (initialDataError) {
          console.error('Initial data insert error:', initialDataError);
          return NextResponse.json(
            { error: 'Failed to save initial data', details: initialDataError.message },
            { status: 500 }
          );
        }

        console.log('Initial data saved successfully');
      } catch (error) {
        console.error('Initial data save error:', error);
        return NextResponse.json(
          { error: 'Failed to save initial data', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // プロジェクトコンテンツの保存（提供されている場合）
    if (content && stageType && stageType !== 'initial_data') {
      console.log('Saving project content:', { stageType, contentLength: JSON.stringify(content).length });

      // stageTypeを統一（script_generation -> script）
      const normalizedStageType = stageType === 'script_generation' ? 'script' : stageType;

      // 既存のコンテンツを確認
      const { data: existingContent } = await supabase
        .from('project_contents')
        .select('id')
        .eq('project_id', params.id)
        .eq('stage_type', normalizedStageType)
        .eq('is_selected', true)
        .single();

      if (existingContent) {
        // 既存のコンテンツを更新
        const { error: contentUpdateError } = await supabase
          .from('project_contents')
          .update({
            content: typeof content === 'string' ? content : JSON.stringify(content),
            updated_at: new Date().toISOString(),
            last_edited_by: user.id,
          })
          .eq('id', existingContent.id);

        if (contentUpdateError) {
          console.error('Content update error:', contentUpdateError);
        } else {
          console.log('Content updated successfully');
        }
      } else {
        // 新しいコンテンツを作成
        const { error: contentInsertError } = await supabase
          .from('project_contents')
          .insert({
            project_id: params.id,
            stage_type: normalizedStageType,
            content: typeof content === 'string' ? content : JSON.stringify(content),
            status: 'draft',
            is_ai_generated: false,
            is_selected: true,
            created_by: user.id,
            last_edited_by: user.id,
          });

        if (contentInsertError) {
          console.error('Content insert error:', contentInsertError);
        } else {
          console.log('Content inserted successfully');
        }
      }
    }

    console.log('Project updated successfully:', updatedProject);

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: 'プロジェクトが正常に更新されました'
    });

  } catch (error) {
    console.error('Unexpected error in PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('PATCH /api/projects/[id]: Start', { projectId: params.id });
  
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
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ユーザーの組織IDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json(
        { error: 'User organization not found' },
        { status: 400 }
      );
    }

    // リクエストボディを解析
    const body = await request.json();
    const { name, description, tags } = body;

    // プロジェクト情報の更新
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single();

    if (updateError) {
      console.error('Project update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update project', details: updateError.message },
        { status: 500 }
      );
    }

    // タグの更新（提供されている場合）
    if (tags !== undefined) {
      // 既存のプロジェクトタグを削除
      await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', params.id);

      if (tags.length > 0) {
        // 既存のタグを取得
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tags);

        const existingTagNames = existingTags?.map(tag => tag.name) || [];
        const newTags = tags.filter((tag: string) => !existingTagNames.includes(tag));

        // 新しいタグを作成
        if (newTags.length > 0) {
          await supabase
            .from('tags')
            .insert(newTags.map((name: string) => ({ name })));
        }

        // すべてのタグを取得
        const { data: allTags } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tags);

        // プロジェクトとタグを関連付け
        if (allTags) {
          await supabase
            .from('project_tags')
            .insert(allTags.map(tag => ({
              project_id: params.id,
              tag_id: tag.id
            })));
        }
      }
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: 'プロジェクト情報が正常に更新されました'
    });

  } catch (error) {
    console.error('Unexpected error in PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}