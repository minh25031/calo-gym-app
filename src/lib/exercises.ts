export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "legs" | "glutes" | "core" | "cardio" | "full_body"

export type GoalType = "strength" | "hypertrophy" | "endurance"

export interface Exercise {
  id: string
  name: string
  nameEn: string
  muscleGroup: MuscleGroup
  description: string
  imageUrl?: string
  suggestedSets: Record<GoalType, { sets: number; reps: string }>
}

export const muscleColors: Record<MuscleGroup, string> = {
  chest: "#ef4444",
  back: "#8b5cf6",
  shoulders: "#f59e0b",
  biceps: "#3b82f6",
  triceps: "#06b6d4",
  legs: "#10b981",
  glutes: "#ec4899",
  core: "#f97316",
  cardio: "#14b8a6",
  full_body: "#6366f1",
}

export const muscleGroups: { value: MuscleGroup; label: string; emoji: string }[] = [
  { value: "chest", label: "Ngực", emoji: "🏋️" },
  { value: "back", label: "Lưng", emoji: "🔙" },
  { value: "shoulders", label: "Vai", emoji: "💪" },
  { value: "biceps", label: "Tay trước", emoji: "💪" },
  { value: "triceps", label: "Tay sau", emoji: "💪" },
  { value: "legs", label: "Chân", emoji: "🦵" },
  { value: "glutes", label: "Mông", emoji: "🍑" },
  { value: "core", label: "Bụng", emoji: "🔥" },
  { value: "cardio", label: "Cardio", emoji: "🏃" },
]

