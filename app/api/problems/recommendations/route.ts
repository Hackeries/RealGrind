import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

interface RecommendationResult {
  id: string
  contest_id: string
  index: string
  name: string
  type: string
  rating: number | null
  tags: string[]
  solved_count: number
  is_solved: boolean
  difficulty_level: string
  recommendation_score?: number
  recommendation_reason?: string
}

async function getFallbackRecommendations(): Promise<RecommendationResult[]> {
  const fallbackProblems = [
    {
      id: "4A",
      contest_id: "4",
      index: "A",
      name: "Watermelon",
      type: "PROGRAMMING",
      rating: 800,
      tags: ["brute force", "implementation"],
      solved_count: 50000,
      is_solved: false,
      difficulty_level: "Beginner",
      recommendation_reason: "Perfect starting problem for beginners - simple logic and implementation.",
    },
    {
      id: "71A",
      contest_id: "71",
      index: "A",
      name: "Way Too Long Words",
      type: "PROGRAMMING",
      rating: 800,
      tags: ["strings", "implementation"],
      solved_count: 45000,
      is_solved: false,
      difficulty_level: "Beginner",
      recommendation_reason: "Great for practicing string manipulation and basic programming concepts.",
    },
    {
      id: "158A",
      contest_id: "158",
      index: "A",
      name: "Next Round",
      type: "PROGRAMMING",
      rating: 800,
      tags: ["implementation"],
      solved_count: 40000,
      is_solved: false,
      difficulty_level: "Beginner",
      recommendation_reason: "Excellent for learning conditional logic and problem-solving fundamentals.",
    },
    {
      id: "231A",
      contest_id: "231",
      index: "A",
      name: "Team",
      type: "PROGRAMMING",
      rating: 800,
      tags: ["brute force", "greedy"],
      solved_count: 35000,
      is_solved: false,
      difficulty_level: "Beginner",
      recommendation_reason: "Simple counting problem that builds confidence in competitive programming.",
    },
    {
      id: "282A",
      contest_id: "282",
      index: "A",
      name: "Bit++",
      type: "PROGRAMMING",
      rating: 800,
      tags: ["implementation"],
      solved_count: 38000,
      is_solved: false,
      difficulty_level: "Beginner",
      recommendation_reason: "Fun introduction to parsing and basic operations in competitive programming.",
    },
  ]

  return fallbackProblems
}

