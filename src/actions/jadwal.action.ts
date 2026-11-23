'use server';

import { db } from '@/db';
import { lapangan, jenisLapangan, booking, tarif } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function getDetailLapanganAction(lapangan_id: number) {
  const [data] = await db.select({
    id: lapangan.id,
    nama: lapangan.nama,
    jenis: jenisLapangan.nama,
    gambar: lapangan.gambar,
    jam_buka: lapangan.jam_buka,
    jam_tutup: lapangan.jam_tutup,
    jam_mulai_lampu: lapangan.jam_mulai_lampu,
  })
  .from(lapangan)
  .innerJoin(jenisLapangan, eq(lapangan.jenis_id, jenisLapangan.id))
  .where(eq(lapangan.id, lapangan_id));

  // Ambil tarif untuk ditampilkan di card
  const tarifLapangan = await db.select().from(tarif).where(eq(tarif.lapangan_id, lapangan_id));

  return { ...data, tarif: tarifLapangan };
}

export async function getJadwalTerisiAction(lapangan_id: number, tanggal: string) {
  // Mengambil jam yang sudah dibooking (status menunggu_pembayaran atau dibayar)
  const data = await db.select({
    jam_mulai: booking.jam_mulai,
    jam_selesai: booking.jam_selesai,
  })
  .from(booking)
  .where(
    and(
      eq(booking.lapangan_id, lapangan_id),
      eq(booking.tanggal, tanggal),
      inArray(booking.status, ['menunggu_pembayaran', 'dibayar'])
    )
  );

  return data;
}