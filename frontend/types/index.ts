export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified?: string | null;
}

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
  status: "CONFIRMED" | "CANCELLED";
  hasPlusOne: boolean;
  guestName?: string | null;
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
