import { useEffect, useRef, useState } from 'react';
import { createEngine } from 'sahajlipi';
import { attachNepaliInput } from 'sahajlipi/dom';
import type { InputState, NepaliInputController } from 'sahajlipi/dom';

const engine = createEngine();

interface NepaliInputProps {
  defaultValue?: string;
  onLifecycle?: (event: 'attached' | 'destroyed') => void;
}

export function NepaliInput({ defaultValue = '', onLifecycle }: NepaliInputProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<NepaliInputController | null>(null);
  const [state, setState] = useState<InputState>({
    text: defaultValue,
    enabled: true,
    activeRoman: '',
    candidates: [],
  });

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const controller = attachNepaliInput(field, {
      convertWord: engine.convertWord,
      convertText: engine.convertText,
      onStateChange: setState,
    });
    controllerRef.current = controller;
    onLifecycle?.('attached');
    return () => {
      controller.destroy();
      controllerRef.current = null;
      onLifecycle?.('destroyed');
    };
  }, [onLifecycle]);

  return (
    <section>
      <label htmlFor="react-nepali-input">Nepali message</label>
      {/* The adapter owns the value. React observes state but does not write value. */}
      <textarea id="react-nepali-input" ref={fieldRef} defaultValue={defaultValue} rows={4} />
      <button
        id="react-mode-toggle"
        type="button"
        onClick={() => controllerRef.current?.setEnabled(!state.enabled)}
      >
        {state.enabled ? 'Switch to English' : 'Switch to Nepali'}
      </button>
      <div id="react-candidates" role="group" aria-label="Spelling alternatives" hidden={state.candidates.length < 2}>
        {state.candidates.map((text, index) => (
          <button
            key={`${index}:${text}`}
            type="button"
            data-candidate-index={index}
            onMouseDown={event => event.preventDefault()}
            onClick={() => controllerRef.current?.chooseCandidate(index)}
          >
            {text}
          </button>
        ))}
      </div>
      <p>Latest adapter text:</p>
      <output id="react-current-text">{state.text}</output>
    </section>
  );
}
