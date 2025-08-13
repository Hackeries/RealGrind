import { neon } from "@neondatabase/serverless"

// Create a function that returns the database connection
// This ensures the connection is only created when actually needed (at runtime)
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}
