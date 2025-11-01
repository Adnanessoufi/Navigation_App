import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

axios.defaults.withCredentials = true;

type RegisterResponse = {
  user?: { id: string; username?: string; email: string };
  message?: string;
};
interface RegisterProps { setLogin: () => void; }

export default function Register({ setLogin }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const navigate = useNavigate();

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    try {
      const res = await axios.post<RegisterResponse>("/api/auth/register", {
        email: email.trim().toLowerCase(),
        password,
        username,
      });

      if (res.data.user) {
        alert("Registration successful!");
        setLogin();
        navigate("/profile");
      } else {
        alert("Registration failed: " + (res.data.message ?? "Unknown error"));
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(
        error.response?.data?.message ??
          "An error occurred during registration. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-5 sm:px-8 sm:py-3">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-4 text-center">
          Register
        </h1>

        {/* Form */}
        <form onSubmit={handleRegistration} className="space-y-5">
          {/* First Name */}
          <div>
            <label htmlFor="username" className="flex items-center justify-between text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="given-name"
              className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="flex items-center justify-between text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username@example.com"
              required
              autoComplete="email"
              className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
                className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                aria-label={showPwd ? "Hide password" : "Show password"}
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPwd ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a3 3 0 104.24 4.24" />
                    <path d="M17.94 17.94C15.9 19.26 13.54 20 12 20 6 20 2 12 2 12a21.87 21.87 0 015.06-6.94M9.88 4.24A10.64 10.64 0 0112 4c6 0 10 8 10 8a21.88 21.88 0 01-2.06 3.36" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Repeat Password */}
          <div>
            <label htmlFor="confirm" className="flex items-center justify-between text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showPwd2 ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
                className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                aria-label={showPwd2 ? "Hide password" : "Show password"}
                onClick={() => setShowPwd2((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPwd2 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a3 3 0 104.24 4.24" />
                    <path d="M17.94 17.94C15.9 19.26 13.54 20 12 20 6 20 2 12 2 12a21.87 21.87 0 015.06-6.94M9.88 4.24A10.64 10.64 0 0112 4c6 0 10 8 10 8a21.88 21.88 0 01-2.06 3.36" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full h-14 mb-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition"
          >
            Sign Up
          </button>

          {/* Footer (optional) */}
          <p className="text-center text-[#6b6b6b] text-sm font-normal">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#6b6b6b] font-semibold underline underline-offset-[5px] decoration-[#6b6b6b] hover:text-[#6b6b6b]"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
