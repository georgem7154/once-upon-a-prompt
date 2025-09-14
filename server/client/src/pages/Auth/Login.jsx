import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";



// 🌌 Sparkles Background
function MovingSparkles() {
  const ref = useRef();
  const count = 2500;
  const positions = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      temp.set([x, y, z], i * 3);
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    // Intrinsic rotation
    ref.current.rotation.x += delta * 0.02;
    ref.current.rotation.y += delta * 0.03;

    // Mouse interactivity with easing for a smooth effect
    easing.damp3(
      ref.current.rotation,
      [
        ref.current.rotation.x + state.mouse.y * 0.05,
        ref.current.rotation.y + state.mouse.x * 0.05,
        0
      ],
      0.25,
      delta
    );
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="green"
          size={0.2}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

const Login = ({ authChecker, setAuthChecker }) => {
  const prevPage = localStorage.getItem("prevPage");
  const navigate = useNavigate();
  const [showpwd, setShowPwd] = useState(false);
  const [isHovered1, setIsHovered1] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if(error){
        setTimeout(() => {
          setError("");
        }, 5000);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/user/login/user",
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );
      
      // Using navigate for smoother transitions within React Router
      setAuthChecker(true);
      toast.success("Successfully logged in");  
      if (prevPage === "/register") {
        navigate("/");
        localStorage.removeItem("prevPage"); // Clear after redirect
      } else {
        navigate("/");
      }

    } catch (error) {
      setError("Invalid Credentials");
      toast.error("Invalid Credentials");
    }
  };

  return (
    <div className="bg-slate-900 w-screen h-screen overflow-hidden relative">
      {/* Starfield Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
              <Canvas style={{ height: "100%", width: "100%" }}>
                          <fog attach="fog" args={['#0f172a', 0, 70]} />
                          <MovingSparkles />
                        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-screen h-screen flex text-slate-400 justify-center items-center">
        <div className="border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/30 flex flex-col m-1 bg-slate-900/80 backdrop-blur-md rounded-2xl p-10">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="text-center mb-5 text-4xl font-press text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              Login
            </div>
            <div className="text-base text-center mb-6">
              Don't have an account?{" "}
              <Link to="/register" className="hover:text-yellow-300 transition-colors text-white font-semibold">
                Register Here
              </Link>
            </div>
            <label className="text-lg">Email</label>
            <input
              type="email"
              name="email"
              className="mt-2 mb-6 rounded-xl text-xl p-2 text-white bg-slate-800/80 ring-1 ring-slate-600 focus:ring-yellow-400 focus:outline-none"
              required
              onChange={handleChange}
            />
            <label className="text-lg">Password</label>
            <div className="flex flex-row items-center">
              <input
                type={showpwd ? "text" : "password"}
                name="password"
                className="mt-2 mb-4 rounded-xl text-xl p-2 w-full text-white bg-slate-800/80 ring-1 ring-slate-600 focus:ring-yellow-400 focus:outline-none"
                required
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showpwd)}
                className="ml-3 flex hover:text-white text-slate-600 transition-colors"
              >
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6C8.76722 6 5.95965 8.31059 4.2048 11.7955C4.17609 11.8526 4.15483 11.8948 4.1369 11.9316C4.12109 11.964 4.11128 11.9853 4.10486 12C4.11128 12.0147 4.12109 12.036 4.1369 12.0684C4.15483 12.1052 4.17609 12.1474 4.2048 12.2045C5.95965 15.6894 8.76722 18 12 18C15.2328 18 18.0404 15.6894 19.7952 12.2045C19.8239 12.1474 19.8452 12.1052 19.8631 12.0684C19.8789 12.036 19.8888 12.0147 19.8952 12C19.8888 11.9853 19.8789 11.964 19.8631 11.9316C19.8452 11.8948 19.8239 11.8526 19.7952 11.7955C18.0404 8.31059 15.2328 6 12 6ZM2.41849 10.896C4.35818 7.04403 7.7198 4 12 4C16.2802 4 19.6419 7.04403 21.5815 10.896C21.5886 10.91 21.5958 10.9242 21.6032 10.9389C21.6945 11.119 21.8124 11.3515 21.8652 11.6381C21.9071 11.8661 21.9071 12.1339 21.8652 12.3619C21.8124 12.6485 21.6945 12.8811 21.6032 13.0611C21.5958 13.0758 21.5886 13.09 21.5815 13.104C19.6419 16.956 16.2802 20 12 20C7.7198 20 4.35818 16.956 2.41849 13.104C2.41148 13.09 2.40424 13.0758 2.39682 13.0611C2.3055 12.881 2.18759 12.6485 2.13485 12.3619C2.09291 12.1339 2.09291 11.8661 2.13485 11.6381C2.18759 11.3515 2.3055 11.119 2.39682 10.9389C2.40424 10.9242 2.41148 10.91 2.41849 10.896ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10ZM8.00002 12C8.00002 9.79086 9.79088 8 12 8C14.2092 8 16 9.79086 16 12C16 14.2091 14.2092 16 12 16C9.79088 16 8.00002 14.2091 8.00002 12Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            {error && <div className="text-red-500 text-base text-center h-6">{error}</div>}
            <button
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
              className={`p-2 mt-4 rounded-full mx-5 text-lg font-bold ${
                isHovered1 ? "bg-green-700" : "bg-green-600"
              } text-white transition-colors`}
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;