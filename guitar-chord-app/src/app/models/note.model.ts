/**
 * Represents a musical note with pitch, accidental, and optional octave.
 *
 * STANDARD FORMAT (ALWAYS USE THIS):
 * - pitch: Single letter 'C', 'D', 'E', 'F', 'G', 'A', or 'B' (no accidentals)
 * - accidental: '', '#', or 'b' (separated from pitch)
 * - octave: Optional number (0-8)
 *
 * Example: C# in octave 4 = { pitch: 'C', accidental: '#', octave: 4 }
 *
 * IMPORTANT: Always use the NoteFactory to create notes to ensure format consistency.
 *
 * @interface Note
 * @property {string} pitch - Base pitch class: 'C', 'D', 'E', 'F', 'G', 'A', or 'B' ONLY
 *                            MUST NOT contain accidentals (use factory to enforce)
 * @property {string} accidental - Accidental modifier: '', '#', or 'b'
 * @property {number} [octave] - Optional octave number (typically 0-8)
 *                               Required for absolute pitch (piano keyboard, audio)
 *                               Optional for pitch class operations (chord quality)
 */
export interface Note {
  pitch: string;
  accidental: string;
  octave?: number;
}

/**
 * Factory class for creating and validating Note objects.
 * ALWAYS use this to create notes to ensure format consistency.
 */
export class NoteFactory {
  private static readonly VALID_PITCHES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  private static readonly VALID_ACCIDENTALS = ['', '#', 'b'];

  /**
   * Creates a Note from separated components (PREFERRED METHOD).
   *
   * @param pitch - Base pitch letter (C-B)
   * @param accidental - '', '#', or 'b'
   * @param octave - Optional octave number
   * @throws Error if format is invalid
   *
   * @example
   * NoteFactory.create('C', '#', 4) // { pitch: 'C', accidental: '#', octave: 4 }
   * NoteFactory.create('E', '', 2)  // { pitch: 'E', accidental: '', octave: 2 }
   */
  static create(pitch: string, accidental: string = '', octave?: number): Note {
    // Validate pitch
    if (!this.VALID_PITCHES.includes(pitch)) {
      throw new Error(`Invalid pitch: ${pitch}. Must be C, D, E, F, G, A, or B`);
    }

    // Validate accidental
    if (!this.VALID_ACCIDENTALS.includes(accidental)) {
      throw new Error(`Invalid accidental: ${accidental}. Must be '', '#', or 'b'`);
    }

    // Validate octave if provided
    if (octave !== undefined && (octave < 0 || octave > 8)) {
      console.warn(`Unusual octave value: ${octave}. Typical range is 0-8`);
    }

    return { pitch, accidental, octave };
  }

  /**
   * Creates a Note from a combined string like "C#4", "Bb3", "E".
   * Parses the string and returns a properly formatted Note.
   *
   * @param noteString - String like "C#4", "Bb", "E2"
   * @returns Note object in standard format
   *
   * @example
   * NoteFactory.fromString('C#4') // { pitch: 'C', accidental: '#', octave: 4 }
   * NoteFactory.fromString('Bb')  // { pitch: 'B', accidental: 'b' }
   */
  static fromString(noteString: string): Note {
    const match = noteString.match(/^([A-G])([#b]?)(\d*)$/);
    if (!match) {
      throw new Error(`Invalid note string: ${noteString}`);
    }

    const [, pitch, accidental, octaveStr] = match;
    const octave = octaveStr ? parseInt(octaveStr, 10) : undefined;

    return this.create(pitch, accidental || '', octave);
  }

  /**
   * Normalizes a Note that might be in legacy combined format.
   * Use this when reading notes from external sources or legacy code.
   *
   * @param note - Note that might have pitch='C#' instead of pitch='C', accidental='#'
   * @returns Normalized note in standard format
   *
   * @example
   * NoteFactory.normalize({ pitch: 'C#', accidental: '', octave: 4 })
   * // Returns: { pitch: 'C', accidental: '#', octave: 4 }
   */
  static normalize(note: Note): Note {
    // Check if pitch contains accidental (legacy format)
    if (note.pitch.length > 1) {
      const match = note.pitch.match(/^([A-G])([#b])$/);
      if (match) {
        const [, pitch, accidental] = match;
        return this.create(pitch, accidental, note.octave);
      }
    }

    // Already in correct format or invalid
    return note;
  }

  /**
   * Validates that a Note object is in the correct format.
   *
   * @param note - Note to validate
   * @returns true if valid, false otherwise
   */
  static isValid(note: Note): boolean {
    return (
      this.VALID_PITCHES.includes(note.pitch) &&
      this.VALID_ACCIDENTALS.includes(note.accidental) &&
      (note.octave === undefined || (note.octave >= 0 && note.octave <= 8))
    );
  }
}

/**
 * Converts a Note object to a string representation.
 *
 * @param {Note} note - The note to convert (should be in standard format)
 * @returns {string} String representation (e.g., "C#4", "Bb", "E")
 *
 * @example
 * noteToString({ pitch: 'C', accidental: '#', octave: 4 }) // Returns "C#4"
 * noteToString({ pitch: 'E', accidental: '' }) // Returns "E"
 */
export function noteToString(note: Note): string {
  return `${note.pitch}${note.accidental}${note.octave !== undefined ? note.octave : ''}`;
}

/**
 * Compares two Note objects for equality.
 * Automatically normalizes notes to handle legacy format if needed.
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
 *   { pitch: 'C', accidental: '#', octave: 5 }
 * ) // Returns true (octaves ignored)
 *
 * @example
 * // Absolute pitch comparison
 * notesEqual(
 *   { pitch: 'C', accidental: '#', octave: 3 },
 *   { pitch: 'C', accidental: '#', octave: 5 },
 *   false
 * ) // Returns false (different octaves)
 */
export function notesEqual(note1: Note, note2: Note, ignoreOctave: boolean = true): boolean {
  // Normalize both notes to handle legacy format
  const n1 = NoteFactory.normalize(note1);
  const n2 = NoteFactory.normalize(note2);

  // Compare pitch and accidental
  const pitchMatch = n1.pitch === n2.pitch && n1.accidental === n2.accidental;

  if (ignoreOctave) {
    return pitchMatch;
  }

  return pitchMatch && n1.octave === n2.octave;
}
