declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      codeforcesHandle?: string | null
      collegeId?: string | null // Updated from college to collegeId to match database schema
      currentRating?: number
      problemsSolved?: number
    }
  }
}
