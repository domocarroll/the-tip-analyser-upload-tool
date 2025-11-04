import React, { useState } from 'react';
import { AggregatedRace } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ShareButtonProps {
    data: AggregatedRace[];
}

export const ShareButton: React.FC<ShareButtonProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        try {
            const jsonString = JSON.stringify(data);
            const encoded = btoa(encodeURIComponent(jsonString));
            const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`;
            
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            }, () => {
                alert("Could not copy link to clipboard.");
            });
        } catch (error) {
            console.error("Failed to create share link:", error);
            alert("Could not create share link. Data might be too large.");
        }
    };

    return (
        <button
            type="button"
            className="btn btn-outline"
            onClick={handleShare}
        >
            {copied ? (
                <>
                    <CheckIcon className="w-5 h-5" style={{color: 'var(--color-green)'}} />
                    Copied!
                </>
            ) : (
                <>
                    <ShareIcon className="w-5 h-5" />
                    Share
                </>
            )}
        </button>
    );
};
