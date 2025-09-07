import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const CREATIVE_PARTS_PROMPT = `# 1.指示
あなたの任務は、AI-CWとして、「03.参照情報」を元に、広告コミュニケーションに使える表現のパーツを量産することです。
パーツの項目は「4,パーツ項目」を参照して、各項目について考えられる限り多くの表現パーツを生成してください。

# 2,ペルソナ

[ AI-CW ]

# 3.プロジェクト情報

## 初期データ
{initial_data}

## 商品情報サマリー
{product_summary}

## 教育コンテンツサマリー
{education_content}

# 4,クリエイティブパーツ要素マスター

## 悩み指摘フレーズ
- ターゲットが抱える課題や痛みを指摘する表現
- 身体的、精神的、生活習慣の悩みなど多角的にアプローチ
- 「最近〜と感じませんか？」「〜でお困りではありませんか？」などの形式

## ターゲット属性指定
- メインターゲットとサブターゲットの詳細設定
- 年齢、性別、職業、ライフスタイル、価値観
- 年収、居住地、情報収集方法、購買行動パターン

## 現在行動否定
- ターゲットが現在行っている間違った対処法を指摘
- 「〜だけでは不十分」「実は〜は逆効果」などの表現
- 従来の常識や思い込みを覆す内容

## 悩み原因解説
- 根本的な原因の科学的・論理的説明
- 現代社会の構造的問題との関連
- 見えないリスクや将来への影響

## 商品コンセプト説明
- 商品の独自価値提案（UVP）
- 他社との差別化ポイント
- 提供価値の明確化（健康価値、時間価値、経済価値、安心価値）
- ブランドメッセージ

# 5,パーツ出力形式

### **Part 1: 悩み指摘フレーズ**

#### **【要素1】 身体的な悩み**

  **[見出し]**　テキスト

#### **【要素2】 精神的な悩み**

  **[見出し]**　テキスト

#### **【要素3】 生活習慣の悩み**

  **[見出し]**　テキスト

### **Part 2: ターゲット属性指定**

#### **【要素1】 メインターゲット**

  **[見出し]**　テキスト

#### **【要素2】 サブターゲット**

  **[見出し]**　テキスト

#### **【要素3】 共通属性**

  **[見出し]**　テキスト

### **Part 3: 現在行動否定**

#### **【要素1】 間違った対処法**

  **[見出し]**　テキスト

#### **【要素2】 一時的な対策の限界**

  **[見出し]**　テキスト

### **Part 4: 悩み原因解説**

#### **【要素1】 根本原因の科学的説明**

  **[見出し]**　テキスト

#### **【要素2】 現代社会の構造的問題**

  **[見出し]**　テキスト

#### **【要素3】 見えないリスク**

  **[見出し]**　テキスト

### **Part 5: 商品コンセプト説明**

#### **【要素1】 独自価値提案**

  **[見出し]**　テキスト

#### **【要素2】 差別化ポイント**

  **[見出し]**　テキスト

#### **【要素3】 提供価値の明確化**

  **[見出し]**　テキスト

#### **【要素4】 ブランドメッセージ**

  **[見出し]**　テキスト

# 6,出力先

マークダウン形式で出力してください。各パーツは具体的で実用的な表現を豊富に含めてください。商品の特性と教育コンテンツの内容を踏まえて、広告に直接使える表現を生成してください。`;

