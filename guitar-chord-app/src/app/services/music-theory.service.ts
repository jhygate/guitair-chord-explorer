import { Injectable } from '@angular/core';
import { Note, Chord, Scale, ScaleType, ChordQuality, noteToString, NoteFactory } from '../models';
import {
  CHROMATIC_NOTES_SHARP,
  FLAT_KEYS,
  DIATONIC_SCALE_LENGTH,
  SEMITONES_PER_OCTAVE
} from '../core/constants';

/**
 * Service responsible for music theory calculations.
 *
 * This service implements core music theory algorithms for:
 * - Scale generation from interval formulas
 * - Diatonic chord construction (triads and 7th chords)
 * - Roman numeral analysis
 * - Enharmonic spelling (sharps vs flats based on key)
 *
 * All methods are pure functions (stateless) for predictability and testability.
 *
 * @example
 * // Generate C Major scale with all diatonic chords
 * const root = NoteFactory.create('C');
 * const scale = musicTheory.getScale(root, 'major');
 * console.log(scale.notes); // [C, D, E, F, G, A, B]
 * console.log(scale.chords.length); // 14 (7 triads + 7 sevenths)
 */
@Injectable({
  providedIn: 'root'
})
export class MusicTheoryService {
  private readonly CHROMATIC_SCALE = CHROMATIC_NOTES_SHARP;

