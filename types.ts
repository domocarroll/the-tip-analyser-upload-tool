// FIX: Define and export RaceCategory here to serve as the single source of truth.
export type RaceCategory = 'SR' | 'MR' | 'BR' | 'PR' | 'AR' | 'OR';

export interface Tip {
  horseNumber?: number;
  horseName: string;
}

export interface TipsterSelection {
  tipsterName: string;
  selections: Tip[];
}

export interface RaceTips {
  raceNumber: number;
  tips: TipsterSelection[];
  category?: RaceCategory; // Added for batch processing context
}

export interface AggregatedTip {
  horseName:string;
  horseNumber?: number;
  totalTips: number;
  tipsterCount: number;
  winTips: number;
  place2Tips: number;
  place3Tips: number;
  place4Tips: number;
}

export interface AggregatedRace {
  raceNumber: number;
  category: RaceCategory; // Added for batch processing context
  tips: AggregatedTip[];
  totalSelectionsInRace: number;
  totalTipstersInRace: number;
}