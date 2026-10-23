'use client';

import React from 'react';
import { syllabifySentence } from '@/lib/syllables';

interface SyllableReaderProps {
  sentence: string;
  activeSyllableIndex: number;
  isPlaying: boolean;
}

export const SyllableReader: React.FC<SyllableReaderProps> = ({
  sentence,
  activeSyllableIndex,
  isPlaying,
}) => {
  const parsedWords = syllabifySentence(sentence);

  // Contador global para calcular el índice absoluto de cada sílaba en la frase
  let globalSyllableCounter = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl max-w-xl mx-auto shadow-inner">
      {parsedWords.map((wordItem, wordIdx) => {
        return (
          <div
            key={wordIdx}
            className="flex items-center bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800/80 shadow-sm"
          >
            {wordItem.syllables.map((syl, sylIdx) => {
              const currentGlobalIdx = globalSyllableCounter++;
              const isActive = isPlaying && activeSyllableIndex === currentGlobalIdx;

              return (
                <React.Fragment key={sylIdx}>
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-medium text-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-zinc-950 font-black scale-110 shadow-[0_0_15px_rgba(52,211,153,0.7)]'
                        : 'text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {syl}
                  </span>
                  {sylIdx < wordItem.syllables.length - 1 && (
                    <span className="text-zinc-600 font-light mx-0.5 select-none">
                      ·
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
