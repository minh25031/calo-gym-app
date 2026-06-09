import type { User } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

export type PostType = "food" | "workout"

export interface FoodEntryData {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl: string | null
  note: string | null
  createdAt: Date
}

export interface WorkoutLogData {
  id: string
  note: string | null
  createdAt: Date
  template: { name: string } | null
  exercises: {
    name: string
    sets: number
    reps: number
    weight: number | null
  }[]
}

export interface PostData {
  id: string
  type: PostType
  content: string | null
  imageUrl: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  food: FoodEntryData | null
  workout: WorkoutLogData | null
  likes: { userId: string }[]
  comments: {
    id: string
    content: string
    createdAt: Date
    user: { id: string; name: string | null; image: string | null }
  }[]
  _count: { likes: number; comments: number }
}
