import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { LayoutDashboard, Users, CheckSquare, Settings as SettingsIcon, User, Bell, Shield, X } from "lucide-react"

function Settings() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("User")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  // Password Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        while (base64.length % 4) { base64 += '=' }
        const payload = JSON.parse(window.atob(base64))
        setUsername(payload.sub)
      } catch (error) {
        console.error("Could not decode token:", error)
      }
    }
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!")
      return
    }

    if (newPassword.length < 4) {
      alert("New password must be at least 4 characters long.")
      return
    }

    try {
      await api.put("/users/password", {
        current_password: currentPassword,
        new_password: newPassword
      }, getAuthHeader())

      alert("Password changed successfully! You can now use your new password next time you log in.")
      
      // Close modal and clear inputs
      setIsModalOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

    } catch (error) {
      console.error("Password change error:", error)
      if (error.response && error.response.data) {
        alert(error.response.data.detail || "Failed to change password.")
      } else {
        alert("Failed to change password. Make sure your current password is correct.")
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white relative">
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
            <div onClick={() => navigate("/teams")} className="flex items-center gap-4 hover:bg-zinc-800 p-4 rounded-2xl cursor-pointer transition-colors">
              <Users size={24} />
              <span className="text-lg">Teams</span>
            </div>
            <div className="flex items-center gap-4 bg-blue-600 p-4 rounded-2xl cursor-pointer">
              <SettingsIcon size={24} />
              <span className="text-lg">Settings</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl text-lg font-semibold transition-colors cursor-pointer">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-6xl font-bold mb-3">Settings</h1>
        <p className="text-zinc-400 text-xl mb-10">Manage your account and preferences</p>

        <div className="max-w-4xl space-y-8">
          {/* Profile Section */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <User size={28} className="text-blue-500" />
              <h2 className="text-3xl font-bold">Profile</h2>
            </div>
            <div className="flex items-center gap-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {username[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{username}</h3>
                <p className="text-zinc-500 text-lg">Active Team Member</p>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Bell size={28} className="text-blue-500" />
              <h2 className="text-3xl font-bold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                <div>
                  <h3 className="text-xl font-bold">Email Notifications</h3>
                  <p className="text-zinc-500">Receive daily summaries of pending tasks.</p>
                </div>
                <button onClick={() => setEmailNotifs(!emailNotifs)} className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${emailNotifs ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Account Security Section */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Shield size={28} className="text-red-500" />
              <h2 className="text-3xl font-bold">Account Security</h2>
            </div>
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Password Management</h3>
                <p className="text-zinc-500">Ensure your account is using a long, random password.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGING PASSWORD MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold mb-6">Change Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl outline-none focus:border-blue-500 text-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-zinc-400 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl outline-none focus:border-blue-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl outline-none focus:border-blue-500 text-lg"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-lg font-semibold mt-4 transition-colors"
              >
                Update Password
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default Settings