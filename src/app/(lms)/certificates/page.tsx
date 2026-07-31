import { createClient } from '@/lib/supabase/server'
import { Award, Download } from 'lucide-react'

export const metadata = {
  title: 'Certificates — IT-vate LMS',
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch completed enrollments for this user
  const { data: completedEnrollments } = await supabase
    .from('enrollments')
    .select(`
      enroll_id,
      enroll_no,
      track_type,
      approved_at,
      levels (
        level_title,
        no,
        courses ( name, slug )
      )
    `)
    .eq('user_id', user?.id ?? '')
    .eq('status', 'Completed')
    .order('approved_at', { ascending: false })

  const certs = completedEnrollments ?? []

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
          Completion Records
        </span>
        <h1 className="mt-1 text-2xl font-bold text-[#0F172A]">
          Your Certificates
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Certificates are issued upon successful completion of enrolled course levels.
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#0F172A]">No certificates yet</p>
          <p className="text-xs text-slate-500 mt-2">
            Complete an enrolled course level to earn your certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certs.map((cert: any) => (
            <div
              key={cert.enroll_id}
              className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
            >
              {/* Certificate Preview Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A]">
                    <Award className="h-5 w-5 text-[#F18231]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Certificate of Completion
                    </p>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      {(cert.levels as any)?.courses?.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Level:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {(cert.levels as any)?.level_title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Track:</span>
                  <span className="font-bold text-[#F18231]">{cert.track_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Enrollment ID:</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {cert.enroll_no}
                  </span>
                </div>
                {cert.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued:</span>
                    <span className="text-slate-700">
                      {new Date(cert.approved_at).toLocaleDateString('en-PK', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Download Button (placeholder — PDF generation is a future feature) */}
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                title="PDF certificate generation coming soon"
              >
                <Download className="h-3.5 w-3.5" />
                Download Certificate (Coming Soon)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