const E: Omit<Exercise, "suggestedSets">[] = [
  // CHEST
  { id: "chest-1", name: "Bench Press", nameEn: "Barbell Bench Press", muscleGroup: "chest",
    description: "Nằm ghế phẳng, đẩy tạ lên từ ngực. Bài tập cơ bản nhất cho ngực.",
    imageUrl: "https://wger.de/media/exercise-images/192/Bench-press-1.png" },
  { id: "chest-2", name: "Incline Bench Press", nameEn: "Incline Barbell Bench Press", muscleGroup: "chest",
    description: "Ghế nghiêng 30-45°, tập trung vào phần ngực trên.",
    imageUrl: "https://wger.de/media/exercise-images/41/Incline-bench-press-1.png" },
  { id: "chest-3", name: "Dumbbell Fly", nameEn: "Dumbbell Fly", muscleGroup: "chest",
    description: "Nằm ghế, tay cầm tạ đơn, mở rộng và khép tay như ôm cây.",
    imageUrl: "https://wger.de/media/exercise-images/98/Butterfly-machine-2.png" },
  { id: "chest-4", name: "Dumbbell Bench Press", nameEn: "Dumbbell Bench Press", muscleGroup: "chest",
    description: "Giống Bench Press nhưng dùng tạ đơn, tầm vận động rộng hơn.",
    imageUrl: "https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png" },
  { id: "chest-5", name: "Cable Crossover", nameEn: "Cable Crossover", muscleGroup: "chest",
    description: "Đứng giữa máy cable, kéo hai tay từ cao xuống trước ngực.",
    imageUrl: "https://wger.de/media/exercise-images/71/Cable-crossover-2.png" },
  { id: "chest-6", name: "Push-up", nameEn: "Push-up", muscleGroup: "chest",
    description: "Bài tập với trọng lượng cơ thể, tác động ngực, vai và tay sau.",
    imageUrl: "https://wger.de/media/exercise-images/1889/bc51ef67-0c12-4340-a36c-42ef722778dd.png" },
  { id: "chest-7", name: "Decline Bench Press", nameEn: "Decline Bench Press", muscleGroup: "chest",
    description: "Ghế dốc xuống, tập trung vào phần ngực dưới.",
    imageUrl: "https://wger.de/media/exercise-images/100/Decline-bench-press-1.png" },
  // BACK
  { id: "back-1", name: "Pull-up", nameEn: "Pull-up", muscleGroup: "back",
    description: "Treo xà đơn, kéo người lên đến khi cằm qua xà.",
    imageUrl: "https://wger.de/media/exercise-images/181/Chin-ups-2.png" },
  { id: "back-2", name: "Barbell Row", nameEn: "Barbell Row", muscleGroup: "back",
    description: "Cúi người, kéo tạ đòn từ dưới lên bụng.",
    imageUrl: "https://wger.de/media/exercise-images/110/Reverse-grip-bent-over-rows-1.png" },
  { id: "back-3", name: "Lat Pulldown", nameEn: "Lat Pulldown", muscleGroup: "back",
    description: "Ngồi máy kéo xô, kéo thanh từ cao xuống trước ngực.",
    imageUrl: "https://wger.de/media/exercise-images/106/T-bar-row-1.png" },
  { id: "back-4", name: "Seated Cable Row", nameEn: "Seated Cable Row", muscleGroup: "back",
    description: "Ngồi máy row, kéo tay cầm về phía bụng, siết lưng.",
    imageUrl: "https://wger.de/media/exercise-images/143/Cable-seated-rows-2.png" },
  { id: "back-5", name: "Dumbbell Row", nameEn: "Dumbbell Row", muscleGroup: "back",
    description: "Một tay chống ghế, tay kia cầm tạ đơn kéo lên hông.",
    imageUrl: "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png" },
  { id: "back-6", name: "Deadlift", nameEn: "Deadlift", muscleGroup: "back",
    description: "Nhấc tạ đòn từ dưới đất lên, tác động toàn bộ chuỗi sau.",
    imageUrl: "https://wger.de/media/exercise-images/161/Dead-lifts-2.png" },
  // SHOULDERS
  { id: "sho-1", name: "Overhead Press", nameEn: "Overhead Press", muscleGroup: "shoulders",
    description: "Đẩy tạ từ vai lên cao qua đầu. Bài tập vai tổng hợp nhất.",
    imageUrl: "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png" },
  { id: "sho-2", name: "Lateral Raise", nameEn: "Lateral Raise", muscleGroup: "shoulders",
    description: "Đứng thẳng, tay cầm tạ nhẹ, dang ngang hai tay lên ngang vai.",
    imageUrl: "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png" },
  { id: "sho-3", name: "Front Raise", nameEn: "Front Raise", muscleGroup: "shoulders",
    description: "Đứng thẳng, nâng tạ từ trước lên cao ngang vai.",
    imageUrl: "https://wger.de/media/exercise-images/151/Dumbbell-shrugs-1.png" },
  { id: "sho-4", name: "Face Pull", nameEn: "Face Pull", muscleGroup: "shoulders",
    description: "Kéo cable từ cao về phía mặt, tập vai sau và cơ bả vai.",
    imageUrl: "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-2.png" },
  { id: "sho-5", name: "Arnold Press", nameEn: "Arnold Press", muscleGroup: "shoulders",
    description: "Đẩy vai với xoay cổ tay, tập cả 3 phần vai.",
    imageUrl: "https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-1.png" },
  // BICEPS
  { id: "bic-1", name: "Barbell Curl", nameEn: "Barbell Bicep Curl", muscleGroup: "biceps",
    description: "Đứng thẳng, tay cầm tạ đòn, cuộn tạ lên vai.",
    imageUrl: "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png" },
  { id: "bic-2", name: "Dumbbell Curl", nameEn: "Dumbbell Bicep Curl", muscleGroup: "biceps",
    description: "Ngồi hoặc đứng, tay cầm tạ đơn, cuộn lên vai.",
    imageUrl: "https://wger.de/media/exercise-images/81/Biceps-curl-1.png" },
  { id: "bic-3", name: "Hammer Curl", nameEn: "Hammer Curl", muscleGroup: "biceps",
    description: "Cầm tạ kiểu búa, cuộn lên vai, tập cả cơ cẳng tay.",
    imageUrl: "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png" },
  { id: "bic-4", name: "Concentration Curl", nameEn: "Concentration Curl", muscleGroup: "biceps",
    description: "Ngồi, chống tay vào đùi, cuộn tạ đơn. Cô lập tay trước tối đa.",
    imageUrl: "https://wger.de/media/exercise-images/193/Preacher-curl-3-1.png" },
  // TRICEPS
  { id: "tri-1", name: "Tricep Pushdown", nameEn: "Tricep Pushdown", muscleGroup: "triceps",
    description: "Đứng máy cable, đẩy thanh từ trên cao xuống, siết tay sau.",
    imageUrl: "https://wger.de/media/exercise-images/61/Close-grip-bench-press-1.png" },
  { id: "tri-2", name: "Skull Crusher", nameEn: "Lying Tricep Extension", muscleGroup: "triceps",
    description: "Nằm ghế, tay cầm tạ đòn, hạ tạ sau đầu rồi duỗi thẳng.",
    imageUrl: "https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png" },
  { id: "tri-3", name: "Dips", nameEn: "Tricep Dips", muscleGroup: "triceps",
    description: "Chống tay lên xà kép, hạ thấp người rồi đẩy lên.",
    imageUrl: "https://wger.de/media/exercise-images/83/Bench-dips-1.png" },
  { id: "tri-4", name: "Overhead Extension", nameEn: "Overhead Tricep Extension", muscleGroup: "triceps",
    description: "Tay cầm tạ đơn đưa lên cao, hạ sau đầu rồi duỗi.",
    imageUrl: "https://wger.de/media/exercise-images/61/Close-grip-bench-press-2.png" },
  // LEGS
  { id: "leg-1", name: "Barbell Squat", nameEn: "Barbell Back Squat", muscleGroup: "legs",
    description: "Tạ đòn sau vai, hạ thấp người như ngồi ghế rồi đứng lên.",
    imageUrl: "https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png" },
  { id: "leg-2", name: "Leg Press", nameEn: "Leg Press", muscleGroup: "legs",
    description: "Ngồi máy leg press, đẩy tạ bằng chân.",
    imageUrl: "https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-1-1024x721.png" },
  { id: "leg-3", name: "Romanian Deadlift", nameEn: "Romanian Deadlift", muscleGroup: "legs",
    description: "Đứng thẳng, cầm tạ đòn, gập hông đẩy mông ra sau.",
    imageUrl: "https://wger.de/media/exercise-images/116/Good-mornings-2.png" },
  { id: "leg-4", name: "Leg Extension", nameEn: "Leg Extension", muscleGroup: "legs",
    description: "Ngồi máy, duỗi thẳng chân lên cao. Cô lập đùi trước.",
    imageUrl: "https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png" },
  { id: "leg-5", name: "Leg Curl", nameEn: "Leg Curl", muscleGroup: "legs",
    description: "Nằm sấp máy, gập chân lên mông. Cô lập đùi sau.",
    imageUrl: "https://wger.de/media/exercise-images/117/seated-leg-curl-large-1.png" },
  { id: "leg-6", name: "Walking Lunges", nameEn: "Walking Lunges", muscleGroup: "legs",
    description: "Bước chân về trước, hạ thấp gối sau sát đất.",
    imageUrl: "https://wger.de/media/exercise-images/113/Walking-lunges-1.png" },
  { id: "leg-7", name: "Calf Raise", nameEn: "Standing Calf Raise", muscleGroup: "legs",
    description: "Đứng thẳng, kiễng gót lên cao, hạ xuống chậm.",
    imageUrl: "https://wger.de/media/exercise-images/118/standing-leg-curls-large-1.png" },
  // GLUTES
  { id: "glu-1", name: "Hip Thrust", nameEn: "Hip Thrust", muscleGroup: "glutes",
    description: "Ngồi dưới ghế, tạ lên hông, đẩy hông lên cao.",
    imageUrl: "https://wger.de/media/exercise-images/116/Good-mornings-1.png" },
  { id: "glu-2", name: "Glute Bridge", nameEn: "Glute Bridge", muscleGroup: "glutes",
    description: "Nằm ngửa, co gối, đẩy hông lên cao. Tập mông không tạ.",
    imageUrl: "https://wger.de/media/exercise-images/128/Hyperextensions-1.png" },
  { id: "glu-3", name: "Bulgarian Split Squat", nameEn: "Bulgarian Split Squat", muscleGroup: "glutes",
    description: "Một chân đặt sau lên ghế, chân kia squat sâu.",
    imageUrl: "https://wger.de/media/exercise-images/113/Walking-lunges-2.png" },
  // CORE
  { id: "core-1", name: "Plank", nameEn: "Plank", muscleGroup: "core",
    description: "Chống thẳng tay, giữ người thẳng từ đầu đến gót.",
    imageUrl: "https://wger.de/media/exercise-images/128/Hyperextensions-2.png" },
  { id: "core-2", name: "Crunch", nameEn: "Crunch", muscleGroup: "core",
    description: "Nằm ngửa, co gối, gập người lên. Tập bụng trên.",
    imageUrl: "https://wger.de/media/exercise-images/91/Crunches-1.png" },
  { id: "core-3", name: "Leg Raise", nameEn: "Leg Raise", muscleGroup: "core",
    description: "Nằm ngửa, nâng hai chân thẳng lên 90°. Tập bụng dưới.",
    imageUrl: "https://wger.de/media/exercise-images/125/Leg-raises-2.png" },
  { id: "core-4", name: "Russian Twist", nameEn: "Russian Twist", muscleGroup: "core",
    description: "Ngồi, chân nhấc khỏi đất, xoay người sang hai bên.",
    imageUrl: "https://wger.de/media/exercise-images/176/Cross-body-crunch-1.png" },
  { id: "core-5", name: "Hanging Leg Raise", nameEn: "Hanging Leg Raise", muscleGroup: "core",
    description: "Treo xà đơn, nâng hai chân lên song song mặt đất.",
    imageUrl: "https://wger.de/media/exercise-images/125/Leg-raises-1.png" },
  // CARDIO
  { id: "card-1", name: "Chạy bộ", nameEn: "Running", muscleGroup: "cardio",
    description: "Chạy tốc độ đều hoặc interval. Đốt calo hiệu quả.",
    imageUrl: "https://wger.de/media/exercise-images/1962/74041371-1019-4f89-9ebe-cec792484a46.png" },
  { id: "card-2", name: "Nhảy dây", nameEn: "Jump Rope", muscleGroup: "cardio",
    description: "Nhảy dây liên tục. Tốt cho tim mạch và đốt mỡ.",
    imageUrl: "https://wger.de/media/exercise-images/1965/03c08a42-dedb-4a46-8d15-acaf497a35a2.png" },
  { id: "card-3", name: "Burpees", nameEn: "Burpees", muscleGroup: "cardio",
    description: "Chống đất - bật dậy - vỗ tay. Bài tập HIIT toàn thân.",
    imageUrl: "https://wger.de/media/exercise-images/194/34600351-8b0b-4cb0-8daa-583537be15b0.png" },
]

