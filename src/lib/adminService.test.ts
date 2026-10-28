import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkIsAdmin,
  fetchAdminFeedbackReports,
  updateFeedbackReportStatus,
  fetchAdminUsersList,
  fetchAdminSummary,
} from './adminService';
import { supabase } from '@/lib/supabaseClient';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkIsAdmin', () => {
    it('retorna false si no hay sesión activa', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      const result = await checkIsAdmin();
      expect(result).toBe(false);
    });

    it('retorna true cuando la función RPC confirma privilegios de administrador', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            user: { id: 'admin-usr-1' },
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: true,
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.rpc>>);

      const result = await checkIsAdmin();
      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('current_user_is_admin');
    });

    it('retorna false cuando la función RPC responde false', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            user: { id: 'patient-usr-2' },
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: false,
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.rpc>>);

      const result = await checkIsAdmin();
      expect(result).toBe(false);
    });
  });

  describe('fetchAdminFeedbackReports', () => {
    it('consulta y mapea los reportes de calidad clínica', async () => {
      const mockReports = [
        {
          id: 'rep-1',
          user_id: null,
          category: 'video_issue',
          technique_id: 'sts',
          message: 'Video con desfase de audio en Firefox.',
          contact_email: 'paciente@test.com',
          metadata: { os: 'Linux' },
          status: 'pending',
          created_at: '2026-10-28T12:00:00Z',
        },
      ];

      const mockOrder = vi.fn().mockResolvedValueOnce({ data: mockReports, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockReturnValueOnce({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>);

      const reports = await fetchAdminFeedbackReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].id).toBe('rep-1');
      expect(reports[0].status).toBe('pending');
    });
  });

  describe('updateFeedbackReportStatus', () => {
    it('actualiza el estado de un reporte en Supabase', async () => {
      const mockEq = vi.fn().mockResolvedValueOnce({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValueOnce({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);

      const res = await updateFeedbackReportStatus('rep-1', 'resolved');
      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'resolved' });
      expect(mockEq).toHaveBeenCalledWith('id', 'rep-1');
    });
  });

  describe('fetchAdminUsersList y fetchAdminSummary', () => {
    it('combina perfiles y rachas para el directorio de usuarios y calcula el resumen', async () => {
      const mockProfiles = [
        { id: 'u1', username: 'lenin', full_name: 'Lenin Meza' },
        { id: 'u2', username: 'ana', full_name: 'Ana Paciente' },
      ];
      const mockStreaks = [
        {
          user_id: 'u1',
          current_streak: 5,
          longest_streak: 10,
          total_minutes: 120,
          xp_points: 450,
          last_activity_date: '2026-10-28',
        },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockResolvedValueOnce({ data: mockProfiles, error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'user_streaks') {
          return {
            select: vi.fn().mockResolvedValueOnce({ data: mockStreaks, error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      });

      const users = await fetchAdminUsersList();
      expect(users).toHaveLength(2);
      expect(users[0].username).toBe('lenin');
      expect(users[0].total_minutes).toBe(120);
      expect(users[1].total_minutes).toBe(0);

      const summary = await fetchAdminSummary();
      expect(summary.totalUsers).toBe(2);
      expect(summary.totalTrainingMinutes).toBe(120);
    });
  });
});
