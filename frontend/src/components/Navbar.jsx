import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Home,
  Upload,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  Play,
  History,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserAvatar = (user) => {
    if (!user) return "/default-avatar.svg";
    if (typeof user.avatar === "string") return user.avatar;
    if (typeof user.avatar === "object" && user.avatar !== null) {
      return user.avatar.url || "/default-avatar.png";
    }
    return "/default-avatar.svg";
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/tweets", icon: MessageCircle, label: "Tweets" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold gradient-text"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="hidden sm:block">VideoTube</span>
            </Link>


            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-800/50 border border-gray-700 rounded-full
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-gray-700 
                           hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </form>


            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive(link.to)
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}

              {user && (
                <Link
                  to="/upload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive("/upload")
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload</span>
                </Link>
              )}


              {!user ? (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="btn-secondary text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={getUserAvatar(user)}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700"
                    />
                  </button>


                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 py-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm font-medium text-gray-100">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{user.username}
                          </p>
                        </div>

                        <Link
                          to="/channel"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Your Channel
                        </Link>

                        <Link
                          to="/history"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          <History className="w-4 h-4" />
                          Watch History
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>

                        <div className="border-t border-gray-700 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700/50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>


        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-md animate-fade-in">

            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-700 rounded-lg"
                >
                  <Search className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </form>


            <div className="px-4 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive(link.to)
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {user && (
                <Link
                  to="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive("/upload")
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload</span>
                </Link>
              )}


              {user ? (
                <>
                  <Link
                    to="/channel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 transition-all"
                  >
                    <img
                      src={getUserAvatar(user)}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-200">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 btn-secondary text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 btn-primary text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>


      <div className="h-16" />
    </>
  );
};

export default Navbar;
