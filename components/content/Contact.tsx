'use client';
import { useState } from 'react';

interface AccountProps {
  bank: string;
  number: string;
  holder: string;
}

function AccountCopy({ bank, number, holder }: AccountProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between px-5 py-4
        rounded-2xl bg-stone-50 border border-stone-200
        active:scale-[0.98] transition-transform"
    >
      <div className="text-left">
        <p className="text-xs text-stone-400">{bank}</p>
        <p className="text-sm font-medium text-stone-700">{number}</p>
        <p className="text-xs text-stone-400">{holder}</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-500">
        {copied ? '복사됨 ✓' : '복사'}
      </span>
    </button>
  );
}

export default function Contact() {
  return (
    <section className="px-6 py-12 space-y-4">
      <p className="text-xs tracking-widest text-stone-400 text-center mb-6">
        ACCOUNT
      </p>
      {/* 신랑 측 */}
      <AccountCopy bank="국민은행" number="000000-00-000000" holder="신우진" />
      {/* 신부 측 */}
      <AccountCopy bank="신한은행" number="000-000-000000" holder="박선영" />
    </section>
  );
}
