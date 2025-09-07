'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, RefreshCw, Edit, Eye, EyeOff, Wand2, Copy, Download, Bot, Image as ImageIcon, Sparkles, Trash2, Check, X, MessageSquare } from 'lucide-react';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import { createBrowserClient } from '@supabase/ssr';
import { detectLineDiff, markupDiffForDisplay, generateCleanText, DiffResult } from '@/lib/diff-utils';

interface ScriptGenerationStageProps {
  projectId: string;
  onComplete: () => void;
}



// 差分表示用のカスタムコンポーネント
const DiffDisplay = ({ diffResult }: { diffResult: DiffResult }) => {
  return (
    <div className="space-y-1">
      {diffResult.chunks.map((chunk, index) => {
        let className = "";
        let prefix = "";
        
        switch (chunk.type) {
          case 'added':
            className = "bg-green-100/20 border-l-4 border-green-400 text-green-200 pl-4 py-1";
            prefix = "+ ";
            break;
          case 'removed':
            className = "bg-red-100/20 border-l-4 border-red-400 text-red-200 pl-4 py-1 line-through";
            prefix = "- ";
            break;
          case 'unchanged':
            className = "";
            prefix = "";
            break;
        }
        
        return (
          <div key={index} className={className}>
            {prefix}{chunk.content}
          </div>
        );
      })}
    </div>
  );
};

// 標準のMarkdownコンポーネント（差分表示なし）
const standardMarkdownComponents: Components = {};

