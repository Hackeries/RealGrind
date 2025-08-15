import { CollegeOperations, ProblemOperations } from "./operations"
import type { CollegeDoc, ProblemDoc } from "./collections"

export async function seedFirestore() {
  console.log("🌱 Seeding Firestore...")

  // Seed colleges
  const collegeData: Omit<CollegeDoc, "id">[] = [
    {
      name: "Indian Institute of Technology Delhi",
      slug: "iit-delhi",
      state: "Delhi",
      city: "New Delhi",
      tier: 1,
      affiliation: "AICTE",
      website: "https://home.iitd.ac.in/",
      createdAt: new Date(),
    },
    {
      name: "Indian Institute of Technology Bombay",
      slug: "iit-bombay",
      state: "Maharashtra",
      city: "Mumbai",
      tier: 1,
      affiliation: "AICTE",
      website: "https://www.iitb.ac.in/",
      createdAt: new Date(),
    },
    {
      name: "Indian Institute of Technology Kanpur",
      slug: "iit-kanpur",
      state: "Uttar Pradesh",
      city: "Kanpur",
      tier: 1,
      affiliation: "AICTE",
      website: "https://www.iitk.ac.in/",
      createdAt: new Date(),
    },
    {
      name: "National Institute of Technology Trichy",
      slug: "nit-trichy",
      state: "Tamil Nadu",
      city: "Tiruchirappalli",
      tier: 1,
      affiliation: "AICTE",
      website: "https://www.nitt.edu/",
      createdAt: new Date(),
    },
    {
      name: "Delhi Technological University",
      slug: "dtu",
      state: "Delhi",
      city: "New Delhi",
      tier: 2,
      affiliation: "AICTE",
      website: "https://dtu.ac.in/",
      createdAt: new Date(),
    },
  ]

  for (const college of collegeData) {
    await CollegeOperations.createCollege(college)
  }

  console.log(`✅ Created ${collegeData.length} colleges`)

  // Seed sample problems
  const problemData: Omit<ProblemDoc, "id">[] = [
    {
      platform: "codeforces",
      problemId: "4A",
      title: "Watermelon",
      rating: 800,
      tags: ["math", "brute force"],
      url: "https://codeforces.com/problemset/problem/4/A",
      createdAt: new Date(),
    },
    {
      platform: "codeforces",
      problemId: "1A",
      title: "Theatre Square",
      rating: 1000,
      tags: ["math"],
      url: "https://codeforces.com/problemset/problem/1/A",
      createdAt: new Date(),
    },
    {
      platform: "codeforces",
      problemId: "71A",
      title: "Way Too Long Words",
      rating: 800,
      tags: ["strings"],
      url: "https://codeforces.com/problemset/problem/71/A",
      createdAt: new Date(),
    },
  ]

  for (const problem of problemData) {
    await ProblemOperations.createProblem(problem)
  }

  console.log(`✅ Created ${problemData.length} sample problems`)
  console.log("🎉 Firestore seeded successfully!")
}
