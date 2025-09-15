import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";

// --- Helper Components ---

// 🌌 Sparkles Background Component
function MovingSparkles() {
  const ref = useRef();
  const count = 2500;
  const positions = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp.set([(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100], i * 3);
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.02;
    ref.current.rotation.y += delta * 0.03;
    easing.damp3(ref.current.rotation, [state.mouse.y * 0.05, state.mouse.x * 0.05, 0], 0.25, delta);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]} ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#67e8f9" size={0.15} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </Points>
    </group>
  );
}

// 🔄 Loading Animation Component
const StoryLoadingAnimation = () => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-cyan-300 border-t-cyan-600 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-fuchsia-400/50 rounded-full animate-ping"></div>
    </div>
    <p className="mt-6 text-2xl font-medium text-yellow-300 tracking-wider">Crafting Your Tale...</p>
    <p className="text-gray-300 mt-2">Illustrations are being painted with pixels.</p>
  </div>
);

// ✨ A small indicator for the bottom-right corner.
const StreamStatusIndicator = () => (
    <div className="fixed bottom-6 right-6 bg-slate-800/90 text-white p-3 rounded-lg shadow-lg flex items-center space-x-3 backdrop-blur-sm z-[60]">
      <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium">Processing scenes...</span>
    </div>
);


// --- Main Output Component ---

const Output = () => {
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [meta, setMeta] = useState({});
  const [isStreamComplete, setIsStreamComplete] = useState(false);

  useEffect(() => {
    const processStream = async () => {
      try {
        const stored = localStorage.getItem("generatedStoryPayload");
        const storedUseGemini = localStorage.getItem("useGemini");
        const useGemini = storedUseGemini ? JSON.parse(storedUseGemini) : false; // Default to Hunyuan
        
        if (!stored) throw new Error("No story data found in your session.");

        const payload = JSON.parse(stored);
        setMeta({
          title: payload.story.title || "Untitled Story",
          genre: payload.genre,
          tone: payload.tone,
          audience: payload.audience,
        });
        
        const apiEndpoint = useGemini
          ? "/api/genimg"
          : "/api/genimghug/stream";
        
        console.log(`🚀 Contacting streaming endpoint: ${apiEndpoint}`);

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Server responded with an error: ${response.status}`);
        
        setLoading(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsStreamComplete(true);
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n\n");
          while (boundary > -1) {
            const message = buffer.substring(0, boundary);
            buffer = buffer.substring(boundary + 2);
            let event = "message", data = "";
            message.split("\n").forEach(line => {
              if (line.startsWith("event: ")) event = line.substring(7);
              else if (line.startsWith("data: ")) data = line.substring(6);
            });
            if (data) {
              try {
                const parsedData = JSON.parse(data);
                if (event === "cover") setStoryData(prev => ({ ...prev, cover: parsedData }));
                else if (event === "scene") setStoryData(prev => ({ ...prev, [parsedData.key]: parsedData }));
                else if (event === "error") setErrors(prev => [...prev, parsedData.error]);
                else if (event === "done") setIsStreamComplete(true);
              } catch (e) { console.error("Failed to parse chunk:", data, e); }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (err) {
        console.error("❌ Failed to process story stream:", err);
        setErrors(prev => [...prev, err.message]);
        setLoading(false);
      }
    };
    processStream();
  }, []);
  
  const renderErrorState = () => (
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="text-center bg-slate-800/70 p-8 rounded-lg border border-red-500 max-w-lg">
        <h2 className="text-2xl text-red-400 mb-4">An Error Occurred</h2>
        <ul className="text-lg text-gray-300 mb-6 list-disc list-inside text-left">
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
        <a href="/" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md">🔙 Back to Generator</a>
      </div>
    </div>
  );

  const renderStoryContent = () => (
    <div className="relative z-10 p-4 sm:p-6">
      <h1 className="text-4xl sm:text-5xl font-bold text-center text-yellow-300 mb-2 drop-shadow-lg">{meta.title?.toUpperCase()}</h1>
      <p className="text-center text-gray-300 mb-8 text-sm sm:text-base">
        Genre: <strong className="text-white">{meta.genre}</strong> | Tone: <strong className="text-white">{meta.tone}</strong> | Audience: <strong className="text-white">{meta.audience}</strong>
      </p>
      <div className="max-w-3xl mx-auto mb-10 text-center">
        {storyData?.cover?.image ? (
          <img src={`data:image/png;base64,${storyData.cover.image}`} alt="Cover illustration" className="w-full h-auto rounded-lg shadow-2xl" />
        ) : (
          <div className="w-full h-64 bg-slate-800/50 rounded-lg flex items-center justify-center"><p>Cover image is being generated...</p></div>
        )}
      </div>
      <div className="max-w-4xl mx-auto space-y-12">
        {Object.entries(storyData || {})
          .filter(([key]) => key.startsWith("scene"))
          .sort((a, b) => a[0].localeCompare(b[0], undefined, {numeric: true}))
          .map(([sceneKey, scene]) => (
            <div key={sceneKey} className="bg-slate-800/70 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-yellow-300 mb-4">{sceneKey.replace("scene", "Scene ").toUpperCase()}</h2>
              <p className="text-gray-200 mb-4 whitespace-pre-line leading-relaxed">{scene.text}</p>
              {scene.image ? (
                 <img src={`data:image/png;base64,${scene.image}`} alt={`${sceneKey} visual`} className="w-full h-auto rounded-md mt-4" />
              ) : (
                 <div className="w-full h-48 bg-slate-700/50 rounded-md flex items-center justify-center mt-4"><p>Illustration for this scene is loading...</p></div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
  
  return (
    <main className="relative min-h-screen text-white pt-20 bg-black overflow-x-hidden">
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <fog attach="fog" args={["#0f172a", 15, 70]} />
          <MovingSparkles />
        </Canvas>
      </div>

      {loading && <StoryLoadingAnimation />}
      {!loading && errors.length > 0 && renderErrorState()}
      {!loading && !errors.length && storyData && renderStoryContent()}
      {!loading && !isStreamComplete && <StreamStatusIndicator />}
    </main>
  );
};

export default Output;