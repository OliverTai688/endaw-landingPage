// ============================================
// Workshop Module Types
// ============================================

export interface Workshop {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  galleryImages: string[];
  description: string; // Rich text/HTML
  instructor: Instructor;
  schedule: WorkshopSchedule;
  capacity: Capacity;
  price: number;
  registrationDeadline: Date;
  tags: string[];
  status: 'draft' | 'published' | 'closed';
  policies: WorkshopPolicies;
  seo: SeoMetadata;
}

export interface Instructor {
  name: string;
  bio: string;
  avatar: string;
}

export interface WorkshopSchedule {
  date: Date;
  location: string;
  duration: string; // e.g., "3 hours"
}

export interface Capacity {
  total: number;
  remaining: number;
}

export interface WorkshopPolicies {
  attendanceRules: string;
  refundPolicy: string;
}

// ============================================
// Music Module Types
// ============================================

export interface Instrument {
  id: string;
  name: string;
  nameEn: string; // English name for URL slugs
  coverImage: string;
  description: string;
  containsEquipment: boolean;
  equipmentDescription?: string;
  rentalAvailable: boolean;
  rentalOffsetAllowed: boolean; // Can rental fee offset purchase?
  levels: Level[];
  faqs: FAQ[];
}

export interface Level {
  id: string;
  name: string; // e.g., "Beginner", "Intermediate", "Advanced"
  packages: Package[];
}

export interface Package {
  id: string;
  name: string;
  lessonCount: number;
  bonusLessons: number; // Buy X get Y free (e.g., buy 5 get 1)
  validDuration: number; // Months (e.g., 3)
  firstClassDate: Date;
  registrationStartDates: Date[];
  formationRequired: boolean; // 拇指琴 requires class formation
  formationDecisionDays: number; // Days before class to decide
  refundPolicy: string;
  price: number;
  status: 'draft' | 'published';
  includedEquipment?: string[]; // e.g., ["Drum sticks", "Practice pad"]
  highlights?: string[]; // Key selling points
}

export interface MonthlyAnnouncement {
  id: string;
  month: string; // ISO format "2026-03"
  instruments: string[]; // Instrument IDs
  schedule: ScheduleItem[];
  announcements: string[];
}

export interface ScheduleItem {
  date: Date;
  time: string; // e.g., "14:00-16:00"
  instructor: string;
  type: string; // e.g., "Regular Class", "Makeup Class"
}

// ============================================
// Shared Types
// ============================================

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
}

// ============================================
// Order & Registration Types
// ============================================

export interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface WorkshopRegistration extends RegistrationForm {
  workshopId: string;
}

export interface MusicRegistration extends RegistrationForm {
  packageId: string;
  preferredStartDate?: Date;
}

export interface Order {
  id: string;
  orderType: 'workshop' | 'music';
  itemId: string; // Workshop ID or Package ID
  userInfo: RegistrationForm;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
}

// ============================================
// Policy Types
// ============================================

export interface PolicySection {
  title: string;
  icon?: string;
  content: string;
}

export interface MusicPolicies {
  validityPeriod: PolicySection;
  leavePolicy: PolicySection;
  formationPolicy?: PolicySection; // For 拇指琴
  refundPolicy: PolicySection;
  rentalPolicy?: PolicySection;
}
