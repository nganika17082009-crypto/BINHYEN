import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, CloudRain, Play, RotateCcw, Square, Volume2, Waves } from 'lucide-react';
import { AmbientPreset, playBreathChime } from '../utils/audio';

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingViewProps {
  isAmbientPlaying: boolean;
  ambientPreset: AmbientPreset;
  ambientVolume: number;
  onToggleAmbient: () => void;
  onChangePreset: (preset: AmbientPreset) => void;
  onChangeVolume: (volume: number) => void;
}

const PHASE_DURATIONS: Record<Exclude<BreathPhase, 'idle'>, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const PHASE_COPY: Record<
  BreathPhase,
  {
    title: string;
    subtitle: string;
    coreBg: string;
    coreText: string;
    haloBg: string;
    ringColor: string;
    scale: number;
    duration: number;
  }
> = {
  idle: {
    title: 'Sẵn sàng',
    subtitle: 'Thả lỏng vai, đặt chân chạm sàn và nhấn bắt đầu khi bạn sẵn sàng.',
    coreBg: '#E3EDE8',
    coreText: '#1D6F5E',
    haloBg: 'rgba(29, 111, 94, 0.08)',
    ringColor: '#1D6F5E',
    scale: 1,
    duration: 0.5,
  },
  inhale: {
    title: 'Hít vào',
    subtitle: 'Hít vào nhẹ nhàng bằng mũi trong 4 giây, cảm nhận bụng phồng lên.',
    coreBg: '#D4E6F4',
    coreText: '#1E4E79',
    haloBg: 'rgba(43, 108, 176, 0.14)',
    ringColor: '#2B6CB0',
    scale: 1.32,
    duration: 4,
  },
  hold: {
    title: 'Giữ hơi',
    subtitle: 'Giữ nhịp thở êm ái trong 7 giây, giữ cơ mặt và hàm thư giãn.',
    coreBg: '#CFECE2',
    coreText: '#165B4D',
    haloBg: 'rgba(29, 111, 94, 0.16)',
    ringColor: '#1D6F5E',
    scale: 1.32,
    duration: 0.6,
  },
  exhale: {
    title: 'Thở ra chậm',
    subtitle: 'Thở ra từ từ qua miệng trong 8 giây, thả trôi mọi căng thẳng.',
    coreBg: '#E6EFEA',
    coreText: '#285E52',
    haloBg: 'rgba(59, 122, 107, 0.10)',
    ringColor: '#3B7A6B',
    scale: 1,
    duration: 8,
  },
};

