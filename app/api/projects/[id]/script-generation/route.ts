import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 環境変数の確認（エラーをAPIレスポンスで返すように変更）
function createSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

interface ProjectData {
  initialData: any[];
  productSummary: any;
  educationContent: any;
  creativeParts: any;
}

async function fetchProjectData(projectId: string): Promise<ProjectData> {
  console.log('Fetching project data for ID:', projectId);
  
  const supabase = createSupabaseClient();
  
  // 1. 一次情報を取得
  console.log('Fetching initial data...');
  const { data: initialData, error: initialError } = await supabase
    .from('initial_data')
    .select('*')
    .eq('project_id', projectId);

  if (initialError) {
    console.error('Failed to fetch initial data:', {
      error: initialError,
      projectId,
      code: initialError.code,
      message: initialError.message
    });
    throw new Error(`一次情報の取得に失敗しました: ${initialError.message}`);
  }

  console.log('Initial data fetched:', {
    count: initialData?.length || 0,
    data: initialData
  });

  // 2. 商品情報サマリーを取得
  console.log('Fetching product summary...');
  const { data: productSummaryData, error: productError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'product_summary')
    .order('created_at', { ascending: false })
    .limit(1);

  if (productError) {
    console.error('Failed to fetch product summary:', {
      error: productError,
      projectId,
      code: productError.code,
      message: productError.message
    });
    throw new Error(`商品情報サマリーの取得に失敗しました: ${productError.message}`);
  }

  console.log('Product summary fetched:', {
    count: productSummaryData?.length || 0,
    hasContent: productSummaryData && productSummaryData.length > 0
  });

  // 3. 教育コンテンツサマリーを取得
  console.log('Fetching education content...');
  const { data: educationData, error: educationError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'education_content')
    .order('created_at', { ascending: false })
    .limit(1);

  if (educationError) {
    console.error('Failed to fetch education content:', {
      error: educationError,
      projectId,
      code: educationError.code,
      message: educationError.message
    });
    throw new Error(`教育コンテンツサマリーの取得に失敗しました: ${educationError.message}`);
  }

  console.log('Education content fetched:', {
    count: educationData?.length || 0,
    hasContent: educationData && educationData.length > 0
  });

  // 4. クリエイティブパーツを取得
  console.log('Fetching creative parts...');
  const { data: creativePartsData, error: creativeError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'creative_parts')
    .order('created_at', { ascending: false })
    .limit(1);

  if (creativeError) {
    console.error('Failed to fetch creative parts:', {
      error: creativeError,
      projectId,
      code: creativeError.code,
      message: creativeError.message
    });
    throw new Error(`クリエイティブパーツの取得に失敗しました: ${creativeError.message}`);
  }

  console.log('Creative parts fetched:', {
    count: creativePartsData?.length || 0,
    hasContent: creativePartsData && creativePartsData.length > 0
  });

  const result = {
    initialData: initialData || [],
    productSummary: productSummaryData && productSummaryData.length > 0 ? productSummaryData[0].content : null,
    educationContent: educationData && educationData.length > 0 ? educationData[0].content : null,
    creativeParts: creativePartsData && creativePartsData.length > 0 ? creativePartsData[0].content : null,
  };

  console.log('Final project data result:', {
    hasInitialData: result.initialData.length > 0,
    hasProductSummary: !!result.productSummary,
    hasEducationContent: !!result.educationContent,
    hasCreativeParts: !!result.creativeParts,
  });

  return result;
}

