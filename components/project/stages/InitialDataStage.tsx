'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, FileText, Upload, Link, Tag, Image, Camera, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InitialDataStageProps {
  projectId: string;
  onComplete: () => void;
}

const suggestedTags = ['商品情報', 'ユーザー情報', '広告情報', 'FAQ', 'レビュー', '競合情報', '市場データ'];

export function InitialDataStage({ projectId, onComplete }: InitialDataStageProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textData, setTextData] = useState({ title: '', content: '', tags: [] as string[] });
  const [fileData, setFileData] = useState({
    title: '',
    file: null as File | null,
    type: '' as 'pdf' | 'image' | '',
    tags: [] as string[],
    preview: '' as string
  });
  const [urlData, setUrlData] = useState({ title: '', url: '', tags: [] as string[] });
  const [customTag, setCustomTag] = useState('');
  const [dataList, setDataList] = useState<Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'pdf' | 'url';
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [editingData, setEditingData] = useState<{
    id: string;
    title: string;
    content: string;
    tags: string[];
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        if (data.contents?.initial_data?.content) {
          // APIから取得したデータを適切な形式に変換
          const convertedData = data.contents.initial_data.content.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            type: item.data_type,
            tags: [], // 今後タグ機能を実装する場合
            createdAt: item.created_at,
            updatedAt: item.updated_at || item.created_at,
          }));
          setDataList(convertedData);
        }
      } catch (error) {
        console.error('Initial data fetch error:', error);
        toast({
          title: "エラー",
          description: "一次情報の取得に失敗しました。",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [projectId, toast]);

  const addTag = (tag: string, dataType: 'text' | 'pdf' | 'url' | 'image' | 'screenshot') => {
    if (tag && !getCurrentTags(dataType).includes(tag)) {
      if (dataType === 'text') {
        setTextData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      } else if (dataType === 'pdf' || dataType === 'image' || dataType === 'screenshot') {
        setFileData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      } else {
        setUrlData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setCustomTag('');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) { // 10MB制限
        throw new Error('ファイルサイズが大きすぎます');
      }

      const fileType = file.type;
      let type: 'pdf' | 'image' = 'pdf';
      let preview = '';

      if (fileType.startsWith('image/')) {
        type = 'image';
        preview = URL.createObjectURL(file);
      } else if (fileType !== 'application/pdf') {
        throw new Error('対応していないファイル形式です');
      }

      setFileData(prev => ({
        ...prev,
        file,
        type,
        preview
      }));
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleScreenshot = async () => {
    try {
      // スクリーンショット撮影中の状態を示すオーバーレイを作成
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      overlay.style.cursor = 'crosshair';
      overlay.style.zIndex = '10000';
      document.body.appendChild(overlay);

      let startX = 0;
      let startY = 0;
      let selection = document.createElement('div');
      selection.style.position = 'fixed';
      selection.style.border = '2px solid #fff';
      selection.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      selection.style.display = 'none';
      overlay.appendChild(selection);

      // マウスダウンイベントで選択開始
      overlay.onmousedown = (e) => {
        startX = e.clientX;
        startY = e.clientY;
        selection.style.left = startX + 'px';
        selection.style.top = startY + 'px';
        selection.style.width = '0px';
        selection.style.height = '0px';
        selection.style.display = 'block';
      };

      // マウス移動で選択範囲を更新
      overlay.onmousemove = (e) => {
        if (selection.style.display === 'block') {
          const width = e.clientX - startX;
          const height = e.clientY - startY;
          selection.style.width = Math.abs(width) + 'px';
          selection.style.height = Math.abs(height) + 'px';
          selection.style.left = (width < 0 ? e.clientX : startX) + 'px';
          selection.style.top = (height < 0 ? e.clientY : startY) + 'px';
        }
      };

      // マウスアップで選択完了
      overlay.onmouseup = async () => {
        const rect = selection.getBoundingClientRect();
        overlay.remove();

        try {
          // 画面選択のダイアログを表示
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: "monitor", // モニター全体を選択可能に
              logicalSurface: true, // 論理的なディスプレイサーフェスを使用
              cursor: "always" // カーソルを常に表示
            }
          });

          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();

          // 選択範囲の位置とサイズを画面のスケールに合わせて調整
          const screenScale = window.devicePixelRatio;
          const scaledRect = {
            left: rect.left * screenScale,
            top: rect.top * screenScale,
            width: rect.width * screenScale,
            height: rect.height * screenScale
          };

          const canvas = document.createElement('canvas');
          canvas.width = scaledRect.width;
          canvas.height = scaledRect.height;
          const ctx = canvas.getContext('2d');

          // 選択した画面の範囲を切り出し
          ctx?.drawImage(
            video,
            scaledRect.left,
            scaledRect.top,
            scaledRect.width,
            scaledRect.height,
            0,
            0,
            scaledRect.width,
            scaledRect.height
          );

          stream.getTracks().forEach(track => track.stop());

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'screenshot.png', { type: 'image/png' });
              handleFileUpload(file);
            }
          }, 'image/png');
        } catch (error) {
          console.error('Screenshot error:', error);
          toast({
            title: 'エラー',
            description: 'スクリーンショットの取得に失敗しました。',
            variant: 'destructive',
          });
        }
      };

      // ESCキーでキャンセル
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);

    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: 'エラー',
        description: 'スクリーンショットの取得に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleAddFileData = async () => {
    if (!fileData.title || !fileData.file) {
      toast({
        title: "入力エラー",
        description: "タイトルとファイルを指定してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: ファイルの処理とSupabaseへの保存を実装
      const fileType = fileData.type === 'pdf' ? 'pdf' : activeTab === 'screenshot' ? 'screenshot' : 'image';
      const newData = {
        id: `${fileType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: fileData.title,
        content: `${fileData.type === 'pdf' ? 'PDF' : '画像'}: ${fileData.file.name}`,
        type: fileType as 'pdf' | 'screenshot' | 'image',
        tags: fileData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDataList(prev => [...prev, newData]);
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
      setFileData({ title: '', file: null, type: '', tags: [], preview: '' });
      
      toast({
        title: "ファイル登録完了",
        description: `${fileData.type === 'pdf' ? 'PDF' : '画像'}ファイルが登録されました。`,
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルの登録に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tagToRemove: string, dataType: 'text' | 'pdf' | 'url' | 'image' | 'screenshot') => {
    if (dataType === 'text') {
      setTextData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    } else if (dataType === 'pdf' || dataType === 'image' || dataType === 'screenshot') {
      setFileData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    } else {
      setUrlData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    }
  };

  const getCurrentTags = (dataType: 'text' | 'pdf' | 'url' | 'image' | 'screenshot') => {
    if (dataType === 'text') return textData.tags;
    if (dataType === 'pdf' || dataType === 'image' || dataType === 'screenshot') return fileData.tags;
    return urlData.tags;
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
        id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: textData.title,
        content: textData.content,
        type: 'text' as const,
        tags: textData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: urlData.title,
        content: `URL: ${urlData.url}\n\n[スクレイピングされたコンテンツがここに表示されます]`,
        type: 'url' as const,
        tags: urlData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

  const handleEditData = (data: any) => {
    setEditingData({
      id: data.id,
      title: data.title,
      content: data.content,
      tags: data.tags
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingData) return;
    
    setLoading(true);
    try {
      // 更新ロジックをここに実装（現在はフロントエンドのみ）
      setDataList(prev => prev.map(item => 
        item.id === editingData.id 
          ? { ...item, title: editingData.title, content: editingData.content, tags: editingData.tags, updatedAt: new Date().toISOString() }
          : item
      ));
      
      setIsEditModalOpen(false);
      setEditingData(null);
      
      toast({
        title: "編集完了",
        description: "データが更新されました。",
      });
    } catch (error) {
      toast({
        title: "編集エラー",
        description: "データの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEditTag = (tag: string) => {
    if (editingData && tag && !editingData.tags.includes(tag)) {
      setEditingData(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
    }
  };

  const removeEditTag = (tag: string) => {
    if (editingData) {
      setEditingData(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
    }
  };

  const handleSaveProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stageType: 'initial_data',
          content: dataList,
          status: '一次情報登録中',
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast({
        title: "保存完了",
        description: "進捗が保存されました。",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "保存エラー",
        description: "データの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStage = async () => {
    if (dataList.length === 0) {
      toast({
        title: "データが必要です",
        description: "少なくとも1つのデータを追加してください。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // まず進捗を保存
      const saveResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stageType: 'initial_data',
          content: dataList,
          status: '商品情報サマリー',
          stage: 2,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('保存に失敗しました');
      }
      
      toast({
        title: "ステージ完了",
        description: "データが保存され、次のステージに進みます。",
      });
      
      onComplete();
    } catch (error) {
      console.error('Complete stage error:', error);
      toast({
        title: "保存エラー",
        description: "データの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30 mx-auto"></div>
          <p className="text-white/70">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                一次情報登録
              </CardTitle>
              <CardDescription className="text-gray-400">
                プロジェクトの基本となるデータを登録してください。テキスト直接入力、PDF、URLから情報を取得できます。
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProgress}
                disabled={loading}
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400"
              >
                {loading ? "保存中..." : "進捗を保存"}
              </Button>
              <Button
                onClick={handleCompleteStage}
                disabled={dataList.length === 0 || loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 z-20 relative shadow-lg"
              >
                {loading ? "処理中..." : "次のステージに進む"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-white/10">
              <TabsTrigger value="text" className="data-[state=active]:bg-white/20">
                <FileText className="w-4 h-4 mr-2" />
                テキスト入力
              </TabsTrigger>
              <TabsTrigger value="pdf" className="data-[state=active]:bg-white/20">
                <Upload className="w-4 h-4 mr-2" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-white/20">
                <Image className="w-4 h-4 mr-2" />
                画像
              </TabsTrigger>
              <TabsTrigger value="screenshot" className="data-[state=active]:bg-white/20">
                <Camera className="w-4 h-4 mr-2" />
                スクリーンショット
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdfTitle" className="text-white">タイトル</Label>
                  <Input
                    id="pdfTitle"
                    value={fileData.title}
                    onChange={(e) => setFileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="PDFファイルのタイトルを入力"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-white">PDFアップロード</Label>
                  <div className="mt-2">
                    <div 
                      className="flex flex-col items-center justify-center w-full"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="w-full border-2 border-white/20 border-dashed rounded-lg p-4 bg-white/5 hover:bg-white/10">
                        {fileData.file && fileData.type === 'pdf' ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-400">{fileData.file.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFileData(prev => ({ ...prev, file: null, preview: '', type: '' }));
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-400">
                                ドラッグ＆ドロップまたはクリックしてアップロード
                              </p>
                              <p className="text-xs text-gray-400">
                                PDF (最大10MB)
                              </p>
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                id="pdf-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/10"
                                onClick={() => document.getElementById('pdf-upload')?.click()}
                              >
                                PDFを選択
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">タグ</Label>
                  <div className="flex flex-wrap gap-2">
                    {fileData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-500/20"
                          onClick={() => removeTag(tag, 'pdf')}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTags
                      .filter(tag => !fileData.tags.includes(tag))
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tag, 'pdf')}
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
                  onClick={handleAddFileData}
                  disabled={!fileData.title || !fileData.file || loading || fileData.type !== 'pdf'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {loading ? "アップロード中..." : "PDFを登録"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageTitle" className="text-white">タイトル</Label>
                  <Input
                    id="imageTitle"
                    value={fileData.title}
                    onChange={(e) => setFileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="画像のタイトルを入力"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-white">画像アップロード</Label>
                  <div className="mt-2">
                    <div 
                      className="flex flex-col items-center justify-center w-full"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="w-full border-2 border-white/20 border-dashed rounded-lg p-4 bg-white/5 hover:bg-white/10">
                        {fileData.file && fileData.type === 'image' ? (
                          <div className="space-y-4">
                            {fileData.preview && (
                              <div className="relative w-full aspect-video">
                                <img
                                  src={fileData.preview}
                                  alt="プレビュー"
                                  className="object-contain w-full h-full rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-400">{fileData.file.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFileData(prev => ({ ...prev, file: null, preview: '', type: '' }));
                                  if (fileData.preview) URL.revokeObjectURL(fileData.preview);
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4">
                              <Image className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-400">
                                ドラッグ＆ドロップまたはクリックしてアップロード
                              </p>
                              <p className="text-xs text-gray-400">
                                JPG, PNG (最大10MB)
                              </p>
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                id="image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/10"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                画像を選択
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">タグ</Label>
                  <div className="flex flex-wrap gap-2">
                    {fileData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-500/20"
                          onClick={() => removeTag(tag, 'image')}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTags
                      .filter(tag => !fileData.tags.includes(tag))
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tag, 'image')}
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
                  onClick={handleAddFileData}
                  disabled={!fileData.title || !fileData.file || loading || fileData.type !== 'image'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {loading ? "アップロード中..." : "画像を登録"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="screenshot" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="screenshotTitle" className="text-white">タイトル</Label>
                  <Input
                    id="screenshotTitle"
                    value={fileData.title}
                    onChange={(e) => setFileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="スクリーンショットのタイトルを入力"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-white">スクリーンショット取得</Label>
                  <div className="mt-2">
                    <div className="w-full border-2 border-white/20 border-dashed rounded-lg p-4 bg-white/5 hover:bg-white/10">
                      {fileData.file && fileData.type === 'image' ? (
                        <div className="space-y-4">
                          {fileData.preview && (
                            <div className="relative w-full aspect-video">
                              <img
                                src={fileData.preview}
                                alt="プレビュー"
                                className="object-contain w-full h-full rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">{fileData.file.name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFileData(prev => ({ ...prev, file: null, preview: '', type: '' }));
                                if (fileData.preview) URL.revokeObjectURL(fileData.preview);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center py-4">
                            <Camera className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400">
                              クリックしてスクリーンショットを取得
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleScreenshot}
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              スクリーンショットを撮影
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">タグ</Label>
                  <div className="flex flex-wrap gap-2">
                    {fileData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-500/20"
                          onClick={() => removeTag(tag, 'screenshot')}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTags
                      .filter(tag => !fileData.tags.includes(tag))
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tag, 'screenshot')}
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
                  onClick={handleAddFileData}
                  disabled={!fileData.title || !fileData.file || loading || fileData.type !== 'image'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {loading ? "アップロード中..." : "スクリーンショットを登録"}
                </Button>
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
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-white/5">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-1/6">タイトル</th>
                    <th scope="col" className="px-4 py-3 w-1/12">種類</th>
                    <th scope="col" className="px-4 py-3 w-5/12">内容</th>
                    <th scope="col" className="px-4 py-3 w-1/6">タグ</th>
                    <th scope="col" className="px-2 py-3 w-1/12 text-xs">更新日</th>
                    <th scope="col" className="px-2 py-3 w-1/12 text-center">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((data) => (
                    <tr key={data.id} className="border-b border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-4 py-4 font-medium text-white">
                        <div className="max-w-[150px] truncate" title={data.title}>
                          {data.title}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {data.type === 'text' ? 'テキスト' : 
                           data.type === 'pdf' ? 'PDF' : 
                           data.type === 'screenshot' ? 'スクショ' :
                           data.type === 'url' ? 'URL' : 
                           data.type === 'image' ? '画像' : data.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[300px] text-gray-300 text-sm">
                          <div className="line-clamp-2 overflow-hidden leading-relaxed" title={data.content}>
                            {data.content.length > 100 ? `${data.content.substring(0, 100)}...` : data.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {data.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-white/10 text-white text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {data.tags.length > 2 && (
                            <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                              +{data.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-400">
                        {new Date(data.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditData(data)}
                            className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                            title="編集"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteData(data.id)}
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            title="削除"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Progress Button */}
      {dataList.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleSaveProgress}
            disabled={loading}
            variant="outline"
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400"
          >
            {loading ? "保存中..." : "進捗を保存"}
          </Button>
        </div>
      )}

      {/* Edit Data Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>データを編集</DialogTitle>
            <DialogDescription className="text-gray-400">
              登録済みデータの内容を編集できます。
            </DialogDescription>
          </DialogHeader>
          
          {editingData && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="editTitle" className="text-white">タイトル</Label>
                <Input
                  id="editTitle"
                  value={editingData.title}
                  onChange={(e) => setEditingData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editContent" className="text-white">内容</Label>
                <Textarea
                  id="editContent"
                  value={editingData.content}
                  onChange={(e) => setEditingData(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={6}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-white">タグ</Label>
                
                {editingData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editingData.tags.map((tag) => (
                      <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-500/20"
                          onClick={() => removeEditTag(tag)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !editingData.tags.includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addEditTag(tag)}
                        className="border-white/30 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))
                  }
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="カスタムタグを入力"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditTag(customTag);
                        setCustomTag('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addEditTag(customTag);
                      setCustomTag('');
                    }}
                    disabled={!customTag.trim() || editingData.tags.includes(customTag)}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    追加
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingData(null);
                  }}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={loading || !editingData.title.trim() || !editingData.content.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                >
                  {loading ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}