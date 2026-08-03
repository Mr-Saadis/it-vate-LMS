import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CertificateClient } from '../../CertificateClient'

export const metadata = {
  title: 'Level Certificate — IT-vate LMS',
}

interface PageProps {
  params: Promise<{ enroll_id: string }>
}

export default async function LevelCertificatePage({ params }: PageProps) {
  const { enroll_id } = await params

  if (!enroll_id) {
    redirect('/certificates')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select(`
      enroll_no,
      status,
      approved_at,
      levels (
        level_title,
        courses ( name )
      )
    `)
    .eq('enroll_id', enroll_id)
    .eq('user_id', user?.id ?? '')
    .single()

  if (!enrollment || enrollment.status !== 'Completed') {
    redirect('/certificates')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('user_id', user?.id ?? '')
    .single()

  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Student'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const levelTitle = (enrollment.levels as any)?.level_title || 'Level'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseName = (enrollment.levels as any)?.courses?.name || 'Course'

  return (
    <CertificateClient 
      type="level"
      studentName={userName}
      courseName={courseName}
      levelName={levelTitle}
      issueDate={enrollment.approved_at || new Date().toISOString()}
      certificateId={enrollment.enroll_no || enroll_id.substring(0, 8)}
    />
  )
}
