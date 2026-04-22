import React from "react";

export function WelcomeArtwork() {
  return (
    <div className="artwork-panel artwork-panel--welcome" aria-hidden="true">
      <svg viewBox="0 0 320 220">
        <defs>
          <linearGradient id="sky" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#dff2ff" />
            <stop offset="100%" stopColor="#f8fbff" />
          </linearGradient>
          <linearGradient id="carBody" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#f77d5b" />
            <stop offset="100%" stopColor="#d94f47" />
          </linearGradient>
        </defs>

        <rect fill="url(#sky)" height="220" rx="38" width="320" />
        <circle cx="44" cy="40" fill="#ffffff" opacity="0.8" r="18" />
        <circle cx="84" cy="30" fill="#ffffff" opacity="0.65" r="12" />
        <rect fill="#d2e6f9" height="56" opacity="0.7" rx="7" width="26" x="214" y="54" />
        <rect fill="#c5dcf4" height="42" opacity="0.8" rx="7" width="22" x="244" y="68" />
        <rect fill="#b5d1ef" height="66" opacity="0.8" rx="7" width="30" x="272" y="44" />
        <path d="M0 172c34-32 85-44 144-35 34 5 68 16 99 12 26-3 49-15 77-38v109H0Z" fill="#b6dca9" />
        <path d="M0 192c57-38 144-46 212-24 36 12 68 20 108 14v38H0Z" fill="#dfeefb" />
        <ellipse cx="156" cy="188" fill="#d8dfe9" rx="122" ry="28" />

        <g transform="translate(28 138)">
          <rect fill="url(#carBody)" height="24" rx="8" width="78" x="0" y="16" />
          <path d="M16 16 30 2h31c9 0 17 5 21 14Z" fill="url(#carBody)" />
          <rect fill="#f8fcff" height="10" rx="4" width="28" x="29" y="8" />
          <circle cx="18" cy="42" fill="#293347" r="7" />
          <circle cx="18" cy="42" fill="#a7b5c8" r="3" />
          <circle cx="60" cy="42" fill="#293347" r="7" />
          <circle cx="60" cy="42" fill="#a7b5c8" r="3" />
        </g>

        <g transform="translate(110 103)">
          <circle cx="16" cy="16" fill="#f4c7a4" r="15" />
          <path d="M2 18c0-9 7-16 16-16 3 0 6 .7 8.5 2.1L29 21H2Z" fill="#203b7c" />
          <rect fill="#6da6ff" height="42" rx="14" width="26" x="3" y="31" />
          <rect fill="#3e5caa" height="36" rx="13" width="12" x="0" y="72" />
          <rect fill="#3e5caa" height="36" rx="13" width="12" x="16" y="72" />
        </g>

        <g transform="translate(160 98)">
          <circle cx="18" cy="16" fill="#f5cba7" r="15" />
          <path d="M6 21c0-9 7-16 16-16 4 0 8 1.4 11 3.7L32 20 6 22Z" fill="#472918" />
          <rect fill="#f5a05d" height="45" rx="15" width="28" x="4" y="31" />
          <rect fill="#334e9a" height="36" rx="13" width="12" x="4" y="76" />
          <rect fill="#334e9a" height="36" rx="13" width="12" x="20" y="76" />
          <rect fill="#466fcb" height="22" rx="8" width="14" x="25" y="40" />
        </g>
      </svg>
    </div>
  );
}

