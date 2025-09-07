import { ProjectDetailClient } from './ProjectDetailClient';

// generateStaticParams関数を完全に削除
// 動的に生成されるプロジェクトIDに対応するため

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailClient projectId={id} />;
}