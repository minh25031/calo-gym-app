"use client"

import { useState, useEffect } from "react"
import { addWorkoutTemplate, logWorkout, createPost, deleteWorkoutTemplate, deleteWorkoutLog } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import {
  EXERCISES, PREBUILT_TEMPLATES, muscleGroups, muscleColors, getExerciseById,
  type Exercise, type MuscleGroup, type WorkoutPlan, type GoalType,
  getDefaultSets, getDefaultReps,
} from "@/lib/exercises"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkoutPage() {
  const [tab, setTab] = useState<"templates" | "logs">("templates")
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormMode, setNewFormMode] = useState<"prebuilt" | "custom">("prebuilt")
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutPlan | null>(null)
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all")
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [tempName, setTempName] = useState("")
  const [zoomImg, setZoomImg] = useState<{ name: string; src: string } | null>(null)

  const { data, mutate } = useSWR("/api/workout", fetcher)

  // Load user's goal for auto sets/reps
  const [userGoal, setUserGoal] = useState<GoalType | undefined>()
  useEffect(() => {
    fetch("/api/bmi").then((r) => r.json()).then((d) => {
      if (d?.goal === "lose") setUserGoal("hypertrophy")
      else if (d?.goal === "gain") setUserGoal("strength")
      else setUserGoal("hypertrophy")
    })
  }, [])

  const filteredExercises = selectedMuscle === "all"
    ? EXERCISES
    : EXERCISES.filter((e) => e.muscleGroup === selectedMuscle)

  const usePrebuilt = (plan: WorkoutPlan) => {
    setSelectedTemplate(plan)
    const exs = plan.exercises.map((e) => getExerciseById(e.exerciseId)).filter(Boolean) as Exercise[]
    setSelectedExercises(exs)
    setTempName(plan.name)
    setNewFormMode("prebuilt")
    setShowNewForm(true)
  }

  const startCustom = () => {
    setSelectedTemplate(null)
    setSelectedExercises([])
    setTempName("")
    setNewFormMode("custom")
    setShowNewForm(true)
  }

  const toggleExercise = (ex: Exercise) => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === ex.id) ? prev.filter((e) => e.id !== ex.id) : [...prev, ex]
    )
  }

  const handleSaveTemplate = async () => {
    if (!tempName || selectedExercises.length === 0) return
    const form = new FormData()
    form.set("name", tempName)
    form.set("exercises", JSON.stringify(
      selectedExercises.map((e) => {
        const s = e.suggestedSets[userGoal || "hypertrophy"]
        return { name: e.name, sets: s.sets, reps: parseInt(s.reps.split("-")[0]) || 10, weight: undefined }
      })
    ))
    await addWorkoutTemplate(form)
    setShowNewForm(false)
    setSelectedExercises([])
    mutate()
  }

  const handleLogFromTemplate = async (plan: WorkoutPlan) => {
    const form = new FormData()
    form.set("templateId", "")
    form.set("note", `Tập theo: ${plan.name}`)
    form.set("exercises", JSON.stringify(
      plan.exercises.map((e) => {
        const ex = getExerciseById(e.exerciseId)
        if (!ex) return null
        const s = ex.suggestedSets[userGoal || "hypertrophy"]
        return { name: ex.name, sets: s.sets, reps: parseInt(s.reps.split("-")[0]) || 10, weight: undefined }
      }).filter(Boolean)
    ))
    const result = await logWorkout(form)
    if (result.success) {
      const postForm = new FormData()
      postForm.set("type", "workout")
      postForm.set("content", `💪 ${plan.name}`)
      await createPost(postForm)
      mutate()
    }
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tập luyện</h2>
        <button
          onClick={() => {
            setShowNewForm(!showNewForm)
            if (!showNewForm) {
              setNewFormMode("prebuilt")
              setSelectedTemplate(null)
            }
          }}
          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground"
        >
          {showNewForm ? "Đóng" : "+ Tạo lịch"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("templates")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab === "templates" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          Bài tập mẫu
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab === "logs" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          Lịch sử tập
        </button>
      </div>

      {/* New Form */}
      {showNewForm && (
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setNewFormMode("prebuilt")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${newFormMode === "prebuilt" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              📋 Có sẵn
            </button>
            <button
              onClick={() => startCustom()}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${newFormMode === "custom" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              ✏️ Tự tạo
            </button>
          </div>

          {newFormMode === "prebuilt" && (
            <div className="grid grid-cols-2 gap-2">
              {PREBUILT_TEMPLATES.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => selectedTemplate?.id === plan.id ? null : usePrebuilt(plan)}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                    selectedTemplate?.id === plan.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-muted-foreground">{plan.estimatedTime}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {plan.muscleGroups.map((m) => muscleGroups.find((mg) => mg.value === m)?.emoji).join(" ")}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Exercise picker */}
          <div>
            <div className="flex gap-1 flex-wrap mb-2">
              <button
                onClick={() => setSelectedMuscle("all")}
                className={`px-2 py-1 rounded text-xs ${selectedMuscle === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                Tất cả
              </button>
              {muscleGroups.map((mg) => (
                <button
                  key={mg.value}
                  onClick={() => setSelectedMuscle(mg.value)}
                  className={`px-2 py-1 rounded text-xs ${selectedMuscle === mg.value ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  {mg.emoji} {mg.label}
                </button>
              ))}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredExercises.map((ex) => {
                const selected = selectedExercises.some((e) => e.id === ex.id)
                const s = ex.suggestedSets[userGoal || "hypertrophy"]
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggleExercise(ex)}
                    className={`w-full text-left flex items-center gap-3 p-2 rounded-lg border text-sm transition-colors ${
                      selected ? "border-primary bg-primary/5" : "hover:bg-muted"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? "bg-primary border-primary text-white" : "border-muted-foreground"
                    }`}>
                      {selected && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.sets} sets x {s.reps} reps
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all"
                      style={{ backgroundColor: muscleColors[ex.muscleGroup] }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (ex.imageUrl) setZoomImg({ name: ex.name, src: ex.imageUrl })
                      }}
                      title="Bấm để phóng to ảnh"
                    >
                      <img
                        src={ex.imageUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ""
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-white text-lg">
                        {muscleGroups.find(m => m.value === ex.muscleGroup)?.emoji || "💪"}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Tên lịch tập..."
              className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
            />
            <button
              onClick={handleSaveTemplate}
              disabled={!tempName || selectedExercises.length === 0}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              Lưu template
            </button>
          </div>

          <button
            onClick={async () => {
              if (selectedExercises.length === 0) return
              const form = new FormData()
              form.set("note", tempName)
              form.set("exercises", JSON.stringify(
                selectedExercises.map((e) => {
                  const s = e.suggestedSets[userGoal || "hypertrophy"]
                  return { name: e.name, sets: s.sets, reps: parseInt(s.reps.split("-")[0]) || 10, weight: undefined }
                })
              ))
              const result = await logWorkout(form)
              if (result.success) {
                const pForm = new FormData()
                pForm.set("type", "workout")
                pForm.set("content", `💪 ${tempName || "Tập luyện"}`)
                await createPost(pForm)
                setShowNewForm(false)
                mutate()
              }
            }}
            disabled={selectedExercises.length === 0}
            className="w-full py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
          >
            🔥 Tập ngay ({selectedExercises.length} bài)
          </button>
        </div>
      )}

      {/* Template list */}
      {tab === "templates" && !showNewForm && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Template của tôi</h3>
          {data?.templates?.map((t: any) => (
            <div key={t.id} className="rounded-xl border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.exercises.length} bài tập</div>
                </div>
                <button
                  onClick={async () => {
                    const form = new FormData()
                    form.set("templateId", t.id)
                    form.set("note", "")
                    form.set("exercises", JSON.stringify(
                      t.exercises.map((e: any) => ({ name: e.name, sets: e.sets, reps: e.reps, weight: e.weight }))
                    ))
                    await logWorkout(form)
                    const pForm = new FormData()
                    pForm.set("type", "workout")
                    pForm.set("content", `💪 ${t.name}`)
                    await createPost(pForm)
                    mutate()
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Tập →
                </button>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div>
                {t.exercises?.slice(0, 4).map((e: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground mt-1">
                  - {e.name}: {e.sets}x{e.reps}{e.weight ? ` (${e.weight}kg)` : ""}
                </div>
              ))}
                </div>
                <button
                  onClick={async () => { await deleteWorkoutTemplate(t.id); mutate() }}
                  className="text-xs text-[var(--text-dim)] hover:text-[var(--destructive)] transition-colors w-5 h-5 flex items-center justify-center shrink-0"
                  title="Xoá template"
                >✕</button>
              </div>
            </div>
          ))}

          <h3 className="font-medium text-sm text-muted-foreground mt-4">Lịch mẫu gợi ý</h3>
          <div className="grid grid-cols-2 gap-2">
            {PREBUILT_TEMPLATES.map((plan) => (
              <div key={plan.id} className="rounded-xl border p-3">
                <div className="font-medium text-xs">{plan.name}</div>
                <div className="text-xs text-muted-foreground">{plan.estimatedTime}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {plan.exercises.length} bài
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => usePrebuilt(plan)}
                    className="flex-1 py-1 rounded text-xs bg-primary text-primary-foreground"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleLogFromTemplate(plan)}
                    className="flex-1 py-1 rounded text-xs border"
                  >
                    Tập
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {tab === "logs" && (
        <div className="space-y-2">
          {data?.logs?.map((log: any) => (
            <div key={log.id} className="rounded-xl border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{log.template?.name || "Tập tự do"}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{log.exercises?.length || 0} bài</div>
                  <button
                    onClick={async () => { await deleteWorkoutLog(log.id); mutate() }}
                    className="text-xs text-[var(--text-dim)] hover:text-[var(--destructive)] transition-colors w-4 h-4 flex items-center justify-center"
                    title="Xoá log"
                  >✕</button>
                </div>
              </div>
              {log.note && <div className="text-xs mt-1">{log.note}</div>}
              {log.exercises?.map((e: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground mt-1">
                  - {e.name}: {e.sets}x{e.reps}{e.weight ? ` (${e.weight}kg)` : ""}
                </div>
              ))}
            </div>
          ))}
          {(!data?.logs || data.logs.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có buổi tập nào</p>
          )}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImg(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomImg(null)}
              className="absolute -top-10 right-0 text-white text-sm bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1 z-10"
            >
              ✕ Đóng
            </button>
            <img
              src={zoomImg.src}
              alt={zoomImg.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center text-white text-sm mt-3 font-medium">{zoomImg.name}</div>
          </div>
        </div>
      )}
    </div>
  )
}
