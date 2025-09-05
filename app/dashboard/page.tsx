'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Clock, Users, TrendingUp, Video, ChevronDown, ChevronUp, Grid3X3, Grid2X2, LayoutGrid, List } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for demonstration
const mockProjects = [
  {
    id: 1,
    name: "健康サプリメント春キャンペーン",
    description: "新商品「ビタミンDサプリ」のInstagram Reels用広告台本制作プロジェクト",
    status: "クリエイティブパーツ生成" as const,
    stage: 3,
    totalStages: 5,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
    dueDate: "2024-01-25",
    assignee: "田中太郎",
    lastEditor: "佐藤花子",
    tags: ["商品情報", "健康・美容"],
    teamMembers: 3
  },
  {
    id: 2,
    name: "ECサイトセール告知",
    description: "年末セールTikTok広告の台本制作",
    status: "広告台本生成完了" as const,
    stage: 5,
    totalStages: 5,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    dueDate: "2024-01-20",
    assignee: "山田次郎",
    lastEditor: "田中太郎",
    tags: ["セール", "EC"],
    teamMembers: 2
  },
  {
    id: 3,
    name: "B2Bサービス紹介",
    description: "クラウドサービスのYouTube Shorts用台本",
    status: "初期情報登録" as const,
    stage: 1,
    totalStages: 5,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
    dueDate: "2024-01-30",
    assignee: "佐藤花子",
    lastEditor: "佐藤花子",
    tags: ["B2B", "SaaS"],
    teamMembers: 1
  },
  {
    id: 4,
    name: "ファッションブランド新作発表",
    description: "春夏コレクションのInstagram Stories用広告台本制作",
    status: "商品情報サマリー生成" as const,
    stage: 2,
    totalStages: 5,
    createdAt: "2024-01-12",
    updatedAt: "2024-01-17",
    dueDate: "2024-01-28",
    assignee: "田中太郎",
    lastEditor: "山田次郎",
    tags: ["ファッション", "B2C", "商品情報"],
    teamMembers: 4
  },
  {
    id: 5,
    name: "フィットネスアプリ訴求",
    description: "新機能追加のTikTok広告台本制作プロジェクト",
    status: "教育コンテンツ生成" as const,
    stage: 3,
    totalStages: 5,
    createdAt: "2024-01-08",
    updatedAt: "2024-01-15",
    dueDate: "2024-01-22",
    assignee: "佐藤花子",
    lastEditor: "佐藤花子",
    tags: ["アプリ", "健康・美容", "B2C"],
    teamMembers: 2
  }
];

type SortOption = 'updatedAt' | 'createdAt' | 'stage' | 'assignee' | 'lastEditor' | 'dueDate' | 'name';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'large' | 'medium' | 'small' | 'list';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    searchQuery: '',
    sortBy: 'updatedAt' as SortOption,
    sortOrder: 'desc' as SortOrder,
    filterByTag: 'all',
    filterByAssignee: 'all',
    filterByStatus: 'all'
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('large');

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const filteredAndSortedProjects = mockProjects
    .filter(project =>
      (project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
       project.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
       project.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))) &&
      (filters.filterByTag === 'all' || filters.filterByTag === '' || project.tags.includes(filters.filterByTag)) &&
      (filters.filterByAssignee === 'all' || filters.filterByAssignee === '' || project.assignee === filters.filterByAssignee) &&
      (filters.filterByStatus === 'all' || filters.filterByStatus === '' || project.status === filters.filterByStatus)
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'stage':
          aValue = a.stage;
          bValue = b.stage;
          break;
        case 'assignee':
          aValue = a.assignee;
          bValue = b.assignee;
          break;
        case 'lastEditor':
          aValue = a.lastEditor;
          bValue = b.lastEditor;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default: // updatedAt
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
      }
      
      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'large': return <LayoutGrid className="w-4 h-4" />;
      case 'medium': return <Grid3X3 className="w-4 h-4" />;
      case 'small': return <Grid2X2 className="w-4 h-4" />;
      case 'list': return <List className="w-4 h-4" />;
    }
  };

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'large': return '大きなアイコン';
      case 'medium': return '中アイコン';
      case 'small': return '小アイコン';
      case 'list': return '一覧';
    }
  };

  const getGridClasses = (mode: ViewMode) => {
    switch (mode) {
      case 'large': return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
      case 'medium': return 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-4';
      case 'small': return 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
      case 'list': return 'grid-cols-1';
    }
  };

  return (
    <DashboardLayout onFiltersChange={handleFiltersChange}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">ダッシュボード</h1>
            <p className="text-gray-400 mt-1">プロジェクトの概要と進捗を管理しましょう</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規プロジェクト
          </Button>
        </div>

        {/* Stats Cards */}
        <Collapsible open={!statsCollapsed} onOpenChange={(open) => setStatsCollapsed(!open)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-white/10 p-4 h-auto"
            >
              <span className="text-lg font-semibold">プロジェクト統計</span>
              {statsCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="総プロジェクト数"
                value="12"
                change="+3"
                changeType="increase"
                icon={FolderOpen}
                description="今月"
              />
              <StatsCard
                title="完成台本数"
                value="28"
                change="+8"
                changeType="increase"
                icon={Video}
                description="今月"
              />
              <StatsCard
                title="チームメンバー"
                value="6"
                change="+1"
                changeType="increase"
                icon={Users}
                description="アクティブ"
              />
              <StatsCard
                title="平均完成時間"
                value="2.3日"
                change="-0.5日"
                changeType="decrease"
                icon={Clock}
                description="短縮"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white">プロジェクト一覧</h2>
              <Badge variant="secondary" className="bg-white/10 text-white">
                {filteredAndSortedProjects.length} 件
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {getViewModeIcon(viewMode)}
                  <span className="ml-2">{getViewModeLabel(viewMode)}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('large')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  大きなアイコン
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('medium')}>
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  中アイコン
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('small')}>
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  小アイコン
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  <List className="mr-2 h-4 w-4" />
                  一覧
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {filteredAndSortedProjects.length > 0 ? (
            <div className={`grid ${getGridClasses(viewMode)} gap-6`}>
              {filteredAndSortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">プロジェクトが見つかりません</h3>
                <p className="text-gray-400 mb-6">
                  {filters.searchQuery ? '検索条件に一致するプロジェクトがありません' : 'まだプロジェクトがありません'}
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規プロジェクト作成
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateProjectDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DashboardLayout>
  );
}