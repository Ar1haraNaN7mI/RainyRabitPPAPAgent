import { renderToString } from 'react-dom/server';
import App from './App';

// This entry runs only while generating the static marketing page.
export function render() {
  return renderToString(<App />);
}
