import { ImageResponse } from "next/og";
export const alt = "Admitics — Your next chapter, with clarity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#f0f3ec",
        color: "#192c28",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "#1f5544",
          marginBottom: 48,
          fontWeight: 700,
        }}
      >
        admitics.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 78,
          lineHeight: 1.1,
          fontFamily: "serif",
        }}
      >
        Big dreams. Better decisions.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 78,
          lineHeight: 1.1,
          color: "#1f5544",
          fontFamily: "serif",
        }}
      >
        Your next chapter.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#586861",
          marginTop: 40,
        }}
      >
        Your AI admissions advisor. A little clarity for a big decision.
      </div>
    </div>,
    size,
  );
}
