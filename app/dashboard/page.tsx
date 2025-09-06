'use client';

import { useState, useCallback, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';
import type { Project } from '@/components/dashboard/ProjectCard';
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

import { createClient } from '@/lib/supabase';
const supabase = createClient();

// プロジェクト一覧を取得する関数
const fetchProjects = async () => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch projects');
    }
    const projects: Project[] = await response.json();
    console.log('Fetched projects:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// 古いモックデータ（削除予定）
const mockProjects = [
  {
    id: 1,
    name: "健康サプリメント春キャンペーン",
    description: "新商品「ビタミンDサプリ」のInstagram Reels用広告台本制作プロジェクト",
    status: "クリエイティブパーツ生成" as const,
    stage: 3,  // 3/5 完了
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
    stage: 5,  // 5/5 完了
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
    stage: 1,  // 1/5 完了
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
    stage: 2,  // 2/5 完了
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
    stage: 3,  // 3/5 完了
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const filteredAndSortedProjects = projects
    .filter(project =>
      (project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
       project.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
       project.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))) &&
      (filters.filterByTag === 'all' || filters.filterByTag === '' || project.tags.includes(filters.filterByTag)) &&
      (filters.filterByAssignee === 'all' || filters.filterByAssignee === '' || project.assignee === filters.filterByAssignee) &&
      (filters.filterByStatus === 'all' || filters.filterByStatus === '' || project.status === filters.filterByStatus)
    )
    .sort((a, b) => {
      const sortMultiplier = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'stage': {
          // 進捗を分数（X/5）の形式で比較
          const aProgress = a.stage;
          const bProgress = b.stage;
          // 進捗の降順でソート（5→4→3→2→1）
          if (filters.sortOrder === 'desc') {
            if (aProgress === bProgress) {
              // 同じ進捗の場合は更新日時の降順
              const aDate = new Date(a.updatedAt).getTime();
              const bDate = new Date(b.updatedAt).getTime();
              return bDate - aDate;
            }
            return bProgress - aProgress;
          } else {
            // 昇順の場合（1→2→3→4→5）
            if (aProgress === bProgress) {
              // 同じ進捗の場合は更新日時の昇順
              const aDate = new Date(a.updatedAt).getTime();
              const bDate = new Date(b.updatedAt).getTime();
              return aDate - bDate;
            }
            return aProgress - bProgress;
          }
        }
        case 'assignee':
          return a.assignee.localeCompare(b.assignee, 'ja') * sortMultiplier;
        case 'lastEditor':
          return a.lastEditor.localeCompare(b.lastEditor, 'ja') * sortMultiplier;
        case 'dueDate': {
          const aDate = new Date(a.dueDate).getTime();
          const bDate = new Date(b.dueDate).getTime();
          return (aDate - bDate) * sortMultiplier;
        }
        case 'createdAt': {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return (aDate - bDate) * sortMultiplier;
        }
        case 'name':
          return a.name.localeCompare(b.name, 'ja') * sortMultiplier;
        default: { // updatedAt
          const aDate = new Date(a.updatedAt).getTime();
          const bDate = new Date(b.updatedAt).getTime();
          return (aDate - bDate) * sortMultiplier;
        }
      }
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
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
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
          
          {loading ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">プロジェクトを読み込み中...</h3>
              </CardContent>
            </Card>
          ) : filteredAndSortedProjects.length > 0 ? (
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
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            // プロジェクトリストを更新
            fetchProjects().then(data => setProjects(data));
          }
        }}
      />
    </DashboardLayout>
  );
}