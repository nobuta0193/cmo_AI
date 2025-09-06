'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Zap, BarChart3, Sparkles, Video, Target } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CMO AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/signin')}
                className="text-white hover:bg-white/10"
              >
                ログイン
              </Button>
              <Button
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                無料で始める
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="mb-6">
            <p className="text-lg text-purple-300 font-medium">通販事業者・D2Cブランド・広告代理店向け</p>
          </div>
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            売れる広告 = 良い表現 × 良い構成
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            AIが生成する
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ショート動画広告台本
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            蓄積されたデータとヒット広告パターンを活用して、効果的なショート動画広告台本を自動生成。
            データドリブンな広告制作を実現し、組織内での効率的な制作フローを構築します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-lg px-8 py-4"
            >
              5段階ワークフローを体験する
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              サービス詳細を見る
              <Video className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Differentiation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            他のAI広告ツールとは、根本的にアプローチが違います
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            データ活用と体系的アプローチに特化したユニークな価値提案
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle className="text-white text-xl">あなたのデータを最大活用</CardTitle>
              <CardDescription className="text-gray-400">
                商品情報・ユーザーデータ・過去の広告実績を初期登録し、それらを基に台本を生成。ゼロからの発想ではなく、蓄積された情報を最大限活用します。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-4">🎯</div>
              <CardTitle className="text-white text-xl">売れた広告の構成パターンを内蔵</CardTitle>
              <CardDescription className="text-gray-400">
                過去にヒットした広告構成を分析・体系化した独自データベースを活用。『売れる表現』と『売れる構成』の掛け合わせで確実性を高めます。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-4">⚙️</div>
              <CardTitle className="text-white text-xl">初期情報→商品サマリー→教育コンテンツ→クリエイティブパーツ→台本</CardTitle>
              <CardDescription className="text-gray-400">
                思いつきではなく、戦略的に段階を踏んで台本を構築。各段階で質を高めながら、最終的に2バリエーションの台本を生成します。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Problem Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            こんな課題を抱えていませんか？
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4 mb-12">
            {[
              '毎回ゼロから広告を考えて時間がかかる',
              '過去のデータや実績を活用できていない',
              'なんとなくの感覚で広告を作っている',
              'チーム内でナレッジが共有されていない',
              'A/Bテスト用のバリエーションが作れない'
            ].map((problem, index) => (
              <div key={index} className="flex items-center justify-start text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <span className="text-red-400 text-xl mr-4">✗</span>
                <span className="text-white text-lg">{problem}</span>
              </div>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-green-300 mb-2">
              CMO AIなら、これらすべてが解決します
            </h3>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            5段階ワークフローで確実な台本制作
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            { step: '1️⃣', title: '初期情報登録', desc: '商品URL・資料・ユーザーデータを登録' },
            { step: '2️⃣', title: '商品情報サマリー', desc: '特徴・メリット・実績・オファーを自動抽出' },
            { step: '3️⃣', title: '教育コンテンツ生成', desc: '潜在ニーズを顕在化させる教育要素を作成' },
            { step: '4️⃣', title: 'クリエイティブパーツ', desc: '売れる表現の要素を自動生成' },
            { step: '5️⃣', title: '台本生成', desc: '2バリエーション同時生成・編集・評価' }
          ].map((item, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">{item.step}</div>
                <CardTitle className="text-white text-lg mb-2">{item.title}</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {item.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            なぜCMO AIが選ばれるのか
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            データドリブンなアプローチで、確実に成果を出す広告台本を生成します
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <Target className="w-12 h-12 text-purple-400 mb-4" />
              <CardTitle className="text-white text-xl">5段階生成フロー</CardTitle>
              <CardDescription className="text-gray-400">
                商品サマリー → 教育コンテンツ → クリエイティブパーツ → 広告台本の体系的な生成プロセス
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <Users className="w-12 h-12 text-pink-400 mb-4" />
              <CardTitle className="text-white text-xl">組織・チーム対応</CardTitle>
              <CardDescription className="text-gray-400">
                ロール管理、プロジェクト共有、使用量管理など、組織での利用に最適化
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white text-xl">AI支援編集</CardTitle>
              <CardDescription className="text-gray-400">
                Ask/Agentモードでの自動修正、マークダウンエディターでの直感的な編集
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-green-400 mb-4" />
              <CardTitle className="text-white text-xl">多角的評価システム</CardTitle>
              <CardDescription className="text-gray-400">
                表現・構成・情報量・教育・クリエイティブ性の6軸で台本を自動評価
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <Video className="w-12 h-12 text-blue-400 mb-4" />
              <CardTitle className="text-white text-xl">サムネイル自動生成</CardTitle>
              <CardDescription className="text-gray-400">
                DALL-E 3統合で台本に最適化されたサムネイルを各フォーマットで生成
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
              <CardTitle className="text-white text-xl">ヒット広告パターン活用</CardTitle>
              <CardDescription className="text-gray-400">
                過去の成功事例とクリエイティブパーツを活用した高精度な台本生成
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Organization Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            代理店・チーム利用に最適化
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🏢', title: '組織管理', desc: 'メンバー招待・権限管理' },
            { icon: '📈', title: '使用量管理', desc: '個人別・組織別クレジット表示' },
            { icon: '🔄', title: 'ナレッジ共有', desc: 'プロジェクト共有・過去データ活用' },
            { icon: '🔒', title: 'セキュリティ', desc: 'エンタープライズ級のデータ保護' }
          ].map((item, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <CardTitle className="text-white text-lg mb-2">{item.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {item.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            料金プラン
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            まずは1ヶ月完全無料でお試しください。その後、チーム規模に応じたプランをお選びいただけます。
          </p>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 max-w-md mx-auto mb-12">
            <div className="text-2xl font-bold text-green-300 mb-2">🎉 1ヶ月完全無料トライアル</div>
            <p className="text-green-200 text-sm">
              クレジットカード登録不要・自動課金なし<br />
              全機能をフルに体験できます
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 relative">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-white text-2xl mb-2">ベーシック</CardTitle>
              <div className="text-4xl font-bold text-white mb-2">
                ¥10,000
                <span className="text-lg font-normal text-gray-400">/月</span>
              </div>
              <p className="text-gray-400">小規模チーム向け</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>アカウント登録：最大10名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>同時使用：1名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>5段階ワークフロー</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>基本サポート</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 mt-6"
              >
                1ヶ月無料で始める
              </Button>
            </CardContent>
          </Card>

          {/* Standard Plan */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 relative border-purple-500/50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                おすすめ
              </Badge>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-white text-2xl mb-2">スタンダード</CardTitle>
              <div className="text-4xl font-bold text-white mb-2">
                ¥20,000
                <span className="text-lg font-normal text-gray-400">/月</span>
              </div>
              <p className="text-gray-400">中規模チーム向け</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>アカウント登録：最大10名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>同時使用：管理者1名 + ゲスト2名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>5段階ワークフロー</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>プロジェクト共有</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>優先サポート</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>詳細レポート機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>チャット機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>サムネイル生成機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>生成文評価機能</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 relative">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-white text-2xl mb-2">プレミアム</CardTitle>
              <div className="text-4xl font-bold text-white mb-2">
                ¥30,000
                <span className="text-lg font-normal text-gray-400">/月</span>
              </div>
              <p className="text-gray-400">大規模チーム向け</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>アカウント登録：最大10名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>同時使用：管理者1名 + ゲスト3名</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>5段階ワークフロー</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>プロジェクト共有</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>専用サポート</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>高度な分析機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>チャット機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>サムネイル生成機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>生成文評価機能</span>
                </div>
                <div className="flex items-center text-white">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>API連携</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-blue-300 mb-2">
              💡 料金プランの流れ
            </h3>
            <div className="text-blue-200 text-sm space-y-2">
              <p>1. まず1ヶ月間、完全無料でお試しください</p>
              <p>2. トライアル終了後、継続希望の場合のみプランを選択</p>
              <p>3. 自動課金はありません - 安心してお試しいただけます</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            よくある質問
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'AI使用料金はどうなりますか？',
              a: 'OpenAI（ChatGPT・DALL-E）、Claude、Gemini等のAPIキーを管理画面で設定いただきます。使用量は詳細にレポート表示されるため、コスト管理も安心です。'
            },
            {
              q: '同時に何人まで使用できますか？',
              a: 'プランによって1-3名まで同時使用可能です。プロジェクト編集時は自動ロックがかかり、データ競合を防ぎます。'
            },
            {
              q: '無料トライアル後はどうなりますか？',
              a: '自動課金はされません。継続希望の場合のみ、プラン選択いただきます。'
            },
            {
              q: 'チームメンバーの管理はどうしますか？',
              a: '最大10名まで登録可能で、管理者が権限を設定できます。誰がどの機能を使ったかも追跡可能です。'
            }
          ].map((faq, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Q: {faq.q}</CardTitle>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  A: {faq.a}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎉 今すぐ1ヶ月完全無料トライアルを開始
            </h2>
            <p className="text-gray-400 text-lg mb-2 max-w-3xl mx-auto">
              <strong className="text-white">クレジットカード登録不要・自動課金なし</strong><br />
              3分でチーム招待まで完了
            </p>
            <p className="text-gray-400 text-lg mb-8 max-w-3xl mx-auto">
              実際にデータを使った台本制作プロセスを体験できます
            </p>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 max-w-md mx-auto mb-8">
              <div className="text-lg font-bold text-green-300 mb-1">完全無料期間中に体験できること</div>
              <div className="text-green-200 text-sm space-y-1">
                <p>✓ 5段階ワークフローの全機能</p>
                <p>✓ チームメンバー招待（最大10名）</p>
                <p>✓ プロジェクト作成・共有</p>
                <p>✓ 2バリエーション台本生成</p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-lg px-8 py-4"
            >
              🚀 今すぐ1ヶ月無料で始める
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-gray-500 text-sm mt-4">
              ※トライアル終了後、自動で有料プランに移行することはありません<br />
              継続希望の場合のみ、お好きなプランをお選びいただけます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}