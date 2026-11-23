import { useQuery } from '@tanstack/react-query';
import { getDetailLapanganAction, getJadwalTerisiAction } from '@/actions/jadwal.action';

export function useDetailLapangan(lapangan_id: number) {
  return useQuery({
    queryKey: ['lapangan', lapangan_id],
    queryFn: () => getDetailLapanganAction(lapangan_id),
    enabled: !!lapangan_id,
  });
}

export function useJadwalTerisi(lapangan_id: number, tanggal: string) {
  return useQuery({
    queryKey: ['jadwal-terisi', lapangan_id, tanggal],
    queryFn: () => getJadwalTerisiAction(lapangan_id, tanggal),
    enabled: !!lapangan_id && !!tanggal,
  });
}