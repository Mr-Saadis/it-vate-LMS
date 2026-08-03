import { redirect } from 'next/navigation'
import { getLevelWithContents } from '@/lib/api/courses'
import { LevelContentClient } from './LevelContentClient'

export const metadata = {
  title: 'Level Content — IT-vate LMS',
}

interface PageProps {
  params: Promise<{ level_id: string }>
}

export default async function LevelContentPage({ params }: PageProps) {
  const { level_id } = await params

  if (!level_id) {
    redirect('/dashboard')
  }

  const levelData = await getLevelWithContents(level_id)

  if (!levelData) {
    // Either level doesn't exist, or user is not enrolled/active in it
    redirect('/dashboard')
  }

  return <LevelContentClient level={levelData} />
}
