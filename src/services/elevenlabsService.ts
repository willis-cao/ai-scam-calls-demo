import { geminiService } from './geminiService';

class ElevenLabsService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.elevenlabs.io/v1';

  initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateVoice(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not provided. Please enter your API key.');
    }

    try {
      const response = await fetch(`${this.baseURL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.3,
            speed: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating voice:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate voice. Please check your API key and try again.');
    }
  }

  async generateCustomVoice(callerData: any, geminiApiKey?: string, customVoiceDescription?: string): Promise<{ audioBuffer: ArrayBuffer; voiceDescription: string; voiceId: string }> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not provided. Please enter your API key.');
    }

    // Generate voice description using Gemini
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required for custom voice generation. Please provide your Gemini API key.');
    }

    geminiService.initialize(geminiApiKey);
    // Generate voice description using Gemini based on caller data
    const voiceDescription = await geminiService.generateVoiceDescription(callerData, customVoiceDescription);

          // Get voice previews using the text-to-voice design endpoint
      try {
        console.log('Sending to design endpoint:', { voice_description: voiceDescription });
        const designResponse = await fetch(`${this.baseURL}/text-to-voice/design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          voice_description: voiceDescription,
          text: `Hi, this is ${callerData.name} from ${callerData.organization || 'the organization'}. This is a preview of the custom voice that will be used in the call. This is for demonstration purposes only.`
        })
      });

      if (!designResponse.ok) {
        const errorData = await designResponse.json().catch(() => ({}));
        console.error('Design response error:', errorData);
        
        // Extract detailed error message
        let errorMessage = '';
        if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.message || errorData.detail.detail || JSON.stringify(errorData.detail);
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `HTTP ${designResponse.status}: ${designResponse.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const designData = await designResponse.json();
      console.log('Design response:', designData); // Debug log
      
      if (!designData.previews || designData.previews.length === 0) {
        throw new Error('No voice previews generated. Please try a different description.');
      }

      // Take the first voice preview
      const firstPreview = designData.previews[0];
      const generatedVoiceId = firstPreview.generated_voice_id;
      console.log('Generated voice ID:', generatedVoiceId); // Debug log

      // Create the voice using the generated voice ID
      const voiceResponse = await fetch(`${this.baseURL}/text-to-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          voice_name: `${callerData.name}_voice`,
          voice_description: voiceDescription,
          generated_voice_id: generatedVoiceId
        })
      });

      if (!voiceResponse.ok) {
        const errorData = await voiceResponse.json().catch(() => ({}));
        console.error('Voice creation error:', errorData);
        
        // Extract detailed error message
        let errorMessage = '';
        if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.message || errorData.detail.detail || JSON.stringify(errorData.detail);
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `HTTP ${voiceResponse.status}: ${voiceResponse.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const voiceData = await voiceResponse.json();
      const customVoiceId = voiceData.voice_id;
      console.log('Voice creation response:', voiceData); // Debug log

      // Generate audio using the custom voice
      const audioResponse = await fetch(`${this.baseURL}/text-to-speech/${customVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: `Hi, this is ${callerData.name} from ${callerData.organization || 'the organization'}. This is a demonstration of AI-generated voice technology.`,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json().catch(() => ({}));
        console.error('Audio generation error:', errorData);
        
        // Extract detailed error message
        let errorMessage = '';
        if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.message || errorData.detail.detail || JSON.stringify(errorData.detail);
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `HTTP ${audioResponse.status}: ${audioResponse.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      console.log('Audio generation successful, buffer size:', audioBuffer.byteLength);

      return {
        audioBuffer: audioBuffer,
        voiceDescription: voiceDescription,
        voiceId: customVoiceId
      };
    } catch (error) {
      console.error('Error generating custom voice:', error);
      if (error instanceof Error) {
        throw error;
      }
      // Handle error objects that might contain more details
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Failed to generate custom voice: ${error.message}`);
      }
      if (error && typeof error === 'object' && 'detail' in error) {
        throw new Error(`Failed to generate custom voice: ${error.detail}`);
      }
      throw new Error('Failed to generate custom voice. Please check your API key and try again.');
    }
  }



  async generateScamCallScript(victimName: string, victimDescription: string, geminiApiKey?: string, callerData?: any): Promise<string> {
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required for scam call script generation. Please provide your Gemini API key.');
    }

    geminiService.initialize(geminiApiKey);
    const scamScript = await geminiService.generateCallScript({ name: victimName, description: victimDescription }, callerData);
    console.log('Generated scam script using Gemini:', scamScript);
    
    return scamScript;
  }

  async generateScamCallAudio(script: string, customVoiceId?: string): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not provided. Please enter your API key.');
    }

    console.log('Sending scam script to ElevenLabs:', script);
    console.log('Using voice ID:', customVoiceId || '21m00Tcm4TlvDq8ikWAM');
    
    try {
      const response = await fetch(`${this.baseURL}/text-to-speech/${customVoiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return audioBuffer;
    } catch (error) {
      console.error('Error generating scam call audio:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate scam call audio. Please check your API key and try again.');
    }
  }

  createAudioBlob(audioBuffer: ArrayBuffer): Blob {
    console.log('Creating audio blob from buffer size:', audioBuffer.byteLength);
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    console.log('Created blob size:', blob.size);
    return blob;
  }

  createAudioURL(audioBlob: Blob): string {
    console.log('Creating audio URL from blob size:', audioBlob.size);
    const url = URL.createObjectURL(audioBlob);
    console.log('Created audio URL:', url);
    return url;
  }

  async listVoices(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not provided. Please enter your API key.');
    }

    try {
      const response = await fetch(`${this.baseURL}/voices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing voices:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to list voices. Please check your API key and try again.');
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not provided. Please enter your API key.');
    }

    try {
      const response = await fetch(`${this.baseURL}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting voice ${voiceId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to delete voice ${voiceId}. Please check your API key and try again.`);
    }
  }
}

export const elevenLabsService = new ElevenLabsService(); 