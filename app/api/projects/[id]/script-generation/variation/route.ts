import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 環境変数の確認
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
  console.log('Fetching project data for variation generation, ID:', projectId);
  
  const supabase = createSupabaseClient();
  
  // 1. 一次情報を取得
  const { data: initialData, error: initialError } = await supabase
    .from('initial_data')
    .select('*')
    .eq('project_id', projectId);

  if (initialError) {
    console.error('Failed to fetch initial data:', initialError);
    throw new Error(`一次情報の取得に失敗しました: ${initialError.message}`);
  }

  // 2. 商品情報サマリーを取得
  const { data: productSummaryData, error: productError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'product_summary')
    .order('created_at', { ascending: false })
    .limit(1);

  if (productError) {
    console.error('Failed to fetch product summary:', productError);
    throw new Error(`商品情報サマリーの取得に失敗しました: ${productError.message}`);
  }

  // 3. 教育コンテンツサマリーを取得
  const { data: educationData, error: educationError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'education_content')
    .order('created_at', { ascending: false })
    .limit(1);

  if (educationError) {
    console.error('Failed to fetch education content:', educationError);
    throw new Error(`教育コンテンツサマリーの取得に失敗しました: ${educationError.message}`);
  }

  // 4. クリエイティブパーツを取得
  const { data: creativePartsData, error: creativeError } = await supabase
    .from('project_contents')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_type', 'creative_parts')
    .order('created_at', { ascending: false })
    .limit(1);

  if (creativeError) {
    console.error('Failed to fetch creative parts:', creativeError);
    throw new Error(`クリエイティブパーツの取得に失敗しました: ${creativeError.message}`);
  }

  return {
    initialData: initialData || [],
    productSummary: productSummaryData && productSummaryData.length > 0 ? productSummaryData[0].content : null,
    educationContent: educationData && educationData.length > 0 ? educationData[0].content : null,
    creativeParts: creativePartsData && creativePartsData.length > 0 ? creativePartsData[0].content : null,
  };
}

function buildVariationPrompt(projectData: ProjectData): string {
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
[ ショート動画広告台本バリエーション ]

重要事項：
- 台本は400文字以上で作成してください
- ショート動画（30秒程度）に適した構成にしてください
- 新規顧客獲得を最大化することを最優先に考慮してください
- 既存のバリエーションとは異なるアプローチや表現を使用してください
- 上記の全ての情報を総合的に活用して、魅力的で効果的な台本を作成してください`;

  return prompt;
}

async function generateVariationScript(prompt: string): Promise<string> {
  console.log('Generating variation script with AI - prompt length:', prompt.length);
  
  try {
    // サーバーサイドでは絶対URLを使用する必要がある
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/ai/generate`;
    
    console.log('Calling AI generate API at:', apiUrl);
    
    // AIクライアントを使った実際の生成を試行
    const response = await fetch(apiUrl, {
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
    
    console.log('AI generation failed');
  } catch (error) {
    console.log('AI generation error:', error);
  }
  
  // AI生成が失敗した場合、適切なエラーメッセージを返す
  throw new Error('AIバリエーション生成に失敗しました。API設定を確認するか、しばらく時間をおいて再度お試しください。');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('=== Script Variation Generation API Called ===');
  
  try {
    // 環境変数チェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500 }
      );
    }
    
    const projectId = id;
    console.log('Project ID:', projectId);
    
    if (!projectId) {
      throw new Error('プロジェクトIDが指定されていません');
    }

    console.log('Step 1: Fetching project data for variation...');
    
    // プロジェクトの全データを取得
    const projectData = await fetchProjectData(projectId);
    console.log('Step 2: Project data fetched successfully');

    console.log('Step 3: Building variation prompt...');
    // バリエーション用プロンプトを構築
    const prompt = buildVariationPrompt(projectData);
    console.log('Step 4: Variation prompt built, length:', prompt.length);

    console.log('Step 5: Generating variation script...');
    // AI台本生成（バリエーション）
    const generatedScript = await generateVariationScript(prompt);
    console.log('Step 6: Variation script generated, length:', generatedScript.length);

    const timestamp = Date.now();
    const scriptData = {
      id: `script_${timestamp}`,
      title: `バリエーション ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      content: generatedScript
    };

    console.log('Step 7: Returning variation script data');

    const response = {
      success: true,
      script: scriptData,
      prompt: prompt
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== Script Variation Generation Error ===');
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'バリエーション生成に失敗しました';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
