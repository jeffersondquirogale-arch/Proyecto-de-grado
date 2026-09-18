"use client";

export default function Narrador({ hablando }: { hablando: boolean }) {
  return (
    <svg viewBox="0 0 120 140" className="h-32 w-auto shrink-0" aria-hidden="true">
      <ellipse cx="60" cy="134" rx="34" ry="5" fill="var(--color-borde)" opacity="0.5" />
      <path d="M32 134 Q32 96 60 96 Q88 96 88 134 Z" fill="var(--color-acento)" opacity="0.9" />
      <rect x="54" y="84" width="12" height="16" rx="5" fill="#e8c9a8" />
      <circle cx="60" cy="62" r="27" fill="#f0d5b8" />
      <path d="M33 58 Q34 30 60 30 Q86 30 87 58 Q84 44 60 44 Q36 44 33 58 Z" fill="#3a3330" />
      <circle cx="50" cy="62" r="2.6" fill="#2b2622">
        <animate attributeName="ry" values="2.6;2.6;0.3;2.6;2.6" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="62" r="2.6" fill="#2b2622">
        <animate attributeName="ry" values="2.6;2.6;0.3;2.6;2.6" dur="5s" repeatCount="indefinite" />
      </circle>
      <path d="M44 54 Q50 51 55 54" stroke="#3a3330" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M65 54 Q70 51 76 54" stroke="#3a3330" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {hablando ? (
        <ellipse cx="60" cy="76" rx="5" ry="4" fill="#8a4a44">
          <animate attributeName="ry" values="1.5;5;2.5;5.5;2;4" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="rx" values="5;4;5.5;4.5;5;4.5" dur="0.6s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M54 75 Q60 79 66 75" stroke="#8a4a44" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
