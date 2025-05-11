"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Todo } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { convertRelativeDate } from "@/lib/date-utils"
import { IOSpinner } from "./spinner"
import { ArrowRight } from "lucide-react"
import { useSession } from "@/lib/auth-client"

type InputStep = "text" | "date" | "urgency"

export default function TodoInput({ onAddTodo }: { onAddTodo: (todo: Todo) => void }) {
  const [step, setStep] = useState<InputStep>("text")
  const [text, setText] = useState("")
  const [date, setDate] = useState("")
  const [isDateLoading, setIsDateLoading] = useState(false)
  const [urgency, setUrgency] = useState(3)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const { data: session } = useSession()

  const textInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const urgencyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === "text") textInputRef.current?.focus()
    if (step === "date") dateInputRef.current?.focus()
    if (step === "urgency") urgencyInputRef.current?.focus()
  }, [step])

  // Add keyboard event listener for urgency control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === "urgency") {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          incrementUrgency(-0.5)
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          incrementUrgency(0.5)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown as any)
    return () => window.removeEventListener("keydown", handleKeyDown as any)
  }, [step])

  const handleTextSubmit = () => {
    if (text.trim()) {
      setStep("date")
    }
  }

  const handleDateSubmit = async () => {
    if (date.trim()) {
      setIsDateLoading(true)
      try {
        const result = await convertRelativeDate(date.trim())
        setDate(result.formattedDateTime)
        setStep("urgency")
      } catch (error) {
        console.error("Failed to convert date:", error)
      } finally {
        setIsDateLoading(false)
      }
    }
  }

  const handleTextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && text.trim()) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  const handleDateKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && date.trim()) {
      e.preventDefault()
      await handleDateSubmit()
    }
  }

  const handleUrgencyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      submitTodo()
    }
  }

  const incrementUrgency = (amount: number) => {
    setUrgency((prev) => {
      const newValue = +(prev + amount).toFixed(1)
      return Math.min(Math.max(1, newValue), 5)
    })
  }

  const submitTodo = () => {
    if (text.trim()) {
      onAddTodo({
        id: uuidv4(),
        title: text,
        dueDate: date || undefined,
        urgency: Number(urgency.toFixed(1)),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '', // This will be set by the API
        comments: [],
      })

      // Reset form
      setText("")
      setDate("")
      setUrgency(3)
      setStep("text")
    }
  }

  return (
    <div className="mb-8">
      <div className="backdrop-blur-sm bg-white/95 dark:bg-[#131316]/95 rounded-[14px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_40px_rgba(0,0,0,0.35)] border border-black/[0.04] dark:border-white/[0.06] backdrop-filter overflow-hidden transition-colors duration-200 relative
      before:absolute before:inset-0 before:rounded-[14px] before:border before:border-white/[0.12] dark:before:border-white/[0.04] before:z-[-1] 
      after:absolute after:inset-0 after:rounded-[14px] after:bg-[url('/noise-light.png')] after:opacity-[0.03] after:z-[-1] dark:after:opacity-[0.07]" id="todo-input-container">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="what's on your agenda?"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px] transition-colors duration-200"
              disabled={step !== "text"}
            />
            {step === "text" && text.trim() && (
              <button
                onClick={handleTextSubmit}
                className="md:hidden p-1 rounded-full hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-white/50" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {step !== "text" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 pt-2 border-t border-gray-200/70 dark:border-white/10"
              >
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">When:</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={dateInputRef}
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onKeyDown={handleDateKeyDown}
                      placeholder="tomorrow, next week, etc."
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px] transition-colors duration-200"
                      disabled={step !== "date" || isDateLoading}
                    />
                    {step === "date" && date.trim() && !isDateLoading && (
                      <button
                        onClick={handleDateSubmit}
                        className="md:hidden p-1 rounded-full hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400 dark:text-white/50" />
                      </button>
                    )}
                    {isDateLoading && <IOSpinner />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step === "urgency" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 pt-2 border-t border-gray-200/70 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Urgency:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => incrementUrgency(-0.5)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/90 dark:hover:bg-white/10 transition-colors border border-black/[0.03] dark:border-white/[0.06]"
                    >
                      <span className="text-gray-600 dark:text-gray-300">-</span>
                    </button>
                    <input
                      ref={urgencyInputRef}
                      type="text"
                      value={urgency.toFixed(1)}
                      readOnly
                      onKeyDown={handleUrgencyKeyDown}
                      className="w-12 text-center text-gray-900 dark:text-white text-[15px] bg-transparent border-none outline-none"
                    />
                    <button
                      onClick={() => incrementUrgency(0.5)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/90 dark:hover:bg-white/10 transition-colors border border-black/[0.03] dark:border-white/[0.06]"
                    >
                      <span className="text-gray-600 dark:text-gray-300">+</span>
                    </button>
                    <button
                      onClick={submitTodo}
                      className="ml-2 px-4 h-8 bg-gradient-to-b from-[#7c5aff] to-[#6c47ff] rounded-[8px] shadow-[0_0_10px_rgba(124,90,255,0.3),inset_0px_1px_0px_0px_rgba(255,255,255,0.16),0px_1px_2px_0px_rgba(0,0,0,0.20)] text-white text-[13px] font-medium hover:from-[#8f71ff] hover:to-[#7c5aff] active:from-[#6c47ff] active:to-[#5835ff] transition-all duration-200 border border-[#7c5aff]/30"
                    >
                      Add Todo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
