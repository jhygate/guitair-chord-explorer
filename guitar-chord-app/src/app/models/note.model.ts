export interface Note {
  pitch: string;        // 'C', 'D', 'E', 'F', 'G', 'A', 'B'
  accidental: string;   // '', '#', 'b'
  octave?: number;      // Optional octave number
}

export function noteToString(note: Note): string {
  return `${note.pitch}${note.accidental}${note.octave !== undefined ? note.octave : ''}`;
}

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
