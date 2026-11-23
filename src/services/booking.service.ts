import { db } from '@/db';
import { tarif, booking } from '@/db/schema';
import { eq, and, ne, lt, gt, inArray } from 'drizzle-orm';
import { format, parse } from 'date-fns';

// --- LOGIKA 1: HITUNG TOTAL BIAYA ---
export async function hitungTotalBiaya(
  lapangan_id: number,
  tanggal: string, // format: YYYY-MM-DD
  jam_mulai: string, // format: HH:mm:ss
  jam_selesai: string,
  jam_mulai_lampu: string // format: HH:mm:ss
) {
  // 1. Ambil semua tarif lapangan ini
  const tarifLapangan = await db.select().from(tarif).where(eq(tarif.lapangan_id, lapangan_id));
  if (tarifLapangan.length === 0) throw new Error('Tarif lapangan belum disetting');

  // 2. Tentukan Weekday atau Weekend
  const dateObj = new Date(tanggal);
  const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const tipeHari = isWeekend ? 'weekend' : 'weekday';

  // 3. Looping dari jam mulai sampai selesai (per jam)
  const startHour = parseInt(jam_mulai.split(':')[0]);
  const endHour = parseInt(jam_selesai.split(':')[0]);
  const lampuHour = parseInt(jam_mulai_lampu.split(':')[0]);

  let total = 0;

  for (let i = startHour; i < endHour; i++) {
    // Cek apakah jam ini masuk siang atau malam
    const isMalam = i >= lampuHour;
    const pakaiLampu = isMalam ? 1 : 0;

    // Cari tarif yang sesuai
    const tarifSesuai = tarifLapangan.find(
      (t) => t.tipe_hari === tipeHari && t.pakai_lampu === pakaiLampu
    );

    if (tarifSesuai) {
      total += Number(tarifSesuai.harga_per_jam);
    }
  }

  return {
    total,
    durasi_jam: endHour - startHour,
    tipe_hari: tipeHari,
  };
}

// --- LOGIKA 2: CEK BENTROK JADWAL ---
export async function cekBentrokJadwal(
  lapangan_id: number,
  tanggal: string,
  jam_mulai: string,
  jam_selesai: string,
  excludeBookingId?: number // Opsional, jika digunakan untuk edit booking
) {
  // Syarat bentrok: (StartBaru < EndLama) DAN (EndBaru > StartLama)
  const kondisi = and(
    eq(booking.lapangan_id, lapangan_id),
    eq(booking.tanggal, tanggal),
    inArray(booking.status, ['menunggu_pembayaran', 'dibayar']), // Hanya cek yang statusnya masih aktif
    lt(booking.jam_mulai, jam_selesai), // StartBaru < EndLama
    gt(booking.jam_selesai, jam_mulai)  // EndBaru > StartLama
  );

  let query = db.select().from(booking).where(kondisi);
  
  // Jika mode edit, abaikan booking milik sendiri
  if (excludeBookingId) {
    query = db.select().from(booking).where(and(kondisi, ne(booking.id, excludeBookingId)));
  }

  const bentrok = await query;
  return bentrok.length > 0; // true jika bentrok, false jika aman
}