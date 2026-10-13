import { ImageResponse } from "next/og";
export const alt =
  "Admitics — Every education opportunity starts with a question";
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
        background: "#f7faff",
        color: "#11223c",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "#225ae2",
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
          fontFamily: "sans-serif",
          fontWeight: 800,
        }}
      >
        Your future has
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 78,
          lineHeight: 1.1,
          color: "#225ae2",
          fontFamily: "sans-serif",
          fontWeight: 800,
        }}
      >
        more possibilities. Find yours.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#647189",
          marginTop: 40,
        }}
      >
        Education pathways, scholarships and next steps in your language.
      </div>
    </div>,
    size,
  );
}
