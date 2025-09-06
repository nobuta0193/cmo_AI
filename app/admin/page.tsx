'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import APISettings from '@/components/admin/APISettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Building, 
  CreditCard, 
  Settings, 
  Lock,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: '田中太郎',
    email: 'tanaka@example.com',
    role: 'admin',
    status: 'active',
    organization: '株式会社サンプル',
    credits: 2450,
    lastLogin: '2024-01-16',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'member',
    status: 'active',
    organization: '株式会社サンプル',
    credits: 1200,
    lastLogin: '2024-01-15',
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    name: '山田次郎',
    email: 'yamada@example.com',
    role: 'guest',
    status: 'inactive',
    organization: 'マーケティング株式会社',
    credits: 800,
    lastLogin: '2024-01-10',
    createdAt: '2024-01-08'
  }
];

const mockOrganizations = [
  {
    id: 1,
    name: '株式会社サンプル',
    plan: 'スタンダード',
    members: 8,
    projects: 12,
    credits: 5000,
    usedCredits: 3200,
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'マーケティング株式会社',
    plan: 'ベーシック',
    members: 3,
    projects: 5,
    credits: 2000,
    usedCredits: 800,
    status: 'active',
    createdAt: '2024-01-05'
  }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: `ユーザー${action}`,
      description: `ユーザーID: ${userId} の${action}を実行しました。`,
    });
  };

  const handleOrganizationAction = (action: string, orgId: number) => {
    toast({
      title: `組織${action}`,
      description: `組織ID: ${orgId} の${action}を実行しました。`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shield className="w-8 h-8 mr-3 text-orange-400" />
              管理者画面
            </h1>
            <p className="text-gray-400 mt-1">システム全体の管理と監視</p>
          </div>
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            管理者権限
          </Badge>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              概要
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20">
              ユーザー管理
            </TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-white/20">
              組織管理
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white/20">
              課金管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
              システム設定
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20">
              セキュリティ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">総ユーザー数</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <p className="text-xs text-green-400">+12% 今月</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">アクティブ組織</CardTitle>
                  <Building className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">89</div>
                  <p className="text-xs text-green-400">+5% 今月</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">月間売上</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">¥1,780,000</div>
                  <p className="text-xs text-green-400">+18% 今月</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">システム稼働率</CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <p className="text-xs text-green-400">正常稼働中</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">最近のアクティビティ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2分前', action: '新規ユーザー登録', user: 'user@example.com' },
                    { time: '15分前', action: 'プロジェクト作成', user: '田中太郎' },
                    { time: '1時間前', action: '課金プラン変更', user: '株式会社サンプル' },
                    { time: '3時間前', action: 'システムメンテナンス完了', user: 'システム' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div>
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-gray-400 text-xs">{activity.user}</p>
                      </div>
                      <span className="text-gray-500 text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">ユーザー管理</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  エクスポート
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  ユーザー追加
                </Button>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">ユーザー</TableHead>
                      <TableHead className="text-gray-300">役割</TableHead>
                      <TableHead className="text-gray-300">ステータス</TableHead>
                      <TableHead className="text-gray-300">組織</TableHead>
                      <TableHead className="text-gray-300">クレジット</TableHead>
                      <TableHead className="text-gray-300">最終ログイン</TableHead>
                      <TableHead className="text-gray-300">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id} className="border-white/10">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.role === 'admin' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                            user.role === 'member' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }>
                            {user.role === 'admin' ? '管理者' : user.role === 'member' ? 'メンバー' : 'ゲスト'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            'bg-red-500/20 text-red-300 border-red-500/30'
                          }>
                            {user.status === 'active' ? 'アクティブ' : '非アクティブ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{user.organization}</TableCell>
                        <TableCell className="text-gray-300">{user.credits.toLocaleString()}</TableCell>
                        <TableCell className="text-gray-300">{new Date(user.lastLogin).toLocaleDateString('ja-JP')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUserAction('編集', user.id)}
                              className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUserAction('削除', user.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">組織管理</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                組織追加
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockOrganizations.map((org) => (
                <Card key={org.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{org.name}</CardTitle>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {org.plan}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">メンバー数</p>
                        <p className="text-white font-semibold">{org.members}名</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">プロジェクト数</p>
                        <p className="text-white font-semibold">{org.projects}件</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">クレジット使用量</span>
                        <span className="text-white">{org.usedCredits.toLocaleString()} / {org.credits.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                          style={{width: `${(org.usedCredits / org.credits) * 100}%`}}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOrganizationAction('編集', org.id)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOrganizationAction('詳細', org.id)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        詳細
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">課金管理</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">月間売上</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">¥1,780,000</div>
                  <p className="text-green-400 text-sm">+18% 前月比</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">アクティブ課金</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">89</div>
                  <p className="text-blue-400 text-sm">組織</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">平均単価</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">¥20,000</div>
                  <p className="text-purple-400 text-sm">月額</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">プラン別統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'ベーシック', count: 25, revenue: 250000, color: 'bg-blue-500' },
                    { plan: 'スタンダード', count: 45, revenue: 900000, color: 'bg-purple-500' },
                    { plan: 'プレミアム', count: 19, revenue: 570000, color: 'bg-pink-500' }
                  ].map((item) => (
                    <div key={item.plan} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <div>
                          <p className="text-white font-medium">{item.plan}</p>
                          <p className="text-gray-400 text-sm">{item.count}組織</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">¥{item.revenue.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">月間売上</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">システム設定</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <APISettings />

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">システム制限</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">新規登録を許可</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">メンテナンスモード</Label>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">最大プロジェクト数</Label>
                    <Input 
                      type="number" 
                      defaultValue="100" 
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">メンテナンス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    キャッシュクリア
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    ログダウンロード
                  </Button>
                  <Button variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    システム再起動
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">セキュリティ</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">セキュリティ設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">2要素認証を強制</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">IPアドレス制限</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">セッションタイムアウト</Label>
                    <Select defaultValue="24">
                      <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1時間</SelectItem>
                        <SelectItem value="8">8時間</SelectItem>
                        <SelectItem value="24">24時間</SelectItem>
                        <SelectItem value="168">1週間</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">監査ログ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '2024-01-16 14:30', action: 'ユーザーログイン', user: 'admin@example.com', ip: '192.168.1.1' },
                      { time: '2024-01-16 14:25', action: '設定変更', user: 'admin@example.com', ip: '192.168.1.1' },
                      { time: '2024-01-16 14:20', action: 'ユーザー作成', user: 'admin@example.com', ip: '192.168.1.1' }
                    ].map((log, index) => (
                      <div key={index} className="text-sm border-b border-white/10 pb-2 last:border-0">
                        <div className="flex justify-between">
                          <span className="text-white">{log.action}</span>
                          <span className="text-gray-400">{log.time}</span>
                        </div>
                        <div className="text-gray-400">
                          {log.user} - {log.ip}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">データバックアップ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white">最終バックアップ</p>
                    <p className="text-gray-400 text-sm">2024-01-16 03:00 (自動)</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    成功
                  </Badge>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    手動バックアップ
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    バックアップ履歴
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}