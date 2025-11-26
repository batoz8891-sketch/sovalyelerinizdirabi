
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [shields, setShields] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number, newLevel: number, totalShields: number) => {
    setScore(prev => prev !== newScore ? newScore : prev);
    setLevel(prev => prev !== newLevel ? newLevel : prev);
    setShields(prev => prev !== totalShields ? totalShields : prev);
  }, []);

  // Handle Music Autoplay
  useEffect(() => {
    const playMusic = () => {
      if (audioRef.current && !musicStarted) {
        audioRef.current.play()
          .then(() => {
            setMusicStarted(true);
          })
          .catch(err => console.log("Audio play failed (waiting for interaction):", err));
      }
    };

    // Try playing immediately
    playMusic();

    // Add listeners to play on first interaction
    const handleInteraction = () => playMusic();
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [musicStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 flex flex-col items-center justify-center p-4 relative">
      
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://ia800605.us.archive.org/8/items/UndertaleOst/077%20-%20ASGORE.mp3"
      />

      {/* Floating Shield Counter (Top Right) */}
      <div className="fixed top-6 right-6 z-50 animate-bounce">
        <div className="bg-yellow-400/90 backdrop-blur-sm px-6 py-3 rounded-xl border-4 border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center gap-3 transform hover:scale-110 transition-transform">
            <span className="text-3xl">🛡️</span>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider">Kalkanlar</span>
                <span className="text-2xl font-black text-yellow-900 leading-none">{shields}/50</span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-7xl bg-slate-900/90 backdrop-blur rounded-3xl p-6 shadow-2xl border-4 border-indigo-900/50">
        
        {/* Header */}
        <header className="text-center mb-6 relative">
          <h1 className="text-5xl md:text-6xl font-bold text-red-600 mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-wide font-mono uppercase">
             ⚔️ Şövalyelerin Izdırabı ⚔️
          </h1>
          <div className="flex justify-center gap-12 text-2xl font-mono mt-4">
            {/* Level Display */}
            <div className="bg-purple-900/80 px-8 py-2 rounded-full border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                <span className="text-purple-300 mr-2">SEVİYE:</span>
                <span className="text-white font-bold text-3xl">{level}</span>
            </div>
          </div>
        </header>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-xl text-center mb-6 border border-slate-600 shadow-inner">
          <p className="font-bold text-yellow-400 text-lg tracking-wide">⚠️ 50 KALKAN TOPLAYARAK KRALLIĞI KURTARIN! ⚠️</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-2 text-sm text-slate-300">
             <p>🚑 <span className="text-green-400">Canlandırma:</span> Ölen arkadaşınızın mezarının yanında 5 saniye bekleyin.</p>
             <p>❤️ <span className="text-pink-400">Birlikte İyileşme:</span> Yan yana durunca saniyede 2 can yenilenir.</p>
             <p>🔥 <span className="text-red-400">Dikkat:</span> Seviye arttıkça büyücünün hasarı artar!</p>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="relative rounded-xl overflow-hidden border-4 border-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.7)] bg-black">
            <GameCanvas onScoreUpdate={handleScoreUpdate} />
        </div>

        {/* Footer Controls */}
        <div className="flex flex-col md:flex-row gap-6 mt-8">
            <div className="flex-1 bg-gradient-to-br from-blue-900 to-blue-950 text-white p-5 rounded-2xl shadow-lg border border-blue-700 transform hover:-translate-y-1 transition-transform group">
                <div className="flex items-center justify-between mb-3 border-b border-blue-800 pb-2">
                    <h3 className="text-xl font-bold text-blue-300 group-hover:text-blue-200">🔵 Mavi Şövalye</h3>
                    <span className="text-xs bg-blue-800 px-2 py-1 rounded text-blue-200">HIZLI</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    <div className="bg-blue-950/50 p-2 rounded border border-blue-900/50"><span className="text-yellow-400 font-bold">W</span> Zıpla</div>
                    <div className="bg-blue-950/50 p-2 rounded border border-blue-900/50"><span className="text-yellow-400 font-bold">A/D</span> Hareket</div>
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-red-900 to-red-950 text-white p-5 rounded-2xl shadow-lg border border-red-700 transform hover:-translate-y-1 transition-transform group">
                <div className="flex items-center justify-between mb-3 border-b border-red-800 pb-2">
                    <h3 className="text-xl font-bold text-red-300 group-hover:text-red-200">🔴 Kırmızı Şövalye</h3>
                    <span className="text-xs bg-red-800 px-2 py-1 rounded text-red-200">ZIPLAYICI</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    <div className="bg-red-950/50 p-2 rounded border border-red-900/50"><span className="text-yellow-400 font-bold">↑</span> Zıpla</div>
                    <div className="bg-red-950/50 p-2 rounded border border-red-900/50"><span className="text-yellow-400 font-bold">←/→</span> Hareket</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
