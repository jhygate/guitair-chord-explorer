import { Injectable } from '@angular/core';
import { Note, FretboardPosition, STANDARD_TUNING, Chord, Scale, notesEqual } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FretboardService {
  private readonly CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  constructor() { }

  /**
   * Calculate all fretboard positions for a given chord within a fret range
   */
  getFretboardPositions(chord: Chord, fretStart: number, fretEnd: number): FretboardPosition[] {
    const positions: FretboardPosition[] = [];

    // For each string (1-6, where 1 is high E)
    for (let stringNum = 1; stringNum <= 6; stringNum++) {
      const openStringNote = STANDARD_TUNING[stringNum - 1];

      // For each fret in the range (including open string at fret 0)
      for (let fret = fretStart; fret <= fretEnd; fret++) {
        const note = this.getNoteAtFret(openStringNote, fret);
        const isInChord = this.isNoteInChord(note, chord);
        const isRoot = notesEqual(note, chord.root);
        
        // Calculate scale degree (interval from root for chord tones)
        let scaleDegree: number | undefined;
        if (isInChord) {
          const rootIndex = this.getNoteIndex(chord.root);
          const noteIndex = this.getNoteIndex(note);
          const interval = (noteIndex - rootIndex + 12) % 12;
          
          // Map interval to scale degree (1=root, 3=third, 5=fifth, 7=seventh, etc.)
          const degreeMap: { [key: number]: number } = {
            0: 1,   // Root
            2: 2,   // Major 2nd
            3: 3,   // Minor 3rd
            4: 3,   // Major 3rd
            5: 4,   // Perfect 4th
            7: 5,   // Perfect 5th
            9: 6,   // Major 6th
            10: 7,  // Minor 7th
            11: 7,  // Major 7th
            14: 9,  // Major 9th (2 + octave)
          };
          scaleDegree = degreeMap[interval];
        }

        positions.push({
          string: stringNum,
          fret,
          note,
          isRoot,
          isInChord,
          scaleDegree
        });
      }
    }

    return positions;
  }

  /**
   * Get the note at a specific fret on a string
   */
  private getNoteAtFret(openString: Note, fret: number): Note {
    const openStringIndex = this.getNoteIndex(openString);
    const noteIndex = (openStringIndex + fret) % 12;
    const pitch = this.CHROMATIC_NOTES[noteIndex];

    return {
      pitch: pitch.replace('#', ''),
      accidental: pitch.includes('#') ? '#' : '',
      octave: this.calculateOctave(openString.octave || 0, openStringIndex, fret)
    };
  }

  /**
   * Calculate the octave for a note based on fret position
   */
  private calculateOctave(openOctave: number, openIndex: number, fret: number): number {
    const totalSemitones = openIndex + fret;
    const octaveIncrease = Math.floor(totalSemitones / 12);
    return openOctave + octaveIncrease;
  }

  /**
   * Get chromatic index of a note
   * Handles two formats:
   * 1. pitch contains the sharp/flat (e.g., {pitch: 'G#', accidental: ''})
   * 2. accidental is separate (e.g., {pitch: 'G', accidental: '#'})
   */
  private getNoteIndex(note: Note): number {
    // First, construct what the note name should be
    let noteName: string;
    
    // Check if the pitch already contains # or b
    if (note.pitch.includes('#') || note.pitch.includes('b')) {
      // Format 1: pitch already contains accidental
      noteName = note.pitch;
    } else {
      // Format 2: accidental is separate
      noteName = note.pitch + (note.accidental || '');
    }
    
    // Now find it in the chromatic scale
    const index = this.CHROMATIC_NOTES.indexOf(noteName);
    
    if (index !== -1) {
      return index;
    }
    
    // If we can't find it directly, it might be an enharmonic equivalent
    // Try to calculate from the base pitch
    const basePitch = note.pitch.replace(/#|b/g, ''); // Remove any accidentals from pitch
    let baseIndex = this.CHROMATIC_NOTES.indexOf(basePitch);
    
    if (baseIndex === -1) {
      // Still can't find it - try with sharp
      baseIndex = this.CHROMATIC_NOTES.indexOf(basePitch + '#');
    }
    
    if (baseIndex !== -1) {
      // Apply accidental if present
      if (note.pitch.includes('#') || note.accidental === '#') {
        return (baseIndex + 1) % 12;
      } else if (note.pitch.includes('b') || note.accidental === 'b') {
        return (baseIndex - 1 + 12) % 12;
      }
      return baseIndex;
    }
    
    // Fallback: default to C if we really can't find it
    console.warn('Could not find note index for:', note);
    return 0;
  }

  /**
   * Check if a note is in a chord (ignoring octave)
   */
  private isNoteInChord(note: Note, chord: Chord): boolean {
    return chord.notes.some(chordNote => notesEqual(note, chordNote, true));
  }

  /**
   * Get the display name for a note
   */
  getNoteDisplayName(note: Note): string {
    return `${note.pitch}${note.accidental}`;
  }

  /**
   * Calculate all fretboard positions for a given scale within a fret range
   */
  getScaleFretboardPositions(scale: Scale, fretStart: number, fretEnd: number): FretboardPosition[] {
    const positions: FretboardPosition[] = [];

    // For each string (1-6, where 1 is high E)
    for (let stringNum = 1; stringNum <= 6; stringNum++) {
      const openStringNote = STANDARD_TUNING[stringNum - 1];

      // For each fret in the range (including open string at fret 0)
      for (let fret = fretStart; fret <= fretEnd; fret++) {
        const note = this.getNoteAtFret(openStringNote, fret);
        const isInScale = this.isNoteInScale(note, scale);
        const isRoot = notesEqual(note, scale.root);
        
        // Calculate scale degree (1-7)
        let scaleDegree: number | undefined;
        if (isInScale) {
          scaleDegree = this.getScaleDegree(note, scale);
        }

        positions.push({
          string: stringNum,
          fret,
          note,
          isRoot,
          isInChord: isInScale, // Use isInChord flag to indicate note is in scale
          scaleDegree
        });
      }
    }

    return positions;
  }

  /**
   * Get the scale degree (1-7) of a note within a scale
   */
  private getScaleDegree(note: Note, scale: Scale): number | undefined {
    for (let i = 0; i < scale.notes.length; i++) {
      if (notesEqual(note, scale.notes[i], true)) {
        return i + 1; // 1-indexed scale degree
      }
    }
    return undefined;
  }

  /**
   * Check if a note is in a scale (ignoring octave)
   */
  private isNoteInScale(note: Note, scale: Scale): boolean {
    return scale.notes.some(scaleNote => notesEqual(note, scaleNote, true));
  }

  /**
   * Get the note at a specific string and fret position (public method)
   */
  getNoteAtPosition(stringNum: number, fret: number): Note {
    const openStringNote = STANDARD_TUNING[stringNum - 1];
    return this.getNoteAtFret(openStringNote, fret);
  }
}
