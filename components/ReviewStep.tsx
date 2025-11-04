import React, { useState } from 'react';
import { Loader } from './Loader';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { EditableDataTable } from './EditableDataTable';
import { RaceTips } from '../types';

interface ReviewStepProps {
    uploadedFileUrls: string[];
    extractedJson: RaceTips[];
    setExtractedJson: React.Dispatch<React.SetStateAction<RaceTips[]>>;
    highlightedCells: Set<string>;
    onRefine: (prompt: string) => void;
    onAccept: () => void;
    isRefining: boolean;
    isLoading: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
    uploadedFileUrls,
    extractedJson,
    setExtractedJson,
    highlightedCells,
    onRefine,
    onAccept,
    isRefining,
    isLoading
}) => {
    const [prompt, setPrompt] = useState('');

    const handleRefineClick = () => {
        onRefine(prompt);
        setPrompt('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight" style={{color: 'var(--primary-navy)'}}>Review & Refine</h2>
                <p className="mt-2 text-lg text-gray-600">Verify extracted data. Click any cell to edit or use AI chat for changes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Previews & AI Chat */}
                 <div className="space-y-4 flex flex-col">
                    <h3 className="text-lg font-semibold" style={{color: 'var(--primary-navy)'}}>Source Documents</h3>
                     <div className="card !p-4 max-h-[450px] overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {uploadedFileUrls.map((url, index) => (
                                <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                    <img
                                        src={url}
                                        alt={`Uploaded content ${index + 1}`}
                                        className="rounded-lg object-cover aspect-[4/5] transition-transform duration-200 hover:scale-105"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                     <div className="card !p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
                            <h4 className="font-semibold" style={{color: 'var(--primary-navy)'}}>AI Refinement Chat</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">e.g., "Combine SMH Craig Kerry and SKY Dave into a new tipster called 'Experts'"</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleRefineClick()}
                                placeholder="Tell the AI what to change..."
                                className="form-input"
                                disabled={isRefining}
                            />
                            <button
                                onClick={handleRefineClick}
                                disabled={isRefining || !prompt.trim()}
                                className="btn btn-secondary"
                            >
                                {isRefining ? <Loader /> : <PaperAirplaneIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>


                {/* Extracted Data Table */}
                <div className="space-y-4 flex flex-col">
                    <h3 className="text-lg font-semibold" style={{color: 'var(--primary-navy)'}}>Live Extracted Data</h3>
                    <div className="card flex-grow max-h-[600px] overflow-y-auto p-1">
                        <EditableDataTable 
                            data={extractedJson}
                            onDataChange={setExtractedJson}
                            highlightedCells={highlightedCells}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center pt-4">
                 <button
                    onClick={onAccept}
                    disabled={isLoading}
                    className="btn btn-primary btn-lg w-full max-w-xs"
                >
                    {isLoading ? <><Loader /> Aggregating...</> : 'Accept & See Results'}
                </button>
            </div>
        </div>
    );
};
