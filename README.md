# AI Scam Calls Demo

A React/TypeScript web application that demonstrates the potential dangers of AI-generated voice calls using the ElevenLabs API and Google Gemini API.

## Features

- **Victim Profile Creation**: Enter a name and description for the victim
- **Caller Profile Creation**: Enter the name, role, and organization for the caller/scammer
- **Voice Selection**: Choose between ElevenLabs default voices (Eric, Jessica) or create custom voices
- **Custom Voice Generation**: Generate personalized AI voices using the caller profile and optional additional descriptions
- **Voice Preview**: Generate and auto-play previews of selected voices
- **Scam Call Script Generation**: Generate scam call scenarios using Google Gemini API, based on the victim and caller profiles
- **Script Display**: View generated scam call scripts before audio playback
- **Scam Call Playback**: Play generated scam call audio with selected voices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- ElevenLabs API key (required for voice generation)
- Google Gemini API key (required for custom voice generation and scam call scripts)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your API keys:
```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local and add your actual API keys
REACT_APP_ELEVENLABS_API_KEY=your_actual_elevenlabs_key
REACT_APP_GEMINI_API_KEY=your_actual_gemini_key
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technologies Used

- React 18
- TypeScript
- ElevenLabs REST API
- Google Gemini AI API
- CSS (minimal styling)
- Create React App

## Disclaimer

⚠️ **This tool is for educational purposes only.** 

AI-generated scam calls are a real threat that can be used to:
- Impersonate loved ones
- Extract sensitive information
- Commit financial fraud
- Manipulate vulnerable individuals

This demonstration shows how easily AI technology can be maliciously used and highlights the importance of education about AI threats.

## Security Notes

- Never share your API keys publicly
- Use environment variables to store API keys securely
- The `.env.local` file is already in `.gitignore` to prevent accidental commits
- Use this tool responsibly and ethically
- Consider the implications of AI voice technology
- Educate others about AI security threats 