import { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NepaliInput } from './NepaliInput.js';

function App() {
  const [mounted, setMounted] = useState(true);
  const [lifecycle, setLifecycle] = useState({ attached: 0, destroyed: 0 });
  const onLifecycle = useCallback((event: 'attached' | 'destroyed') => {
    setLifecycle(previous => ({ ...previous, [event]: previous[event] + 1 }));
  }, []);

  return (
    <main>
      <h1>React with an uncontrolled textarea</h1>
      <p>Type <code>paani</code>, <code>kam</code>, or <code>123</code>. React renders suggestions and observes the adapter state; the adapter owns the textarea value.</p>
      <button id="toggle-editor" type="button" onClick={() => setMounted(value => !value)}>
        {mounted ? 'Unmount editor' : 'Mount editor'}
      </button>
      {mounted && <NepaliInput onLifecycle={onLifecycle} />}
      <label htmlFor="react-english-input">Separate English field</label>
      <input id="react-english-input" type="text" />
      <p id="lifecycle-status" role="status">
        Attached: {lifecycle.attached}; destroyed: {lifecycle.destroyed}
      </p>
      <p>StrictMode exercises effect setup and cleanup. Unmounting calls <code>destroy()</code>; remounting attaches a new controller. This example does not demonstrate a controlled textarea.</p>
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('React example root was not found');
createRoot(root).render(<StrictMode><App /></StrictMode>);
