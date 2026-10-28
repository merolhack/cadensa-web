import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomPhraseTrainer, PRESET_CHALLENGE_TEMPLATES } from './CustomPhraseTrainer';

describe('CustomPhraseTrainer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <CustomPhraseTrainer isOpen={false} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza título, plantillas y formulario cuando isOpen es true', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Mis Frases de Desafío')).toBeInTheDocument();
    expect(screen.getByText(/Pedir café/i)).toBeInTheDocument();
  });

  it('permite aplicar una plantilla rápida y silabear en tiempo real', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const tmplButton = screen.getByText(/Pedir café/i);
    fireEvent.click(tmplButton);

    const textarea = screen.getByLabelText(/Escribe tu propia frase/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(PRESET_CHALLENGE_TEMPLATES[0].phrase);

    // Debe mostrar la sección de silabación fonoaudiológica
    expect(screen.getByText(/Silabación Fonoaudiológica/i)).toBeInTheDocument();
  });

  it('guarda una frase en localStorage y la muestra en el repertorio', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const textarea = screen.getByLabelText(/Escribe tu propia frase/i);
    fireEvent.change(textarea, { target: { value: 'Refrigerador de la cocina' } });

    const saveButton = screen.getByRole('button', { name: /Guardar Frase/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/"Refrigerador de la cocina"/i)).toBeInTheDocument();
    expect(localStorage.getItem('cadensa_custom_phrases')).toContain('Refrigerador de la cocina');
  });

  it('permite seleccionar una frase guardada para entrenarla inmediatamente', () => {
    const onSelectPhraseMock = vi.fn();
    const onCloseMock = vi.fn();

    // Precargar en localStorage
    localStorage.setItem(
      'cadensa_custom_phrases',
      JSON.stringify([
        {
          id: 'test-1',
          phrase: 'Quiero un vaso de agua',
          bpm: 65,
          createdAt: new Date().toISOString(),
          syllables: ['Quie', 'ro', 'un', 'va', 'so'],
        },
      ])
    );

    render(
      <CustomPhraseTrainer
        isOpen={true}
        onClose={onCloseMock}
        onSelectPhrase={onSelectPhraseMock}
      />
    );

    const trainButton = screen.getByTitle('Entrenar esta frase');
    fireEvent.click(trainButton);

    expect(onSelectPhraseMock).toHaveBeenCalledWith('Quiero un vaso de agua', 65);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('permite eliminar una frase del repertorio personal', () => {
    localStorage.setItem(
      'cadensa_custom_phrases',
      JSON.stringify([
        {
          id: 'to-delete',
          phrase: 'Frase que ya no necesito',
          bpm: 70,
          createdAt: new Date().toISOString(),
          syllables: ['Fra', 'se'],
        },
      ])
    );

    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    expect(screen.getByText(/"Frase que ya no necesito"/i)).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('Eliminar de mi lista');
    fireEvent.click(deleteBtn);

    expect(screen.queryByText(/"Frase que ya no necesito"/i)).not.toBeInTheDocument();
  });
});
