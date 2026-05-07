import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"
import { LayoutDashboard, Users, CheckSquare, Settings } from "lucide-react"

function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState("")

  // Securely get the token and force JSON content type
  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return { 
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      } 
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks", getAuthHeader())
      
      // Merge backend task status with the local deadline memory
      const updatedTasks = response.data.map((task) => {
        if (task.status === "Completed") return task;

        const savedDeadline = localStorage.getItem(`deadline-${task.id}`)
        
        // If it exists and the time has passed, override the status to red
        if (savedDeadline && new Date(savedDeadline) < new Date()) {
          return { ...task, status: "Deadline Missed" }
        }

        return task;
      });

      setTasks(updatedTasks)

    } catch (error) {
      console.log("Fetch tasks error:", error)
    }
  }

  const createTask = async () => {
    if (!title) return

    try {
      // Simplified payload: The backend automatically handles 'assigned_to' now!
      await api.post("/tasks", {
        title: title,
        status: "Pending",
        priority: "Medium"
      }, getAuthHeader())

      setTitle("")
      fetchTasks() // Refresh the list
    } catch (error) {
      console.log("Create task error:", error)
      alert("Failed to create task.")
    }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`, getAuthHeader())
      // Clean up the leftover deadline memory
      localStorage.removeItem(`deadline-${id}`)
      fetchTasks()
    } catch (error) {
      console.log(error)
    }
  }

  const completeTask = async (id) => {
    try {
      await api.put(`/tasks/${id}`, null, getAuthHeader())
      fetchTasks()
    } catch (error) {
      console.log(error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-500 mb-12">TeamFlow</h1>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-blue-600 p-4 rounded-2xl cursor-pointer">
              <LayoutDashboard size={24} />
              <span className="text-lg">Dashboard</span>
            </div>
            <div 
              onClick={() => navigate("/tasks")}
              className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors"
            >
              <CheckSquare size={24} />
              <span className="text-lg">Tasks</span>
            </div>
            <div
              onClick={() => navigate("/teams")}
              className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors"
            >
              <Users size={24} />
              <span className="text-lg">Teams</span>
            </div>
            <div
              onClick={() => navigate("/settings")}
              className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors"
            >
              <Settings size={24} />
              <span className="text-lg">Settings</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl text-lg font-semibold transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-6xl font-bold mb-3">Dashboard</h1>
            <p className="text-zinc-400 text-xl">Manage your team tasks efficiently</p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 px-6 py-4 rounded-2xl outline-none text-lg"
            />
            <button
              onClick={createTask}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-colors"
            >
              + Create Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {/* Added cursor-pointer and hover background to stats cards */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl cursor-pointer hover:bg-zinc-800 transition-colors">
            <p className="text-zinc-400 text-xl mb-4">Total Tasks</p>
            <h2 className="text-6xl font-bold">{tasks.length}</h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl cursor-pointer hover:bg-zinc-800 transition-colors">
            <p className="text-zinc-400 text-xl mb-4">Completed</p>
            <h2 className="text-6xl font-bold text-green-500">
              {tasks.filter((task) => task.status === "Completed").length}
            </h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl cursor-pointer hover:bg-zinc-800 transition-colors">
            <p className="text-zinc-400 text-xl mb-4">Pending</p>
            <h2 className="text-6xl font-bold text-yellow-400">
              {tasks.filter((task) => task.status !== "Completed").length}
            </h2>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
          <h2 className="text-4xl font-bold mb-8">Recent Tasks</h2>
          <div className="space-y-5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-zinc-800 p-6 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <h3
                    onClick={() => navigate(`/task/${task.id}`)}
                    className={`text-3xl font-bold cursor-pointer hover:underline
                      ${
                        task.priority === "High"
                          ? "text-red-500"
                          : task.priority === "Medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }
                    `}
                  >
                    {task.title}
                  </h3>
                  <p className="text-zinc-400 mt-2 text-lg">Task ID: {task.id}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-5 py-3 rounded-xl text-lg font-semibold
                      ${
                        task.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : task.status === "Deadline Missed"
                          ? "bg-red-500/20 text-red-500"
                          : "bg-yellow-500/20 text-yellow-400"
                       }
                    `}
                  >
                    {task.status}
                  </div>
                  
                  {/* Hide Complete button if task is already completed */}
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-lg transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl text-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard