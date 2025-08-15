import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  COLLECTIONS,
  type UserDoc,
  type CollegeDoc,
  type ContestDoc,
  type ProblemDoc,
  type SubmissionDoc,
} from "./collections"

// Generic CRUD operations
export class FirestoreOperations {
  // Create document
  static async create<T extends DocumentData>(collectionName: string, data: T, customId?: string): Promise<string> {
    if (customId) {
      await setDoc(doc(db, collectionName, customId), data)
      return customId
    } else {
      const docRef = await addDoc(collection(db, collectionName), data)
      return docRef.id
    }
  }

  // Read document by ID
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const docSnap = await getDoc(doc(db, collectionName, id))
    return docSnap.exists() ? (docSnap.data() as T) : null
  }

  // Update document
  static async update(collectionName: string, id: string, data: Partial<DocumentData>): Promise<void> {
    await updateDoc(doc(db, collectionName, id), data)
  }

  // Delete document
  static async delete(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, id))
  }

  // Query documents
  static async query<T>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    limitCount?: number,
  ): Promise<T[]> {
    const queryConstraints = [...constraints]
    if (limitCount) {
      queryConstraints.push(limit(limitCount))
    }

    const q = query(collection(db, collectionName), ...queryConstraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
  }

  // Batch operations
  static async batchWrite(
    operations: Array<{
      type: "create" | "update" | "delete"
      collection: string
      id?: string
      data?: DocumentData
    }>,
  ): Promise<void> {
    const batch = writeBatch(db)

    for (const op of operations) {
      const docRef = op.id ? doc(db, op.collection, op.id) : doc(collection(db, op.collection))

      switch (op.type) {
        case "create":
          batch.set(docRef, op.data!)
          break
        case "update":
          batch.update(docRef, op.data!)
          break
        case "delete":
          batch.delete(docRef)
          break
      }
    }

    await batch.commit()
  }
}

// User operations
export class UserOperations {
  static async createUser(userData: Omit<UserDoc, "id">): Promise<UserDoc> {
    const id = await FirestoreOperations.create(COLLECTIONS.USERS, userData, userData.id)
    return { id, ...userData }
  }

  static async getUserById(id: string): Promise<UserDoc | null> {
    return FirestoreOperations.getById<UserDoc>(COLLECTIONS.USERS, id)
  }

  static async updateUser(id: string, data: Partial<UserDoc>): Promise<void> {
    await FirestoreOperations.update(COLLECTIONS.USERS, id, { ...data, updatedAt: new Date() })
  }

  static async getUserByEmail(email: string): Promise<UserDoc | null> {
    const users = await FirestoreOperations.query<UserDoc>(COLLECTIONS.USERS, [where("email", "==", email)], 1)
    return users[0] || null
  }

  static async getUserByCodeforcesHandle(handle: string): Promise<UserDoc | null> {
    const users = await FirestoreOperations.query<UserDoc>(
      COLLECTIONS.USERS,
      [where("codeforcesHandle", "==", handle)],
      1,
    )
    return users[0] || null
  }
}

// College operations
export class CollegeOperations {
  static async createCollege(collegeData: Omit<CollegeDoc, "id">): Promise<CollegeDoc> {
    const id = await FirestoreOperations.create(COLLECTIONS.COLLEGES, collegeData)
    return { id, ...collegeData }
  }

  static async searchColleges(searchParams: {
    q?: string
    state?: string
    city?: string
    tier?: number
    limit?: number
    offset?: number
  }): Promise<{ colleges: CollegeDoc[]; total: number }> {
    const constraints: QueryConstraint[] = []

    if (searchParams.state) {
      constraints.push(where("state", "==", searchParams.state))
    }

    if (searchParams.city) {
      constraints.push(where("city", "==", searchParams.city))
    }

    if (searchParams.tier) {
      constraints.push(where("tier", "==", searchParams.tier))
    }

    constraints.push(orderBy("name"))

    const colleges = await FirestoreOperations.query<CollegeDoc>(
      COLLECTIONS.COLLEGES,
      constraints,
      searchParams.limit || 20,
    )

    // Note: Firestore doesn't have a direct count operation, so we return the length
    // For production, consider using Firestore count() or maintaining a separate counter
    return { colleges, total: colleges.length }
  }

