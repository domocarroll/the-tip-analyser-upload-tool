import React from 'react';
import { AggregatedRace, AggregatedTip, RaceCategory } from '../types';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { categoryConfig, getCategoryName } from '../utils/categoryUtils';

interface SpecialBetsDisplayProps {
  races: AggregatedRace[];
}

const BetHorse: React.FC<{horse: AggregatedTip, index: number}> = ({ horse, index }) => (
    <div className="flex items-center gap-2 p-1.5 rounded bg-gray-100">
        <span className="font-semibold text-gray-500 text-sm w-5 text-center">{index + 1}.</span>
        <span className="font-bold w-6 text-right" style={{color: 'var(--accent-blue)'}}>{horse.horseNumber || '-'}</span>
        <span className="text-gray-800 truncate font-medium">{horse.horseName}</span>
    </div>
);

export const SpecialBetsDisplay: React.FC<SpecialBetsDisplayProps> = ({ races }) => {
    if (races.length === 0) return null;

    const getTrifectaSelections = (race: AggregatedRace): AggregatedTip[] => {
        return [...race.tips]
            .sort((a, b) => (b.winTips + b.place2Tips + b.place3Tips) - (a.winTips + a.place2Tips + a.place3Tips))
            .slice(0, 3);
    };

    const getFirstFourSelections = (race: AggregatedRace): AggregatedTip[] => {
        return race.tips.slice(0, 4);
    };

    const getQuaddieSelections = (): { category: RaceCategory; races: AggregatedRace[] }[] => {
        const racesByCategory: { [key in RaceCategory]?: AggregatedRace[] } = {};
        races.forEach(race => {
            if (!racesByCategory[race.category]) {
                racesByCategory[race.category] = [];
            }
            racesByCategory[race.category]!.push(race);
        });

        const quaddieData: { category: RaceCategory; races: AggregatedRace[] }[] = [];

        for (const category in racesByCategory) {
            const cat = category as RaceCategory;
            const categoryRaces = racesByCategory[cat]!;
            if (categoryRaces.length >= 4) {
                const sortedRaces = [...categoryRaces].sort((a, b) => a.raceNumber - b.raceNumber);
                const lastFourRaces = sortedRaces.slice(-4);
                
                const quaddieRaces = lastFourRaces.map(race => ({
                    ...race,
                    tips: race.tips.slice(0, 3) // Top 3 based on total tips
                }));
                
                quaddieData.push({ category: cat, races: quaddieRaces });
            }
        }
        return quaddieData;
    };

    const quaddieSelections = getQuaddieSelections();

    return (
        <div className="card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <BookmarkIcon className="w-8 h-8" style={{color: 'var(--accent-blue)'}} />
                <h2 className="text-2xl font-bold tracking-tight" style={{color: 'var(--primary-navy)'}}>Expert Picks & Multi-Bets</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quaddie */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-semibold" style={{color: 'var(--primary-navy)'}}>Quaddie Selections</h3>
                    {quaddieSelections.length > 0 ? quaddieSelections.map(q => {
                        const config = categoryConfig[q.category];
                        return (
                        <div key={q.category} className="p-3 bg-gray-50 rounded-lg space-y-3 border" style={{borderColor: 'var(--border-color)'}}>
                             <h4 className="font-bold text-center text-sm">
                                <span style={{color: config.color, borderColor: config.color, backgroundColor: config.bgColor}} className={`font-semibold border text-xs rounded-full px-2 py-0.5`}>
                                    {getCategoryName(q.category)} Quaddie
                                </span>
                            </h4>
                            {q.races.map(race => (
                                <div key={race.raceNumber}>
                                    <p className="font-semibold text-gray-500 text-xs mb-1">Race {race.raceNumber}</p>
                                    <div className="space-y-1">
                                    {race.tips.map((horse, i) => (
                                        <BetHorse key={horse.horseName} horse={horse} index={i} />
                                    ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        );
                    }) : <p className="text-sm text-gray-500">Not enough races for a Quaddie.</p>}
                </div>

                {/* Trifecta & First Four */}
                <div className="lg:col-span-2 max-h-[400px] overflow-y-auto space-y-4 pr-3 -mr-3">
                     <h3 className="text-lg font-semibold" style={{color: 'var(--primary-navy)'}}>Trifecta & First Four Picks</h3>
                     {races.map(race => (
                         <div key={`${race.category}-${race.raceNumber}`} className="p-3 bg-gray-50 rounded-lg border" style={{borderColor: 'var(--border-color)'}}>
                            <h4 className="font-semibold text-gray-700 mb-2">{race.category} Race {race.raceNumber}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Trifecta</p>
                                    <div className="space-y-1">
                                        {getTrifectaSelections(race).map((horse, i) => <BetHorse key={horse.horseName} horse={horse} index={i} />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">First Four</p>
                                     <div className="space-y-1">
                                        {getFirstFourSelections(race).map((horse, i) => <BetHorse key={horse.horseName} horse={horse} index={i} />)}
                                    </div>
                                </div>
                            </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>
    );
};
