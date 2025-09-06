import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// サマリープロンプト（システムプロンプト）
const SUMMARY_PROMPT = `# 命令書
あなたの任務は、商品情報を以下の各項目に従って網羅的に抽出し、詳細に報告することです。

# 商品情報

## URL / text

[初期データ]

# 出力形式
以下の各項目について、商品情報から該当する情報を**すべて**抽出し、詳細な説明を加えて箇条書きでまとめてください。顧客の購買判断に影響を与えうる、どんな些細な情報でもリストアップしてください。
ウェブページ内に該当する情報が一切見つからない場合にのみ、「特に記載なし」と記述してください。

**1. 特徴 (Features): 商品が持つ客観的な仕様・事実のすべて**
* **物理的特徴:** サイズ（縦・横・高さ）、重量、寸法、色展開、デザインコンセプト、素材（具体的な名称や配合率）、質感、手触りなど。
* **機能的特徴:** 搭載されている全機能、独自技術の名称と仕組み、性能スペック（処理速度、容量、効率など）、動作・対応環境、操作方法。
* **内容的特徴:** 全成分リスト、原材料の原産地、内容量、栄養成分表示、アレルギー情報、1回あたりの使用量目安など。
* **製造・品質:** 製造プロセス、製造国や工場名、採用されている独自の製法や技術、品質管理基準（QC）、耐久性や安全性に関する記述。
* **パッケージ:** パッケージのデザイン、採用素材、サイズ、開封のしやすさ、保管方法、リサイクル情報など。

**2. メリット (Benefits): 顧客が得られる価値や問題解決のすべて**
* **機能的メリット:** この商品を使うことで、具体的に「何ができるように」なり、「どのような問題や手間が解決」し、「時間・コスト・労力がどの程度削減される」のか。
* **感情的メリット:** この商品を使うことで、顧客は「どのようなポジティブな感情（安心感、満足感、優越感、幸福感、楽しさ、自己肯定感など）」を得られるのか。その感情が生まれる理由も記述してください。
* **競合優位性:** （ページ内で言及されていれば）従来品や他社製品と比較して、何が、どのように優れているのか。その優位性を示す具体的な記述を引用してください。

**3. 実績 (Proof/Performance): 商品の信頼性を裏付ける客観的証拠のすべて**
* **定量的実績:** シリーズ累計販売数、導入社数、会員数、リピート率、顧客満足度（〇%）、具体的な評価スコア（例: 5段階中4.8）、各種ECサイトやランキングでの順位（例: 楽天デイリーランキング〇〇部門第1位）、具体的な成果データ（例: 売上150%向上、作業時間30%削減）。
* **定性的実績（顧客の声）:** 掲載されているレビュー、口コミ、お客様の声、インタビュー記事、導入事例（ケーススタディ）。可能であれば、顧客の属性（年齢、職業など）とその具体的なコメントをセットで引用してください。使用前後の比較（ビフォーアフター）があれば、その変化を詳細に記述してください。
* **メディア実績:** 掲載された雑誌名、テレビ番組名、ウェブメディア名、新聞名。可能であれば、掲載年月日、特集名、紹介された内容の要約も加えてください。
* **受賞歴:** 受賞した賞の正式名称、受賞部門、受賞年度、主催団体、その賞の権威性に関する情報。

**4. 権威性 (Authority): 専門性と信頼性を担保する要素のすべて**
* **専門家・著名人の推薦:** 監修・推薦・共同開発を行った専門家（医師、教授、弁護士、デザイナー等）や、広告・PRに起用されている著名人（タレント、アスリート、インフルエンサー）の氏名、肩書、専門分野、経歴、具体的な推薦コメント。
* **第三者機関の認定:** 取得している特許番号、実用新案、商標登録、ISOなどの国際規格、業界団体の基準、公的機関（消費者庁、厚生労働省など）からの認証・許可・評価。
* **開発背景と企業の信頼性:** 開発者の経歴や専門性、商品開発に至った熱意やストーリー、創業年数、企業の歴史、経営理念、資本金、従業員数など、企業の信頼性を示す情報。
* **研究開発の証拠:** 大学や研究機関との共同研究の事実、学会で発表された論文、科学的根拠を示す実験データやグラフ。

**5. オファー (Offer): 顧客の購入を後押しする取引条件のすべて**
* **価格体系:** 通常価格、セット価格、定期購入の各回ごとの価格と継続条件、オプション料金、送料（無料になる条件など）、消費税の扱いなど、価格に関するすべての情報。
* **割引・プロモーション:** 初回限定割引（割引率や割引額）、期間限定キャンペーンの具体的な内容と期間、適用条件、クーポンコード、早期割引、複数購入割引、下取りサービスなど。
* **保証とサポート:** 全額返金保証の具体的な期間と適用条件、返品・交換ポリシー、製品保証期間、修理サポート、カスタマーサポートの対応時間や連絡先（電話、メール、チャットなど）。
* **特典 (Bonus):** 購入時に付属するすべてのプレゼント（モノ、情報コンテンツ）、限定コミュニティへの参加権、無料コンサルティング、アフターフォローの内容など。
* **限定性・緊急性:** 数量限定（「在庫残りわずか」「〇個限定」）、期間限定（「本日23:59まで」「今月末まで」）、対象者限定（「初回の方のみ」「メルマガ読者様限定」）など、購入を後押しするためのあらゆる表現。
* **支払い方法:** 利用可能なすべての決済手段（クレジットカードのブランド、電子マネー、QRコード決済、銀行振込、代金引換、後払いサービスなど）。
* **購入プロセス:** 注文方法（ウェブ、電話）、購入までのステップ、商品の配送にかかる日数。`;

