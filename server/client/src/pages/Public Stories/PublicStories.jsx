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
        Loading your story...
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

const PublicStories = ({ authChecker, setAuthChecker, setGlobalLoading }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false); // New state for story loading

  useEffect(() => {
    setGlobalLoading(true);
    fetch("/api/publicstories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStories(data);
        } else {
          console.error("Unexpected response:", data);
          setStories([]);
        }
        setLoading(false);
        setGlobalLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load public stories:", err);
        setLoading(false);
        setGlobalLoading(false);
      });
  }, []);

  const handleCardClick = (storyId) => {
    setStoryLoading(true); // Start loading when story is clicked
    setActiveStory(null); // Clear previous story
    setGlobalLoading(true);
    fetch(`/api/publicstory/${storyId}`)
      .then((res) => res.json())
      .then((data) => {
        setActiveStory({ storyId, scenes: data });
        setStoryLoading(false); // Stop loading when data arrives
        setGlobalLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch full story:", err);
        setStoryLoading(false); // Stop loading on error too
        setGlobalLoading(false);
      });
  };

  const handleBack = () => {
    setActiveStory(null);
  };

  return (
    <div className="relative min-h-screen text-white bg-slate-900 overflow-hidden pt-20">
      {/* 🌌 Starfield Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas style={{ height: "100%", width: "100%" }}>
          <fog attach="fog" args={["#0f172a", 0, 70]} />
          <MovingSparkles />
        </Canvas>
      </div>

      {/* Show loading animation when initial stories are loading */}
      {loading && <StoryLoadingAnimation />}

      {/* Show loading animation when a specific story is being fetched */}
      {storyLoading && <StoryLoadingAnimation />}

      <div className="relative z-10 p-6">
        {!loading && !activeStory && !storyLoading && (
          <>
            <h1 className="text-5xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">
              Public Stories
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {stories.map((story, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(story.storyId)}
                  className="cursor-pointer bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-md border border-slate-600 overflow-hidden hover:shadow-lg transition-transform transform hover:scale-105"
                >
                  {story.cover && (
                    <img
                      src={`data:image/png;base64,${story.cover}`}
                      alt={`${story.title || story.storyId} cover`}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-yellow-300 mb-2">
                      {story.title ||
                        story.storyId.replace(/_/g, " ").toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-300">
                      Genre: <strong>{story.genre || "—"}</strong>
                      <br />
                      Tone: <strong>{story.tone || "—"}</strong>
                      <br />
                      Audience: <strong>{story.audience || "—"}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Published:{" "}
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeStory && !storyLoading && (
          <div className="max-w-4xl mx-auto mt-16 space-y-10 bg-slate-800/70 backdrop-blur-sm p-6 rounded-lg border border-slate-600">
            <button
              onClick={handleBack}
              className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow transition-transform transform hover:scale-105"
            >
              ← Back to Gallery
            </button>

            <h2 className="text-3xl font-bold text-yellow-300 text-center mb-6">
              {activeStory.storyId.replace(/_/g, " ").toUpperCase()}
            </h2>

            {/* Meta Scene */}
            {(() => {
              const meta = activeStory.scenes.find(
                (s) => s.sceneKey === "meta"
              );
              return meta ? (
                <div className="bg-slate-700/50 p-6 rounded-lg shadow-md border border-slate-500">
                  <h3 className="text-2xl font-semibold text-yellow-200 mb-4">
                    Story Overview
                  </h3>
                  <p className="text-gray-200 mb-4 whitespace-pre-line">
                    <strong>Title:</strong> {meta.title}
                    <br />
                    <strong>Genre:</strong> {meta.genre}
                    <br />
                    <strong>Tone:</strong> {meta.tone}
                    <br />
                    <strong>Audience:</strong> {meta.audience}
                  </p>
                  {meta.cover && (
                    <img
                      src={`data:image/png;base64,${meta.cover}`}
                      alt="Cover"
                      className="w-full h-auto rounded-md border border-slate-500"
                    />
                  )}
                </div>
              ) : null;
            })()}

            {/* Story Scenes */}
            {activeStory.scenes
              .filter((scene) => scene.sceneKey !== "meta")
              .map((scene, idx) => (
                <div
                  key={idx}
                  className="bg-slate-700/50 p-6 rounded-lg shadow-md border border-slate-500"
                >
                  <h3 className="text-2xl font-semibold text-yellow-200 mb-4">
                    {scene.sceneKey.replace("scene", "Scene ").toUpperCase()}
                  </h3>
                  <p className="text-gray-200 mb-4 whitespace-pre-line">
                    {scene.text}
                  </p>
                  {scene.image && (
                    <img
                      src={`data:image/png;base64,${scene.image}`}
                      alt={`${scene.sceneKey} visual`}
                      className="w-full h-auto rounded-md border border-slate-500"
                    />
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStories;
