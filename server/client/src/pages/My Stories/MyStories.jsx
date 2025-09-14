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

const MyStories = ({ authChecker, setAuthChecker, setGlobalLoading }) => {
  const [userId, setUserId] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyMeta, setStoryMeta] = useState(null);

  useEffect(() => {
    setGlobalLoading(true);

    fetch("/user/find/userbyemail", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((userData) => {
        const uid = userData?.userId || "george123";
        setUserId(uid);
        return fetch(`/api/getfullstory/${uid}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setStories(data);
        setLoading(false);
        setGlobalLoading(false); // ✅ Moved here
      })
      .catch((err) => {
        console.error("❌ Failed to fetch stories:", err);
        setLoading(false);
        setGlobalLoading(false); // ✅ Also moved here
      });
  }, []);

  const handleCardClick = (storyId) => {
    if (!userId) return;
    setGlobalLoading(true);
    setStoryLoading(true);
    setActiveStory(null);
    setStoryMeta(null);

    fetch(`/api/getstory/${userId}/${storyId}`)
      .then((res) => res.json())
      .then((data) => {
        setActiveStory({ storyId, scenes: data });

        // Extract metadata from the story scenes
        const metaScene = data.find((s) => s.sceneKey === "meta");
        if (metaScene) {
          setStoryMeta({
            title: metaScene.title || storyId.replace(/_/g, " ").toUpperCase(),
            cover: metaScene.cover,
            genre: metaScene.genre,
            tone: metaScene.tone,
            audience: metaScene.audience,
          });
        }

        setStoryLoading(false);
        setGlobalLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch full story:", err);
        setStoryLoading(false);
        setGlobalLoading(false);
      });
  };

  const handleBack = () => {
    setActiveStory(null);
    setStoryMeta(null);
  };

  const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleStructuredPDFExport = async () => {
    if (!activeStory || !activeStory.scenes) return;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const coverPage = pdfDoc.addPage();
    const { width: pageWidth, height: pageHeight } = coverPage.getSize();

    coverPage.setFont(font);
    coverPage.setFontSize(36);
    const title = activeStory.storyId.replace(/_/g, " ").toUpperCase();
    const titleWidth = font.widthOfTextAtSize(title, 36);
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 100,
      color: rgb(0.2, 0.2, 0.6),
    });

    const meta = activeStory.scenes.find((s) => s.sceneKey === "meta");
    if (meta?.cover) {
      try {
        const imageBytes = Uint8Array.from(atob(meta.cover), (c) =>
          c.charCodeAt(0)
        );
        const pngImage = await pdfDoc.embedPng(imageBytes);
        const maxWidth = pageWidth - 100;
        const imgDims = pngImage.scaleToFit(maxWidth, pageHeight / 2);

        coverPage.drawImage(pngImage, {
          x: (pageWidth - imgDims.width) / 2,
          y: pageHeight / 2 - imgDims.height / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      } catch (err) {
        console.warn("⚠️ Failed to embed cover image:", err);
      }
    }

    for (const scene of activeStory.scenes.filter(
      (s) => s.sceneKey !== "meta"
    )) {
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      page.setFont(font);
      page.setFontSize(20);
      page.drawText(scene.sceneKey.replace("scene", "Scene "), {
        x: 50,
        y: height - 80,
        color: rgb(0.1, 0.1, 0.4),
      });

      page.setFontSize(12);
      const wrappedText = wrapText(scene.text, font, 12, width - 100);
      let y = height - 120;
      for (const line of wrappedText) {
        if (y < 300) break;
        page.drawText(line, { x: 50, y });
        y -= 16;
      }

      if (scene.image) {
        try {
          const imageBytes = Uint8Array.from(atob(scene.image), (c) =>
            c.charCodeAt(0)
          );
          const pngImage = await pdfDoc.embedPng(imageBytes);
          const maxWidth = width - 100;
          const maxHeight = height / 2;
          const imgDims = pngImage.scaleToFit(maxWidth, maxHeight);

          page.drawImage(pngImage, {
            x: (width - imgDims.width) / 2,
            y: 100,
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (err) {
          console.warn("⚠️ Failed to embed image:", err);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeStory.storyId}.pdf`;
    link.click();
  };

  const handleMakePublic = async () => {
    if (!activeStory || !userId) return;

    try {
      const res = await fetch(
        `/api/publishstory/${userId}/${activeStory.storyId}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Story published to PublicStories!");
      } else {
        console.error("❌ Failed to publish:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("❌ Error publishing story:", err);
    }
  };

  return (
    <div className="relative min-h-screen text-white pt-20 bg-slate-900 p-6 overflow-hidden">
      {/* Starfield Background */}
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

      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">
          My Stories
        </h1>

        {!loading && (
          <>
            {!activeStory && !storyLoading && (
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
                        alt={`${story.title} cover`}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-semibold text-yellow-300 mb-2">
                        {story.title}
                      </h2>
                      <p className="text-sm text-gray-300">
                        Genre:{" "}
                        <strong className="text-white">{story.genre}</strong>
                        <br />
                        Tone:{" "}
                        <strong className="text-white">{story.tone}</strong>
                        <br />
                        Audience:{" "}
                        <strong className="text-white">{story.audience}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStory && !storyLoading && (
              <div className="max-w-4xl mx-auto mt-16 space-y-10 bg-slate-800/70 backdrop-blur-sm p-6 rounded-lg border border-slate-600">
                {/* Back to Gallery Button */}
                <button
                  onClick={handleBack}
                  className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow transition-transform transform hover:scale-105"
                >
                  ← Back to Gallery
                </button>

                {/* Story Title and Cover Image */}
                {storyMeta && (
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-yellow-300 mb-6">
                      {storyMeta.title}
                    </h2>
                    {storyMeta.cover && (
                      <div className="flex justify-center mb-6">
                        <img
                          src={`data:image/png;base64,${storyMeta.cover}`}
                          alt={`${storyMeta.title} cover`}
                          className="w-full h-auto rounded-md border border-slate-500"
                        />
                      </div>
                    )}
                    <div className="flex justify-center gap-6 text-sm text-gray-300">
                      {storyMeta.genre && (
                        <span>
                          Genre:{" "}
                          <strong className="text-white">
                            {storyMeta.genre}
                          </strong>
                        </span>
                      )}
                      {storyMeta.tone && (
                        <span>
                          Tone:{" "}
                          <strong className="text-white">
                            {storyMeta.tone}
                          </strong>
                        </span>
                      )}
                      {storyMeta.audience && (
                        <span>
                          Audience:{" "}
                          <strong className="text-white">
                            {storyMeta.audience}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Story Scenes */}
                {activeStory.scenes
                  .filter((scene) => scene.sceneKey !== "meta")
                  .map((scene) => (
                    <div
                      key={scene._id}
                      className="bg-slate-700/50 p-6 rounded-lg shadow-md border border-slate-500"
                    >
                      <h3 className="text-2xl font-semibold text-yellow-200 mb-4">
                        {scene.sceneKey
                          .replace("scene", "Scene ")
                          .toUpperCase()}
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

                {/* Export & Publish Buttons */}
                <div className="text-center mt-16 space-x-4">
                  <button
                    onClick={handleStructuredPDFExport}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-lg transition-transform transform hover:scale-105"
                  >
                    📄 Download Structured PDF
                  </button>
                  <button
                    onClick={handleMakePublic}
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md shadow-lg transition-transform transform hover:scale-105"
                  >
                    🌍 Make Public
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyStories;
