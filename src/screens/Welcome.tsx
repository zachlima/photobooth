import { BoothArt } from '../art/BoothArt';
import { CameraIcon, PickIcon, StripIcon } from '../art/StepIcons';
import { navigate } from '../hooks/useHashRoute';
import './welcome.css';

const STEPS = [
  { n: 1, label: 'Pick a look', Icon: PickIcon },
  { n: 2, label: 'Say cheese', Icon: CameraIcon },
  { n: 3, label: 'Take it home', Icon: StripIcon },
];

export function Welcome() {
  const start = () => navigate('settings');

  return (
    <main className="screen">
      <div className="screen__body welcome__body">
        {/* The illustration is the only control on this screen; the
            "tap to start!" label lives inside the artwork.
            The stage owns the height; both frames are absolutely positioned so
            each gets a definite box. Safari does not reliably pass a flex
            height through a <button>, which left frame A collapsed and made
            the flipbook blink on and off instead of alternating. Spans, not
            divs: a <button> may only contain phrasing content. */}
        <div className="booth-stage">
          <button className="booth-flip" onClick={start} aria-label="Start the photo booth">
            <span className="booth-flip__frame">
              <BoothArt variant={0} />
            </span>
            <span className="booth-flip__frame booth-flip__frame--b">
              <BoothArt variant={1} />
            </span>
          </button>
        </div>

        <ol className="steps">
          {STEPS.map(({ n, label, Icon }) => (
            <li key={n} className="steps__item">
              <span className="steps__num">{n}</span>
              <span className="steps__icon">
                <Icon />
              </span>
              <span className="steps__label">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
