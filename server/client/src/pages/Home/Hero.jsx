import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Glow, GlowCapture } from "@codaworks/react-glow";

import Particles from './Particles'; // Import the new Particles component

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
const toneOptions = ["dark", "playful", "serious", "cynical", "uplifting", "mythic"];
const audienceOptions = [ "children","teen", "adult"];

const promptIdeas = [
  "A lonely lighthouse keeper receives a bottle with a message inside. It's not a cry for help, but an invitation to a secret society that tends to the lost and forgotten objects of the world.",
  "In a future where memories can be bought and sold, a professional 'memory restorer' accidentally uncovers a core memory she doesn't recognize as her own, but it feels like home.",
  "An archivist for a public library discovers that a forgotten book in the children's section is a magical portal to a land where all the stories are real, but they must find a new hero for a tale that has lost its way.",
  "After a city-wide blackout, the residents realize the stars are not where they're supposed to be. One group of friends sets out to find the reason and, in doing so, rediscovers the constellations.",
  "A family of witches lives in a remote, mundane town. Their youngest, who has no magical powers, finds an ancient artifact that gives her the ability to make ordinary objects do extraordinary things, like a teapot that pours wishes instead of tea.",
  "An alien botanist lands on Earth to collect a rare plant, only to be befriended by a child who teaches them about the interconnectedness of life beyond their own sterile planet.",
  "A baker's new recipe for bread has an unexpected side effect: it allows people who eat it to understand the thoughts of plants and animals, leading to a new era of communication and environmentalism.",
  "A cartographer who specializes in mapping imaginary places gets a commission for a new map. The problem is, the client wants a map of a real place that doesn't exist yet, and they need her to draw it into being.",
  "A group of divers exploring a newly discovered deep-sea trench finds a community of creatures who are not only intelligent but have been secretly nurturing the health of the ocean for millennia.",
  "A young ghost, bound to an old bookstore, discovers they can help people find the book they truly need, leading them to new love, unexpected careers, and forgotten dreams."
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
      <div className="relative min-h-screen text-white pt-64 p-6 overflow-hidden">
        {/* Particles Background Integration */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={500}
            particleSpread={5}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        {/* Main Content (Form and Title) */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">
            ONCE UPON A PROMPT
          </h1>

          <Glow color="#fbbf24">
            <div className="max-w-2xl mx-auto glow:border-glow bg-slate-800/40 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 space-y-4">
              <div className="flex glow:border-glow gap-2">
                <textarea
                  name="prompt"
                  placeholder="Enter your story prompt here..."
                  value={form.prompt}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="flex-grow px-4 py-2 border border-white/20 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[3rem] max-h-[12rem] overflow-auto bg-white/10 text-gray-100 placeholder-gray-300"
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
                className="w-full px-4 py-2 border border-white/20 rounded-md bg-white/10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="" className="bg-slate-900 text-gray-300">Select Genre</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-gray-200">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="tone"
                value={form.tone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-white/20 rounded-md bg-white/10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="" className="bg-slate-900 text-gray-300">Select Tone</option>
                {toneOptions.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-gray-200">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-white/20 rounded-md bg-white/10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="" className="bg-slate-900 text-gray-300">Select Audience</option>
                {audienceOptions.map((a) => (
                  <option key={a} value={a} className="bg-slate-900 text-gray-200">
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