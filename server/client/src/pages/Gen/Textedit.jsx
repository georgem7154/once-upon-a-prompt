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
    ref.current.rotation.x += delta * 0.02;
    ref.current.rotation.y += delta * 0.03;
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
    </div>
    <p className="mt-6 text-yellow-300 font-medium text-lg">
      Generating your story...
    </p>
  </div>
);

const Textedit = ({ setGlobalLoading }) => {
  const [form, setForm] = useState(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const sceneRefs = useRef({});
  const [useGemini, setUseGemini] = useState(true); // Default to Gemini

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
        setStory({
          scene1: data.scene1,
          scene2: data.scene2,
          scene3: data.scene3,
          scene4: data.scene4,
          scene5: data.scene5,
        });
      } else {
        setApiError(data.error || "Unknown error");
      }
    } catch (err) {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleGenerateImages = () => {
    const editedStory = { title: title.trim() };
    Object.entries(sceneRefs.current).forEach(([key, ref]) => {
      if (ref?.innerText) {
        editedStory[key] = ref.innerText.trim();
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
    localStorage.setItem("useGemini", JSON.stringify(useGemini));
    window.location.href = "/output";
  };

  if (loading) return <StoryLoadingAnimation />;

  return (
    <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas style={{ height: "100%", width: "100%" }}>
          <fog attach="fog" args={["#0f172a", 0, 70]} />
          <MovingSparkles />
        </Canvas>
      </div>
      <div className="relative pt-32 z-10 p-6">
        {!apiError && (
          <>
            <div className="text-center mb-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl font-bold text-yellow-300 bg-transparent border-none text-center w-full focus:outline-none bg-slate-800/70 p-4 rounded-lg"
              />
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.entries(story).map(([key, value]) => (
                <div key={key} className="bg-slate-800/70 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">
                    {key.replace("scene", "Scene ")}
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    ref={(el) => (sceneRefs.current[key] = el)}
                    dangerouslySetInnerHTML={{ __html: value }}
                    className="w-full min-h-[6rem] p-3 border border-slate-500 rounded-md bg-slate-700/50"
                  />
                </div>
              ))}
            </div>
            <div className="max-w-3xl mx-auto text-center mt-8">
              <div className="flex items-center justify-center space-x-3 text-lg text-gray-300">
                <input
                  type="checkbox"
                  id="model-toggle"
                  checked={useGemini}
                  onChange={(e) => setUseGemini(e.target.checked)}
                  className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-yellow-400 focus:ring-yellow-500 cursor-pointer"
                />
                <label htmlFor="model-toggle" className="cursor-pointer select-none">
                  Use Gemini Model (unchecked for Hunyuan)
                </label>
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleGenerateImages}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md"
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