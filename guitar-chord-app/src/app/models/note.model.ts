export interface Note {
  pitch: string;        // 'C', 'D', 'E', 'F', 'G', 'A', 'B'
  accidental: string;   // '', '#', 'b'
  octave?: number;      // Optional octave number
}

export function noteToString(note: Note): string {
  return `${note.pitch}${note.accidental}${note.octave !== undefined ? note.octave : ''}`;
}

export function notesEqual(note1: Note, note2: Note, ignoreOctave: boolean = true): boolean {
  if (ignoreOctave) {
    return note1.pitch === note2.pitch && note1.accidental === note2.accidental;
  }
  return note1.pitch === note2.pitch &&
         note1.accidental === note2.accidental &&
         note1.octave === note2.octave;
}
