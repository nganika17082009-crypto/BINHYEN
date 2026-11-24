import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Edit3, Mail, MapPin, Phone, ShieldCheck, X } from 'lucide-react';

export interface SchoolCounselorInfo {
  room: string;
  hours: string;
  teacherName: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = 'gocbinhyen_school_counselor_v1';

const DEFAULT_COUNSELOR: SchoolCounselorInfo = {
  room: 'Phòng Tham vấn Tâm lý học đường (Khu hiệu bộ)',
  hours: 'Thứ 2 – Thứ 6 (Giờ ra chơi & cuối buổi học)',
  teacherName: 'Thầy/Cô phụ trách Tổ Tư vấn Tâm lý',
  phone: '',
  email: '',
};

const SAMPLE_MESSAGE =
  'Em chào thầy/cô Tổ Tư vấn Tâm lý ạ. Gần đây em cảm thấy hơi căng thẳng và áp lực với việc học. Em xin phép được đặt lịch hẹn trao đổi riêng với thầy/cô vào giờ trống sắp tới được không ạ? Em cảm ơn thầy/cô ạ.';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [info, setInfo] = useState<SchoolCounselorInfo>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_COUNSELOR, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_COUNSELOR;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<SchoolCounselorInfo>(info);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copied111, setCopied111] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setInfo(draft);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage write errors
    }
    setIsEditing(false);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_MESSAGE);
      setCopiedMsg(true);
      window.setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // Fallback ignored if clipboard is restricted
    }
  };

  const handleCopy111 = async () => {
    try {
      await navigator.clipboard.writeText('111');
      setCopied111(true);
      window.setTimeout(() => setCopied111(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const cleanPhone = info.phone.replace(/\s+/g, '');

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#18221E]/40 backdrop-blur-xs"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl bg-white border border-[#DCE2DD] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#EDF1EE] flex items-start justify-between gap-4">
              <div>
                <h2 id="support-modal-title" className="text-xl font-semibold text-[#18221E]">
                  Kết nối Tổ Tư vấn Tâm lý &amp; Tổng đài 111
                </h2>
                <p className="text-xs text-[#586760] mt-1">
                  Bạn không phải vượt qua áp lực một mình — luôn có thầy cô và chuyên gia sẵn sàng lắng nghe.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng cửa sổ hỗ trợ"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#586760] hover:bg-[#F2F5F3] hover:text-[#18221E] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* 1. National Helpline 111 Card */}
              <div className="rounded-xl border border-[#C8DCD4] bg-[#F2F8F5] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D6F5E]">
                      <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Tổng đài Quốc gia Bảo vệ Trẻ em &amp; Học sinh</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#18221E] mt-1">
                      Đường dây nóng 111 (Miễn phí 24/7)
                    </h3>
                    <p className="text-xs text-[#4A5952] mt-1 leading-relaxed">
                      Hỗ trợ tư vấn tâm lý, khủng hoảng tinh thần và bảo vệ học sinh hoàn toàn miễn phí cước gọi, bảo mật thông tin.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href="tel:111"
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#1D6F5E] text-white hover:bg-[#175A4C] transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Gọi ngay 111</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy111}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-white border border-[#C8DCD4] text-[#18221E] hover:bg-[#EEF5F2] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied111 ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1D6F5E]" aria-hidden="true" />
                        <span>Đã sao chép số 111</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Sao chép số 111</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. School Counseling Team Card */}
              <div className="rounded-xl border border-[#DCE2DD] bg-[#FAFBF9] p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#18221E]">
                      Tổ Tư vấn Tâm lý của trường
                    </h3>
                    <p className="text-xs text-[#586760] mt-0.5">
                      Bạn có thể lưu lại số điện thoại hoặc email phòng tư vấn trường mình để liên hệ nhanh khi cần.
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(info);
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border border-[#DCE2DD] bg-white text-[#3B4A43] hover:bg-[#F2F5F3] transition-colors cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Cập nhật thông tin trường</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-[#3B4A43] mb-1">
                        Thầy/Cô phụ trách
                      </label>
                      <input
                        type="text"
                        value={draft.teacherName}
                        onChange={(e) => setDraft({ ...draft, teacherName: e.target.value })}
                        placeholder="Ví dụ: Cô Nguyễn Thị Lan"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD4CE] bg-white text-sm text-[#18221E] focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/30"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3B4A43] mb-1">
                          Địa điểm phòng tư vấn
                        </label>
                        <input
                          type="text"
                          value={draft.room}
                          onChange={(e) => setDraft({ ...draft, room: e.target.value })}
                          placeholder="Ví dụ: Phòng B204"
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD4CE] bg-white text-sm text-[#18221E] focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3B4A43] mb-1">
                          Giờ tiếp học sinh
                        </label>
                        <input
                          type="text"
                          value={draft.hours}
                          onChange={(e) => setDraft({ ...draft, hours: e.target.value })}
                          placeholder="Thứ 2 – Thứ 6"
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD4CE] bg-white text-sm text-[#18221E] focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3B4A43] mb-1">
                          Số điện thoại / Zalo
                        </label>
                        <input
                          type="tel"
                          value={draft.phone}
                          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          placeholder="Nhập số điện thoại (nếu có)"
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD4CE] bg-white text-sm text-[#18221E] focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3B4A43] mb-1">
                          Email Tổ Tư vấn
                        </label>
                        <input
                          type="email"
                          value={draft.email}
                          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                          placeholder="tuvan@truong.edu.vn"
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD4CE] bg-white text-sm text-[#18221E] focus:outline-none focus:ring-2 focus:ring-[#1D6F5E]/30"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 min-h-[40px] rounded-xl text-xs font-medium text-[#586760] hover:bg-[#EDF1EE] cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold bg-[#1D6F5E] text-white hover:bg-[#175A4C] cursor-pointer"
                      >
                        Lưu trên thiết bị này
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-[#23302A] space-y-1.5">
                      <p className="font-medium text-[#18221E]">{info.teacherName}</p>
                      <p className="text-xs text-[#4A5952] flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#1D6F5E] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          {info.room} · {info.hours}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-[#18221E] text-white hover:bg-[#27352F] transition-colors whitespace-nowrap"
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Gọi {info.phone}</span>
                        </a>
                      )}

                      {info.email.trim() && (
                        <a
                          href={`mailto:${info.email.trim()}?subject=${encodeURIComponent(
                            'Xin đặt lịch hẹn trao đổi với Tổ Tư vấn Tâm lý'
                          )}&body=${encodeURIComponent(SAMPLE_MESSAGE)}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-white border border-[#CBD4CE] text-[#18221E] hover:bg-[#F2F5F3] transition-colors whitespace-nowrap"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#1D6F5E]" aria-hidden="true" />
                          <span>Gửi email đặt lịch</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-white border border-[#DCE2DD] text-[#3B4A43] hover:bg-[#F2F5F3] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {copiedMsg ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#1D6F5E]" aria-hidden="true" />
                            <span>Đã chép lời nhắn mẫu</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Chép lời nhắn xin hẹn gặp</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ready-to-use message preview */}
                    <div className="rounded-lg bg-white border border-[#E5EBE7] p-3 text-xs text-[#4A5952] leading-relaxed">
                      <span className="block font-medium text-[#18221E] mb-1">
                        Mẫu lời nhắn gợi ý nếu bạn ngại mở lời:
                      </span>
                      &ldquo;{SAMPLE_MESSAGE}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
