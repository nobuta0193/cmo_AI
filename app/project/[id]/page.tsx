import { ProjectDetailClient } from './ProjectDetailClient';

// generateStaticParams関数を完全に削除
// 動的に生成されるプロジェクトIDに対応するため

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient projectId={params.id} />;
}