export function SplashHeroArtwork() {
  return (
    <div className="artwork-panel artwork-panel--splash" aria-hidden="true">
      <svg viewBox="0 0 360 520">
        <defs>
          <linearGradient id="splashSky" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#d7ebff" />
            <stop offset="48%" stopColor="#eaf4ff" />
            <stop offset="100%" stopColor="#9ec4ff" />
          </linearGradient>
          <radialGradient id="splashGlow" cx="50%" cy="24%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="buildingLeft" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d4e5ff" />
          </linearGradient>
          <linearGradient id="buildingRight" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f7ff" />
            <stop offset="100%" stopColor="#d8e7ff" />
          </linearGradient>
          <linearGradient id="windowBlue" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#5da5ff" />
            <stop offset="100%" stopColor="#77c7ff" />
          </linearGradient>
          <linearGradient id="roadSurface" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#aacbff" />
            <stop offset="100%" stopColor="#7ca8f3" />
          </linearGradient>
          <linearGradient id="carBlue" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#184ec8" />
            <stop offset="100%" stopColor="#0c86ff" />
          </linearGradient>
          <linearGradient id="carGlass" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#dff3ff" />
            <stop offset="100%" stopColor="#8fd8ff" />
          </linearGradient>
          <filter id="softShadow" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="18" floodColor="#3564b9" floodOpacity="0.18" stdDeviation="18" />
          </filter>
        </defs>

        <rect fill="url(#splashSky)" height="520" rx="42" width="360" />
        <ellipse cx="180" cy="112" fill="url(#splashGlow)" rx="150" ry="130" />
        <circle cx="24" cy="52" fill="#ffffff" opacity="0.24" r="20" />
        <circle cx="325" cy="115" fill="#ffffff" opacity="0.2" r="54" />
        <circle cx="8" cy="204" fill="#ffffff" opacity="0.16" r="14" />

        <g opacity="0.95">
          <circle cx="58" cy="182" fill="#ffffff" r="17" />
          <circle cx="76" cy="177" fill="#ffffff" r="14" />
          <circle cx="92" cy="184" fill="#ffffff" r="12" />
          <rect fill="#ffffff" height="14" rx="7" width="56" x="53" y="185" />

          <circle cx="302" cy="196" fill="#ffffff" r="18" />
          <circle cx="320" cy="191" fill="#ffffff" r="14" />
          <circle cx="336" cy="199" fill="#ffffff" r="12" />
          <rect fill="#ffffff" height="14" rx="7" width="58" x="296" y="199" />
        </g>

        <g transform="translate(0 248)">
          <path
            d="M0 118c47-11 89-22 134-19 41 3 76 16 110 20 43 5 78-4 116-21v174H0Z"
            fill="url(#roadSurface)"
          />
          <path
            d="M72 74h216l72 45H0Z"
            fill="#bfd7ff"
          />
          <path
            d="M150 74h60l48 45h-156Z"
            fill="#dce9ff"
          />
          <path
            d="M174 74h12v164h-12Z"
            fill="rgba(255,255,255,0.38)"
          />
        </g>

        <g filter="url(#softShadow)" transform="translate(0 208)">
          <g transform="translate(0 48)">
            <rect fill="url(#buildingLeft)" height="174" rx="8" width="118" x="0" y="0" />
            <rect fill="url(#windowBlue)" height="24" rx="3" width="78" x="18" y="62" />
            <rect fill="url(#windowBlue)" height="24" rx="3" width="78" x="18" y="97" />
            <rect fill="url(#windowBlue)" height="24" rx="3" width="78" x="18" y="132" />
            <rect fill="#eaf2ff" height="20" rx="4" width="92" x="10" y="28" />
            <text
              fill="#2053bf"
              fontFamily="Aptos, Trebuchet MS, sans-serif"
              fontSize="22"
              fontWeight="800"
              transform="translate(24 40) rotate(10)"
            >
              UNIVERSITE
            </text>
          </g>

          <g transform="translate(266 58)">
            <rect fill="url(#buildingRight)" height="164" rx="8" width="94" x="0" y="0" />
            <rect fill="url(#windowBlue)" height="22" rx="3" width="60" x="16" y="48" />
            <rect fill="url(#windowBlue)" height="22" rx="3" width="60" x="16" y="81" />
            <rect fill="url(#windowBlue)" height="22" rx="3" width="60" x="16" y="114" />
          </g>
        </g>

        <g filter="url(#softShadow)" transform="translate(26 350)">
          <ellipse cx="72" cy="112" fill="rgba(51,95,166,0.2)" rx="92" ry="20" />
          <path d="M14 70c4-20 19-35 39-35h56c23 0 42 15 49 35l11 33H5Z" fill="url(#carBlue)" />
          <path d="M48 42 72 18h48c14 0 26 9 32 24Z" fill="#1d63db" />
          <path d="M59 45 77 26h39c11 0 19 7 23 19Z" fill="url(#carGlass)" opacity="0.96" />
          <rect fill="#163266" height="13" rx="6.5" width="40" x="62" y="69" />
          <rect fill="#ffffff" height="10" rx="4" width="20" x="24" y="74" />
          <rect fill="#ffffff" height="10" rx="4" width="20" x="121" y="74" />
          <rect fill="#61d9ff" height="10" rx="5" width="14" x="26" y="76" />
          <rect fill="#61d9ff" height="10" rx="5" width="14" x="123" y="76" />
          <circle cx="39" cy="108" fill="#1c2a4d" r="16" />
          <circle cx="39" cy="108" fill="#a7b8de" r="7" />
          <circle cx="129" cy="108" fill="#1c2a4d" r="16" />
          <circle cx="129" cy="108" fill="#a7b8de" r="7" />
          <rect fill="#ffffff" height="18" rx="6" width="46" x="58" y="94" />
        </g>

        <g filter="url(#softShadow)" transform="translate(144 282)">
          <g transform="translate(0 22)">
            <ellipse cx="22" cy="136" fill="rgba(52,92,162,0.18)" rx="24" ry="6" />
            <circle cx="22" cy="18" fill="#f3c8a4" r="16" />
            <path d="M7 19c0-10 7-18 16-18 5 0 10 2 13.2 5.5L35 19Z" fill="#1f2435" />
            <rect fill="#1a5fd3" height="58" rx="18" width="34" x="5" y="34" />
            <rect fill="#173a82" height="50" rx="14" width="13" x="8" y="90" />
            <rect fill="#173a82" height="50" rx="14" width="13" x="23" y="90" />
            <rect fill="#eff6ff" height="7" rx="3.5" width="10" x="18" y="46" />
          </g>

          <g transform="translate(52)">
            <ellipse cx="20" cy="154" fill="rgba(52,92,162,0.18)" rx="24" ry="6" />
            <circle cx="20" cy="18" fill="#f3c8a4" r="16" />
            <path d="M6 20c0-11 8-19 18-19 6 0 11 2 14.8 5.6L35 20Z" fill="#25253a" />
            <rect fill="#ffffff" height="60" rx="17" width="34" x="3" y="35" />
            <rect fill="#2f6de8" height="54" rx="14" width="13" x="6" y="93" />
            <rect fill="#2f6de8" height="54" rx="14" width="13" x="22" y="93" />
            <rect fill="#1c2746" height="28" rx="8" width="8" x="30" y="60" />
          </g>

          <g transform="translate(102 14)">
            <ellipse cx="22" cy="143" fill="rgba(52,92,162,0.18)" rx="24" ry="6" />
            <circle cx="22" cy="18" fill="#f3c8a4" r="16" />
            <path d="M7 19c0-10 7-18 16-18 6 0 11 2 14.5 6L35 19Z" fill="#1d2234" />
            <rect fill="#173a82" height="58" rx="18" width="34" x="5" y="34" />
            <rect fill="#0f245f" height="50" rx="14" width="13" x="8" y="90" />
            <rect fill="#0f245f" height="50" rx="14" width="13" x="23" y="90" />
            <rect fill="#eff6ff" height="7" rx="3.5" width="9" x="18" y="48" />
          </g>
        </g>

        <g fill="#6f90d8" opacity="0.5">
          <path d="M272 308c7-2 13 4 18 6 4 2 10 2 14-1-1 8-12 13-22 10-6-2-9-8-10-15Z" />
          <path d="M252 316c5-2 10 2 14 4 3 1 7 1 10-1-1 6-9 9-16 7-4-1-7-5-8-10Z" />
        </g>
      </svg>
    </div>
  );
}

