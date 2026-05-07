import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"

function TaskDetails() {

  const { id } = useParams()

  const navigate = useNavigate()

  const [task, setTask] = useState(null)

  const [deadlineDate, setDeadlineDate] = useState("")
  const [deadlineTime, setDeadlineTime] = useState("")

  useEffect(() => {

    fetchTask()

    loadSavedDeadline()

  }, [])

  const fetchTask = async () => {

    try {

      const response = await api.get("/tasks")

      const foundTask = response.data.find(
        (t) => t.id === parseInt(id)
      )

      setTask(foundTask)

    } catch (error) {

      console.log(error)
    }
  }

  const loadSavedDeadline = () => {

    const savedDeadline = localStorage.getItem(
      `deadline-${id}`
    )

    if (savedDeadline) {

      const [date, time] = savedDeadline.split("T")

      setDeadlineDate(date)

      setDeadlineTime(time)
    }
  }

  const saveDeadline = () => {

    if (!deadlineDate || !deadlineTime) {

      alert("Please select both date and time")

      return
    }

    const deadline = `${deadlineDate}T${deadlineTime}`

    localStorage.setItem(
      `deadline-${id}`,
      deadline
    )

    alert("Deadline Saved Successfully")
  }

  const isExpired = () => {

    const savedDeadline = localStorage.getItem(
      `deadline-${id}`
    )

    if (!savedDeadline) return false

    return new Date(savedDeadline) < new Date()
  }

  if (!task) {

    return (

      <div className="h-screen bg-zinc-950 text-white flex items-center justify-center">

        Loading...

      </div>
    )
  }

  return (

    <div className="min-h-screen bg-zinc-950 text-white p-10">

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
      >
        Back To Dashboard
      </button>

      <div className="bg-zinc-900 p-10 rounded-2xl max-w-4xl mx-auto border border-zinc-800">

        <h1
          className={`text-5xl font-bold mb-10 ${
            isExpired()
              ? "text-red-500"
              : task.priority === "High"
              ? "text-red-500"
              : task.priority === "Medium"
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {task.title}
        </h1>

        <div className="grid grid-cols-2 gap-8">

          <div>

            <p className="text-zinc-400 mb-3">
              Status
            </p>

            <div className="bg-zinc-800 p-4 rounded-xl text-lg">
              {task.status}
            </div>

          </div>

          <div>

            <p className="text-zinc-400 mb-3">
              Priority
            </p>

            <div className="bg-zinc-800 p-4 rounded-xl text-lg">
              {task.priority}
            </div>

          </div>

          <div>

            <p className="text-zinc-400 mb-3">
              Select Deadline Date
            </p>

            <input
              type="date"
              value={deadlineDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setDeadlineDate(e.target.value)
              }
              className="w-full bg-zinc-800 text-white p-4 rounded-xl outline-none color-scheme-dark"
            />

          </div>

          <div>

            <p className="text-zinc-400 mb-3">
              Select Deadline Time
            </p>

            <input
              type="time"
              value={deadlineTime}
              onChange={(e) =>
                setDeadlineTime(e.target.value)
              }
              className="w-full bg-zinc-800 text-white p-4 rounded-xl outline-none color-scheme-dark"
            />

          </div>

        </div>

        <button
          onClick={saveDeadline}
          className="mt-10 bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-lg"
        >
          Save Deadline
        </button>

        <div className="mt-10">

          <p className="text-zinc-400 mb-3">
            Deadline Status
          </p>

          <div
            className={`p-4 rounded-xl text-lg font-semibold ${
              isExpired()
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {
              isExpired()
                ? "Deadline Missed"
                : "Task Within Deadline"
            }
          </div>

        </div>

      </div>

    </div>
  )
}

export default TaskDetails