import { render, screen, waitFor } from '@testing-library/react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { testUsers } from '@/tests/fixtures/testData';

// Mock fetch
global.fetch = jest.fn();

const mockStatsResponse = {
  success: true,
  data: {
    overview: {
      totalUsers: 25,
      totalAttendanceRecords: 150,
      todayAttendanceCount: 8,
      uniqueUsersInPeriod: 20,
      periodDays: 7
    },
    userDistribution: {
      faceApiEnabled: 20,
      noDescriptors: 5,
      avgEnrollmentImages: 8.5
    },
    performance: {
      periodAttendanceCount: 45,
      attendanceGrowthRate: 12.5
    }
  }
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders admin dashboard with statistics', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatsResponse
    });

    render(<AdminDashboard appUser={testUsers.admin} />);

    await waitFor(() => {
      expect(screen.getByText('Sistem Presensi dengan Face-API.js')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // Total users
      expect(screen.getByText('150')).toBeInTheDocument(); // Total attendance
      expect(screen.getByText('8')).toBeInTheDocument(); // Today attendance
    });
  });

  test('displays quick actions correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatsResponse
    });

    render(<AdminDashboard appUser={testUsers.admin} />);

    await waitFor(() => {
      expect(screen.getByText('Daftar Wajah')).toBeInTheDocument();
      expect(screen.getByText('Absensi')).toBeInTheDocument();
      expect(screen.getByText('Mendaftarkan wajah pengguna ke sistem')).toBeInTheDocument();
    });
  });

  test('shows management features', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatsResponse
    });

    render(<AdminDashboard appUser={testUsers.admin} />);

    await waitFor(() => {
      expect(screen.getByText('Kehadiran')).toBeInTheDocument();
      expect(screen.getByText('Data Pengguna')).toBeInTheDocument();
      expect(screen.getByText('150 total log')).toBeInTheDocument();
      expect(screen.getByText('25 pengguna')).toBeInTheDocument();
    });
  });

  test('handles API error with retry button', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<AdminDashboard appUser={testUsers.admin} />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AdminDashboard appUser={testUsers.admin} />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('displays admin guide section', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatsResponse
    });

    render(<AdminDashboard appUser={testUsers.admin} />);

    await waitFor(() => {
      expect(screen.getByText('Panduan Administrator')).toBeInTheDocument();
      expect(screen.getByText('Registrasi Wajah')).toBeInTheDocument();
      expect(screen.getByText('Kelola Pengguna')).toBeInTheDocument();
      expect(screen.getByText('Pantau Data')).toBeInTheDocument();
    });
  });

  test('refreshes stats automatically', async () => {
    jest.useFakeTimers();
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatsResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockStatsResponse,
          data: {
            ...mockStatsResponse.data,
            overview: {
              ...mockStatsResponse.data.overview,
              todayAttendanceCount: 9
            }
          }
        })
      });

    render(<AdminDashboard appUser={testUsers.admin} />);

    // Fast forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});