const defaultSets: Record<GoalType, { sets: number; reps: string }> = {
  strength: { sets: 5, reps: "3-5" },
  hypertrophy: { sets: 4, reps: "8-12" },
  endurance: { sets: 3, reps: "15-20" },
}

export const EXERCISES: Exercise[] = E.map((e) => ({
  ...e,
  suggestedSets: { ...defaultSets },
}))

// Adjust sets for specific exercise types
const chestPressIds = ["chest-1", "chest-2", "chest-4", "chest-7"]
const bigLifts = ["leg-1", "back-6", "back-2", "back-1"]
EXERCISES.forEach((e) => {
  if (chestPressIds.includes(e.id) || bigLifts.includes(e.id)) {
    e.suggestedSets.strength = { sets: 5, reps: "3-5" }
    e.suggestedSets.hypertrophy = { sets: 4, reps: "8-12" }
    e.suggestedSets.endurance = { sets: 3, reps: "15-20" }
  } else if (e.id.startsWith("core-")) {
    e.suggestedSets.strength = { sets: 3, reps: "10-15" }
    e.suggestedSets.hypertrophy = { sets: 3, reps: "15-20" }
    e.suggestedSets.endurance = { sets: 3, reps: "20-30" }
  } else if (e.id.startsWith("card-")) {
    e.suggestedSets.strength = { sets: 1, reps: "15-20 ph" }
    e.suggestedSets.hypertrophy = { sets: 1, reps: "20-30 ph" }
    e.suggestedSets.endurance = { sets: 1, reps: "30-45 ph" }
  }
})

