import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } from 'vexflow';
import { FretboardPosition } from '../../models';

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
  @ViewChild('sheetMusicContainer', { static: false }) container?: ElementRef;

  private renderer?: Renderer;

  ngAfterViewInit(): void {
    this.renderSheetMusic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPositions'] && !changes['selectedPositions'].firstChange) {
      this.renderSheetMusic();
    }
  }

  private renderSheetMusic(): void {
    if (!this.container) return;

    // Clear previous rendering
    const containerElement = this.container.nativeElement;
    containerElement.innerHTML = '';

    if (this.selectedPositions.length === 0) {
      return;
    }

    try {
      // Create renderer - taller to accommodate both staves
      this.renderer = new Renderer(containerElement, Renderer.Backends.SVG);
      this.renderer.resize(400, 280);
      const context = this.renderer.getContext();

      // Create treble clef stave (top)
      const trebleStave = new Stave(10, 20, 350);
      trebleStave.addClef('treble');
      trebleStave.setContext(context).draw();

      // Create bass clef stave (bottom)
      const bassStave = new Stave(10, 110, 350);
      bassStave.addClef('bass');
      bassStave.setContext(context).draw();

      // Add brace connecting the staves
      const connector = new StaveConnector(trebleStave, bassStave);
      connector.setType('brace');
      connector.setContext(context).draw();

      // Add line connecting the staves
      const lineConnector = new StaveConnector(trebleStave, bassStave);
      lineConnector.setType('single');
      lineConnector.setContext(context).draw();

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

      // Add accidentals
      treblePositions.forEach((pos, index) => {
        if (pos.note.accidental === '#') {
          trebleNote.addModifier(new Accidental('#'), index);
        } else if (pos.note.accidental === 'b') {
          trebleNote.addModifier(new Accidental('b'), index);
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

      // Add accidentals
      bassPositions.forEach((pos, index) => {
        if (pos.note.accidental === '#') {
          bassNote.addModifier(new Accidental('#'), index);
        } else if (pos.note.accidental === 'b') {
          bassNote.addModifier(new Accidental('b'), index);
        }
      });

      bassNotes.push(bassNote);
    }

    return { trebleNotes, bassNotes };
  }
}
