import { useState } from 'react';
import { ArrowLeft, Key } from 'lucide-react';

function SettingsScreen({ onBack }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('charchat_api_key') || '');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('charchat_api_key', apiKey.trim());
    alert("API Key saved successfully!");
    onBack();
  };

  return (
    <div className="screen-container">
      <div className="chat-header">
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-info">
          <h2>Settings</h2>
        </div>
      </div>

      <div className="form-container">
        <div className="form-info-box">
          <h3>How to get an API Key</h3>
          <p>Since this app uses Google's advanced Gemini AI, it requires an API key to function. This key acts as a secure password between this app and Google's servers.</p>
          <ol>
            <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{color: 'var(--accent-color)'}}>Google AI Studio</a></li>
            <li>Sign in and click <strong>Get API Key</strong></li>
            <li>Click <strong>Create API Key</strong></li>
            <li>Copy the key (it starts with <code>AIzaSy</code>) and paste it below!</li>
          </ol>
          <p style={{marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Your key is stored securely in your browser's local storage. It is never sent anywhere except directly to Google.</p>
        </div>

        <form onSubmit={handleSave} className="character-form">
          <div className="form-group">
            <label>
              <Key size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              Gemini API Key
            </label>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="save-btn">
            Save API Key
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsScreen;
