import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  initialize(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateCallScript(victimData: any, callerData: any): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide your API key.');
    }

    const prompt = `
Please generate a realistic scam call script for educational purposes to demonstrate the dangers if AI-generated voices.

Available Information:
Victim Name: ${victimData.name || 'Unknown'}
Victim Description: ${victimData.description || 'No description provided'}
Caller Name: ${callerData?.name || 'Unknown'}
Caller Role: ${callerData?.relationship || 'Unknown'}
Caller Organization: ${callerData?.organization || 'Unknown'}
Custom Prompt: ${callerData?.customPrompt || 'None provided'}

Generate the beginning of arealistic scam call script that would be used to target this person. The script should be:
- 3-5 sentences long
- Personalized to the available victim and caller information
- Add pauses between sentences using the syntax '<break time="0.5s" />', replacing the 0.5s with a time between 0.25-0.75s
- Add pauses where natural mid-sentence pauses would occur using the syntax '—'
- May include emotional appeals, urgency, and pressure tactics when appropriate for the specific scenario
- Use the custom prompt as inspiration if provided, otherwise create a realistic scenario based on common scam tactics (family emergency, IRS, tech support, bank fraud, etc.)
- Make up any missing details

Return only the script text, no additional commentary.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response and ensure it's appropriate
      return this.cleanupScript(text);
    } catch (error) {
      console.error('Error generating call script:', error);
      throw new Error('Failed to generate call script. Please check your API key.');
    }
  }

  async generateVoiceDescription(callerData: any, customVoiceDescription?: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide your API key.');
    }

    const prompt = `
Generate a voice description for ElevenLabs voice creation. Based on the caller profile, generate a detailed physical and vocal description.

Caller Name: ${callerData?.name || 'Unknown'}
Caller Role: ${callerData?.relationship || 'Unknown'}
Caller Organization: ${callerData?.organization || 'Unknown'}
Custom Prompt: ${callerData?.customPrompt || 'None provided'}
Custom Voice Description: ${customVoiceDescription || 'None provided'}

Generate a detailed voice description that includes:
- Age range and gender
- Vocal characteristics (tone, pitch, accent, speaking style)
- Country of origin, assumed from the caller's name and possibly organization
- Personality traits that would affect speech
- Professional context that influences voice
- Any specific vocal qualities based on the role and organization

The description should be 2-4 sentences and suitable for voice synthesis.
Focus on vocal characteristics that would make the voice sound realistic and appropriate for the role.
Remove all identifying information (names, organizations).
Lead with the phrase "A fictional character".

If a custom voice description is provided, incorporate those details into the generated description.

Return only the voice description, no additional commentary.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response
      let cleaned = text
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/^```.*\n?|```$/g, '') // Remove markdown code blocks
        .replace(/^Description:|^Voice:|^Generated:/i, '') // Remove prefixes
        .trim();

      // If empty or too short, provide a fallback
      if (cleaned.length < 10) {
        cleaned = `A professional adult voice for ${callerData?.name || 'the caller'}, a ${callerData?.relationship || 'representative'} from ${callerData?.organization || 'an organization'}. The voice should sound authoritative, clear, and trustworthy with a neutral accent.`;
      }

      console.log('Generated voice description:', cleaned); // Debug log
      return cleaned;
    } catch (error) {
      console.error('Error generating voice description:', error);
      throw new Error('Failed to generate voice description. Please check your API key.');
    }
  }

  private cleanupScript(script: string): string {
    // Remove any markdown formatting, quotes, or extra text
    let cleaned = script
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^```.*\n?|```$/g, '') // Remove markdown code blocks
      .replace(/^Script:|^Prompt:|^Generated:/i, '') // Remove prefixes
      .trim();

    // If the script is too long, truncate it
    if (cleaned.length > 800) {
      cleaned = cleaned.substring(0, 800) + '...';
    }



    return cleaned;
  }
}

export const geminiService = new GeminiService(); 