function buildPrompt(projectData: ProjectData, customInstructions?: string): string {
  const { initialData, productSummary, educationContent, creativeParts } = projectData;

  // 一次情報をテキストに整理
  const initialDataText = initialData.map(item => 
    `【${item.title}】\n種類: ${item.data_type}\n内容: ${item.content || item.url || '添付ファイル'}`
  ).join('\n\n');

  const prompt = `# 1.指示
あなたの任務は、AI-CWとして、新規顧客獲得数を最大化させる最高のショート動画広告の台本を執筆してください。
AIであるあなたの能力を最大限活かして、センスいい表現を期待しています。

# 2.ペルソナ
[ AI-CW ]

# 3.プロジェクト情報

## 一次情報（登録済みデータ）
${initialDataText}

## 商品情報サマリー
${productSummary || '商品情報サマリーが未生成です'}

## 教育コンテンツサマリー
${educationContent || '教育コンテンツサマリーが未生成です'}

## クリエイティブパーツ
${creativeParts || 'クリエイティブパーツが未生成です'}

${customInstructions ? `\n## 追加指示\n${customInstructions}` : ''}

# 4.憑依する話者ペルソナ
[ 上記の商品情報とターゲット層を踏まえて、最適な話者ペルソナを設定してください ]

# 5.ヒット構成/クリエイティブパーツ要素マスター
[ 上記のクリエイティブパーツを参照し、効果的な構成要素を活用してください ]

# 6.出力フォーマット

**【商品名】**
[ 商品名を記載 ]

**【話者ペルソナ】**
[ 憑依する話者の詳細設定を記載 ]

**【構成パターン】**
[ 選択した構成アプローチを記載 ]

**【台本】**
[ 400文字以上の完成した台本をここに記載 ]

# 7.出力先
[ ショート動画広告台本 ]

重要事項：
- 台本は400文字以上で作成してください
- ショート動画（30秒程度）に適した構成にしてください
- 新規顧客獲得を最大化することを最優先に考慮してください
- 上記の全ての情報を総合的に活用して、魅力的で効果的な台本を作成してください`;

  return prompt;
}

async function generateScript(prompt: string): Promise<string> {
  console.log('Attempting AI script generation - prompt length:', prompt.length);
  
  try {
    // AIクライアントを使った実際の生成を試行
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gemini-1.5-flash' // デフォルトモデル
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.content) {
        console.log('AI generation successful');
        return result.content;
      }
    }
    
    console.log('AI generation failed, checking for project data...');
  } catch (error) {
    console.log('AI generation error:', error);
  }
  
  // AI生成が失敗した場合、適切なエラーメッセージを返す
  throw new Error('AI台本生成に失敗しました。API設定を確認するか、しばらく時間をおいて再度お試しください。');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('=== Script Generation API Called ===');
  
  try {
    // 環境変数チェック
    console.log('Checking environment variables...');
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is missing');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL is not configured. Please set this environment variable.' },
        { status: 500 }
      );
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured. Please set this environment variable.' },
        { status: 500 }
      );
    }
    
    const supabase = createSupabaseClient();
    
    const projectId = id;
    console.log('Project ID:', projectId);
    
    if (!projectId) {
      throw new Error('プロジェクトIDが指定されていません');
    }

    let customInstructions = '';
    try {
      const body = await request.json();
      customInstructions = body.customInstructions || '';
      console.log('Custom instructions:', customInstructions);
    } catch (jsonError) {
      console.log('No JSON body or empty body');
    }

    console.log('Step 1: Fetching project data...');
    
    // プロジェクトの全データを取得
    const projectData = await fetchProjectData(projectId);
    console.log('Step 2: Project data fetched successfully:', {
      hasInitialData: projectData.initialData.length > 0,
      initialDataCount: projectData.initialData.length,
      hasProductSummary: !!projectData.productSummary,
      hasEducationContent: !!projectData.educationContent,
      hasCreativeParts: !!projectData.creativeParts,
    });

    console.log('Step 3: Building prompt...');
    // プロンプトを構築
    const prompt = buildPrompt(projectData, customInstructions);
    console.log('Step 4: Prompt built, length:', prompt.length);

    console.log('Step 5: Generating script...');
    // AI台本生成
    const generatedScript = await generateScript(prompt);
    console.log('Step 6: Script generated, length:', generatedScript.length);

    console.log('Step 7: Preparing to save to database...');
    
    // プロジェクトの作成者を取得（既存のプロジェクトから）
    const { data: projectInfo, error: projectError } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectInfo) {
      console.error('Failed to get project info:', projectError);
      throw new Error('プロジェクト情報の取得に失敗しました');
    }
    
    const userId = projectInfo.created_by;
    const timestamp = Date.now();
    
    console.log('Using user ID from project:', userId);

    const scriptData = {
      scripts: [{
        id: `script_${timestamp}`,
        title: 'バリエーション A',
        content: generatedScript
      }],
      selectedScript: `script_${timestamp}`,
      evaluation: null
    };

    console.log('Step 8: Saving to Supabase...');
    const { data: newContent, error: saveError } = await supabase
      .from('project_contents')
      .insert([{
        project_id: projectId,
        stage_type: 'script',
        content: scriptData,
        status: 'draft',
        is_ai_generated: true,
        created_by: userId,
        last_edited_by: userId,
      }])
      .select('id')
      .single();

    if (saveError) {
      console.error('Supabase save error details:', {
        error: saveError,
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint
      });
      throw new Error(`台本の保存に失敗しました: ${saveError.message}`);
    }

    console.log('Step 9: Script saved successfully with ID:', newContent?.id);

    const response = {
      success: true,
      content: generatedScript,
      contentId: newContent?.id,
      scriptData
    };

    console.log('Step 10: Returning success response');
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== Script Generation Error ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorMessage = error instanceof Error ? error.message : '台本生成に失敗しました';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
