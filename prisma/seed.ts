import { PrismaClient, CollegeTier } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Seed colleges with minimal starter set
  const colleges = await prisma.college.createMany({
    data: [
      {
        name: "Indian Institute of Technology Delhi",
        slug: "iit-delhi",
        state: "Delhi",
        city: "New Delhi",
        tier: CollegeTier.T1,
        affiliation: "AICTE",
        website: "https://home.iitd.ac.in/",
      },
      {
        name: "Indian Institute of Technology Bombay",
        slug: "iit-bombay",
        state: "Maharashtra",
        city: "Mumbai",
        tier: CollegeTier.T1,
        affiliation: "AICTE",
        website: "https://www.iitb.ac.in/",
      },
      {
        name: "Indian Institute of Technology Kanpur",
        slug: "iit-kanpur",
        state: "Uttar Pradesh",
        city: "Kanpur",
        tier: CollegeTier.T1,
        affiliation: "AICTE",
        website: "https://www.iitk.ac.in/",
      },
      {
        name: "National Institute of Technology Trichy",
        slug: "nit-trichy",
        state: "Tamil Nadu",
        city: "Tiruchirappalli",
        tier: CollegeTier.T1,
        affiliation: "AICTE",
        website: "https://www.nitt.edu/",
      },
      {
        name: "Delhi Technological University",
        slug: "dtu",
        state: "Delhi",
        city: "New Delhi",
        tier: CollegeTier.T2,
        affiliation: "AICTE",
        website: "https://dtu.ac.in/",
      },
      {
        name: "Netaji Subhas University of Technology",
        slug: "nsut",
        state: "Delhi",
        city: "New Delhi",
        tier: CollegeTier.T2,
        affiliation: "AICTE",
        website: "https://www.nsut.ac.in/",
      },
      {
        name: "Birla Institute of Technology and Science Pilani",
        slug: "bits-pilani",
        state: "Rajasthan",
        city: "Pilani",
        tier: CollegeTier.T1,
        affiliation: "Private",
        website: "https://www.bits-pilani.ac.in/",
      },
      {
        name: "Vellore Institute of Technology",
        slug: "vit-vellore",
        state: "Tamil Nadu",
        city: "Vellore",
        tier: CollegeTier.T2,
        affiliation: "Private",
        website: "https://vit.ac.in/",
      },
      {
        name: "Manipal Institute of Technology",
        slug: "mit-manipal",
        state: "Karnataka",
        city: "Manipal",
        tier: CollegeTier.T2,
        affiliation: "Private",
        website: "https://manipal.edu/mit.html",
      },
      {
        name: "SRM Institute of Science and Technology",
        slug: "srm-chennai",
        state: "Tamil Nadu",
        city: "Chennai",
        tier: CollegeTier.T2,
        affiliation: "Private",
        website: "https://www.srmist.edu.in/",
      },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ Created ${colleges.count} colleges`)

  // Create sample contest problems from Codeforces
  const sampleProblems = await prisma.problem.createMany({
    data: [
      {
        platform: "codeforces",
        externalId: "CF-4A",
        title: "Watermelon",
        rating: 800,
        tags: ["math", "brute force"],
        link: "https://codeforces.com/problemset/problem/4/A",
      },
      {
        platform: "codeforces",
        externalId: "CF-1A",
        title: "Theatre Square",
        rating: 1000,
        tags: ["math"],
        link: "https://codeforces.com/problemset/problem/1/A",
      },
      {
        platform: "codeforces",
        externalId: "CF-71A",
        title: "Way Too Long Words",
        rating: 800,
        tags: ["strings"],
        link: "https://codeforces.com/problemset/problem/71/A",
      },
      {
        platform: "codeforces",
        externalId: "CF-158A",
        title: "Next Round",
        rating: 800,
        tags: ["implementation"],
        link: "https://codeforces.com/problemset/problem/158/A",
      },
      {
        platform: "codeforces",
        externalId: "CF-231A",
        title: "Team",
        rating: 800,
        tags: ["brute force"],
        link: "https://codeforces.com/problemset/problem/231/A",
      },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ Created ${sampleProblems.count} sample problems`)
  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