export function RideArtwork() {
  return (
    <div className="artwork-panel artwork-panel--hero" aria-hidden="true">
      <svg viewBox="0 0 320 170">
        <defs>
          <linearGradient id="bgHero" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ebf4ff" />
            <stop offset="100%" stopColor="#d3ebff" />
          </linearGradient>
        </defs>

        <rect fill="url(#bgHero)" height="170" rx="28" width="320" />
        <path d="M0 120c24-26 58-48 96-44 45 4 72 41 113 41 33 0 55-20 111-55v108H0Z" fill="#c7e6b7" />
        <rect fill="#cfdef0" height="48" rx="6" width="18" x="235" y="28" />
        <rect fill="#b6cee9" height="36" rx="6" width="16" x="259" y="40" />
        <rect fill="#d9e6f7" height="56" rx="6" width="22" x="281" y="20" />

        <g transform="translate(48 92)">
          <rect fill="#d95152" height="20" rx="8" width="74" x="0" y="16" />
          <path d="M14 16 27 2h28c9 0 17 5 21 14Z" fill="#e06666" />
          <rect fill="#eef8ff" height="9" rx="4" width="24" x="29" y="8" />
          <circle cx="18" cy="38" fill="#2f3c58" r="7" />
          <circle cx="58" cy="38" fill="#2f3c58" r="7" />
        </g>

        <g transform="translate(126 55)">
          <circle cx="20" cy="19" fill="#f5ccae" r="16" />
          <path d="M6 20c0-9 8-16 18-16 5 0 9 1.6 12.2 4.1L33 22Z" fill="#51301f" />
          <rect fill="#6f9cff" height="43" rx="14" width="28" x="6" y="36" />
          <rect fill="#3350a3" height="34" rx="12" width="12" x="8" y="80" />
          <rect fill="#3350a3" height="34" rx="12" width="12" x="22" y="80" />
          <rect fill="#5570c7" height="24" rx="8" width="16" x="26" y="48" />
        </g>

        <g transform="translate(186 58)">
          <circle cx="20" cy="19" fill="#f5ccae" r="16" />
          <path d="M8 23c0-10 8-18 18-18 4 0 8 1.2 11 3.6L34 22Z" fill="#2c201e" />
          <rect fill="#f09a56" height="45" rx="14" width="28" x="6" y="36" />
          <rect fill="#334e9a" height="34" rx="12" width="12" x="8" y="81" />
          <rect fill="#334e9a" height="34" rx="12" width="12" x="22" y="81" />
          <rect fill="#4a76d2" height="24" rx="8" width="16" x="24" y="50" />
        </g>
      </svg>
    </div>
  );
}

