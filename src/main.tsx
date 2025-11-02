import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { validateBackendConfiguration } from './utils/backendHealth';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Detect if user prefers dark mode
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

function renderLoadingScreen() {
  const bg = isDarkMode
    ? 'linear-gradient(135deg, #121212 60%, #1E1E1E 30%, #2C2C2C 10%)'
    : 'linear-gradient(135deg, #008080 60%, #607D4B 30%, #880044 10%)';
  const color = isDarkMode ? '#ffffff' : '#ffffff';

  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: ${bg};
      color: ${color};
      font-family: 'Inter', sans-serif;
    ">
      <div style="margin-bottom: 20px; font-size: 1.4em; font-weight: 500;">
        <span style="opacity: 0.9;">Connecting to</span> 
        <span style="font-weight: 700;">Wasel</span> 🚗
      </div>
      <div style="
        border: 6px solid rgba(255, 255, 255, 0.3);
        border-top: 6px solid white;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      "></div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <p style="margin-top: 25px; font-size: 0.9em; opacity: 0.8;">
        Checking backend connection...
      </p>
    </div>
  `;
}

function renderErrorScreen(message: string) {
  const bg = isDarkMode ? '#1E1E1E' : '#fff5f5';
  const color = isDarkMode ? '#ff6b6b' : '#880044';
  const buttonBg = isDarkMode ? '#008080' : '#008080';
  const buttonColor = isDarkMode ? '#fff' : '#fff';

  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: ${bg};
      color: ${color};
      font-family: 'Inter', sans-serif;
      text-align: center;
      padding: 0 20px;
    ">
      <h1 style="font-size: 1.8em;">⚠️ Backend Connection Error</h1>
      <p style="max-width: 400px; line-height: 1.5; margin-top: 10px;">${message}</p>
      <button style="
        margin-top: 25px;
        background-color: ${buttonBg};
        color: ${buttonColor};
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 1em;
        cursor: pointer;
      " onclick="window.location.reload()">Retry</button>
    </div>
  `;
}

async function startApp() {
  renderLoadingScreen();

  try {
    console.log('🚀 Starting Wasel application...');
    await validateBackendConfiguration();

    console.log('✅ App starting...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error: any) {
    console.error('❌ Startup error:', error);
    // Still render the app even if backend validation fails
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

startApp();