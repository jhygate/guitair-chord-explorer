import { Injectable } from '@angular/core';
import { Note, Chord, Scale, ScaleType, ChordQuality, noteToString } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MusicTheoryService {
  private readonly CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Scale formulas (intervals in semitones from root)
  private readonly SCALE_FORMULAS: Record<ScaleType, number[]> = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'natural_minor': [0, 2, 3, 5, 7, 8, 10],
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic_minor': [0, 2, 3, 5, 7, 9, 11]
  };

  // Triad formulas for each scale degree (intervals within the scale)
  private readonly MAJOR_TRIADS = [
    { quality: 'major' as ChordQuality, roman: 'I' },
    { quality: 'minor' as ChordQuality, roman: 'ii' },
    { quality: 'minor' as ChordQuality, roman: 'iii' },
    { quality: 'major' as ChordQuality, roman: 'IV' },
    { quality: 'major' as ChordQuality, roman: 'V' },
    { quality: 'minor' as ChordQuality, roman: 'vi' },
    { quality: 'diminished' as ChordQuality, roman: 'vii°' }
  ];

  private readonly NATURAL_MINOR_TRIADS = [
    { quality: 'minor' as ChordQuality, roman: 'i' },
    { quality: 'diminished' as ChordQuality, roman: 'ii°' },
    { quality: 'major' as ChordQuality, roman: 'III' },
    { quality: 'minor' as ChordQuality, roman: 'iv' },
    { quality: 'minor' as ChordQuality, roman: 'v' },
    { quality: 'major' as ChordQuality, roman: 'VI' },
    { quality: 'major' as ChordQuality, roman: 'VII' }
  ];

  private readonly HARMONIC_MINOR_TRIADS = [
    { quality: 'minor' as ChordQuality, roman: 'i' },
    { quality: 'diminished' as ChordQuality, roman: 'ii°' },
    { quality: 'augmented' as ChordQuality, roman: 'III+' },
    { quality: 'minor' as ChordQuality, roman: 'iv' },
    { quality: 'major' as ChordQuality, roman: 'V' },
    { quality: 'major' as ChordQuality, roman: 'VI' },
    { quality: 'diminished' as ChordQuality, roman: 'vii°' }
  ];

  private readonly MELODIC_MINOR_TRIADS = [
    { quality: 'minor' as ChordQuality, roman: 'i' },
    { quality: 'minor' as ChordQuality, roman: 'ii' },
    { quality: 'augmented' as ChordQuality, roman: 'III+' },
    { quality: 'major' as ChordQuality, roman: 'IV' },
    { quality: 'major' as ChordQuality, roman: 'V' },
    { quality: 'diminished' as ChordQuality, roman: 'vi°' },
    { quality: 'diminished' as ChordQuality, roman: 'vii°' }
  ];

  // 7th chord formulas
  private readonly MAJOR_SEVENTHS = [
    { quality: 'major7' as ChordQuality, roman: 'Imaj7' },
    { quality: 'minor7' as ChordQuality, roman: 'ii7' },
    { quality: 'minor7' as ChordQuality, roman: 'iii7' },
    { quality: 'major7' as ChordQuality, roman: 'IVmaj7' },
    { quality: 'dominant7' as ChordQuality, roman: 'V7' },
    { quality: 'minor7' as ChordQuality, roman: 'vi7' },
    { quality: 'half-diminished7' as ChordQuality, roman: 'viiø7' }
  ];

  private readonly NATURAL_MINOR_SEVENTHS = [
    { quality: 'minor7' as ChordQuality, roman: 'i7' },
    { quality: 'half-diminished7' as ChordQuality, roman: 'iiø7' },
    { quality: 'major7' as ChordQuality, roman: 'IIImaj7' },
    { quality: 'minor7' as ChordQuality, roman: 'iv7' },
    { quality: 'minor7' as ChordQuality, roman: 'v7' },
    { quality: 'major7' as ChordQuality, roman: 'VImaj7' },
    { quality: 'dominant7' as ChordQuality, roman: 'VII7' }
  ];

  private readonly HARMONIC_MINOR_SEVENTHS = [
    { quality: 'minor7' as ChordQuality, roman: 'i7' },  // Actually minMaj7 but simplified
    { quality: 'half-diminished7' as ChordQuality, roman: 'iiø7' },
    { quality: 'major7' as ChordQuality, roman: 'IIImaj7' },  // Actually augMaj7
    { quality: 'minor7' as ChordQuality, roman: 'iv7' },
    { quality: 'dominant7' as ChordQuality, roman: 'V7' },
    { quality: 'major7' as ChordQuality, roman: 'VImaj7' },
    { quality: 'diminished7' as ChordQuality, roman: 'vii°7' }
  ];

  private readonly MELODIC_MINOR_SEVENTHS = [
    { quality: 'minor7' as ChordQuality, roman: 'i7' },  // Actually minMaj7
    { quality: 'minor7' as ChordQuality, roman: 'ii7' },
    { quality: 'major7' as ChordQuality, roman: 'IIImaj7' },  // Actually augMaj7
    { quality: 'dominant7' as ChordQuality, roman: 'IV7' },
    { quality: 'dominant7' as ChordQuality, roman: 'V7' },
    { quality: 'half-diminished7' as ChordQuality, roman: 'viø7' },
    { quality: 'half-diminished7' as ChordQuality, roman: 'viiø7' }
  ];

  constructor() { }

  /**
   * Get all available root notes
   */
  getAllRootNotes(): Note[] {
    return this.CHROMATIC_SCALE.map(pitch => ({ pitch, accidental: '' }));
  }

  /**
   * Calculate scale notes and chords
   */
  getScale(root: Note, scaleType: ScaleType): Scale {
    const scaleNotes = this.calculateScaleNotes(root, scaleType);
    const triads = this.calculateTriads(scaleNotes, scaleType);
    const sevenths = this.calculateSevenths(scaleNotes, scaleType);

    return {
      root,
      type: scaleType,
      notes: scaleNotes,
      chords: [...triads, ...sevenths]
    };
  }

  /**
   * Calculate the notes in a scale
   */
  private calculateScaleNotes(root: Note, scaleType: ScaleType): Note[] {
    const formula = this.SCALE_FORMULAS[scaleType];
    const rootIndex = this.getNoteIndex(root);
    const useFlats = this.shouldUseFlats(root);

    return formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return this.getNoteAtIndex(noteIndex, useFlats);
    });
  }

  /**
   * Calculate triads in the scale
   */
  private calculateTriads(scaleNotes: Note[], scaleType: ScaleType): Chord[] {
    const triadFormulas = this.getTriadFormulas(scaleType);

    return triadFormulas.map((formula, index) => {
      const root = scaleNotes[index];
      const third = scaleNotes[(index + 2) % 7];
      const fifth = scaleNotes[(index + 4) % 7];

      return {
        root,
        quality: formula.quality,
        notes: [root, third, fifth],
        romanNumeral: formula.roman,
        displayName: this.getChordDisplayName(root, formula.quality, false)
      };
    });
  }

  /**
   * Calculate 7th chords in the scale
   */
  private calculateSevenths(scaleNotes: Note[], scaleType: ScaleType): Chord[] {
    const seventhFormulas = this.getSeventhFormulas(scaleType);

    return seventhFormulas.map((formula, index) => {
      const root = scaleNotes[index];
      const third = scaleNotes[(index + 2) % 7];
      const fifth = scaleNotes[(index + 4) % 7];
      const seventh = scaleNotes[(index + 6) % 7];

      return {
        root,
        quality: formula.quality,
        notes: [root, third, fifth, seventh],
        romanNumeral: formula.roman,
        displayName: this.getChordDisplayName(root, formula.quality, true)
      };
    });
  }

  /**
   * Get triad formulas for a scale type
   */
  private getTriadFormulas(scaleType: ScaleType) {
    switch (scaleType) {
      case 'major':
        return this.MAJOR_TRIADS;
      case 'natural_minor':
        return this.NATURAL_MINOR_TRIADS;
      case 'harmonic_minor':
        return this.HARMONIC_MINOR_TRIADS;
      case 'melodic_minor':
        return this.MELODIC_MINOR_TRIADS;
    }
  }

  /**
   * Get 7th chord formulas for a scale type
   */
  private getSeventhFormulas(scaleType: ScaleType) {
    switch (scaleType) {
      case 'major':
        return this.MAJOR_SEVENTHS;
      case 'natural_minor':
        return this.NATURAL_MINOR_SEVENTHS;
      case 'harmonic_minor':
        return this.HARMONIC_MINOR_SEVENTHS;
      case 'melodic_minor':
        return this.MELODIC_MINOR_SEVENTHS;
    }
  }

  /**
   * Get display name for a chord
   */
  private getChordDisplayName(root: Note, quality: ChordQuality, isSeventh: boolean): string {
    const rootName = noteToString(root);

    if (!isSeventh) {
      // Triads
      switch (quality) {
        case 'major':
          return rootName;
        case 'minor':
          return `${rootName}m`;
        case 'diminished':
          return `${rootName}dim`;
        case 'augmented':
          return `${rootName}aug`;
        default:
          return rootName;
      }
    } else {
      // 7th chords
      switch (quality) {
        case 'major7':
          return `${rootName}maj7`;
        case 'minor7':
          return `${rootName}m7`;
        case 'dominant7':
          return `${rootName}7`;
        case 'diminished7':
          return `${rootName}dim7`;
        case 'half-diminished7':
          return `${rootName}m7b5`;
        default:
          return `${rootName}7`;
      }
    }
  }

  /**
   * Get the chromatic index of a note
   */
  private getNoteIndex(note: Note): number {
    const basePitch = note.pitch;
    let index = this.CHROMATIC_SCALE.indexOf(basePitch);

    if (note.accidental === '#') {
      index = (index + 1) % 12;
    } else if (note.accidental === 'b') {
      index = (index - 1 + 12) % 12;
    }

    return index;
  }

  /**
   * Get note at a specific chromatic index
   */
  private getNoteAtIndex(index: number, useFlats: boolean): Note {
    const pitch = this.CHROMATIC_SCALE[index];

    // If it's a sharp note and we should use flats, convert it
    if (useFlats && pitch.includes('#')) {
      const nextPitch = this.CHROMATIC_SCALE[(index + 1) % 12];
      return { pitch: nextPitch, accidental: 'b' };
    }

    return { pitch, accidental: '' };
  }

  /**
   * Determine if we should use flats based on the key
   */
  private shouldUseFlats(root: Note): boolean {
    // Keys that traditionally use flats
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    const rootName = noteToString(root);
    return flatKeys.includes(rootName) || root.accidental === 'b';
  }
}
