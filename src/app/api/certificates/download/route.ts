import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

function formatDateToWords(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const numberToWords = (num: number) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const wordNumber = (n: number) => {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10].toLowerCase() : '');
    }
    if (num < 100) return wordNumber(num);
    if (num >= 2000 && num < 3000) {
      const lastTwo = num % 100;
      return `Two Thousand ${lastTwo === 0 ? '' : wordNumber(lastTwo)}`;
    }
    return num.toString();
  };

  const dayNames = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];

  const dayWord = dayNames[day - 1];
  const yearWord = numberToWords(year);

  return `${dayWord} day of ${month}, ${yearWord}.`;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const level_id = searchParams.get('level_id');
    const course_id = searchParams.get('course_id');

    if (!level_id || !course_id) {
      return NextResponse.json({ error: 'Missing level_id or course_id' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Validation: Ensure user has completed the level
    // Fetch enrollment to check completion status
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('enroll_id, status, is_completed')
      .eq('user_id', user.id)
      .eq('level_id', level_id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('name, slug')
      .eq('course_id', course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const { data: level, error: levelError } = await supabase
      .from('levels')
      .select('no, level_title')
      .eq('level_id', level_id)
      .single();

    if (levelError || !level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const userName = userProfile?.name || 'Student';

    // 2. Check Existing Certificate
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .eq('level_id', level_id)
      .single();

    let certificateRecord = existingCert;

    if (!certificateRecord) {
      // 3. Generate certificate_code
      const slugParts = course.slug.split('-');
      let acronym = '';
      if (slugParts.length > 1) {
        acronym = slugParts.map((part: string) => part[0]).join('').toUpperCase();
      } else {
        acronym = course.slug.substring(0, 4).toUpperCase();
      }

      const levelCode = `L${level.no}`;
      const year = new Date().getFullYear().toString().slice(-2);

      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString();

      const { count } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)
        .gte('issue_date', startOfYear)
        .lte('issue_date', endOfYear);

      const seqNumber = ((count || 0) + 1).toString().padStart(4, '0');
      const certificate_code = `${acronym}${levelCode}-I${year}${seqNumber}`;

      // 4. Database Insertion
      const { data: insertedCert, error: insertError } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          course_id: course_id,
          level_id: level_id,
          enroll_id: enrollment.enroll_id,
          certificate_code: certificate_code,
          issue_date: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !insertedCert) {
        console.error("Failed to insert certificate:", insertError);
        return NextResponse.json({ error: 'Failed to generate certificate record' }, { status: 500 });
      }

      certificateRecord = insertedCert;
    }

    // 5. QR Code Generation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://it-vate-lms.vercel.app/';
    const verifyUrl = `${baseUrl}/verify/${certificateRecord.certificate_id}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // 6. PDF Stamping
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'certificate_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    pdfDoc.registerFontkit(fontkit);

    const fontDir = path.join(process.cwd(), 'public', 'templates', 'fonts');
    const cursiveBytes = await fs.readFile(path.join(fontDir, 'GreatVibes-Regular.ttf'));
    const poppinsRegularBytes = await fs.readFile(path.join(fontDir, 'Poppins-Regular.ttf'));
    const poppinsBoldBytes = await fs.readFile(path.join(fontDir, 'Poppins-Bold.ttf'));

    const cursiveFont = await pdfDoc.embedFont(cursiveBytes);
    const regularFont = await pdfDoc.embedFont(poppinsRegularBytes);
    const boldFont = await pdfDoc.embedFont(poppinsBoldBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const headerText = "This is to duly certify that";
    firstPage.drawText(headerText, {
      x: width / 2 - (regularFont.widthOfTextAtSize(headerText, 17) / 2),
      y: height / 2 + 135,
      size: 17,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    firstPage.drawText(userName, {
      x: width / 2 - (cursiveFont.widthOfTextAtSize(userName, 45) / 2),
      y: height / 2 + 55,
      size: 45,
      font: cursiveFont,
      color: rgb(0.06, 0.09, 0.16),
    });

    const lineY = height / 2 + 45;
    const lineWidth = 350;
    firstPage.drawLine({
      start: { x: width / 2 - lineWidth / 2, y: lineY },
      end: { x: width / 2 + lineWidth / 2, y: lineY },
      thickness: 1.5,
      color: rgb(0.06, 0.09, 0.16),
    });

    const descriptionText = `has successfully completed the required training and assessment in ${level.level_title} for`;
    firstPage.drawText(descriptionText, {
      x: width / 2 - (regularFont.widthOfTextAtSize(descriptionText, 17) / 2),
      y: height / 2 + 5,
      size: 17,
      font: regularFont,
      color: rgb(0.25, 0.25, 0.25),
    });

    const courseText = course.name;
    firstPage.drawText(courseText, {
      x: width / 2 - (boldFont.widthOfTextAtSize(courseText, 25) / 2),
      y: height / 2 - 35,
      size: 25,
      font: boldFont,
      color: rgb(0.92, 0.45, 0.18),
    });

    const dateSentenceText = `conferred this ${formatDateToWords(certificateRecord.issue_date)}`;
    firstPage.drawText(dateSentenceText, {
      x: width / 2 - (regularFont.widthOfTextAtSize(dateSentenceText, 17) / 2),
      y: height / 2 - 70,
      size: 17,
      font: regularFont,
      color: rgb(0.25, 0.25, 0.25),
    });

    const certIdText = `Certificate ID: ${certificateRecord.certificate_code}`;
    firstPage.drawText(certIdText, {
      x: width / 2 - (regularFont.widthOfTextAtSize(certIdText, 14) / 2),
      y: height / 2 - 120,
      size: 14,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Put QR on the bottom-left as requested
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    firstPage.drawImage(qrCodeImage, {
      x: 60,
      y: 55,
      width: 100,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment ; filename="Certificate-${certificateRecord.certificate_code}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
