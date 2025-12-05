import { Note } from './note.model';

export interface FretboardPosition {
  string: number;       // 1-6 (1 = high E, 6 = low E)
  fret: number;         // 0-24 (0 = open string)
  note: Note;
  isRoot: boolean;
  isInChord: boolean;
}

export interface ChordVoicing {
  selectedPositions: FretboardPosition[];
  mutedStrings: number[];  // Array of string numbers that are muted
  fretRangeStart: number;   // Starting fret to display (0, 1, 2, etc.)
}

export const STANDARD_TUNING: Note[] = [
  { pitch: 'E', accidental: '', octave: 4 },  // String 1 (high E)
  { pitch: 'B', accidental: '', octave: 3 },  // String 2
  { pitch: 'G', accidental: '', octave: 3 },  // String 3
  { pitch: 'D', accidental: '', octave: 3 },  // String 4
  { pitch: 'A', accidental: '', octave: 2 },  // String 5
  { pitch: 'E', accidental: '', octave: 2 },  // String 6 (low E)
];
