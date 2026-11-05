import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AMBIENCES } from "../utils/ambience";
import type { AmbienceId } from "../utils/ambience";

type Props = { value: AmbienceId; onChange: (id: AmbienceId) => void };

/** Four jewel swatches that re-light the room. */
export default function AmbiencePicker({ value, onChange }: Props) {
  const [preview, setPreview] = useState<AmbienceId | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const shown = AMBIENCES.find((a) => a.id === (preview ?? value)) ?? AMBIENCES[0];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = AMBIENCES.findIndex((a) => a.id === value);
    const next = (index + step + AMBIENCES.length) % AMBIENCES.length;
    onChange(AMBIENCES[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div className="ambience">
      <div className="ambience__swatches" role="radiogroup" aria-label="Ambience" onKeyDown={onKeyDown}>
        {AMBIENCES.map((ambience, i) => {
          const selected = ambience.id === value;
          return (
            <button
              key={ambience.id}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={ambience.label}
              tabIndex={selected ? 0 : -1}
              className={`ambience__swatch ambience__swatch--${ambience.id}`}
              onClick={() => onChange(ambience.id)}
              onPointerEnter={() => setPreview(ambience.id)}
              onPointerLeave={() => setPreview(null)}
              onFocus={() => setPreview(ambience.id)}
              onBlur={() => setPreview(null)}
            />
          );
        })}
      </div>
      <span className="ambience__label" key={shown.id} aria-hidden="true">
        {shown.label}
      </span>
    </div>
  );
}