  static async upsertCollege(
    uniqueFields: { name: string; state: string; city: string },
    collegeData: Omit<CollegeDoc, "id">,
  ): Promise<CollegeDoc> {
    // Check if college exists
    const existing = await FirestoreOperations.query<CollegeDoc>(
      COLLECTIONS.COLLEGES,
      [
        where("name", "==", uniqueFields.name),
        where("state", "==", uniqueFields.state),
        where("city", "==", uniqueFields.city),
      ],
      1,
    )

    if (existing[0]) {
      // Update existing
      await FirestoreOperations.update(COLLECTIONS.COLLEGES, existing[0].id, collegeData)
      return { ...existing[0], ...collegeData }
    } else {
      // Create new
      return this.createCollege(collegeData)
    }
  }
}

// Contest operations
export class ContestOperations {
  static async createContest(contestData: Omit<ContestDoc, "id">): Promise<ContestDoc> {
    const id = await FirestoreOperations.create(COLLECTIONS.CONTESTS, contestData)
    return { id, ...contestData }
  }

  static async getContestById(id: string): Promise<ContestDoc | null> {
    return FirestoreOperations.getById<ContestDoc>(COLLECTIONS.CONTESTS, id)
  }

  static async getUserContests(userId: string): Promise<ContestDoc[]> {
    return FirestoreOperations.query<ContestDoc>(COLLECTIONS.CONTESTS, [
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc"),
    ])
  }

  static async getCollegeContests(collegeId: string): Promise<ContestDoc[]> {
    return FirestoreOperations.query<ContestDoc>(COLLECTIONS.CONTESTS, [
      where("collegeId", "==", collegeId),
      orderBy("startTime", "desc"),
    ])
  }
}

// Problem operations
export class ProblemOperations {
  static async createProblem(problemData: Omit<ProblemDoc, "id">): Promise<ProblemDoc> {
    const id = await FirestoreOperations.create(COLLECTIONS.PROBLEMS, problemData)
    return { id, ...problemData }
  }

  static async getContestProblems(contestId: string): Promise<ProblemDoc[]> {
    return FirestoreOperations.query<ProblemDoc>(COLLECTIONS.PROBLEMS, [
      where("contestId", "==", contestId),
      orderBy("createdAt"),
    ])
  }

  static async getProblemsByRating(minRating: number, maxRating: number, tags?: string[]): Promise<ProblemDoc[]> {
    const constraints: QueryConstraint[] = [where("rating", ">=", minRating), where("rating", "<=", maxRating)]

    if (tags && tags.length > 0) {
      constraints.push(where("tags", "array-contains-any", tags))
    }

    return FirestoreOperations.query<ProblemDoc>(COLLECTIONS.PROBLEMS, constraints)
  }
}

// Submission operations
export class SubmissionOperations {
  static async createSubmission(submissionData: Omit<SubmissionDoc, "id">): Promise<SubmissionDoc> {
    const id = await FirestoreOperations.create(COLLECTIONS.SUBMISSIONS, submissionData)
    return { id, ...submissionData }
  }

  static async getUserSubmissions(userId: string): Promise<SubmissionDoc[]> {
    return FirestoreOperations.query<SubmissionDoc>(COLLECTIONS.SUBMISSIONS, [
      where("userId", "==", userId),
      orderBy("submittedAt", "desc"),
    ])
  }

  static async getContestSubmissions(contestId: string): Promise<SubmissionDoc[]> {
    return FirestoreOperations.query<SubmissionDoc>(COLLECTIONS.SUBMISSIONS, [
      where("contestId", "==", contestId),
      orderBy("submittedAt", "desc"),
    ])
  }
}
