'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, RefreshCw, Edit, Eye, EyeOff, MessageSquare, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createBrowserClient } from '@supabase/ssr';

interface ProductSummaryStageProps {
  projectId: string;
  onComplete: () => void;
}

const mockGeneratedContent = `# 商品情報サマリー

## サービスの特徴

### 主要な特徴
- **高品質なビタミンD3配合**: 1粒あたり1000IUの高濃度ビタミンD3を配合
- **吸収率向上**: 独自の製法により体内吸収率を30%向上
- **無添加処方**: 人工着色料、保存料、香料を一切使用しない安心設計
- **小粒設計**: 飲みやすい小粒タイプで継続しやすい

### 品質管理
- GMP認定工場での製造
- 第三者機関による品質検査実施
- 国内製造による安心・安全

## ユーザーメリット

### 健康面でのメリット
1. **骨の健康維持**: カルシウムの吸収を促進し、骨密度の維持をサポート
2. **免疫力向上**: ビタミンDの免疫調整機能により、体の防御力を強化
3. **筋力維持**: 筋肉の機能維持に必要なビタミンDを効率的に補給
4. **気分の安定**: セロトニンの生成をサポートし、メンタルヘルスにも貢献

### 生活面でのメリット
- **手軽な摂取**: 1日1粒で必要量を摂取可能
- **コストパフォーマンス**: 1日あたり約33円の経済的な価格設定
- **持ち運び便利**: 小さなボトルで外出先でも摂取しやすい

## 実績・権威性

### 販売実績
- **累計販売数**: 50万個突破（2024年1月時点）
- **リピート率**: 85%の高いリピート率
- **顧客満足度**: 4.8/5.0の高評価

### 専門家の推奨
- 栄養学博士 田中先生による推奨コメント
- 日本栄養士会認定栄養士による品質評価
- 医療従事者の92%が推奨

### メディア掲載
- 健康雑誌「ヘルスケア」特集記事掲載
- テレビ番組「健康の秘訣」で紹介
- インフルエンサー100名以上が愛用

## オファー情報

### 特別価格キャンペーン
- **通常価格**: 3,980円（税込）
- **初回限定価格**: 1,980円（税込）50%OFF
- **定期コース**: 2回目以降も20%OFF（3,184円）

### 特典内容
1. **送料無料**: 全国どこでも送料無料
2. **30日間返金保証**: 満足いただけない場合は全額返金
3. **定期コース特典**: 
   - いつでも解約・変更可能
   - お届け周期の調整可能
   - 専用サポートダイヤル利用可能

### 限定特典
- **今だけ**: ビタミンD摂取ガイドブック無料プレゼント
- **先着1000名**: オリジナルピルケースプレゼント
- **LINE友達追加**: 500円OFFクーポン配布中`;

