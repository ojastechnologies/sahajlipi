import { useState } from 'react';
import { createRoot } from 'react-dom/client';

// A controlled input, the common React form pattern.
function App() {
  const [value, setValue] = useState('');
  const [renders, setRenders] = useState(0);
  return (
    <>
      <input id="controlled" type="text" value={value} onChange={(event) => setValue(event.target.value)} />
      <output id="mirror">{value}</output>
      <button id="rerender" type="button" onClick={() => setRenders(renders + 1)}>Re-render {renders}</button>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
