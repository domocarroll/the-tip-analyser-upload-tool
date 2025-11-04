import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MascotUploader } from './components/MascotUploader';
import { ReviewStep } from './components/ReviewStep';
import { ResultsDisplay } from './components/ResultsDisplay';
import { processTipSheets, refineExtractedData } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { titleCase } from './utils/stringUtils';
import { RaceTips, AggregatedRace, AggregatedTip, RaceCategory } from './types';
import { diffJson } from './utils/jsonDiff';

export type AppStep = 'upload' | 'review' | 'results';

export interface Batch {
  id: string;
  category: RaceCategory;
  files: File[];
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isAggregating, setIsAggregating] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ total: 0, completed: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [extractedJson, setExtractedJson] = useState<RaceTips[]>([]);
  const [aggregatedRaces, setAggregatedRaces] = useState<AggregatedRace[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    // Check for shared data in URL on initial load
    if (window.location.hash && window.location.hash.startsWith('#data=')) {
      try {
        const base64Data = window.location.hash.substring(6); // remove #data=
        const jsonString = decodeURIComponent(atob(base64Data));
        const data = JSON.parse(jsonString);
        if (Array.isArray(data) && data.length > 0) {
          setAggregatedRaces(data);
          setStep('results');
          setIsReadOnly(true);
        }
      } catch (e) {
        console.error("Failed to parse data from URL", e);
        // If parsing fails, clear the hash and start fresh
        history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  }, []); // Run only once on mount
  
  const handleProcessAllBatches = async (batches: Batch[]) => {
    if (batches.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProcessingProgress({ total: batches.length, completed: 0 });

    try {
      const allFiles = batches.flatMap(b => b.files);
      setUploadedFileUrls(allFiles.map(file => URL.createObjectURL(file)));

      const processingPromises = batches.map(async (batch) => {
        const base64Files = await Promise.all(batch.files.map(fileToBase64));
        const result = await processTipSheets(base64Files, batch.category);
        setProcessingProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        return result;
      });

      const resultsFromAllBatches = await Promise.all(processingPromises);
      
      const combinedJson = resultsFromAllBatches.flat();
      setExtractedJson(combinedJson);
      setStep('review');
    } catch (err) {
      console.error(err);
      setError('Failed to process tip sheets. The AI might be having a moment. Please check your files and try again.');
      setStep('upload'); // Stay on upload screen to show error
    } finally {
      setIsProcessing(false);
      setProcessingProgress({ total: 0, completed: 0 });
    }
  };
  
  const handleRefineData = async (prompt: string) => {
      setIsRefining(true);
      setError(null);
      const oldJson = JSON.parse(JSON.stringify(extractedJson));
      try {
          const refinedJsonString = await refineExtractedData(extractedJson, prompt);
          const refinedJson = JSON.parse(refinedJsonString);
          setExtractedJson(refinedJson);

          const changes = diffJson(oldJson, refinedJson);
          setHighlightedCells(changes);
          // Clear highlights after animation
          setTimeout(() => setHighlightedCells(new Set()), 2500);

      } catch (err) {
          console.error(err);
          // Display a more user-friendly error in a toast or modal in a real app
          alert("The AI couldn't apply that change. Please try rephrasing your request.");
      } finally {
          setIsRefining(false);
      }
  };
  
  const handleAcceptAndAggregate = () => {
    setIsAggregating(true);
    try {
      const aggregationMap: { [key: string]: AggregatedRace } = {};
      const tipsterSets: { [key: string]: Set<string> } = {};
      const tipsterSelectionsPerHorse: { [raceKey: string]: { [horseName: string]: Set<string> } } = {};

      for (const raceData of extractedJson) {
        const raceKey = `${raceData.category}-R${raceData.raceNumber}`;

        if (!aggregationMap[raceKey]) {
          aggregationMap[raceKey] = {
            raceNumber: raceData.raceNumber,
            category: raceData.category || 'SR',
            tips: [],
            totalSelectionsInRace: 0,
            totalTipstersInRace: 0,
          };
          tipsterSets[raceKey] = new Set<string>();
          tipsterSelectionsPerHorse[raceKey] = {};
        }
        
        for (const tipster of raceData.tips) {
          tipsterSets[raceKey].add(tipster.tipsterName);

          for (let i = 0; i < tipster.selections.length; i++) {
            const selection = tipster.selections[i];
            const horseKey = titleCase(selection.horseName);
            
            if (!tipsterSelectionsPerHorse[raceKey][horseKey]) {
                tipsterSelectionsPerHorse[raceKey][horseKey] = new Set<string>();
            }
            tipsterSelectionsPerHorse[raceKey][horseKey].add(tipster.tipsterName);
            
            aggregationMap[raceKey].totalSelectionsInRace++;

            let horseTip = aggregationMap[raceKey].tips.find(t => t.horseName === horseKey);

            if (!horseTip) {
              horseTip = {
                horseName: horseKey,
                horseNumber: selection.horseNumber,
                totalTips: 0,
                tipsterCount: 0,
                winTips: 0,
                place2Tips: 0,
                place3Tips: 0,
                place4Tips: 0,
              };
              aggregationMap[raceKey].tips.push(horseTip);
            }
            
            if(!horseTip.horseNumber && selection.horseNumber) {
              horseTip.horseNumber = selection.horseNumber;
            }

            horseTip.totalTips++;
            if (i === 0) horseTip.winTips++;
            else if (i === 1) horseTip.place2Tips++;
            else if (i === 2) horseTip.place3Tips++;
            else if (i === 3) horseTip.place4Tips++;
          }
        }
      }

      // After processing all data, set the final unique tipster count and tipster count per horse
      for (const raceKey in aggregationMap) {
        if (tipsterSets[raceKey]) {
            aggregationMap[raceKey].totalTipstersInRace = tipsterSets[raceKey].size;
        }
        
        const race = aggregationMap[raceKey];
        const horseTipsters = tipsterSelectionsPerHorse[raceKey];
        if (horseTipsters) {
            for (const horseTip of race.tips) {
                if (horseTipsters[horseTip.horseName]) {
                    horseTip.tipsterCount = horseTipsters[horseTip.horseName].size;
                }
            }
        }
      }

      const finalAggregatedData = Object.values(aggregationMap).map(race => {
        race.tips.sort((a, b) => b.totalTips - a.totalTips || b.winTips - a.winTips);
        return race;
      });

      finalAggregatedData.sort((a,b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.raceNumber - b.raceNumber;
      });

      setAggregatedRaces(finalAggregatedData);
      setStep('results');
    } catch (err) {
      console.error("Aggregation failed:", err);
      setError("Could not aggregate the data. There might be an issue with the data structure.");
      setStep('review');
    } finally {
      setIsAggregating(false);
    }
  };

  const handleStartOver = () => {
    // Clear URL hash if it exists to go back to the main app state
    if (window.location.hash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    
    setStep('upload');
    setIsProcessing(false);
    setIsRefining(false);
    setIsAggregating(false);
    setError(null);
    setUploadedFileUrls([]);
    setExtractedJson([]);
    setAggregatedRaces([]);
    setProcessingProgress({ total: 0, completed: 0 });
    setIsReadOnly(false); // Reset read-only state
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return <MascotUploader onProcess={handleProcessAllBatches} isProcessing={isProcessing} processingProgress={processingProgress} />;
      case 'review':
        return <ReviewStep 
                  uploadedFileUrls={uploadedFileUrls}
                  extractedJson={extractedJson}
                  setExtractedJson={setExtractedJson}
                  highlightedCells={highlightedCells}
                  onRefine={handleRefineData}
                  onAccept={handleAcceptAndAggregate}
                  isRefining={isRefining}
                  isLoading={isAggregating}
                />;
      case 'results':
        return <ResultsDisplay 
                  aggregatedRaces={aggregatedRaces} 
                  isLoading={false} 
                  error={null} 
                  onStartOver={handleStartOver}
                  isReadOnly={isReadOnly}
                />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        {error && step === 'upload' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in" role="alert">
            <strong className="font-bold">An Error Occurred: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderStep()}
      </main>
      <footer className="text-center py-6 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} TipSheet.ai - All Rights Reserved.</p>
        <p className="mt-2">Please gamble responsibly.</p>
      </footer>
    </>
  );
};

export default App;