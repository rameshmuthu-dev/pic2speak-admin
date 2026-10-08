import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Languages,
  BookOpen,
  Map,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const dispatch = useDispatch();
  const location = useLocation();

  const { admin, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const adminIdentifier = admin?.name
    ? admin.name.substring(0, 2).toUpperCase()
    : "AD";

  /*
   * NEW ADMIN ARCHITECTURE
   *
   * Dashboard
   * Languages
   * Lessons
   * Adventure Map
   */
  const navLinks = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Languages",
      path: "/admin/languages",
      icon: <Languages size={18} />,
    },
    {
      name: "Lessons",
      path: "/admin/lesson-masters",
      icon: <BookOpen size={18} />,
    },
    {
      name: "Map",
      path: "/admin/adventure-map",
      icon: <Map size={18} />,
    },
  ];

  const isLinkActive = (link) => {
    if (link.name === "Dashboard") {
      return location.pathname === "/";
    }

    if (link.name === "Languages") {
      return location.pathname.startsWith("/admin/languages");
    }

    if (link.name === "Lessons") {
      return (
        location.pathname.startsWith("/admin/lesson-masters") ||
        location.pathname.startsWith("/admin/lesson-content") ||
        location.pathname.startsWith("/admin/scenes")
      );
    }

    if (link.name === "Map") {
      return location.pathname.startsWith("/admin/adventure-map");
    }

    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b-2 border-[#14B8A6]/10 sticky top-0 z-40 shadow-sm rounded-b-2xl">
      <div className="w-full max-w-400 mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to={isAuthenticated ? "/" : "/login"}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="bg-[#14B8A6] w-9 h-9 rounded-xl flex items-center justify-center text-white font-black">
              P2S
            </div>

            <span className="text-xl font-bold text-[#0F172A] hidden lg:block">
              Pic2<span className="text-[#14B8A6]">Admin</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1 md:gap-2 lg:gap-4 xl:gap-6 text-[#334155]">

            {isAuthenticated &&
              navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.name === "Dashboard"}
                  className={() =>
                    `flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg transition-all font-semibold text-[11px] md:text-sm lg:text-base ${
                      isLinkActive(link)
                        ? "text-[#14B8A6] bg-[#14B8A6]/10"
                        : "hover:text-[#14B8A6] hover:bg-slate-50"
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              ))}

            {/* Admin Profile */}
            <div className="ml-2 border-l pl-4 border-slate-100 shrink-0">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-1 pr-2 rounded-full border border-slate-100"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#14B8A6] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {adminIdentifier}
                    </div>

                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">

                      {/* Admin Info */}
                      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                        <p className="text-[10px] text-[#14B8A6] font-black uppercase tracking-widest italic">
                          Administrator
                        </p>

                        <p className="text-sm font-bold text-slate-800 truncate">
                          {admin?.name || "Admin User"}
                        </p>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#14B8A6] text-white px-4 py-2 rounded-xl font-bold text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              ref={menuButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#14B8A6] p-2 hover:bg-[#14B8A6]/10 rounded-lg"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden bg-white border-t border-gray-100 px-6 py-8 space-y-2 shadow-2xl"
        >
          {isAuthenticated &&
            navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.name === "Dashboard"}
                onClick={() => setIsOpen(false)}
                className={() =>
                  `flex items-center gap-4 p-4 rounded-2xl text-lg font-bold ${
                    isLinkActive(link)
                      ? "bg-[#14B8A6] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}

          {/* Mobile Logout */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 text-red-500 font-black py-4 bg-red-50 rounded-2xl mt-4"
            >
              <LogOut size={22} />
              LOGOUT
            </button>
          )}

          {/* Mobile Login */}
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center bg-[#14B8A6] text-white font-black py-4 rounded-2xl"
            >
              LOGIN
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;