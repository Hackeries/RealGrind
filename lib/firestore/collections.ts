// Firestore collection references and types
export const COLLECTIONS = {
  USERS: "users",
  COLLEGES: "colleges",
  CONTESTS: "contests",
  PROBLEMS: "problems",
  SUBMISSIONS: "submissions",
  VERIFICATION_TOKENS: "verificationTokens",
  ACTIVITIES: "activities",
} as const

// User document structure
export interface UserDoc {
  id: string
  email: string
  name?: string
  role: "student" | "organizer" | "admin"
  codeforcesHandle?: string
  collegeId?: string
  createdAt: Date
  updatedAt: Date
}

// College document structure
export interface CollegeDoc {
  id: string
  name: string
  state?: string
  city?: string
  tier: number
  affiliation?: string
  website?: string
  logoUrl?: string
  slug: string
  createdAt: Date
}

// Contest document structure
export interface ContestDoc {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: "college" | "national" | "custom"
  collegeId?: string
  createdBy: string
  visibility: "public" | "private"
  participants: string[]
  problems: string[]
  createdAt: Date
}

// Problem document structure
export interface ProblemDoc {
  id: string
  contestId?: string
  title: string
  rating?: number
  tags: string[]
  platform: string
  problemId: string
  url?: string
  createdAt: Date
}

// Submission document structure
export interface SubmissionDoc {
  id: string
  userId: string
  problemId: string
  contestId?: string
  status: "AC" | "WA" | "TLE" | "MLE" | "CE" | "RE"
  language?: string
  submittedAt: Date
}
