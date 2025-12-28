import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';
import { FretboardPosition } from '../../models';

@Component({
  selector: 'app-playback-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playback-controls.component.html',
  styleUrl: './playback-controls.component.scss'
})
export class PlaybackControlsComponent {
  @Input() positions: FretboardPosition[] = [];

  constructor(private audioService: AudioService) {}

  playChord(): void {
    const notes = this.getNotes();
    if (notes.length > 0) {
      this.audioService.playChord(notes);
    }
  }

  playArpeggio(): void {
    const notes = this.getNotes();
    if (notes.length > 0) {
      this.audioService.playArpeggio(notes);
    }
  }

  private getNotes(): string[] {
    // Extract unique notes with octaves
    const notes = this.positions.map(p => {
      // Ensure we have the octave. FretboardPosition.note is a Note object { pitch: 'E', accidental: '', octave: 2 }
      const n = p.note;
      return `${n.pitch}${n.accidental}${n.octave}`;
    });
    
    // Remove duplicates (though playing duplicates might be desired for volume, usually we want unique string vibrations)
    // Actually, for a guitar chord, we want to play every string that is sounding.
    // So duplicates (unison notes on different strings) should be played.
    return notes;
  }
}