export function BreathingView({
  isAmbientPlaying,
  ambientPreset,
  ambientVolume,
  onToggleAmbient,
  onChangePreset,
  onChangeVolume,
}: BreathingViewProps) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(true);
  const chimeRef = useRef(chimeEnabled);
  chimeRef.current = chimeEnabled;

  useEffect(() => {
    if (phase === 'idle') {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }
        setPhase((currentPhase) => {
          let nextPhase: Exclude<BreathPhase, 'idle'> = 'inhale';
          if (currentPhase === 'inhale') {
            nextPhase = 'hold';
          } else if (currentPhase === 'hold') {
            nextPhase = 'exhale';
          } else if (currentPhase === 'exhale') {
            nextPhase = 'inhale';
            setCyclesCompleted((c) => c + 1);
          }
          if (chimeRef.current) {
            playBreathChime(nextPhase);
          }
          setSecondsLeft(PHASE_DURATIONS[nextPhase]);
          return nextPhase;
        });
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  const handleToggleBreathing = () => {
    if (phase === 'idle') {
      setPhase('inhale');
      setSecondsLeft(PHASE_DURATIONS.inhale);
      if (chimeEnabled) {
        playBreathChime('inhale');
      }
    } else {
      setPhase('idle');
      setSecondsLeft(0);
    }
  };

  const handleReset = () => {
    setPhase('idle');
    setSecondsLeft(0);
    setCyclesCompleted(0);
  };

  const currentCopy = PHASE_COPY[phase];
  const phaseTotal = phase === 'idle' ? 1 : PHASE_DURATIONS[phase];
  const progressRatio = phase === 'idle' ? 0 : (phaseTotal - secondsLeft + 1) / phaseTotal;
  const ringRadius = 118;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  return (
    <section aria-labelledby="breathing-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left / Main Interactive Breathing Stage */}
      <div className="relative overflow-hidden lg:col-span-7 bg-white border border-[#E1E7E3] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
        {/* Delicate corner ripple motif */}
        <svg
          aria-hidden="true"
          viewBox="0 0 180 180"
          className="pointer-events-none absolute -bottom-8 -left-8 w-44 h-44 text-[#1D6F5E]/[0.06]"
        >
          <circle cx="90" cy="90" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="90" cy="90" r="54" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 6" />
          <circle cx="90" cy="90" r="76" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#EDF1EE]">
            <div>
              <h2 id="breathing-heading" className="text-2xl sm:text-[26px] font-semibold text-[#18221E] tracking-tight text-balance">
                Bài tập hít thở 4-7-8
              </h2>
              <p className="text-sm text-[#586760] mt-1">
                Kỹ thuật điều hòa hệ thần kinh giúp hạ nhịp tim trước giờ kiểm tra.
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#586760]">
              Chu kỳ đã tập: <span className="font-medium text-[#18221E]">{cyclesCompleted}</span>
            </div>
          </div>
        </div>

        {/* Breathing Visualizer Stage */}
        <div className="relative py-10 sm:py-12 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Outer expanding botanical aura */}
            <motion.div
              aria-hidden="true"
              animate={{
                scale: currentCopy.scale * 1.12,
                backgroundColor: currentCopy.haloBg,
              }}
              transition={{ duration: currentCopy.duration, ease: 'easeInOut' }}
              className="absolute w-48 h-48 rounded-full pointer-events-none"
            />

            {/* Progress Arc & Ornamental Compass Ticks SVG */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 260 260"
              aria-hidden="true"
            >
              {/* Outer dashed compass ring */}
              <circle
                cx="130"
                cy="130"
                r={125}
                fill="none"
                stroke="#DCE6E0"
                strokeWidth="1.2"
                strokeDasharray="2 7"
              />
              {/* 4 Cardinal botanical leaf ticks */}
              {[0, 90, 180, 270].map((angle) => (
                <circle
                  key={angle}
                  cx={130 + 125 * Math.cos((angle * Math.PI) / 180)}
                  cy={130 + 125 * Math.sin((angle * Math.PI) / 180)}
                  r="2.5"
                  fill="#9CB8AD"
                />
              ))}
              <circle
                cx="130"
                cy="130"
                r={ringRadius}
                fill="none"
                stroke="#E8EEEA"
                strokeWidth="3"
              />
              {phase !== 'idle' && (
                <circle
                  cx="130"
                  cy="130"
                  r={ringRadius}
                  fill="none"
                  stroke={currentCopy.ringColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-1000 linear"
                />
              )}
            </svg>

            {/* Primary Breathing Core */}
            <motion.div
              animate={{
                scale: currentCopy.scale,
                backgroundColor: currentCopy.coreBg,
                color: currentCopy.coreText,
              }}
              transition={{ duration: currentCopy.duration, ease: 'easeInOut' }}
              className="w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-center select-none shadow-[0_10px_30px_rgba(29,111,94,0.12)] border border-white/60"
            >
              <span className="text-lg sm:text-xl font-semibold tracking-tight">
                {currentCopy.title}
              </span>
              {phase !== 'idle' ? (
                <span className="font-mono tabular-nums text-3xl font-medium mt-1">
                  {secondsLeft}s
                </span>
              ) : (
                <span className="text-xs mt-1 opacity-80 font-mono">4 · 7 · 8</span>
              )}
            </motion.div>
          </div>

          <p className="mt-6 text-center text-sm text-[#4A5952] max-w-md min-h-[2.5rem]">
            {currentCopy.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-5 border-t border-[#EDF1EE] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleBreathing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E] ${
                phase === 'idle'
                  ? 'bg-[#1D6F5E] text-white hover:bg-[#175A4C]'
                  : 'bg-[#C53030] text-white hover:bg-[#9B2C2C]'
              }`}
            >
              {phase === 'idle' ? (
                <>
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>Bắt đầu hít thở</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" aria-hidden="true" />
                  <span>Dừng lại</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={phase === 'idle' && cyclesCompleted === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium border border-[#D4DDD8] text-[#3B4A43] hover:bg-[#F4F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Đặt lại</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setChimeEnabled((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium text-[#4A5952] hover:bg-[#F4F7F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E]"
            aria-pressed={chimeEnabled}
          >
            {chimeEnabled ? (
              <Bell className="w-4 h-4 text-[#1D6F5E]" aria-hidden="true" />
            ) : (
              <BellOff className="w-4 h-4 text-[#718079]" aria-hidden="true" />
            )}
            <span>Chuông chuyển nhịp: {chimeEnabled ? 'Bật' : 'Tắt'}</span>
          </button>
        </div>
      </div>

      {/* Right Control Deck */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Ambient Sound Panel */}
        <div className="bg-white border border-[#E1E7E3] rounded-2xl p-6 shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EDF1EE]">
            <div>
              <h3 className="text-lg font-semibold text-[#18221E]">Âm thanh trắng thư giãn</h3>
              <p className="text-sm text-[#586760] mt-0.5">
                Che lấp tiếng ồn xung quanh khi ôn bài hoặc nhắm mắt nghỉ ngơi.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <span className="block text-xs font-medium text-[#586760] mb-2">
                Chọn không gian âm thanh
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F5F3] rounded-xl">
                <button
                  type="button"
                  onClick={() => onChangePreset('rain')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    ambientPreset === 'rain'
                      ? 'bg-white text-[#18221E] shadow-xs'
                      : 'text-[#586760] hover:text-[#18221E]'
                  }`}
                >
                  <CloudRain className="w-4 h-4 text-[#2B6CB0]" aria-hidden="true" />
                  <span>Mưa rơi nhẹ</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangePreset('ocean')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    ambientPreset === 'ocean'
                      ? 'bg-white text-[#18221E] shadow-xs'
                      : 'text-[#586760] hover:text-[#18221E]'
                  }`}
                >
                  <Waves className="w-4 h-4 text-[#1D6F5E]" aria-hidden="true" />
                  <span>Sóng biển dịu</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#4A5952] mb-2">
                <label htmlFor="ambient-volume" className="inline-flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#586760]" aria-hidden="true" />
                  <span>Âm lượng</span>
                </label>
                <span className="font-mono tabular-nums text-[#18221E]">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
              <input
                id="ambient-volume"
                type="range"
                min={0}
                max={100}
                value={Math.round(ambientVolume * 100)}
                onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
                className="w-full h-2 bg-[#E2E8E4] rounded-lg appearance-none cursor-pointer accent-[#1D6F5E]"
              />
            </div>

            <button
              type="button"
              onClick={onToggleAmbient}
              className={`w-full py-3 px-4 min-h-[44px] rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E] ${
                isAmbientPlaying
                  ? 'bg-[#EEF5F2] text-[#1D6F5E] border border-[#B8D4C9] hover:bg-[#E1EFE9]'
                  : 'bg-[#18221E] text-white hover:bg-[#27352F]'
              }`}
            >
              <span>{isAmbientPlaying ? 'Tắt âm thanh trắng' : 'Bật âm thanh trắng'}</span>
            </button>
          </div>
        </div>

        {/* Concise 3-step guide */}
        <div className="bg-white border border-[#E1E7E3] rounded-2xl p-6 flex-1 shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
          <h3 className="text-base font-semibold text-[#18221E] mb-3">
            Nhịp 4-7-8 hoạt động như thế nào?
          </h3>
          <ol className="space-y-3 text-sm text-[#4A5952]">
            <li className="flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-xs font-semibold text-[#2B6CB0] shrink-0">
                01.
              </span>
              <span>
                <strong className="text-[#18221E]">4 giây hít vào:</strong> Nạp đủ oxy, đánh thức sự tập trung bình tĩnh.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-xs font-semibold text-[#1D6F5E] shrink-0">
                02.
              </span>
              <span>
                <strong className="text-[#18221E]">7 giây giữ hơi:</strong> Giúp nhịp tim chậm lại một cách tự nhiên.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-xs font-semibold text-[#3B7A6B] shrink-0">
                03.
              </span>
              <span>
                <strong className="text-[#18221E]">8 giây thở ra:</strong> Kích hoạt phản xạ thư giãn, giảm cảm giác hồi hộp trước kỳ thi.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
