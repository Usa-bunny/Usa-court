import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBookingAction, getBookingsPaginatedAction, updateBookingStatusAction } from '@/actions/booking.action';

// Hook untuk mengambil data tabel dengan pagination & filter
export function useBookings(params: { page: number; limit: number; search?: string; status?: string; tanggal?: string }) {
  return useQuery({
    queryKey: ['bookings', params], // Cache terpisah untuk setiap halaman/filter
    queryFn: () => getBookingsPaginatedAction(params),
  });
}

// Hook untuk aksi buat booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBookingAction,
    onSuccess: (data) => {
      if (data.success) {
        // Refetch data secara otomatis jika sukses
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      }
    },
  });
}

// Hook untuk aksi update status (Petugas/Admin)
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, userId }: { id: number; status: 'dibayar' | 'dibatalkan' | 'selesai'; userId: number }) =>
      updateBookingStatusAction(id, status, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}