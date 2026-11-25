import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts (bundled by Vite, no external CDN)
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/500.css';
import '@fontsource/noto-sans-arabic/700.css';

// Order matters: tokens → themes → global styles
import './styles/variables.css';
import './styles/themes.css';
import './styles/globals.css';

import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);