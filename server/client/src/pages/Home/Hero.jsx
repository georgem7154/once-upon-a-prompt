import { useState, useRef, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { easing } from "maath";
import { Glow, GlowCapture } from "@codaworks/react-glow";
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

function Hero() {
  const [form, setForm] = useState({
    prompt: "",
    genre: "",
    tone: "",
    audience: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios.get("/user/verifytoken/user", { withCredentials: true })
      .then(res => {
        if (res.status === 200) setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const genreOptions = ["sci-fi", "fantasy", "mystery", "historical", "romance", "horror"];
  const toneOptions = ["dark", "whimsical", "serious", "satirical", "uplifting", "mythic"];
  const audienceOptions = ["young adult", "children", "adult", "general", "educators"];

  const promptIdeas = [
    "A linguist deciphers a lost language that speaks directly to the subconscious.",
    "A colony on Mars receives a transmission from Earth… dated 300 years in the future.",
    "A musician discovers that their compositions can alter reality.",
    "A ghost hunter realizes the spirits are trying to protect humanity from something worse.",
    "A teenager inherits a mirror that shows alternate versions of their life—and one starts talking back.",
    "A robot designed for empathy begins dreaming of a world it’s never seen.",
    "A painter’s artwork begins to manifest in the real world, one brushstroke at a time.",
    "A historian finds a journal that rewrites the origin of civilization—and it’s still being updated.",
    "A city built entirely underground starts collapsing as the surface world awakens.",
    "A child’s imaginary friend turns out to be a forgotten deity seeking redemption."
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateRandomPrompt = () => {
    const random = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
    setForm((prev) => ({ ...prev, prompt: random }));
    toast.success("Random prompt generated!", {
      icon: "🎲",
      style: {
        background: "#1e293b",
        color: "#facc15",
        border: "1px solid #fbbf24",
        borderRadius: "8px"
      }
    });
  };

  const generateStory = () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to generate a story.", {
        icon: "🔒",
        style: {
          borderRadius: "8px",
          background: "#1e293b",
          color: "#f87171",
          border: "1px solid #f87171"
        }
      });
      return;
    }

    const missingField = Object.entries(form).find(([key, value]) => !value.trim());
    if (missingField) {
      toast.error(`Missing field: '${missingField[0]}'`, {
        icon: "⚠️",
        style: {
          borderRadius: "8px",
          background: "#1e293b",
          color: "#f87171",
          border: "1px solid #f87171"
        }
      });
      return;
    }

    localStorage.setItem("storyForm", JSON.stringify(form));
    toast.success("Redirecting to edit page...");
    setTimeout(() => {
      window.location.href = "/edittext";
    }, 1000);
  };

  return (
    <GlowCapture>
      <div className="relative min-h-screen text-white pt-64 bg-slate-900 p-6 overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Canvas style={{ height: "100%", width: "100%" }}>
            <fog attach="fog" args={['#0f172a', 0, 70]} />
            <MovingSparkles />
          </Canvas>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">
            ONCE UPON A PROMPT
          </h1>

          <Glow color="#fbbf24">
            <div className="max-w-2xl mx-auto glow:border-glow bg-slate-800/50 backdrop-blur-sm border border-slate-600 shadow-xl rounded-lg p-6 space-y-4">
              <div className="flex glow:border-glow gap-2">
                <textarea
                  name="prompt"
                  placeholder="Enter your story prompt here..."
                  value={form.prompt}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="flex-grow px-4 glow:border-glow py-2 border border-slate-600 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[3rem] max-h-[12rem] overflow-auto bg-slate-900/70 text-gray-200 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={generateRandomPrompt}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
                >
                  🎲
                </button>
              </div>

              <select
                name="genre"
                value={form.genre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border glow:border-glow border-slate-600 rounded-md bg-slate-900/70 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Genre</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-slate-800">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="tone"
                value={form.tone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border glow:border-glow border-slate-600 rounded-md bg-slate-900/70 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Tone</option>
                {toneOptions.map((t) => (
                  <option key={t} value={t} className="bg-slate-800">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border glow:border-glow border-slate-600 rounded-md bg-slate-900/70 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Audience</option>
                {audienceOptions.map((a) => (
                  <option key={a} value={a} className="bg-slate-800">
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </option>
                ))}
              </select>

              <button
                onClick={generateStory}
                className="w-full py-3 font-semibold rounded-md bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-lg transition-transform transform hover:scale-105"
              >
                Generate Story
              </button>
            </div>
          </Glow>
        </div>
      </div>
    </GlowCapture>
  );
}

export default Hero;