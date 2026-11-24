import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Info,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';

type PssFactor = 'helplessness' | 'efficacy';

interface PssQuestion {
  id: number;
  q: string;
  hint: string;
  factor: PssFactor;
  reverse: boolean;
}

const PSS_QUESTIONS: PssQuestion[] = [
  {
    id: 1,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy buồn bực / khó chịu vì một điều gì đó xảy ra bất ngờ?',
    hint: 'Ví dụ: Đột xuất kiểm tra 15 phút, điểm bài thi thấp hơn dự kiến, hoặc hiểu lầm với bạn bè.',
    factor: 'helplessness',
    reverse: false,
  },
  {
    id: 2,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy mình không thể kiểm soát được những điều quan trọng trong cuộc sống?',
    hint: 'Ví dụ: Áp lực chọn tổ hợp môn, định hướng thi đại học, hoặc kỳ vọng từ gia đình.',
    factor: 'helplessness',
    reverse: false,
  },
  {
    id: 3,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy lo lắng và "căng thẳng"?',
    hint: 'Ví dụ: Bồn chồn, tim đập nhanh, khó tập trung khi nghĩ đến bài vở hay thi cử.',
    factor: 'helplessness',
    reverse: false,
  },
  {
    id: 4,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy tự tin về khả năng xử lý các vấn đề cá nhân của mình?',
    hint: 'Ví dụ: Tự tin giải quyết mâu thuẫn với bạn bè hoặc tự lên kế hoạch ôn tập hiệu quả.',
    factor: 'efficacy',
    reverse: true,
  },
  {
    id: 5,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy mọi việc đang diễn ra theo đúng ý muốn của bạn?',
    hint: 'Ví dụ: Tiến độ học tập, điểm số và các mối quan hệ diễn ra suôn sẻ như kế hoạch.',
    factor: 'efficacy',
    reverse: true,
  },
  {
    id: 6,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần thấy rằng mình không thể xoay xở hết tất cả những việc cần phải làm?',
    hint: 'Ví dụ: Bài tập về nhà, học thêm, hoạt động ngoại khóa dồn dập cùng lúc khiến bạn quá tải.',
    factor: 'helplessness',
    reverse: false,
  },
  {
    id: 7,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần có thể kiểm soát được những điều gây bực bội, khó chịu trong cuộc sống của mình?',
    hint: 'Ví dụ: Giữ được bình tĩnh khi gặp sự cố nhỏ ở lớp học hoặc khi bị nhắc nhở.',
    factor: 'efficacy',
    reverse: true,
  },
  {
    id: 8,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy mình đang làm chủ được tình hình?',
    hint: 'Ví dụ: Cảm giác nắm vững kiến thức và chủ động sắp xếp được thời gian biểu của bản thân.',
    factor: 'efficacy',
    reverse: true,
  },
  {
    id: 9,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần tức giận vì những chuyện xảy ra nằm ngoài tầm kiểm soát của bạn?',
    hint: 'Ví dụ: Bực bội vì thay đổi lịch thi, thời tiết xấu, hoặc hành xử của người khác ảnh hưởng đến mình.',
    factor: 'helplessness',
    reverse: false,
  },
  {
    id: 10,
    q: 'Trong tháng vừa qua, bạn có bao nhiêu lần cảm thấy khó khăn chồng chất nhiều đến mức bạn không thể vượt qua được?',
    hint: 'Ví dụ: Cảm giác bế tắc, muốn bỏ cuộc trước khối lượng kiến thức hoặc áp lực thi cử.',
    factor: 'helplessness',
    reverse: false,
  },
];

const OPTIONS = [
  { label: '0 - Không bao giờ', value: 0 },
  { label: '1 - Hầu như không', value: 1 },
  { label: '2 - Thỉnh thoảng', value: 2 },
  { label: '3 - Khá thường xuyên', value: 3 },
  { label: '4 - Rất thường xuyên', value: 4 },
];

interface EvaluationResult {
  totalScore: number;
  helplessnessScore: number;
  lackOfEfficacyScore: number;
  level: string;
  advice: string;
  tone: 'low' | 'medium' | 'high';
}