// URLからWebページの内容を取得する関数
async function fetchWebContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // HTMLタグを削除してテキストのみを抽出（簡易版）
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    return textContent;
  } catch (error) {
    console.error('Failed to fetch web content:', error);
    return '';
  }
}

// AIを使用してサマリーを生成する関数
async function generateSummary(initialData: any[], aiApiKey: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  // 初期データを統合
  let combinedData = '';
  
  for (const item of initialData) {
    combinedData += `\n\n## ${item.title} (${item.data_type})\n`;
    
    if (item.data_type === 'url' && item.content.startsWith('http')) {
      // URLの場合はWebページの内容を取得
      const webContent = await fetchWebContent(item.content);
      if (webContent) {
        combinedData += `URL: ${item.content}\n内容:\n${webContent.substring(0, 5000)}...`; // 文字数制限
      } else {
        combinedData += `URL: ${item.content}\n※内容の取得に失敗しました`;
      }
    } else {
      combinedData += item.content;
    }
  }
  
  // プロンプトに初期データを挿入
  const prompt = SUMMARY_PROMPT.replace('[初期データ]', combinedData);
  
  // AIモデルに応じてAPI呼び出し
  try {
    if (model === 'gemini-1.5-flash') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } else if (model === 'gpt-4-turbo') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } else if (model === 'claude-3-opus') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4096,
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } else if (model === 'deepseek-chat') {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    }
    
    throw new Error(`Unsupported AI model: ${model}`);
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('POST /api/projects/[id]/summary: Start', { projectId: params.id });
  
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

    // 初期データを取得
    const { data: initialData, error: dataError } = await supabase
      .from('initial_data')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('Initial data fetch error:', dataError);
      return NextResponse.json(
        { error: 'Failed to fetch initial data', details: dataError.message },
        { status: 500 }
      );
    }

    if (!initialData || initialData.length === 0) {
      return NextResponse.json(
        { error: '初期データが登録されていません。まず初期データを登録してください。' },
        { status: 400 }
      );
    }

    // デフォルトモデルに対応するAPIキーを取得
    const model = apiSettings.default_model || 'gemini-1.5-flash';
    let apiKey = '';

    switch (model) {
      case 'gemini-1.5-flash':
        apiKey = apiSettings.gemini_api_key || '';
        break;
      case 'gpt-4-turbo':
        apiKey = apiSettings.openai_api_key || '';
        break;
      case 'claude-3-opus':
        apiKey = apiSettings.claude_api_key || '';
        break;
      case 'deepseek-chat':
        apiKey = apiSettings.deepseek_api_key || '';
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported model: ${model}` },
          { status: 400 }
        );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `${model}のAPIキーが設定されていません。管理者に設定を依頼してください。` },
        { status: 400 }
      );
    }

    // AIサマリーを生成
    const summary = await generateSummary(initialData, apiKey, model);

    // 生成されたサマリーをproject_contentsに保存
    const { data: newContent, error: saveError } = await supabase
      .from('project_contents')
      .insert({
        project_id: params.id,
        stage_type: 'product_summary',
        content: summary,
        status: 'draft',
        is_ai_generated: true,
        is_selected: true,
        created_by: user.id,
        last_edited_by: user.id,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Summary save error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save summary', details: saveError.message },
        { status: 500 }
      );
    }

    console.log('Summary generated and saved successfully');

    return NextResponse.json({
      success: true,
      summary: summary,
      contentId: newContent.id,
      model: model,
      message: '商品情報サマリーが正常に生成されました'
    });

  } catch (error) {
    console.error('Unexpected error in summary generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
