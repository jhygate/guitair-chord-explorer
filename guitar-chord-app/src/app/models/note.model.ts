/**
 * Represents a musical note with pitch, accidental, and optional octave.
 *
 * IMPORTANT: This model supports TWO different formats for representing notes:
 * 1. Separated format: { pitch: 'G', accidental: '#', octave: 3 }
 * 2. Combined format:  { pitch: 'G#', accidental: '', octave: 3 }
 *
 * This inconsistency exists throughout the codebase and can lead to bugs.
 * All comparison and normalization logic must handle both formats.
 *
 * @interface Note
 * @property {string} pitch - The base pitch class ('C', 'D', 'E', 'F', 'G', 'A', 'B')
 *                            OR the pitch with accidental combined (e.g., 'C#', 'Bb')
 * @property {string} accidental - The accidental modifier ('', '#', 'b')
 *                                 Will be empty string if pitch already contains the accidental
 * @property {number} [octave] - Optional octave number (typically 0-8 for music applications)
 *                               Required for absolute pitch representation (e.g., on piano keyboard)
 *                               Optional for pitch class operations (e.g., chord quality)
 */
export interface Note {
  pitch: string;
  accidental: string;
  octave?: number;
}

/**
 * Converts a Note object to a string representation.
 * Handles both separated and combined formats for accidentals.
 *
 * @param {Note} note - The note to convert
 * @returns {string} String representation (e.g., "C#4", "Bb", "E")
 *
 * @example
 * noteToString({ pitch: 'C', accidental: '#', octave: 4 }) // Returns "C#4"
 * noteToString({ pitch: 'C#', accidental: '', octave: 4 }) // Returns "C#4"
 * noteToString({ pitch: 'E', accidental: '' }) // Returns "E"
 */
export function noteToString(note: Note): string {
  return `${note.pitch}${note.accidental}${note.octave !== undefined ? note.octave : ''}`;
}

/**
 * Compares two Note objects for equality.
 * CRITICAL: Handles both note representation formats (separated and combined accidentals).
 *
 * This function normalizes notes before comparison to handle:
 * - Format 1: {pitch: 'G', accidental: '#'}
 * - Format 2: {pitch: 'G#', accidental: ''}
 *
 * @param {Note} note1 - First note to compare
 * @param {Note} note2 - Second note to compare
 * @param {boolean} [ignoreOctave=true] - If true, compares only pitch class (ignores octave)
 *                                        If false, requires exact octave match
 * @returns {boolean} True if notes are equal (considering the ignoreOctave flag)
 *
 * @example
 * // Pitch class comparison (default)
 * notesEqual(
 *   { pitch: 'C', accidental: '#', octave: 3 },
 *   { pitch: 'C#', accidental: '', octave: 5 }
 * ) // Returns true (octaves ignored)
 *
 * @example
 * // Absolute pitch comparison
 * notesEqual(
 *   { pitch: 'C', accidental: '#', octave: 3 },
 *   { pitch: 'C#', accidental: '', octave: 5 },
 *   false
 * ) // Returns false (different octaves)
 */
export function notesEqual(note1: Note, note2: Note, ignoreOctave: boolean = true): boolean {
  // Normalize both notes to handle two formats:
  // 1. pitch contains sharp/flat (e.g., {pitch: 'G#', accidental: ''})
  // 2. accidental is separate (e.g., {pitch: 'G', accidental: '#'})

  const normalize = (note: Note): string => {
    // Check if pitch already contains # or b
    if (note.pitch.includes('#') || note.pitch.includes('b')) {
      return note.pitch; // Already normalized
    }
    return note.pitch + (note.accidental || '');
  };

  const normalized1 = normalize(note1);
  const normalized2 = normalize(note2);

  if (ignoreOctave) {
    return normalized1 === normalized2;
  }
  return normalized1 === normalized2 && note1.octave === note2.octave;
}
