import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole, type CollegeTier, type CollegeAffiliation } from "@prisma/client"
import { z } from "zod"

const CollegeImportSchema = z.object({
  name: z.string().min(1, "College name is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  tier: z.enum(["T1", "T2", "T3", "OTHER"]).default("T2"),
  affiliation: z.enum(["AICTE", "UGC", "PRIVATE", "AUTONOMOUS"]).default("AICTE"),
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
    await requireRole([UserRole.admin])

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

            const college = await prisma.college.upsert({
              where: {
                name_state_city: {
                  name: validated.name,
                  state: validated.state,
                  city: validated.city,
                },
              },
              update: {
                tier: validated.tier as CollegeTier,
                affiliation: validated.affiliation as CollegeAffiliation,
                website: validated.website,
                logoUrl: validated.logoUrl,
                updatedAt: new Date(),
              },
              create: {
                name: validated.name,
                slug,
                state: validated.state,
                city: validated.city,
                tier: validated.tier as CollegeTier,
                affiliation: validated.affiliation as CollegeAffiliation,
                website: validated.website,
                logoUrl: validated.logoUrl,
              },
            })

            if (college.createdAt.getTime() === college.updatedAt.getTime()) {
              results.imported++
            } else {
              results.updated++
            }
          } catch (error) {
            const errorMsg = `Row ${i + index + 1}: ${error instanceof Error ? error.message : "Invalid data"}`
            results.errors.push(errorMsg)
          }
        }),
      )
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.updated} updated`,
      results,
    })
  } catch (error) {
    console.error("College import error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 500 })
  }
}
