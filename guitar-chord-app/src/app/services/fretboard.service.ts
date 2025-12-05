import { Injectable } from '@angular/core';
import { Note, FretboardPosition, STANDARD_TUNING, Chord, notesEqual } from '../models';

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

        positions.push({
          string: stringNum,
          fret,
          note,
          isRoot,
          isInChord
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
   */
  private getNoteIndex(note: Note): number {
    const basePitch = note.pitch;
    let index = this.CHROMATIC_NOTES.indexOf(basePitch);

    if (index === -1) {
      // Try finding with sharp
      index = this.CHROMATIC_NOTES.indexOf(basePitch + '#');
    }

    if (note.accidental === '#') {
      index = (index + 1) % 12;
    } else if (note.accidental === 'b') {
      index = (index - 1 + 12) % 12;
    }

    return index;
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
}
