/**
 * PaperPlaneIcon — 여객기 인라인 SVG (<g> 콘텐츠용, 항공기 탑뷰)
 *
 * 기수가 +x(오른쪽)를 향하도록 보정돼 있어
 * 부모가 <g ref> 의 transform(translate + rotate)으로
 * 경로 진행 방향에 맞춰 그대로 회전시킬 수 있다.
 *
 * 원점 (0, 0) = 비행기 중심, 전체 약 30px.
 * (위(-y)를 향하게 그린 뒤 rotate(90)로 +x 보정)
 * 배색: 흰 동체 + 웜그레이 날개 + 조종석 창 + 꼬리 단풍 주황 포인트
 */
export default function PaperPlaneIcon() {
  return (
    <g transform="rotate(90) scale(1.25)">
      {/* 주날개 — 뒤로 살짝 젖힌 스윕 (좌/우), 가을 주황 */}
      <path d="M1.6 -2.5 L11.5 3.2 L11.5 5.4 L1.6 2.6 Z" fill="#D97742" stroke="#B85F2E" strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M-1.6 -2.5 L-11.5 3.2 L-11.5 5.4 L-1.6 2.6 Z" fill="#D97742" stroke="#B85F2E" strokeWidth="0.5" strokeLinejoin="round" />
      {/* 꼬리날개 (좌/우), 가을 주황 */}
      <path d="M1.3 7.2 L5.8 9.8 L5.8 11.2 L1.3 9.4 Z" fill="#D97742" stroke="#B85F2E" strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M-1.3 7.2 L-5.8 9.8 L-5.8 11.2 L-1.3 9.4 Z" fill="#D97742" stroke="#B85F2E" strokeWidth="0.5" strokeLinejoin="round" />
      {/* 동체 — 흰색, 둥근 기수/꼬리 */}
      <path
        d="M0 -12 C1.7 -10.5 1.7 -8.5 1.7 -6.5 L1.7 7.5 C1.7 9.5 1 10.5 0 10.5 C-1 10.5 -1.7 9.5 -1.7 7.5 L-1.7 -6.5 C-1.7 -8.5 -1.7 -10.5 0 -12 Z"
        fill="#FFFFFF"
        stroke="#9A8B78"
        strokeWidth="0.6"
      />
      {/* 조종석 창 */}
      <path d="M0 -10.6 C0.9 -9.9 1.1 -9.2 1.1 -8.4 L-1.1 -8.4 C-1.1 -9.2 -0.9 -9.9 0 -10.6 Z" fill="#5C6B73" />
      {/* 꼬리 포인트 — 짙은 단풍 레드 */}
      <path d="M-1.7 8.2 L1.7 8.2 L1.7 10 C1.7 10.4 1 10.5 0 10.5 C-1 10.5 -1.7 10.4 -1.7 10 Z" fill="#C8552E" />
    </g>
  );
}
