'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: typeof LucideIcon;
  description: string;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, description }: StatsCardProps) {
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-blue-400';
  const changeBg = changeType === 'increase' ? 'bg-green-500/20 border-green-500/30' : 'bg-blue-500/20 border-blue-500/30';

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="flex items-center space-x-2">
              <Badge className={`${changeBg} ${changeColor} text-xs`}>
                {change}
              </Badge>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}