export interface WorkoutPlan {
  id: string
  name: string
  nameEn: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  goal: GoalType[]
  muscleGroups: MuscleGroup[]
  exercises: { exerciseId: string; order: number }[]
  estimatedTime: string
}

export const PREBUILT_TEMPLATES: WorkoutPlan[] = [
  {
    id: "push", name: "Push Day (Đẩy)", nameEn: "Push Day",
    description: "Tập ngực, vai và tay sau", difficulty: "intermediate", goal: ["hypertrophy", "strength"],
    muscleGroups: ["chest", "shoulders", "triceps"],
    exercises: [{ exerciseId: "chest-1", order: 1 }, { exerciseId: "chest-2", order: 2 }, { exerciseId: "sho-1", order: 3 }, { exerciseId: "sho-2", order: 4 }, { exerciseId: "tri-1", order: 5 }, { exerciseId: "chest-6", order: 6 }],
    estimatedTime: "45-60 ph",
  },
  {
    id: "pull", name: "Pull Day (Kéo)", nameEn: "Pull Day",
    description: "Tập lưng và tay trước", difficulty: "intermediate", goal: ["hypertrophy", "strength"],
    muscleGroups: ["back", "biceps"],
    exercises: [{ exerciseId: "back-1", order: 1 }, { exerciseId: "back-2", order: 2 }, { exerciseId: "back-3", order: 3 }, { exerciseId: "back-4", order: 4 }, { exerciseId: "bic-1", order: 5 }, { exerciseId: "bic-2", order: 6 }],
    estimatedTime: "45-60 ph",
  },
  {
    id: "legs", name: "Leg Day (Chân)", nameEn: "Leg Day",
    description: "Tập chân và mông", difficulty: "intermediate", goal: ["hypertrophy", "strength"],
    muscleGroups: ["legs", "glutes"],
    exercises: [{ exerciseId: "leg-1", order: 1 }, { exerciseId: "leg-2", order: 2 }, { exerciseId: "leg-3", order: 3 }, { exerciseId: "leg-4", order: 4 }, { exerciseId: "glu-1", order: 5 }, { exerciseId: "leg-7", order: 6 }],
    estimatedTime: "50-65 ph",
  },
  {
    id: "chest-focused", name: "Ngực chuyên sâu", nameEn: "Chest Focused",
    description: "Tập trung ngực trên, giữa và dưới", difficulty: "intermediate", goal: ["hypertrophy"],
    muscleGroups: ["chest", "shoulders", "triceps"],
    exercises: [{ exerciseId: "chest-2", order: 1 }, { exerciseId: "chest-1", order: 2 }, { exerciseId: "chest-7", order: 3 }, { exerciseId: "chest-3", order: 4 }, { exerciseId: "sho-1", order: 5 }, { exerciseId: "tri-2", order: 6 }],
    estimatedTime: "45-55 ph",
  },
  {
    id: "back-focused", name: "Lưng chuyên sâu", nameEn: "Back Focused",
    description: "Tập lưng dày và rộng", difficulty: "intermediate", goal: ["hypertrophy"],
    muscleGroups: ["back", "biceps"],
    exercises: [{ exerciseId: "back-1", order: 1 }, { exerciseId: "back-2", order: 2 }, { exerciseId: "back-5", order: 3 }, { exerciseId: "back-3", order: 4 }, { exerciseId: "back-4", order: 5 }, { exerciseId: "bic-3", order: 6 }],
    estimatedTime: "45-55 ph",
  },
  {
    id: "full-body", name: "Toàn thân", nameEn: "Full Body",
    description: "Bài tập toàn thân cho người mới", difficulty: "beginner", goal: ["hypertrophy", "endurance"],
    muscleGroups: ["full_body"],
    exercises: [{ exerciseId: "leg-1", order: 1 }, { exerciseId: "chest-1", order: 2 }, { exerciseId: "back-2", order: 3 }, { exerciseId: "sho-1", order: 4 }, { exerciseId: "bic-1", order: 5 }, { exerciseId: "core-1", order: 6 }],
    estimatedTime: "40-50 ph",
  },
  {
    id: "upper-body", name: "Upper Body", nameEn: "Upper Body",
    description: "Tập toàn bộ thân trên", difficulty: "beginner", goal: ["hypertrophy"],
    muscleGroups: ["chest", "back", "shoulders", "biceps", "triceps"],
    exercises: [{ exerciseId: "chest-4", order: 1 }, { exerciseId: "back-5", order: 2 }, { exerciseId: "sho-2", order: 3 }, { exerciseId: "bic-2", order: 4 }, { exerciseId: "tri-3", order: 5 }, { exerciseId: "core-2", order: 6 }],
    estimatedTime: "40-50 ph",
  },
  {
    id: "lower-body", name: "Lower Body", nameEn: "Lower Body",
    description: "Tập trung chân, mông và bụng", difficulty: "beginner", goal: ["hypertrophy", "strength"],
    muscleGroups: ["legs", "glutes", "core"],
    exercises: [{ exerciseId: "leg-1", order: 1 }, { exerciseId: "leg-3", order: 2 }, { exerciseId: "glu-1", order: 3 }, { exerciseId: "leg-6", order: 4 }, { exerciseId: "glu-2", order: 5 }, { exerciseId: "core-1", order: 6 }],
    estimatedTime: "40-55 ph",
  },
  {
    id: "hiit-cardio", name: "HIIT Cardio", nameEn: "HIIT Cardio",
    description: "Đốt mỡ cường độ cao", difficulty: "intermediate", goal: ["endurance"],
    muscleGroups: ["cardio", "core", "legs"],
    exercises: [{ exerciseId: "card-3", order: 1 }, { exerciseId: "card-2", order: 2 }, { exerciseId: "leg-6", order: 3 }, { exerciseId: "core-4", order: 4 }, { exerciseId: "chest-6", order: 5 }, { exerciseId: "card-1", order: 6 }],
    estimatedTime: "20-30 ph",
  },
]

export function getExercisesByMuscle(group: MuscleGroup): Exercise[] {
  return EXERCISES.filter((e) => e.muscleGroup === group)
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}

export function getDefaultSets(goal: GoalType | undefined): number {
  if (goal === "strength") return 5
  if (goal === "hypertrophy") return 4
  return 3
}

export function getDefaultReps(goal: GoalType | undefined): string {
  if (goal === "strength") return "3-5"
  if (goal === "hypertrophy") return "8-12"
  return "15-20"
}
