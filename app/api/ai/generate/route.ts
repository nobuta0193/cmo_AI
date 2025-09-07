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

interface GenerateRequest {
  prompt: string;
  model?: string;
}

async function generateWithAI(prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  console.log('Generating content with AI model:', model);
  
  const supabase = createSupabaseClient();
  
  // API設定を取得
  const { data: apiSettings, error: apiError } = await supabase
    .from('api_settings')
    .select('*')
    .single();

  if (apiError || !apiSettings) {
    console.error('Failed to fetch API settings:', apiError);
    throw new Error('API設定が見つかりません。管理者にAPI設定を依頼してください。');
  }

  // 使用するAPIキーを決定
  let apiKey: string;
  let actualModel = model;

  if (model.includes('gemini')) {
    apiKey = apiSettings.gemini_api_key;
    actualModel = 'gemini-1.5-flash';
  } else if (model.includes('gpt')) {
    apiKey = apiSettings.openai_api_key;
    actualModel = 'gpt-4-turbo-preview';
  } else if (model.includes('claude')) {
    apiKey = apiSettings.claude_api_key;
    actualModel = 'claude-3-opus-20240229';
  } else if (model.includes('deepseek')) {
    apiKey = apiSettings.deepseek_api_key;
    actualModel = 'deepseek-chat';
  } else {
    // デフォルトでGeminiを使用
    apiKey = apiSettings.gemini_api_key;
    actualModel = 'gemini-1.5-flash';
  }

  if (!apiKey) {
    throw new Error(`${actualModel}のAPIキーが設定されていません。管理者にAPI設定を依頼してください。`);
  }

  console.log('Using AI model:', actualModel);

  try {
    let response: Response;

    if (actualModel.includes('gemini')) {
      // Gemini API呼び出し
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Invalid Gemini response structure:', data);
        throw new Error('Gemini APIから無効なレスポンスが返されました');
      }

      return data.candidates[0].content.parts[0].text;

    } else if (actualModel.includes('gpt')) {
      // OpenAI API呼び出し
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            {
              role: 'user',
              content: prompt
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
        throw new Error('OpenAI APIから無効なレスポンスが返されました');
      }

      return data.choices[0].message.content;

    } else if (actualModel.includes('claude')) {
      // Claude API呼び出し
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8000,
          temperature: 0.7,
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
        throw new Error('Claude APIから無効なレスポンスが返されました');
      }

      return data.content[0].text;

    } else if (actualModel.includes('deepseek')) {
      // Deepseek API呼び出し
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8000,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepseek API error response:', errorText);
        throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected Deepseek response structure:', data);
        throw new Error('Deepseek APIから無効なレスポンスが返されました');
      }

      return data.choices[0].message.content;

    } else {
      throw new Error(`サポートされていないモデル: ${actualModel}`);
    }

  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('=== AI Generate API Called ===');
  
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, model = 'gemini-1.5-flash' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが指定されていません' },
        { status: 400 }
      );
    }

    console.log('Generating content with prompt length:', prompt.length);
    console.log('Using model:', model);

    const content = await generateWithAI(prompt, model);

    console.log('AI generation successful, content length:', content.length);

    return NextResponse.json({
      success: true,
      content: content,
      model: model
    });

  } catch (error) {
    console.error('=== AI Generate Error ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorMessage = error instanceof Error ? error.message : 'AI生成に失敗しました';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
