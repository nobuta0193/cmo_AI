'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, X, FileText, Upload, Link, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InitialDataStageProps {
  projectId: number;
  onComplete: () => void;
}

const suggestedTags = ['商品情報', 'ユーザー情報', '広告情報', 'FAQ', 'レビュー', '競合情報', '市場データ'];

export function InitialDataStage({ projectId, onComplete }: InitialDataStageProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textData, setTextData] = useState({ title: '', content: '', tags: [] as string[] });
  const [urlData, setUrlData] = useState({ title: '', url: '', tags: [] as string[] });
  const [customTag, setCustomTag] = useState('');
  const [dataList, setDataList] = useState<Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'pdf' | 'url';
    tags: string[];
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addTag = (tag: string, dataType: 'text' | 'url') => {
    if (tag && !getCurrentTags(dataType).includes(tag)) {
      if (dataType === 'text') {
        setTextData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      } else {
        setUrlData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove: string, dataType: 'text' | 'url') => {
    if (dataType === 'text') {
      setTextData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    } else {
      setUrlData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    }
  };

  const getCurrentTags = (dataType: 'text' | 'url') => {
    return dataType === 'text' ? textData.tags : urlData.tags;
  };

  const handleAddTextData = async () => {
    if (!textData.title.trim() || !textData.content.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルと内容を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Save to Supabase
      const newData = {
        id: Date.now().toString(),
        title: textData.title,
        content: textData.content,
        type: 'text' as const,
        tags: textData.tags,
        createdAt: new Date().toISOString(),
      };

      setDataList(prev => [...prev, newData]);
      setTextData({ title: '', content: '', tags: [] });
      
      toast({
        title: "データ追加完了",
        description: "テキストデータが追加されました。",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "データの追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrlData = async () => {
    if (!urlData.title.trim() || !urlData.url.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルとURLを入力してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement URL scraping and save to Supabase
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate scraping
      
      const newData = {
        id: Date.now().toString(),
        title: urlData.title,
        content: `URL: ${urlData.url}\n\n[スクレイピングされたコンテンツがここに表示されます]`,
        type: 'url' as const,
        tags: urlData.tags,
        createdAt: new Date().toISOString(),
      };

      setDataList(prev => [...prev, newData]);
      setUrlData({ title: '', url: '', tags: [] });
      
      toast({
        title: "URL解析完了",
        description: "URLからデータを取得しました。",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "URL解析に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = (id: string) => {
    setDataList(prev => prev.filter(item => item.id !== id));
    toast({
      title: "データ削除完了",
      description: "データが削除されました。",
    });
  };

  const handleCompleteStage = () => {
    if (dataList.length === 0) {
      toast({
        title: "データが必要です",
        description: "少なくとも1つのデータを追加してください。",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "ステージ完了",
      description: "次のステージに進みます。",
    });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            初期情報登録
          </CardTitle>
          <CardDescription className="text-gray-400">
            プロジェクトの基本となるデータを登録してください。テキスト直接入力、PDF、URLから情報を取得できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="text" className="data-[state=active]:bg-white/20">
                <FileText className="w-4 h-4 mr-2" />
                テキスト入力
              </TabsTrigger>
              <TabsTrigger value="pdf" className="data-[state=active]:bg-white/20">
                <Upload className="w-4 h-4 mr-2" />
                PDF アップロード
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-white/20">
                <Link className="w-4 h-4 mr-2" />
                URL 解析
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textTitle" className="text-white">データタイトル</Label>
                  <Input
                    id="textTitle"
                    value={textData.title}
                    onChange={(e) => setTextData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例: 商品説明文"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textContent" className="text-white">内容</Label>
                  <Textarea
                    id="textContent"
                    value={textData.content}
                    onChange={(e) => setTextData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="商品やサービスに関する情報を入力してください..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[200px]"
                    rows={8}
                  />
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <Label className="text-white">タグ</Label>
                  
                  {textData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {textData.tags.map((tag) => (
                        <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-red-500/20"
                            onClick={() => removeTag(tag, 'text')}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">おすすめタグ:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags
                        .filter(tag => !textData.tags.includes(tag))
                        .map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTag(tag, 'text')}
                            className="border-white/30 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {tag}
                          </Button>
                        ))
                      }
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag(customTag.trim(), 'text')}
                      placeholder="カスタムタグを追加"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag(customTag.trim(), 'text')}
                      disabled={!customTag.trim()}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddTextData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {loading ? "追加中..." : "データを追加"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4 mt-6">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">PDFファイルをドラッグ&ドロップ</p>
                <p className="text-gray-400 text-sm mb-4">または</p>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  ファイルを選択
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  対応形式: PDF (最大10MB)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="urlTitle" className="text-white">データタイトル</Label>
                  <Input
                    id="urlTitle"
                    value={urlData.title}
                    onChange={(e) => setUrlData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例: 公式サイト商品ページ"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={urlData.url}
                    onChange={(e) => setUrlData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/product"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                {/* Tags Section for URL */}
                <div className="space-y-4">
                  <Label className="text-white">タグ</Label>
                  
                  {urlData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {urlData.tags.map((tag) => (
                        <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-red-500/20"
                            onClick={() => removeTag(tag, 'url')}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {suggestedTags
                      .filter(tag => !urlData.tags.includes(tag))
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tag, 'url')}
                          className="border-white/30 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {tag}
                        </Button>
                      ))
                    }
                  </div>
                </div>

                <Button
                  onClick={handleAddUrlData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {loading ? "解析中..." : "URLを解析してデータ追加"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data List */}
      {dataList.length > 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">登録済みデータ</CardTitle>
            <CardDescription className="text-gray-400">
              {dataList.length} 件のデータが登録されています
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataList.map((data) => (
              <div key={data.id} className="border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">{data.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {data.type === 'text' ? 'テキスト' : data.type === 'pdf' ? 'PDF' : 'URL'}
                      </Badge>
                      {data.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/10 text-white text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteData(data.id)}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-400 text-sm line-clamp-3">{data.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(data.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Complete Stage Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleCompleteStage}
          disabled={dataList.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
        >
          次のステージに進む
        </Button>
      </div>
    </div>
  );
}