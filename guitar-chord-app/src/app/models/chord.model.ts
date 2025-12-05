import { Note } from './note.model';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' |
                           'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'half-diminished7';

export interface Chord {
  root: Note;
  quality: ChordQuality;
  notes: Note[];           // All notes in the chord
  romanNumeral: string;    // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', etc.
  displayName: string;     // 'Cmaj7', 'Dm', 'G7', etc.
}
