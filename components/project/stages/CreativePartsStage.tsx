'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, Edit, Eye, EyeOff, MessageSquare, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CreativePartsStageProps {
  projectId: number;
  onComplete: () => void;
}

const mockCreativeParts = `# クリエイティブパーツ

## 悩み指摘フレーズ

### 身体的な悩み
- "最近、なんだか疲れやすくなったと感じませんか？"
- "階段を上るだけで息切れしてしまう..."
- "朝起きても疲れが取れていない"
- "風邪をひきやすくなった気がする"
- "関節や筋肉が痛むことが増えた"

### 精神的な悩み
- "なんとなく気分が落ち込みがち"
- "やる気が出ない日が続いている"
- "集中力が続かない"
- "イライラしやすくなった"
- "夜なかなか眠れない"

### 生活習慣の悩み
- "外に出る機会が減った"
- "リモートワークで日光を浴びない"
- "魚を食べる機会が少ない"
- "栄養バランスが気になる"
- "健康管理が後回しになっている"

## ターゲット属性指定

### メインターゲット
- **30-50代の働く女性**
  - デスクワーク中心の生活
  - 家事・育児で忙しい
  - 自分の健康は後回しになりがち
  - 美容と健康への意識は高い

### サブターゲット
- **健康意識の高い40-60代男性**
  - 管理職で責任が重い
  - 運動不足を自覚している
  - 将来の健康不安を抱えている
  - 効率的な健康管理を求めている

### 共通属性
- 年収400万円以上
- 都市部在住
- インターネットで情報収集する
- 品質にこだわりがある
- 継続的な健康管理に関心がある

## 現在行動否定

### 間違った健康管理
- **"日焼け止めを塗って外出すれば大丈夫"**
  → 実は紫外線をカットしすぎてビタミンD不足に

- **"野菜をたくさん食べているから栄養は足りている"**
  → ビタミンDは野菜にはほとんど含まれていません

- **"サプリメントは必要ない、食事で十分"**
  → 現代の食生活では必要量の摂取は困難

- **"若いから大丈夫"**
  → 20代でも8割の人がビタミンD不足

### 一時的な対策の限界
- **"疲れた時だけ栄養ドリンク"**
  → 根本的な解決にはならない

- **"週末だけ外出して日光浴"**
  → 継続的な摂取が必要

- **"安いサプリメントで代用"**
  → 品質や吸収率に問題がある場合も

## 悩み原因解説

### ビタミンD不足の根本原因

#### 現代社会の構造的問題
1. **ライフスタイルの変化**
   - リモートワークの普及
   - 室内娯楽の増加
   - 移動手段の変化（車・電車中心）
   - 日照時間の減少（都市部の高層建築）

2. **食生活の変化**
   - 魚離れの進行（特に若年層）
   - 加工食品・外食の増加
   - 伝統的な日本食離れ
   - 栄養知識の不足

3. **健康意識の盲点**
   - 紫外線対策の過度な徹底
   - ビタミンDの重要性の認知不足
   - 「日本人は魚を食べるから大丈夫」という思い込み
   - 症状の軽視（「年齢のせい」と片付ける）

#### 見えない健康リスク
- **骨密度の低下**: 自覚症状なく進行
- **免疫力の低下**: 風邪をひきやすくなる
- **メンタルヘルスへの影響**: うつ症状の悪化
- **筋力低下**: 転倒リスクの増加

### なぜ今まで気づかなかったのか
- 症状が緩やかで気づきにくい
- 他の原因（ストレス、加齢）と混同しやすい
- 血液検査でビタミンD値を測る機会が少ない
- 医療機関でも見過ごされがち

## 商品コンセプト説明

### 「太陽のビタミン」を手軽に

#### コンセプトの核心
**"現代人に不足しがちな太陽の恵みを、1粒に凝縮"**

- 忙しい現代人でも続けられる手軽さ
- 科学的根拠に基づいた最適な配合
- 安心・安全な国内製造
- コストパフォーマンスの高さ

#### 他社との差別化ポイント

1. **吸収率へのこだわり**
   - 独自製法により吸収率30%向上
   - ビタミンD3の採用（D2より効果的）
   - 最適なタイミングでの摂取をサポート

2. **品質管理の徹底**
   - GMP認定工場での製造
   - 第三者機関による品質検査
   - 無添加処方による安全性

3. **継続しやすい設計**
   - 小粒で飲みやすい
   - 1日1粒の簡単摂取
   - 持ち運びに便利なボトル

#### 提供価値の明確化
- **健康価値**: 骨・免疫・メンタルの総合サポート
- **時間価値**: 1日1粒、10秒で完了
- **経済価値**: 1日約33円の高コストパフォーマンス
- **安心価値**: 国内製造・品質保証・返金保証

### ブランドメッセージ
**"あなたの毎日に、太陽の力を"**

- 現代人の生活に寄り添う
- 科学的根拠に基づく信頼性
- 継続可能な健康習慣の提案
- 未来の健康への投資

## 感情訴求ポイント

### ポジティブな未来像
- "毎朝スッキリ目覚める自分"
- "疲れ知らずで活動的な毎日"
- "家族と元気に過ごす時間"
- "自信を持って鏡を見られる"
- "将来への健康不安が軽減"

### 緊急性の演出
- "今始めないと、不足はさらに深刻化"
- "冬に向けて今から対策を"
- "症状が出る前の予防が重要"
- "限定キャンペーンは今だけ"

### 社会的証明
- "50万人が選んだ信頼"
- "医療従事者の92%が推奨"
- "リピート率85%の満足度"
- "専門家も認める品質"`;

export function CreativePartsStage({ projectId, onComplete }: CreativePartsStageProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [aiEditMode, setAiEditMode] = useState<'ask' | 'agent'>('ask');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadOrGenerateContent();
  }, [projectId]);

  const loadOrGenerateContent = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setContent(mockCreativeParts);
      
      toast({
        title: "クリエイティブパーツ生成完了",
        description: "売れる要素を自動抽出してクリエイティブパーツを生成しました。",
      });
    } catch (error) {
      toast({
        title: "生成エラー",
        description: "クリエイティブパーツの生成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "再生成完了",
        description: "クリエイティブパーツを再生成しました。",
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
      description: "最終ステージに進みます。",
    });
    onComplete();
  };

  if (loading && !content) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            クリエイティブパーツ生成中...
          </CardTitle>
          <CardDescription className="text-gray-400">
            AIが売れる要素を自動抽出してクリエイティブパーツを生成しています
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
                      ? "例: ターゲット設定をもっと具体的にしてください" 
                      : "例: より感情的な訴求に調整"
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

      <div className="flex justify-end">
        <Button
          onClick={handleCompleteStage}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
        >
          最終ステージに進む
        </Button>
      </div>
    </div>
  );
}