export function MapArtwork() {
  return (
    <div className="artwork-panel artwork-panel--map" aria-hidden="true">
      <svg viewBox="0 0 320 230">
        <rect fill="#eef5fb" height="230" rx="28" width="320" />
        <path
          d="M8 150c41-39 99-47 151-31 50 16 82 12 153-34"
          fill="none"
          opacity="0.35"
          stroke="#aac4e9"
          strokeWidth="52"
        />
        <path
          d="M26 182c52-44 110-68 169-74 31-3 71-2 99 7"
          fill="none"
          opacity="0.6"
          stroke="#cfe0f7"
          strokeWidth="28"
        />
        <path
          d="M54 182c41-54 88-81 134-86 37-4 72 7 108 35"
          fill="none"
          stroke="#2f6edb"
          strokeDasharray="8 9"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path d="M57 194c-16 0-28-12-28-28 0-19 28-44 28-44s28 25 28 44c0 16-12 28-28 28Z" fill="#ff884b" />
        <circle cx="57" cy="165" fill="#fff4ee" r="10" />
        <path d="M266 110c-16 0-28-12-28-28 0-19 28-44 28-44s28 25 28 44c0 16-12 28-28 28Z" fill="#5fb450" />
        <circle cx="266" cy="81" fill="#effced" r="10" />
      </svg>
    </div>
  );
}
