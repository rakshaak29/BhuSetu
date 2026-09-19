"use client";

import React from "react";

interface BhuSetuLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "header" | "footer";
  showSubtitle?: boolean;
}

export function BhuSetuIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-[#4F6247] via-[#384834] to-[#222E20] p-[1.5px] shadow-sm ring-1 ring-[#C18C5D]/35 flex items-center justify-center shrink-0 overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Subtle ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#C18C5D]/10 to-white/10 pointer-events-none" />

      {/* Crafted Bilingual Emblem: Bridge (Setu) + Devanagari (भू) + English (B) Contour */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        <defs>
          <linearGradient id="bridgeGrad" x1="6" y1="28" x2="34" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C18C5D" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#E6DCCD" stopOpacity="1" />
            <stop offset="100%" stopColor="#C18C5D" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="goldGlow" x1="20" y1="8" x2="20" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F4EFE6" />
          </linearGradient>
        </defs>

        {/* Outer subtle concentric land contour / blockchain ring */}
        <circle
          cx="20"
          cy="20"
          r="17"
          stroke="#5D7052"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          strokeOpacity="0.5"
        />

        {/* Foundation: Land Contour Waves (भू / Earth) */}
        <path
          d="M 8 32 Q 14 30, 20 31.5 T 32 30"
          stroke="#C18C5D"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        {/* The Bridge Arch (सेतु / Connector) spanning across */}
        <path
          d="M 8 28 C 14 20, 26 20, 32 28"
          stroke="url(#bridgeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bridge Suspension Pillars / Structural Trust Nodes */}
        <line x1="14" y1="23.5" x2="14" y2="28" stroke="#E6DCCD" strokeWidth="0.9" strokeOpacity="0.6" strokeLinecap="round" />
        <line x1="20" y1="21.5" x2="20" y2="28" stroke="#E6DCCD" strokeWidth="1" strokeOpacity="0.8" strokeLinecap="round" />
        <line x1="26" y1="23.5" x2="26" y2="28" stroke="#E6DCCD" strokeWidth="0.9" strokeOpacity="0.6" strokeLinecap="round" />

        {/* Devanagari character 'भू' rising gracefully above the bridge */}
        <text
          x="20"
          y="18.5"
          textAnchor="middle"
          fill="url(#goldGlow)"
          fontSize="14"
          fontWeight="bold"
          fontFamily="'Kohinoor Devanagari', 'Noto Serif Devanagari', 'Nirmala UI', serif"
          style={{ letterSpacing: "-0.02em" }}
        >
          भू
        </text>

        {/* Small Verification Trust Node at Bridge Apex */}
        <circle cx="20" cy="21.5" r="1.2" fill="#C18C5D" />
      </svg>
    </div>
  );
}

export function BhuSetuLogo({
  size = "md",
  variant = "header",
  showSubtitle = true,
}: BhuSetuLogoProps) {
  const isFooter = variant === "footer";

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon */}
      <BhuSetuIcon
        className={
          size === "sm"
            ? "w-8 h-8 rounded-xl"
            : size === "lg"
            ? "w-12 h-12 rounded-2xl"
            : "w-9 sm:w-10 h-9 sm:h-10 rounded-2xl"
        }
      />

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          {/* English Name */}
          <span
            className={`font-serif font-bold tracking-tight transition-colors ${
              isFooter
                ? "text-[#F3F4F1] text-base sm:text-lg"
                : "text-[#2C2C24] text-[16px] sm:text-[18px] group-hover:text-[#5D7052]"
            }`}
          >
            BhuSetu
          </span>

          {/* Elegant Dot Separator */}
          <span className="text-[#C18C5D] font-bold text-xs opacity-70">
            •
          </span>

          {/* Hindi Script Element */}
          <span
            className={`font-serif font-semibold tracking-wide transition-colors ${
              isFooter
                ? "text-[#E0B286] text-xs sm:text-sm"
                : "text-[#C18C5D] text-[13px] sm:text-[14px]"
            }`}
            style={{ fontFamily: "'Kohinoor Devanagari', 'Noto Serif Devanagari', 'Nirmala UI', serif" }}
          >
            भू·सेतु
          </span>

          {/* Pilot Badge - Only in Header */}
          {!isFooter && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5D7052]/10 text-[#5D7052] text-[9px] font-mono font-bold tracking-wider uppercase border border-[#5D7052]/25 ml-1 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D7052] animate-pulse" />
              PILOT
            </span>
          )}
        </div>

        {/* Subtitle */}
        {showSubtitle && (
          <div
            className={`text-[10px] sm:text-[10.5px] font-sans tracking-tight mt-1 leading-tight ${
              isFooter ? "text-[#A8A399]" : "text-[#78786C] hidden sm:block"
            }`}
          >
            {isFooter
              ? "Permissioned Hyperledger Fabric Ledger Pilot · State/UT Land Administration"
              : "Revenue & Registration Evidence · State / UT Pilot"}
          </div>
        )}
      </div>
    </div>
  );
}

export default BhuSetuLogo;
