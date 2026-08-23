import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Award, Calendar, Hash, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;
  
  // UUID regex to validate id format before querying
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!id || !uuidRegex.test(id)) {
    return <InvalidCertificate />;
  }

  const supabase = await createClient();

  const { data: certificate, error } = await supabase
    .from('certificates')
    .select(`
      certificate_id,
      certificate_code,
      issue_date,
      users ( name ),
      courses ( name ),
      levels ( level_title )
    `)
    .eq('certificate_id', id)
    .single();

  if (error || !certificate) {
    return <InvalidCertificate />;
  }

  // Format date
  const issueDate = new Date(certificate.issue_date);
  const formattedDate = `${issueDate.getDate().toString().padStart(2, '0')} ${issueDate.toLocaleString('default', { month: 'long' })} ${issueDate.getFullYear()}`;

  // @ts-ignore - Supabase join typings can be tricky
  const studentName = certificate.users?.name || 'Student';
  // @ts-ignore
  const courseName = certificate.courses?.name || 'Course';
  // @ts-ignore
  const levelTitle = certificate.levels?.level_title || 'Level';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Certificate Verified
            </h1>
            <p className="text-emerald-50 mt-2 font-medium">
              This certificate is valid and recognized by IT-vate Solutions.
            </p>
          </div>
        </div>

        {/* Content section */}
        <div className="p-10 space-y-8">
          
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">This certifies that</p>
            <h2 className="text-4xl font-black text-[#0F172A] tracking-tight">{studentName}</h2>
            <p className="text-slate-500 text-sm">has successfully completed the requirements for</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center text-[#F18231]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0F172A] leading-tight">{courseName}</h3>
              <p className="text-[#F18231] font-semibold mt-1">{levelTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</p>
                <p className="text-sm font-semibold text-slate-700">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 shrink-0">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credential ID</p>
                <p className="text-sm font-semibold text-slate-700">{certificate.certificate_code}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer section */}
        <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Visit IT-vate Solutions
            <ArrowRight className="h-4 w-4 text-[#F18231]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function InvalidCertificate() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-10 text-center">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Invalid Certificate
          </h1>
        </div>

        <div className="p-8 text-center space-y-6">
          <p className="text-slate-600">
            We could not find a valid certificate matching the provided information. The certificate may have been revoked, or the URL might be incorrect.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
