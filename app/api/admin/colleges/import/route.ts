import { type NextRequest, NextResponse } from "next/server"
import { requireRole, UserRole } from "@/lib/auth"
import { CollegeOperations } from "@/lib/firestore/operations"
import { z } from "zod"

const CollegeImportSchema = z.object({
  name: z.string().min(1, "College name is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  tier: z.coerce.number().min(1).max(3).default(2),
  affiliation: z.string().default("AICTE"),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
})

type CollegeImportData = z.infer<typeof CollegeImportSchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([UserRole.admin], request)

    const body = await request.json()
    const { colleges } = body

    if (!Array.isArray(colleges)) {
      return NextResponse.json({ error: "Expected array of colleges" }, { status: 400 })
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: [] as string[],
    }

    const batchSize = 50
    for (let i = 0; i < colleges.length; i += batchSize) {
      const batch = colleges.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (collegeData: any, index: number) => {
          try {
            const validated = CollegeImportSchema.parse(collegeData)
            const slug = slugify(`${validated.name}-${validated.state}-${validated.city}`)

            const college = await CollegeOperations.upsertCollege(
              {
                name: validated.name,
                state: validated.state,
                city: validated.city,
              },
              {
                name: validated.name,
                slug,
                state: validated.state,
                city: validated.city,
                tier: validated.tier,
                affiliation: validated.affiliation,
                website: validated.website,
                logoUrl: validated.logoUrl,
                createdAt: new Date(),
              },
            )

            // Note: In Firestore, we can't easily distinguish between created and updated
            // For now, we'll count all as imported
            results.imported++
          } catch (error) {
            const errorMsg = `Row ${i + index + 1}: ${error instanceof Error ? error.message : "Invalid data"}`
            results.errors.push(errorMsg)
          }
        }),
      )
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} processed`,
      results,
    })
  } catch (error) {
    console.error("College import error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 500 })
  }
}
