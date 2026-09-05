export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  emailVerified?: string | null;
  profilePic?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export type EventType = "FORMAL" | "CASUAL" | "SOCIAL" | "WORKSHOP" | "LIVE_MUSIC" | "FOOD_AND_DRINK" | "TRIVIA" | "PRIVATE";

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  deadline: string;
  minParticipants: number;
  maxParticipants: number;
  isCancelled: boolean;
  allowReviewsNow: boolean;
  eventType: EventType;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
  };
  registrations?: Registration[];
}

export interface Registration {
  id: string;
  status: "CONFIRMED" | "PENDING" | "WAITLISTED" | "CANCELLED";
  hasPlusOne: boolean;
  guestName?: string | null;
  guestNames?: string[];
  guestCount?: number;
  checkedIn?: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  eventId: string;
  event?: Event;
}

export interface ApiResponse<T = any> {
  code: number;
  status: "success" | "error";
  message: string;
  data?: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

export interface RegistrationData {
  registrations: Registration[];
  confirmedCount: number;
  maxParticipants: number;
  minParticipants: number;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reply?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
  };
}

export interface AdminRegistration {
  id: string;
  status: "CONFIRMED" | "PENDING" | "WAITLISTED" | "CANCELLED";
  hasPlusOne: boolean;
  guestName?: string | null;
  guestNames?: string[];
  guestCount?: number;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  event: { id: string; title: string; eventDate: string };
}

export interface RegistrationStats {
  total: number;
  confirmed: number;
  pending: number;
  waitlisted: number;
  cancelled: number;
}

export interface AdminReview {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reply?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  event: { id: string; title: string };
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  emailVerified?: string | null;
  suspended?: boolean;
  createdAt: string;
  _count: { registrations: number };
}

export interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
}

export interface AnalyticsOverview {
  totalEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalReviews: number;
  avgRating: number;
  registrationTrend: { month: string; registered: number; attended: number }[];
  eventPerformance: {
    title: string;
    registrations: number;
    maxParticipants: number;
    fillRate: number;
    avgRating: number;
    reviewCount: number;
  }[];
}

export interface CheckInEvent {
  id: string;
  title: string;
  eventDate: string;
  _count: { registrations: number };
}

export interface GuestInfo {
  name: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  isPublished: boolean;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
