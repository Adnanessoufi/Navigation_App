import axios, { AxiosError } from "axios";

axios.defaults.withCredentials = true;

const handleLogout = async (): Promise<void> => {
  try {
    await axios.post("/api/auth/logout");
    window.location.href = "/";
  } catch (error) {
    const err = error as AxiosError;
    console.error("Logout failed:", err);
    alert("Something went wrong while logging out. Please try again.");
  }
};

export default handleLogout
