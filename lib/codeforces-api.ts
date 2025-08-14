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

export interface UserStats {
  totalProblems: number
  solvedProblems: number
  currentRating: number
  maxRating: number
  rank: string
  maxRank: string
  contestsParticipated: number
  lastActivity: number
  favoriteLanguages: string[]
  problemsByDifficulty: Record<string, number>
  tagDistribution: Record<string, number>
}

export interface ProblemRecommendation {
  problem: CodeforcesProblem
  reason: string
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: number
}

export interface ActivityItem {
  type: "submission" | "contest" | "rating_change"
  timestamp: number
  data: any
  description: string
}

export interface VerificationSubmission {
  id: number
  contestId?: number
  creationTimeSeconds: number
  problem: {
    contestId?: number
    index: string
    name: string
  }
  programmingLanguage: string
  verdict: string
  sourceCodeLength?: number
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

  async getUserStats(handle: string): Promise<UserStats> {
    const [userInfo, submissions, ratingHistory] = await Promise.all([
      this.getUserInfo(handle),
      this.getUserSubmissions(handle),
      this.getUserRating(handle).catch(() => []), // Handle users with no rating history
    ])

    const solvedProblems = new Set<string>()
    const languageCount: Record<string, number> = {}
    const tagCount: Record<string, number> = {}
    const difficultyCount: Record<string, number> = {}

    // Process submissions to extract statistics
    submissions.forEach((submission) => {
      if (submission.verdict === "OK") {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`
        solvedProblems.add(problemKey)

        // Count programming languages
        languageCount[submission.programmingLanguage] = (languageCount[submission.programmingLanguage] || 0) + 1

        // Count problem tags
        submission.problem.tags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })

        // Count by difficulty rating
        if (submission.problem.rating) {
          const difficultyRange = Math.floor(submission.problem.rating / 100) * 100
          const key = `${difficultyRange}-${difficultyRange + 99}`
          difficultyCount[key] = (difficultyCount[key] || 0) + 1
        }
      }
    })

    // Get top 3 favorite languages
    const favoriteLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang)

    return {
      totalProblems: submissions.length,
      solvedProblems: solvedProblems.size,
      currentRating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || "unrated",
      maxRank: userInfo.maxRank || "unrated",
      contestsParticipated: ratingHistory.length,
      lastActivity: Math.max(...submissions.map((s) => s.creationTimeSeconds), 0),
      favoriteLanguages,
      problemsByDifficulty: difficultyCount,
      tagDistribution: tagCount,
    }
  }

  async getRecommendedProblems(handle: string, count = 10): Promise<ProblemRecommendation[]> {
    const [userStats, problemsData] = await Promise.all([this.getUserStats(handle), this.getProblems()])

    const userRating = userStats.currentRating || 800
    const targetRatingRange = [userRating - 200, userRating + 300]

    // Get user's solved problems
    const submissions = await this.getUserSubmissions(handle)
    const solvedProblems = new Set(
      submissions.filter((s) => s.verdict === "OK").map((s) => `${s.problem.contestId}-${s.problem.index}`),
    )

    // Filter and score problems
    const candidates = problemsData.problems
      .filter((problem) => {
        const problemKey = `${problem.contestId}-${problem.index}`
        return (
          !solvedProblems.has(problemKey) &&
          problem.rating &&
          problem.rating >= targetRatingRange[0] &&
          problem.rating <= targetRatingRange[1]
        )
      })
      .map((problem) => {
        let score = 0
        let reason = ""
        let difficulty: "easy" | "medium" | "hard" = "medium"

        // Score based on rating difference
        const ratingDiff = problem.rating! - userRating
        if (ratingDiff < -100) {
          difficulty = "easy"
          reason = "Good for practice and confidence building"
          score += 1
        } else if (ratingDiff > 100) {
          difficulty = "hard"
          reason = "Challenge problem to push your limits"
          score += 3
        } else {
          difficulty = "medium"
          reason = "Perfect difficulty for skill improvement"
          score += 2
        }

        // Boost score for tags user hasn't practiced much
        const userTags = Object.keys(userStats.tagDistribution)
        const hasUnpracticedTag = problem.tags.some((tag) => !userTags.includes(tag))
        if (hasUnpracticedTag) {
          score += 1
          reason += " (explores new topics)"
        }

        return {
          problem,
          reason,
          difficulty,
          estimatedTime: Math.max(30, Math.min(120, (problem.rating! - 800) / 10)), // 30-120 minutes
          score,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count)

    return candidates.map(({ problem, reason, difficulty, estimatedTime }) => ({
      problem,
      reason,
      difficulty,
      estimatedTime,
    }))
  }

  async getUserActivity(handle: string, days = 30): Promise<ActivityItem[]> {
    const cutoffTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
    const [submissions, ratingHistory] = await Promise.all([
      this.getUserSubmissions(handle),
      this.getUserRating(handle).catch(() => []),
    ])

    const activities: ActivityItem[] = []

    // Add recent submissions
    submissions
      .filter((s) => s.creationTimeSeconds > cutoffTime)
      .slice(0, 50) // Limit to recent 50 submissions
      .forEach((submission) => {
        activities.push({
          type: "submission",
          timestamp: submission.creationTimeSeconds,
          data: submission,
          description: `${submission.verdict === "OK" ? "Solved" : "Attempted"} ${submission.problem.name} (${submission.problem.rating || "unrated"})`,
        })
      })

    // Add rating changes
    ratingHistory
      .filter((r) => r.ratingUpdateTimeSeconds > cutoffTime)
      .forEach((rating) => {
        const change = rating.newRating - rating.oldRating
        activities.push({
          type: "rating_change",
          timestamp: rating.ratingUpdateTimeSeconds,
          data: rating,
          description: `Rating ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change)} in ${rating.contestName}`,
        })
      })

    return activities.sort((a, b) => b.timestamp - a.timestamp)
  }

  async getUpcomingContests(limit = 5): Promise<CodeforcesContest[]> {
    const contests = await this.getContests()
    const now = Math.floor(Date.now() / 1000)

    return contests
      .filter(
        (contest) =>
          contest.phase === "BEFORE" &&
          contest.startTimeSeconds &&
          contest.startTimeSeconds > now &&
          contest.type === "CF", // Only Codeforces rounds, not gym
      )
      .sort((a, b) => (a.startTimeSeconds || 0) - (b.startTimeSeconds || 0))
      .slice(0, limit)
  }

  async getContestPerformance(
    handle: string,
    contestId: number,
  ): Promise<{
    rank: number
    rating: number
    ratingChange: number
    problemsSolved: number
    totalProblems: number
    penalty: number
  } | null> {
    try {
      const [standings, ratingHistory] = await Promise.all([
        this.getContestStandings(contestId),
        this.getUserRating(handle).catch(() => []),
      ])

      const userRow = standings.rows.find((row) => row.party.members.some((member) => member.handle === handle))

      if (!userRow) return null

      const ratingChange = ratingHistory.find((r) => r.contestId === contestId)
      const problemsSolved = userRow.problemResults.filter((p) => p.points > 0).length

      return {
        rank: userRow.rank,
        rating: ratingChange?.newRating || 0,
        ratingChange: ratingChange ? ratingChange.newRating - ratingChange.oldRating : 0,
        problemsSolved,
        totalProblems: standings.problems.length,
        penalty: userRow.penalty,
      }
    } catch (error) {
      console.error("Error fetching contest performance:", error)
      return null
    }
  }

  async getVerificationSubmissions(
    handle: string,
    problemId: string,
    afterTimestamp: number,
  ): Promise<VerificationSubmission[]> {
    const submissions = await this.getUserSubmissions(handle, 1, 50) // Get recent submissions

    return submissions
      .filter((submission) => {
        const problemKey = `${submission.problem.contestId}${submission.problem.index}`
        return (
          problemKey === problemId &&
          submission.creationTimeSeconds > afterTimestamp &&
          submission.verdict === "COMPILATION_ERROR"
        )
      })
      .map((submission) => ({
        id: submission.id,
        contestId: submission.contestId,
        creationTimeSeconds: submission.creationTimeSeconds,
        problem: {
          contestId: submission.problem.contestId,
          index: submission.problem.index,
          name: submission.problem.name,
        },
        programmingLanguage: submission.programmingLanguage,
        verdict: submission.verdict,
        sourceCodeLength: submission.memoryConsumedBytes, // Approximate source length
      }))
  }

  async validateHandle(handle: string): Promise<boolean> {
    try {
      await this.getUserInfo(handle)
      return true
    } catch {
      return false
    }
  }
}

export const codeforcesAPI = new CodeforcesAPI()

export const formatRating = (rating: number): string => {
  if (rating === 0) return "Unrated"
  return rating.toString()
}

export const getRankColor = (rank: string): string => {
  const colors: Record<string, string> = {
    newbie: "text-gray-400",
    pupil: "text-green-400",
    specialist: "text-cyan-400",
    expert: "text-blue-400",
    "candidate master": "text-purple-400",
    master: "text-orange-400",
    "international master": "text-orange-500",
    grandmaster: "text-red-400",
    "international grandmaster": "text-red-500",
    "legendary grandmaster": "text-red-600",
  }
  return colors[rank.toLowerCase()] || "text-gray-400"
}

export const getTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return new Date(timestamp * 1000).toLocaleDateString()
}
