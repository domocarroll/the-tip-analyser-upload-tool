import React from 'react';
import { AggregatedRace } from '../types';
import { Loader } from './Loader';
import { RaceCard } from './RaceCard';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ExportButton } from './ExportButton';
import { ShareButton } from './ShareButton';
import { SpecialBetsDisplay } from './SpecialBetsDisplay';
import { getCategoryName } from '../utils/categoryUtils';

interface ResultsDisplayProps {
  aggregatedRaces: AggregatedRace[];
  isLoading: boolean;
  error: string | null;
  onStartOver: () => void;
  isReadOnly: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ aggregatedRaces, isLoading, error, onStartOver, isReadOnly }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 card text-center">
        <Loader />
        <p className="mt-4 text-lg text-gray-600">Aggregating final results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 card bg-red-50 border-red-200 text-center">
        <h3 className="text-xl font-semibold" style={{color: 'var(--destructive-red)'}}>An Error Occurred</h3>
        <p className="mt-2 text-red-800">{error}</p>
        <button 
          onClick={onStartOver}
          className="mt-6 btn"
          style={{backgroundColor: 'var(--destructive-red)', color: 'white'}}
        >
          <ArrowPathIcon className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  let lastCategory: string | null = null;

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="text-center relative py-4">
          <h2 className="text-3xl font-bold tracking-tight" style={{color: 'var(--primary-navy)'}}>Analysis Complete</h2>
          <p className="mt-2 text-lg text-gray-600">Here is the aggregated summary of all tip sheets.</p>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2">
             <ShareButton data={aggregatedRaces} />
             <ExportButton data={aggregatedRaces} />
          </div>
      </div>
      
      <SpecialBetsDisplay races={aggregatedRaces} />

      {aggregatedRaces.map((race) => {
        const showCategoryHeader = race.category !== lastCategory;
        lastCategory = race.category;
        const categoryName = `${getCategoryName(race.category)} Races`;

        return (
          <React.Fragment key={`${race.category}-${race.raceNumber}`}>
            {showCategoryHeader && (
              <div className="pt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t" style={{borderColor: 'var(--border-color)'}} />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-100 px-4 text-lg font-semibold leading-6 text-gray-700 rounded-md" style={{backgroundColor: 'var(--background)'}}>{categoryName} ({race.category})</span>
                  </div>
                </div>
              </div>
            )}
            <RaceCard race={race} />
          </React.Fragment>
        );
      })}
       <div className="mt-8 text-center">
          <button 
            onClick={onStartOver}
            className="btn btn-primary btn-lg"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {isReadOnly ? 'Create Your Own Analysis' : 'Start New Analysis'}
          </button>
        </div>
    </div>
  );
};
