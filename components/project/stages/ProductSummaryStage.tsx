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

interface ProductSummaryStageProps {
  projectId: number;
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
  const [loading, setLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'ask' | 'agent'>('ask');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const { toast } = useToast();

  const loadOrGenerateContent = async () => {
    setLoading(true);
    try {
      // TODO: Check if content already exists in Supabase
      // If not, generate new content
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI generation
      setContent(mockGeneratedContent);
      
      toast({
        title: "商品情報サマリー生成完了",
        description: "AIが商品情報を分析してサマリーを生成しました。",
      });
    } catch (error) {
      toast({
        title: "生成エラー",
        description: "商品情報サマリーの生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      // TODO: Call AI API to regenerate content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "再生成完了",
        description: "商品情報サマリーを再生成しました。",
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
      // TODO: Save content to Supabase
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

  const handleCompleteStage = () => {
    toast({
      title: "ステージ完了",
      description: "次のステージに進みます。",
    });
    onComplete();
  };

  if (!content) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="w-5 h-5 mr-2" />
            商品情報サマリー
          </CardTitle>
          <CardDescription className="text-gray-400">
            登録されたデータから商品情報サマリーを生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
              <Skeleton className="h-32 w-full bg-white/10" />
              <Skeleton className="h-4 w-2/3 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </>
          ) : (
            <div className="text-center py-8">
              <Button
                onClick={loadOrGenerateContent}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
              >
                サマリーを生成
              </Button>
              <p className="mt-4 text-sm text-gray-400">
                AIが商品の特徴、メリット、実績、オファー情報を分析・整理します
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    生成完了
                  </Badge>
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
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    再生成
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
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                {showPreview ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
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
      <div className="flex justify-end">
        <Button
          onClick={handleCompleteStage}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
        >
          次のステージに進む
        </Button>
      </div>
    </div>
  );
}