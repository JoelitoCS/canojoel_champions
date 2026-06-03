"use client";

import { useState } from "react";

interface TeamShieldProps {
  name: string;
  shortName: string;
  logo: string | null;
  glow?: string;
  size?: number;
}

export function TeamShield({
  name,
  shortName,
  logo,
  glow = "#1565c0",
  size = 64,
}: TeamShieldProps) {
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        style={{
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          objectFit: "contain",
          filter: "drop-shadow(0 2px 10px #00000099)",
        }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: inicials estilitzades
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 35%, ${glow}cc, ${glow}44)`,
        border: `2px solid ${glow}88`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size > 48 ? "0.85rem" : "0.65rem",
        fontWeight: "900",
        color: "#ffffff",
        letterSpacing: "0.05em",
        textShadow: "0 1px 4px #00000066",
      }}
    >
      {shortName.slice(0, 3)}
    </div>
  );
}
