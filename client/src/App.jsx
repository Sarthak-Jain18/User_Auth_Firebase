import './App.css'
import { Route, Routes } from "react-router-dom";
import Home from './components/Home.jsx'
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import PrivateRoute from "./PrivateRoute.jsx";

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

