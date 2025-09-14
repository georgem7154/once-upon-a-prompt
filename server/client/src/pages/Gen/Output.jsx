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
        0,
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

// Loading Component with animation
const StoryLoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Main spinner */}
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

        {/* Orbiting elements */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>

        {/* Floating elements */}
        <div
          className="absolute -top-8 left-6 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="absolute -right-8 top-6 w-3 h-3 bg-green-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>

      <p className="mt-6 text-yellow-300 font-medium text-lg">
        Loading your illustrated story...
      </p>
      <p className="text-gray-300 mt-2">This will just take a moment</p>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="animate-pulse"
        >
          <path
            d="M25,25 Q50,0 75,25 Q100,50 75,75 Q50,100 25,75 Q0,50 25,25"
            fill="none"
            stroke="purple"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="absolute top-10 right-10 opacity-20">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="animate-spin"
          style={{ animationDuration: "8s" }}
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="indigo"
            strokeWidth="2"
            strokeDasharray="10,10"
          />
        </svg>
      </div>
    </div>
  );
};

const Output = () => {
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("generatedStoryPayload");
    if (!stored) {
      console.error("⚠️ No payload found in localStorage.");
      setLoading(false);
      return;
    }

    const payload = JSON.parse(stored);

    // Optional: enrich with authenticated userId
    fetch("/user/find/userbyemail", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((userData) => {
        const userId = userData?.userId || payload.userId || "george123";

        const enrichedPayload = {
          ...payload,
          userId,
        };

        setMeta({
          title: enrichedPayload.storyId.replace(/_/g, " "),
          genre: enrichedPayload.genre,
          tone: enrichedPayload.tone,
          audience: enrichedPayload.audience,
        });

        return fetch("/api/genimg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrichedPayload),
        });
      })
      .then((res) => res.json())
      .then((data) => {
        setStoryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load illustrated story:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
        {/* 🌌 Starfield Background */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Canvas style={{ height: "100%", width: "100%" }}>
            <fog attach="fog" args={["#0f172a", 0, 70]} />
            <MovingSparkles />
          </Canvas>
        </div>
        <StoryLoadingAnimation />
      </div>
    );
  }

  if (!storyData) {
    return (
      <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
        {/* 🌌 Starfield Background */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Canvas style={{ height: "100%", width: "100%" }}>
            <fog attach="fog" args={["#0f172a", 0, 70]} />
            <MovingSparkles />
          </Canvas>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-slate-800/70 backdrop-blur-sm p-8 rounded-lg border border-slate-600">
            <p className="text-lg text-gray-300 mb-4">
              No story data found. Please go back and generate one.
            </p>
            <a
              href="/"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-transform transform hover:scale-105"
            >
              🔙 Back to Generator
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white pt-20  bg-slate-900 overflow-hidden">
      {/* 🌌 Starfield Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas style={{ height: "100%", width: "100%" }}>
            <fog attach="fog" args={["#0f172a", 0, 70]} />
            <MovingSparkles />
          </Canvas>
      </div>

      <div className="relative z-10 p-6">
        <h1 className="text-5xl font-bold text-center text-yellow-300 mb-2 drop-shadow-lg">
          {meta.title.toUpperCase()}
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Genre: <strong className="text-white">{meta.genre}</strong> | Tone:{" "}
          <strong className="text-white">{meta.tone}</strong> | Audience:{" "}
          <strong className="text-white">{meta.audience}</strong>
        </p>

        {/* ✅ Cover Image */}
        {storyData.cover?.image && (
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <img
              src={`data:image/png;base64,${storyData.cover.image}`}
              alt="Cover illustration"
              className="w-full h-auto rounded-lg shadow-lg border border-slate-500"
            />
          </div>
        )}

        {/* ✅ Story Scenes */}
        <div className="max-w-4xl mx-auto space-y-10">
          {Object.entries(storyData)
            .filter(([key]) => key !== "cover" && key !== "title")
            .map(([sceneKey, scene]) => (
              <div
                key={sceneKey}
                className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-slate-600"
              >
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
                  {sceneKey.replace("scene", "Scene ").toUpperCase()}
                </h2>
                <p className="text-gray-200 mb-4 whitespace-pre-line">
                  {scene.text}
                </p>
                {scene.image && (
                  <img
                    src={`data:image/png;base64,${scene.image}`}
                    alt={`${sceneKey} visual`}
                    className="w-full h-auto rounded-md border border-slate-500"
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Output;
