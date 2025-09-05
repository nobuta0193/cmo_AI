'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, RefreshCw, Edit, Eye, EyeOff, MessageSquare, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EducationContentStageProps {
  projectId: number;
  onComplete: () => void;
}

const mockEducationContent = `# 教育コンテンツサマリー

## 潜在ニーズの顕在化

### ビタミンD不足の現実
現代人の約8割がビタミンD不足に陥っているという事実をご存知ですか？

#### なぜビタミンD不足が起こるのか
1. **室内生活の増加**
   - リモートワークの普及により日光を浴びる機会が激減
   - 1日の大半を室内で過ごす現代のライフスタイル
   - 紫外線対策の徹底により、皮膚でのビタミンD合成が不足

2. **食事からの摂取不足**
   - 魚類の摂取量減少（特に若年層）
   - 加工食品中心の食生活
   - ビタミンDを多く含む食材の認知不足

3. **季節による影響**
   - 冬季は日照時間が短く、紫外線量も不足
   - 地域による日照時間の差
   - 曇りや雨の日が続くとさらに不足

### 見過ごされがちな症状
多くの人が「年齢のせい」「疲れのせい」と思っている症状が、実はビタミンD不足が原因かもしれません。

#### 初期症状
- なんとなく疲れやすい
- 気分が落ち込みがち
- 風邪をひきやすくなった
- 筋肉痛や関節痛が気になる

#### 進行すると
- 骨密度の低下
- 免疫力の著しい低下
- うつ症状の悪化
- 筋力低下による転倒リスク増加

## 顧客教育要素

### ビタミンDの重要性を理解する

#### 「太陽のビタミン」と呼ばれる理由
ビタミンDは他のビタミンとは異なり、体内でホルモンのような働きをする特別な栄養素です。

1. **骨の健康維持**
   - カルシウムの吸収率を3倍向上
   - 骨密度の維持・向上
   - 骨粗鬆症の予防効果

2. **免疫システムの調整**
   - 免疫細胞の活性化
   - 自己免疫疾患のリスク軽減
   - 感染症への抵抗力向上

3. **メンタルヘルスへの影響**
   - セロトニン生成のサポート
   - 季節性うつ病の改善
   - 認知機能の維持

#### 適切な摂取量の重要性
- **厚生労働省推奨量**: 1日8.5μg（340IU）
- **実際の必要量**: 専門家は1日25μg（1000IU）を推奨
- **上限量**: 1日100μg（4000IU）まで安全

### なぜサプリメントが必要なのか

#### 食事だけでは限界がある
ビタミンDを多く含む食材は限られており、必要量を食事だけで摂取するのは現実的ではありません。

**必要量を食事で摂取する場合の例**
- サンマ: 約4匹分
- 卵黄: 約20個分
- しいたけ: 約2kg分

#### 日光浴の現実的な困難
- 必要な日光浴時間: 夏場で15-30分、冬場で1-2時間
- 紫外線による皮膚がんリスク
- 天候や季節に左右される不安定性
- 都市部での大気汚染の影響

## 商品価値の理解促進

### なぜこのサプリメントを選ぶべきなのか

#### 高品質へのこだわり
1. **ビタミンD3の採用**
   - D2よりも体内利用率が高い
   - 血中濃度の維持期間が長い
   - より自然な形のビタミンD

2. **最適な配合量**
   - 1粒1000IUの理想的な配合
   - 過剰摂取のリスクなし
   - 継続しやすい適量設計

3. **吸収率向上技術**
   - 独自の製法により吸収率30%向上
   - 胃腸への負担軽減
   - 効果実感までの期間短縮

#### 安心・安全への取り組み
- **GMP認定工場での製造**
- **第三者機関による品質検査**
- **国内製造による品質管理**
- **無添加処方による安全性**

### 投資対効果の高さ

#### 健康への投資として
- **1日約33円**: コーヒー1杯以下の価格
- **予防医学の観点**: 将来の医療費削減効果
- **QOL向上**: 生活の質の大幅な改善

#### 他の対策との比較
- **日焼けサロン**: 月額8,000円〜、皮膚がんリスク
- **高級食材**: 毎日摂取で月額15,000円〜
- **当サプリメント**: 月額約1,000円で確実な摂取

## 行動変容への導き

### 「知らなかった」から「今すぐ始めたい」へ

#### 今すぐ始めるべき理由
1. **季節の影響**: 冬に向けてビタミンD不足はさらに深刻化
2. **蓄積効果**: 継続することで体内貯蔵量が安定
3. **予防効果**: 症状が出る前の対策が最も効果的

#### 簡単な始め方
- **1日1粒**: 忘れにくい朝食後の習慣化
- **持ち運び便利**: 外出先でも継続可能
- **副作用なし**: 安心して長期継続できる

### 成功事例による説得力

#### 実際の利用者の声
- 「3ヶ月で疲れにくくなった」（40代女性）
- 「風邪をひく回数が激減」（30代男性）
- 「気分の落ち込みが改善」（50代女性）

#### 専門家の推奨
- 栄養学博士による効果の科学的根拠
- 医療従事者の92%が推奨する理由
- 継続率85%の高い満足度`;

export function EducationContentStage({ projectId, onComplete }: EducationContentStageProps) {
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
      setContent(mockEducationContent);
      
      toast({
        title: "教育コンテンツ生成完了",
        description: "顧客教育要素を抽出してコンテンツを生成しました。",
      });
    } catch (error) {
      toast({
        title: "生成エラー",
        description: "教育コンテンツの生成に失敗しました。",
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
        description: "教育コンテンツを再生成しました。",
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
      description: "次のステージに進みます。",
    });
    onComplete();
  };

  if (loading && !content) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            教育コンテンツ生成中...
          </CardTitle>
          <CardDescription className="text-gray-400">
            AIが顧客教育要素を抽出してコンテンツを生成しています
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
                    <GraduationCap className="w-5 h-5 mr-2" />
                    教育コンテンツサマリー
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    潜在ニーズの顕在化と顧客教育要素を抽出したコンテンツ
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
                    placeholder="教育コンテンツをマークダウン形式で編集..."
                    disabled={!isEditing}
                  />
                )}
              </div>

              {isEditing && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>編集モード:</strong> 顧客の潜在ニーズを顕在化し、商品価値の理解を促進する内容に編集してください。
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
                AIに編集を依頼してコンテンツを改善できます
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
                      ? "例: もっと具体的な数値データを追加してください" 
                      : "例: 説得力を高める"
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
          次のステージに進む
        </Button>
      </div>
    </div>
  );
}