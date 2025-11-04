import React, { useState, useEffect } from 'react';
import { RaceTips, Tip } from '../types';
import { categoryConfig } from '../utils/categoryUtils';

interface EditableCellProps {
  value: string | number | undefined;
  path: string;
  onUpdate: (path: string, value: string | number) => void;
  isHighlighted: boolean;
  type?: 'text' | 'number';
}

const EditableCell: React.FC<EditableCellProps> = ({ value, path, onUpdate, isHighlighted, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onUpdate(path, type === 'number' ? Number(currentValue) || 0 : String(currentValue));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
        setCurrentValue(value);
        setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type={type}
        value={currentValue || ''}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full bg-blue-50 text-gray-800 p-1 rounded border border-blue-400 outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer w-full p-1 rounded ${isHighlighted ? 'cell-highlight' : ''}`}
    >
      {value || <span className="text-gray-400">empty</span>}
    </div>
  );
};


interface EditableDataTableProps {
  data: RaceTips[];
  onDataChange: (newData: RaceTips[]) => void;
  highlightedCells: Set<string>;
}

export const EditableDataTable: React.FC<EditableDataTableProps> = ({ data, onDataChange, highlightedCells }) => {

    const handleUpdate = (path: string, newValue: string | number) => {
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        
        const keys = path.split('-');
        const raceIndex = parseInt(keys[1]);
        const tipsterIndex = parseInt(keys[3]);
        const selectionIndex = parseInt(keys[5]);
        const field = keys[6];

        if(!isNaN(raceIndex) && !isNaN(tipsterIndex) && !isNaN(selectionIndex) && field) {
            newData[raceIndex].tips[tipsterIndex].selections[selectionIndex][field as keyof Tip] = newValue as never;
        } else if (!isNaN(raceIndex) && !isNaN(tipsterIndex) && keys[4] === 'tipsterName') {
            newData[raceIndex].tips[tipsterIndex].tipsterName = String(newValue);
        }
        
        onDataChange(newData);
    };

    if(!data || data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No data extracted yet.</div>
    }

    return (
        <div className="space-y-4 p-2 text-sm">
        {data.map((race, raceIndex) => {
            const config = categoryConfig[race.category || 'OR'];
            return (
            <div key={`race-${raceIndex}`} className="bg-white rounded-xl border" style={{borderColor: 'var(--border-color)'}}>
                <h4 className="font-bold text-base p-3 bg-gray-50 rounded-t-xl" style={{color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)'}}>
                   <span style={{
                        color: config.color,
                        borderColor: config.color,
                        backgroundColor: config.bgColor,
                   }} className={`font-bold text-xs border rounded-full px-2 py-0.5 mr-2`}>
                        {race.category}
                    </span> 
                    Race {race.raceNumber}
                </h4>
                <div className="space-y-2 p-3">
                {race.tips.map((tipster, tipsterIndex) => (
                    <div key={`tipster-${tipsterIndex}`} className="p-2 rounded bg-gray-50">
                        <div className="font-semibold text-gray-700">
                           <EditableCell
                                value={tipster.tipsterName}
                                path={`race-${raceIndex}-tipster-${tipsterIndex}-tipsterName`}
                                onUpdate={handleUpdate}
                                isHighlighted={highlightedCells.has(`race-${raceIndex}-tipster-${tipsterIndex}-tipsterName`)}
                           />
                        </div>
                        <table className="mt-1 w-full text-gray-800">
                            <tbody>
                            {tipster.selections.map((selection, selectionIndex) => {
                                const numPath = `race-${raceIndex}-tipster-${tipsterIndex}-selection-${selectionIndex}-horseNumber`;
                                const namePath = `race-${raceIndex}-tipster-${tipsterIndex}-selection-${selectionIndex}-horseName`;
                                return (
                                <tr key={`selection-${selectionIndex}`} className="hover:bg-gray-100 rounded-md">
                                    <td className="w-12 text-gray-400 text-center pr-2">{selectionIndex + 1}.</td>
                                    <td className="w-16">
                                        <EditableCell
                                            value={selection.horseNumber}
                                            path={numPath}
                                            onUpdate={handleUpdate}
                                            isHighlighted={highlightedCells.has(numPath)}
                                            type="number"
                                        />
                                    </td>
                                    <td>
                                        <EditableCell
                                            value={selection.horseName}
                                            path={namePath}
                                            onUpdate={handleUpdate}
                                            isHighlighted={highlightedCells.has(namePath)}
                                        />
                                    </td>
                                </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                ))}
                </div>
            </div>
            );
        })}
        </div>
    );
};
