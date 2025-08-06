import React, { useState, useRef } from 'react';
import './App.css';
import { elevenLabsService } from './services/elevenlabsService';

interface VictimData {
  name: string;
  description: string;
}

interface CallerData {
  name: string;
  relationship: string;
  organization: string;
  customPrompt: string;
}

const App: React.FC = () => {
  const [victimData, setVictimData] = useState<VictimData>({
    name: '',
    description: ''
  });
  
  const [callerData, setCallerData] = useState<CallerData>({
    name: '',
    relationship: '',
    organization: '',
    customPrompt: ''
  });
  
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingScamCall, setIsGeneratingScamCall] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPlayingScamCall, setIsPlayingScamCall] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_ELEVENLABS_API_KEY || '');
  const [geminiApiKey, setGeminiApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoAudioURL, setDemoAudioURL] = useState<string>('');
  const [scamCallAudioURL, setScamCallAudioURL] = useState<string>('');
  const [voiceDescription, setVoiceDescription] = useState<string>('');
  const [customVoiceId, setCustomVoiceId] = useState<string>('');
  const [voiceGenerationError, setVoiceGenerationError] = useState<string>('');
  const [selectedVoiceType, setSelectedVoiceType] = useState<'eric' | 'jessica' | 'custom'>('eric');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [customVoiceDescription, setCustomVoiceDescription] = useState<string>('');

  const demoAudioRef = useRef<HTMLAudioElement>(null);
  const scamCallAudioRef = useRef<HTMLAudioElement>(null);

  const handleInputChange = (field: keyof VictimData, value: string) => {
    setVictimData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCallerInputChange = (field: keyof CallerData, value: string) => {
    setCallerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateVoice = async () => {
    if (!apiKey) {
      setError('ElevenLabs API key not found. Please add REACT_APP_ELEVENLABS_API_KEY to your .env.local file.');
      return;
    }
    if (!geminiApiKey) {
      setError('Google Gemini API key is required for custom voice generation. Please add REACT_APP_GEMINI_API_KEY to your .env.local file.');
      return;
    }
    if (!callerData.name) {
      setError('Please fill in the caller name for custom voice generation');
      return;
    }

    setIsGeneratingVoice(true);
    setError('');
    setSuccess('');
    setVoiceGenerationError('');

    try {
      // Initialize the ElevenLabs service
      elevenLabsService.initialize(apiKey);
      
      // Generate a custom voice using the caller's profile and Gemini
      const result = await elevenLabsService.generateCustomVoice(callerData, geminiApiKey, customVoiceDescription);
      
      // Create audio blob and URL
      const audioBlob = elevenLabsService.createAudioBlob(result.audioBuffer);
      const audioURL = elevenLabsService.createAudioURL(audioBlob);
      
      console.log('Audio buffer size:', result.audioBuffer.byteLength);
      console.log('Audio blob size:', audioBlob.size);
      console.log('Audio URL created:', audioURL);
      
      setDemoAudioURL(audioURL);
      setVoiceDescription(result.voiceDescription);
      setCustomVoiceId(result.voiceId);
      setSuccess('Custom voice generated successfully!');
      console.log('Voice generation result:', result); // Debug log
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate voice. Please check your API key.';
      setVoiceGenerationError(errorMessage);
      setError(''); // Clear any previous general errors
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const generateScamCall = async () => {
    if (!apiKey) {
      setError('ElevenLabs API key not found. Please add REACT_APP_ELEVENLABS_API_KEY to your .env.local file.');
      return;
    }
    if (!geminiApiKey) {
      setError('Google Gemini API key is required for scam call script generation. Please add REACT_APP_GEMINI_API_KEY to your .env.local file.');
      return;
    }
    if (!victimData.name) {
      setError('Please fill in the victim name');
      return;
    }

    setIsGeneratingScamCall(true);
    setError('');
    setSuccess('');
    setGeneratedScript('');

    try {
      // Initialize the ElevenLabs service
      elevenLabsService.initialize(apiKey);
      
      // Determine which voice ID to use based on selection
      let voiceIdToUse = '';
      if (selectedVoiceType === 'eric') {
        voiceIdToUse = 'cjVigY5qzO86Huf0OWal';
      } else if (selectedVoiceType === 'jessica') {
        voiceIdToUse = 'cgSgspJ2msm6clMCkdW9';
      } else if (selectedVoiceType === 'custom') {
        voiceIdToUse = customVoiceId;
      }

      // Generate scam call script and audio
      const { audioBuffer, script } = await elevenLabsService.generateScamCallAudio(
        victimData.name, 
        victimData.description, 
        geminiApiKey,
        callerData,
        voiceIdToUse
      );
      
      // Create audio blob and URL
      const audioBlob = elevenLabsService.createAudioBlob(audioBuffer);
      const audioURL = elevenLabsService.createAudioURL(audioBlob);
      
      setScamCallAudioURL(audioURL);
      setGeneratedScript(script);
      setSuccess('Scam call script generated successfully! You can now play the audio.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scam call script. Please check your API key.');
    } finally {
      setIsGeneratingScamCall(false);
    }
  };

  const generateVoicePreview = async () => {
    if (!apiKey) {
      setError('ElevenLabs API key not found. Please add REACT_APP_ELEVENLABS_API_KEY to your .env.local file.');
      return;
    }

    setIsPlayingDemo(true);
    setError('');
    setSuccess('');

    try {
      // Initialize the ElevenLabs service
      elevenLabsService.initialize(apiKey);
      
      // Determine which voice ID to use based on selection
      let voiceIdToUse = '';
      if (selectedVoiceType === 'eric') {
        voiceIdToUse = 'cjVigY5qzO86Huf0OWal';
      } else if (selectedVoiceType === 'jessica') {
        voiceIdToUse = 'cgSgspJ2msm6clMCkdW9';
      } else if (selectedVoiceType === 'custom') {
        voiceIdToUse = customVoiceId;
        if (!customVoiceId) {
          setError('Please generate a custom voice first');
          return;
        }
      }

      // Generate demo audio
      const audioBuffer = await elevenLabsService.generateVoice('Hello, this is a preview of the selected voice.', voiceIdToUse);
      
      // Create audio blob and URL
      const audioBlob = elevenLabsService.createAudioBlob(audioBuffer);
      const audioURL = elevenLabsService.createAudioURL(audioBlob);
      
      setDemoAudioURL(audioURL);
      setSuccess('Voice preview generated successfully!');
      
      // Auto-play the preview
      if (demoAudioRef.current) {
        demoAudioRef.current.play();
        demoAudioRef.current.onended = () => {
          setIsPlayingDemo(false);
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voice preview. Please check your API key.');
    } finally {
      setIsPlayingDemo(false);
    }
  };

  const playScamCallAudio = () => {
    if (scamCallAudioURL && scamCallAudioRef.current) {
      setIsPlayingScamCall(true);
      scamCallAudioRef.current.play();
      
      scamCallAudioRef.current.onended = () => {
        setIsPlayingScamCall(false);
      };
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Scam Calls Demo</h1>
        <p>Demonstrating the potential dangers of AI-generated voice calls</p>
        <div className="warning-banner">
          ⚠️ This is a demonstration tool. AI-generated scam calls are a real threat.
        </div>
      </header>
      
      <main className="App-main">
        <div className="api-key-section">
          <h2>API Configuration</h2>
          <div className="api-status">
            <div className="status-item">
              <span className="status-label">ElevenLabs API:</span>
              <span className={`status-indicator ${apiKey ? 'connected' : 'missing'}`}>
                {apiKey ? '✓ Connected' : '✗ Missing'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Google Gemini API:</span>
              <span className={`status-indicator ${geminiApiKey ? 'connected' : 'optional'}`}>
                {geminiApiKey ? '✓ Connected' : '○ Optional'}
              </span>
            </div>
          </div>
          <p className="api-note">
            API keys are loaded from environment variables. See <a href="https://github.com/your-repo/ai-scam-calls-demo#getting-started" target="_blank" rel="noopener noreferrer">README</a> for setup instructions.
          </p>
        </div>

        <div className="victim-section">
          <h2>Victim Profile</h2>
          <div className="input-group">
            <input
              type="text"
              value={victimData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Victim's name"
              className="text-input"
            />
          </div>
          <div className="input-group">
            <textarea
              value={victimData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="A short description about the victim (age, background, etc.)"
              className="description-input"
              rows={3}
            />
          </div>
        </div>

        <div className="caller-section">
          <h2>Caller Profile (Optional)</h2>
          <p className="section-description">
            Define who the scammer is pretending to be.
          </p>
          <div className="input-group">
            <input
              type="text"
              value={callerData.name}
              onChange={(e) => handleCallerInputChange('name', e.target.value)}
              placeholder="Caller's name"
              className="text-input"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={callerData.relationship}
              onChange={(e) => handleCallerInputChange('relationship', e.target.value)}
              placeholder="Relationship (e.g., grandson, IRS agent, banker)"
              className="text-input"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={callerData.organization}
              onChange={(e) => handleCallerInputChange('organization', e.target.value)}
              placeholder="Organization (e.g., IRS, Microsoft, Bank of America)"
              className="text-input"
            />
          </div>
          <div className="input-group">
            <textarea
              value={callerData.customPrompt}
              onChange={(e) => handleCallerInputChange('customPrompt', e.target.value)}
              placeholder="Custom prompt (optional - leave empty to let Gemini generate a prompt)"
              className="description-input"
              rows={3}
            />
          </div>
        </div>

        <div className="voice-generation-section">
          <h2>Voice Selection</h2>
          <p className="section-description">
            Choose a voice for the scammer. You can use default voices or create a custom voice.
          </p>
          
          <div className="voice-selection">
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="voiceType"
                  value="eric"
                  checked={selectedVoiceType === 'eric'}
                  onChange={(e) => setSelectedVoiceType(e.target.value as 'eric' | 'jessica' | 'custom')}
                />
                <span className="radio-label">Eric (ElevenLabs default voice)</span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="voiceType"
                  value="jessica"
                  checked={selectedVoiceType === 'jessica'}
                  onChange={(e) => setSelectedVoiceType(e.target.value as 'eric' | 'jessica' | 'custom')}
                />
                <span className="radio-label">Jessica (ElevenLabs default voice)</span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="voiceType"
                  value="custom"
                  checked={selectedVoiceType === 'custom'}
                  onChange={(e) => setSelectedVoiceType(e.target.value as 'eric' | 'jessica' | 'custom')}
                />
                <span className="radio-label">Create custom voice from caller description</span>
              </label>
            </div>
          </div>

          {selectedVoiceType === 'custom' && (
            <div className="custom-voice-section">
              <p className="section-description">
                Generate a custom voice for the scammer using AI-generated descriptions based on the caller profile.
              </p>
              <div className="input-group">
                <textarea
                  value={customVoiceDescription}
                  onChange={(e) => setCustomVoiceDescription(e.target.value)}
                  placeholder="Describe your custom voice here (optional)."
                  className="description-input"
                  rows={3}
                />
              </div>
              <div className="button-group">
                <button 
                  onClick={generateVoice}
                  disabled={isGeneratingVoice || !apiKey || !geminiApiKey || !callerData.name}
                  className="generate-button"
                >
                  {isGeneratingVoice ? 'Generating Voice...' : 'Generate Custom Voice'}
                </button>
                {voiceGenerationError && (
                  <div className="voice-generation-error">
                    <strong>Voice Generation Error:</strong> {voiceGenerationError}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="demo-audio-section">
            <h3>Voice Preview</h3>
            <p className="section-description">
              Generate and play a preview of the selected voice.
            </p>
            <div className="button-group">
              <button 
                onClick={generateVoicePreview}
                disabled={isPlayingDemo || !apiKey}
                className="generate-button"
              >
                {isPlayingDemo ? 'Generating Preview...' : 'Generate Voice Preview'}
              </button>
              {demoAudioURL && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Audio URL available: {demoAudioURL.substring(0, 50)}...
                </div>
              )}
            </div>
          </div>
        </div>

        {voiceDescription && (
          <div className="debug-section">
            <h3>Debug: Voice Description Generated by Gemini</h3>
            <div className="debug-content">
              <p><strong>Description fed into ElevenLabs:</strong></p>
              <div className="voice-description-box">
                {typeof voiceDescription === 'string' ? voiceDescription : JSON.stringify(voiceDescription, null, 2)}
              </div>
              {customVoiceId && (
                <p><strong>Custom Voice ID:</strong> {customVoiceId}</p>
              )}
            </div>
          </div>
        )}

        <div className="scam-call-section">
          <h2>Scam Call Generation</h2>
          <div className="scam-warning">
            ⚠️ This will generate a simulated scam call using the selected voice.
          </div>
          <div className="button-group">
            <button 
              onClick={generateScamCall}
              disabled={isGeneratingScamCall || !apiKey || !geminiApiKey || !victimData.name || (selectedVoiceType === 'custom' && !customVoiceId)}
              className="scam-generate-button"
            >
              {isGeneratingScamCall ? 'Generating Scam Call...' : 'Generate Scam Call Script'}
            </button>
            <button 
              onClick={playScamCallAudio}
              disabled={isPlayingScamCall || !scamCallAudioURL}
              className="scam-play-button"
            >
              {isPlayingScamCall ? 'Playing Scam Call...' : 'Play Scam Call Audio'}
            </button>
          </div>
          
          {generatedScript && (
            <div className="generated-script-section">
              <h3>Generated Script</h3>
              <div className="script-content">
                <p><strong>Script:</strong></p>
                <div className="script-text">
                  {generatedScript}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="info-section">
          <h3>How This Works</h3>
          <p>
            This demo uses the <a href="https://elevenlabs.io/docs/api-reference/introduction" target="_blank" rel="noopener noreferrer">ElevenLabs API</a> and the <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer">Google Gemini API</a> to:
          </p>
          <ul>
            <li>Generate a realistic scam call script using descriptions of the victim and caller</li>
            <li>Optionally generate a unique voice based on the caller's description</li>
            <li>Create realistic scam call audio using AI voice synthesis</li>
            <li>Demonstrate how AI can be used maliciously</li>
          </ul>
          <div className="disclaimer">
            <strong>Disclaimer:</strong> This tool is for educational purposes only. 
            AI-generated scam calls are a real threat that can be used to 
            impersonate loved ones or professionals and extract sensitive information.
          </div>
        </div>
      </main>
      
      {/* Hidden audio elements for playback */}
      {demoAudioURL && (
        <audio ref={demoAudioRef} src={demoAudioURL} preload="auto" />
      )}
      {scamCallAudioURL && (
        <audio ref={scamCallAudioRef} src={scamCallAudioURL} preload="auto" />
      )}
    </div>
  );
};

export default App; 