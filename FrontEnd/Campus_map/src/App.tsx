import SearchPage from "./components/Search";
import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Profile from "./components/Profile.tsx";
import Favorite from "./components/Favorite";
import axios from "axios";
   
axios.defaults.withCredentials = true;

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get("/api/auth/profile");
        if (res.data && res.data.id) {
          setIsLogin(true);
        } else {
          setIsLogin(false);
        }
      } catch (err) {
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>; 
  }

  return (
    <div className="h-full min-h-screen bg-slate-50 flex-col">

      <main className=" ">
        <NavBar isLogin={isLogin} />
        <Routes>
          <Route
            path="/login"
            element={<Login setLogin={() => setIsLogin(true)} />}
          />
          <Route
            path="/register"
            element={<Register setLogin={() => setIsLogin(true)} />}
          />
          <Route
            path="/profile"
            element={isLogin ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/" element={<Navigate to="/search" />} />
          {isLogin && <Route path="/favorites" element={<Favorite />} />}
        </Routes>
      </main>
    </div>
  );
}
