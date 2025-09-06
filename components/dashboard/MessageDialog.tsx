'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Image as ImageIcon, Smile, Paperclip, AtSign } from 'lucide-react';

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: {
    initials: string;
    name: string;
    color: {
      from: string;
      via: string;
      to: string;
    };
  };
}

export function MessageDialog({ open, onOpenChange, recipient }: MessageDialogProps) {
  const [message, setMessage] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800/90 backdrop-blur-xl border-slate-700/50 text-white p-0">
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[${recipient.color.from}] via-[${recipient.color.via}] to-[${recipient.color.to}] p-[1px]`}>
                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-[13px] font-medium text-white/90 tracking-wider">
                  {recipient.initials}
                </div>
              </div>
            </div>
            <DialogTitle className="text-lg font-semibold text-white/90">
              {recipient.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[300px] p-4 border-b border-slate-700/50">
          <div className="space-y-4">
            {/* サンプルメッセージ */}
            <div className="flex justify-start">
              <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                <p className="text-white/90">プロジェクトの進捗について確認したいのですが、お時間ありますか？</p>
                <p className="text-xs text-white/50 mt-1">14:30</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-purple-500/20 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                <p className="text-white/90">はい、大丈夫です。どのような点が気になりますか？</p>
                <p className="text-xs text-white/50 mt-1">14:32</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="min-h-[80px] bg-slate-700/30 border-slate-600/50 rounded-xl text-white placeholder:text-white/40 pr-24"
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <AtSign className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 bg-purple-500/80 hover:bg-purple-500 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
