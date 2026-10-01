import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#233e32" }}>
        <svg width="140" height="140" viewBox="0 0 64 64" fill="none" stroke="#f7f4ed" strokeWidth="4.5" strokeLinecap="round">
          <circle cx="32" cy="21" r="8" fill="#d4722a" stroke="none" />
          <path d="M10 40c5 0 5-5 11-5s6 5 11 5 5-5 11-5 6 5 11 5" />
          <path d="M10 50c5 0 5-5 11-5s6 5 11 5 5-5 11-5 6 5 11 5" />
        </svg>
      </div>
    ),
    size,
  );
}
