import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboardPage from './page';
import * as adminService from '@/lib/adminService';

vi.mock('@/lib/adminService', () => ({
  checkIsAdmin: vi.fn(),
  fetchAdminFeedbackReports: vi.fn(),
  updateFeedbackReportStatus: vi.fn(),
  fetchAdminUsersList: vi.fn(),
  fetchAdminSummary: vi.fn(),
  fetchAdminExercises: vi.fn(),
  createAdminExercise: vi.fn(),
  deleteAdminExercise: vi.fn(),
  fetchAdminClientErrors: vi.fn().mockResolvedValue([]),
  generateFeedbackCSV: vi.fn(() => 'ID,Fecha,Mensaje\n1,2026-10-28,test'),
  generateUsersCSV: vi.fn(() => 'ID,Username,Minutos\n1,lenin,120'),
}));

vi.mock('@/components/AuthModal', () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal">Auth Modal Mock</div> : null,
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-csv');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('muestra pantalla de acceso restringido cuando el usuario no cuenta con rol de administrador', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValueOnce(false);

    render(<AdminDashboardPage />);

    expect(
      await screen.findByText(/acceso restringido — panel administrativo/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /iniciar sesión como administrador/i })
    ).toBeInTheDocument();
  });

  it('abre el modal de autenticación al hacer clic en Iniciar Sesión como Administrador', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValueOnce(false);

    render(<AdminDashboardPage />);

    const authBtn = await screen.findByRole('button', {
      name: /iniciar sesión como administrador/i,
    });
    fireEvent.click(authBtn);

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('renderiza el panel de control completo con tabs y métricas cuando el usuario es administrador', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValue(true);
    vi.mocked(adminService.fetchAdminSummary).mockResolvedValueOnce({
      totalUsers: 14,
      totalTrainingMinutes: 280,
      totalFeedbackReports: 3,
      pendingFeedbackReports: 1,
      resolvedFeedbackReports: 2,
    });
    vi.mocked(adminService.fetchAdminFeedbackReports).mockResolvedValueOnce([
      {
        id: 'rep-1',
        user_id: null,
        category: 'video_issue',
        technique_id: 'sts',
        message: 'El video no reproduce audio en Safari.',
        contact_email: 'paciente@test.com',
        metadata: {},
        status: 'pending',
        created_at: '2026-10-28T12:00:00Z',
      },
    ]);
    vi.mocked(adminService.fetchAdminUsersList).mockResolvedValueOnce([
      {
        id: 'usr-1',
        username: 'merolhack',
        full_name: 'Lenin Meza',
        current_streak: 7,
        longest_streak: 12,
        total_minutes: 150,
        xp_points: 520,
        last_activity_date: '2026-10-28',
      },
    ]);
    vi.mocked(adminService.fetchAdminExercises).mockResolvedValueOnce([
      {
        id: 'ex-1',
        phrase: 'Oración de prueba CMS',
        category: 'fonetica_basica',
        difficulty: 'facil',
        bpm_recommended: 75,
        created_at: '2026-10-28T12:00:00Z',
      },
    ]);

    render(<AdminDashboardPage />);

    expect(
      await screen.findByText(/panel de control y gobierno clínico/i)
    ).toBeInTheDocument();
    expect(screen.getByText('280 min')).toBeInTheDocument();
    expect(screen.getByText(/el video no reproduce audio en safari/i)).toBeInTheDocument();

    // Navegar a la pestaña de Usuarios
    const usersTab = screen.getByRole('button', { name: /directorio de usuarios/i });
    fireEvent.click(usersTab);

    expect(screen.getByText('Lenin Meza')).toBeInTheDocument();
    expect(screen.getByText('150 min')).toBeInTheDocument();
    expect(screen.getByText(/7 días/i)).toBeInTheDocument();

    // Navegar a la pestaña CMS de Ejercicios
    const cmsTab = screen.getByRole('button', { name: /editor de ejercicios cms/i });
    fireEvent.click(cmsTab);

    expect(screen.getByText(/Publicar Nuevo Ejercicio Clínico/i)).toBeInTheDocument();
    expect(screen.getByText(/Oración de prueba CMS/i)).toBeInTheDocument();

    // Navegar a la pestaña de Tráfico
    const metricsTab = screen.getByRole('button', { name: /tráfico & motores de búsqueda/i });
    fireEvent.click(metricsTab);

    expect(screen.getByText(/google search console/i)).toBeInTheDocument();
    expect(screen.getByText(/bing webmaster & indexnow/i)).toBeInTheDocument();
  });

  it('permite actualizar el estado de un reporte de feedback y exportar CSV', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValue(true);
    vi.mocked(adminService.fetchAdminSummary).mockResolvedValue({
      totalUsers: 1,
      totalTrainingMinutes: 10,
      totalFeedbackReports: 1,
      pendingFeedbackReports: 1,
      resolvedFeedbackReports: 0,
    });
    vi.mocked(adminService.fetchAdminFeedbackReports).mockResolvedValue([
      {
        id: 'rep-99',
        user_id: null,
        category: 'suggestion',
        technique_id: 'easy_onset',
        message: 'Añadir metrónomo de campana.',
        contact_email: null,
        metadata: {},
        status: 'pending',
        created_at: '2026-10-28T12:00:00Z',
      },
    ]);
    vi.mocked(adminService.fetchAdminUsersList).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminExercises).mockResolvedValue([]);
    vi.mocked(adminService.updateFeedbackReportStatus).mockResolvedValueOnce({
      success: true,
    });

    render(<AdminDashboardPage />);

    const resolveBtn = await screen.findByRole('button', { name: /✓ resolver/i });
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(adminService.updateFeedbackReportStatus).toHaveBeenCalledWith(
        'rep-99',
        'resolved'
      );
    });

    const exportCsvBtn = screen.getByRole('button', { name: /exportar csv/i });
    fireEvent.click(exportCsvBtn);
    expect(adminService.generateFeedbackCSV).toHaveBeenCalled();
  });

  it('permite crear un nuevo ejercicio clínico desde el CMS', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValue(true);
    vi.mocked(adminService.fetchAdminSummary).mockResolvedValue({
      totalUsers: 1,
      totalTrainingMinutes: 10,
      totalFeedbackReports: 0,
      pendingFeedbackReports: 0,
      resolvedFeedbackReports: 0,
    });
    vi.mocked(adminService.fetchAdminFeedbackReports).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminUsersList).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminExercises).mockResolvedValue([]);
    vi.mocked(adminService.createAdminExercise).mockResolvedValueOnce({
      success: true,
    });

    render(<AdminDashboardPage />);

    const cmsTab = await screen.findByRole('button', { name: /editor de ejercicios cms/i });
    fireEvent.click(cmsTab);

    const inputPhrase = screen.getByLabelText(/Frase u Oración:/i);
    fireEvent.change(inputPhrase, { target: { value: 'Respiración diafragmática fluida' } });

    const submitBtn = screen.getByRole('button', { name: /Guardar Ejercicio en Base de Datos/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminService.createAdminExercise).toHaveBeenCalledWith({
        phrase: 'Respiración diafragmática fluida',
        category: 'fonetica_basica',
        difficulty: 'facil',
        bpm_recommended: 80,
      });
    });
  });

  it('permite consultar la pestaña de observabilidad y errores JS de clientes', async () => {
    vi.mocked(adminService.checkIsAdmin).mockResolvedValue(true);
    vi.mocked(adminService.fetchAdminSummary).mockResolvedValue({
      totalUsers: 1,
      totalTrainingMinutes: 20,
      totalFeedbackReports: 0,
      pendingFeedbackReports: 0,
      resolvedFeedbackReports: 0,
    });
    vi.mocked(adminService.fetchAdminFeedbackReports).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminUsersList).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminExercises).mockResolvedValue([]);
    vi.mocked(adminService.fetchAdminClientErrors).mockResolvedValue([
      {
        id: 'err-test-1',
        user_id: null,
        event_name: 'button_click_error',
        error_message: 'Falla al procesar metrónomo',
        component: 'AudioMetronome',
        stack_trace: null,
        url: 'http://localhost:3000',
        user_agent: 'Mozilla/5.0',
        created_at: new Date().toISOString(),
      },
    ]);

    render(<AdminDashboardPage />);

    const errorsTab = await screen.findByRole('button', { name: /observabilidad & errores js/i });
    expect(errorsTab).toBeInTheDocument();
    fireEvent.click(errorsTab);

    expect(await screen.findByText('Falla al procesar metrónomo')).toBeInTheDocument();
    expect(screen.getByText('AudioMetronome')).toBeInTheDocument();
  });
});
