import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    // Prevent the form/button from refreshing the page on click
    if (e) e.preventDefault(); 
    
    try {
      // Send standard JSON, exactly as your schemas.UserLogin expects
      const response = await api.post("/login", {
        username: username,
        password: password
      })

      // Your backend returns {"success": True/False}
      if (response.data.success) {
        localStorage.setItem("token", response.data.access_token)
        navigate("/dashboard")
        window.location.reload() 
      } else {
        // If success is false, your backend sends a "message"
        alert(response.data.message)
      }

    } catch (error) {
      console.log("Login Error:", error)
      // Fix for the [object Object] issue:
      if (error.response && error.response.status === 422) {
        alert("Validation Error: Please make sure both fields are filled out.")
      } else {
        alert("Server Error. Make sure your backend is running!")
      }
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="bg-zinc-900 p-10 rounded-2xl w-[400px]">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold transition-colors"
          >
            Login
          </button>
          <p className="text-center text-zinc-400">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login