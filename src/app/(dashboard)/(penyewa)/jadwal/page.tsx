'use client';

import { useState } from 'react';
import { useDetailLapangan, useJadwalTerisi } from '@/hooks/use-jadwal';
import { useCreateBooking } from '@/hooks/use-booking';
import { PageHeader } from '@/components/shared/page-header';
import { TimeSlotCard } from '@/components/penyewa/time-slot-card'; // Komponen Reusable kita
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function JadwalPenyewaPage() {
  const [lapanganId] = useState(1); // Sementara hardcode Futsal A
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);

  const { data: lapangan, isLoading: loadingLapangan } = useDetailLapangan(lapanganId);
  const { data: jadwalTerisi, isLoading: loadingJadwal } = useJadwalTerisi(lapanganId, tanggal);
  const { mutate: createBooking, isPending } = useCreateBooking();

  if (loadingLapangan || loadingJadwal) return <p className="p-6">Memuat jadwal...</p>;
  if (!lapangan) return <p className="p-6">Lapangan tidak ditemukan.</p>;

  const jamBuka = parseInt(lapangan.jam_buka.split(':')[0]);
  const jamTutup = parseInt(lapangan.jam_tutup.split(':')[0]);
  const listJam = Array.from({ length: jamTutup - jamBuka }, (_, i) => jamBuka + i);

  const isJamTerisi = (jam: number) => {
    return jadwalTerisi?.some((b) => {
      const start = parseInt(b.jam_mulai.split(':')[0]);
      const end = parseInt(b.jam_selesai.split(':')[0]);
      return jam >= start && jam < end;
    });
  };

  const handlePilihJam = (jam: number) => {
    if (isJamTerisi(jam)) return;

    if (selectedStart === null || (selectedStart !== null && selectedEnd !== null)) {
      setSelectedStart(jam);
      setSelectedEnd(null);
    } else if (jam > selectedStart) {
      setSelectedEnd(jam);
    } else {
      setSelectedStart(jam);
      setSelectedEnd(null);
    }
  };

  const handleBooking = () => {
    if (selectedStart === null || selectedEnd === null) return;
    
    createBooking({
      user_id: 3, // Hardcode penyewa_01 untuk testing (nanti bisa diganti dari session)
      lapangan_id: lapanganId,
      tanggal: tanggal,
      jam_mulai: `${selectedStart.toString().padStart(2, '0')}:00:00`,
      jam_selesai: `${selectedEnd.toString().padStart(2, '0')}:00:00`,
    }, {
      onSuccess: (res) => {
        if (res.error) alert(res.error);
        else {
          alert(`Booking Berhasil! Total: Rp ${res.total?.toLocaleString('id-ID')}`);
          setSelectedStart(null);
          setSelectedEnd(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Jadwal Lapangan" 
        description="Pilih lapangan, tanggal, dan jam bermain Anda."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kiri: Info Lapangan */}
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{lapangan.nama}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
               <img src={lapangan.gambar || ''} alt={lapangan.nama} className="object-cover w-full h-full" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{lapangan.jenis} · Aktif</p>
              <p className="text-sm text-muted-foreground">Buka {lapangan.jam_buka.substring(0,5)} - {lapangan.jam_tutup.substring(0,5)}</p>
              <p className="text-sm text-muted-foreground">Lampu mulai {lapangan.jam_mulai_lampu.substring(0,5)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-2">Tarif per jam:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Weekday: Rp {Number(lapangan.tarif.find(t => t.tipe_hari === 'weekday' && t.pakai_lampu === 0)?.harga_per_jam).toLocaleString()} (Siang)</p>
                <p>Weekday: Rp {Number(lapangan.tarif.find(t => t.tipe_hari === 'weekday' && t.pakai_lampu === 1)?.harga_per_jam).toLocaleString()} (Malam)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanan: Jadwal & Form */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Pilih Jadwal</CardTitle>
            <Input 
              type="date" 
              value={tanggal} 
              onChange={(e) => {
                setTanggal(e.target.value);
                setSelectedStart(null);
                setSelectedEnd(null);
              }}
              className="w-auto"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Grid Jam (Menggunakan Komponen Reusable TimeSlotCard) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {listJam.map((jam) => {
                const terisi = isJamTerisi(jam);
                const isSelected = (selectedStart !== null && jam >= selectedStart && (selectedEnd === null ? jam === selectedStart : jam < selectedEnd));
                
                return (
                  <TimeSlotCard
                    key={jam}
                    jam={jam}
                    isTerisi={terisi}
                    isSelected={isSelected}
                    onClick={handlePilihJam}
                  />
                );
              })}
            </div>

            {/* Ringkasan Pilihan */}
            {selectedStart !== null && selectedEnd !== null && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary">
                    Pilihan: {selectedStart.toString().padStart(2, '0')}:00 - {selectedEnd.toString().padStart(2, '0')}:00 
                    <span className="ml-2 font-normal text-muted-foreground">({selectedEnd - selectedStart} Jam)</span>
                  </p>
                </div>
                <Button onClick={handleBooking} disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? "Memproses..." : "Lanjutkan Booking"}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}