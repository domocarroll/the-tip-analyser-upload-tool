import React, { useState, useRef, useEffect } from 'react';
import { AggregatedRace } from '../types';
import { exportToCsv, exportToJson } from '../utils/exportUtils';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface ExportButtonProps {
    data: AggregatedRace[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleExport = (format: 'csv' | 'json') => {
        if (format === 'csv') {
            exportToCsv(data);
        } else {
            exportToJson(data);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    className="btn btn-outline"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Export
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 border z-20 animate-fade-in" style={{borderColor: 'var(--border-color)'}}>
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            Export as CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            Export as JSON
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
