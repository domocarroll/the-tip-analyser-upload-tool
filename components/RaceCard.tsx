import React from 'react';
import { AggregatedRace } from '../types';

interface RaceCardProps {
  race: AggregatedRace;
}

const TipCell: React.FC<{ count: number; total: number; highlight?: boolean }> = ({ count, total, highlight = false }) => {
  if (count === 0) {
    return <span className="text-gray-400">-</span>;
  }
  const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
  return (
    <div className={`flex flex-col items-center justify-center ${highlight ? 'font-bold' : ''}`} style={{color: highlight ? 'var(--accent-blue)' : 'inherit'}}>
      <span className="font-semibold text-base">{count}</span>
      <span className="text-xs text-gray-500">({percentage}%)</span>
    </div>
  );
};

export const RaceCard: React.FC<RaceCardProps> = ({ race }) => {
  if (!race || race.tips.length === 0) {
    return null;
  }

  return (
    <div className="card !p-0 overflow-hidden animate-fade-in">
      <div className="bg-gray-50 px-4 py-4 md:px-6" style={{borderBottom: '1px solid var(--border-color)'}}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold" style={{color: 'var(--primary-navy)'}}>
            {race.category} Race {race.raceNumber}
          </h2>
          <div className="text-right text-sm">
            <p className="text-gray-800"><span className="font-semibold">{race.totalTipstersInRace}</span> Expert Tipsters</p>
            <p className="text-gray-600"><span className="font-semibold">{race.totalSelectionsInRace}</span> Total Selections</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <th scope="col" className="px-4 py-3 w-1/3 md:w-auto">Horse</th>
              <th scope="col" className="px-3 py-3 text-center">Total Tips</th>
              <th scope="col" className="px-3 py-3 text-center">Tipster %</th>
              <th scope="col" className="px-3 py-3 text-center">Win</th>
              <th scope="col" className="px-3 py-3 text-center">2nd</th>
              <th scope="col" className="px-3 py-3 text-center hidden sm:table-cell">3rd</th>
              <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">4th</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor: 'var(--border-color)'}}>
            {race.tips.map((tip, index) => (
              <tr key={tip.horseName} className={`transition-colors hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  <span className="font-bold mr-4 w-6 inline-block text-right" style={{color: 'var(--accent-blue)'}}>{tip.horseNumber || '-'}</span>
                  <span className="truncate text-base" style={{color: 'var(--primary-navy)'}}>{tip.horseName}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <TipCell count={tip.totalTips} total={race.totalSelectionsInRace} highlight={true} />
                </td>
                <td className="px-3 py-3 text-center">
                  {race.totalTipstersInRace > 0 ? (
                      <div className={`flex flex-col items-center justify-center`}>
                          <span className="font-semibold text-base">{Math.round((tip.tipsterCount / race.totalTipstersInRace) * 100)}%</span>
                          <span className="text-xs text-gray-500">({tip.tipsterCount}/{race.totalTipstersInRace})</span>
                      </div>
                  ) : (
                      <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  <TipCell count={tip.winTips} total={race.totalSelectionsInRace} />
                </td>
                <td className="px-3 py-3 text-center">
                  <TipCell count={tip.place2Tips} total={race.totalSelectionsInRace} />
                </td>
                <td className="px-3 py-3 text-center hidden sm:table-cell">
                  <TipCell count={tip.place3Tips} total={race.totalSelectionsInRace} />
                </td>
                 <td className="px-3 py-3 text-center hidden md:table-cell">
                  <TipCell count={tip.place4Tips} total={race.totalSelectionsInRace} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
