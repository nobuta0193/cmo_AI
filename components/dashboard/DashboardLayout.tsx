'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageDialog } from '@/components/dashboard/MessageDialog';
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
  Users as UsersIcon,
  LogOut,
  Plus,
  FileText,
  MessageSquare,
  HelpCircle,
  Book,
  Video,
  LifeBuoy,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterByTag, setFilterByTag] = useState('');
  const [filterByAssignee, setFilterByAssignee] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const [filterByDueDate, setFilterByDueDate] = useState('');
  const [filterByLastEditor, setFilterByLastEditor] = useState('');
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    initials: string;
    name: string;
    color: { from: string; via: string; to: string; };
  } | null>(null);
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
        filterByStatus: filterByStatus === 'all' ? '' : filterByStatus,
        filterByDueDate,
        filterByLastEditor
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
    setFilterByDueDate('');
    setFilterByLastEditor('');
    if (onFiltersChange) {
      onFiltersChange({
        searchQuery: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        filterByTag: '',
        filterByAssignee: '',
        filterByStatus: '',
        filterByDueDate: '',
        filterByLastEditor: ''
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
        filterByTag: filterByTag === 'all' ? '' : filterByTag,
        filterByAssignee: filterByAssignee === 'all' ? '' : filterByAssignee,
        filterByStatus: filterByStatus === 'all' ? '' : filterByStatus,
        filterByDueDate,
        filterByLastEditor
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
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
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
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-sm">フィルター・ソート</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white hover:bg-white/10 text-xs h-8 px-2"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      クリア
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="space-y-1.5">
                    <Label className="text-white/90 text-xs">検索</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder="プロジェクトを検索..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleFilterChange();
                        }}
                        className="pl-8 h-8 bg-white/5 border-white/20 text-white placeholder-gray-400 text-xs"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-1.5">
                    <Label className="text-white/90 text-xs">ソート</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value);
                        if (onFiltersChange) {
                          onFiltersChange({
                            searchQuery,
                            sortBy: value,
                            sortOrder,
                            filterByTag: filterByTag === 'all' ? '' : filterByTag,
                            filterByAssignee: filterByAssignee === 'all' ? '' : filterByAssignee,
                            filterByStatus: filterByStatus === 'all' ? '' : filterByStatus,
                            filterByDueDate,
                            filterByLastEditor
                          });
                        }
                      }}>
                        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updatedAt">
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-2" />
                              更新日
                            </div>
                          </SelectItem>
                          <SelectItem value="dueDate">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-2" />
                              期日
                            </div>
                          </SelectItem>
                          <SelectItem value="createdAt">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-2" />
                              作成日
                            </div>
                          </SelectItem>
                          <SelectItem value="stage">
                            <div className="flex items-center">
                              <TrendingUp className="w-3.5 h-3.5 mr-2" />
                              進捗
                            </div>
                          </SelectItem>
                          <SelectItem value="assignee">
                            <div className="flex items-center">
                              <User className="w-3.5 h-3.5 mr-2" />
                              担当者
                            </div>
                          </SelectItem>
                          <SelectItem value="lastEditor">
                            <div className="flex items-center">
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              編集者
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={toggleSortOrder}
                        className="h-8 border-white/20 text-white hover:bg-white/10 justify-start text-xs"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                        {sortOrder === 'desc' ? '降順' : '昇順'}
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/90 text-xs">タグ</Label>
                      <Select value={filterByTag} onValueChange={(value) => {
                        setFilterByTag(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべてのタグ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべてのタグ</SelectItem>
                          {allTags.map(tag => (
                            <SelectItem key={tag} value={tag}>
                              <div className="flex items-center">
                                <Tag className="w-3.5 h-3.5 mr-2" />
                                {tag}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/90 text-xs">担当者</Label>
                      <Select value={filterByAssignee} onValueChange={(value) => {
                        setFilterByAssignee(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべての担当者" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべての担当者</SelectItem>
                          {allAssignees.map(assignee => (
                            <SelectItem key={assignee} value={assignee}>
                              <div className="flex items-center">
                                <User className="w-3.5 h-3.5 mr-2" />
                                {assignee}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/90 text-xs">ステータス</Label>
                      <Select value={filterByStatus} onValueChange={(value) => {
                        setFilterByStatus(value);
                        handleFilterChange();
                      }}>
                        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue placeholder="すべてのステータス" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべてのステータス</SelectItem>
                          {allStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center">
                                <TrendingUp className="w-3.5 h-3.5 mr-2" />
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
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 ease-in-out transform`}>
        <div className="flex flex-col flex-grow bg-slate-900/60 backdrop-blur-xl border-r border-white/10 overflow-hidden">
          <div className="flex items-center justify-between h-20 border-b border-white/10 relative px-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'w-full'} transition-all duration-300`}>
              <div className={`${sidebarCollapsed ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg shadow-purple-500/25`}>
                <span className={`text-white font-bold ${sidebarCollapsed ? 'text-lg' : 'text-base'} transition-all duration-300`}>C</span>
              </div>
              <span className={`text-white font-bold text-xl ml-4 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-all duration-300 overflow-hidden whitespace-nowrap`}>
                CMO AI
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0 rounded-xl p-2 transition-all duration-300 ${sidebarCollapsed ? 'absolute right-2 top-1/2 -translate-y-1/2' : ''}`}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
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
          
          {/* Desktop Filters - Only show on dashboard and when not collapsed */}
          {isDashboard && !sidebarCollapsed && (
            <div className="p-6 border-t border-white/10">
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
                      // 即座にフィルターを適用
                      if (onFiltersChange) {
                        onFiltersChange({
                          searchQuery,
                          sortBy: value,
                          sortOrder,
                          filterByTag: filterByTag === 'all' ? '' : filterByTag,
                          filterByAssignee: filterByAssignee === 'all' ? '' : filterByAssignee,
                          filterByStatus: filterByStatus === 'all' ? '' : filterByStatus,
                          filterByDueDate,
                          filterByLastEditor
                        });
                      }
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
                        <SelectItem value="dueDate">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            期日
                          </div>
                        </SelectItem>
                        <SelectItem value="createdAt">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            プロジェクト作成日
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
                        <SelectItem value="lastEditor">
                          <div className="flex items-center">
                            <Edit2 className="w-4 h-4 mr-2" />
                            最終編集者
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">ソート順</Label>
                    <Button
                      variant="outline"
                      onClick={toggleSortOrder}
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
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
              <div className="text-xs text-gray-400 mb-2">今月の使用率: 75%</div>
              <div className="h-1.5 rounded-full bg-white/10 mb-2">
                <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '75%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm text-gray-300 ${sidebarCollapsed ? 'hidden' : 'block'}`}>クレジット</span>
                <Badge variant="secondary" className="bg-purple-600 text-white">
                  2,450
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'}`}>
      <CreateProjectDialog
        open={createProjectDialogOpen}
        onOpenChange={setCreateProjectDialogOpen}
      />
      {selectedRecipient && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          recipient={selectedRecipient}
        />
      )}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-white/10 mr-4"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* グローバル検索とフィルター */}
              <div className="relative hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="プロジェクトを検索..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleFilterChange();
                    }}
                    className="pl-10 bg-white/5 border-white/20 text-white w-64"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>フィルター・ソート</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Label className="text-xs mb-2">ソート</Label>
                      <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value);
                        // 即座にフィルターを適用
                        if (onFiltersChange) {
                          onFiltersChange({
                            searchQuery,
                            sortBy: value,
                            sortOrder,
                            filterByTag: filterByTag === 'all' ? '' : filterByTag,
                            filterByAssignee: filterByAssignee === 'all' ? '' : filterByAssignee,
                            filterByStatus: filterByStatus === 'all' ? '' : filterByStatus,
                            filterByDueDate,
                            filterByLastEditor
                          });
                        }
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updatedAt">更新日</SelectItem>
                          <SelectItem value="dueDate">期日</SelectItem>
                          <SelectItem value="createdAt">プロジェクト作成日</SelectItem>
                          <SelectItem value="stage">進捗</SelectItem>
                          <SelectItem value="assignee">担当者</SelectItem>
                          <SelectItem value="lastEditor">最終編集者</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSortOrder}
                        className="w-full mt-2 justify-start text-sm"
                      >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        {sortOrder === 'desc' ? '降順' : '昇順'}
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearFilters} className="text-xs">
                      <Filter className="w-3 h-3 mr-2" />
                      フィルターをクリア
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* オンラインメンバー */}
              <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50 shadow-xl">
                <div className="flex -space-x-3">
                  <div className="relative transform transition-transform hover:scale-105">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3366] via-[#FF66CC] to-[#FF99FF] p-[1px]">
                      <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                        TT
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00FF9D] rounded-full border-2 border-slate-900 shadow-lg shadow-[#00FF9D]/20"></div>
                  </div>
                  <div className="relative transform transition-transform hover:scale-105">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3366FF] via-[#33CCFF] to-[#66FFFF] p-[1px]">
                      <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                        SH
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00FF9D] rounded-full border-2 border-slate-900 shadow-lg shadow-[#00FF9D]/20"></div>
                  </div>
                  <div className="relative transform transition-transform hover:scale-105">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9900] via-[#FFCC00] to-[#FFFF00] p-[1px]">
                      <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                        YJ
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-slate-900 shadow-lg shadow-slate-400/20"></div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/5 px-2 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-slate-800/90 backdrop-blur-xl border-slate-700/50">
                    <DropdownMenuLabel className="text-white/70 font-medium px-3 py-2">メッセージを送信</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700/50" />
                    <DropdownMenuItem className="focus:bg-slate-700/50 px-3 py-2" onClick={() => {
                      setSelectedRecipient({
                        initials: 'TT',
                        name: '田中太郎',
                        color: {
                          from: '#FF3366',
                          via: '#FF66CC',
                          to: '#FF99FF'
                        }
                      });
                      setMessageDialogOpen(true);
                    }}>
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3366] via-[#FF66CC] to-[#FF99FF] p-[1px]">
                            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                              TT
                            </div>
                          </div>
                        </div>
                        <span className="text-white/90">田中太郎</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-slate-700/50 px-3 py-2" onClick={() => {
                      setSelectedRecipient({
                        initials: 'SH',
                        name: '佐藤花子',
                        color: {
                          from: '#3366FF',
                          via: '#33CCFF',
                          to: '#66FFFF'
                        }
                      });
                      setMessageDialogOpen(true);
                    }}>
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3366FF] via-[#33CCFF] to-[#66FFFF] p-[1px]">
                            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                              SH
                            </div>
                          </div>
                        </div>
                        <span className="text-white/90">佐藤花子</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-slate-700/50 px-3 py-2" onClick={() => {
                      setSelectedRecipient({
                        initials: 'YJ',
                        name: '山田次郎',
                        color: {
                          from: '#FF9900',
                          via: '#FFCC00',
                          to: '#FFFF00'
                        }
                      });
                      setMessageDialogOpen(true);
                    }}>
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9900] via-[#FFCC00] to-[#FFFF00] p-[1px]">
                            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-medium text-white/90 tracking-wider">
                              YJ
                            </div>
                          </div>
                        </div>
                        <span className="text-white/90">山田次郎</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* クイックアクション */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCreateProjectDialogOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>新規プロジェクト作成</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>フィードバック送信</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 通知 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>通知</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">プロジェクト「新商品ローンチ」が完了しました</span>
                        <span className="text-sm text-gray-500">2分前</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">新しいコメントが追加されました</span>
                        <span className="text-sm text-gray-500">1時間前</span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-sm text-blue-500">
                    すべての通知を見る
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ヘルプ・サポート */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Book className="mr-2 h-4 w-4" />
                    <span>ドキュメント</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Video className="mr-2 h-4 w-4" />
                    <span>チュートリアル</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>サポート</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ユーザーメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>アカウント設定</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>設定</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={async () => {
                      const supabase = createClient();
                      const { error } = await supabase.auth.signOut();
                      if (!error) {
                        router.push('/auth/signin');
                      }
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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