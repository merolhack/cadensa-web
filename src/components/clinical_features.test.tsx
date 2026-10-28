import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RealWorldSimulator } from './RealWorldSimulator';
import { QuickDailyRoutine } from './QuickDailyRoutine';

describe('Nuevas Funcionalidades Clínicas (Fase D)', () => {
  describe('RealWorldSimulator Component', () => {
    it('debe renderizar los 4 escenarios de habla cotidiana y permitir seleccionar una frase', () => {
      const handleSelectPracticePhrase = vi.fn();
      render(
        <RealWorldSimulator
          isOpen={true}
          onClose={vi.fn()}
          onSelectPracticePhrase={handleSelectPracticePhrase}
        />
      );

      expect(screen.getByText(/simulador de situaciones reales/i)).toBeInTheDocument();
      expect(screen.getByText(/llamada para cita médica/i)).toBeInTheDocument();
      expect(screen.getByText(/presentación en equipo/i)).toBeInTheDocument();
      expect(screen.getByText(/pedido en restaurante/i)).toBeInTheDocument();
      expect(screen.getByText(/entrevista de trabajo/i)).toBeInTheDocument();

      // Hacer clic en una respuesta
      const firstResponseBtn = screen.getByText(/hola, quisiera pedir una cita con el doctor general/i);
      fireEvent.click(firstResponseBtn);
      expect(handleSelectPracticePhrase).toHaveBeenCalledWith(
        'Hola, quisiera pedir una cita con el doctor general.',
        85,
        expect.objectContaining({ id: 'easy_onset' })
      );
    });
  });

  describe('QuickDailyRoutine Component', () => {
    it('debe renderizar el paso inicial de respiración diafragmática y avanzar entre pasos', () => {
      const handleStartFullPractice = vi.fn();
      render(
        <QuickDailyRoutine
          isOpen={true}
          onClose={vi.fn()}
          onStartFullPractice={handleStartFullPractice}
        />
      );

      expect(screen.getByText(/rutina guiada de 5 minutos/i)).toBeInTheDocument();
      expect(screen.getByText(/paso 1: respiración diafragmática/i)).toBeInTheDocument();

      const nextBtn = screen.getByRole('button', { name: /siguiente paso/i });
      fireEvent.click(nextBtn);
      expect(screen.getByText(/paso 2: inicio vocal suave/i)).toBeInTheDocument();

      fireEvent.click(nextBtn);
      expect(screen.getByText(/paso 3: habla rítmica silábica/i)).toBeInTheDocument();
    });
  });
});
