import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Pon Di Rio — Luxury River Cottages in Jamaica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const bgBuffer = await readFile(join(process.cwd(), "public/bamboo-villa-cover.jpg"));
  const bgBase64 = `data:image/jpeg;base64,${bgBuffer.toString("base64")}`;

  const logoBuffer = await readFile(join(process.cwd(), "public/logotransparent.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Background image */}
        <img
          src={bgBase64}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)",
            display: "flex",
          }}
        />

        {/* Bottom content */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Logo */}
          <img
            src={logoBase64}
            style={{ width: 80, height: 80 }}
          />

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                letterSpacing: 1,
              }}
            >
              Pon Di Rio
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.8)",
                marginTop: 2,
              }}
            >
              Luxury River Cottages in Jamaica
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
