import { Injectable } from '@angular/core';
import { Note, Chord, ChordQuality } from '../models';

export interface ChordMatch {
  chord: Chord;
  confidence: number; // 0-1, how well the selected notes match this chord
  missingNotes: Note[]; // Notes in the chord that weren't selected
  extraNotes: Note[]; // Selected notes not in the chord
  appearsInKeys: { key: Note, romanNumeral: string, scaleType: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChordIdentifierService {

  private readonly CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Chord formulas (intervals from root in semitones)
  private readonly CHORD_FORMULAS: { [key: string]: number[] } = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'diminished': [0, 3, 6],
    'augmented': [0, 4, 8],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'dominant7': [0, 4, 7, 10],
    'diminished7': [0, 3, 6, 9],
    'half-diminished7': [0, 3, 6, 10],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'add9': [0, 4, 7, 14],
    'maj9': [0, 4, 7, 11, 14],
    'min9': [0, 3, 7, 10, 14],
  };

  constructor() { }

  identifyChords(selectedNotes: Note[]): ChordMatch[] {
    if (selectedNotes.length === 0) {
      return [];
    }

    // Normalize notes (remove octave, convert to pitch class)
    const uniqueNotes = this.getUniqueNotes(selectedNotes);

    if (uniqueNotes.length === 0) {
      return [];
    }

    const matches: ChordMatch[] = [];

    // Try each note as a potential root
    for (const root of uniqueNotes) {
      // Try each chord quality
      for (const [quality, formula] of Object.entries(this.CHORD_FORMULAS)) {
        const match = this.matchChord(root, quality as ChordQuality, formula, uniqueNotes);
        if (match && match.confidence > 0.5) {
          matches.push(match);
        }
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  private getUniqueNotes(notes: Note[]): Note[] {
    const seen = new Set<string>();
    const unique: Note[] = [];

    for (const note of notes) {
      const key = `${note.pitch}${note.accidental}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ pitch: note.pitch, accidental: note.accidental });
      }
    }

    return unique;
  }

  private matchChord(root: Note, quality: ChordQuality, formula: number[], selectedNotes: Note[]): ChordMatch | null {
    // Build expected chord notes from formula
    const rootIndex = this.getNoteIndex(root);
    const chordNotes = formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return this.indexToNote(noteIndex);
    });

    // Calculate how many chord notes are in the selection
    const matchedNotes = chordNotes.filter(chordNote =>
      selectedNotes.some(selectedNote => this.notesEqual(selectedNote, chordNote))
    );

    // Calculate missing and extra notes
    const missingNotes = chordNotes.filter(chordNote =>
      !selectedNotes.some(selectedNote => this.notesEqual(selectedNote, chordNote))
    );

    const extraNotes = selectedNotes.filter(selectedNote =>
      !chordNotes.some(chordNote => this.notesEqual(selectedNote, chordNote))
    );

    // Calculate confidence score
    // Perfect match = 1.0, partial matches get lower scores
    const matchRatio = matchedNotes.length / chordNotes.length;
    const penaltyForExtras = extraNotes.length * 0.15;
    const confidence = Math.max(0, matchRatio - penaltyForExtras);

    if (confidence === 0) {
      return null;
    }

    // Create chord object
    const chord: Chord = {
      root,
      quality,
      notes: chordNotes,
      romanNumeral: '', // Will be filled when we determine the key
      displayName: this.getChordDisplayName(root, quality)
    };

    // Find keys this chord appears in
    const appearsInKeys = this.findKeysForChord(chord);

    return {
      chord,
      confidence,
      missingNotes,
      extraNotes,
      appearsInKeys
    };
  }

  private getNoteIndex(note: Note): number {
    const noteName = `${note.pitch}${note.accidental}`;
    const index = this.CHROMATIC_SCALE.indexOf(noteName);
    return index >= 0 ? index : 0;
  }

  private indexToNote(index: number): Note {
    const noteName = this.CHROMATIC_SCALE[index];
    if (noteName.length === 1) {
      return { pitch: noteName, accidental: '' };
    } else {
      return { pitch: noteName[0], accidental: noteName[1] };
    }
  }

  private notesEqual(note1: Note, note2: Note): boolean {
    return note1.pitch === note2.pitch && note1.accidental === note2.accidental;
  }

  private getChordDisplayName(root: Note, quality: ChordQuality): string {
    const rootName = `${root.pitch}${root.accidental}`;

    const qualityMap: { [key: string]: string } = {
      'major': '',
      'minor': 'm',
      'diminished': 'dim',
      'augmented': 'aug',
      'major7': 'maj7',
      'minor7': 'm7',
      'dominant7': '7',
      'diminished7': 'dim7',
      'half-diminished7': 'm7♭5',
      'sus2': 'sus2',
      'sus4': 'sus4',
      'add9': 'add9',
      'maj9': 'maj9',
      'min9': 'm9'
    };

    return `${rootName}${qualityMap[quality] || ''}`;
  }

  private findKeysForChord(chord: Chord): { key: Note, romanNumeral: string, scaleType: string }[] {
    const results: { key: Note, romanNumeral: string, scaleType: string }[] = [];

    // Check major keys
    for (let i = 0; i < 12; i++) {
      const keyRoot = this.indexToNote(i);
      const scaleNotes = this.getMajorScaleNotes(keyRoot);
      const chordPosition = this.getChordPositionInScale(chord.root, scaleNotes);

      if (chordPosition >= 0) {
        const romanNumeral = this.getRomanNumeralForPosition(chordPosition, chord.quality, 'major');
        results.push({
          key: keyRoot,
          romanNumeral,
          scaleType: 'Major'
        });
      }
    }

    // Check minor keys
    for (let i = 0; i < 12; i++) {
      const keyRoot = this.indexToNote(i);
      const scaleNotes = this.getMinorScaleNotes(keyRoot);
      const chordPosition = this.getChordPositionInScale(chord.root, scaleNotes);

      if (chordPosition >= 0) {
        const romanNumeral = this.getRomanNumeralForPosition(chordPosition, chord.quality, 'minor');
        results.push({
          key: keyRoot,
          romanNumeral,
          scaleType: 'Minor'
        });
      }
    }

    return results;
  }

  private getMajorScaleNotes(root: Note): Note[] {
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    const rootIndex = this.getNoteIndex(root);
    return intervals.map(interval => this.indexToNote((rootIndex + interval) % 12));
  }

  private getMinorScaleNotes(root: Note): Note[] {
    const intervals = [0, 2, 3, 5, 7, 8, 10];
    const rootIndex = this.getNoteIndex(root);
    return intervals.map(interval => this.indexToNote((rootIndex + interval) % 12));
  }

  private getChordPositionInScale(chordRoot: Note, scaleNotes: Note[]): number {
    return scaleNotes.findIndex(note => this.notesEqual(note, chordRoot));
  }

  private getRomanNumeralForPosition(position: number, quality: ChordQuality, scaleType: string): string {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const numeral = numerals[position];

    // Apply case based on quality
    if (quality === 'minor' || quality === 'minor7' || quality === 'half-diminished7') {
      return numeral.toLowerCase();
    } else if (quality === 'diminished' || quality === 'diminished7') {
      return numeral.toLowerCase() + '°';
    } else {
      return numeral;
    }
  }
}
