/**
 * The welcome-screen booth, built the way a construction-paper collage is:
 * flat matte shapes cut out and layered, each sitting on a slightly offset
 * darker sheet, with soft shadows where one piece lies over another. No
 * outlines on the shapes themselves — the layering does the work.
 *
 * Rendered twice (variant 0 and 1) with everything nudged a degree or two.
 * Cross-cutting the two on a steps(1) timer gives the wobble of a two-frame
 * flipbook. One parameterized component, so the frames can't drift apart.
 */

const STAR =
  'M 0,-10 L 2.41,-3.32 L 9.51,-3.09 L 3.9,1.27 L 5.88,8.09 L 0,4.1 ' +
  'L -5.88,8.09 L -3.9,1.27 L -9.51,-3.09 L -2.41,-3.32 Z';

const INK = '#423a32';
const HAND = 'Gaegu, Short Stack, cursive';

function Star({ x, y, size, rot, fill = INK }: { x: number; y: number; size: number; rot: number; fill?: string }) {
  return <path d={STAR} fill={fill} transform={`translate(${x} ${y}) rotate(${rot}) scale(${size / 10})`} />;
}

/** Half-circles, for the awning fringe and the curtain valance. */
function Scallops({ x0, x1, y, r, fill }: { x0: number; x1: number; y: number; r: number; fill: string }) {
  const n = Math.max(1, Math.round((x1 - x0) / (2 * r)));
  const step = (x1 - x0) / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x0 + step * (i + 0.5)} cy={y} r={step / 2} fill={fill} />
      ))}
    </g>
  );
}

