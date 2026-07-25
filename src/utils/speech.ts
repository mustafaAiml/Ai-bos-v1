// Web Speech API wrapper for Voice Recognition & Audio Synthesis (TTS)

export interface SpeechOptions {
  language?: string; // 'hi-IN' | 'en-IN' | 'en-US'
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class VoiceRecognizer {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN'; // Default to Hindi/Indian Hinglish
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(options: SpeechOptions) {
    if (!this.recognition) {
      options.onError('Web Speech API is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = options.language || 'hi-IN';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      options.onResult(text, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      options.onError(event.error || 'Speech recognition error');
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      options.onError(err.message || 'Failed to start microphone');
      this.isListening = false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const speechSynthesizer = {
  isSupported: (): boolean => {
    return 'speechSynthesis' in window;
  },

  speak: (text: string, lang = 'hi-IN'): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window) || !text) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.95; // slightly slower for clarity

      // Find suitable voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('Hindi'));
      const indianEngVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));

      if (lang === 'hi' && hindiVoice) {
        utterance.voice = hindiVoice;
      } else if (indianEngVoice) {
        utterance.voice = indianEngVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
