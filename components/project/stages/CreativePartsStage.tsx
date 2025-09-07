'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, Edit, Eye, EyeOff, Bot, Check, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import { createBrowserClient } from '@supabase/ssr';
import { detectLineDiff, markupDiffForDisplay, generateCleanText, DiffResult } from '@/lib/diff-utils';

interface CreativePartsStageProps {
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

export function CreativePartsStage({ projectId, onComplete }: CreativePartsStageProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [saveProgressLoading, setSaveProgressLoading] = useState(false);
  const [completeStageLoading, setCompleteStageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'agent'>('agent');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentId, setContentId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // コンポーネントマウント時に既存のコンテンツを読み込む
  useEffect(() => {
    const loadExistingContent = async () => {
      if (!projectId) return;
      
      setInitialLoading(true);
      
      // コンテンツとIDを初期化
      setContent('');
      setContentId(null);
      
      try {
        const { data: existingContent, error } = await supabase
          .from('project_contents')
          .select('id, content')
          .eq('project_id', projectId)
          .eq('stage_type', 'creative_parts')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        if (existingContent && existingContent.length > 0) {
          const latestContent = existingContent[0];
          setContent(latestContent.content || '');
          setContentId(latestContent.id);
        }
      } catch (error) {
        console.error('CreativePartsStage: Failed to load existing content:', error);
        toast({
          title: "エラー",
          description: "コンテンツの読み込みに失敗しました。",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingContent();
  }, [projectId, supabase, toast]);


  const handleRegenerate = async () => {
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
      const response = await fetch(`/api/projects/${projectId}/creative-parts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'クリエイティブパーツの生成に失敗しました';
        let errorDetails = null;
        
        try {
          // レスポンスのテキストを取得
          const responseText = await response.text();
          
          // JSONとしてパース
          if (responseText) {
            try {
              errorDetails = JSON.parse(responseText);
              errorMessage = errorDetails.error || errorMessage;
            } catch (jsonError) {
              console.error('JSON parse error:', jsonError);
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // 400エラー（バリデーションエラー）の場合は、トーストで表示してreturn
        if (response.status === 400) {
          // エラーメッセージに応じてタイトルを調整
          let errorTitle = "生成エラー";
          
          // 一次情報が必要なエラーの場合、より具体的なタイトルを設定
          if (errorMessage.includes('一次情報が必要です') || 
              errorMessage.includes('初期データ') || 
              errorMessage.includes('商品情報サマリー') || 
              errorMessage.includes('教育コンテンツサマリー')) {
            errorTitle = "一次情報が必要です";
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
          return; // エラー画面を表示せずに処理を終了
        }
        
        // 400以外のエラーの場合のみ詳細ログを出力
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorDetails ? JSON.stringify(errorDetails) : 'No response text',
          errorDetails: errorDetails,
          url: response.url
        });
        
        // 400以外のエラーの場合は例外をthrow（エラー画面表示）
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing success response:', jsonError);
        throw new Error('APIレスポンスの解析に失敗しました');
      }
      
      if (!result || !result.content) {
        console.error('Invalid result structure:', result);
        throw new Error('APIから有効なレスポンスが返されませんでした');
      }

      setContent(result.content);
      setContentId(result.contentId);
      
      toast({
        title: content ? "再生成完了" : "生成完了",
        description: content ? "クリエイティブパーツを再生成しました。" : "クリエイティブパーツを生成しました。",
      });
    } catch (error) {
      console.error('Creative parts generation error:', error);
      // エラーメッセージに応じてタイトルを調整
      let errorTitle = content ? "再生成エラー" : "生成エラー";
      let errorDescription = error instanceof Error ? error.message : (content ? "再生成に失敗しました。" : "生成に失敗しました。");
      
      // 一次情報が必要なエラーの場合、より具体的なタイトルを設定
      if (errorDescription.includes('一次情報が必要です') || 
          errorDescription.includes('初期データ') || 
          errorDescription.includes('商品情報サマリー') || 
          errorDescription.includes('教育コンテンツサマリー')) {
        errorTitle = "一次情報が必要です";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const contentData = {
        project_id: projectId,
        stage_type: 'creative_parts',
        content: content,
        status: 'draft',
        is_ai_generated: true,
        created_by: user.id,
        last_edited_by: user.id,
      };

      if (contentId) {
        const { error: updateError } = await supabase
          .from('project_contents')
          .update({
            content: content,
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

      setIsEditing(false);
      
      toast({
        title: "保存完了",
        description: "変更が保存されました。",
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: "保存エラー",
        description: "保存に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
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

    if (!content.trim()) {
      toast({
        title: "編集対象がありません",
        description: "先にコンテンツを生成してください。",
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
          content: content,
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
      const diff = detectLineDiff(content, result.editedContent);
      
      if (!diff.hasChanges) {
        toast({
          title: "変更なし",
          description: "AIによる変更は検出されませんでした。",
        });
        setAiEditPrompt('');
        return;
      }
      
      // 変更を保留状態にして承認待ちにする
      setOriginalContent(content);
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
      setContent(cleanContent);
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
      description: "元のコンテンツを維持します。",
    });
  };

  const handleDelete = async () => {
    if (!content.trim()) {
      toast({
        title: "削除対象がありません",
        description: "削除するコンテンツがありません。",
        variant: "destructive",
      });
      return;
    }

    setDeleteLoading(true);
    try {
      // コンテンツをクリア
      setContent('');
      setContentId(null);
      setIsEditing(false);
      setPendingChanges(null);
      setDiffResult(null);
      setShowDiffPreview(false);
      setOriginalContent('');

      // データベースからも削除
      if (contentId) {
        const { error: deleteError } = await supabase
          .from('project_contents')
          .delete()
          .eq('id', contentId);

        if (deleteError) {
          console.error('Failed to delete content:', deleteError);
          // エラーが発生しても、フロントエンドの状態はクリアしたままにする
        }
      }

      toast({
        title: "削除完了",
        description: "クリエイティブパーツを削除しました。",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "削除エラー",
        description: "削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!projectId) return;
    
    setSaveProgressLoading(true);
    try {
      // まずSupabaseに保存してcontentIdを設定
      await handleSave();
      
      // 次にプロジェクトの進捗を更新
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stageType: 'creative_parts',
          content: { creativeParts: content },
          status: 'クリエイティブパーツ作成中',
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast({
        title: "保存完了",
        description: "進捗が保存されました。",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "保存エラー",
        description: "データの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setSaveProgressLoading(false);
    }
  };

  const handleCompleteStage = async () => {
    if (!content.trim()) {
      toast({
        title: "コンテンツが必要です",
        description: "クリエイティブパーツを生成または編集してください。",
        variant: "destructive",
      });
      return;
    }

    setCompleteStageLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // Save content first
      const contentData = {
        project_id: projectId,
        stage_type: 'creative_parts',
        content: content,
        status: 'completed',
        is_ai_generated: true,
        created_by: user.id,
        last_edited_by: user.id,
      };

      if (contentId) {
        const { error: updateError } = await supabase
          .from('project_contents')
          .update({
            content: content,
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
          stage: 5,
          status: '広告台本生成',
          stageType: 'creative_parts',
          content: { creativeParts: content },
        }),
      });

      if (!response.ok) {
        throw new Error('ステージの更新に失敗しました');
      }

      toast({
        title: "ステージ完了",
        description: "クリエイティブパーツが保存され、最終ステージに進みます。",
      });
      
      onComplete();
    } catch (error) {
      console.error('Complete stage error:', error);
      toast({
        title: "エラー",
        description: "ステージの完了に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setCompleteStageLoading(false);
    }
  };

  // 初期ローディング中の表示
  if (initialLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            クリエイティブパーツ
          </CardTitle>
          <CardDescription className="text-gray-400">
            既存のコンテンツを読み込み中...
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
    );
  }

  // 常に編集画面を表示（判定なし）

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor - 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    クリエイティブパーツ
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    売れる要素を自動抽出：悩み指摘、ターゲット設定、行動否定、原因解説、商品コンセプト
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={content ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}>
                    {content ? "生成完了" : "編集中"}
                  </Badge>
                  <Button
                    onClick={handleSaveProgress}
                    variant="outline"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400"
                    disabled={saveProgressLoading}
                  >
                    {saveProgressLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    進捗を保存
                  </Button>
                  <Button
                    onClick={handleCompleteStage}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 z-20 relative shadow-lg"
                    disabled={completeStageLoading}
                  >
                    {completeStageLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    最終ステージに進む
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
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
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={regenerateLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${regenerateLoading ? 'animate-spin' : ''}`} />
                    {content ? '再生成' : 'コンテンツを生成'}
                  </Button>
                  {content && (
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {deleteLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      削除
                    </Button>
                  )}
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saveLoading}
                      variant="outline"
                      className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                    >
                      {saveLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      保存
                    </Button>
                  )}
                </div>
              </div>

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
                    {content ? (
                      <div>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={standardMarkdownComponents}
                        >
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>クリエイティブパーツがまだ生成されていません。</p>
                        <p className="text-sm mt-2">「コンテンツを生成」ボタンを押してパーツを生成するか、「編集」ボタンを押して手動で作成してください。</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 bg-transparent text-white resize-none focus:outline-none"
                    placeholder="クリエイティブパーツをマークダウン形式で編集..."
                    disabled={!isEditing}
                  />
                )}
              </div>

              {isEditing && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>編集モード:</strong> 売れる要素（悩み指摘、ターゲット設定、行動否定、原因解説、商品コンセプト）を調整してください。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Editing Panel - 1/3 width */}
        <div>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                AI支援編集
              </CardTitle>
              <CardDescription className="text-gray-400">
                AIに編集を依頼してクリエイティブパーツを改善できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">編集指示</Label>
                <Textarea
                  value={aiEditPrompt}
                  onChange={(e) => setAiEditPrompt(e.target.value)}
                  placeholder="例: ターゲット設定をもっと具体的にしてください"
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
        </div>
      </div>

      {content && (
        <div className="flex justify-center">
          <Button
            onClick={handleSaveProgress}
            variant="outline"
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400"
            disabled={saveProgressLoading}
          >
            {saveProgressLoading ? "保存中..." : "進捗を保存"}
          </Button>
        </div>
      )}
    </div>
  );
}