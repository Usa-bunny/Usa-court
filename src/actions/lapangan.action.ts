"use server";

import { db } from "@/db";
import { lapangan } from "@/db/schema";
import { uploadImage } from "@/services/cloudinary.service";
import { revalidatePath } from "next/cache";

export async function createLapanganAction(formData: FormData) {
  const nama = formData.get("nama") as string;
  const jenis_id = Number(formData.get("jenis_id"));
  const file = formData.get("gambar") as File;

  if (!file || file.size === 0) return { error: "Gambar wajib diunggah" };

  try {
    const gambarUrl = await uploadImage(file);

    await db.insert(lapangan).values({
      nama,
      jenis_id,
      gambar: gambarUrl,
      jam_buka: "08:00:00",
      jam_tutup: "22:00:00",
      jam_mulai_lampu: "17:00:00",
      status: "aktif",
    });

    revalidatePath("/dashboard/admin/lapangan");
    return { success: true, url: gambarUrl };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mengunggah gambar atau menyimpan data" };
  }
}
