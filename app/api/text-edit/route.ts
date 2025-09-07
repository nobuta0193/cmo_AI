import { NextRequest, NextResponse } from 'next/server';
import { aiManager } from '@/lib/ai/clients';

// テキスト編集エージェント用のプロンプトを構築する関数
function buildTextEditAgentPrompt(
  content: string, 
  userInstruction: string
): string {
  return `
あなたは文書編集の専門エージェントです。
ユーザーの指示に従って、以下の文書を編集してください。

## ユーザーの編集指示
${userInstruction}

## 編集対象の文書
${content}

## 編集ルール
1. ユーザーの指示を正確に理解し、適切に実行する
2. 指示が「追加」「追記」を求める場合は、関連する有用な情報を追加する
3. 指示が「修正」「変更」を求める場合は、指定された部分を適切に修正する
4. 指示が「削除」を求める場合は、指定された部分を削除する
5. 元の情報の正確性は保持する
6. マークダウン形式を維持する
7. 文書の構造と読みやすさを向上させる

## 追加・修正の指針
- 追加指示がある場合は、文脈に合った適切な内容を生成する
- 既存の内容と矛盾しない、価値のある情報を追加する
- 商品やサービスの特徴に関連する情報は積極的に充実させる
- ただし、根拠のない誇大表現は避ける

## 禁止事項
- ユーザーが明確に指示していない大幅な構成変更
- 既存の正確な情報の削除（削除指示がない限り）
- 変更理由のコメント（<!-- 変更: 理由 -->）の追加
- 根拠のない数値や効果の捏造

## 出力形式
ユーザーの指示に従って編集された完全な文書をそのまま出力してください。
コメントや説明は一切含めないでください。

編集された文書:
`;
}

export async function POST(request: NextRequest) {
  try {
    const { content, instruction } = await request.json();
    
    if (!content || !instruction) {
      return NextResponse.json(
        { error: 'コンテンツと編集指示の両方が必要です' }, 
        { status: 400 }
      );
    }
    
    console.log('Initializing AI client for text editing...');
    const client = await aiManager.getClient();
    
    if (!client) {
      console.error('Failed to initialize AI client');
      return NextResponse.json({ error: 'AI クライアントの初期化に失敗しました' }, { status: 500 });
    }
    
    const prompt = buildTextEditAgentPrompt(content, instruction);
    console.log('Generated prompt:', prompt.substring(0, 200) + '...');
    
    const response = await client.generateText(prompt);
    console.log('AI response:', response);
    
    if (response.error) {
      console.error('AI generation error:', response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }
    
    if (!response.content) {
      console.error('AI response has no content');
      return NextResponse.json({ error: 'AIからの応答が空でした' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      editedContent: response.content,
      originalInstruction: instruction,
      originalContent: content
    });
    
  } catch (error) {
    console.error('Text edit API error:', error);
    return NextResponse.json(
      { error: 'テキスト編集に失敗しました' }, 
      { status: 500 }
    );
  }
}
