import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Tasks() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("General")
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState("Medium")

  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } }
  }

  const fetchData = async () => {
    try {
      const taskRes = await api.get("/tasks", getAuthHeader())
      setTasks(taskRes.data)
      
      const userRes = await api.get("/users", getAuthHeader())
      setTeamMembers(userRes.data)
      
      // Auto-select the first user in the dropdown if not already selected
      if (userRes.data.length > 0 && !assignee) {
        setAssignee(userRes.data[0].username)
      }
    } catch (error) {
      console.log("Fetch Error:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createTask = async () => {
    if (!title) {
      alert("Please enter a task title");
      return;
    }

    try {
      await api.post("/tasks", {
        title: title,
        status: "Pending",
        priority: priority,
        project: project,
        assigned_to: assignee
      }, getAuthHeader());

      setTitle("");
      setProject("General");
      fetchData(); // Refresh everything

    } catch (error) {
      console.error("Create Task Error:", error);
      alert("Failed to create task.");
    }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`, getAuthHeader())
      fetchData()
    } catch (error) {
      // Alert the user if the backend blocks them from deleting!
      if (error.response && error.response.status === 403) {
        alert("Permission Denied: Only Admins are allowed to delete tasks.")
      } else {
        console.log("Delete Error:", error)
      }
    }
  }

  const completeTask = async (id) => {
    try {
      await api.put(`/tasks/${id}`, null, getAuthHeader())
      fetchData()
    } catch (error) {
      console.log("Complete Error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-bold">
          Projects & Tasks 📋
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl cursor-pointer transition-colors"
        >
          Back To Dashboard
        </button>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl flex flex-wrap gap-4 mb-10 border border-zinc-800">
        <input
          type="text"
          placeholder="Task Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[200px] bg-zinc-800 p-3 rounded-xl outline-none text-lg"
        />
        
        <input
          type="text"
          placeholder="Project (e.g. Website)"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="w-48 bg-zinc-800 p-3 rounded-xl outline-none text-lg"
        />

        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl outline-none text-lg cursor-pointer"
        >
          {teamMembers.map((member) => (
            <option key={member.id} value={member.username}>
              Assign: {member.username}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl outline-none text-lg cursor-pointer"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button
          onClick={createTask}
          className="bg-green-600 hover:bg-green-700 px-8 rounded-xl font-semibold text-lg transition-colors cursor-pointer"
        >
          Create Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-zinc-900 p-5 rounded-2xl flex justify-between items-center border border-zinc-800"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                {task.title}
              </h2>
              <p className="text-zinc-400 font-medium">
                Project: <span className="text-white">{task.project}</span> | 
                Assigned to: <span className="text-blue-400 ml-1">{task.assigned_to}</span> | 
                Status: <span className="text-zinc-300 ml-1">{task.status}</span>
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <div
                className={`px-5 py-2 rounded-xl font-semibold text-zinc-950
                  ${
                    task.priority === "High"
                      ? "bg-red-500"
                      : task.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                `}
              >
                {task.priority}
              </div>

              {task.status !== "Completed" && (
                <button
                  onClick={() => completeTask(task.id)}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Complete
                </button>
              )}

              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks