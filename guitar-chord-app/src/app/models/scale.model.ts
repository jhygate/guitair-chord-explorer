import { Note } from './note.model';
import { Chord } from './chord.model';

/**
 * Supported scale types in the application.
 * Each scale type has a unique interval formula (pattern of whole and half steps).
 *
 * Interval formulas (in semitones from root):
 * - major: [0, 2, 4, 5, 7, 9, 11] → W-W-H-W-W-W-H
 * - natural_minor: [0, 2, 3, 5, 7, 8, 10] → W-H-W-W-H-W-W
 * - harmonic_minor: [0, 2, 3, 5, 7, 8, 11] → W-H-W-W-H-1½-H
 * - melodic_minor: [0, 2, 3, 5, 7, 9, 11] → W-H-W-W-W-W-H (ascending)
 *
 * Where W = whole step (2 semitones), H = half step (1 semitone)
 */
export type ScaleType = 'major' | 'natural_minor' | 'harmonic_minor' | 'melodic_minor';

/**
 * Represents a musical scale with its notes and diatonic chords.
 *
 * A scale is an ordered collection of notes that defines the tonal framework
 * for a piece of music. This application generates diatonic chords built from
 * scale degrees.
 *
 * @interface Scale
 * @property {Note} root - The root note (tonic) of the scale
 *                         Example: C for C Major, A for A Minor
 *
 * @property {ScaleType} type - The type of scale (determines interval pattern)
 *
 * @property {Note[]} notes - Array of the 7 notes in the scale, starting from root
 *                            Example for C Major: [C, D, E, F, G, A, B]
 *                            Notes are in ascending order by scale degree
 *                            Does NOT include the octave (pitch classes only)
 *
 * @property {Chord[]} chords - Array of all diatonic chords in the scale
 *                              First 7 chords are triads (3-note chords)
 *                              Next 7 chords are seventh chords (4-note chords)
 *                              Total of 14 chords per scale
 *                              Each chord has a roman numeral indicating its function
 */
export interface Scale {
  root: Note;
  type: ScaleType;
  notes: Note[];
  chords: Chord[];
}

/**
 * Human-readable labels for scale types.
 * Used for display in UI dropdowns and labels.
 */
export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  'major': 'Major',
  'natural_minor': 'Natural Minor',
  'harmonic_minor': 'Harmonic Minor',
  'melodic_minor': 'Melodic Minor'
};
