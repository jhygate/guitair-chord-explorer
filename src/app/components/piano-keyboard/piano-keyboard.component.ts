import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FretboardPosition } from '../../models';

interface PianoKey {
  note: string;
  isBlack: boolean;
  isSelected: boolean;
  left?: string; // CSS left position for black keys
}

@Component({
  selector: 'app-piano-keyboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './piano-keyboard.component.html',
  styleUrl: './piano-keyboard.component.scss'
})
export class PianoKeyboardComponent implements OnChanges {
  @Input() selectedPositions: FretboardPosition[] = [];
  
  keys: PianoKey[] = [];
  
  // One octave pattern: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  private readonly notePattern = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private readonly whiteKeyWidth = 40;
  private readonly blackKeyWidth = 24;
  
  // Full range of keys
  private allKeys: PianoKey[] = [];
  
  // Visible range control
  private readonly visibleWhiteKeys = 21; // ~3 octaves
  startWhiteKeyIndex = 0;
  
  ngOnInit() {
    this.generateAllKeys();
    this.updateVisibleKeys();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPositions']) {
      this.updateSelectedKeys();
    }
  }
  
  shiftRange(direction: 'lower' | 'higher'): void {
    const maxStartIndex = this.getTotalWhiteKeys() - this.visibleWhiteKeys;
    
    if (direction === 'lower' && this.startWhiteKeyIndex > 0) {
      this.startWhiteKeyIndex--;
      this.updateVisibleKeys();
    } else if (direction === 'higher' && this.startWhiteKeyIndex < maxStartIndex) {
      this.startWhiteKeyIndex++;
      this.updateVisibleKeys();
    }
  }

  private getTotalWhiteKeys(): number {
    return this.allKeys.filter(k => !k.isBlack).length;
  }
  
  private generateAllKeys(): void {
    this.allKeys = [];
    const startOctave = 2;
    const endOctave = 6;
    
    for (let octave = startOctave; octave <= endOctave; octave++) {
      for (const noteName of this.notePattern) {
        // Skip notes below E2
        if (octave === 2 && ['C', 'C#', 'D', 'D#'].includes(noteName)) continue;
        
        // Skip notes above E6
        if (octave === 6 && noteName !== 'C' && noteName !== 'C#' && noteName !== 'D' && noteName !== 'D#' && noteName !== 'E') break;
        if (octave === 6 && ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].includes(noteName)) continue;

        this.allKeys.push({
          note: `${noteName}${octave}`,
          isBlack: noteName.includes('#'),
          isSelected: false
        });
      }
    }
  }

  private updateVisibleKeys(): void {
    // Filter keys to show based on startWhiteKeyIndex and visibleWhiteKeys
    let currentWhiteIndex = 0;
    let visibleKeys: PianoKey[] = [];
    
    // First, find the starting key in allKeys
    let startIndex = 0;
    let whiteCount = 0;
    
    // Find index in allKeys where our window starts
    for (let i = 0; i < this.allKeys.length; i++) {
      if (!this.allKeys[i].isBlack) {
        if (whiteCount === this.startWhiteKeyIndex) {
          startIndex = i;
          break;
        }
        whiteCount++;
      }
    }
    
    // Now collect keys until we have enough white keys
    let visibleWhiteCount = 0;
    let visibleWhiteIndex = 0; // For positioning
    
    for (let i = startIndex; i < this.allKeys.length; i++) {
      const key = this.allKeys[i];
      
      // Calculate position relative to the visible window
      let left = '';
      if (key.isBlack) {
        const position = (visibleWhiteIndex * this.whiteKeyWidth) - (this.blackKeyWidth / 2);
        left = `${position}px`;
      } else {
        const position = visibleWhiteIndex * this.whiteKeyWidth;
        left = `${position}px`;
        visibleWhiteCount++;
        visibleWhiteIndex++;
      }
      
      // Stop if we've collected enough white keys
      // Note: we continue to include black keys that might follow the last white key if needed, 
      // but usually we stop after the last white key.
      
      // Clone the key to avoid mutating the original allKeys with new positions
      visibleKeys.push({ ...key, left });
      
      if (!key.isBlack && visibleWhiteCount >= this.visibleWhiteKeys) {
        break;
      }
    }
    
    this.keys = visibleKeys;
    this.updateSelectedKeys();
  }
  
  private updateSelectedKeys(): void {
    // Reset all selections
    this.keys.forEach(key => key.isSelected = false);
    
    // Mark selected notes
    this.selectedPositions.forEach(pos => {
      // Get note name with octave (e.g., "C#4")
      const noteName = this.getNoteNameWithOctave(pos.note);
      
      // Find the specific key with this note and octave
      this.keys.forEach(key => {
        // Normalize both for comparison (handle enharmonic equivalents)
        // We need to split note and octave for normalization
        const keyNotePart = key.note.replace(/\d+$/, '');
        const keyOctavePart = key.note.match(/\d+$/)?.[0] || '';
        
        const inputNotePart = noteName.replace(/\d+$/, '');
        const inputOctavePart = noteName.match(/\d+$/)?.[0] || '';
        
        const normalizedKeyNote = this.normalizeNoteName(keyNotePart);
        const normalizedInputNote = this.normalizeNoteName(inputNotePart);
        
        if (normalizedKeyNote === normalizedInputNote && keyOctavePart === inputOctavePart) {
          key.isSelected = true;
        }
      });
    });
  }
  
  private normalizeNoteName(note: string): string {
    // Convert flats to sharps for consistent comparison
    const flatToSharp: { [key: string]: string } = {
      'Db': 'C#',
      'Eb': 'D#',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#',
      'Cb': 'B',
      'Fb': 'E',
      'B#': 'C',
      'E#': 'F'
    };
    
    return flatToSharp[note] || note;
  }
  
  private getNoteNameWithOctave(note: any): string {
    // Handle both formats: {pitch: 'G#', accidental: ''} and {pitch: 'G', accidental: '#'}
    let fullNoteName = '';
    
    if (note.pitch.includes('#') || note.pitch.includes('b')) {
      fullNoteName = note.pitch;
    } else {
      fullNoteName = note.pitch + (note.accidental || '');
    }
    
    return fullNoteName + (note.octave !== undefined ? note.octave : '');
  }
}
