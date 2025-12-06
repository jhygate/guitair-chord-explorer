import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } from 'vexflow';
import { FretboardPosition, Note, ScaleType } from '../../models';

@Component({
  selector: 'app-sheet-music',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sheet-music.component.html',
  styleUrl: './sheet-music.component.scss'
})
export class SheetMusicComponent implements OnChanges, AfterViewInit {
  @Input() selectedPositions: FretboardPosition[] = [];
  @Input() chordName: string = '';
  @Input() rootNote: Note | null = null;
  @Input() scaleType: ScaleType | null = null;
  @ViewChild('sheetMusicContainer', { static: false }) container?: ElementRef;

  showKeySignature = false;
  private renderer?: Renderer;

  ngAfterViewInit(): void {
    this.renderSheetMusic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('SheetMusicComponent ngOnChanges:', changes);
    console.log('Current rootNote:', this.rootNote);
    console.log('Current scaleType:', this.scaleType);
    
    if (changes['selectedPositions'] && !changes['selectedPositions'].firstChange) {
      this.renderSheetMusic();
    }
    if (changes['rootNote'] || changes['scaleType']) {
      console.log('Root note or scale type changed, re-rendering');
      if (!changes['rootNote']?.firstChange || !changes['scaleType']?.firstChange) {
        this.renderSheetMusic();
      }
    }
  }

  private renderSheetMusic(): void {
    if (!this.container) return;

    // Clear previous rendering
    const containerElement = this.container.nativeElement;
    containerElement.innerHTML = '';

    try {
      // Create renderer - taller to accommodate both staves
      this.renderer = new Renderer(containerElement, Renderer.Backends.SVG);
      this.renderer.resize(400, 280);
      const context = this.renderer.getContext();

      // Create treble clef stave (top)
      const trebleStave = new Stave(10, 20, 350);
      trebleStave.addClef('treble');
      
      // Add key signature if enabled
      if (this.showKeySignature) {
        const keySignature = this.getKeySignature();
        if (keySignature) {
          trebleStave.addKeySignature(keySignature);
        }
      }
      
      trebleStave.setContext(context).draw();

      // Create bass clef stave (bottom)
      const bassStave = new Stave(10, 110, 350);
      bassStave.addClef('bass');
      
      // Add key signature if enabled
      if (this.showKeySignature) {
        const keySignature = this.getKeySignature();
        if (keySignature) {
          bassStave.addKeySignature(keySignature);
        }
      }
      
      bassStave.setContext(context).draw();

      // Add brace connecting the staves
      const connector = new StaveConnector(trebleStave, bassStave);
      connector.setType('brace');
      connector.setContext(context).draw();

      // Add line connecting the staves
      const lineConnector = new StaveConnector(trebleStave, bassStave);
      lineConnector.setType('single');
      lineConnector.setContext(context).draw();

      // Only draw notes if we have positions selected
      if (this.selectedPositions.length > 0) {
        // Split notes between treble and bass clefs
        const { trebleNotes, bassNotes } = this.convertPositionsToNotes();

        // Draw treble clef notes
        if (trebleNotes.length > 0) {
          const trebleVoice = new Voice({ numBeats: 4, beatValue: 4 });
          trebleVoice.addTickables(trebleNotes);
          new Formatter().joinVoices([trebleVoice]).format([trebleVoice], 300);
          trebleVoice.draw(context, trebleStave);
        }

        // Draw bass clef notes
        if (bassNotes.length > 0) {
          const bassVoice = new Voice({ numBeats: 4, beatValue: 4 });
          bassVoice.addTickables(bassNotes);
          new Formatter().joinVoices([bassVoice]).format([bassVoice], 300);
          bassVoice.draw(context, bassStave);
        }
      }
    } catch (error) {
      console.error('Error rendering sheet music:', error);
    }
  }

  private convertPositionsToNotes(): { trebleNotes: StaveNote[], bassNotes: StaveNote[] } {
    if (this.selectedPositions.length === 0) {
      return { trebleNotes: [], bassNotes: [] };
    }

    // Sort positions by pitch (lowest to highest for proper stacking)
    const sortedPositions = [...this.selectedPositions].sort((a, b) => {
      const aOctave = a.note.octave || 0;
      const bOctave = b.note.octave || 0;
      if (aOctave !== bOctave) return aOctave - bOctave;

      const pitchOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const aIndex = pitchOrder.indexOf(a.note.pitch);
      const bIndex = pitchOrder.indexOf(b.note.pitch);
      return aIndex - bIndex;
    });

    // Split notes between treble (B3 and above) and bass (below B3)
    const treblePositions = sortedPositions.filter(pos => {
      const octave = pos.note.octave || 0;
      if (octave > 3) return true;
      if (octave < 3) return false;
      // For octave 3, include B and above in treble
      const pitchOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      return pitchOrder.indexOf(pos.note.pitch) >= 6; // B and above
    });

    const bassPositions = sortedPositions.filter(pos => {
      const octave = pos.note.octave || 0;
      if (octave > 3) return false;
      if (octave < 3) return true;
      // For octave 3, include A and below in bass
      const pitchOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      return pitchOrder.indexOf(pos.note.pitch) < 6; // A and below
    });

    const trebleNotes: StaveNote[] = [];
    const bassNotes: StaveNote[] = [];

    // Create treble clef note
    if (treblePositions.length > 0) {
      const trebleKeys = treblePositions.map(pos => {
        const pitch = pos.note.pitch.toLowerCase();
        const accidental = pos.note.accidental === '#' ? '#' : pos.note.accidental === 'b' ? 'b' : '';
        const octave = pos.note.octave || 4;
        return `${pitch}${accidental}/${octave}`;
      });

      const trebleNote = new StaveNote({
        keys: trebleKeys,
        duration: 'w',
        clef: 'treble'
      });

      // Add accidentals - only if not in key signature when key sig is shown
      treblePositions.forEach((pos, index) => {
        const accidentalToShow = this.shouldShowAccidental(pos.note);
        if (accidentalToShow) {
          trebleNote.addModifier(new Accidental(accidentalToShow), index);
        }
      });

      trebleNotes.push(trebleNote);
    }

    // Create bass clef note
    if (bassPositions.length > 0) {
      const bassKeys = bassPositions.map(pos => {
        const pitch = pos.note.pitch.toLowerCase();
        const accidental = pos.note.accidental === '#' ? '#' : pos.note.accidental === 'b' ? 'b' : '';
        const octave = pos.note.octave || 4;
        return `${pitch}${accidental}/${octave}`;
      });

      const bassNote = new StaveNote({
        keys: bassKeys,
        duration: 'w',
        clef: 'bass'
      });

      // Add accidentals - only if not in key signature when key sig is shown
      bassPositions.forEach((pos, index) => {
        const accidentalToShow = this.shouldShowAccidental(pos.note);
        if (accidentalToShow) {
          bassNote.addModifier(new Accidental(accidentalToShow), index);
        }
      });

      bassNotes.push(bassNote);
    }

    return { trebleNotes, bassNotes };
  }

  toggleKeySignature(): void {
    this.showKeySignature = !this.showKeySignature;
    console.log('toggleKeySignature called, showKeySignature:', this.showKeySignature);
    console.log('rootNote:', this.rootNote);
    console.log('scaleType:', this.scaleType);
    console.log('getKeySignature():', this.getKeySignature());
    this.renderSheetMusic();
  }

