import React, { useState, useRef } from 'react';
import { Batch } from '../App';
import { RaceCategory } from '../types';
import { Loader } from './Loader';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { categoryConfig } from '../utils/categoryUtils';

interface MascotUploaderProps {
    onProcess: (batches: Batch[]) => void;
    isProcessing: boolean;
    processingProgress: { total: number; completed: number };
}

export const MascotUploader: React.FC<MascotUploaderProps> = ({ onProcess, isProcessing, processingProgress }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [raceCategory, setRaceCategory] = useState<RaceCategory>('SR');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
             setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const handleAddToBatch = () => {
        if (files.length > 0) {
            const newBatch: Batch = {
                id: `${raceCategory}-${Date.now()}`,
                category: raceCategory,
                files: files
            };
            setBatches(prev => [...prev, newBatch]);
            setFiles([]); // Clear file selection
        }
    };

    const handleRemoveBatch = (id: string) => {
        setBatches(batches.filter(batch => batch.id !== id));
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight" style={{color: 'var(--primary-navy)'}}>Upload Tip Sheets</h2>
                <p className="mt-2 text-lg text-gray-600">Get started by creating batches for each race meeting.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Batch Builder */}
                <div className="card space-y-4">
                    <div>
                        <h3 className="text-xl font-bold" style={{color: 'var(--primary-navy)'}}>1. Build Your Batch</h3>
                        <p className="text-sm text-gray-500 mt-1">Select a category, add files, and add them to the queue.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(categoryConfig) as RaceCategory[]).map(cat => {
                            const config = categoryConfig[cat];
                            const isSelected = raceCategory === cat;
                            return (
                            <button 
                                key={cat}
                                onClick={() => setRaceCategory(cat)}
                                style={isSelected ? { backgroundColor: config.color, color: 'white' } : {}}
                                className={`w-full py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${!isSelected ? `bg-gray-100 hover:bg-gray-200 text-gray-700` : ''}`}>
                                {config.name} ({cat})
                            </button>
                            )
                        })}
                    </div>
                    
                    <div 
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    >
                        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                           <button onClick={() => fileInputRef.current?.click()} className="font-semibold" style={{color: 'var(--accent-blue)'}}>
                               Click to upload
                           </button>
                           {' '}or drag and drop
                        </p>
                       <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                       <input ref={fileInputRef} type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="hidden" />
                    </div>
                    
                     {files.length > 0 && (
                        <div className="space-y-2 animate-fade-in">
                             <ul className="max-h-28 overflow-y-auto space-y-1 pr-2 border rounded-lg p-2" style={{borderColor: 'var(--border-color)'}}>
                                {files.map(file => (
                                    <li key={file.name} className="flex justify-between items-center text-xs bg-gray-50 p-1.5 rounded">
                                        <span className="truncate text-gray-700 pl-1">{file.name}</span>
                                        <button onClick={() => handleRemoveFile(file.name)}><XCircleIcon className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleAddToBatch} disabled={isProcessing} className="btn btn-secondary w-full">
                                <PlusCircleIcon className="w-5 h-5"/> Add to Batch Queue
                            </button>
                        </div>
                    )}
                </div>

                {/* Batch Queue */}
                <div className="card space-y-4">
                    <h3 className="text-xl font-bold" style={{color: 'var(--primary-navy)'}}>2. Batch Queue</h3>
                     {batches.length > 0 ? (
                        <>
                        <ul className="space-y-3">
                            {batches.map(batch => {
                                const config = categoryConfig[batch.category];
                                return (
                                    <li key={batch.id} className="bg-white p-3 rounded-lg flex justify-between items-center border" style={{borderColor: 'var(--border-color)'}}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg"><PhotoIcon className="w-6 h-6 text-gray-500"/></div>
                                            <div>
                                                <span style={{ color: config.color, borderColor: config.color, backgroundColor: config.bgColor }} className={`font-bold text-xs border rounded-full px-2 py-0.5`}>{batch.category}</span>
                                                <p className="text-sm text-gray-600 mt-1">{batch.files.length} files ready</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveBatch(batch.id)} disabled={isProcessing}>
                                            <XCircleIcon className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"/>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                         <div className="pt-4">
                            {isProcessing ? (
                                 <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden border" style={{borderColor: 'var(--border-color)'}}>
                                    <div 
                                        className="h-4 rounded-full transition-all duration-500" 
                                        style={{ width: `${(processingProgress.completed / processingProgress.total) * 100}%`, backgroundColor: 'var(--accent-blue)' }}
                                    ></div>
                                     <div className="absolute w-full h-full text-center text-xs font-bold text-white inset-0 flex items-center justify-center">
                                        <span>Analyzing... ({processingProgress.completed} / {processingProgress.total})</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onProcess(batches)}
                                    disabled={batches.length === 0}
                                    className="btn btn-primary btn-lg w-full"
                                >
                                    Process All Batches
                                </button>
                            )}
                        </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Your batch queue is empty.</p>
                            <p className="text-sm text-gray-400">Add some files to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
