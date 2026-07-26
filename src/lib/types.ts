export interface User {
  user_id: string;
  created_at?: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  education?: string;
  year?: number; // FK to Year.year
  updated_at?: string;
}

export interface Year {
  year: number; // int2 PK
}

export interface Experience {
  experience_id: string;
  created_at?: string;
  updated_at?: string;
  experience: string;
  experience_dates: string;
  user_id: string; // FK to User.user_id
}

export interface Course {
  course_id: string;
  name: string;
  description: string;
  is_active: boolean;
  slug: string;
  category?: string;
  levels?: Level[];
}

export interface Level {
  level_id: string;
  created_at?: string;
  updated_at?: string;
  no: number; // level_no / no (int2)
  course_id: string; // FK to Course.course_id
  price: number; // float4
  year?: number; // FK to Year.year
  code?: string; // e.g. "EMB-L1"
  is_active: boolean;
  started_at?: string;
  ended_at?: string;
  level_title: string;
  level_description: string;
  content_items?: ContentItem[];
}

export interface ContentItem {
  content_items_id: string;
  created_at?: string;
  level_id: string; // FK to Level.level_id
  title: string;
  content_type: 'video' | 'pdf' | 'drive' | 'link' | 'code';
  url?: string;
  drive_file_id?: string;
  youtube_id?: string;
  is_free: boolean;
  order_no: number;
  updated_at?: string;
}

export type TrackType = 'Expert' | 'Progressive' | 'Fast' | 'Premium';

export interface TrackOption {
  id: TrackType;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  multiplier: number;
}

export interface Enrollment {
  enroll_id: string;
  user_id: string; // FK to User.user_id
  level_id: string; // FK to Level.level_id
  enroll_no?: string; // CPDP202607001
  status: 'Pending' | 'Active' | 'Completed' | 'Rejected';
  enrolled_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  updated_at?: string;
  track_type?: TrackType;
}

export interface Payment {
  payment_id: string;
  created_at?: string;
  enroll_id: string; // FK to Enrollment.enroll_id
  amount: number;
  discount: number;
  total_amount: number;
  payment_method: string; // "Bank Transfer"
  transaction_reference: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  payment_proof: string; // Image URL
  verified_by?: string; // FK to User.user_id
  verified_at?: string;
  notes?: string;
}

export interface EnrolledCourse {
  enroll_id: string; // FK to Enrollment.enroll_id
  course_id: string; // FK to Course.course_id
  user_id: string; // FK to User.user_id
}

export interface PaymentCourse {
  course_id: string; // FK to Course.course_id
  payment_id: string; // FK to Payment.payment_id
  user_id: string; // FK to User.user_id
}
