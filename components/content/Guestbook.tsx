'use client';

import { FormEvent, useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string | null;
};

const COLLECTION = 'guestbook_entries';
const COOLDOWN_KEY = 'wedding-guestbook-last-submit';
const INVITE_CODE_RE = /^[a-zA-Z0-9_-]{1,32}$/;

function formatDate(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(value));
}

function readInviteCode() {
  const code = new URLSearchParams(window.location.search).get('invite')?.trim();
  return code && INVITE_CODE_RE.test(code) ? code : 'direct';
}

function GuestbookCard({ entry }: { entry: GuestbookEntry }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white/50 px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-stone-700">{entry.name}</p>
        <time className="shrink-0 text-[11px] text-stone-400">{formatDate(entry.createdAt)}</time>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-stone-600">{entry.message}</p>
    </article>
  );
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const visibleEntries = entries.slice(0, 4);
  const hiddenEntries = entries.slice(4);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const guestbookQuery = query(collection(db, COLLECTION));
    return onSnapshot(
      guestbookQuery,
      (snapshot) => {
        const nextEntries = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
            return {
              id: doc.id,
              name: String(data.name ?? ''),
              message: String(data.message ?? ''),
              createdAt,
            };
          })
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
          .slice(0, 30);
        setEntries(nextEntries);
        setLoading(false);
      },
      () => {
        setStatus('방명록을 불러오지 못했습니다.');
        setLoading(false);
      },
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db || sending) return;
    if (trap) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
      setStatus('이름과 메시지를 모두 입력해 주세요.');
      return;
    }

    const lastSubmit = Number(window.localStorage.getItem(COOLDOWN_KEY) ?? 0);
    if (Date.now() - lastSubmit < 10000) {
      setStatus('잠시 후 다시 남겨 주세요.');
      return;
    }

    setSending(true);
    setStatus('');
    try {
      await addDoc(collection(db, COLLECTION), {
        name: trimmedName.slice(0, 12),
        message: trimmedMessage.slice(0, 150),
        inviteCode: readInviteCode(),
        createdAt: serverTimestamp(),
      });
      window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      setName('');
      setMessage('');
      setStatus('소중한 마음이 남겨졌습니다.');
    } catch {
      setStatus('등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="px-6 md:px-12 py-12 md:py-16 bg-[#FDFAF5]">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px w-12 bg-stone-300/50" />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4" />
        </svg>
        <div className="h-px w-12 bg-stone-300/50" />
      </div>

      <div className="text-center mb-8 space-y-2">
        <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 uppercase">Guestbook</p>
        <h2 className="text-base md:text-lg text-stone-700 font-medium" style={{ fontFamily: 'serif' }}>
          방명록
        </h2>
        <p className="text-xs text-stone-400">축하의 마음을 짧게 남겨 주세요.</p>
      </div>

      <div className="max-w-md mx-auto">
        {!isFirebaseConfigured ? (
          <p className="rounded-2xl border border-stone-200 bg-white/50 px-5 py-4 text-center text-sm text-stone-500">
            Firebase 환경변수를 설정하면 방명록이 표시됩니다.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="company"
                value={trap}
                onChange={(event) => setTrap(event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <label className="block">
                <span className="sr-only">이름</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={12}
                  placeholder="이름"
                  className="w-full rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-300 focus:border-[#c2a06c]"
                />
              </label>
              <label className="block">
                <span className="sr-only">축하 메시지</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={150}
                  rows={4}
                  placeholder="축하 메시지"
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700 outline-none placeholder:text-stone-300 focus:border-[#c2a06c]"
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full border border-[#d6c09a]/70 bg-[#fbf7ef] px-5 py-3 text-xs font-medium tracking-[0.18em] text-[#8a6a37] shadow-[0_8px_18px_rgba(194,160,108,0.14)] transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                {sending ? '남기는 중' : '남기기'}
              </button>
            </form>

            {status && <p className="mt-3 text-center text-xs text-stone-500">{status}</p>}

            <div className="mt-8 space-y-3">
              {loading ? (
                <p className="text-center text-sm text-stone-400">불러오는 중입니다.</p>
              ) : entries.length ? (
                <>
                  {visibleEntries.map((entry) => (
                    <GuestbookCard key={entry.id} entry={entry} />
                  ))}
                  {hiddenEntries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      className="w-full rounded-full border border-stone-200 bg-white/60 px-5 py-3 text-xs font-medium tracking-[0.16em] text-stone-500 active:scale-[0.99] transition-transform"
                    >
                      더보기 {hiddenEntries.length}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-stone-400">첫 번째 축하 메시지를 남겨 주세요.</p>
              )}
            </div>

            {sheetOpen && (
              <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-3" role="dialog" aria-modal="true">
                <button
                  type="button"
                  aria-label="방명록 더보기 닫기"
                  className="absolute inset-0 cursor-default"
                  onClick={() => setSheetOpen(false)}
                />
                <div className="relative w-full max-w-[430px] rounded-t-3xl bg-[#FDFAF5] px-5 pb-6 pt-4 shadow-[0_-18px_45px_rgba(0,0,0,0.18)] md:max-w-[720px]">
                  <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-700">더 남겨진 마음</p>
                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      className="rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs text-stone-500"
                    >
                      닫기
                    </button>
                  </div>
                  <div className="max-h-[60vh] space-y-3 overflow-y-auto pb-2">
                    {hiddenEntries.map((entry) => (
                      <GuestbookCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
