import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const getFallbackProblems = () => [
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
  },
]

const getFallbackTags = () => [
  "implementation",
  "math",
  "greedy",
  "strings",
  "brute force",
  "constructive algorithms",
  "sortings",
  "number theory",
  "dp",
  "graphs",
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty") || "all"
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const minRating = Number.parseInt(searchParams.get("minRating") || "800")
    const maxRating = Number.parseInt(searchParams.get("maxRating") || "3500")
    const solved = searchParams.get("solved") || "all"
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build the WHERE clause
    const whereConditions = ["p.rating IS NOT NULL"]
    const queryParams: any[] = []
    let paramIndex = 1

    // Rating filter
    whereConditions.push(`p.rating >= $${paramIndex}`)
    queryParams.push(minRating)
    paramIndex++

    whereConditions.push(`p.rating <= $${paramIndex}`)
    queryParams.push(maxRating)
    paramIndex++

    // Difficulty filter
    if (difficulty !== "all") {
      let difficultyRange: [number, number]
      switch (difficulty) {
        case "Beginner":
          difficultyRange = [800, 1199]
          break
        case "Pupil":
          difficultyRange = [1200, 1599]
          break
        case "Specialist":
          difficultyRange = [1600, 1899]
          break
        case "Expert":
          difficultyRange = [1900, 2099]
          break
        case "Candidate Master":
          difficultyRange = [2100, 2399]
          break
        case "Master+":
          difficultyRange = [2400, 5000]
          break
        default:
          difficultyRange = [800, 5000]
      }

      whereConditions.push(`p.rating >= $${paramIndex}`)
      queryParams.push(difficultyRange[0])
      paramIndex++

      whereConditions.push(`p.rating <= $${paramIndex}`)
      queryParams.push(difficultyRange[1])
      paramIndex++
    }

    // Tags filter
    if (tags.length > 0) {
      whereConditions.push(`p.tags && $${paramIndex}`)
      queryParams.push(tags)
      paramIndex++
    }

    // Search filter
    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.id ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Build the main query
    const baseQuery = `
      SELECT 
        p.id,
        p.contest_id,
        p.index,
        p.name,
        p.type,
        p.rating,
        p.tags,
        p.solved_count,
        CASE 
          WHEN us.problem_id IS NOT NULL AND us.verdict = 'OK' THEN true
          ELSE false
        END as is_solved,
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
      LEFT JOIN (
        SELECT DISTINCT problem_id, verdict
        FROM user_submissions
        WHERE user_id = $${paramIndex} AND verdict = 'OK'
      ) us ON p.id = us.problem_id
      WHERE ${whereConditions.join(" AND ")}
    `

    queryParams.push(session.user.id)
    paramIndex++

    // Solved filter
    let finalQuery = baseQuery
    if (solved === "solved") {
      finalQuery += " AND us.problem_id IS NOT NULL"
    } else if (solved === "unsolved") {
      finalQuery += " AND us.problem_id IS NULL"
    }

    finalQuery += ` ORDER BY p.rating ASC, p.solved_count DESC LIMIT $${paramIndex}`
    queryParams.push(limit)

    let problems, availableTags

    try {
      const sql = getDb()

      problems = await sql.unsafe(finalQuery, queryParams)

      // Get available tags
      const tagsResult = await sql`
        SELECT DISTINCT UNNEST(tags) as tag
        FROM problems
        WHERE rating IS NOT NULL
        ORDER BY tag
        LIMIT 50
      `

      availableTags = tagsResult.map((row: any) => row.tag)
    } catch (dbError) {
      console.error("Database error in problems API:", dbError)
      problems = getFallbackProblems()
      availableTags = getFallbackTags()
    }

    if (problems.length === 0 && search === "" && tags.length === 0) {
      // No problems found with current filters, provide fallback
      problems = getFallbackProblems().filter((p) => p.rating >= minRating && p.rating <= maxRating)
    }

    return NextResponse.json({
      problems,
      availableTags,
      count: problems.length,
      filters: {
        difficulty,
        tags,
        minRating,
        maxRating,
        solved,
        search,
      },
      message:
        problems.length > 0
          ? "Problems loaded successfully"
          : "No problems match your current filters. Try adjusting your search criteria.",
    })
  } catch (error) {
    console.error("Problems fetch error:", error)

    return NextResponse.json(
      {
        problems: getFallbackProblems(),
        availableTags: getFallbackTags(),
        count: getFallbackProblems().length,
        error: "Temporary service issue - showing sample problems",
        message: "Service temporarily unavailable, showing fallback data",
      },
      { status: 200 },
    ) // Return 200 with fallback data instead of 500
  }
}
