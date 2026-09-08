const S = { fill: 'none', stroke: '#423a32', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** 1 — pick a look. Sliders, because settings is a choice between presets. */
export function PickIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <line x1="7" y1="6" x2="7" y2="26" {...S} />
      <line x1="16" y1="6" x2="16" y2="26" {...S} />
      <line x1="25" y1="6" x2="25" y2="26" {...S} />
      <circle cx="7" cy="11" r="3.5" {...S} fill="var(--pink)" />
      <circle cx="16" cy="20" r="3.5" {...S} fill="var(--green)" />
      <circle cx="25" cy="13" r="3.5" {...S} fill="var(--yellow)" />
    </svg>
  );
}

/** 2 — say cheese. */
export function CameraIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 10h5l2-3h10l2 3h5v15H4z" {...S} fill="var(--blue)" />
      <circle cx="16" cy="17" r="5" {...S} fill="#fff" />
      <circle cx="16" cy="17" r="1.6" fill="#423a32" />
    </svg>
  );
}

/** 3 — take it home. A strip dropping out of the slot. */
export function StripIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="10" y="3" width="12" height="21" {...S} fill="var(--yellow)" />
      <line x1="10" y1="10" x2="22" y2="10" {...S} />
      <line x1="10" y1="17" x2="22" y2="17" {...S} />
      <path d="M16 24v5m0 0-3-3m3 3 3-3" {...S} />
    </svg>
  );
}