export function ScriptGenerationStage({ projectId, onComplete }: ScriptGenerationStageProps) {
  interface Script {
    id: string;
    title: string;
    content: string;
  }
  
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [isScriptGenerated, setIsScriptGenerated] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [contentId, setContentId] = useState<string | null>(null);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [addVariationLoading, setAddVariationLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'agent'>('agent');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [pendingChanges, setPendingChanges] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  const [thumbnails, setThumbnails] = useState<Array<{
    id: string;
    url: string;
    ratio: string;
    prompt: string;
    createdAt: string;
  }>>([]);
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('9:16');
  const [evaluation, setEvaluation] = useState<{
    expression: number;
    structure: number;
    information: number;
    quality: number;
    education: number;
    creative: number;
    total: number;
    comment: string;
  } | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // デバッグ用：環境変数の確認
  useEffect(() => {
    console.log('=== ScriptGenerationStage Environment Check ===');
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('SUPABASE_URL (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20));
  }, []);

  // Supabaseからデータを読み込む useEffect
  useEffect(() => {
    const loadExistingContent = async () => {
      console.log('=== ScriptGenerationStage: loadExistingContent called ===');
      console.log('Project ID:', projectId);
      
      if (!projectId) {
        console.log('No projectId provided, skipping load');
        return;
      }
      
      setIsInitialLoading(true);
      
      // コンテンツとIDを初期化
      console.log('Initializing state before loading...');
      setScripts([]);
      setSelectedScriptId(null);
      setContentId(null);
      setIsScriptGenerated(false);
      setEvaluation(null);
      
      try {
        console.log('Querying Supabase for script content...');
        
        // Supabaseクライアントの状態確認
        console.log('Supabase client check:', {
          hasClient: !!supabase,
          hasAuth: !!supabase.auth,
          projectId: projectId
        });
        
        const { data: existingContent, error } = await supabase
          .from('project_contents')
          .select('id, content, created_at, updated_at, status')
          .eq('project_id', projectId)
          .eq('stage_type', 'script')
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('Supabase query result:', {
          data: existingContent,
          error: error,
          hasData: existingContent && existingContent.length > 0
        });

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Supabase query error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            projectId: projectId,
            fullError: error
          });
          throw error;
        }

        if (existingContent && existingContent.length > 0) {
          const latestContent = existingContent[0];
          console.log('Latest content found:', {
            id: latestContent.id,
            created_at: latestContent.created_at,
            updated_at: latestContent.updated_at,
            status: latestContent.status,
            contentType: typeof latestContent.content,
            contentKeys: latestContent.content ? Object.keys(latestContent.content) : []
          });
          
          let scriptData = latestContent.content;
          
          console.log('Raw content from database:', {
            contentType: typeof latestContent.content,
            contentValue: latestContent.content,
            isString: typeof latestContent.content === 'string',
            isObject: typeof latestContent.content === 'object'
          });
          
          // もしcontentが文字列の場合、JSONとしてパースを試行
          if (typeof scriptData === 'string') {
            // 空文字列や空白のみの文字列をチェック
            const trimmedData = scriptData.trim();
            if (trimmedData === '' || trimmedData === 'null' || trimmedData === 'undefined') {
              console.log('Content is empty or null, skipping JSON parsing');
              scriptData = null;
            } else {
              try {
                console.log('Attempting to parse content as JSON...', {
                  length: trimmedData.length,
                  firstChars: trimmedData.substring(0, 50),
                  lastChars: trimmedData.substring(Math.max(0, trimmedData.length - 50))
                });
                scriptData = JSON.parse(trimmedData);
                console.log('JSON parsing successful:', scriptData);
              } catch (parseError) {
                console.error('Failed to parse content as JSON:', parseError);
                console.log('Content string details:', {
                  originalLength: scriptData.length,
                  trimmedLength: trimmedData.length,
                  contentPreview: trimmedData.substring(0, 100),
                  isValidJSON: false
                });
                // パースに失敗した場合は、scriptDataをnullに設定
                scriptData = null;
              }
            }
          }
          
          if (scriptData && typeof scriptData === 'object') {
            console.log('Script data structure:', {
              hasScripts: !!scriptData.scripts,
              scriptsLength: scriptData.scripts ? scriptData.scripts.length : 0,
              selectedScript: scriptData.selectedScript,
              hasEvaluation: !!scriptData.evaluation,
              scriptDataKeys: Object.keys(scriptData)
            });
            
            if (scriptData.scripts && Array.isArray(scriptData.scripts) && scriptData.scripts.length > 0) {
              console.log('Setting script data to state...');
              
              setScripts(scriptData.scripts);
              const selectedId = scriptData.selectedScript || scriptData.scripts[0].id;
              setSelectedScriptId(selectedId);
              setIsScriptGenerated(true);
              setContentId(latestContent.id);
              
              // 評価データも復元
              if (scriptData.evaluation) {
                console.log('Restoring evaluation data:', scriptData.evaluation);
                setEvaluation(scriptData.evaluation);
              }
              
              console.log('=== Script data successfully restored ===', {
                scriptsCount: scriptData.scripts.length,
                selectedScript: selectedId,
                hasEvaluation: !!scriptData.evaluation,
                contentId: latestContent.id
              });
            } else {
              console.log('Script data exists but no valid scripts found:', {
                hasScripts: !!scriptData.scripts,
                scriptsType: typeof scriptData.scripts,
                isArray: Array.isArray(scriptData.scripts),
                scriptsValue: scriptData.scripts
              });
            }
          } else {
            console.log('Script data is not a valid object:', {
              scriptDataType: typeof scriptData,
              scriptDataValue: scriptData,
              isNull: scriptData === null,
              isUndefined: scriptData === undefined
            });
          }
        } else {
          console.log('No script content found in project_contents table');
        }
      } catch (error) {
        console.error('ScriptGenerationStage: Failed to load existing content:', error);
        toast({
          title: "エラー",
          description: "コンテンツの読み込みに失敗しました。",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
        console.log('=== loadExistingContent completed ===');
      }
    };

    loadExistingContent();
  }, [projectId, supabase, toast]);

  const loadOrGenerateScript = async () => {
    if (!projectId) {
      toast({
        title: "エラー",
        description: "プロジェクトIDが見つかりません。",
        variant: "destructive",
      });
      return;
    }

    setRegenerateLoading(true);
    try {
      console.log('Calling script generation API for project:', projectId);
      
      const response = await fetch(`/api/projects/${projectId}/script-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customInstructions: customInstructions
        })
      });

      if (!response.ok) {
        let errorMessage = '広告台本の生成に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          // ログ出力（安全な方法）
          console.log(`API Error - Status: ${response.status}, Message: ${errorData.error || 'Unknown error'}`);
        } catch (parseError) {
          console.log('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // エラーをthrowせずに、直接トーストで表示
        toast({
          title: "生成エラー",
          description: errorMessage,
          variant: "destructive",
        });
        return; // エラー処理後は関数を終了
      }

      const result = await response.json();
      
      if (!result || !result.scriptData) {
        throw new Error('APIから有効なレスポンスが返されませんでした');
      }

      console.log('Script generation successful:', result);

      // 生成されたスクリプトデータを状態に設定
      setScripts(result.scriptData.scripts);
      setSelectedScriptId(result.scriptData.selectedScript);
      setIsScriptGenerated(true);
      setContentId(result.contentId);
      
      toast({
        title: "広告台本生成完了",
        description: "AI台本を生成しました。",
      });
    } catch (error) {
      console.log('Script generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "広告台本の生成に失敗しました。";
      
      toast({
        title: "生成エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleAddVariation = async () => {
    if (!projectId) {
      toast({
        title: "エラー",
        description: "プロジェクトIDが見つかりません。",
        variant: "destructive",
      });
      return;
    }

    setAddVariationLoading(true);
    try {
      console.log('Calling variation generation API for project:', projectId);
      
      const response = await fetch(`/api/projects/${projectId}/script-generation/variation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'バリエーション生成に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          // ログ出力（安全な方法）
          console.log(`Variation API Error - Status: ${response.status}, Message: ${errorData.error || 'Unknown error'}`);
        } catch (parseError) {
          console.log('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // エラーをthrowせずに、直接トーストで表示
        toast({
          title: "バリエーション生成エラー",
          description: errorMessage,
          variant: "destructive",
        });
        return; // エラー処理後は関数を終了
      }

      const result = await response.json();
      
      if (!result || !result.script) {
        throw new Error('APIから有効なレスポンスが返されませんでした');
      }

      console.log('Variation generation successful:', result);

      // 生成されたスクリプトを追加
      const newScript: Script = {
        id: result.script.id,
        title: result.script.title,
        content: result.script.content
      };
      
      const updatedScripts = [...scripts, newScript];
      setScripts(updatedScripts);
      setSelectedScriptId(newScript.id);
      
      // 自動保存
      await saveContentToSupabase(updatedScripts, newScript.id, evaluation);
      
      toast({
        title: "バリエーション生成完了",
        description: "AI生成による新しいバリエーションを追加しました。",
      });
    } catch (error) {
      console.log('Variation generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "バリエーションの生成に失敗しました。";
      
      toast({
        title: "バリエーション生成エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAddVariationLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await loadOrGenerateScript();
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await saveContentToSupabase(scripts, selectedScriptId, evaluation);
      setIsEditing(false);
      
      toast({
        title: "保存完了",
        description: "変更が保存されました。",
      });
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!selectedScriptId) {
      toast({
        title: "エラー",
        description: "コピーする台本が存在しません。",
        variant: "destructive",
      });
      return;
    }
    const script = scripts.find(s => s.id === selectedScriptId);
    if (!script) return;
    
    navigator.clipboard.writeText(script.content);
    toast({
      title: "コピー完了",
      description: "台本をクリップボードにコピーしました。",
    });
  };

  const handleExportScript = () => {
    if (!selectedScriptId) {
      toast({
        title: "エラー",
        description: "エクスポートする台本が存在しません。",
        variant: "destructive",
      });
      return;
    }
    const script = scripts.find(s => s.id === selectedScriptId);
    if (!script) return;
    
    const blob = new Blob([script.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${script.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "エクスポート完了",
      description: "台本をダウンロードしました。",
    });
  };

  const handleDeleteScript = async () => {
    if (!selectedScriptId) return;
    
    const updatedScripts = scripts.filter(script => script.id !== selectedScriptId);
    
    // フロントエンド状態を更新
    if (updatedScripts.length === 0) {
      setScripts([]);
      setSelectedScriptId(null);
      setIsScriptGenerated(false);
    } else {
      setScripts(updatedScripts);
      setSelectedScriptId(updatedScripts[0].id);
    }
    
    // 重要：Supabaseにも削除を反映
    try {
      await saveContentToSupabase(
        updatedScripts, 
        updatedScripts.length > 0 ? updatedScripts[0].id : null, 
        evaluation
      );
      
      toast({
        title: "削除完了",
        description: "選択中のバリエーションを削除しました。",
      });
    } catch (error) {
      console.error('Delete save error:', error);
      toast({
        title: "エラー",
        description: "削除の保存に失敗しました。再度お試しください。",
        variant: "destructive",
      });
      
      // エラーの場合は状態を元に戻す
      const originalScript = scripts.find(s => s.id === selectedScriptId);
      if (originalScript) {
        setScripts([...updatedScripts, originalScript]);
        setSelectedScriptId(selectedScriptId);
      }
    }
  };

  // Supabaseへの保存用ヘルパー関数
  const saveContentToSupabase = async (scriptsToSave: Script[], selectedId: string | null, evaluationToSave: any) => {
    try {
      console.log('saveContentToSupabase called with:', {
        scriptsCount: scriptsToSave.length,
        selectedId,
        hasEvaluation: !!evaluationToSave,
        contentId
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`認証エラー: ${userError.message}`);
      }
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const scriptData = {
        scripts: scriptsToSave,
        selectedScript: selectedId,
        evaluation: evaluationToSave
      };

      const contentData = {
        project_id: projectId,
        stage_type: 'script',
        content: scriptData,
        status: 'draft',
        is_ai_generated: true,
        created_by: user.id,
        last_edited_by: user.id,
      };

      console.log('Saving content data:', contentData);

      if (contentId) {
        console.log('Updating existing content with ID:', contentId);
        const { error: updateError } = await supabase
          .from('project_contents')
          .update({
            content: scriptData,
            last_edited_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(`更新エラー: ${updateError.message}`);
        }
        console.log('Content updated successfully');
      } else {
        console.log('Creating new content');
        const { data: newContent, error: insertError } = await supabase
          .from('project_contents')
          .insert([contentData])
          .select('id')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`作成エラー: ${insertError.message}`);
        }
        if (newContent) {
          console.log('New content created with ID:', newContent.id);
          setContentId(newContent.id);
        }
      }
    } catch (error) {
      console.error('saveContentToSupabase error:', error);
      throw error;
    }
  };

  const handleSaveProgress = async () => {
    console.log('handleSaveProgress called');
    setSaveLoading(true);
    try {
      // データの検証
      if (!projectId) {
        throw new Error('プロジェクトIDが見つかりません');
      }

      console.log('Current state:', {
        scriptsCount: scripts.length,
        selectedScriptId,
        hasEvaluation: !!evaluation,
        projectId
      });

      // まずSupabaseに保存してcontentIdを設定
      await saveContentToSupabase(scripts, selectedScriptId, evaluation);
      console.log('Supabase save completed');
      
      // 次にプロジェクトの進捗を更新
      console.log('Updating project via API');
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stageType: 'script',
          content: { 
            scripts: scripts,
            selectedScript: selectedScriptId,
            evaluation: evaluation 
          },
          status: '広告台本生成中',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API保存エラー (${response.status}): ${errorText}`);
      }
      console.log('Project API update completed');

      toast({
        title: "保存完了",
        description: "進捗が保存されました。",
      });
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'データの保存に失敗しました。';
      toast({
        title: "保存エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCompleteStage = async () => {
    if (scripts.length === 0) {
      toast({
        title: "台本が必要です",
        description: "広告台本を生成してください。",
        variant: "destructive",
      });
      return;
    }

    setCompleteLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // Save content first
      const scriptData = {
        scripts: scripts,
        selectedScript: selectedScriptId,
        evaluation: evaluation
      };

      const contentData = {
        project_id: projectId,
        stage_type: 'script',
        content: scriptData,
        status: 'completed',
        is_ai_generated: true,
        created_by: user.id,
        last_edited_by: user.id,
      };

      if (contentId) {
        const { error: updateError } = await supabase
          .from('project_contents')
          .update({
            content: scriptData,
            status: 'completed',
            last_edited_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId);

        if (updateError) throw updateError;
      } else {
        const { data: newContent, error: insertError } = await supabase
          .from('project_contents')
          .insert([contentData])
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (newContent) setContentId(newContent.id);
      }
      
      // Update project stage using the new API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stage: 6, // 全ステージ完了状態として6に設定
          status: 'プロジェクト完了',
          stageType: 'script',
          content: scriptData,
        }),
      });

      if (!response.ok) {
        throw new Error('プロジェクトの完了に失敗しました');
      }

      toast({
        title: "プロジェクト完了",
        description: "すべてのステージが完了しました！",
      });
      
      onComplete();
    } catch (error) {
      console.error('Complete project error:', error);
      toast({
        title: "エラー",
        description: "プロジェクトの完了に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleEvaluateScript = async () => {
    setEvaluationLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "料金プランをスタンダード以上としてください",
        description: "台本評価機能はスタンダードプラン以上でご利用いただけます。",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "評価エラー",
        description: "評価に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setEvaluationLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-400';
    if (score >= 7) return 'text-yellow-400';
    if (score >= 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 9) return 'bg-green-500/20 border-green-500/30';
    if (score >= 7) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 5) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };
  const handleAiEdit = async () => {
    if (!aiEditPrompt.trim()) {
      toast({
        title: "編集指示が必要です",
        description: "編集内容を入力してください。",
        variant: "destructive",
      });
      return;
    }

    const currentScript = getCurrentScript();
    if (!currentScript.trim()) {
      toast({
        title: "編集対象がありません",
        description: "先にスクリプトを生成してください。",
        variant: "destructive",
      });
      return;
    }

    setAiEditLoading(true);
    try {
      const response = await fetch('/api/text-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentScript,
          instruction: aiEditPrompt
        })
      });

      if (!response.ok) {
        let errorMessage = 'AI編集に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result || !result.editedContent) {
        throw new Error('APIから有効なレスポンスが返されませんでした');
      }
      
      // 差分を検出
      const diff = detectLineDiff(currentScript, result.editedContent);
      
      if (!diff.hasChanges) {
        toast({
          title: "変更なし",
          description: "AIによる変更は検出されませんでした。",
        });
        setAiEditPrompt('');
        return;
      }
      
      // 変更を保留状態にして承認待ちにする
      setOriginalContent(currentScript);
      setPendingChanges(result.editedContent);
      setDiffResult(diff);
      setShowDiffPreview(true);
      
      toast({
        title: "AI編集完了",
        description: "変更内容を確認して承認または拒否してください。",
      });
      
      setAiEditPrompt('');
    } catch (error) {
      console.error('AI edit error:', error);
      toast({
        title: "AI編集エラー",
        description: error instanceof Error ? error.message : "編集に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setAiEditLoading(false);
    }
  };

  const handleApproveChanges = () => {
    if (pendingChanges && diffResult) {
      const cleanContent = generateCleanText(diffResult.chunks);
      updateCurrentScript(cleanContent);
      setPendingChanges(null);
      setDiffResult(null);
      setShowDiffPreview(false);
      setOriginalContent('');
      
      toast({
        title: "変更を承認",
        description: "AI編集の変更が適用されました。",
      });
    }
  };

  const handleRejectChanges = () => {
    setPendingChanges(null);
    setDiffResult(null);
    setShowDiffPreview(false);
    setOriginalContent('');
    
    toast({
      title: "変更を拒否",
      description: "元のスクリプトを維持します。",
    });
  };

  const handleGenerateThumbnail = async () => {
    setThumbnailLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "料金プランをスタンダード以上としてください",
        description: "サムネイル生成機能はスタンダードプラン以上でご利用いただけます。",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "サムネイル生成エラー",
        description: "サムネイルの生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setThumbnailLoading(false);
    }
  };

  const handleDownloadThumbnail = (thumbnail: any) => {
    // TODO: Implement actual download
    toast({
      title: "ダウンロード開始",
      description: "サムネイルをダウンロードしています。",
    });
  };

  const getCurrentScript = () => {
    if (!selectedScriptId) return '';
    return scripts.find(s => s.id === selectedScriptId)?.content ?? '';
  };

  const updateCurrentScript = (content: string) => {
    if (!selectedScriptId) return;
    const updatedScripts = scripts.map(script => {
      if (script.id === selectedScriptId) {
        return {
          ...script,
          content
        };
      }
      return script;
    });
    setScripts(updatedScripts);
  };

  // 初期読み込み中の表示
  if (isInitialLoading) {
    console.log('Rendering loading state...');
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Video className="w-5 h-5 mr-2" />
              広告台本
            </CardTitle>
            <CardDescription className="text-gray-400">
              データを読み込み中...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
            <Skeleton className="h-32 w-full bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 生成画面と編集画面の統合 - 常に編集可能な状態で表示
  console.log('Rendering main component with state:', {
    scriptsCount: scripts.length,
    selectedScriptId,
    isScriptGenerated,
    contentId,
    hasEvaluation: !!evaluation
  });

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Video className="w-5 h-5 mr-2" />
            広告台本
          </CardTitle>
          <CardDescription className="text-gray-400">
            広告台本を生成します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-white">追加指示</Label>
              <Textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="例: もっとカジュアルなトーンで、20代向けに調整してください"
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                rows={4}
              />
            </div>
            <Button
              onClick={() => {
                if (scripts.length === 0) {
                  loadOrGenerateScript();
                } else {
                  handleRegenerate();
                }
              }}
              disabled={regenerateLoading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerateLoading ? 'animate-spin' : ''}`} />
              {scripts.length === 0 ? 'コンテンツを生成' : '指示を反映して生成'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Script Variations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Script Editor - 2/3 width */}
        <div className="xl:col-span-2">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Video className="w-5 h-5 mr-2" />
                    広告台本
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    広告台本を編集・管理できます
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSaveProgress}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400"
                    disabled={saveLoading || scripts.length === 0}
                  >
                    {saveLoading ? "保存中..." : "進捗を保存"}
                  </Button>
                  <Button
                    onClick={handleCompleteStage}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                    disabled={completeLoading}
                  >
                    {completeLoading ? "処理中..." : "プロジェクト完了"}
                  </Button>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    生成完了
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                  {scripts.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      <div className="flex items-center space-x-2">
                        {scripts.map((script) => (
                      <Button
                        key={script.id}
                        variant={selectedScriptId === script.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedScriptId(script.id)}
                        className={selectedScriptId === script.id 
                          ? "bg-white/20 text-white border-0" 
                          : "border-white/30 text-white hover:bg-white/10"
                        }
                      >
                        <div className="flex items-center gap-2">
                          {isTitleEditing && selectedScriptId === script.id ? (
                            <Input
                              value={script.title}
                              onChange={(e) => {
                                const updatedScripts = scripts.map(s => {
                                  if (s.id === script.id) {
                                    return {
                                      ...s,
                                      title: e.target.value
                                    };
                                  }
                                  return s;
                                });
                                setScripts(updatedScripts);
                              }}
                              className="h-6 w-40 bg-white/5 border-white/20 text-white"
                              onBlur={() => setIsTitleEditing(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setIsTitleEditing(false);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <>
                              {script.title}
                              {selectedScriptId === script.id && (
                                <Edit
                                  className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTitleEditing(true);
                                  }}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </Button>
                    ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddVariation()}
                          disabled={addVariationLoading}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          {addVariationLoading ? "AI生成中..." : "+ 新しいバリエーション"}
                        </Button>
                      </div>
                  
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {showPreview ? 'エディター' : 'プレビュー'}
                        </Button>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="border-white/30 text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            編集
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={regenerateLoading}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${regenerateLoading ? 'animate-spin' : ''}`} />
                          再生成
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyScript}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          コピー
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportScript}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          エクスポート
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteScript}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          削除
                        </Button>
                        {isEditing && (
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saveLoading || scripts.length === 0}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                          >
                            {saveLoading ? "保存中..." : "保存"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEvaluateScript}
                          disabled={evaluationLoading}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          {evaluationLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              評価中...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              AI評価
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>広告台本がまだ生成されていません。</p>
                      <p className="text-sm mt-2">「コンテンツを生成」ボタンを押して台本を生成してください。</p>
                    </div>
                  )}

                {scripts.length > 0 && (
                  <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                    {showDiffPreview && diffResult ? (
                      <div>
                        <div className="flex items-center justify-between mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5 text-blue-400" />
                            <span className="text-blue-300 font-medium">AI編集の差分を確認</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleApproveChanges}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              承認
                            </Button>
                            <Button
                              onClick={handleRejectChanges}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4 mr-1" />
                              拒否
                            </Button>
                          </div>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <DiffDisplay diffResult={diffResult} />
                        </div>
                        <div className="mt-4 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg text-sm text-gray-400">
                          <p><span className="text-green-400">緑色</span>: 追加された部分</p>
                          <p><span className="text-red-400">赤色</span>: 削除された部分</p>
                          <p>網掛けなし: 変更されない部分</p>
                        </div>
                      </div>
                    ) : showPreview ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={standardMarkdownComponents}
                        >
                          {selectedScriptId ? scripts.find(s => s.id === selectedScriptId)?.content ?? '' : ''}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <textarea
                        value={selectedScriptId ? scripts.find(s => s.id === selectedScriptId)?.content ?? '' : ''}
                        onChange={(e) => {
                          if (!selectedScriptId) return;
                          const updatedScripts = scripts.map(script => {
                            if (script.id === selectedScriptId) {
                              return {
                                ...script,
                                content: e.target.value
                              };
                            }
                            return script;
                          });
                          setScripts(updatedScripts);
                        }}
                        className="w-full h-96 bg-transparent text-white resize-none focus:outline-none"
                        placeholder="広告台本をマークダウン形式で編集..."
                        disabled={!isEditing}
                      />
                    )}
                  </div>
                )}

              {scripts.length > 0 && isEditing && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>編集モード:</strong> 台本の内容を自由に編集できます。
                    時間配分、セリフ、演出ポイントなどを調整してください。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div>
          <div className="space-y-6">
            {/* AI支援編集 */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  AI支援編集
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AIに編集を依頼して台本を改善できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">編集指示</Label>
                  <Textarea
                    value={aiEditPrompt}
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    placeholder="例: もっとカジュアルなトーンにしてください"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleAiEdit}
                  disabled={aiEditLoading || !aiEditPrompt.trim() || showDiffPreview}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {aiEditLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      AI編集中...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      AI編集実行
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Agentモード:</strong> AIが自動で最適化提案</p>
                  <p>• <span className="text-green-400">緑色</span>: 追加される部分</p>
                  <p>• <span className="text-red-400">赤色</span>: 削除される部分</p>
                  <p>• 網掛けなし: 変更されない部分</p>
                  {showDiffPreview && (
                    <p className="text-yellow-400 mt-2">変更の承認または拒否をしてください</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* サムネイル生成 */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  サムネイル生成
                </CardTitle>
                <CardDescription className="text-gray-400">
                  DALL-E 3で台本に最適なサムネイルを生成
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">画像比率</Label>
                  <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:16">9:16 (Instagram Reels, TikTok)</SelectItem>
                      <SelectItem value="1:1">1:1 (Instagram投稿)</SelectItem>
                      <SelectItem value="16:9">16:9 (YouTube Shorts)</SelectItem>
                      <SelectItem value="4:5">4:5 (Instagram縦長)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">カスタムプロンプト（オプション）</Label>
                  <Textarea
                    value={thumbnailPrompt}
                    onChange={(e) => setThumbnailPrompt(e.target.value)}
                    placeholder="例: 明るい背景、商品を持つ女性、笑顔"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerateThumbnail}
                  disabled={thumbnailLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                >
                  {thumbnailLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      サムネイル生成
                    </>
                  )}
                </Button>

                {/* Generated Thumbnails */}
                {thumbnails.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-white">生成済みサムネイル</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {thumbnails.map((thumbnail) => (
                        <div key={thumbnail.id} className="border border-white/10 rounded-lg p-3 space-y-2">
                          <div className="relative w-full h-24">
                            <NextImage 
                              src={thumbnail.url} 
                              alt="Generated thumbnail"
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {thumbnail.ratio}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadThumbnail(thumbnail)}
                              className="border-white/30 text-white hover:bg-white/10 text-xs px-2 py-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              DL
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{thumbnail.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  <p><strong>注意:</strong> DALL-E 3の使用にはOpenAI APIキーが必要です</p>
                </div>
              </CardContent>
            </Card>

            {/* 台本評価 */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  台本評価
                </CardTitle>
                <CardDescription className="text-gray-400">
                  6軸評価による台本品質分析
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {evaluation ? (
                  <div className="space-y-4">
                    {/* Total Score */}
                    <div className="text-center p-4 border border-white/10 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-white mb-1">
                        {evaluation.total}
                      </div>
                      <div className="text-sm text-gray-400">総合スコア</div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-3">
                      {[
                        { key: 'expression', label: '表現', score: evaluation.expression },
                        { key: 'structure', label: '構成', score: evaluation.structure },
                        { key: 'information', label: '情報量', score: evaluation.information },
                        { key: 'quality', label: '情報の質', score: evaluation.quality },
                        { key: 'education', label: '教育', score: evaluation.education },
                        { key: 'creative', label: 'クリエイティブ', score: evaluation.creative }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-white text-sm">{item.label}</span>
                          <Badge className={`${getScoreBg(item.score)} ${getScoreColor(item.score)}`}>
                            {item.score}/10
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Evaluation Comment */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm">評価コメント</Label>
                      <div className="border border-white/10 rounded-lg p-3 bg-white/5 max-h-40 overflow-y-auto">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {evaluation.comment}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm mb-4">
                      台本の評価を開始してください
                    </p>
                    <Button
                      onClick={handleEvaluateScript}
                      disabled={evaluationLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                    >
                      {evaluationLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          評価中...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          評価開始
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>評価軸:</strong></p>
                  <p>• 表現: 魅力的で印象に残る言葉選び</p>
                  <p>• 構成: 論理的な流れの自然さ</p>
                  <p>• 情報量: 必要十分な情報の網羅性</p>
                  <p>• 情報の質: 事実に基づく正確性</p>
                  <p>• 教育: 潜在ニーズの顕在化</p>
                  <p>• クリエイティブ: 独創性・差別化</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}




