'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Menu, 
  X,
  Bell,
  User,
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Calendar,
  TrendingUp,
  Tag,
  Users as UsersIcon
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onFiltersChange?: (filters: any) => void;
}

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard, current: true },
  { name: 'プロジェクト', href: '/projects', icon: FolderOpen, current: false },
  { name: '設定', href: '/settings', icon: Settings, current: false },
];

const adminNavigation = [
  { name: '管理者画面', href: '/admin', icon: Shield, current: false },
];

export default function DashboardLayout({ children, onFiltersChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterByTag, setFilterByTag] = useState('');
  const [filterByAssignee, setFilterByAssignee] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = true;
  const isDashboard = pathname === '/dashboard';

  // Mock data for filters
  const allTags = ['商品情報', 'ユーザー情報', '広告情報', 'B2B', 'B2C', 'EC', '健康・美容'];
  const allAssignees = ['田中太郎', '佐藤花子', '山田次郎'];
  const allStatuses = ['初期情報登録', 'クリエイティブパーツ生成', '広告台本生成完了'];

  const handleFilterChange = () => {
    if (onFiltersChange) {
      onFiltersChange({
        searchQuery,
        sortBy,
        sortOrder,
        filterByTag: filterByTag === 'all' ? '' : filterByTag,
        filterByAssignee: filterByAssignee === 'all' ? '' : filterByAssignee,
        filterByStatus: filterByStatus === 'all' ? '' : filterByStatus
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setFilterByTag('all');
    setFilterByAssignee('all');
    setFilterByStatus('all');
    if (onFiltersChange) {
      onFiltersChange({
        searchQuery: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        filterByTag: '',
        filterByAssignee: '',
        filterByStatus: ''
      });
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    if (onFiltersChange) {
      onFiltersChange({
        searchQuery,
        sortBy,
        sortOrder: newOrder,
        filterByTag,
        filterByAssignee,
        filterByStatus
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold">CMO AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {isAdmin && (
              <>
                <div className="border-t border-white/10 my-4" />
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-orange-300 hover:bg-orange-500/10 hover:text-orange-200"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* Mobile Filters */}
            {isDashboard && (
              <>
                <Separator className="bg-white/20 my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">フィルター・ソート</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      クリア
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <Label className="text-white text-sm">検索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                      <Input
                        placeholder="プロジェクトを検索..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleFilterChange();
                        }}
                        className="pl-9 bg-white/5 border-white/20 text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-white text-xs">ソート項目</Label>
                      <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updatedAt">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-2" />
                              更新日
                            </div>
                          </SelectItem>
                          <SelectItem value="createdAt">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-2" />
                              作成日
                            </div>
                          </SelectItem>
                          <SelectItem value="stage">
                            <div className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-2" />
                              進捗
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-xs">ソート順</Label>
                      <Button
                        variant="outline"
                        onClick={toggleSortOrder}
                        className="w-full border-white/30 text-white hover:bg-white/10 justify-start text-xs"
                      >
                        <ArrowUpDown className="w-3 h-3 mr-2" />
                        {sortOrder === 'desc' ? '降順' : '昇順'}
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white text-xs">タグ</Label>
                      <Select value={filterByTag} onValueChange={(value) => {
                        setFilterByTag(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべてのタグ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべてのタグ</SelectItem>
                          {allTags.map(tag => (
                            <SelectItem key={tag} value={tag}>
                              <div className="flex items-center">
                                <Tag className="w-3 h-3 mr-2" />
                                {tag}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-xs">担当者</Label>
                      <Select value={filterByAssignee} onValueChange={(value) => {
                        setFilterByAssignee(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべての担当者" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべての担当者</SelectItem>
                          {allAssignees.map(assignee => (
                            <SelectItem key={assignee} value={assignee}>
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-2" />
                                {assignee}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-xs">ステータス</Label>
                      <Select value={filterByStatus} onValueChange={(value) => {
                        setFilterByStatus(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべてのステータス" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべてのステータス</SelectItem>
                          {allStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-2" />
                                {status}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-900/50 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
          <div className="flex items-center space-x-2 p-6 border-b border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg">CMO AI</span>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {isAdmin && (
              <>
                <div className="border-t border-white/10 my-4" />
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-orange-300 hover:bg-orange-500/10 hover:text-orange-200"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
          
          {/* Desktop Filters - Only show on dashboard */}
          {isDashboard && (
            <div className="p-4 border-t border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">フィルター・ソート</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    クリア
                  </Button>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">検索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="プロジェクトを検索..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleFilterChange();
                      }}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">ソート項目</Label>
                    <Select value={sortBy} onValueChange={(value) => {
                      setSortBy(value);
                      handleFilterChange();
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="updatedAt">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            更新日
                          </div>
                        </SelectItem>
                        <SelectItem value="createdAt">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            作成日
                          </div>
                        </SelectItem>
                        <SelectItem value="stage">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            進捗
                          </div>
                        </SelectItem>
                        <SelectItem value="assignee">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            担当者
                          </div>
                        </SelectItem>
                        <SelectItem value="name">プロジェクト名</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">ソート順</Label>
                    <Button
                      variant="outline"
                      onClick={toggleSortOrder}
                      className="w-full border-white/30 text-white hover:bg-white/10 justify-start"
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      {sortOrder === 'desc' ? '降順' : '昇順'}
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">タグフィルター</Label>
                    <Select value={filterByTag} onValueChange={(value) => {
                      setFilterByTag(value);
                      handleFilterChange();
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="すべてのタグ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのタグ</SelectItem>
                        {allTags.map(tag => (
                          <SelectItem key={tag} value={tag}>
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 mr-2" />
                              {tag}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">担当者フィルター</Label>
                    <Select value={filterByAssignee} onValueChange={(value) => {
                      setFilterByAssignee(value);
                      handleFilterChange();
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="すべての担当者" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべての担当者</SelectItem>
                        {allAssignees.map(assignee => (
                          <SelectItem key={assignee} value={assignee}>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {assignee}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">ステータスフィルター</Label>
                    <Select value={filterByStatus} onValueChange={(value) => {
                      setFilterByStatus(value);
                      handleFilterChange();
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="すべてのステータス" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのステータス</SelectItem>
                        {allStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">クレジット</span>
                <Badge variant="secondary" className="bg-purple-600 text-white">
                  2,450
                </Badge>
              </div>
              <div className="text-xs text-gray-400">今月の使用率: 75%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}