async function generateCreativeParts(
  initialData: any[], 
  productSummary: string,
  educationContent: string,
  aiApiKey: string, 
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  try {
    // 初期データの整理
    const processedInitialData = initialData.map(item => ({
      title: item.title,
      content: item.content,
      data_type: item.data_type,
      url: item.url
    }));

    // プロンプトに情報を埋め込み
    const fullPrompt = CREATIVE_PARTS_PROMPT
      .replace('{initial_data}', JSON.stringify(processedInitialData, null, 2))
      .replace('{product_summary}', productSummary)
      .replace('{education_content}', educationContent);

    console.log('Creative parts generation prompt prepared');

    let response: Response;

    if (model.includes('gemini')) {
      // Gemini API呼び出し
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected Gemini response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } else if (model.includes('gpt')) {
      // OpenAI API呼び出し
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: 8000,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected OpenAI response structure:', data);
        throw new Error('Invalid response from OpenAI API');
      }

      return data.choices[0].message.content;
    } else if (model.includes('claude')) {
      // Claude API呼び出し
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 8000,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.content?.[0]?.text) {
        console.error('Unexpected Claude response structure:', data);
        throw new Error('Invalid response from Claude API');
      }

      return data.content[0].text;
    } else if (model.includes('deepseek')) {
      // DeepSeek API呼び出し
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: 8000,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error response:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected DeepSeek response structure:', data);
        throw new Error('Invalid response from DeepSeek API');
      }

      return data.choices[0].message.content;
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error('Error generating creative parts:', error);
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('POST /api/projects/[id]/creative-parts: Start', { 
    projectId: params.id,
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url
  });
  
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
      console.error('Authentication failed:', { authError, user: !!user });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', { userId: user.id, email: user.email });

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

    // プロジェクトの存在確認と権限チェック
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, created_by, organization_id')
      .eq('id', params.id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (projectError || !project) {
      console.error('Project not found or access denied:', projectError);
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // 初期データの取得
    const { data: initialData, error: initialDataError } = await supabase
      .from('initial_data')
      .select('title, content, data_type, url')
      .eq('project_id', params.id);

    if (initialDataError) {
      console.error('Failed to fetch initial data:', initialDataError);
      return NextResponse.json(
        { error: 'Failed to fetch initial data' },
        { status: 500 }
      );
    }

    if (!initialData || initialData.length === 0) {
      return NextResponse.json(
        { error: '初期データが登録されていません。ステージ1で初期データを登録してください。' },
        { status: 400 }
      );
    }

    // 初期データの内容チェック
    const hasValidInitialData = initialData.some(item => 
      item.content && item.content.trim() !== ''
    );
    
    if (!hasValidInitialData) {
      return NextResponse.json(
        { error: '初期データの内容が空です。ステージ1で有効なデータを登録してください。' },
        { status: 400 }
      );
    }

    // 商品情報サマリーの取得
    const { data: productSummaryData, error: productSummaryError } = await supabase
      .from('project_contents')
      .select('content')
      .eq('project_id', params.id)
      .eq('stage_type', 'product_summary')
      .order('created_at', { ascending: false })
      .limit(1);

    if (productSummaryError) {
      console.error('Failed to fetch product summary:', productSummaryError);
      return NextResponse.json(
        { error: 'Failed to fetch product summary' },
        { status: 500 }
      );
    }

    if (!productSummaryData || productSummaryData.length === 0) {
      return NextResponse.json(
        { error: 'ステージ2の商品情報サマリーが見つかりません。先にステージ2を完了してください。' },
        { status: 400 }
      );
    }

    const productSummary = productSummaryData[0].content;

    // 商品情報サマリーの内容チェック
    if (!productSummary || productSummary.trim() === '') {
      return NextResponse.json(
        { error: 'ステージ2の商品情報サマリーが空です。先にステージ2でコンテンツを生成してください。' },
        { status: 400 }
      );
    }

    // 教育コンテンツサマリーの取得
    const { data: educationContentData, error: educationContentError } = await supabase
      .from('project_contents')
      .select('content')
      .eq('project_id', params.id)
      .eq('stage_type', 'education_content')
      .order('created_at', { ascending: false })
      .limit(1);

    if (educationContentError) {
      console.error('Failed to fetch education content:', educationContentError);
      return NextResponse.json(
        { error: 'Failed to fetch education content' },
        { status: 500 }
      );
    }

    if (!educationContentData || educationContentData.length === 0) {
      return NextResponse.json(
        { error: 'ステージ3の教育コンテンツサマリーが見つかりません。先にステージ3を完了してください。' },
        { status: 400 }
      );
    }

    const educationContent = educationContentData[0].content;

    // 教育コンテンツサマリーの内容チェック
    if (!educationContent || educationContent.trim() === '') {
      return NextResponse.json(
        { error: 'ステージ3の教育コンテンツサマリーが空です。先にステージ3でコンテンツを生成してください。' },
        { status: 400 }
      );
    }

    console.log('Fetched all required data for creative parts generation');

    // API設定の取得
    const { data: apiSettings, error: apiError } = await supabase
      .from('api_settings')
      .select('*')
      .single();

    if (apiError || !apiSettings) {
      console.error('Failed to fetch API settings:', apiError);
      return NextResponse.json(
        { error: 'API設定が見つかりません。管理者に設定を依頼してください。' },
        { status: 400 }
      );
    }

    // 使用するAIモデルとAPIキーの決定
    let apiKey: string;
    let model: string = apiSettings.default_model || 'gemini-1.5-flash';

    if (model.includes('gemini')) {
      apiKey = apiSettings.gemini_api_key;
    } else if (model.includes('gpt')) {
      apiKey = apiSettings.openai_api_key;
    } else if (model.includes('claude')) {
      apiKey = apiSettings.claude_api_key;
    } else if (model.includes('deepseek')) {
      apiKey = apiSettings.deepseek_api_key;
    } else {
      // デフォルトでGeminiを使用
      apiKey = apiSettings.gemini_api_key;
      model = 'gemini-1.5-flash';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI APIキーが設定されていません。管理者に設定を依頼してください。' },
        { status: 400 }
      );
    }

    console.log('Generating creative parts with model:', model);

    // クリエイティブパーツを生成
    const creativeParts = await generateCreativeParts(
      initialData,
      productSummary,
      educationContent,
      apiKey,
      model
    );

    console.log('Creative parts generated successfully');

    // 生成されたコンテンツをデータベースに保存
    const { data: savedContent, error: saveError } = await supabase
      .from('project_contents')
      .insert([
        {
          project_id: params.id,
          stage_type: 'creative_parts',
          content: creativeParts,
          status: 'completed',
          is_ai_generated: true,
          generation_prompt: CREATIVE_PARTS_PROMPT,
          created_by: user.id,
          last_edited_by: user.id,
        }
      ])
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save creative parts:', saveError);
      return NextResponse.json(
        { error: 'クリエイティブパーツの保存に失敗しました', details: saveError.message },
        { status: 500 }
      );
    }

    console.log('Creative parts saved successfully:', { contentId: savedContent.id, projectId: params.id });

    return NextResponse.json({
      success: true,
      content: creativeParts,
      contentId: savedContent.id
    });

  } catch (error) {
    console.error('Error in creative parts generation:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      projectId: params.id,
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = error instanceof Error ? error.message : 'クリエイティブパーツの生成中にエラーが発生しました。';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
