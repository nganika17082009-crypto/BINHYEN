import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ClipboardList,
  FileText,
  Gamepad2,
  HeartHandshake,
  Leaf,
  Phone,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { BreathingView } from './components/BreathingView';
import { CrumpleDiaryView } from './components/CrumpleDiaryView';
import { FidgetView } from './components/FidgetView';
import { Pss10View } from './components/Pss10View';
import { SupportModal } from './components/SupportModal';
import { ambientEngine, AmbientPreset } from './utils/audio';

type TabId = 'breath' | 'diary' | 'fidget' | 'pss10';

const TABS: Array<{
  id: TabId;
  label: string;
  mobileLabel: string;
  Icon: typeof Wind;
}> = [
  { id: 'breath', label: 'Hít thở & Âm thanh', mobileLabel: 'Hít thở', Icon: Wind },
  { id: 'diary', label: 'Nhật ký vò nát', mobileLabel: 'Nhật ký', Icon: FileText },
  { id: 'fidget', label: 'Nút xả Stress', mobileLabel: 'Xả Stress', Icon: Gamepad2 },
  { id: 'pss10', label: 'Trắc nghiệm PSS-10', mobileLabel: 'PSS-10', Icon: ClipboardList },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('breath');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientPreset, setAmbientPreset] = useState<AmbientPreset>('rain');
  const [ambientVolume, setAmbientVolume] = useState(0.55);
  const [heroImageError, setHeroImageError] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    return () => {
      ambientEngine.stop();
    };
  }, []);

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientEngine.start(ambientPreset, ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleChangePreset = (preset: AmbientPreset) => {
    setAmbientPreset(preset);
    if (isAmbientPlaying) {
      ambientEngine.start(preset, ambientVolume);
    }
  };

  const handleChangeVolume = (volume: number) => {
    setAmbientVolume(volume);
    if (isAmbientPlaying) {
      ambientEngine.setVolume(volume);
    }
  };

  return (
    <div className="min-h-screen flex flex-col botanical-canvas-bg text-[#18221E] pb-20 md:pb-0">
      {/* Top Navigation Bar (3-zone contract) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1E7E3] md:sticky md:top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand title */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('breath');
            }}
            className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#18221E] whitespace-nowrap shrink-0"
          >
            Góc Bình Yên
          </a>

          {/* Zone 2: Clean single-line text nav links */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-6"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D6F5E] ${
                    isActive
                      ? 'text-[#1D6F5E] font-semibold'
                      : 'text-[#586760] hover:text-[#18221E]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D6F5E] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleToggleAmbient}
              aria-pressed={isAmbientPlaying}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E] ${
                isAmbientPlaying
                  ? 'bg-[#EEF5F2] text-[#1D6F5E] border border-[#B8D4C9] hover:bg-[#E1EFE9]'
                  : 'bg-[#1D6F5E] text-white hover:bg-[#175A4C]'
              }`}
            >
              {isAmbientPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Tắt âm thanh</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Bật tiếng mưa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Atmospheric Two-Column Editorial Intro Banner */}
        <div className="mb-7 bg-white border border-[#E1E7E3] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-4 relative overflow-hidden">
            {/* Delicate botanical sprig motif in top-right corner of intro text */}
            <svg
              aria-hidden="true"
              viewBox="0 0 160 110"
              className="pointer-events-none absolute top-0 right-0 w-36 h-24 text-[#1D6F5E]/10"
            >
              <path
                d="M156 4 C126 22, 108 50, 92 84 M128 16 C110 22, 106 36, 117 44 C128 38, 134 25, 128 16 Z M104 46 C88 50, 84 63, 94 70 C105 64, 111 53, 104 46 Z M148 40 C133 47, 131 60, 142 66 C152 60, 155 48, 148 40 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>

            <div className="relative">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#18221E] tracking-tight text-balance leading-tight">
                Không gian chăm sóc tâm lý học đường
              </h1>
              <p className="mt-2.5 text-[15px] text-[#4A5952] leading-relaxed max-w-2xl">
                Dành vài phút tạm rời sách vở để điều hòa nhịp thở, giải tỏa áp lực thi cử và lắng nghe cảm xúc của chính mình.
              </p>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 text-xs text-[#586760] pt-3 border-t border-[#EDF1EE]">
              <span>Dành cho học sinh THPT</span>
              <span aria-hidden="true">·</span>
              <span>Không lưu trữ dữ liệu cá nhân</span>
              <span aria-hidden="true">·</span>
              <span>Hoạt động hoàn toàn trên trình duyệt</span>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 relative min-h-[180px] bg-[#E8EFEA] border-l border-[#EDF1EE]">
            {!heroImageError ? (
              <img
                src="/src/assets/images/serene_study_window_1795518169297.jpg"
                alt="Góc bàn học yên tĩnh bên khung cửa sổ nhìn ra tán lá xanh dưới mưa nhẹ"
                referrerPolicy="no-referrer"
                onError={() => setHeroImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E4EFE9] to-[#D4E6DF] text-[#1D6F5E] p-6">
                <Leaf className="w-8 h-8" aria-hidden="true" />
                <span className="text-xs font-medium">Góc học tập bình yên</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Section with Smooth Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'breath' && (
              <BreathingView
                isAmbientPlaying={isAmbientPlaying}
                ambientPreset={ambientPreset}
                ambientVolume={ambientVolume}
                onToggleAmbient={handleToggleAmbient}
                onChangePreset={handleChangePreset}
                onChangeVolume={handleChangeVolume}
              />
            )}

            {activeTab === 'diary' && <CrumpleDiaryView />}

            {activeTab === 'fidget' && <FidgetView />}

            {activeTab === 'pss10' && <Pss10View onOpenSupport={() => setIsSupportOpen(true)} />}
          </motion.div>
        </AnimatePresence>

        {/* Always-Accessible Psychological Support Strip */}
        <section
          aria-label="Kênh hỗ trợ tâm lý"
          className="mt-8 bg-white border border-[#DCE2DD] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_6px_18px_rgba(24,34,30,0.025)]"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] border border-[#C8DCD4] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#1D6F5E]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-sans text-base font-semibold text-[#18221E]">
                Cần người lắng nghe hoặc hỗ trợ khẩn cấp?
              </h2>
              <p className="text-xs sm:text-sm text-[#586760] mt-0.5">
                Đừng giữ áp lực một mình — kết nối ngay với thầy cô tư vấn tại trường hoặc tổng đài miễn phí 24/7.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold border border-[#B8D4C9] bg-[#EEF5F2] text-[#165B4D] hover:bg-[#E1EFE9] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E]"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Liên hệ Tổ Tư vấn Tâm lý</span>
            </button>

            <a
              href="tel:111"
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#18221E] text-white hover:bg-[#27352F] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18221E]"
            >
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Gọi Tổng đài 111</span>
            </a>
          </div>
        </section>
      </main>

      {/* Quiet Footer with delicate botanical divider flourish */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#DCE2DD] text-xs text-[#586760] flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-[#1D6F5E]" aria-hidden="true" />
          <span>Góc Bình Yên — Công cụ thư giãn &amp; tự chăm sóc tinh thần</span>
        </span>
        <span>Tổng đài Bảo vệ Trẻ em &amp; Học sinh: 111 (Miễn phí, 24/7).</span>
      </footer>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E7E3] grid grid-cols-4 h-16"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-[#1D6F5E] font-semibold' : 'text-[#586760]'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="truncate max-w-[76px]">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
