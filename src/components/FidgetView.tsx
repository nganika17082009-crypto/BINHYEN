import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import {
  playBubblePop,
  playCapPop,
  playSwitchClick,
  playWoodenFishTap,
} from '../utils/audio';

const BUBBLE_COUNT = 16;

const WOODEN_FISH_PHRASES = [
  'Tịnh tâm',
  'Bình an',
  'Thả lỏng',
  'Nhẹ nhàng',
  'An nhiên',
];

interface TapRipple {
  id: number;
  phrase: string;
  xOffset: number;
}

export function FidgetView() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);

  const [capCount, setCapCount] = useState(0);
  const [capBurstId, setCapBurstId] = useState(0);

  const [woodenCount, setWoodenCount] = useState(0);
  const [woodenTapId, setWoodenTapId] = useState(0);
  const [tapRipples, setTapRipples] = useState<TapRipple[]>([]);

  const [poppedBubbles, setPoppedBubbles] = useState<boolean[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, () => false)
  );

  const poppedCount = poppedBubbles.filter(Boolean).length;

  const handleToggleSwitch = () => {
    const next = !isSwitchOn;
    setIsSwitchOn(next);
    setSwitchCount((c) => c + 1);
    playSwitchClick(next);
  };

  const handlePopCap = () => {
    playCapPop();
    setCapCount((c) => c + 1);
    setCapBurstId((id) => id + 1);
  };

  const handleTapWoodenFish = () => {
    playWoodenFishTap();
    const nextCount = woodenCount + 1;
    const nextId = woodenTapId + 1;
    setWoodenCount(nextCount);
    setWoodenTapId(nextId);

    const phrase = WOODEN_FISH_PHRASES[(nextCount - 1) % WOODEN_FISH_PHRASES.length];
    const xOffset = ((nextCount % 3) - 1) * 26;

    setTapRipples((prev) => [...prev.slice(-4), { id: nextId, phrase, xOffset }]);
    window.setTimeout(() => {
      setTapRipples((prev) => prev.filter((item) => item.id !== nextId));
    }, 900);
  };

  const handlePopBubble = (index: number) => {
    if (poppedBubbles[index]) return;
    playBubblePop();
    setPoppedBubbles((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handleResetBubbles = () => {
    setPoppedBubbles(Array.from({ length: BUBBLE_COUNT }, () => false));
  };

  return (
    <section aria-labelledby="fidget-heading" className="space-y-6">
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
        <div className="pb-5 border-b border-[#EDF1EE] flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 id="fidget-heading" className="text-2xl sm:text-[26px] font-semibold text-[#18221E] tracking-tight text-balance">
              Góc bấm nút giải tỏa căng thẳng
            </h2>
            <p className="text-sm text-[#586760] mt-1">
              Đôi khi chỉ cần gõ mõ tĩnh tâm, bật công tắc hay bóp xốp nổ cũng giúp đầu óc nhẹ nhõm hơn giữa giờ học.
            </p>
          </div>
          <span className="text-xs text-[#586760]">
            Bật loa để nghe âm thanh phản hồi chân thực
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 1. Wooden Fish (Gõ mõ tĩnh tâm) */}
          <div className="tactile-weave-bg border border-[#E1E7E3] rounded-2xl p-6 flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-start justify-between gap-2 text-left">
              <div>
                <h3 className="text-base font-semibold text-[#18221E]">Gõ mõ tĩnh tâm</h3>
                <p className="text-xs text-[#586760] mt-1">
                  Chạm đều tay để lắng nghe tiếng mõ gỗ vang ấm
                </p>
              </div>
              {woodenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setWoodenCount(0)}
                  className="text-xs text-[#586760] hover:text-[#18221E] underline underline-offset-4 cursor-pointer shrink-0"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <div className="my-6 flex flex-col items-center relative">
              {/* Floating calm phrases & sound ripples */}
              <div className="pointer-events-none absolute -top-6 inset-x-0 flex justify-center h-10" aria-hidden="true">
                <AnimatePresence>
                  {tapRipples.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      initial={{ opacity: 0.95, y: 12, x: ripple.xOffset, scale: 0.9 }}
                      animate={{ opacity: 0, y: -26, x: ripple.xOffset, scale: 1.04 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.85, ease: 'easeOut' }}
                      className="absolute text-xs font-medium text-[#1D6F5E] whitespace-nowrap"
                    >
                      {ripple.phrase}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={handleTapWoodenFish}
                aria-label="Gõ mõ tĩnh tâm"
                className="relative w-44 h-36 flex items-center justify-center cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D6F5E] rounded-2xl"
              >
                {/* Sound ripple ring on tap */}
                <AnimatePresence>
                  {woodenTapId > 0 && (
                    <motion.span
                      key={woodenTapId}
                      initial={{ scale: 0.75, opacity: 0.55 }}
                      animate={{ scale: 1.35, opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      aria-hidden="true"
                      className="pointer-events-none absolute w-28 h-24 rounded-full border-2 border-[#A66A38]/45"
                    />
                  )}
                </AnimatePresence>

                {/* Carved Wooden Fish SVG + Mallet */}
                <motion.div
                  key={`fish-${woodenTapId}`}
                  initial={woodenTapId > 0 ? { scaleY: 0.92, scaleX: 1.05 } : false}
                  animate={{ scaleY: 1, scaleX: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                  className="relative w-36 h-28"
                >
                  <svg viewBox="0 0 160 124" className="w-full h-full drop-shadow-[0_8px_14px_rgba(92,55,26,0.18)]" aria-hidden="true">
                    {/* Soft resting cushion ring */}
                    <ellipse cx="76" cy="108" rx="48" ry="10" fill="#D9CFC1" stroke="#B7AA98" strokeWidth="1.5" />
                    <ellipse cx="76" cy="104" rx="42" ry="7" fill="#1D6F5E" opacity="0.82" />

                    {/* Wooden Fish Body */}
                    <path
                      d="M30 74 C28 42, 54 24, 82 24 C112 24, 130 44, 128 70 C127 89, 108 102, 78 102 C50 102, 32 92, 30 74 Z"
                      fill="#B87338"
                      stroke="#7D4920"
                      strokeWidth="2.5"
                    />
                    {/* Warm wood top highlight */}
                    <path
                      d="M44 48 C56 32, 86 29, 108 40"
                      fill="none"
                      stroke="#DF9F66"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    {/* Carved sound slit */}
                    <path
                      d="M32 69 C54 73, 82 73, 104 67"
                      fill="none"
                      stroke="#4D2B10"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                    <circle cx="105" cy="66" r="6" fill="#4D2B10" />
                    {/* Decorative carved scale swirl */}
                    <path
                      d="M112 52 C119 52, 122 60, 118 68 C115 74, 109 78, 102 78"
                      fill="none"
                      stroke="#7D4920"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="48" cy="54" r="3.5" fill="#5D3314" />
                  </svg>

                  {/* Articulated Wooden Mallet striking top of the Mõ */}
                  <motion.svg
                    key={`mallet-${woodenTapId}`}
                    viewBox="0 0 80 56"
                    initial={woodenTapId > 0 ? { rotate: -26, y: 12 } : { rotate: 6, y: 0 }}
                    animate={{ rotate: 6, y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                    style={{ originX: '68px', originY: '16px' }}
                    className="pointer-events-none absolute -top-5 -right-5 w-20 h-14 drop-shadow-sm"
                    aria-hidden="true"
                  >
                    <line
                      x1="18"
                      y1="38"
                      x2="70"
                      y2="12"
                      stroke="#6E411C"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                    <circle cx="16" cy="39" r="9.5" fill="#D28B4E" stroke="#6E411C" strokeWidth="2" />
                  </motion.svg>
                </motion.div>
              </button>
            </div>

            <div className="text-xs text-[#586760] font-mono tabular-nums">
              Đã gõ: <span className="font-medium text-[#18221E]">{woodenCount}</span> lần
            </div>
          </div>

          {/* 2. Light Switch */}
          <div
            className={`border rounded-2xl p-6 flex flex-col items-center justify-between text-center transition-colors duration-300 ${
              isSwitchOn
                ? 'bg-[#FCF9EC] border-[#E4D9AE]'
                : 'tactile-weave-bg border-[#E1E7E3]'
            }`}
          >
            <div>
              <h3 className="text-base font-semibold text-[#18221E]">Công tắc điện</h3>
              <p className="text-xs text-[#586760] mt-1">
                Bấm để nghe tiếng &ldquo;tách&rdquo; dứt khoát
              </p>
            </div>

            <div className="my-6 flex flex-col items-center relative">
              <button
                type="button"
                role="switch"
                aria-checked={isSwitchOn}
                aria-label="Bật hoặc tắt công tắc điện"
                onClick={handleToggleSwitch}
                className={`relative w-22 h-34 rounded-2xl p-2.5 flex items-center justify-center transition-colors cursor-pointer shadow-inner focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D6F5E] ${
                  isSwitchOn
                    ? 'bg-[#EAE0B8] border border-[#D4C589]'
                    : 'bg-[#E1E7E3] border border-[#CBD4CE]'
                }`}
              >
                {/* Wallplate screw motifs */}
                <span aria-hidden="true" className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-[#9BA8A1]/70" />
                <span aria-hidden="true" className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#9BA8A1]/70" />

                <motion.div
                  animate={{ y: isSwitchOn ? -7 : 7 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className={`w-13 h-24 rounded-xl flex flex-col items-center justify-between py-3 ${
                    isSwitchOn
                      ? 'bg-[#FFFDF2] shadow-[0_8px_16px_rgba(160,130,30,0.18)]'
                      : 'bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.10)]'
                  }`}
                >
                  <span
                    className={`w-4 h-1 rounded-full transition-colors ${
                      isSwitchOn ? 'bg-[#D69E2E]' : 'bg-[#CBD4CE]'
                    }`}
                  />
                  <span className="text-[11px] font-mono font-medium text-[#4A5952]">
                    {isSwitchOn ? 'BẬT' : 'TẮT'}
                  </span>
                </motion.div>
              </button>
            </div>

            <div className="text-xs text-[#586760] font-mono tabular-nums">
              Đã bấm: <span className="font-medium text-[#18221E]">{switchCount}</span> lần
            </div>
          </div>

          {/* 3. Bottle Cap Pop */}
          <div className="tactile-weave-bg border border-[#E1E7E3] rounded-2xl p-6 flex flex-col items-center justify-between text-center">
            <div>
              <h3 className="text-base font-semibold text-[#18221E]">Bật nắp chai</h3>
              <p className="text-xs text-[#586760] mt-1">
                Cảm giác bật nắp giòn tan, sảng khoái
              </p>
            </div>

            <div className="my-6 flex flex-col items-center relative">
              {/* Rising fizz droplets on pop */}
              <AnimatePresence>
                {capBurstId > 0 && (
                  <motion.div
                    key={capBurstId}
                    className="pointer-events-none absolute -top-4 inset-x-0 flex justify-center"
                    aria-hidden="true"
                  >
                    {[-22, 0, 22].map((xOffset, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0.9, y: 8, x: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -28 - i * 6, x: xOffset, scale: 1.2 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="absolute w-2 h-2 rounded-full bg-[#ED8936]/75"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={handlePopCap}
                whileTap={{ scale: 0.9, rotate: 28 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                className="relative w-28 h-28 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C05621]"
              >
                {/* Crimped crown bottle cap SVG motif */}
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 w-full h-full drop-shadow-[0_10px_18px_rgba(156,66,33,0.26)]"
                  aria-hidden="true"
                >
                  <circle cx="60" cy="60" r="54" fill="#9C4221" />
                  {Array.from({ length: 18 }).map((_, i) => {
                    const angle = (i * 20 * Math.PI) / 180;
                    const cx = 60 + 52 * Math.cos(angle);
                    const cy = 60 + 52 * Math.sin(angle);
                    return <circle key={i} cx={cx} cy={cy} r="5.5" fill="#C05621" />;
                  })}
                  <circle cx="60" cy="60" r="46" fill="#DD6B20" stroke="#FEEBC8" strokeWidth="2.5" strokeDasharray="5 4" />
                  <circle cx="60" cy="60" r="39" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                </svg>
                <span className="relative z-10 text-white font-semibold text-sm tracking-wide">
                  BẬT NẮP
                </span>
              </motion.button>
            </div>

            <div className="text-xs text-[#586760] font-mono tabular-nums">
              Số lần bật: <span className="font-medium text-[#18221E]">{capCount}</span> lần
            </div>
          </div>

          {/* 4. Bubble Wrap */}
          <div className="tactile-weave-bg border border-[#E1E7E3] rounded-2xl p-6 flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-start justify-between gap-2 text-left">
              <div>
                <h3 className="text-base font-semibold text-[#18221E]">Bóp xốp nổ</h3>
                <p className="text-xs text-[#586760] mt-1">
                  {poppedCount === BUBBLE_COUNT
                    ? 'Đã bóp hết! Bấm làm mới để tiếp tục'
                    : 'Bóp hết 16 bóng rồi làm mới lại'}
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#4A5952] pt-0.5">
                {poppedCount}/{BUBBLE_COUNT}
              </span>
            </div>

            <div
              className="grid grid-cols-4 gap-2.5 my-6 p-3 rounded-2xl bg-white/75 border border-[#DCE2DD]"
              role="group"
              aria-label="Vỉ xốp nổ 16 bóng"
            >
              {poppedBubbles.map((isPopped, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handlePopBubble(idx)}
                  whileTap={isPopped ? undefined : { scale: 0.82 }}
                  aria-label={`Bóng số ${idx + 1}: ${isPopped ? 'đã nổ' : 'chưa nổ'}`}
                  aria-pressed={isPopped}
                  className={`w-11 h-11 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B6CB0] ${
                    isPopped
                      ? 'bg-[#E1E7E3] scale-90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.18)] cursor-default'
                      : 'bg-[radial-gradient(circle_at_30%_28%,#ffffff_0%,#BEE3F8_48%,#63B3ED_100%)] shadow-[0_3px_8px_rgba(43,108,176,0.25)] hover:brightness-105'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetBubbles}
              disabled={poppedCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold border border-[#D4DDD8] bg-white text-[#18221E] hover:bg-[#F2F5F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Làm mới vỉ xốp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
