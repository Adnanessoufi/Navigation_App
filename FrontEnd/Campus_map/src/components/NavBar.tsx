import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import handleLogout from "./Registration/Logout";
import { useMe } from "../hooks/useMe";

type NavBarProps = {
  isLogin: boolean;
};

export default function NavBar({ isLogin }: NavBarProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { me, isAdmin, loading } = useMe(isLogin);

  const linkClasses =
    "px-3 py-2 rounded-md text-sm font-medium hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const activeClasses = "text-white bg-blue-600";

  return (
    <nav className="bg-slate-800 text-slate-100 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <Link to="/" className="text-xl font-bold tracking-tight">
            MyApp
          </Link>
          <Link to="/search" className="font-semibold hover:text-blue-600">
            Search
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-0.5 w-5 bg-current mb-1.5" />
            <span className="block h-0.5 w-5 bg-current mb-1.5" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>

          {/* Right: Links (desktop) */}
          <ul className="hidden md:flex items-center gap-2">
            {/* Admin link + badge (only for admins) */}
            {!loading && isLogin && isAdmin && (
              <>
                <li>
                  <NavLink
                    to="/admin/pending"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Places
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Users
                  </NavLink>
                </li>
              </>
            )}

            {isLogin ? (
              <>
                <li>
                  <NavLink
                    to="/places/new"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Add Place
                  </NavLink>
                </li>
                <li> 
                  <NavLink
                    to="/favorites"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Favorites
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    {me?.name || me?.email || "Profile"}
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className={linkClasses}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `${linkClasses} ${isActive ? activeClasses : ""}`
                    }
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <ul className="md:hidden pb-3 space-y-1">
            {/* Admin (mobile) */}
            {!loading && isLogin && isAdmin && (
              <>
                <li>
                  <NavLink
                    to="/admin/pending"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${linkClasses} ${
                        isActive ? activeClasses : "hover:bg-slate-700"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                </li>
              </>
            )}

            {isLogin ? (
              <>
                <li>
                  <NavLink
                    to="/places/new"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${linkClasses} ${
                        isActive ? activeClasses : "hover:bg-slate-700"
                      }`
                    }
                  >
                    Add Place
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${linkClasses} ${
                        isActive ? activeClasses : "hover:bg-slate-700"
                      }`
                    }
                  >
                    {me?.name || me?.email || "Profile"}
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className={`block w-full text-left ${linkClasses} hover:bg-slate-700`}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${linkClasses} ${
                        isActive ? activeClasses : "hover:bg-slate-700"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${linkClasses} ${
                        isActive ? activeClasses : "hover:bg-slate-700"
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
