import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  Calendar,
  Wind,
  Music,
  BookOpen,
  CheckCircle2,
  Flame,
  Moon,
  Sun,
  Bell,
  Sliders,
  Check
} from "lucide-react";

interface MeditationSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  theme: string;
  note?: string;
}

type TabType = "timer" | "sound" | "journal" | "ai";
type BellType = "singing_bowl" | "wind_chime" | "temple_bell" | "crystal_bowl";

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("timer");

  // Timer States
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [customMinutes, setCustomMinutes] = useState<string>("20");
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("마음의 평온");

  // Bell Settings State
  const [selectedBell, setSelectedBell] = useState<BellType>("singing_bowl");
  const [startBellEnabled, setStartBellEnabled] = useState<boolean>(true);
  const [endBellEnabled, setEndBellEnabled] = useState<boolean>(true);

  // Ambient Sound State
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "waves" | "bowl">("none");
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  // Breathing Guide State
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathingActive, setBreathingActive] = useState<boolean>(false);

  // Journal & History State
  const [sessions, setSessions] = useState<MeditationSession[]>(() => {
    try {
      const saved = localStorage.getItem("zentime_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [postSessionNote, setPostSessionNote] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [lastCompletedDuration, setLastCompletedDuration] = useState<number>(15);

  // AI Insight State
  const [aiInsight, setAiInsight] = useState<{ title: string; quote: string; guide: string } | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<{ source?: AudioNode; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play Bell sound based on type
  const playBell = (type: BellType) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (type === "singing_bowl") {
        // Tibetan Singing Bowl (~216Hz & 432Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(216, now);
        osc2.frequency.setValueAtTime(432, now);

        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.exponentialRampToValueAtTime(0.7, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 6.0);
        osc2.stop(now + 6.0);
      } else if (type === "wind_chime") {
        // Wind Chime (Glassy high frequencies)
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + idx * 0.04);

          chimeGain.gain.setValueAtTime(0.01, now + idx * 0.04);
          chimeGain.gain.exponentialRampToValueAtTime(0.35, now + idx * 0.04 + 0.05);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 3.5);

          osc.connect(chimeGain);
          chimeGain.connect(gainNode);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 3.5);
        });
      } else if (type === "temple_bell") {
        // Deep Temple Bell (Low resonant tone ~110Hz with rich harmonics)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "triangle";
        osc3.type = "sine";

        osc1.frequency.setValueAtTime(110, now);
        osc2.frequency.setValueAtTime(220, now);
        osc3.frequency.setValueAtTime(330, now);

        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.8, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 7.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc3.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 7.0);
        osc2.stop(now + 7.0);
        osc3.stop(now + 7.0);
      } else if (type === "crystal_bowl") {
        // Crystal Singing Bowl (Pure 528Hz Solfeggio frequency)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(528, now);
        osc2.frequency.setValueAtTime(1056, now);

        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 5.5);
        osc2.stop(now + 5.5);
      }
    } catch (e) {
      console.error("Bell playback error:", e);
    }
  };

  // Ambient sound management
  useEffect(() => {
    const stopAmbient = () => {
      if (ambientNodeRef.current) {
        try {
          if ((ambientNodeRef.current as any).source?.stop) {
            (ambientNodeRef.current as any).source.stop();
          }
        } catch (e) {
          // ignore
        }
        ambientNodeRef.current = null;
      }
    };

    if (ambientSound === "none" || !isRunning) {
      stopAmbient();
      return;
    }

    try {
      const ctx = getAudioContext();
      stopAmbient();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (ambientSound === "rain") {
        filter.type = "lowpass";
        filter.frequency.value = 1000;
      } else if (ambientSound === "waves") {
        filter.type = "bandpass";
        filter.frequency.value = 400;
        filter.Q.value = 1.2;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 300;
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(soundVolume * 0.4, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      ambientNodeRef.current = { source: noiseSource, gain, filter };

      return () => {
        stopAmbient();
      };
    } catch (e) {
      console.error("Ambient sound error:", e);
    }
  }, [ambientSound, isRunning, soundVolume]);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (endBellEnabled) {
              playBell(selectedBell);
            }
            setLastCompletedDuration(selectedMinutes);
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedMinutes, endBellEnabled, selectedBell]);

  // Breathing guide cycle
  useEffect(() => {
    let timeout: any;
    if (breathingActive) {
      const cycle = () => {
        setBreathingPhase("inhale");
        timeout = setTimeout(() => {
          setBreathingPhase("hold");
          timeout = setTimeout(() => {
            setBreathingPhase("exhale");
            timeout = setTimeout(() => {
              setBreathingPhase("rest");
              timeout = setTimeout(cycle, 1000);
            }, 4000);
          }, 2000);
        }, 4000);
      };
      cycle();
    } else {
      setBreathingPhase("inhale");
    }
    return () => clearTimeout(timeout);
  }, [breathingActive]);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("zentime_sessions", JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions", e);
    }
  }, [sessions]);

  const handleSelectMinutes = (mins: number) => {
    if (isRunning) return;
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      handleSelectMinutes(mins);
    }
  };

  const startTimer = () => {
    if (startBellEnabled) {
      playBell(selectedBell);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const saveSessionNote = () => {
    const newSession: MeditationSession = {
      id: Date.now().toString(),
      durationMinutes: lastCompletedDuration,
      completedAt: new Date().toISOString(),
      theme: selectedTheme,
      note: postSessionNote.trim() || undefined,
    };
    setSessions([newSession, ...sessions]);
    setShowCompletionModal(false);
    setPostSessionNote("");
  };

  const fetchAiInsight = async (themeName: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/meditation/daily-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeName }),
      });
      const data = await res.json();
      setAiInsight(data);
    } catch (err) {
      console.error(err);
      setAiInsight({
        title: "고요한 내면의 호흡",
        quote: "지금 이 순간, 당신의 숨결 속에 온전한 휴식이 있습니다.",
        guide: "1. 편안한 자세로 눈을 감고, 코로 깊게 숨을 들이쉬며 내쉬는 숨에 모든 긴장을 흘려보내세요."
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsight(selectedTheme);
  }, [selectedTheme]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  const bellOptions: { id: BellType; name: string; desc: string }[] = [
    { id: "singing_bowl", name: "티베탄 싱잉볼", desc: "깊고 은은한 명상의 대표적 울림" },
    { id: "crystal_bowl", name: "크리스탈 싱잉볼", desc: "맑고 순수한 고주파수 공명" },
    { id: "temple_bell", name: "사찰 대종", desc: "묵직하고 엄숙한 깊은 저음의 타종" },
    { id: "wind_chime", name: "맑은 풍경소리", desc: "바람에 흔들리는 영롱한 유리 차임" },
  ];

  return (
    <div className={`${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300 font-sans flex flex-col`}>
      {/* Top Bar Contract */}
      <header className={`flex items-center justify-between gap-8 px-6 py-4 border-b ${darkMode ? "border-slate-800 bg-slate-900/60 backdrop-blur-md" : "border-slate-200 bg-white/80 backdrop-blur-md"} sticky top-0 z-40`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            ZEN
          </div>
          <span className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            ZenTime
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("timer")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === "timer" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          >
            명상 타이머
          </button>
          <button
            onClick={() => setActiveTab("sound")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === "sound" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          >
            종소리 & 사운드
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === "journal" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          >
            명상 기록
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === "ai" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          >
            AI 지혜 가이드
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${darkMode ? "border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
            title="테마 전환"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <div className={`md:hidden flex items-center justify-around px-2 py-2 border-b ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} text-xs font-medium`}>
        <button onClick={() => setActiveTab("timer")} className={`py-1.5 px-3 rounded-lg ${activeTab === "timer" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500"}`}>
          타이머
        </button>
        <button onClick={() => setActiveTab("sound")} className={`py-1.5 px-3 rounded-lg ${activeTab === "sound" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500"}`}>
          종소리/사운드
        </button>
        <button onClick={() => setActiveTab("journal")} className={`py-1.5 px-3 rounded-lg ${activeTab === "journal" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500"}`}>
          기록
        </button>
        <button onClick={() => setActiveTab("ai")} className={`py-1.5 px-3 rounded-lg ${activeTab === "ai" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500"}`}>
          AI 지혜
        </button>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* TAB 1: TIMER */}
        {activeTab === "timer" && (
          <div className="flex flex-col items-center gap-8 py-4">
            <div className="text-center max-w-lg">
              <h1 className="text-3xl font-bold tracking-tight mb-2">마음챙김 명상 시간</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                15분, 30분, 45분 또는 원하는 시간을 선택하여 평온한 명상을 시작하세요.
              </p>
            </div>

            {/* Quick Duration Buttons (15분, 30분, 45분 requested) */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[5, 10, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  disabled={isRunning}
                  onClick={() => handleSelectMinutes(mins)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                    selectedMinutes === mins && !isRunning
                      ? "bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg scale-105"
                      : darkMode
                      ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {mins}분
                </button>
              ))}
            </div>

            {/* Custom Input */}
            {!isRunning && (
              <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="직접 입력"
                  className={`w-24 px-3 py-2 text-sm rounded-xl border text-center ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                <span className="text-sm text-slate-500">분 직접 설정</span>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  적용
                </button>
              </form>
            )}

            {/* Theme Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["마음의 평온", "스트레스 완화", "깊은 수면 준비", "에너지 충전"].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTheme === theme
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : darkMode
                      ? "bg-slate-900/50 text-slate-400 hover:text-slate-200"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            {/* Timer Display Circle */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500">
              <div className={`absolute inset-0 rounded-full border-4 border-dashed ${isRunning ? "animate-[spin_60s_linear_infinite] border-emerald-500/40" : darkMode ? "border-slate-800" : "border-slate-300"}`} />
              
              <div className={`absolute inset-4 rounded-full flex flex-col items-center justify-center p-6 ${darkMode ? "bg-slate-900/90 shadow-inner shadow-emerald-500/10" : "bg-white shadow-xl"}`}>
                <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  {selectedTheme}
                </span>
                <span className="text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums my-2">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-slate-400">
                  {isRunning ? "명상 진행 중..." : isPaused ? "일시정지됨" : "시작을 눌러주세요"}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                >
                  <Play size={20} fill="currentColor" /> 명상 시작
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-base shadow-lg shadow-amber-600/30 transition-transform active:scale-95"
                >
                  <Pause size={20} fill="currentColor" /> 일시정지
                </button>
              )}

              <button
                onClick={resetTimer}
                className={`p-4 rounded-2xl border transition-colors ${darkMode ? "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"}`}
                title="초기화"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SOUND & BELLS */}
        {activeTab === "sound" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            
            {/* Meditation Bell Selection & On/Off Toggles */}
            <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"} flex flex-col gap-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-bold">명상 종소리 설정</h2>
                </div>
                <button
                  onClick={() => playBell(selectedBell)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
                >
                  미리듣기 🔔
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                시작과 종료 시 울릴 명상 종소리의 종류를 선택하고 On/Off를 설정하세요.
              </p>

              {/* Start & End Bell Toggles */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">시작 종소리 (시작할 때 울림)</span>
                  <button
                    onClick={() => setStartBellEnabled(!startBellEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${startBellEnabled ? "bg-emerald-600 justify-end" : "bg-slate-400 dark:bg-slate-700 justify-start"}`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-medium">종료 종소리 (시간 완료 시 울림)</span>
                  <button
                    onClick={() => setEndBellEnabled(!endBellEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${endBellEnabled ? "bg-emerald-600 justify-end" : "bg-slate-400 dark:bg-slate-700 justify-start"}`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>
              </div>

              {/* Bell Type Selector (4 choices) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">종소리 종류 선택</label>
                <div className="grid grid-cols-1 gap-2">
                  {bellOptions.map((bell) => (
                    <button
                      key={bell.id}
                      onClick={() => {
                        setSelectedBell(bell.id);
                        playBell(bell.id);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedBell === bell.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : darkMode
                          ? "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="text-sm">{bell.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{bell.desc}</div>
                      </div>
                      {selectedBell === bell.id && <Check size={18} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ambient Soundscapes & Breathing */}
            <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"} flex flex-col gap-6`}>
              <div className="flex items-center gap-3">
                <Music className="text-emerald-500" size={24} />
                <h2 className="text-xl font-bold">배경 사운드스케이프</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                명상 중 집중을 돕는 편안한 자연의 소리를 함께 재생하세요.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "none", label: "소리 없음", icon: VolumeX },
                  { id: "rain", label: "부드러운 빗소리", icon: Music },
                  { id: "waves", label: "해변 파도소리", icon: Music },
                  { id: "bowl", label: "싱잉볼 백색소음", icon: Music },
                ].map((snd) => (
                  <button
                    key={snd.id}
                    onClick={() => setAmbientSound(snd.id as any)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                      ambientSound === snd.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : darkMode
                        ? "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <snd.icon size={20} />
                    <span className="text-sm">{snd.label}</span>
                  </button>
                ))}
              </div>

              {ambientSound !== "none" && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>배경 소리 볼륨</span>
                    <span>{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="accent-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: JOURNAL & HISTORY */}
        {activeTab === "journal" && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">명상 기록 및 통계</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  꾸준한 명상으로 쌓아온 마음의 기록들을 확인하세요.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-3 rounded-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} flex items-center gap-3`}>
                  <Clock className="text-emerald-500" size={20} />
                  <div>
                    <div className="text-xs text-slate-400">총 명상 시간</div>
                    <div className="text-lg font-bold">{totalMinutes}분</div>
                  </div>
                </div>
                <div className={`px-4 py-3 rounded-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} flex items-center gap-3`}>
                  <Flame className="text-amber-500" size={20} />
                  <div>
                    <div className="text-xs text-slate-400">완료한 세션</div>
                    <div className="text-lg font-bold">{totalSessions}회</div>
                  </div>
                </div>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"} flex flex-col items-center gap-3`}>
                <BookOpen size={40} className="text-slate-400 opacity-50" />
                <p className="font-medium">아직 기록된 명상 세션이 없습니다.</p>
                <p className="text-xs">타이머를 완료하고 첫 번째 명상 기록을 남겨보세요.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{session.theme}</span>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{session.durationMinutes}분 명상</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(session.completedAt).toLocaleDateString()} {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {session.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-100 dark:bg-slate-950/50 p-2 rounded-lg">
                            "{session.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI WISDOM */}
        {activeTab === "ai" && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI 명상 지혜 및 가이드</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                선택한 명상 주제에 맞춘 AI 맞춤형 명상 지혜와 호흡 안내를 제공합니다.
              </p>
            </div>

            <div className={`p-8 rounded-2xl border relative overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} flex flex-col gap-6`}>
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {aiLoading ? (
                <div className="py-16 text-center flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-sm text-slate-400">AI가 오늘의 명상 지혜를 불러오는 중입니다...</p>
                </div>
              ) : aiInsight ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                    <Sparkles size={16} /> AI 데일리 명상 인사이트 ({selectedTheme})
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{aiInsight.title}</h3>
                  <blockquote className="text-base italic text-slate-600 dark:text-slate-300 border-l-2 border-emerald-500 pl-4 py-1">
                    "{aiInsight.quote}"
                  </blockquote>
                  <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">초기 호흡 가이드</h4>
                    <p className="text-sm whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-200">
                      {aiInsight.guide}
                    </p>
                  </div>
                  <button
                    onClick={() => fetchAiInsight(selectedTheme)}
                    className="self-start px-4 py-2 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={14} /> 다른 지혜 새로고침
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-400">지혜를 불러오지 못했습니다.</p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className={`py-6 px-6 text-center text-xs text-slate-500 border-t ${darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white"}`}>
        ZenTime · 평온한 종소리와 함께하는 일상 명상 서비스
      </footer>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"} flex flex-col gap-6 shadow-2xl`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">명상을 완료했습니다</h3>
                <p className="text-xs text-slate-400">{lastCompletedDuration}분 동안 평온함을 유지하셨습니다.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400">명상 소감이나 기록 남기기 (선택)</label>
              <textarea
                value={postSessionNote}
                onChange={(e) => setPostSessionNote(e.target.value)}
                placeholder="오늘 명상 중 느꼈던 감정이나 생각을 적어보세요..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-sm ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={saveSessionNote}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/30"
              >
                기록 저장하고 마치기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
