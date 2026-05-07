import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { LayoutDashboard, Users, CheckSquare, Settings } from "lucide-react"

function Teams() {
  const navigate = useNavigate()
  const [teamMembers, setTeamMembers] = useState([])
  const [tasks, setTasks] = useState([])

  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("Fetching team data...")
      const userRes = await api.get("/users", getAuthHeader())
      const taskRes = await api.get("/tasks", getAuthHeader())
      
      console.log("Users found:", userRes.data)
      setTeamMembers(userRes.data)
      setTasks(taskRes.data)
    } catch (error) {
      console.error("Error fetching team data:", error)
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-500 mb-12">TeamFlow</h1>
          <div className="space-y-4">
            <div onClick={() => navigate("/dashboard")} className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors">
              <LayoutDashboard size={24} />
              <span className="text-lg">Dashboard</span>
            </div>
            <div onClick={() => navigate("/tasks")} className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors">
              <CheckSquare size={24} />
              <span className="text-lg">Tasks</span>
            </div>
            <div className="flex items-center gap-4 bg-blue-600 p-4 rounded-2xl cursor-pointer">
              <Users size={24} />
              <span className="text-lg">Teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-6xl font-bold mb-3">Team Members</h1>
        <p className="text-zinc-400 text-xl mb-10">Manage your collaborators</p>

        <div className="grid grid-cols-1 gap-6">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div key={member.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex justify-between items-center hover:bg-zinc-800 transition-all cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{member.username}</h2>
                    <p className="text-zinc-500 text-lg">Team Member</p>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="text-center">
                    <p className="text-zinc-400 mb-1 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {tasks.filter(t => t.assigned_to === member.username && t.status !== "Completed").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-400 mb-1 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-500">
                      {tasks.filter(t => t.assigned_to === member.username && t.status === "Completed").length}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-xl">Loading team members...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Teams