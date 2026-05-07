import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

function Register() {
  const navigate = useNavigate()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    try {
      // Send exactly what schemas.UserCreate expects
      const response = await api.post("/register", {
        username: username,
        password: password,
      })

      if (response.data.success) {
         alert(response.data.message) // "User Registered Successfully"
         navigate("/") // Send them to the login screen
      } else {
         alert(response.data.message) // "Username already exists"
      }

    } catch (error) {
      console.log("Registration Error:", error)
      if (error.response && error.response.status === 422) {
        alert("Validation Error: Please make sure both fields are filled correctly.")
      } else {
        alert("Server Error. Make sure your backend is running!")
      }
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="bg-zinc-900 p-10 rounded-2xl w-[400px]">
        <h1 className="text-3xl font-bold mb-6">Register</h1>
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
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-semibold transition-colors"
          >
            Register
          </button>
          <p className="text-center text-zinc-400">
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register