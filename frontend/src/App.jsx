import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import TaskDetails from "./pages/TaskDetails"
import Teams from "./pages/Teams"
import Settings from "./pages/Settings"
import Tasks from "./pages/Tasks" // <-- FIXED: Added this import

function App() {

  const token = localStorage.getItem("token")

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            token
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />

        {/* FIXED: Added the route for the Tasks page */}
        <Route
          path="/tasks"
          element={
            token
              ? <Tasks />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/task/:id"
          element={
            token
              ? <TaskDetails />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/teams"
          element={
            token
              ? <Teams />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/settings"
          element={
            token
              ? <Settings />
              : <Navigate to="/" />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App