import { Note } from './note.model';

/**
 * Represents the quality/type of a chord.
 * Determines the interval structure of the chord.
 *
 * Triads (3 notes):
 * - major: Root + Major 3rd + Perfect 5th (e.g., C-E-G)
 * - minor: Root + Minor 3rd + Perfect 5th (e.g., C-Eb-G)
 * - diminished: Root + Minor 3rd + Diminished 5th (e.g., C-Eb-Gb)
 * - augmented: Root + Major 3rd + Augmented 5th (e.g., C-E-G#)
 *
 * Seventh Chords (4 notes):
 * - major7: Major triad + Major 7th (e.g., C-E-G-B)
 * - minor7: Minor triad + Minor 7th (e.g., C-Eb-G-Bb)
 * - dominant7: Major triad + Minor 7th (e.g., C-E-G-Bb)
 * - diminished7: Diminished triad + Diminished 7th (e.g., C-Eb-Gb-Bbb/A)
 * - half-diminished7: Diminished triad + Minor 7th (e.g., C-Eb-Gb-Bb)
 *
 * NOTE: The chord identifier service supports additional qualities (sus2, sus4, add9, etc.)
 * but the music theory service only generates diatonic chords from these base qualities.
 */
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' |
                           'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'half-diminished7';

/**
 * Represents a musical chord with its constituent notes and harmonic function.
 *
 * A chord is a collection of notes that are sounded together. In the context of this app,
 * chords are primarily generated from scales (diatonic chords) or identified from
 * user-selected fretboard positions.
 *
 * @interface Chord
 * @property {Note} root - The root note of the chord (e.g., C for a C major chord)
 *                         This is the fundamental pitch on which the chord is built
 *
 * @property {ChordQuality} quality - The quality/type of the chord (major, minor, etc.)
 *                                    Defines the interval structure
 *
 * @property {Note[]} notes - Array of all notes in the chord, typically 3-4 notes
 *                            For triads: [root, 3rd, 5th]
 *                            For 7th chords: [root, 3rd, 5th, 7th]
 *                            Notes are pitch classes (octave may not be specified)
 *
 * @property {string} romanNumeral - The Roman numeral analysis representing the chord's
 *                                   function within a key (e.g., 'I', 'ii', 'V7', 'vii°')
 *                                   Uppercase = major/dominant, lowercase = minor/diminished
 *                                   Empty string if chord is not in a key context
 *
 * @property {string} displayName - Human-readable chord name for display in UI
 *                                  (e.g., 'Cmaj7', 'Dm', 'G7', 'Bdim')
 *                                  Follows standard chord symbol notation
 */
export interface Chord {
  root: Note;
  quality: ChordQuality;
  notes: Note[];
  romanNumeral: string;
  displayName: string;
}
