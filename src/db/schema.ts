import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  date,
  time,
  decimal,
  tinyint,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["penyewa", "petugas", "admin"]).notNull(),
  no_hp: varchar("no_hp", { length: 15 }),
});

export const jenisLapangan = mysqlTable("jenis_lapangan", {
  id: int("id").autoincrement().primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull(),
});

export const lapangan = mysqlTable("lapangan", {
  id: int("id").autoincrement().primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  jenis_id: int("jenis_id")
    .notNull()
    .references(() => jenisLapangan.id),
  gambar: varchar("gambar", { length: 255 }),
  jam_buka: time("jam_buka").notNull(),
  jam_tutup: time("jam_tutup").notNull(),
  jam_mulai_lampu: time("jam_mulai_lampu").notNull(),
  status: mysqlEnum("status", ["aktif", "nonaktif"]).default("aktif").notNull(),
});

export const tarif = mysqlTable("tarif", {
  id: int("id").autoincrement().primaryKey(),
  lapangan_id: int("lapangan_id")
    .notNull()
    .references(() => lapangan.id),
  tipe_hari: mysqlEnum("tipe_hari", ["weekday", "weekend"]).notNull(),
  pakai_lampu: tinyint("pakai_lampu").notNull(), // 0 = siang, 1 = malam
  harga_per_jam: decimal("harga_per_jam", {
    precision: 10,
    scale: 0,
  }).notNull(),
});

export const booking = mysqlTable("booking", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  lapangan_id: int("lapangan_id")
    .notNull()
    .references(() => lapangan.id),
  tanggal: date("tanggal", { mode: "string" }).notNull(),
  jam_mulai: time("jam_mulai").notNull(),
  jam_selesai: time("jam_selesai").notNull(),
  durasi_jam: int("durasi_jam").notNull(),
  total_biaya: decimal("total_biaya", { precision: 10, scale: 0 }).notNull(),
  status: mysqlEnum("status", [
    "menunggu_pembayaran",
    "dibayar",
    "selesai",
    "dibatalkan",
  ])
    .default("menunggu_pembayaran")
    .notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  aksi: varchar("aksi", { length: 100 }).notNull(),
  booking_id: int("booking_id").references(() => booking.id),
  waktu: timestamp("waktu").defaultNow().notNull(),
});
