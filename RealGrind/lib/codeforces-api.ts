// Codeforces API integration utilities

export interface CodeforcesUser {
  handle: string
  email?: string
  vkId?: string
  openId?: string
  firstName?: string
  lastName?: string
  country?: string
  city?: string
  organization?: string
  contribution: number
  rank: string
  rating: number
  maxRank: string
  maxRating: number
  lastOnlineTimeSeconds: number
  registrationTimeSeconds: number
  friendOfCount: number
  avatar: string
  titlePhoto: string
}

export interface CodeforcesSubmission {
  id: number
  contestId?: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: {
    contestId?: number
    problemsetName?: string
    index: string
    name: string
    type: string
    points?: number
    rating?: number
    tags: string[]
  }
  author: {
    contestId?: number
    members: Array<{
      handle: string
      name?: string
    }>
    participantType: string
    ghost: boolean
    room?: number
    startTimeSeconds?: number
  }
  programmingLanguage: string
  verdict: string
  testset: string
  passedTestCount: number
  timeConsumedMillis: number
  memoryConsumedBytes: number
  points?: number
}

export interface CodeforcesContest {
  id: number
  name: string
  type: string
  phase: string
  frozen: boolean
  durationSeconds: number
  startTimeSeconds?: number
  relativeTimeSeconds?: number
  preparedBy?: string
  websiteUrl?: string
  description?: string
  difficulty?: number
  kind?: string
  icpcRegion?: string
  country?: string
  city?: string
  season?: string
}

export interface CodeforcesProblem {
  contestId?: number
  problemsetName?: string
  index: string
  name: string
  type: string
  points?: number
  rating?: number
  tags: string[]
}

class CodeforcesAPI {
  private baseUrl = "https://codeforces.com/api"
  private rateLimitDelay = 200 // 200ms between requests to respect rate limits

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    await this.delay(this.rateLimitDelay)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== "OK") {
        throw new Error(`Codeforces API error: ${data.comment || "Unknown error"}`)
      }

      return data.result
    } catch (error) {
      console.error(`Codeforces API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getUserInfo(handle: string): Promise<CodeforcesUser> {
    const users = await this.makeRequest<CodeforcesUser[]>(`/user.info?handles=${handle}`)
    if (users.length === 0) {
      throw new Error(`User ${handle} not found`)
    }
    return users[0]
  }

  async getUserSubmissions(handle: string, from = 1, count = 100000): Promise<CodeforcesSubmission[]> {
    return this.makeRequest<CodeforcesSubmission[]>(`/user.status?handle=${handle}&from=${from}&count=${count}`)
  }

  async getUserRating(handle: string): Promise<
    Array<{
      contestId: number
      contestName: string
      handle: string
      rank: number
      ratingUpdateTimeSeconds: number
      oldRating: number
      newRating: number
    }>
  > {
    return this.makeRequest(`/user.rating?handle=${handle}`)
  }

  async getContests(): Promise<CodeforcesContest[]> {
    return this.makeRequest<CodeforcesContest[]>("/contest.list?gym=false")
  }

  async getProblems(): Promise<{
    problems: CodeforcesProblem[]
    problemStatistics: Array<{
      contestId?: number
      index: string
      solvedCount: number
    }>
  }> {
    return this.makeRequest("/problemset.problems")
  }

  async getContestStandings(
    contestId: number,
    from = 1,
    count = 10000,
  ): Promise<{
    contest: CodeforcesContest
    problems: CodeforcesProblem[]
    rows: Array<{
      party: {
        contestId?: number
        members: Array<{
          handle: string
          name?: string
        }>
        participantType: string
        ghost: boolean
        room?: number
        startTimeSeconds?: number
      }
      rank: number
      points: number
      penalty: number
      successfulHackCount: number
      unsuccessfulHackCount: number
      problemResults: Array<{
        points: number
        penalty?: number
        rejectedAttemptCount: number
        type: string
        bestSubmissionTimeSeconds?: number
      }>
    }>
  }> {
    return this.makeRequest(`/contest.standings?contestId=${contestId}&from=${from}&count=${count}`)
  }
}

export const codeforcesAPI = new CodeforcesAPI()
