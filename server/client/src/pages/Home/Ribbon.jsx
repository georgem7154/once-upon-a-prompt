import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // Using react-hot-toast for consistency

const Ribbon = ({ authChecker, setAuthChecker }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple brain icon to replace the file path
  const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 1 1h.3a2.4 2.4 0 0 1 2.2 1.3 2.4 2.4 0 0 0 4.3 1.3 2.5 2.5 0 0 1 2.2-1.3h.3a1 1 0 0 0 1-1V4.5A2.5 2.5 0 0 1 21.5 2h-12Z" />
        <path d="M14.5 22a2.5 2.5 0 0 0-2.5-2.5v-1.2a1 1 0 0 1-1-1h-.3a2.4 2.4 0 0 0-2.2-1.3 2.4 2.4 0 0 1-4.3-1.3A2.5 2.5 0 0 0 2.5 13h-.3a1 1 0 0 1-1-1v-1.5A2.5 2.5 0 0 0 .5 8h12Z" />
    </svg>
  );

  const validateUser = async () => {
    try {
      const response = await axios.get("/user/verifytoken/user", {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.userId) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/user/logout/user", {}, { withCredentials: true });
      setIsAuthenticated(false);
      toast.success("User logged out");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    validateUser();
  }, [authChecker]);

  return (
    <div className="absolute top-0 left-0 w-full h-16 font-sans z-20 text-white">
      <div className="relative w-full h-full p-4">
        {/* Desktop Nav */}
        <div className="hidden md:flex justify-between items-center h-full">
            {/* Left Side: Logo */}
            <Link to="/" className="flex items-center">
              <BrainIcon />
              <span className="ml-2 text-lg font-bold">Once Upon A Prompt</span>
            </Link>

            {/* Centered Links */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
                <Link to="/mystories" className="px-4 py-2 rounded-md hover:bg-slate-700/50 transition-colors text-2xl font-semibold">
                    My Stories
                </Link>
                <Link to="/publicstories" className="px-4 py-2 rounded-md hover:bg-slate-700/50 transition-colors text-2xl font-semibold">
                    Public Stories
                </Link>
            </div>
            
            {/* Right Side: Auth Button */}
            <div>
            {isAuthenticated ? (
                <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors">
                    Logout
                </button>
            ) : (
                <Link to="/register" className="px-4 py-2 rounded-md bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-500 transition-colors">
                    Register
                </Link>
            )}
            </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-between items-center h-full">
          <Link to="/" className="flex items-center">
             <BrainIcon />
          </Link>
          <button onClick={() => setShow(!show)} className="text-3xl">
            {show ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {show && (
          <div
            className="md:hidden absolute flex flex-col items-center top-16 right-4 w-48 bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700"
          >
            <Link className="w-full text-center py-3 hover:bg-slate-700/50 transition-colors rounded-t-lg text-xl" to="/mystories" onClick={() => setShow(false)}>
              My Stories
            </Link>
            <Link className="w-full text-center py-3 hover:bg-slate-700/50 transition-colors text-xl" to="/publicstories" onClick={() => setShow(false)}>
              Public Stories
            </Link>
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setShow(false); }} className="w-full text-center py-3 text-red-400 hover:bg-slate-700/50 transition-colors rounded-b-lg text-lg">
                Logout
              </button>
            ) : (
              <Link className="w-full text-center py-3 hover:bg-slate-700/50 transition-colors rounded-b-lg text-lg" to="/register" onClick={() => setShow(false)}>
                Register
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ribbon;

