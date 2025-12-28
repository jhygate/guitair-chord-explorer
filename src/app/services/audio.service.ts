import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private readonly NOTE_FREQUENCIES: { [key: string]: number } = {
    'C': 16.35, 'C#': 17.32, 'Db': 17.32,
    'D': 18.35, 'D#': 19.45, 'Eb': 19.45,
    'E': 20.60,
    'F': 21.83, 'F#': 23.12, 'Gb': 23.12,
    'G': 24.50, 'G#': 25.96, 'Ab': 25.96,
    'A': 27.50, 'A#': 29.14, 'Bb': 29.14,
    'B': 30.87
  };

  constructor() {}

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private getFrequency(note: string): number {
    // Parse note name (e.g., "C#4", "E2")
    const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 0;

    const noteName = match[1];
    const octave = parseInt(match[2], 10);
    
    const baseFreq = this.NOTE_FREQUENCIES[noteName];
    if (!baseFreq) return 0;

    // Calculate frequency: base * 2^octave
    return baseFreq * Math.pow(2, octave);
  }

  async playChord(notes: string[]): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    notes.forEach(note => {
      this.playTone(note, now, 1.5);
    });
  }

  async playArpeggio(notes: string[]): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    // Sort notes by pitch (frequency) to play low to high
    const sortedNotes = [...notes].sort((a, b) => this.getFrequency(a) - this.getFrequency(b));

    sortedNotes.forEach((note, index) => {
      this.playTone(note, now + index * 0.15, 0.8);
    });
  }

  private playTone(note: string, startTime: number, duration: number): void {
    const ctx = this.getAudioContext();
    const freq = this.getFrequency(note);
    if (freq === 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Softer sound than sine or square
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}
