export interface User {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  role: 'student' | 'librarian' | 'guard' | 'admin';
  totalHours: number;
  borrowedCount: number;
  activeSessionId?: string;
  // Streak info
  currentStreak?: number;
  longestStreak?: number;
  streakHours?: number;
  wishlist?: string[];
  reserves?: string[];
}

export interface Book {
  _id: string;
  barcode: string;
  title: string;
  authors: string[];
  description?: string;
  copiesTotal: number;
  copiesAvailable: number;
  coverUrl?: string;
  ebookUrl?: string;
  sampleUrl?: string;
}

export interface Session {
  id: string;
  _id?: string;
  entryAt: string;
  exitAt?: string;
  durationMinutes?: number;
}

export interface BorrowRecord {
  id: string;
  book: Book;
  borrowedAt: string;
  returnedAt?: string;
  dueAt?: string;
  active: boolean;
}

export interface BorrowHistory {
  id: string;
  book: {
    title: string;
    authors: string[];
    barcode: string;
  };
  borrowedAt: string;
  dueAt?: string;
  returnedAt?: string;
  active: boolean;
}

export interface Receipt {
  id: string;
  pdfPath: string;
  books: {
    title: string;
    authors: string[];
    barcode: string;
  }[];
  borrowedAt: string;
}

export interface Occupancy {
  count: number;
  activeSessions: {
    id: string;
    user: {
      name: string;
      rollNo: string;
    };
    entryAt: string;
  }[];
}

export interface ActiveSession {
  id: string;
  user: {
    name: string;
    rollNo: string;
    email: string;
  };
  entryAt: string;
  durationMinutes: number;
}

export interface UserHistory {
  sessions: Session[];
  borrowHistory: BorrowHistory[];
}

export interface UserSummary {
  totalSessions: number;
  totalBorrows: number;
  activeBorrows: {
    id: string;
    book: {
      title: string;
      authors: string[];
      barcode: string;
    };
    borrowedAt: string;
    dueAt?: string;
  }[];
  overdueBooks: {
    id: string;
    book: {
      title: string;
      authors: string[];
      barcode: string;
    };
    borrowedAt: string;
    dueAt?: string;
  }[];
  user: {
    name: string;
    rollNo: string;
    totalHours: number;
    borrowedCount: number;
    currentStreak?: number;
    longestStreak?: number;
    streakHours?: number;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ReturnedBook {
  title: string;
  authors: string[];
  borrowedAt: string;
  returnedAt: string;
}

export interface VerifiedReceipt {
  id: string;
  userId: string;
  issuedAt: string;
}

