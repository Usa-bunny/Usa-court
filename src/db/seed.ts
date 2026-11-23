import "dotenv/config"; // <-- WAJIB: Agar .env terbaca oleh script tsx
import { db } from "./index";
import { users, jenisLapangan, lapangan, tarif } from "./schema";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(localFilename: string) {
  const filePath = path.join(process.cwd(), "public", localFilename);

  if (!fs.existsSync(filePath)) {
    console.warn(
      `⚠️ File ${localFilename} tidak ada di folder public/. Menggunakan dummy URL.`,
    );
    return "https://res.cloudinary.com/demo/image/upload/sample.jpg";
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "usa_court/lapangan",
    });
    console.log(`📸 Berhasil upload ${localFilename}`);
    return result.secure_url;
  } catch (err) {
    console.error(`❌ Gagal upload ${localFilename}:`, err);
    return "https://res.cloudinary.com/demo/image/upload/sample.jpg";
  }
}

async function seed() {
  console.log("⏳ Memulai proses seeding...");

  const passwordHash = await bcrypt.hash("password123", 10);

  await db.delete(tarif);
  await db.delete(lapangan);
  await db.delete(jenisLapangan);
  await db.delete(users);

  await db.insert(users).values([
    {
      nama: "Admin Utama",
      username: "admin",
      password: passwordHash,
      role: "admin",
      no_hp: "0811111111",
    },
    {
      nama: "Petugas Lapangan",
      username: "petugas",
      password: passwordHash,
      role: "petugas",
      no_hp: "0822222222",
    },
    {
      nama: "Penyewa Satu",
      username: "penyewa_01",
      password: passwordHash,
      role: "penyewa",
      no_hp: "0833333333",
    },
    {
      nama: "Penyewa Dua",
      username: "penyewa_02",
      password: passwordHash,
      role: "penyewa",
      no_hp: "0844444444",
    },
  ]);
  console.log("✅ Users berhasil dibuat");

  await db.insert(jenisLapangan).values([
    { id: 1, nama: "Futsal" },
    { id: 2, nama: "Badminton" },
    { id: 3, nama: "Mini Soccer" },
  ]);
  console.log("✅ Jenis Lapangan berhasil dibuat");

  console.log("⏳ Mengunggah gambar lapangan ke Cloudinary...");
  const urlFutsal = await uploadToCloudinary("futsal.png");
  const urlBadminton = await uploadToCloudinary("badminton.png");
  const urlSoccer = await uploadToCloudinary("soccer.png");

  await db.insert(lapangan).values([
    {
      id: 1,
      nama: "Futsal A",
      jenis_id: 1,
      gambar: urlFutsal,
      jam_buka: "08:00:00",
      jam_tutup: "22:00:00",
      jam_mulai_lampu: "17:00:00",
      status: "aktif",
    },
    {
      id: 2,
      nama: "Badminton A",
      jenis_id: 2,
      gambar: urlBadminton,
      jam_buka: "08:00:00",
      jam_tutup: "22:00:00",
      jam_mulai_lampu: "17:00:00",
      status: "aktif",
    },
    {
      id: 3,
      nama: "Mini Soccer A",
      jenis_id: 3,
      gambar: urlSoccer,
      jam_buka: "08:00:00",
      jam_tutup: "22:00:00",
      jam_mulai_lampu: "17:00:00",
      status: "aktif",
    },
  ]);
  console.log("✅ Lapangan berhasil dibuat");

  await db.insert(tarif).values([
    {
      lapangan_id: 1,
      tipe_hari: "weekday",
      pakai_lampu: 0,
      harga_per_jam: "100000",
    },
    {
      lapangan_id: 1,
      tipe_hari: "weekday",
      pakai_lampu: 1,
      harga_per_jam: "150000",
    },
    {
      lapangan_id: 1,
      tipe_hari: "weekend",
      pakai_lampu: 0,
      harga_per_jam: "120000",
    },
    {
      lapangan_id: 1,
      tipe_hari: "weekend",
      pakai_lampu: 1,
      harga_per_jam: "170000",
    },

    {
      lapangan_id: 2,
      tipe_hari: "weekday",
      pakai_lampu: 0,
      harga_per_jam: "50000",
    },
    {
      lapangan_id: 2,
      tipe_hari: "weekday",
      pakai_lampu: 1,
      harga_per_jam: "80000",
    },
    {
      lapangan_id: 2,
      tipe_hari: "weekend",
      pakai_lampu: 0,
      harga_per_jam: "60000",
    },
    {
      lapangan_id: 2,
      tipe_hari: "weekend",
      pakai_lampu: 1,
      harga_per_jam: "90000",
    },

    {
      lapangan_id: 3,
      tipe_hari: "weekday",
      pakai_lampu: 0,
      harga_per_jam: "200000",
    },
    {
      lapangan_id: 3,
      tipe_hari: "weekday",
      pakai_lampu: 1,
      harga_per_jam: "250000",
    },
    {
      lapangan_id: 3,
      tipe_hari: "weekend",
      pakai_lampu: 0,
      harga_per_jam: "220000",
    },
    {
      lapangan_id: 3,
      tipe_hari: "weekend",
      pakai_lampu: 1,
      harga_per_jam: "280000",
    },
  ]);
  console.log("✅ Tarif berhasil dibuat");

  console.log("🎉 Seeding selesai!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
