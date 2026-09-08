import type { FrameId } from '../types';

/**
 * A tiny stand-in photo. Warm skin tones against a cool background, so every
 * filter's character (warm/cool, contrast, desaturation) is legible at 60px.
 */
export function SampleScene() {
  return (
    <svg viewBox="0 0 60 60" className="swatch__img" aria-hidden="true">
      {/* background */}
      <g>
        <rect width="60" height="60" fill="#8fbeea" />
        <rect y="40" width="60" height="20" fill="#b5dc7a" />
        <circle cx="49" cy="12" r="6" fill="#ffe071" />
        <path d="M0 42 L14 26 L28 42 Z" fill="#7cdba4" />
      </g>
      {/* subject */}
      <ellipse cx="30" cy="52" rx="15" ry="11" fill="#e8734a" />
      <circle cx="30" cy="31" r="11" fill="#f0b98d" />
      <path d="M19 28a11 11 0 0 1 22 0v-3a11 11 0 0 0-22 0z" fill="#4a3526" />
      <circle cx="26" cy="31" r="1.5" fill="#2b1d13" />
      <circle cx="34" cy="31" r="1.5" fill="#2b1d13" />
      <path d="M26 36q4 3 8 0" stroke="#2b1d13" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Mini photostrip. All four cells are shown so the settings preview matches
 * the print the user will receive.
 */
export function FrameSwatch({ frame }: { frame: FrameId }) {
  const cells = [0, 1, 2, 3];

  if (frame === 'japaneseId') {
    return (
      <svg viewBox="0 0 68 90" className="swatch__img swatch__img--strip" aria-hidden="true">
        <defs>
          <pattern id="id-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="#b7ddf4" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="68" height="90" fill="#fff" />
        <rect width="68" height="90" fill="url(#id-grid)" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={7 + (i % 2) * 29}
            y={8 + Math.floor(i / 2) * 32}
            width="25"
            height="28"
            fill="#78b9e8"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        <text x="34" y="79" textAnchor="middle" fontSize="6" fontWeight="700" fill="#155ca0">
          証明写真
        </text>
      </svg>
    );
  }

  if (frame === 'calendar2027') {
    return (
      <svg viewBox="0 0 68 90" className="swatch__img swatch__img--strip" aria-hidden="true">
        <rect width="68" height="90" fill="#f8f7f2" />
        {Array.from({ length: 12 }, (_, i) => {
          const x = 4 + (i % 3) * 21;
          const y = 4 + Math.floor(i / 3) * 21;
          return (
            <g key={i}>
              <rect x={x} y={y} width="18" height="18" fill="#fff" stroke="#d9d5cc" strokeWidth="0.6" />
              <rect x={x + 2} y={y + 2} width="14" height="9" fill={i % 2 ? '#f3aac5' : '#98c5e6'} />
              <text x={x + 9} y={y + 16} textAnchor="middle" fontSize="3.5" fontWeight="700" fill="#423a32">
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x="34" y="88" textAnchor="middle" fontSize="4" fontWeight="700" fill="#423a32">
          2027
        </text>
      </svg>
    );
  }

  if (frame === 'purikura') {
    return (
      <svg viewBox="0 0 68 90" className="swatch__img swatch__img--strip" aria-hidden="true">
        <rect width="68" height="90" rx="4" fill="#ffc9e8" />
        <path d="M0 12Q17 2 34 12T68 12V0H0Z" fill="#fff1fa" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={7 + (i % 2) * 29}
            y={10 + Math.floor(i / 2) * 34}
            width="25"
            height="29"
            rx="3"
            fill={i % 2 ? '#d9c2ff' : '#9fe4ef'}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        <text x="8" y="8" fontSize="7" fill="#e84f9b">♥</text>
        <text x="54" y="84" fontSize="8" fill="#e84f9b">♥</text>
        <text x="34" y="87" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#ad3977">
          KAWAII!
        </text>
      </svg>
    );
  }

  if (frame === 'film') {
    return (
      <svg viewBox="0 0 34 124" className="swatch__img swatch__img--strip" aria-hidden="true">
        <rect width="34" height="124" fill="#2b2620" />
        {cells.map((i) => (
          <rect key={i} x="7" y={5 + i * 29} width="20" height="25" fill="#f0b98d" />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <g key={i}>
            <rect x="1.6" y={3 + i * 6.8} width="3.4" height="3.8" rx="0.8" fill="#fffcf5" />
            <rect x="29" y={3 + i * 6.8} width="3.4" height="3.8" rx="0.8" fill="#fffcf5" />
          </g>
        ))}
      </svg>
    );
  }

  const bg = frame === 'black' ? '#2b2620' : '#ffffff';
  const stroke = frame === 'white' ? '#ddd2ba' : 'none';
  return (
    <svg viewBox="0 0 34 124" className="swatch__img swatch__img--strip" aria-hidden="true">
      <rect width="34" height="124" fill={bg} stroke={stroke} strokeWidth="1" />
      {cells.map((i) => (
        <rect key={i} x="5" y={4 + i * 30} width="24" height="27" fill="#f0b98d" />
      ))}
    </svg>
  );
}
