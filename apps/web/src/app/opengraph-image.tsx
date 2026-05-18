import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "chirp.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#fafafa" }}>chirp</span>
          <span style={{ color: "#00e676" }}>.</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
