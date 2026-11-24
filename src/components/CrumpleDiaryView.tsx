import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Sparkles, Trash2 } from 'lucide-react';
import { playCrumpleSound, playPaperSlideSound, playTrashLandSound } from '../utils/audio';

const WRITING_PROMPTS = [
  'Hôm nay mình thấy áp lực nhất là chuyện...',
  'Điều khiến mình mệt mỏi mấy ngày qua...',
  'Nếu được nói thật lòng không sợ ai phán xét...',
];

type ThrowStage = 'writing' | 'crumpling' | 'throwing' | 'landed' | 'refreshing';

interface ThrowVector {
  dx: number;
  dy: number;
}

function CrumpledPaperBallSvg() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-16 h-16 drop-shadow-[0_10px_18px_rgba(24,34,30,0.22)]"
      aria-hidden="true"
    >
      {/* Outer crumpled silhouette */}
      <path
        d="M42 7 L58 14 L70 28 L72 47 L61 63 L43 72 L23 68 L11 54 L9 34 L20 17 Z"
        fill="#F6F3E8"
        stroke="#C9C3B2"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Crease facets for 3D paper-ball depth */}
      <path
        d="M42 7 L38 30 L58 14 Z"
        fill="#EAE5D4"
      />
      <path
        d="M38 30 L70 28 L55 46 Z"
        fill="#DDD7C3"
      />
      <path
        d="M11 54 L34 45 L43 72 L23 68 Z"
        fill="#DFD9C5"
      />
      <path
        d="M9 34 L38 30 L34 45 L11 54 Z"
        fill="#EFECE0"
      />
      <path
        d="M34 45 L55 46 L61 63 L43 72 Z"
        fill="#CFC8B2"
      />
      {/* Subtle ink scribbles visible on crumpled folds */}
      <path
        d="M25 26 Q31 24 35 28 M46 37 Q52 34 57 38 M26 52 Q32 50 37 54"
        fill="none"
        stroke="#8B9891"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function ArticulatedTrashBin({
  isOpen,
  isImpact,
}: {
  isOpen: boolean;
  isImpact: boolean;
}) {
  return (
    <motion.div
      animate={
        isImpact
          ? {
              scaleX: [1, 1.12, 0.94, 1.03, 1],
              scaleY: [1, 0.88, 1.07, 0.98, 1],
              rotate: [0, -5, 4, -2, 0],
            }
          : { scaleX: 1, scaleY: 1, rotate: 0 }
      }
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-32 h-36 flex items-end justify-center select-none"
    >
      {/* Subtle shadow on floor */}
      <motion.div
        animate={isImpact ? { scaleX: [1, 1.15, 0.95, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.45 }}
        className="absolute bottom-1 w-24 h-3 rounded-full bg-[#18221E]/10 blur-[2px]"
      />

      <svg viewBox="0 0 120 135" className="w-32 h-36 overflow-visible" aria-hidden="true">
        {/* Articulated Lid */}
        <motion.g
          style={{ originX: '18px', originY: '36px' }}
          animate={
            isOpen
              ? { rotate: -48, y: -6, x: -4 }
              : isImpact
              ? { rotate: [0, -6, 0], y: 0, x: 0 }
              : { rotate: 0, y: 0, x: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: isOpen ? 240 : 420,
            damping: isOpen ? 18 : 22,
          }}
        >
          {/* Handle */}
          <path
            d="M48 22 C48 14, 72 14, 72 22"
            fill="none"
            stroke="#3B4A43"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Lid top plate */}
          <rect
            x="16"
            y="24"
            width="88"
            height="12"
            rx="6"
            fill="#4A5952"
            stroke="#2F3D37"
            strokeWidth="2"
          />
        </motion.g>

        {/* Inner dark rim visible when open */}
        <ellipse
          cx="60"
          cy="38"
          rx="36"
          ry="5"
          fill="#222D28"
          opacity={isOpen ? 0.9 : 0.25}
        />

        {/* Bin Body */}
        <path
          d="M24 40 L96 40 L87 118 C86 123, 82 126, 77 126 L43 126 C38 126, 34 123, 33 118 Z"
          fill="#E8EEEA"
          stroke="#9BA8A1"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vertical tactile ribs */}
        <line x1="42" y1="52" x2="46" y2="114" stroke="#B9C4BD" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="52" x2="60" y2="114" stroke="#B9C4BD" strokeWidth="3" strokeLinecap="round" />
        <line x1="78" y1="52" x2="74" y2="114" stroke="#B9C4BD" strokeWidth="3" strokeLinecap="round" />

        {/* Subtle rim collar */}
        <rect
          x="21"
          y="36"
          width="78"
          height="8"
          rx="4"
          fill="#D4DDD8"
          stroke="#9BA8A1"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  );
}

