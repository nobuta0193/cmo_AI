'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, RefreshCw, Edit, Eye, EyeOff, Wand2, Copy, Download, MessageSquare, Bot, Image, Sparkles } from 'lucide-react';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ScriptGenerationStageProps {
  projectId: number;
  onComplete: () => void;
}

const mockScript1 = `# ショート動画広告台本 - バリエーション A

## 基本情報
- **動画尺**: 30秒
- **ターゲット**: 30-50代働く女性
- **プラットフォーム**: Instagram Reels / TikTok
- **話者**: 女性（実体験説明パターン）

## 台本

### オープニング（0-3秒）
**[画面]** 疲れた表情でデスクに向かう女性
**[ナレーション]** 「最近、なんだか疲れやすくて...」

### 問題提起（3-8秒）
**[画面]** 階段を上がって息切れする様子
**[ナレーション]** 「階段上るだけで息切れするし、風邪もひきやすくなった。これって年齢のせい？」

### 原因解明（8-15秒）
**[画面]** 室内で過ごす日常、日光が入らない部屋
**[ナレーション]** 「実は現代人の8割がビタミンD不足。リモートワークで日光を浴びないのが原因だったんです」

### 解決策提示（15-22秒）
**[画面]** サプリメントを手に取る、商品パッケージ
**[ナレーション]** 「そこで始めたのがこのビタミンDサプリ。1日1粒で太陽の恵みを手軽に摂取」

### 効果実感（22-27秒）
**[画面]** 元気に階段を上る、笑顔で仕事をする様子
**[ナレーション]** 「3ヶ月続けたら疲れにくくなって、風邪もひかなくなりました！」

### クロージング（27-30秒）
**[画面]** 商品パッケージ、特別価格表示
**[ナレーション]** 「今なら初回50%OFF！あなたも太陽の力を実感してみませんか？」

## 演出ポイント
- **リアリティ重視**: 実際の生活シーンを使用
- **共感性**: ターゲットが「あるある」と思える内容
- **科学的根拠**: 8割という具体的数値で説得力向上
- **ビフォーアフター**: 変化を視覚的に表現

## キーメッセージ
1. 疲れやすさの原因はビタミンD不足
2. 現代人の8割が不足している
3. 1日1粒で手軽に解決
4. 実際に効果を実感できる`;

const mockScript2 = `# ショート動画広告台本 - バリエーション B

## 基本情報
- **動画尺**: 30秒
- **ターゲット**: 30-50代働く女性
- **プラットフォーム**: Instagram Reels / TikTok
- **話者**: 女性（教育・解説パターン）

## 台本

### 衝撃の事実（0-5秒）
**[画面]** 統計グラフ、驚く女性の表情
**[ナレーション]** 「知ってました？現代人の8割がビタミンD不足で、それが疲れやすさの原因だったんです」

### 問題の深刻さ（5-12秒）
**[画面]** 室内で過ごす人々、日焼け止めを塗る様子
**[ナレーション]** 「リモートワークに日焼け止め...太陽の恵みを受けられない現代生活。でも食事だけでは限界が」

### 食事の限界（12-18秒）
**[画面]** サンマ4匹、卵20個の映像
**[ナレーション]** 「必要量を摂るにはサンマ4匹、卵なら20個分！現実的じゃないですよね」

### 解決策（18-25秒）
**[画面]** サプリメント、1000IUの表示
**[ナレーション]** 「だからこのサプリ。1粒1000IUで理想的な摂取量。吸収率も30%アップの特別製法」

### 行動促進（25-30秒）
**[画面]** 特別価格、返金保証のテキスト
**[ナレーション]** 「今なら初回50%OFF、30日間返金保証付き。太陽の力で健康な毎日を始めませんか？」

## 演出ポイント
- **教育的アプローチ**: 知識を提供して納得感を演出
- **具体的数値**: 8割、4匹、20個など印象に残る数字
- **比較効果**: 食事との比較でサプリの優位性を強調
- **安心感**: 返金保証で購入ハードルを下げる

## キーメッセージ
1. 8割の人がビタミンD不足という事実
2. 食事だけでは現実的に摂取困難
3. サプリなら1粒で理想的な摂取
4. 特別製法で吸収率向上`;

