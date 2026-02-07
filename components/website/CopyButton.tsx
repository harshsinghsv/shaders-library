'use client';
import React, { useState } from 'react';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`px-3 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${className}`}
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

export default CopyButton;
