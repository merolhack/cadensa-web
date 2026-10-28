'use client';

import React, { useState } from 'react';
import { FeedbackModal } from '@/components/FeedbackModal';

interface TechniqueFeedbackButtonProps {
  techniqueId: string;
  techniqueName: string;
}

export const TechniqueFeedbackButton: React.FC<TechniqueFeedbackButtonProps> = ({
  techniqueId,
  techniqueName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-emerald-300 transition-colors cursor-pointer"
        aria-label={`Reportar un error o sugerencia sobre la técnica ${techniqueName}`}
      >
        <span>💬</span>
        <span>Reportar duda o error en esta técnica</span>
      </button>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultCategory="technique_issue"
        defaultTechniqueId={techniqueId}
      />
    </>
  );
};