export function ScriptGenerationStage({ projectId, onComplete }: ScriptGenerationStageProps) {
  const [scripts, setScripts] = useState({ script1: '', script2: '' });
  const [selectedScript, setSelectedScript] = useState<'script1' | 'script2'>('script1');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'ask' | 'agent'>('ask');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [thumbnails, setThumbnails] = useState<Array<{
    id: string;
    url: string;
    ratio: string;
    prompt: string;
    createdAt: string;
  }>>([]);
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('9:16');
  const [evaluations, setEvaluations] = useState<{
    script1: {
      expression: number;
      structure: number;
      information: number;
      quality: number;
      education: number;
      creative: number;
      total: number;
      comment: string;
    } | null;
    script2: {
      expression: number;
      structure: number;
      information: number;
      quality: number;
      education: number;
      creative: number;
      total: number;
      comment: string;
    } | null;
  }>({ script1: null, script2: null });
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrGenerateScripts();
  }, [projectId]);

  const loadOrGenerateScripts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setScripts({
        script1: mockScript1,
        script2: mockScript2
      });
      
      toast({
        title: "広告台本生成完了",
        description: "2つのバリエーションの広告台本を生成しました。",
      });
    } catch (error) {
      toast({
        title: "生成エラー",
        description: "広告台本の生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSelected = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "再生成完了",
        description: `バリエーション${selectedScript === 'script1' ? 'A' : 'B'}を再生成しました。`,
      });
    } catch (error) {
      toast({
        title: "再生成エラー",
        description: "再生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBoth = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "再生成完了",
        description: "両方のバリエーションを再生成しました。",
      });
    } catch (error) {
      toast({
        title: "再生成エラー",
        description: "再生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    const currentScript = selectedScript === 'script1' ? scripts.script1 : scripts.script2;
    navigator.clipboard.writeText(currentScript);
    toast({
      title: "コピー完了",
      description: "台本をクリップボードにコピーしました。",
    });
  };

  const handleExportScript = () => {
    const currentScript = selectedScript === 'script1' ? scripts.script1 : scripts.script2;
    const blob = new Blob([currentScript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${selectedScript}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "エクスポート完了",
      description: "台本をダウンロードしました。",
    });
  };

  const handleCompleteStage = () => {
    toast({
      title: "プロジェクト完了",
      description: "すべてのステージが完了しました！",
    });
    onComplete();
  };

  const handleEvaluateScript = async (scriptType: 'script1' | 'script2') => {
    setEvaluationLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Implement AI evaluation API call
      const mockEvaluation = {
        expression: Math.floor(Math.random() * 3) + 8, // 8-10点
        structure: Math.floor(Math.random() * 3) + 7, // 7-9点
        information: Math.floor(Math.random() * 3) + 8, // 8-10点
        quality: Math.floor(Math.random() * 3) + 8, // 8-10点
        education: Math.floor(Math.random() * 3) + 7, // 7-9点
        creative: Math.floor(Math.random() * 3) + 8, // 8-10点
        total: 0,
        comment: `バリエーション${scriptType === 'script1' ? 'A' : 'B'}の評価結果：\n\n**強み**\n- 魅力的な表現で視聴者の関心を引く構成\n- 論理的な流れで説得力がある\n- 適切な情報量で飽きさせない\n\n**改善点**\n- より具体的な数値データの活用\n- 感情的な訴求をさらに強化\n- クリエイティブな要素の追加検討\n\n**総合評価**\nターゲットに響く効果的な台本として高く評価できます。`
      };
      
      mockEvaluation.total = Math.round(
        (mockEvaluation.expression + mockEvaluation.structure + mockEvaluation.information + 
         mockEvaluation.quality + mockEvaluation.education + mockEvaluation.creative) / 6 * 10
      ) / 10;
      
      setEvaluations(prev => ({
        ...prev,
        [scriptType]: mockEvaluation
      }));
      
      toast({
        title: "評価完了",
        description: `バリエーション${scriptType === 'script1' ? 'A' : 'B'}の評価が完了しました。`,
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

    setAiEditLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement AI editing API call
      const currentScript = getCurrentScript();
      const editedScript = currentScript + '\n\n<!-- AI編集が適用されました -->';
      updateCurrentScript(editedScript);
      
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

  const handleGenerateThumbnail = async () => {
    setThumbnailLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Implement DALL-E 3 API call
      const newThumbnail = {
        id: Date.now().toString(),
        url: `https://picsum.photos/400/600?random=${Date.now()}`, // Mock image
        ratio: selectedRatio,
        prompt: thumbnailPrompt || '自動生成されたプロンプト',
        createdAt: new Date().toISOString(),
      };
      
      setThumbnails(prev => [newThumbnail, ...prev]);
      
      toast({
        title: "サムネイル生成完了",
        description: `${selectedRatio}比率のサムネイルを生成しました。`,
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
    return selectedScript === 'script1' ? scripts.script1 : scripts.script2;
  };

  const updateCurrentScript = (content: string) => {
    setScripts(prev => ({
      ...prev,
      [selectedScript]: content
    }));
  };

  if (loading && !scripts.script1) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Video className="w-5 h-5 mr-2" />
            広告台本生成中...
          </CardTitle>
          <CardDescription className="text-gray-400">
            AIが2つのバリエーションの広告台本を生成しています
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

  return (
    <div className="space-y-6">
      {/* Custom Instructions */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wand2 className="w-5 h-5 mr-2" />
            詳細指示（オプション）
          </CardTitle>
          <CardDescription className="text-gray-400">
            特別な要望がある場合は、こちらに詳細を記入してください
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
              onClick={handleRegenerateBoth}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              指示を反映して再生成
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
                    広告台本（2バリエーション）
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    異なるアプローチの2つの台本から選択・編集できます
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    生成完了
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedScript} onValueChange={(value) => setSelectedScript(value as 'script1' | 'script2')}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/10">
                    <TabsTrigger value="script1" className="data-[state=active]:bg-white/20">
                      バリエーション A
                    </TabsTrigger>
                    <TabsTrigger value="script2" className="data-[state=active]:bg-white/20">
                      バリエーション B
                    </TabsTrigger>
                  </TabsList>
                  
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateSelected}
                      disabled={loading}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                      >
                        保存
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEvaluateScript(selectedScript)}
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

                <TabsContent value="script1" className="mt-0">
                  <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                    {showPreview ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {scripts.script1}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <textarea
                        value={scripts.script1}
                        onChange={(e) => updateCurrentScript(e.target.value)}
                        className="w-full h-96 bg-transparent text-white resize-none focus:outline-none"
                        placeholder="広告台本をマークダウン形式で編集..."
                        disabled={!isEditing}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="script2" className="mt-0">
                  <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                    {showPreview ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {scripts.script2}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <textarea
                        value={scripts.script2}
                        onChange={(e) => updateCurrentScript(e.target.value)}
                        className="w-full h-96 bg-transparent text-white resize-none focus:outline-none"
                        placeholder="広告台本をマークダウン形式で編集..."
                        disabled={!isEditing}
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {isEditing && (
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
                        ? "例: もっとカジュアルなトーンにしてください" 
                        : "例: 20代女性向けに調整"
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

            {/* サムネイル生成 */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Image className="w-5 h-5 mr-2" />
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
                          <img 
                            src={thumbnail.url} 
                            alt="Generated thumbnail"
                            className="w-full h-24 object-cover rounded"
                          />
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
                {evaluations[selectedScript] ? (
                  <div className="space-y-4">
                    {/* Total Score */}
                    <div className="text-center p-4 border border-white/10 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-white mb-1">
                        {evaluations[selectedScript]!.total}
                      </div>
                      <div className="text-sm text-gray-400">総合スコア</div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-3">
                      {[
                        { key: 'expression', label: '表現', score: evaluations[selectedScript]!.expression },
                        { key: 'structure', label: '構成', score: evaluations[selectedScript]!.structure },
                        { key: 'information', label: '情報量', score: evaluations[selectedScript]!.information },
                        { key: 'quality', label: '情報の質', score: evaluations[selectedScript]!.quality },
                        { key: 'education', label: '教育', score: evaluations[selectedScript]!.education },
                        { key: 'creative', label: 'クリエイティブ', score: evaluations[selectedScript]!.creative }
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
                            {evaluations[selectedScript]!.comment}
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
                      onClick={() => handleEvaluateScript(selectedScript)}
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

      {/* Additional Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleRegenerateBoth}
          disabled={loading}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          両方のバリエーションを再生成
        </Button>
        
        <Button
          onClick={handleCompleteStage}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
        >
          プロジェクト完了
        </Button>
      </div>
    </div>
  );
}