  /**
   * Scale formulas defining interval patterns in semitones.
   * Each array represents the distance from the root note.
   *
   * W = Whole step (2 semitones), H = Half step (1 semitone)
   */
  private readonly SCALE_FORMULAS: Record<ScaleType, number[]> = {
    'major': [0, 2, 4, 5, 7, 9, 11],           // W-W-H-W-W-W-H
    'natural_minor': [0, 2, 3, 5, 7, 8, 10],   // W-H-W-W-H-W-W
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],  // W-H-W-W-H-1½-H
    'melodic_minor': [0, 2, 3, 5, 7, 9, 11]    // W-H-W-W-W-W-H (ascending)
  };

  /**
   * Triad formulas for major scale.
   * Maps each scale degree (1-7) to its chord quality and Roman numeral.
   */
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

  /**
   * Seventh chord formulas for major scale.
   */
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

  /**
   * NOTE: Harmonic and melodic minor 7th chords use simplified qualities.
   * Ideally, harmonic minor would use minMaj7 and augMaj7, but these
   * qualities are not currently supported in the ChordQuality type.
   *
   * TODO: Extend ChordQuality to include minMaj7, augMaj7 for accuracy
   */
  private readonly HARMONIC_MINOR_SEVENTHS = [
    { quality: 'minor7' as ChordQuality, roman: 'i7' },  // Actually minMaj7
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
   * Returns all 12 chromatic notes as potential root notes.
   * Uses sharps for accidentals (C, C#, D, D#, E, F, F#, G, G#, A, A#, B).
   *
   * @returns Array of 12 Note objects (pitch classes without octaves)
   *
   * @example
   * const roots = musicTheory.getAllRootNotes();
   * console.log(roots.length); // 12
   * console.log(roots[1]); // { pitch: 'C', accidental: '#' }
   */
  getAllRootNotes(): Note[] {
    return this.CHROMATIC_SCALE.map(noteName => {
      if (noteName.length === 1) {
        return NoteFactory.create(noteName);
      } else {
        // Handle sharp notes like 'C#'
        return NoteFactory.create(noteName[0], noteName[1]);
      }
    });
  }

  /**
   * Generates a complete musical scale with all diatonic chords.
   *
   * Algorithm:
   * 1. Apply scale formula to generate 7 scale notes
   * 2. Build triads by stacking 3rds (root, 3rd, 5th)
   * 3. Build 7th chords by stacking 4 notes (root, 3rd, 5th, 7th)
   * 4. Assign Roman numerals based on scale degree and quality
   *
   * @param root - The tonic note of the scale
   * @param scaleType - Type of scale (major, natural_minor, etc.)
   * @returns Scale object containing:
   *   - root: The tonic note
   *   - type: The scale type
   *   - notes: 7 diatonic scale notes (pitch classes)
   *   - chords: 14 chords (7 triads + 7 seventh chords)
   *
   * @example
   * const cMajor = musicTheory.getScale(
   *   NoteFactory.create('C'),
   *   'major'
   * );
   * // cMajor.notes: [C, D, E, F, G, A, B]
   * // cMajor.chords[0]: { displayName: 'C', romanNumeral: 'I', ... }
   * // cMajor.chords[7]: { displayName: 'Cmaj7', romanNumeral: 'Imaj7', ... }
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
   * Calculates the notes in a scale by applying the interval formula.
   * Chooses sharps vs flats based on the key signature.
   *
   * @param root - The scale's root note
   * @param scaleType - Type of scale
   * @returns Array of 7 Note objects
   *
   * @private
   */
  private calculateScaleNotes(root: Note, scaleType: ScaleType): Note[] {
    const formula = this.SCALE_FORMULAS[scaleType];
    const rootIndex = this.getNoteIndex(root);
    const useFlats = this.shouldUseFlats(root);

    return formula.map(interval => {
      const noteIndex = (rootIndex + interval) % SEMITONES_PER_OCTAVE;
      return this.getNoteAtIndex(noteIndex, useFlats);
    });
  }

  /**
   * Builds all triads in a scale.
   * Stacks notes in 3rds: scale degrees 1-3-5, 2-4-6, 3-5-7, etc.
   *
   * @param scaleNotes - The 7 notes of the scale
   * @param scaleType - Type of scale (determines chord qualities)
   * @returns Array of 7 Chord objects (triads)
   *
   * @private
   */
  private calculateTriads(scaleNotes: Note[], scaleType: ScaleType): Chord[] {
    const triadFormulas = this.getTriadFormulas(scaleType);

    return triadFormulas.map((formula, index) => {
      const root = scaleNotes[index];
      const third = scaleNotes[(index + 2) % DIATONIC_SCALE_LENGTH];
      const fifth = scaleNotes[(index + 4) % DIATONIC_SCALE_LENGTH];

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
   * Builds all 7th chords in a scale.
   * Stacks notes in 3rds: scale degrees 1-3-5-7, 2-4-6-1, etc.
   *
   * @param scaleNotes - The 7 notes of the scale
   * @param scaleType - Type of scale (determines chord qualities)
   * @returns Array of 7 Chord objects (7th chords)
   *
   * @private
   */
  private calculateSevenths(scaleNotes: Note[], scaleType: ScaleType): Chord[] {
    const seventhFormulas = this.getSeventhFormulas(scaleType);

    return seventhFormulas.map((formula, index) => {
      const root = scaleNotes[index];
      const third = scaleNotes[(index + 2) % DIATONIC_SCALE_LENGTH];
      const fifth = scaleNotes[(index + 4) % DIATONIC_SCALE_LENGTH];
      const seventh = scaleNotes[(index + 6) % DIATONIC_SCALE_LENGTH];

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
   * Gets the appropriate triad formulas for a scale type.
   *
   * @param scaleType - Type of scale
   * @returns Array of 7 formula objects with quality and roman numeral
   *
   * @private
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
   * Gets the appropriate 7th chord formulas for a scale type.
   *
   * @param scaleType - Type of scale
   * @returns Array of 7 formula objects with quality and roman numeral
   *
   * @private
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
   * Creates a human-readable chord name.
   *
   * @param root - The chord's root note
   * @param quality - The chord quality
   * @param isSeventh - True for 7th chords, false for triads
   * @returns String like "Cmaj7", "Dm", "G7", "Bdim"
   *
   * @example
   * getChordDisplayName(C, 'major', false) // "C"
   * getChordDisplayName(C, 'major7', true) // "Cmaj7"
   * getChordDisplayName(D, 'minor', false) // "Dm"
   *
   * @private
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
   * Converts a Note to its chromatic scale index (0-11).
   * C=0, C#=1, D=2, ..., B=11
   *
   * @param note - Note to convert
   * @returns Index in chromatic scale (0-11)
   *
   * @private
   */
  private getNoteIndex(note: Note): number {
    // Normalize in case of legacy format
    const normalized = NoteFactory.normalize(note);
    const basePitch = normalized.pitch;
    let index = this.CHROMATIC_SCALE.indexOf(basePitch);

    if (normalized.accidental === '#') {
      index = (index + 1) % SEMITONES_PER_OCTAVE;
    } else if (normalized.accidental === 'b') {
      index = (index - 1 + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE;
    }

    return index;
  }

  /**
   * Converts a chromatic index to a Note object.
   * Chooses sharps or flats based on useFlats parameter.
   *
   * @param index - Chromatic index (0-11)
   * @param useFlats - If true, use flat accidentals; otherwise sharps
   * @returns Note object
   *
   * @private
   */
  private getNoteAtIndex(index: number, useFlats: boolean): Note {
    const pitch = this.CHROMATIC_SCALE[index];

    // If it's a sharp note and we should use flats, convert it
    if (useFlats && pitch.includes('#')) {
      const nextPitch = this.CHROMATIC_SCALE[(index + 1) % SEMITONES_PER_OCTAVE];
      return NoteFactory.create(nextPitch, 'b');
    }

    // Return as-is (natural or sharp)
    if (pitch.length === 1) {
      return NoteFactory.create(pitch);
    } else {
      // It's a sharp note like 'C#'
      return NoteFactory.create(pitch[0], '#');
    }
  }

  /**
   * Determines whether to use flats based on the key signature.
   * Keys in the "flat side" of the circle of fifths use flats.
   *
   * @param root - The root note of the scale
   * @returns True if flats should be used, false for sharps
   *
   * @private
   */
  private shouldUseFlats(root: Note): boolean {
    const rootName = noteToString(root);
    return FLAT_KEYS.includes(rootName) || root.accidental === 'b';
  }
}