export function BoothArt({ variant }: { variant: 0 | 1 }) {
  // `w` flips sign between frames so every jittered element moves the other way.
  const w = variant === 0 ? 1 : -1;
  const id = (name: string) => `${name}-${variant}`;

  return (
    <svg
      viewBox="0 0 300 424"
      className="booth-art"
      role="img"
      aria-label="A paper cut-out photo booth. Tap to start."
    >
      <defs>
        {/* The soft shadow one sheet of paper casts on the one beneath it. */}
        <filter id={id('paper')} x="-12%" y="-12%" width="124%" height="124%">
          <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.6" floodColor="#6b5c4a" floodOpacity="0.28" />
        </filter>

        {/* Cut paper strips laid side by side. */}
        <pattern id={id('stripes')} width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="var(--blue)" />
          <rect width="15" height="30" fill="#e8f3fb" />
        </pattern>

        <pattern id={id('curtain')} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="var(--green)" />
          <rect width="8" height="16" fill="var(--green-deep)" />
        </pattern>

        <clipPath id={id('door')}>
          <rect x="102" y="132" width="96" height="192" rx="3" />
        </clipPath>
      </defs>

      {/* ---- legs ------------------------------------------------------------- */}
      <g filter={`url(#${id('paper')})`}>
        <rect x={56 + w} y="344" width="32" height="40" rx="2" fill="var(--blue-deep)" />
        <rect x={212 - w} y="344" width="32" height="40" rx="2" fill="var(--blue-deep)" />
      </g>

      {/* ---- booth body --------------------------------------------------------
          An under-sheet peeking out, the way a layered paper collage does. */}
      <rect x="33" y="85" width="236" height="264" rx="3" fill="var(--blue-deep)" opacity="0.55" />
      <g filter={`url(#${id('paper')})`}>
        <rect x="34" y="80" width="232" height="264" rx="3" fill={`url(#${id('stripes')})`} />
      </g>

      {/* ---- awning ------------------------------------------------------------ */}
      <g transform={`rotate(${w * 0.4} 150 56)`} filter={`url(#${id('paper')})`}>
        <Scallops x0={24} x1={276} y={84} r={13} fill="var(--pink-deep)" />
        <path
          d={`M 24,${84 + w * 0.5} L 24,40 Q 24,20 52,19 L 248,${20 - w * 0.5} Q 276,20 276,40 L 276,${84 - w * 0.5} Z`}
          fill="var(--pink)"
        />
      </g>

      {/* ---- PHOTO BOOTH letters ------------------------------------------------ */}
      <LetterRow word="PHOTO" y={26} w={w} shadow={id('paper')} />
      <LetterRow word="BOOTH" y={54} w={-w} shadow={id('paper')} />

      {/* ---- doorway ------------------------------------------------------------ */}
      <g filter={`url(#${id('paper')})`}>
        <rect x="96" y="126" width="108" height="204" rx="4" fill="var(--yellow-deep)" />
      </g>
      <rect x="102" y="132" width="96" height="192" rx="3" fill="#6a5c4c" />

      <g clipPath={`url(#${id('door')})`}>
        <rect x="102" y="132" width="96" height="192" fill="var(--yellow)" />
        <path d="M 102,132 L 130,132 L 124,324 L 102,324 Z" fill="var(--yellow-deep)" opacity="0.7" />

        {/* SMILE! sign */}
        <g transform={`rotate(${-w * 2} 142 182)`} filter={`url(#${id('paper')})`}>
          <rect x="112" y="156" width="60" height="52" fill="#fffdf6" />
          <text x="142" y="176" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="16" fill={INK}>
            SMILE!
          </text>
          {/* two eyes over an upturned mouth */}
          <circle cx="132" cy="188" r="2.6" fill={INK} />
          <circle cx="152" cy="188" r="2.6" fill={INK} />
          <path d="M 130,194 Q 142,206 154,194" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="124" cy="194" r="2.4" fill="var(--pink-deep)" />
          <circle cx="160" cy="194" r="2.4" fill="var(--pink-deep)" />
        </g>

        {/* stool */}
        <g transform={`translate(${w * 0.8} 0)`} filter={`url(#${id('paper')})`}>
          <ellipse cx="140" cy="272" rx="23" ry="8" fill="var(--pink)" />
          <rect x="133" y="274" width="14" height="32" fill="var(--pink-deep)" />
          <ellipse cx="140" cy="308" rx="18" ry="6" fill="var(--pink-deep)" />
        </g>

        {/* curtain, pulled to one side */}
        <g filter={`url(#${id('paper')})`}>
          <path
            d={`M ${158 + w},132 L 198,132 L 198,324 L ${163 - w},324
                Q ${178 + w * 2},274 ${160 - w},224
                Q ${174 + w * 2},176 ${158 + w},132 Z`}
            fill={`url(#${id('curtain')})`}
          />
        </g>
        <Scallops x0={102} x1={198} y={140} r={8} fill="var(--green)" />
        <rect x="102" y="126" width="96" height="15" fill="var(--green)" />
      </g>

      {/* ---- lens -------------------------------------------------------------- */}
      <g transform={`rotate(${-w} 150 108)`} filter={`url(#${id('paper')})`}>
        <rect x="126" y="96" width="48" height="25" rx="3" fill="#fffdf6" />
        <circle cx="150" cy="108" r="8" fill="var(--blue-deep)" />
        <circle cx="150" cy="108" r="2.8" fill={INK} />
        <circle cx="164" cy="101" r="2.2" fill="var(--pink-deep)" />
      </g>

      {/* ---- FREE sign ---------------------------------------------------------- */}
      <g transform={`rotate(${w * 2} 62 200)`} filter={`url(#${id('paper')})`}>
        <rect x="34" y="158" width="56" height="86" rx="2" fill="var(--pink-deep)" />
        <rect x="34" y="154" width="56" height="86" rx="2" fill="var(--yellow)" />
        <text x="62" y="186" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="26" fill={INK}>
          FREE
        </text>
        <line x1="44" y1="194" x2="80" y2="194" stroke={INK} strokeWidth="1.4" opacity="0.5" />
        <text x="62" y="212" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="13" fill={INK}>
          no coins
        </text>
        <text x="62" y="228" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="13" fill={INK}>
          needed
        </text>
      </g>

      {/* ---- tap-to-start label -------------------------------------------------
          With the Start button gone this is the only cue that the booth is the
          thing to press, so it lives in the art rather than beside it. */}
      <g transform={`rotate(${-w * 1.2} 150 372)`} filter={`url(#${id('paper')})`}>
        <rect x="88" y="354" width="124" height="34" rx="17" fill="var(--yellow)" />
        <text x="150" y="378" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="22" fill={INK}>
          tap to start!
        </text>
      </g>

      {/* ---- stars --------------------------------------------------------------- */}
      <Star x={48} y={112} size={11} rot={w * 10} fill="var(--pink-deep)" />
      <Star x={256} y={120} size={9} rot={-w * 14} fill="var(--green-deep)" />
      <Star x={46} y={288} size={9} rot={w * 18} fill="var(--yellow-deep)" />
      <Star x={258} y={276} size={12} rot={-w * 8} fill="var(--pink-deep)" />
      <Star x={80} y={324} size={7} rot={w * 22} fill="var(--green-deep)" />
      <Star x={222} y={324} size={8} rot={-w * 16} fill="var(--yellow-deep)" />
    </svg>
  );
}

/** One row of the sign: cut paper tiles with a letter on each. */
function LetterRow({ word, y, w, shadow }: { word: string; y: number; w: number; shadow: string }) {
  const size = 25;
  const gap = 3;
  const total = word.length * size + (word.length - 1) * gap;
  const startX = (300 - total) / 2;

  return (
    <g filter={`url(#${shadow})`}>
      {word.split('').map((letter, i) => {
        const x = startX + i * (size + gap);
        // Alternate the tilt letter by letter so the row looks hand-placed.
        const tilt = (i % 2 === 0 ? 1 : -1) * w * 2;
        return (
          <g key={i} transform={`rotate(${tilt} ${x + size / 2} ${y + size / 2})`}>
            <rect x={x} y={y} width={size} height={size} rx="1.5" fill="#fffdf6" />
            <text
              x={x + size / 2}
              y={y + size / 2 + 7}
              textAnchor="middle"
              fontFamily={HAND}
              fontWeight="700"
              fontSize="22"
              fill={INK}
            >
              {letter}
            </text>
          </g>
        );
      })}
    </g>
  );
}
