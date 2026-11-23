'use server';

import { db } from '@/db';
import { booking, lapangan, users, auditLog } from '@/db/schema';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import { hitungTotalBiaya, cekBentrokJadwal } from '@/services/booking.service';
import { revalidatePath } from 'next/cache';

// 1. ACTION BUAT BOOKING BARU (Bisa dipakai Penyewa & Petugas)
export async function createBookingAction(data: {
  user_id: number;
  lapangan_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
}) {
  try {
    // A. Ambil data lapangan untuk dapat jam_mulai_lampu
    const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, data.lapangan_id));
    if (!lap) return { error: 'Lapangan tidak ditemukan' };

    // B. Cek Bentrok
    const isBentrok = await cekBentrokJadwal(data.lapangan_id, data.tanggal, data.jam_mulai, data.jam_selesai);
    if (isBentrok) return { error: 'Jadwal sudah terisi, silakan pilih jam lain.' };

    // C. Hitung Biaya
    const { total, durasi_jam } = await hitungTotalBiaya(
      data.lapangan_id,
      data.tanggal,
      data.jam_mulai,
      data.jam_selesai,
      lap.jam_mulai_lampu
    );

    // D. Simpan ke Database
    const [newBooking] = await db.insert(booking).values({
      user_id: data.user_id,
      lapangan_id: data.lapangan_id,
      tanggal: data.tanggal,
      jam_mulai: data.jam_mulai,
      jam_selesai: data.jam_selesai,
      durasi_jam: durasi_jam,
      total_biaya: total.toString(),
      status: 'menunggu_pembayaran',
    }).$returningId();

    // E. Catat Audit Log
    await db.insert(auditLog).values({
      user_id: data.user_id,
      aksi: 'booking',
      booking_id: newBooking.id,
    });

    revalidatePath('/dashboard/penyewa/booking');
    revalidatePath('/dashboard/petugas/booking');
    
    return { success: true, bookingId: newBooking.id, total };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 2. ACTION GET BOOKING DENGAN PAGINATION (Untuk Petugas/Admin)
export async function getBookingsPaginatedAction(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  tanggal?: string;
}) {
  const offset = (params.page - 1) * params.limit;
  
  let whereClause = undefined;
  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        like(users.username, `%${params.search}%`),
        like(sql`CAST(${booking.id} AS CHAR)`, `%${params.search}%`)
      )
    );
  }
  if (params.status && params.status !== 'semua') {
    conditions.push(eq(booking.status, params.status as any));
  }
  if (params.tanggal) {
    conditions.push(eq(booking.tanggal, params.tanggal));
  }

  if (conditions.length > 0) {
    whereClause = and(...conditions);
  }

  // Query Data
  const data = await db.select({
    id: booking.id,
    penyewa: users.nama,
    lapangan: lapangan.nama,
    tanggal: booking.tanggal,
    jam_mulai: booking.jam_mulai,
    jam_selesai: booking.jam_selesai,
    total_biaya: booking.total_biaya,
    status: booking.status,
  })
  .from(booking)
  .leftJoin(users, eq(booking.user_id, users.id))
  .leftJoin(lapangan, eq(booking.lapangan_id, lapangan.id))
  .where(whereClause)
  .orderBy(desc(booking.created_at))
  .limit(params.limit)
  .offset(offset);

  // Query Total Data (Untuk hitung halaman)
  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(booking)
    .leftJoin(users, eq(booking.user_id, users.id))
    .where(whereClause);

  return {
    data,
    totalPages: Math.ceil(Number(countResult.count) / params.limit),
    totalData: Number(countResult.count),
  };
}

// 3. ACTION UPDATE STATUS (Konfirmasi Bayar, Batal, Selesai)
export async function updateBookingStatusAction(
  booking_id: number,
  newStatus: 'dibayar' | 'dibatalkan' | 'selesai',
  user_id: number // id petugas/admin yang melakukan aksi
) {
  try {
    await db.update(booking).set({ status: newStatus }).where(eq(booking.id, booking_id));
    
    // Audit Log
    let aksiLog = newStatus === 'dibayar' ? 'bayar' : newStatus === 'dibatalkan' ? 'batal' : 'selesai';
    await db.insert(auditLog).values({
      user_id,
      aksi: aksiLog,
      booking_id,
    });

    revalidatePath('/dashboard/petugas/booking');
    revalidatePath('/dashboard/penyewa/booking');
    return { success: true };
  } catch (error: any) {
    return { error: 'Gagal mengubah status booking' };
  }
}