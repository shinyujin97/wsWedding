'use client';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { arrayUnion, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 카톡/OG 공유 썸네일 (Blob, 새 가든 일러스트 — 새 URL로 캐시·재스크랩 유도)
const THUMBNAIL_URL =
  'https://304umf8a11s9xgqf.public.blob.vercel-storage.com/Thumbnail-v2-eBelCLJ9EmU62Xaa4qSc3oSpa2JOuM.jpg';
const INVITE_PARAM = 'invite';
const INVITE_COLLECTION = 'invite_codes';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_RE = /^[a-zA-Z0-9_-]{1,32}$/;
const ACTION_TARGET_NAME = {
  kakao_share: '카카오톡 공유',
  link_copy: '링크 복사',
} as const;

type ShareAction = keyof typeof ACTION_TARGET_NAME;
type InviteData = {
  code?: unknown;
  rootCode?: unknown;
  sourcePath?: unknown;
  sourceAction?: unknown;
  childCodes?: unknown;
};

declare global {
  interface Window { Kakao: any; }
}

export default function KakaoShare() {
  const [ready, setReady] = useState(false);
  const sourceCodeRef = useRef<string | null>(null);
  const createdCodesRef = useRef<Partial<Record<ShareAction, string>>>({});

  const initKakao = () => {
    try {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
      }
    } catch { /* init 중복/실패해도 무시 */ }
    if (window.Kakao) setReady(true); // SDK 있으면 무조건 버튼 활성화
  };

  const isInviteCode = (value: unknown): value is string => (
    typeof value === 'string' && INVITE_CODE_RE.test(value)
  );

  const createInviteCode = (length = 8) => {
    if (!window.crypto?.getRandomValues) {
      return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
    }
    const bytes = window.crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => CODE_CHARS[byte % CODE_CHARS.length]).join('');
  };

  const getUrlWithInvite = (code: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(INVITE_PARAM, code);
    return url;
  };

  const createInviteUrl = async (action: ShareAction) => {
    const firestore = db;
    if (!firestore) throw new Error('Firebase is not configured');

    const url = new URL(window.location.href);
    if (!sourceCodeRef.current) {
      const sourceInviteCode = url.searchParams.get(INVITE_PARAM);
      sourceCodeRef.current = sourceInviteCode && INVITE_CODE_RE.test(sourceInviteCode) ? sourceInviteCode : 'direct';
    }

    const cachedCode = createdCodesRef.current[action];
    if (cachedCode) return getUrlWithInvite(cachedCode).toString();

    const sourceCode = sourceCodeRef.current;

    const code = await runTransaction(firestore, async (transaction) => {
      const parentRef = sourceCode === 'direct' ? null : doc(firestore, INVITE_COLLECTION, sourceCode);
      const parentSnap = parentRef ? await transaction.get(parentRef) : null;
      const parent = parentSnap?.exists() ? parentSnap.data() as InviteData : null;
      const childCodes = Array.isArray(parent?.childCodes)
        ? parent.childCodes.filter(isInviteCode).slice(0, 50)
        : [];

      for (const childCode of childCodes) {
        const childSnap = await transaction.get(doc(firestore, INVITE_COLLECTION, childCode));
        const child = childSnap.exists() ? childSnap.data() as InviteData : null;
        if (child?.sourceAction === action && isInviteCode(child.code)) return child.code;
      }

      let nextCode = '';
      let codeRef = doc(firestore, INVITE_COLLECTION, createInviteCode());
      for (let attempt = 0; attempt < 8; attempt += 1) {
        nextCode = createInviteCode();
        codeRef = doc(firestore, INVITE_COLLECTION, nextCode);
        if (!(await transaction.get(codeRef)).exists()) break;
        nextCode = '';
      }
      if (!nextCode) throw new Error('Invite code collision');

      const rootCode = parent
        ? (isInviteCode(parent.rootCode) ? parent.rootCode : isInviteCode(parent.code) ? parent.code : sourceCode)
        : sourceCode === 'direct' ? nextCode : sourceCode;
      const parentPath = parent && typeof parent.sourcePath === 'string' && parent.sourcePath
        ? parent.sourcePath
        : sourceCode;
      const sourcePath = sourceCode === 'direct' ? nextCode : `${parentPath} > ${nextCode}`;

      transaction.set(codeRef, {
        code: nextCode,
        targetName: ACTION_TARGET_NAME[action],
        parentCode: sourceCode === 'direct' ? null : sourceCode,
        rootCode,
        sourcePath,
        sourceAction: action,
        inviteUrl: getUrlWithInvite(nextCode).toString(),
        childCodes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (parentRef && parentSnap?.exists()) {
        transaction.update(parentRef, {
          childCodes: arrayUnion(nextCode),
          updatedAt: serverTimestamp(),
        });
      }
      return nextCode;
    });

    createdCodesRef.current[action] = code;
    if (sourceCode === 'direct') sourceCodeRef.current = code;

    const inviteUrl = getUrlWithInvite(code);

    return inviteUrl.toString();
  };

  // SDK 준비 여부를 직접 폴링해 "마운트될 때마다" 확실히 초기화·활성화한다.
  // (next/script onLoad는 스크립트 최초 로드 시 1회만 불려서, 재마운트(영상 다시보기 등) 시
  //  버튼이 비활성으로 남는 문제가 있었음)
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (window.Kakao) { clearInterval(id); initKakao(); }
      else if (tries > 100) clearInterval(id); // ~10초 후 포기
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleShare = async () => {
    if (!window.Kakao) { alert('카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.'); return; }
    if (!window.Kakao.isInitialized()) initKakao();

    let shareUrl = '';
    try {
      shareUrl = await createInviteUrl('kakao_share');
    } catch {
      alert('초대 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '신우진 ♥ 박선영 결혼합니다',
        description: '2026년 10월 17일 토요일 오후 12시 50분\n아르베웨딩',
        imageUrl: THUMBNAIL_URL,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(await createInviteUrl('link_copy'));
      alert('링크가 복사되었습니다!');
    } catch {
      alert('초대 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
        crossOrigin="anonymous"
        onLoad={initKakao}
      />

      <section className="px-6 md:px-12 py-12 md:py-16 space-y-3 md:space-y-4">
        <p className="text-xs md:text-sm tracking-widest text-stone-400 text-center mb-6 md:mb-8">
          SHARE
        </p>

        {/* 카카오톡 공유 */}
        <button
          onClick={handleShare}
          disabled={!ready}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 md:py-5
            rounded-2xl bg-[#FEE500] text-[#191919] font-medium text-sm md:text-base
            active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.63 5.17l-.93 3.44c-.08.3.26.54.52.37l4.1-2.72c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.29C17 3.79 13.42 1 9 1z"
              fill="#191919"
            />
          </svg>
          카카오톡으로 공유하기
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 md:py-5
            rounded-2xl bg-stone-100 border border-stone-200
            text-stone-600 font-medium text-sm md:text-base
            active:scale-[0.98] transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          링크 복사하기
        </button>
      </section>
    </>
  );
}