export function Pss10View() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [missingId, setMissingId] = useState<number | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const questionRefs = useRef<Record<number, HTMLFieldSetElement | null>>({});
  const resultRef = useRef<HTMLDivElement | null>(null);

  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (missingId === questionId) {
      setMissingId(null);
    }
    if (result) {
      setResult(null);
    }
  };

  const handleCalculate = () => {
    const firstMissing = PSS_QUESTIONS.find((q) => answers[q.id] === undefined);
    if (firstMissing) {
      setMissingId(firstMissing.id);
      questionRefs.current[firstMissing.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    let totalScore = 0;
    let helplessnessScore = 0; // Nhân tố 1: Cảm nhận bất lực / Quá tải (0–24đ)
    let lackOfEfficacyScore = 0; // Nhân tố 2: Thiếu tự chủ / Ứng phó (0–16đ)

    for (const q of PSS_QUESTIONS) {
      const raw = answers[q.id];
      const finalVal = q.reverse ? 4 - raw : raw;
      totalScore += finalVal;
      if (q.factor === 'helplessness') {
        helplessnessScore += finalVal;
      } else {
        lackOfEfficacyScore += finalVal;
      }
    }

    let evaluation: EvaluationResult;
    if (totalScore <= 13) {
      evaluation = {
        totalScore,
        helplessnessScore,
        lackOfEfficacyScore,
        level: 'Mức độ căng thẳng THẤP (0 – 13 điểm)',
        advice:
          'Bạn đang thích nghi rất tốt với nhịp độ học tập THPT. Các yếu tố gây áp lực chưa làm ảnh hưởng đáng kể đến sự cân bằng cảm xúc của bạn. Hãy tiếp tục duy trì lịch sinh hoạt điều độ và ngủ đủ 7–8 tiếng mỗi ngày.',
        tone: 'low',
      };
    } else if (totalScore <= 26) {
      evaluation = {
        totalScore,
        helplessnessScore,
        lackOfEfficacyScore,
        level: 'Mức độ căng thẳng TRUNG BÌNH (14 – 26 điểm)',
        advice:
          'Bạn đang trải qua mức độ căng thẳng phổ biến ở lứa tuổi học sinh trước các kỳ thi hoặc áp lực kỳ vọng. Hãy thử áp dụng kỹ thuật hít thở 4-7-8, chia nhỏ bài tập theo phương pháp Pomodoro (25 phút học – 5 phút nghỉ) và chia sẻ cảm xúc với bạn bè hoặc gia đình.',
        tone: 'medium',
      };
    } else {
      evaluation = {
        totalScore,
        helplessnessScore,
        lackOfEfficacyScore,
        level: 'Mức độ căng thẳng CAO (27 – 40 điểm)',
        advice:
          'Bạn đang chịu mức độ quá tải tâm lý khá lớn. Cảm giác mất kiểm soát và kiệt sức có thể ảnh hưởng trực tiếp đến trí nhớ và sức khỏe thể chất. Bạn nên tạm giảm bớt các mục tiêu không quá cấp bách và tìm đến thầy cô phòng Tham vấn Tâm lý học đường hoặc người thân đáng tin cậy để được hỗ trợ.',
        tone: 'high',
      };
    }

    setMissingId(null);
    setResult(evaluation);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  const handleReset = () => {
    setAnswers({});
    setMissingId(null);
    setResult(null);
  };

  const toneStyles = {
    low: {
      container: 'bg-[#EEF6F3] border-[#B6D7CA]',
      title: 'text-[#165B4D]',
      bar: 'bg-[#1D6F5E]',
      Icon: CheckCircle2,
    },
    medium: {
      container: 'bg-[#FCF8E8] border-[#E4D39B]',
      title: 'text-[#8C5E0B]',
      bar: 'bg-[#C48B16]',
      Icon: Info,
    },
    high: {
      container: 'bg-[#FDF1F1] border-[#E7BABA]',
      title: 'text-[#9B2C2C]',
      bar: 'bg-[#C53030]',
      Icon: AlertCircle,
    },
  };

  return (
    <section
      aria-labelledby="pss-heading"
      className="relative bg-white border border-[#E1E7E3] rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(24,34,30,0.03)] overflow-hidden"
    >
      {/* Delicate botanical corner flourish */}
      <svg
        aria-hidden="true"
        viewBox="0 0 180 120"
        className="pointer-events-none absolute top-0 right-0 w-44 h-28 text-[#1D6F5E]/10"
      >
        <path
          d="M180 0 C145 18, 125 46, 105 78 M142 12 C122 20, 118 35, 128 45 C140 38, 148 24, 142 12 Z M118 44 C100 50, 96 64, 107 72 C118 66, 125 53, 118 44 Z M165 36 C148 45, 146 58, 158 64 C168 58, 172 46, 165 36 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>

      <div className="relative pb-5 border-b border-[#EDF1EE] flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 id="pss-heading" className="text-2xl sm:text-[26px] font-semibold text-[#18221E] tracking-tight text-balance">
            Thang đo Căng thẳng Cảm nhận (PSS-10)
          </h2>
          <p className="text-sm text-[#586760] mt-1">
            Đánh giá mức độ căng thẳng cảm nhận theo ngữ cảnh học sinh THPT Việt Nam.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-[#586760] shrink-0">
          Đã hoàn thành: <span className="font-semibold text-[#18221E]">{answeredCount}</span> / 10 câu
        </div>
      </div>

      {/* Scientific Basis Info Block */}
      <div className="mt-5 rounded-xl border border-[#C6DCEC] bg-[#F2F8FC] p-4 sm:p-5 flex items-start gap-3.5 text-sm text-[#23394D]">
        <BookOpen className="w-5 h-5 text-[#2B6CB0] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-[#182B3A]">Cơ sở khoa học:</strong> Thang đo{' '}
          <em>Perceived Stress Scale (PSS-10)</em> được xây dựng bởi{' '}
          <strong>Cohen, Kamarck &amp; Mermelstein (1983)</strong> và chuẩn hóa tiếng Việt (V-PSS-10) bởi{' '}
          <strong>Dao-Tran và cộng sự (2017)</strong>. Các câu hỏi khảo sát cảm nhận của bạn trong{' '}
          <strong>1 tháng vừa qua</strong> (không phải chỉ riêng hôm nay).
        </p>
      </div>

      {/* Slim completion bar */}
      <div className="w-full h-1.5 bg-[#EDF1EE] rounded-full overflow-hidden mt-5" aria-hidden="true">
        <div
          className="h-full bg-[#1D6F5E] transition-[width] duration-300 ease-out"
          style={{ width: `${(answeredCount / PSS_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Questions List */}
      <div className="divide-y divide-[#EDF1EE] mt-4">
        {PSS_QUESTIONS.map((item) => {
          const isMissing = missingId === item.id;
          const isAnswered = answers[item.id] !== undefined;
          return (
            <fieldset
              key={item.id}
              ref={(el) => {
                questionRefs.current[item.id] = el;
              }}
              className={`py-6 rounded-xl transition-colors ${
                isMissing ? 'bg-[#FDF1F1] px-4 -mx-4' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`font-mono tabular-nums text-xs font-semibold px-2 py-1 rounded-md shrink-0 mt-0.5 border ${
                    isAnswered
                      ? 'bg-[#EEF5F2] border-[#B8D4C9] text-[#1D6F5E]'
                      : 'bg-[#F8FAF9] border-[#DCE2DD] text-[#586760]'
                  }`}
                >
                  {String(item.id).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <legend className="text-[15px] font-semibold text-[#18221E] leading-snug">
                    {item.q}
                  </legend>
                  <p className="mt-1.5 text-[13px] text-[#586760] italic flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item.hint}</span>
                  </p>
                </div>
              </div>

              {isMissing && (
                <p className="text-xs font-medium text-[#C53030] mt-3 ml-10 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Bạn vui lòng chọn mức độ cho câu hỏi số {item.id} để có kết quả chính xác nhé!</span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4 sm:ml-10">
                {OPTIONS.map((opt) => {
                  const isChecked = answers[item.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`min-h-[44px] px-2.5 py-2.5 rounded-xl border text-center text-xs sm:text-[13px] font-medium flex items-center justify-center cursor-pointer transition-colors select-none ${
                        isChecked
                          ? 'bg-[#EEF5F2] border-[#1D6F5E] text-[#165B4D] font-semibold shadow-xs'
                          : 'bg-[#F8FAF9] border-[#DCE2DD] text-[#3B4A43] hover:bg-[#F1F5F3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pss-q-${item.id}`}
                        value={opt.value}
                        checked={isChecked}
                        onChange={() => handleSelect(item.id, opt.value)}
                        className="sr-only"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-[#EDF1EE] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCalculate}
            className="flex-1 sm:flex-none px-6 py-3 min-h-[46px] rounded-xl text-sm font-semibold bg-[#1D6F5E] text-white hover:bg-[#175A4C] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6F5E]"
          >
            Phân tích kết quả chi tiết
          </button>

          {(answeredCount > 0 || result) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[46px] rounded-xl text-sm font-medium border border-[#D4DDD8] text-[#3B4A43] hover:bg-[#F4F7F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Làm lại</span>
            </button>
          )}
        </div>

        <span className="text-xs text-[#586760]">
          Mô hình 2 nhân tố · Câu 4, 5, 7, 8 tính điểm ngược theo chuẩn V-PSS-10
        </span>
      </div>

      {/* Detailed 2-Factor Result Card */}
      {result && (
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-live="polite"
          className={`mt-6 rounded-2xl border p-6 sm:p-7 ${toneStyles[result.tone].container}`}
        >
          {(() => {
            const { Icon, title, bar } = toneStyles[result.tone];
            return (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[#586760] mb-1">
                      Tổng điểm PSS-10
                    </div>
                    <div className={`inline-flex items-center gap-2 text-lg font-semibold ${title}`}>
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{result.level}</span>
                    </div>
                  </div>
                  <div className="font-mono tabular-nums text-2xl font-semibold text-[#18221E]">
                    {result.totalScore} / 40 <span className="text-sm font-normal text-[#586760]">điểm</span>
                  </div>
                </div>

                {/* Overall Score Scale Gauge */}
                <div>
                  <div className="w-full h-2.5 bg-white/85 rounded-full overflow-hidden border border-black/5">
                    <div
                      className={`h-full ${bar} transition-[width] duration-500 ease-out`}
                      style={{ width: `${(result.totalScore / 40) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#586760] mt-1.5">
                    <span>0 – 13 (Thấp)</span>
                    <span>14 – 26 (Trung bình)</span>
                    <span>27 – 40 (Cao)</span>
                  </div>
                </div>

                <p className="text-sm text-[#23302A] leading-relaxed">
                  {result.advice}
                </p>

                {/* 2-Factor Breakdown */}
                <div className="bg-white/80 border border-black/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#18221E]">
                    Phân tích chi tiết 2 khía cạnh tâm lý (theo mô hình 2 nhân tố)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Factor 1: Perceived Helplessness */}
                    <div className="rounded-lg border border-[#E1E7E3] bg-white p-4 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-[#18221E]">
                          1. Cảm nhận quá tải &amp; bất lực
                        </span>
                        <span className="font-mono tabular-nums text-xs font-semibold text-[#18221E]">
                          {result.helplessnessScore} / 24đ
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDF1EE] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            result.helplessnessScore >= 15 ? 'bg-[#C53030]' : 'bg-[#1D6F5E]'
                          }`}
                          style={{ width: `${(result.helplessnessScore / 24) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#4A5952] leading-relaxed">
                        {result.helplessnessScore >= 15 ? (
                          <>
                            <strong className="text-[#9B2C2C]">Mức cao:</strong> Bạn đang dễ bị tác động mạnh bởi các sự kiện bất ngờ và khối lượng bài vở dồn dập.
                          </>
                        ) : (
                          <>
                            <strong className="text-[#165B4D]">Mức kiểm soát được:</strong> Bạn chưa bị choáng ngợp quá mức bởi các tình huống bất ngờ.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Factor 2: Lack of Self-Efficacy */}
                    <div className="rounded-lg border border-[#E1E7E3] bg-white p-4 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-[#18221E]">
                          2. Khả năng tự ứng phó tích cực
                        </span>
                        <span className="font-mono tabular-nums text-xs font-semibold text-[#18221E]">
                          {result.lackOfEfficacyScore} / 16đ
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDF1EE] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            result.lackOfEfficacyScore >= 10 ? 'bg-[#C48B16]' : 'bg-[#1D6F5E]'
                          }`}
                          style={{ width: `${(result.lackOfEfficacyScore / 16) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#4A5952] leading-relaxed">
                        {result.lackOfEfficacyScore >= 10 ? (
                          <>
                            <strong className="text-[#8C5E0B]">Đang suy giảm:</strong> Bạn đang cảm thấy thiếu tự tin vào khả năng tự giải quyết vấn đề và làm chủ kế hoạch cá nhân.
                          </>
                        ) : (
                          <>
                            <strong className="text-[#165B4D]">Mức tích cực tốt:</strong> Bạn vẫn giữ được sự tự tin và chủ động nhất định khi đối mặt với rắc rối.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Professional Disclaimer */}
      <p className="mt-6 text-xs text-[#586760] leading-relaxed">
        * Lưu ý chuyên môn: PSS-10 là công cụ sàng lọc mức độ căng thẳng cảm nhận chủ quan, không dùng để chẩn đoán bệnh lý tâm thần. Nếu điểm số ở mức cao kéo dài trên 2 tuần kèm mất ngủ, chán ăn hoặc suy nghĩ tiêu cực, bạn nên trao đổi trực tiếp với Chuyên viên Tham vấn Tâm lý học đường tại trường hoặc bác sĩ chuyên khoa.
      </p>
    </section>
  );
}
