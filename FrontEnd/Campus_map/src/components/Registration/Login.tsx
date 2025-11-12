import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";

axios.defaults.withCredentials = true;

interface LoginProps {
  setLogin: () => void;
}

interface LoginResponse {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  message?: string;
}

export default function Login({ setLogin }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const res = await axios.post<LoginResponse>("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.user) {
        setLogin();
        navigate("/search");
      } else {
        alert("Login failed: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || "An error occurred. Try again.");
    }
  }
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 sm:p-10">
      {/* Header */}
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">Log in</h1>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
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
            placeholder="user@company.com"
            autoComplete="email"
            required
            className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-gray-700 text">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 underline underline-offset-3 decoration-gray-400 hover:text-gray-800"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
              className="w-full h-12 px-4 rounded-lg border-0 
                      text-gray-800 placeholder-gray-500 focus:bg-[#f9f7f7] bg-[#f1f0ee] hover:bg-[#e4e2df]
                       focus:outline-none focus:ring-2 focus:ring-black"
            />
            {/* Eye toggle */}
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              {showPassword ? (
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

        <button
          type="submit"
          className="w-full h-14 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition"
        >
          Log in
        </button>

        <p className="mt-6 text-center text-[#6b6b6b] text-sm font-normal">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#6b6b6b] font-semibold underline underline-offset-[5px] decoration-[#6b6b6b] hover:text-[#6b6b6b]"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  </div>
);

}
