import { filterById, type FilterId } from '../types';

/**
 * The parts of a filter that aren't a colour matrix: darkened corners and
 * grain. Rendered over the live preview and over each settings swatch, with
 * the same strengths the capture uses, so the preview stays honest.
 */
export function FilterOverlays({ filter }: { filter: FilterId }) {
  const { vignette, grain } = filterById(filter);
  return (
    <>
      {vignette ? (
        <span className="vignette" style={{ '--vignette': vignette } as React.CSSProperties} />
      ) : null}
      {grain ? (
        <span className="grain" style={{ '--grain': grain } as React.CSSProperties} />
      ) : null}
    </>
  );
}
