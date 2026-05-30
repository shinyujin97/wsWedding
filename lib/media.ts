// 미디어(사진/영상/음악) 경로 헬퍼.
// - NEXT_PUBLIC_MEDIA_BASE 가 설정되어 있으면 외부 스토리지(예: Vercel Blob) URL 로 변환
// - 없으면 로컬 /public 경로 그대로 (로컬 개발용)
//
// public repo 에는 미디어를 올리지 않으므로, 배포 환경에서는 반드시
// NEXT_PUBLIC_MEDIA_BASE 를 등록해야 사진/영상/음악이 보인다.

const RAW_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE ?? '';
// 끝의 슬래시 정리
const MEDIA_BASE = RAW_BASE.replace(/\/+$/, '');

/**
 * 미디어 경로를 절대 URL 또는 로컬 경로로 변환한다.
 * @param path "/video/seed.mp4" 처럼 / 로 시작하는 public 기준 경로
 */
export function media(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!MEDIA_BASE) return clean; // 로컬: public 경로 그대로
  return `${MEDIA_BASE}${clean}`;
}
