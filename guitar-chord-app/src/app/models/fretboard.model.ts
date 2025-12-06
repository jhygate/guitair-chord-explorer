import { Note } from './note.model';

/**
 * Represents a specific position on the guitar fretboard with metadata about
 * its relationship to the current chord or scale.
 *
 * This is a core data structure used throughout the application to represent
 * individual notes on the fretboard and their musical context.
 *
 * @interface FretboardPosition
 * @property {number} string - String number (1-6)
 *                             1 = high E string (thinnest)
 *                             6 = low E string (thickest)
 *                             IMPORTANT: This numbering convention differs from standard
 *                             guitar notation where strings are sometimes counted from thick to thin
 *
 * @property {number} fret - Fret number (0-24)
 *                           0 = open string (no finger placement)
 *                           1-24 = fretted positions
 *                           Most acoustic guitars have 20 frets, electrics often have 24
 *
 * @property {Note} note - The musical note at this position
 *                         Includes pitch, accidental, and octave
 *                         Octave is calculated based on string tuning and fret offset
 *
 * @property {boolean} isRoot - True if this note is the root of the current chord/scale
 *                              Used for visual highlighting (typically gold/yellow color)
 *
 * @property {boolean} isInChord - True if this note belongs to the current chord or scale
 *                                 Used to determine if position should show as "ghost note"
 *                                 or be available for selection
 *
 * @property {number} [scaleDegree] - Optional scale degree or chord tone identifier
 *                                    For scales: 1-7 (diatonic scale degrees)
 *                                    For chords: maps intervals to degrees
 *                                    (e.g., 1=root, 3=third, 5=fifth, 7=seventh)
 *                                    Used for fretboard labeling when showScaleDegrees is true
 */
export interface FretboardPosition {
  string: number;
  fret: number;
  note: Note;
  isRoot: boolean;
  isInChord: boolean;
  scaleDegree?: number;
}

/**
 * Represents a specific voicing (fingering) of a chord on the fretboard.
 *
 * DESIGN NOTE: This interface is defined but NOT currently used in the application.
 * The app currently manages chord voicings through component state rather than
 * this dedicated model. Consider refactoring to use this for better separation of concerns.
 *
 * @interface ChordVoicing
 * @property {FretboardPosition[]} selectedPositions - Array of positions being fingered
 *                                                     One per string (excluding muted strings)
 *
 * @property {number[]} mutedStrings - Array of string numbers (1-6) that are muted
 *                                     Muted strings are not played even if a position exists
 *
 * @property {number} fretRangeStart - The starting fret of the visible fretboard window
 *                                     0 = showing nut/open strings
 *                                     Used for scrolling the fretboard view
 */
export interface ChordVoicing {
  selectedPositions: FretboardPosition[];
  mutedStrings: number[];
  fretRangeStart: number;
}

/**
 * Standard guitar tuning (EADGBE) with octave information.
 * This constant defines the pitch of each open string.
 *
 * Array indices correspond to string numbers (0-indexed):
 * - Index 0 = String 1 (high E) = E4 (329.63 Hz)
 * - Index 1 = String 2 (B) = B3 (246.94 Hz)
 * - Index 2 = String 3 (G) = G3 (196.00 Hz)
 * - Index 3 = String 4 (D) = D3 (146.83 Hz)
 * - Index 4 = String 5 (A) = A2 (110.00 Hz)
 * - Index 5 = String 6 (low E) = E2 (82.41 Hz)
 *
 * IMPORTANT: This is used throughout the app to calculate note pitches at any fret.
 * If alternate tunings are ever supported, this would need to be parameterized.
 */
export const STANDARD_TUNING: Note[] = [
  { pitch: 'E', accidental: '', octave: 4 },  // String 1 (high E)
  { pitch: 'B', accidental: '', octave: 3 },  // String 2
  { pitch: 'G', accidental: '', octave: 3 },  // String 3
  { pitch: 'D', accidental: '', octave: 3 },  // String 4
  { pitch: 'A', accidental: '', octave: 2 },  // String 5
  { pitch: 'E', accidental: '', octave: 2 },  // String 6 (low E)
];
