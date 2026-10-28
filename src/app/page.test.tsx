import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from './page';

describe('Home Page - Unit Tests', () => {
  it('debe renderizar la página de inicio con la marca Cadensa y el lema principal por defecto', () => {
    render(<Home />);
    expect(screen.getAllByText(/cadensa/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1, name: /encuentra el ritmo de tu voz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comenzar práctica guiada directa/i })).toBeInTheDocument();
  });

  it('debe navegar del catálogo de inicio a la estación de práctica y permitir volver con el botón ← Inicio', () => {
    render(<Home />);

    // Entrar a la práctica desde el botón principal
    const startPracticeBtn = screen.getByRole('button', { name: /comenzar práctica guiada directa/i });
    fireEvent.click(startPracticeBtn);

    // Ahora estamos en la estación de práctica
    expect(screen.getByRole('button', { name: /comenzar práctica rítmica/i })).toBeInTheDocument();

    // Pulsar el botón ← Inicio para volver al catálogo
    const backBtn = screen.getByRole('button', { name: /←\s*inicio/i });
    fireEvent.click(backBtn);

    // Volvemos a ver el catálogo de inicio
    expect(screen.getByRole('heading', { level: 1, name: /encuentra el ritmo de tu voz/i })).toBeInTheDocument();
  });

  it('debe abrir y cerrar el modal de video explicativo desde la barra de práctica', () => {
    render(<Home initialView="practice" />);

    // Botón Video en la barra de navegación de práctica
    const videoBtn = screen.getByTitle(/ver video explicativo/i);
    fireEvent.click(videoBtn);

    // El modal de video debe estar abierto como diálogo
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/video demostrativo de ritmo sts/i)).toBeInTheDocument();

    // Cerrar el modal
    const closeBtn = screen.getByRole('button', { name: /cerrar modal de video/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizar los botones de acción principal en la estación de práctica', () => {
    render(<Home initialView="practice" />);
    const playButton = screen.getByRole('button', { name: /comenzar práctica rítmica/i });
    expect(playButton).toBeInTheDocument();

    const audioButton = screen.getByRole('button', { name: /^🔊 audio/i });
    expect(audioButton).toBeInTheDocument();
  });

  it('debe cambiar de frase y tempo al alternar entre Todas y Diadococinesia en la práctica', () => {
    render(<Home initialView="practice" />);

    // Inicialmente en "Todas", el primer ejercicio es Fonética Básica
    expect(screen.getByText(/estabilización métrica silábica/i)).toBeInTheDocument();

    // Al pulsar "Diadococinesia", cambia visiblemente el objetivo clínico y los fonemas
    const ddkButton = screen.getByRole('button', { name: /^diadococinesia/i });
    fireEvent.click(ddkButton);

    expect(screen.getByText(/coordinación motriz velo-lingual/i)).toBeInTheDocument();
  });

  it('debe actualizar dinámicamente el subtítulo y la tarjeta 01 al cambiar de técnica en práctica', () => {
    render(<Home initialView="practice" />);

    // Inicialmente en STS
    expect(screen.getByText(/01\. Isocronía/i)).toBeInTheDocument();
    expect(screen.getByText(/cada sílaba recibe la misma duración temporal compensando el déficit de los ganglios basales/i)).toBeInTheDocument();

    // Abrir el selector de técnicas clínicas
    const selectorButton = screen.getByTitle(/cambiar técnica clínica/i);
    fireEvent.click(selectorButton);

    // Seleccionar "Inicio Vocal Suave (Easy Onset)"
    const easyOnsetOption = screen.getByText('Inicio Vocal Suave (Easy Onset)');
    fireEvent.click(easyOnsetOption);

    // Verificar que la tarjeta 01 se adapta a la nueva técnica
    expect(screen.getByText(/01\. Ataque Glótico Suave/i)).toBeInTheDocument();
    expect(screen.getByText(/músculo cricoaritenoideo/i)).toBeInTheDocument();
    expect(screen.queryByText(/01\. Isocronía/i)).not.toBeInTheDocument();
  });

  it('debe detener la ejecución de la técnica previa al cambiar de técnica fonoaudiológica', () => {
    render(<Home initialView="practice" />);

    // Iniciar la práctica rítmica de la técnica actual (STS)
    const playButton = screen.getByRole('button', { name: /comenzar práctica rítmica/i });
    fireEvent.click(playButton);

    // Debe estar en reproducción activa con el texto específico de STS
    expect(screen.getByRole('button', { name: /pausar ritmo sts/i })).toBeInTheDocument();

    // Abrir selector y cambiar a otra técnica (ej. Habla Prolongada y Fonación Continua)
    const selectorButton = screen.getByTitle(/cambiar técnica clínica/i);
    fireEvent.click(selectorButton);

    const prolongedOption = screen.getByText('Habla Prolongada y Fonación Continua');
    fireEvent.click(prolongedOption);

    // La técnica previa debe haberse detenido limpiamente y el botón debe adaptarse a Habla Prolongada
    expect(screen.getByRole('button', { name: /iniciar fonación continua/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pausar/i })).not.toBeInTheDocument();
    expect(screen.getByText(/01\. Fonación Continua/i)).toBeInTheDocument();
  });

  it('debe avanzar dinámicamente de vocal en la página completa al reproducir Easy Onset', () => {
    vi.useFakeTimers();

    const { container } = render(<Home initialView="practice" />);

    // Cambiar a Easy Onset
    const selectorButton = screen.getByTitle(/cambiar técnica clínica/i);
    fireEvent.click(selectorButton);
    const easyOnsetOption = screen.getByText('Inicio Vocal Suave (Easy Onset)');
    fireEvent.click(easyOnsetOption);

    // Iniciar rampa de inicio suave
    const startButton = screen.getByRole('button', { name: /iniciar rampa de inicio suave/i });
    fireEvent.click(startButton);

    // Debe mostrar la vocal inicial activa
    const activeElementsInitial = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsInitial.length).toBeGreaterThan(0);
    expect(activeElementsInitial[0]?.textContent).toBe('A');

    // Avanzar 3000ms en el tiempo simulado
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Ahora la sílaba activa en el lector de sílabas debe haber avanzado a 'e'
    const activeElementsStep2 = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsStep2[0]?.textContent).toBe('e');

    // Avanzar otros 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Ahora debe ser 'i'
    const activeElementsStep3 = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsStep3[0]?.textContent).toBe('i');

    vi.useRealTimers();
  });

  it('permite abrir el modal de Mis Frases de Desafío y renderiza el monitor de auto-escucha en práctica', () => {
    render(<Home initialView="practice" />);

    // Verificar que el componente de auto-escucha fonoaudiológica está presente
    expect(screen.getByText(/Auto-Escucha Fonoaudiológica/i)).toBeInTheDocument();

    // Abrir modal de frases desafío
    const openCustomPhrasesBtn = screen.getByRole('button', { name: /\+ mis frases desafío/i });
    fireEvent.click(openCustomPhrasesBtn);

    expect(screen.getByText('Mis Frases de Desafío')).toBeInTheDocument();
  });
});
