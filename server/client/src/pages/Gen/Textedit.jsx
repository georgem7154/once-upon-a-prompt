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

// 🌀 Loading Animation
const StoryLoadingAnimation = () => (
  <div className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full animate-ping opacity-75"></div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
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
      Generating your story...
    </p>
    <p className="text-gray-300 mt-2">This will just take a moment</p>
  </div>
);

const Textedit = ({ authChecker, setAuthChecker, setGlobalLoading }) => {
  const [form, setForm] = useState(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingStates, setEditingStates] = useState({});
  const [apiError, setApiError] = useState("");
  const sceneRefs = useRef({});

  useEffect(() => {
    setGlobalLoading(true);
    const stored = localStorage.getItem("storyForm");
    if (stored) {
      const parsed = JSON.parse(stored);
      setForm(parsed);
      generateStoryFromAPI(parsed);
    } else {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, []);

  const generateStoryFromAPI = async ({ prompt, genre, tone, audience }) => {
    try {
      const res = await fetch("/api/genstory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, genre, tone, audience }),
      });

      const data = await res.json();
      if (res.ok) {
        setTitle(data.title || "Untitled Story");
        const storyData = {
          scene1: data.scene1,
          scene2: data.scene2,
          scene3: data.scene3,
          scene4: data.scene4,
          scene5: data.scene5,
        };
        setStory(storyData);
        const initialEditingStates = {};
        Object.keys(storyData).forEach((key) => {
          initialEditingStates[key] = false;
        });
        setEditingStates(initialEditingStates);
      } else {
        const errorMessage = data.error || "Unknown error";
        console.error("❌ API error:", errorMessage);
        setApiError(errorMessage);
      }
    } catch (err) {
      console.error("❌ Failed to fetch story:", err);
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleSceneEdit = (key, html) => {
    setStory((prev) => ({ ...prev, [key]: html }));
  };

  const handleSceneFocus = (key) => {
    setEditingStates((prev) => ({ ...prev, [key]: true }));
  };

  const handleSceneBlur = (key, event) => {
    setEditingStates((prev) => ({ ...prev, [key]: false }));
    handleSceneEdit(key, event.currentTarget.innerHTML);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.execCommand("insertLineBreak");
    }
  };

  const handleGenerateImages = () => {
    const editedStory = { title: title.trim() };
    Object.entries(sceneRefs.current).forEach(([key, ref]) => {
      if (ref?.innerText) {
        const sceneKey = key.toLowerCase().replace(/\s+/g, "");
        editedStory[sceneKey] = ref.innerText.trim();
      }
    });

    const payload = {
      userId: "george123",
      storyId: title.toLowerCase().replace(/\s+/g, "_"),
      genre: form.genre,
      tone: form.tone,
      audience: form.audience,
      story: editedStory,
    };

    localStorage.setItem("generatedStoryPayload", JSON.stringify(payload));
    window.location.href = "/output";
  };

  if (loading) {
    return (
      <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
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

  if (!form) {
    return (
      <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Canvas style={{ height: "100%", width: "100%" }}>
            <fog attach="fog" args={["#0f172a", 0, 70]} />
            <MovingSparkles />
          </Canvas>
        </div>
        <div className="relative z-10 p-6 text-center">
          <p className="text-lg">
            No story data found. Please go back and generate one.
          </p>
          <a
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-transform transform hover:scale-105"
          >
            🔙 Back to Generator
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
      {/* 🌌 Starfield Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas style={{ height: "100%", width: "100%" }}>
          <fog attach="fog" args={["#0f172a", 0, 70]} />
          <MovingSparkles />
        </Canvas>
      </div>

      <div className="relative pt-32 z-10 p-6">
        {apiError && (
          <div className="mb-6 p-4 bg-red-800/80 border border-red-500 rounded-lg text-red-200 text-center shadow-md">
            <p className="text-lg font-semibold">⚠️ Story generation failed</p>
            <p className="mt-1">{apiError}</p>
            <p className="mt-2 text-sm text-red-300">
              Try adjusting your prompt or tone and regenerate.
            </p>
          </div>
        )}

        {!apiError && (
          <>
            <div className="text-center mb-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl font-bold text-yellow-300 bg-transparent border-none text-center w-full focus:outline-none bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg"
                placeholder="Untitled Story"
              />
              <p className="text-lg text-gray-300 mt-2">✍️ Edit Your Story</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {Object.entries(story).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-slate-600"
                >
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">
                    {key.replace("scene", "Scene ")}
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    ref={(el) => (sceneRefs.current[key] = el)}
                    onFocus={() => handleSceneFocus(key)}
                    onBlur={(e) => handleSceneBlur(key, e)}
                    onKeyDown={handleKeyDown}
                    dangerouslySetInnerHTML={{ __html: value }}
                    className={`w-full min-h-[6rem] p-3 border border-slate-500 rounded-md bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-200 ${
                      editingStates[key] ? "editing" : ""
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={handleGenerateImages}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md shadow-lg transition-transform transform hover:scale-105"
              >
                🎬 Generate Images
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Textedit;
