import { render, screen, waitFor } from '@testing-library/react';
import { UserDashboard } from '@/components/UserDashboard';
import { testUsers } from '@/tests/fixtures/testData';

// Mock fetch
global.fetch = jest.fn();

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: testUsers.userWithFace.supabaseId },
    loading: false
  })
}));

jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    appUser: testUsers.userWithFace
  })
}));

describe('UserDashboard Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders dashboard for user with face registration', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          hasAccount: true,
          hasFaceRegistration: true,
          canAccessAttendance: true,
          user: testUsers.userWithFace,
          faceRegistration: {
            id: 'test-face-id',
            registeredAt: '2024-01-02T00:00:00Z',
            hasValidDescriptor: true
          },
          attendanceStats: {
            totalRecords: 5,
            lastAttendance: '2024-01-03T08:45:00Z'
          }
        }
      })
    });

    render(<UserDashboard appUser={testUsers.userWithFace} />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Presensi')).toBeInTheDocument();
      expect(screen.getByText('Wajah Terdaftar')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Total presensi
    });
  });

  test('shows registration required message for user without face', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          hasAccount: true,
          hasFaceRegistration: false,
          canAccessAttendance: false,
          user: testUsers.user
        }
      })
    });

    render(<UserDashboard appUser={testUsers.user} />);

    await waitFor(() => {
      expect(screen.getByText('Registrasi Wajah Diperlukan')).toBeInTheDocument();
      expect(screen.getByText(/Hubungi administrator/)).toBeInTheDocument();
    });
  });

  test('displays personal statistics correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          hasAccount: true,
          hasFaceRegistration: true,
          canAccessAttendance: true,
          user: testUsers.userWithFace,
          attendanceStats: {
            totalRecords: 10,
            lastAttendance: '2024-01-03T08:45:00Z'
          }
        }
      })
    });

    render(<UserDashboard appUser={testUsers.userWithFace} />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total presensi
      expect(screen.getByText('Total Presensi')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<UserDashboard appUser={testUsers.user} />);

    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat status/)).toBeInTheDocument();
    });
  });

  test('shows correct action buttons for registered user', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          hasAccount: true,
          hasFaceRegistration: true,
          canAccessAttendance: true,
          user: testUsers.userWithFace
        }
      })
    });

    render(<UserDashboard appUser={testUsers.userWithFace} />);

    await waitFor(() => {
      expect(screen.getByText('Presensi')).toBeInTheDocument();
      expect(screen.getByText('Riwayat Presensi')).toBeInTheDocument();
    });
  });
});