import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

type ProfilePayload = {
  id: string;
  email: string;
  name?: string | null;
};

type ProfileResponse = ProfilePayload; 

export default function Profile() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get<ProfileResponse>("/api/auth/profile");
        setProfile(res.data);
      } catch (e) {
        const err = e as AxiosError<{ message?: string }>;
        const msg =
          err.response?.data?.message ||
          "An error occurred while fetching the profile. Please try again.";

        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(msg);
      }
    }
    fetchProfile();
  }, [navigate]);

  if (!profile && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
          <div className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-6">
        Welcome back, {profile?.name || "User"} 👋
      </h2>

      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Profile Page</h1>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{profile?.name || "—"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{profile?.email}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
