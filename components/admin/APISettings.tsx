import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

type APISettings = {
  id: string;
  openai_api_key: string | null;
  claude_api_key: string | null;
  deepseek_api_key: string | null;
  gemini_api_key: string | null;
  default_model: string;
};

const models = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'deepseek-chat', name: 'Deepseek Chat' },
];

export default function APISettings() {
  const [settings, setSettings] = useState<APISettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // データが存在しない場合は初期データを作成
          const initialSettings = {
            openai_api_key: null,
            claude_api_key: null,
            deepseek_api_key: null,
            gemini_api_key: null,
            default_model: 'gemini-1.5-flash',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: newData, error: insertError } = await supabase
            .from('api_settings')
            .insert(initialSettings)
            .select()
            .single();

          if (insertError) throw insertError;
          setSettings(newData);
          return;
        }
        throw error;
      }
      setSettings(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching API settings:', errorMessage);
      
      // データが存在しない場合は初期データを作成
      const initialSettings = {
        openai_api_key: null,
        claude_api_key: null,
        deepseek_api_key: null,
        gemini_api_key: null,
        default_model: 'gemini-1.5-flash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const { data: newData, error: insertError } = await supabase
          .from('api_settings')
          .insert(initialSettings)
          .select()
          .single();

        if (insertError) {
          toast({
            title: 'エラー',
            description: `初期データの作成に失敗しました: ${insertError.message}`,
            variant: 'destructive',
          });
          return;
        }

        setSettings(newData);
        toast({
          title: '成功',
          description: '初期設定を作成しました',
        });
      } catch (insertError) {
        toast({
          title: 'エラー',
          description: `API設定の初期化に失敗しました: ${insertError instanceof Error ? insertError.message : '不明なエラー'}`,
          variant: 'destructive',
        });
      }
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    if (!settings) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('api_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: '成功',
        description: 'API設定を保存しました',
      });
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast({
        title: 'エラー',
        description: 'API設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof APISettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">OpenAI API Key</label>
          <Input
            type="password"
            value={settings.openai_api_key || ''}
            onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Claude API Key</label>
          <Input
            type="password"
            value={settings.claude_api_key || ''}
            onChange={(e) => handleInputChange('claude_api_key', e.target.value)}
            placeholder="sk-ant-..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deepseek API Key</label>
          <Input
            type="password"
            value={settings.deepseek_api_key || ''}
            onChange={(e) => handleInputChange('deepseek_api_key', e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gemini API Key</label>
          <Input
            type="password"
            value={settings.gemini_api_key || ''}
            onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
            placeholder="..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">デフォルトモデル</label>
          <Select
            value={settings.default_model}
            onValueChange={(value) => handleInputChange('default_model', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : '設定を保存'}
        </Button>
      </CardContent>
    </Card>
  );
}
