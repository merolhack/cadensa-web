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
}));

vi.mock('@/components/AuthModal', () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal">Auth Modal Mock</div> : null,
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // Navegar a la pestaña de Tráfico
    const metricsTab = screen.getByRole('button', { name: /tráfico & motores de búsqueda/i });
    fireEvent.click(metricsTab);

    expect(screen.getByText(/google search console/i)).toBeInTheDocument();
    expect(screen.getByText(/bing webmaster & indexnow/i)).toBeInTheDocument();
  });

  it('permite actualizar el estado de un reporte de feedback', async () => {
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
  });
});