export function ProductSummaryStage({ projectId, onComplete }: ProductSummaryStageProps) {
  const [content, setContent] = useState('');
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [saveProgressLoading, setSaveProgressLoading] = useState(false);
  const [completeStageLoading, setCompleteStageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'ask' | 'agent'>('ask');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentId, setContentId] = useState<string | null>(null);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // コンポーネントマウント時に既存のコンテンツを読み込む
  useEffect(() => {
    const loadExistingContent = async () => {
      if (!projectId) {
        console.log('ProductSummaryStage: No projectId provided');
        return;
      }
      
      setInitialLoading(true);
      
      // コンテンツとIDを初期化
      setContent('');
      setContentId(null);
      
      try {
        const { data: existingContent, error } = await supabase
          .from('project_contents')
          .select('id, content')
          .eq('project_id', projectId)
          .eq('stage_type', 'product_summary')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        if (existingContent && existingContent.length > 0) {
          const latestContent = existingContent[0];
          // contentが文字列の場合はそのまま、オブジェクトの場合はJSONパース
          let contentText = '';
          if (typeof latestContent.content === 'string') {
            // まずはそのまま設定してみる
            contentText = latestContent.content;
            
            // JSONオブジェクトとして解析を試みる
            try {
              const parsed = JSON.parse(latestContent.content);
              if (parsed.summary) {
                contentText = parsed.summary;
              }
            } catch {
              // JSON解析に失敗した場合は、文字列のまま使用
            }
          }
          
          setContent(contentText);
          setContentId(latestContent.id);
        }
      } catch (error) {
        console.error('ProductSummaryStage: Failed to load existing content:', error);
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
    setRegenerateLoading(true);
    try {
      // AIサマリー生成APIを呼び出し
      const response = await fetch(`/api/projects/${projectId}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成に失敗しました');
      }

      const result = await response.json();
      setContent(result.summary);
      setContentId(result.contentId);
      
      // 生成後に自動的に進捗を保存
      await handleSaveProgress();
      
      toast({
        title: content ? "再生成完了" : "生成完了",
        description: content ? `商品情報サマリーを再生成しました。（使用モデル: ${result.model}）` : `商品情報サマリーを生成しました。（使用モデル: ${result.model}）`,
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: content ? "再生成エラー" : "生成エラー",
        description: error instanceof Error ? error.message : (content ? "再生成に失敗しました。" : "生成に失敗しました。"),
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
        stage_type: 'product_summary',
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

    setAiEditLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement AI editing API call
      const editedContent = content + '\n\n<!-- AI編集が適用されました -->';
      setContent(editedContent);
      
      toast({
        title: "AI編集完了",
        description: `${aiEditMode === 'ask' ? 'Ask' : 'Agent'}モードで編集を適用しました。`,
      });
      
      setAiEditPrompt('');
    } catch (error) {
      toast({
        title: "AI編集エラー",
        description: "編集に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setAiEditLoading(false);
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
          stageType: 'product_summary',
          content: { summary: content },
          status: '商品情報サマリー作成中',
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
    if (!projectId) return;
    
    setCompleteStageLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // Save content first
      const contentData = {
        project_id: projectId,
        stage_type: 'product_summary',
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
          stage: 3,
          status: '教育コンテンツ',
          stageType: 'product_summary',
          content: { summary: content },
        }),
      });

      if (!response.ok) {
        throw new Error('ステージの更新に失敗しました');
      }

      toast({
        title: "ステージ完了",
        description: "内容を保存し、次のステージに進みます。",
      });
      
      onComplete();
    } catch (error) {
      console.error('Failed to complete stage:', error);
      toast({
        title: "エラー",
        description: "ステージの完了に失敗しました。もう一度お試しください。",
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
            <Package className="w-5 h-5 mr-2" />
            商品情報サマリー
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
                    <Package className="w-5 h-5 mr-2" />
                    商品情報サマリー
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    登録されたデータから商品の特徴、メリット、実績、オファー情報を整理
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
                     次のステージに進む
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
                {showPreview ? (
                  <div className="prose prose-invert max-w-none">
                    {content ? (
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>商品情報サマリーがまだ生成されていません。</p>
                        <p className="text-sm mt-2">「コンテンツを生成」ボタンを押してサマリーを生成するか、「編集」ボタンを押して手動で作成してください。</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 bg-transparent text-white resize-none focus:outline-none"
                    placeholder="商品情報サマリーをマークダウン形式で編集..."
                    disabled={!isEditing}
                  />
                )}
              </div>

              {isEditing && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>編集モード:</strong> マークダウン記法を使用して内容を編集できます。
                    見出しは # を使用し、リストは - や 1. を使用してください。
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
                AIに編集を依頼してサマリーを改善できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">編集モード</Label>
                <Select value={aiEditMode} onValueChange={(value: 'ask' | 'agent') => setAiEditMode(value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ask">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Askモード（Q&A形式）
                      </div>
                    </SelectItem>
                    <SelectItem value="agent">
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-2" />
                        Agentモード（自動修正）
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">編集指示</Label>
                <Textarea
                  value={aiEditPrompt}
                  onChange={(e) => setAiEditPrompt(e.target.value)}
                  placeholder={
                    aiEditMode === 'ask' 
                      ? "例: オファー情報をもっと魅力的にしてください" 
                      : "例: B2B向けに調整"
                  }
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleAiEdit}
                disabled={aiEditLoading || !aiEditPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {aiEditLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    AI編集中...
                  </>
                ) : (
                  <>
                    {aiEditMode === 'ask' ? <MessageSquare className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                    AI編集実行
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>Askモード:</strong> 具体的な修正依頼を入力</p>
                <p><strong>Agentモード:</strong> AIが自動で最適化提案</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Complete Stage Button */}
       <div className="flex justify-end space-x-2">
         <Button
           onClick={handleSave}
           variant="outline"
           className="border-white/30 text-white hover:bg-white/10"
           disabled={saveLoading}
         >
           {saveLoading ? (
             <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
           ) : null}
           保存
         </Button>
         <Button
           onClick={handleCompleteStage}
           className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
           disabled={completeStageLoading}
         >
           {completeStageLoading ? (
             <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
           ) : null}
           保存して次へ
         </Button>
       </div>
    </div>
  );
}