export function CrumpleDiaryView() {
  const [text, setText] = useState('');
  const [stage, setStage] = useState<ThrowStage>('writing');
  const [discardedCount, setDiscardedCount] = useState(0);
  const [emptyHint, setEmptyHint] = useState(false);
  const [throwVector, setThrowVector] = useState<ThrowVector>({ dx: 320, dy: 40 });
  const [sheetKey, setSheetKey] = useState(0);

  const paperOriginRef = useRef<HTMLDivElement | null>(null);
  const binMouthRef = useRef<HTMLDivElement | null>(null);

  const handleCrumple = () => {
    if (stage !== 'writing') return;

    if (text.trim().length === 0) {
      setEmptyHint(true);
      return;
    }

    setEmptyHint(false);

    // Measure exact distance from paper center to trash bin mouth for parabolic throw
    if (paperOriginRef.current && binMouthRef.current) {
      const originRect = paperOriginRef.current.getBoundingClientRect();
      const targetRect = binMouthRef.current.getBoundingClientRect();
      const originX = originRect.left + originRect.width / 2;
      const originY = originRect.top + originRect.height / 2;
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      setThrowVector({
        dx: targetX - originX,
        dy: targetY - originY,
      });
    }

    // Stage 1 -> 2: Crumple paper into ball
    playCrumpleSound();
    setStage('crumpling');

    // Stage 2 -> 3: Launch ball in parabolic arc toward open bin
    window.setTimeout(() => {
      setStage('throwing');
    }, 520);

    // Stage 3 -> 4: Ball lands inside bin, lid snaps shut, bin wobbles
    window.setTimeout(() => {
      playTrashLandSound();
      setStage('landed');
      setDiscardedCount((c) => c + 1);
    }, 1180);

    // Stage 4 -> 5: Brief calm pause then fresh sheet slides in
    window.setTimeout(() => {
      setText('');
      setSheetKey((k) => k + 1);
      playPaperSlideSound();
      setStage('writing');
    }, 2350);
  };

  const handleInsertPrompt = (prompt: string) => {
    if (stage !== 'writing') return;
    setEmptyHint(false);
    setText((prev) => (prev.trim().length === 0 ? `${prompt} ` : `${prev}\n${prompt} `));
  };

  const isBusy = stage !== 'writing';
  const isBinOpen = stage === 'crumpling' || stage === 'throwing';

  return (
    <section
      aria-labelledby="diary-heading"
      className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
    >
      {/* Left / Paper Writing Desk */}
      <div className="lg:col-span-8 bg-white border border-[#E1E7E3] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#EDF1EE]">
            <div>
              <h2
                id="diary-heading"
                className="text-2xl sm:text-[26px] font-semibold text-[#18221E] tracking-tight text-balance"
              >
                Viết ra &amp; Vứt bỏ muộn phiền
              </h2>
              <p className="text-sm text-[#586760] mt-1">
                Viết hết những áp lực điểm số, chuyện bạn bè hay gia đình vào tờ giấy rồi vò nát ném đi.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#586760]">
              {text.length} ký tự
            </span>
          </div>

          {/* Prompt starters */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#586760]">
            <span>Gợi ý mở đầu:</span>
            {WRITING_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isBusy}
                onClick={() => handleInsertPrompt(prompt)}
                className="underline decoration-[#CBD5CF] underline-offset-4 hover:text-[#1D6F5E] hover:decoration-[#1D6F5E] disabled:opacity-50 transition-colors cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Interactive Paper Stage */}
          <div
            ref={paperOriginRef}
            className="relative mt-5 min-h-[270px] flex items-center justify-center"
          >
            {/* Active Paper Sheet */}
            <AnimatePresence mode="wait">
              {stage === 'writing' && (
                <motion.div
                  key={sheetKey}
                  initial={{ opacity: 0, y: 22, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    scale: 0.16,
                    rotate: -18,
                    borderRadius: '999px',
                    opacity: 0,
                    transition: { duration: 0.42, ease: [0.55, 0.05, 0.68, 0.53] },
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full"
                >
                  {/* Subtle vertical notebook margin line */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 bottom-0 left-10 w-px bg-[#E6B8B8]/55"
                  />
                  {/* Notebook binder punch-hole motif */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-5 bottom-5 left-3 flex flex-col justify-between"
                  >
                    {[0, 1, 2, 3, 4].map((hole) => (
                      <span
                        key={hole}
                        className="w-3 h-3 rounded-full bg-[#EDF1EE] border border-[#D4DDD8] shadow-inner"
                      />
                    ))}
                  </div>
                  {/* Delicate botanical stamp on top-right of sheet */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 64 64"
                    className="pointer-events-none absolute top-3 right-3 w-11 h-11 text-[#1D6F5E]/15"
                  >
                    <path
                      d="M14 50 C22 34, 34 24, 50 14 M28 36 C24 26, 30 20, 36 25 C34 32, 31 35, 28 36 Z M39 24 C39 15, 46 12, 50 17 C47 22, 43 24, 39 24 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                  {/* Subtle folded dog-ear corner */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-tl from-[#E2DFD3] via-[#EFECE2] to-transparent rounded-tl-md"
                  />
                  <textarea
                    aria-label="Nội dung nhật ký giải tỏa"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (emptyHint && e.target.value.trim().length > 0) {
                        setEmptyHint(false);
                      }
                    }}
                    placeholder="Viết bất cứ điều gì đang đè nặng trong lòng bạn..."
                    className="w-full h-64 pl-14 pr-6 py-5 rounded-xl border border-[#DCE2DD] text-[#1F2925] text-[15px] resize-none diary-paper shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/25 focus:border-[#1D6F5E]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crumpling & Flying Paper Ball (overlaps across stage into Trash Bin) */}
            {(stage === 'crumpling' || stage === 'throwing') && (
              <motion.div
                key="flying-ball"
                className="pointer-events-none z-30 absolute flex items-center justify-center"
                initial={{ scale: 0.4, opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={
                  stage === 'crumpling'
                    ? {
                        scale: [0.4, 1.18, 0.94, 1.02],
                        opacity: 1,
                        rotate: [0, -24, 18, -10],
                        x: 0,
                        y: 0,
                      }
                    : {
                        x: [0, throwVector.dx * 0.45, throwVector.dx],
                        y: [0, Math.min(-135, throwVector.dy * 0.5 - 110), throwVector.dy],
                        scale: [1.02, 0.92, 0.42],
                        rotate: [0, 340, 720],
                        opacity: [1, 1, 0.25],
                      }
                }
                transition={
                  stage === 'crumpling'
                    ? { duration: 0.48, ease: [0.16, 1, 0.3, 1] }
                    : { duration: 0.66, ease: [0.22, 0.68, 0.35, 1] }
                }
              >
                <CrumpledPaperBallSvg />
              </motion.div>
            )}

            {/* Calm confirmation state while bin settles */}
            <AnimatePresence>
              {stage === 'landed' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center px-6 py-10"
                >
                  <p className="font-display text-xl font-medium text-[#1D6F5E]">
                    Đã vứt bỏ nhẹ nhàng.
                  </p>
                  <p className="text-sm text-[#586760] mt-1.5">
                    Những suy nghĩ nặng nề vừa rồi không còn ở lại trên trang giấy nữa.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {emptyHint && (
            <p role="status" className="mt-2 text-sm text-[#B7791F]">
              Hãy viết vài dòng tâm sự trước khi vò nát nhé.
            </p>
          )}
        </div>

        <div className="pt-5 mt-5 border-t border-[#EDF1EE] flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 text-xs text-[#586760]">
            <Lock className="w-3.5 h-3.5 text-[#1D6F5E] shrink-0" aria-hidden="true" />
            <span>Không lưu trữ trên máy chủ · Biến mất vĩnh viễn ngay khi vò nát</span>
          </div>

          <button
            type="button"
            onClick={handleCrumple}
            disabled={isBusy}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#C53030] text-white hover:bg-[#9B2C2C] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C53030]"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>
              {stage === 'crumpling'
                ? 'Đang vò nát...'
                : stage === 'throwing'
                ? 'Đang ném đi...'
                : 'Vò nát & Vứt vào thùng rác'}
            </span>
          </button>
        </div>
      </div>

      {/* Right / Articulated Trash Bin Target */}
      <div className="lg:col-span-4 bg-white border border-[#E1E7E3] rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-[0_8px_24px_rgba(24,34,30,0.03)]">
        <div className="w-full pb-4 border-b border-[#EDF1EE] text-left">
          <h3 className="text-base font-semibold text-[#18221E]">Thùng rác muộn phiền</h3>
          <p className="text-xs text-[#586760] mt-0.5">
            {isBinOpen
              ? 'Nắp thùng đã mở — sẵn sàng đón lấy áp lực của bạn.'
              : 'Nghi thức tâm lý giúp não bộ khép lại dòng suy nghĩ tiêu cực.'}
          </p>
        </div>

        <div className="my-8 flex flex-col items-center relative">
          {/* Target anchor positioned at bin mouth */}
          <div
            ref={binMouthRef}
            className="absolute top-7 left-1/2 -translate-x-1/2 w-12 h-6 pointer-events-none"
            aria-hidden="true"
          />

          {/* Subtle relief motes puffing up on landing */}
          <AnimatePresence>
            {stage === 'landed' && (
              <div className="pointer-events-none absolute -top-2 inset-x-0 flex justify-center" aria-hidden="true">
                {[
                  { x: -24, y: -28, delay: 0 },
                  { x: 0, y: -38, delay: 0.05 },
                  { x: 26, y: -26, delay: 0.08 },
                ].map((mote, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0.9, scale: 0.4, x: 0, y: 12 }}
                    animate={{ opacity: 0, scale: 1.1, x: mote.x, y: mote.y }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, delay: mote.delay, ease: 'easeOut' }}
                    className="absolute text-[#1D6F5E]"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <ArticulatedTrashBin isOpen={isBinOpen} isImpact={stage === 'landed'} />

          <div className="mt-4">
            <div className="text-2xl font-mono tabular-nums font-medium text-[#18221E]">
              {discardedCount}
            </div>
            <div className="text-xs text-[#586760] mt-0.5">
              tờ giấy áp lực đã được buông bỏ hôm nay
            </div>
          </div>
        </div>

        <p className="text-xs text-[#586760] leading-relaxed border-t border-[#EDF1EE] pt-4">
          Viết ra giúp gọi tên cảm xúc rõ ràng hơn, còn hành động vò nát và ném đi tạo tín hiệu kết thúc cho sự lo âu.
        </p>
      </div>
    </section>
  );
}