  private getKeySignature(): string | null {
    if (!this.rootNote || !this.scaleType) {
      return null;
    }

    // Normalize the root note
    const rootPitch = this.rootNote.pitch.includes('#') || this.rootNote.pitch.includes('b')
      ? this.rootNote.pitch
      : this.rootNote.pitch + (this.rootNote.accidental || '');

    // Only implement for major and natural minor scales
    if (this.scaleType === 'major') {
      const majorKeys: { [key: string]: string } = {
        'C': 'C',
        'G': 'G',
        'D': 'D',
        'A': 'A',
        'E': 'E',
        'B': 'B',
        'F#': 'F#',
        'C#': 'C#',
        'G#': 'Ab',  // Use enharmonic Ab instead of G#
        'D#': 'Eb',  // Use enharmonic Eb instead of D#
        'A#': 'Bb',  // Use enharmonic Bb instead of A#
        'F': 'F',
        'Bb': 'Bb',
        'Eb': 'Eb',
        'Ab': 'Ab',
        'Db': 'Db',
        'Gb': 'Gb'
      };
      return majorKeys[rootPitch] || null;
    } else if (this.scaleType === 'natural_minor') {
      // Convert minor key to its relative major for key signature
      const minorToMajor: { [key: string]: string } = {
        'A': 'C',
        'E': 'G',
        'B': 'D',
        'F#': 'A',
        'C#': 'E',
        'G#': 'B',
        'D#': 'F#',
        'A#': 'C#',
        'D': 'F',
        'G': 'Bb',
        'C': 'Eb',
        'F': 'Ab',
        'Bb': 'Db',
        'Eb': 'Gb'
      };
      return minorToMajor[rootPitch] || null;
    }
    
    return null;
  }

  /**
   * Determine what accidental should be shown for a note
   * Returns: '#', 'b', 'n' (natural), or null (no accidental needed)
   * - When key signature is OFF: show actual sharp/flat
   * - When key signature is ON: only show if different from key sig, use natural if needed
   */
  private shouldShowAccidental(note: Note): string | null {
    const noteAccidental = note.pitch.includes('#') || note.pitch.includes('b')
      ? (note.pitch.includes('#') ? '#' : 'b')
      : note.accidental;

    // If key signature is not shown, show the actual accidental
    if (!this.showKeySignature) {
      return noteAccidental === '#' || noteAccidental === 'b' ? noteAccidental : null;
    }

    // Get the key signature
    const keySig = this.getKeySignature();
    if (!keySig) {
      return noteAccidental === '#' || noteAccidental === 'b' ? noteAccidental : null;
    }

    // Determine which notes are affected by the key signature
    const keySignatureMap: { [key: string]: string[] } = {
      'C': [],
      'G': ['F'],      // F#
      'D': ['F', 'C'],  // F#, C#
      'A': ['F', 'C', 'G'],  // F#, C#, G#
      'E': ['F', 'C', 'G', 'D'],  // F#, C#, G#, D#
      'B': ['F', 'C', 'G', 'D', 'A'],  // F#, C#, G#, D#, A#
      'F#': ['F', 'C', 'G', 'D', 'A', 'E'],  // All sharps
      'C#': ['F', 'C', 'G', 'D', 'A', 'E', 'B'],  // All sharps
      'F': ['B'],      // Bb
      'Bb': ['B', 'E'],  // Bb, Eb
      'Eb': ['B', 'E', 'A'],  // Bb, Eb, Ab
      'Ab': ['B', 'E', 'A', 'D'],  // Bb, Eb, Ab, Db
      'Db': ['B', 'E', 'A', 'D', 'G'],  // Bb, Eb, Ab, Db, Gb
      'Gb': ['B', 'E', 'A', 'D', 'G', 'C']  // All flats
    };

    const affectedNotes = keySignatureMap[keySig] || [];
    
    // Get the base pitch (without accidental)
    const basePitch = note.pitch.replace(/#|b/g, '');
    
    // If this note's base pitch is affected by the key signature
    if (affectedNotes.includes(basePitch)) {
      // Determine what accidental the key signature implies
      const keyIsSharp = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'].includes(keySig);
      const keyImpliesAccidental = keyIsSharp ? '#' : 'b';
      
      // If the note matches what the key signature says, don't show accidental
      if (noteAccidental === keyImpliesAccidental) {
        return null;
      }
      
      // If the note is natural but key signature says it should be sharp/flat, show natural
      if (!noteAccidental || noteAccidental === '') {
        return 'n'; // Natural sign
      }
      
      // Otherwise show the actual accidental (e.g., sharp in a flat key)
      return noteAccidental;
    }
    
    // If the note isn't affected by key signature, show accidental if present
    if (noteAccidental === '#' || noteAccidental === 'b') {
      return noteAccidental;
    }
    
    return null;
  }
}