async function getPersonalizedRecommendations(userId: string): Promise<RecommendationResult[]> {
  try {
    // Step 2: Query UserProblem table to get all problems the user has solved
    const solvedProblems = await sql`
      SELECT DISTINCT p.id, p.tags, p.rating
      FROM user_submissions us
      JOIN problems p ON us.problem_id = p.id
      WHERE us.user_id = ${userId} AND us.verdict = 'OK'
    `

    if (solvedProblems.length === 0) {
      try {
        const randomProblems = await sql`
          SELECT p.id, p.contest_id, p.index, p.name, p.type, p.rating, p.tags, p.solved_count,
                 false as is_solved,
                 CASE 
                   WHEN p.rating IS NULL THEN 'Unrated'
                   WHEN p.rating < 1200 THEN 'Beginner'
                   WHEN p.rating < 1600 THEN 'Pupil'
                   WHEN p.rating < 1900 THEN 'Specialist'
                   WHEN p.rating < 2100 THEN 'Expert'
                   WHEN p.rating < 2400 THEN 'Candidate Master'
                   ELSE 'Master+'
                 END as difficulty_level
          FROM problems p
          WHERE p.rating BETWEEN 800 AND 1400
          ORDER BY RANDOM()
          LIMIT 5
        `

        if (randomProblems.length === 0) {
          return await getFallbackRecommendations()
        }

        return randomProblems.map((p: any) => ({
          ...p,
          recommendation_reason: "Great starting problem to build your competitive programming skills!",
        }))
      } catch (dbError) {
        console.error("Database error in recommendations fallback:", dbError)
        return await getFallbackRecommendations()
      }
    }

    // Step 3: From solved problems, find most frequent tags and calculate median difficulty
    const allTags = solvedProblems.flatMap((p) => p.tags || [])
    const tagCounts = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const frequentTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag)

    const ratings = solvedProblems
      .map((p) => p.rating)
      .filter((r) => r != null)
      .sort((a, b) => a - b)
    const medianDifficulty = ratings.length > 0 ? ratings[Math.floor(ratings.length / 2)] : 1200

    // Step 4: Select problems from Problem table that are unsolved by this user
    const candidateProblems = await sql`
      SELECT p.id, p.contest_id, p.index, p.name, p.type, p.rating, p.tags, p.solved_count,
             false as is_solved,
             CASE 
               WHEN p.rating IS NULL THEN 'Unrated'
               WHEN p.rating < 1200 THEN 'Beginner'
               WHEN p.rating < 1600 THEN 'Pupil'
               WHEN p.rating < 1900 THEN 'Specialist'
               WHEN p.rating < 2100 THEN 'Expert'
               WHEN p.rating < 2400 THEN 'Candidate Master'
               ELSE 'Master+'
             END as difficulty_level
      FROM problems p
      WHERE p.id NOT IN (
        SELECT DISTINCT us.problem_id 
        FROM user_submissions us 
        WHERE us.user_id = ${userId} AND us.verdict = 'OK'
      )
      AND p.rating IS NOT NULL
      AND p.rating BETWEEN ${medianDifficulty - 200} AND ${medianDifficulty + 200}
    `

    if (candidateProblems.length === 0) {
      try {
        const backupProblems = await sql`
          SELECT p.id, p.contest_id, p.index, p.name, p.type, p.rating, p.tags, p.solved_count,
                 false as is_solved,
                 CASE 
                   WHEN p.rating IS NULL THEN 'Unrated'
                   WHEN p.rating < 1200 THEN 'Beginner'
                   WHEN p.rating < 1600 THEN 'Pupil'
                   WHEN p.rating < 1900 THEN 'Specialist'
                   WHEN p.rating < 2100 THEN 'Expert'
                   WHEN p.rating < 2400 THEN 'Candidate Master'
                   ELSE 'Master+'
                 END as difficulty_level
          FROM problems p
          WHERE p.id NOT IN (
            SELECT DISTINCT us.problem_id 
            FROM user_submissions us 
            WHERE us.user_id = ${userId} AND us.verdict = 'OK'
          )
          AND p.rating BETWEEN ${Math.max(800, medianDifficulty - 400)} AND ${medianDifficulty + 400}
          ORDER BY RANDOM()
          LIMIT 5
        `

        if (backupProblems.length === 0) {
          return await getFallbackRecommendations()
        }

        return backupProblems.map((p: any) => ({
          ...p,
          recommendation_reason: "Challenging problem to help you grow your skills in new areas!",
        }))
      } catch (dbError) {
        console.error("Database error in backup recommendations:", dbError)
        return await getFallbackRecommendations()
      }
    }

    // Step 5: Filter and score problems
    const scoredProblems = candidateProblems
      .map((problem: any) => {
        const problemTags = problem.tags || []
        const tagMatches = problemTags.filter((tag: string) => frequentTags.includes(tag)).length
        const tagMatchScore = tagMatches / Math.max(frequentTags.length, 1)

        let recommendationReason = "Good practice problem for your skill level."
        if (tagMatches > 0) {
          const matchedTags = problemTags.filter((tag: string) => frequentTags.includes(tag))
          recommendationReason = `Perfect for practicing ${matchedTags.slice(0, 2).join(" and ")} - areas where you've shown strength!`
        }

        return {
          ...problem,
          tagMatchScore,
          hasFrequentTag: tagMatches > 0,
          difficultyInRange: Math.abs(problem.rating - medianDifficulty) <= 200,
          recommendation_reason: recommendationReason,
        }
      })
      .filter((p: any) => p.hasFrequentTag && p.difficultyInRange)

    // Step 6: Order by tag match score, then random shuffle within score groups
    const sortedProblems = scoredProblems.sort((a: any, b: any) => {
      if (b.tagMatchScore !== a.tagMatchScore) {
        return b.tagMatchScore - a.tagMatchScore
      }
      return Math.random() - 0.5 // Random shuffle for same scores
    })

    // Step 7: Limit to 5 problems and ensure we have some recommendations
    const finalProblems = sortedProblems.slice(0, 5)

    if (finalProblems.length === 0) {
      return await getFallbackRecommendations()
    }

    return finalProblems
  } catch (error) {
    console.error("Error in getPersonalizedRecommendations:", error)
    return await getFallbackRecommendations()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user with NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recommendations = await getPersonalizedRecommendations(session.user.id)

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      personalized: recommendations.some((r) => r.recommendation_reason?.includes("strength")),
      message:
        recommendations.length > 0
          ? "Recommendations generated successfully"
          : "Using fallback recommendations - solve more problems for better personalization",
    })
  } catch (error) {
    console.error("Recommendations API error:", error)

    try {
      const fallbackRecommendations = await getFallbackRecommendations()
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        count: fallbackRecommendations.length,
        personalized: false,
        message: "Using fallback recommendations due to temporary issues",
        error: "Temporary service issue - showing default recommendations",
      })
    } catch (fallbackError) {
      console.error("Fallback recommendations failed:", fallbackError)
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          recommendations: [],
          count: 0,
          personalized: false,
        },
        { status: 500 },
      )
    }
  }
}
