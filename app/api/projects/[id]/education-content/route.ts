import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// 教育コンテンツ生成プロンプト
const EDUCATION_CONTENT_PROMPT = `# 命令書

あなたは、特定の商品が持つ「特徴」を起点として、その特徴の重要性や背景を深く掘り下げ、顧客の潜在的なニーズを顕在化させるための「教育コンテンツ」の材料をリサーチする、プロのコンテンツマーケターです。

あなたの目的は、単に商品の良さを伝えることではありません。顧客自身がまだ気づいていない課題や欲求を、リサーチによって得られた客観的な情報（事実、統計、専門家の意見など）を用いて「教育」し、結果として商品の価値を根本から理解させ、購買意欲を創出することです。

これから、私が指定する「商品の特徴」について、最終的なレポートを提出してください。

---

# 【出力フォーマット】

以下の各項目について、調査結果を詳細にまとめてください。

---

## **【特徴1】: [ここに商品の特徴を記述（例：たんぱく質が豊富）]**

### **1. この特徴の「重要性」と「必要性」を伝える情報**
*   **そもそも、〇〇とは何か？ (定義・役割):**
    *   （例：たんぱく質が、筋肉、内臓、皮膚、髪、爪などの主成分であり、生命維持に不可欠な栄養素であることを、専門用語を避けつつ分かりやすく説明）
*   **なぜ、〇〇は必要なのか？ (具体的メリット):**
    *   （例：十分なたんぱく質を摂取することで得られる、健康面・美容面・精神面での具体的なメリットを箇条書きでリストアップ）
*   **もし、〇〇が不足すると？ (潜在的な問題・リスク):**
    *   （例：たんぱく質不足が引き起こす可能性のある、筋力低下、肌のトラブル、思考力の低下、免疫力の低下などの具体的な症状やリスクを、少し危機感を煽るトーンで記述）

### **2. 顧客の「自分ごと化」を促す客観的データ**
*   **世の中の動向・統計データ:**
    *   （例：日本人の平均たんぱく質摂取量の推移、目標摂取量に達していない人の割合など、多くの人が課題を抱えていることを示す統計データを引用）
*   **権威ある専門家の見解:**
    *   （例：「〇〇大学の〇〇教授によると、現代人は...」など、専門家や権威機関のコメントを引用し、情報の信頼性を補強）

### **3. 関心を引く意外な事実・トリビア**
*   **あまり知られていない豆知識:**
    *   （例：「実はたんぱく質は、睡眠の質にも影響を与えることが最新の研究で分かっています」など、顧客が「へぇ！」と思うような意外な情報を記述）

### **4. 参考情報ソース**
*   **情報源リスト:**
    *   （参考にしたWebページのURL、書籍名、論文名などをリストアップ）

---

## **【特徴2】: [ここに商品の特徴を記述]**

（上記と同様のフォーマットで記述）

---

# リサーチ対象

それでは、以下の「商品の特徴リスト」に関するリサーチとレポート作成を開始してください。

【商品の特徴リスト】
[ここに、商品の特徴をリスト形式で入力してください]

# 商品情報

## 初期データ
{initial_data}

## 商品情報サマリー
{product_summary}`;

// AIを呼び出して教育コンテンツを生成する関数
async function generateEducationContent(
  initialData: any[], 
  productSummary: string, 
  aiApiKey: string, 
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  try {
    // 初期データをテキスト形式に変換
    const initialDataText = initialData.map(item => {
      let text = `タイトル: ${item.title || '未設定'}\n`;
      text += `種類: ${item.data_type || '未設定'}\n`;
      text += `内容: ${item.content || 'なし'}\n`;
      if (item.source_url) {
        text += `URL: ${item.source_url}\n`;
      }
      if (item.tags && item.tags.length > 0) {
        text += `タグ: ${item.tags.join(', ')}\n`;
      }
      return text;
    }).join('\n---\n');

    // プロンプトにデータを挿入
    const fullPrompt = EDUCATION_CONTENT_PROMPT
      .replace('{initial_data}', initialDataText)
      .replace('{product_summary}', productSummary);

    console.log('Education content generation prompt prepared');

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
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error('Error generating education content:', error);
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('POST /api/projects/[id]/education-content: Start', { projectId: id });
  
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

    // API設定を取得
    const { data: apiSettings, error: settingsError } = await supabase
      .from('api_settings')
      .select('*')
      .single();

    if (settingsError || !apiSettings) {
      return NextResponse.json(
        { error: 'API設定が見つかりません。管理者に設定を依頼してください。' },
        { status: 400 }
      );
    }

    // 初期データを取得（タグ情報を含む）
    const { data: initialData, error: dataError } = await supabase
      .from('initial_data')
      .select(`
        *,
        initial_data_tags (
          tags (
            name
          )
        )
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('Initial data fetch error:', dataError);
      return NextResponse.json(
        { error: 'Failed to fetch initial data' },
        { status: 500 }
      );
    }

    if (!initialData || initialData.length === 0) {
      return NextResponse.json(
        { error: '初期データが登録されていません。まずステージ1で初期データを登録してください。' },
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

    // 商品情報サマリーを取得
    const { data: productSummaryData, error: summaryError } = await supabase
      .from('project_contents')
      .select('content')
      .eq('project_id', id)
      .eq('stage_type', 'product_summary')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (summaryError) {
      console.error('Product summary fetch error:', summaryError);
      return NextResponse.json(
        { error: 'Failed to fetch product summary' },
        { status: 500 }
      );
    }

    if (!productSummaryData || productSummaryData.length === 0) {
      return NextResponse.json(
        { error: '商品情報サマリーが作成されていません。まずステージ2で商品情報サマリーを作成してください。' },
        { status: 400 }
      );
    }

    const productSummary = productSummaryData[0].content;

    // 初期データの構造を整理
    const processedInitialData = initialData.map(item => ({
      ...item,
      tags: item.initial_data_tags?.map((tag: any) => tag.tags?.name).filter(Boolean) || []
    }));

    // 使用するAPIキーとモデルを決定
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

    console.log('Generating education content with model:', model);

    // 教育コンテンツを生成
    const educationContent = await generateEducationContent(
      processedInitialData,
      productSummary,
      apiKey,
      model
    );

    console.log('Education content generated successfully');

    // 生成されたコンテンツをデータベースに保存
    const { data: savedContent, error: saveError } = await supabase
      .from('project_contents')
      .insert([
        {
          project_id: id,
          stage_type: 'education_content',
          content: educationContent,
          status: 'completed',
          is_ai_generated: true,
          generation_prompt: EDUCATION_CONTENT_PROMPT,
          created_by: user.id,
          last_edited_by: user.id,
        }
      ])
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save education content:', saveError);
      return NextResponse.json(
        { error: 'Failed to save education content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: educationContent,
      contentId: savedContent.id
    });

  } catch (error) {
    console.error('Education content generation error:', error);
    return NextResponse.json(
      { 
        error: '教育コンテンツの生成に失敗しました。',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
