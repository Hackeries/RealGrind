import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { ContestOperations, ProblemOperations } from "@/lib/firestore/operations"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"
import { z } from "zod"

const CustomContestSchema = z.object({
  title: z.string().min(1, "Contest title is required").max(100),
  ratingMin: z.number().min(800).max(3500),
  ratingMax: z.number().min(800).max(3500),
  count: z.enum([3, 5, 7]),
  tags: z.array(z.string()).optional(),
  friends: z.array(z.string()).optional(),
  duration: z.number().min(60).max(300).default(120), // minutes
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = CustomContestSchema.parse(body)

    if (data.ratingMin >= data.ratingMax) {
      return NextResponse.json({ error: "Rating min must be less than rating max" }, { status: 400 })
    }

    // Get user's solved problems to exclude
    const userSolvedKey = CacheManager.getUserSolvedKey(user.codeforcesHandle || "")
    let solvedProblems = new Set<string>()

    if (user.codeforcesHandle) {
      const cached = await CacheManager.get<string[]>(userSolvedKey)
      if (cached) {
        solvedProblems = new Set(cached)
      } else {
        // Fetch and cache solved problems
        const submissions = await codeforcesAPI.getUserSubmissions(user.codeforcesHandle)
        const solved = submissions
          .filter((s) => s.verdict === "OK")
          .map((s) => `${s.problem.contestId}-${s.problem.index}`)

        solvedProblems = new Set(solved)
        await CacheManager.set(userSolvedKey, Array.from(solvedProblems), { ttl: 3600 }) // 1 hour
      }
    }

    // Get problems from Codeforces
    const problemsData = await codeforcesAPI.getProblems()
    const candidates = problemsData.problems.filter((problem) => {
      const problemKey = `${problem.contestId}-${problem.index}`
      return (
        !solvedProblems.has(problemKey) &&
        problem.rating &&
        problem.rating >= data.ratingMin &&
        problem.rating <= data.ratingMax &&
        (!data.tags?.length || problem.tags.some((tag) => data.tags!.includes(tag)))
      )
    })

    // Enforce tag diversity and sort by difficulty
    const selectedProblems = []
    const usedTags = new Set<string>()
    const tagCount: Record<string, number> = {}

    // Sort candidates by rating (easy to hard)
    candidates.sort((a, b) => (a.rating || 0) - (b.rating || 0))

    for (const problem of candidates) {
      if (selectedProblems.length >= data.count) break

      // Check tag diversity (max 2 problems per tag)
      const problemTags = problem.tags.filter((tag) => !data.tags?.length || data.tags.includes(tag))
      const canAdd = problemTags.every((tag) => (tagCount[tag] || 0) < 2)

      if (canAdd) {
        selectedProblems.push(problem)
        problemTags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
          usedTags.add(tag)
        })
      }
    }

    if (selectedProblems.length < data.count) {
      return NextResponse.json(
        { error: `Could only find ${selectedProblems.length} problems matching criteria` },
        { status: 400 },
      )
    }

    // Create contest
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000)

    const contest = await ContestOperations.createContest({
      title: data.title,
      description: `Custom practice contest: ${data.ratingMin}-${data.ratingMax} rating range`,
      type: "custom",
      visibility: "private",
      startTime,
      endTime,
      createdBy: user.id,
      participants: [user.id, ...(data.friends || [])],
      problems: [],
      createdAt: new Date(),
    })

    // Create problems for the contest
    const contestProblems = []
    for (let i = 0; i < selectedProblems.length; i++) {
      const problem = selectedProblems[i]
      const contestProblem = await ProblemOperations.createProblem({
        contestId: contest.id,
        platform: "codeforces",
        problemId: `${problem.contestId}${problem.index}`,
        title: problem.name,
        rating: problem.rating,
        tags: problem.tags,
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        createdAt: new Date(),
      })
      contestProblems.push(contestProblem)
    }

    return NextResponse.json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        problems: contestProblems.length,
        participants: contest.participants.length,
        shareUrl: `/c/${contest.id}`,
      },
    })
  } catch (error) {
    console.error("Custom contest creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create contest" },
      { status: 500 },
    )
  }
}
