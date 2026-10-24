'use client';

import React from 'react';
import { syllabifySentence } from '@/lib/syllables';

export type SyllableFontScale = 'normal' | 'grande' | 'extragrande';

interface SyllableReaderProps {
  sentence: string;
  activeSyllableIndex: number;
  isPlaying: boolean;
  fontScale?: SyllableFontScale;
}

export const SyllableReader: React.FC<SyllableReaderProps> = ({
  sentence,
  activeSyllableIndex,
  isPlaying,
  fontScale = 'normal',
}) => {
  const parsedWords = syllabifySentence(sentence);

  // Contador global para calcular el índice absoluto de cada sílaba en la frase
  let globalSyllableCounter = 0;

  const fontClass = {
    normal: 'text-base sm:text-lg px-1.5 py-0.5',
    grande: 'text-lg sm:text-xl px-2 py-1',
    extragrande: 'text-xl sm:text-2xl px-2.5 py-1.5 font-bold',
  }[fontScale];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl max-w-2xl mx-auto shadow-inner">
      {parsedWords.map((wordItem, wordIdx) => {
        return (
          <div
            key={wordIdx}
            className="flex items-center bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800/80 shadow-sm"
          >
            {wordItem.syllables.map((syl, sylIdx) => {
              const currentGlobalIdx = globalSyllableCounter++;
              const isActive = isPlaying && activeSyllableIndex === currentGlobalIdx;

              return (
                <React.Fragment key={sylIdx}>
                  <span
                    className={`rounded-md transition-all duration-150 ${fontClass} ${
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
