import { Note } from './note.model';
import { Chord } from './chord.model';

export type ScaleType = 'major' | 'natural_minor' | 'harmonic_minor' | 'melodic_minor';

export interface Scale {
  root: Note;
  type: ScaleType;
  notes: Note[];
  chords: Chord[];
}

export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  'major': 'Major',
  'natural_minor': 'Natural Minor',
  'harmonic_minor': 'Harmonic Minor',
  'melodic_minor': 'Melodic Minor'
};
