import { AggregatedRace } from "../types";

const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportToJson = (data: AggregatedRace[]) => {
    const jsonString = JSON.stringify(data, null, 2);
    const filename = `tipsheet_analysis_${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(jsonString, filename, 'application/json');
};

export const exportToCsv = (data: AggregatedRace[]) => {
    const headers = [
        "Category",
        "Race",
        "Horse Number",
        "Horse Name",
        "Total Tips",
        "Win Tips",
        "2nd Place Tips",
        "3rd Place Tips",
        "4th Place Tips"
    ];

    const rows = data.flatMap(race => 
        race.tips.map(tip => [
            race.category,
            race.raceNumber,
            tip.horseNumber || '',
            `"${tip.horseName.replace(/"/g, '""')}"`, // Handle quotes in names
            tip.totalTips,
            tip.winTips,
            tip.place2Tips,
            tip.place3Tips,
            tip.place4Tips
        ].join(','))
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `tipsheet_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
};