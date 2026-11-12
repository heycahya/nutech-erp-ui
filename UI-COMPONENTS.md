# KATALOG KOMPONEN UI NUTECH ERP

Dokumen ini mendokumentasikan sistem desain dan katalog komponen antarmuka pengguna pada prototype NUTECH ERP.

---

## 1. Aturan Desain Inti (Core Design Rules)

1. **Enterprise Compactness**: Kepadatan data terinspirasi dari standar perangkat lunak manufaktur industri (SAP S/4HANA & Microsoft Dynamics 365).
2. **Zero-Pill Discipline**: Dilarang menggunakan tombol atau badge bertipe kapsul (`rounded-full`). Semua badge dan tombol menggunakan `rounded-[4px]` atau `rounded-[2px]`.
3. **Maksimal Radius 4px**: Radius sudut elemen visual dibatasi maksimal `rounded-[4px]`, mempertahankan estetika teknis dan presisi manufaktur.
4. **Warna & Hierarki**:
   - Primary: `#0057d2` (Sapphire Blue)
   - Primary Hover: `#0049b0`
   - Primary Active: `#00368a`
   - Dark Slate Text: `#223548`
   - Secondary Text: `#545454`
   - Muted / Caption Text: `#475e75`
   - Border Standard: `#d5dce2`
   - Background Canvas: `#f5f6f7`
   - White Card / Surface: `#ffffff`
5. **Tipografi Monospace Teknis**:
   - Setiap nomor dokumen (`SO-2026-0041`, `SJ-2026-0089`, `PO-2026-10-091`, `INV-2026-11-001`), kode part (`NTC-RUB-0101`), dan angka kuantitas disajikan dengan font teknis monospace (`font-mono`) untuk keterbacaan kolom yang presisi.

---

## 2. Shell & Navigasi Global

### A. `GlobalTopbar.tsx` (Tinggi 52px)
- **Komponen**: Logo identitas Nutech, Title sistem ERP, Search Box terpasang TBD, Tag Mode Simulasi Prototype, dan Komponen **Role Switcher**.
- **Role Switcher**: Dropdown interaktif dengan indikator role aktif saat ini dan deskripsi divisi untuk 7 role.

### B. `PageHeaderRail.tsx` (Tinggi 40px)
- **Komponen**: Breadcrumb dinamis bertingkat 3 level (`Komersial / Sales Orders / Daftar Sales Order`), Judul Halaman Level 1, dan Action Bar konteks halaman (misal: tombol Ekspor Data atau Input SO Baru).

### C. `SidebarNav.tsx` (Lebar 248px expanded / 64px collapsed)
- **Komponen**: Header role identity badge (Departemen, Label, Badge READ-ONLY jika berlaku), Navigasi terkelompok (*nav groups*), badge jumlah data aktif, dan tombol toggle ekspansi/ciut di bagian bawah.
- **Responsivitas**: Transisi CSS mulus `transition-all duration-200`. Saat ciut (collapsed), menampilkan singkatan inisial role dan ikon dengan atribut `title` tooltip.

### D. `FooterStatusBar.tsx` (Tinggi 28px)
- **Komponen**: Status bar sistem manufaktur di bagian paling bawah layar. Menampilkan nama perusahaan, mode verifikasi frontend, *Single Source of Truth* BRD v3.0, simulasi user aktif, dan resolusi baseline 1440 × 900.

### E. `DevelopmentShowcaseBar.tsx` (Floating Toolbar)
- **Fitur Khusus**: Panel evaluasi internal untuk penguji dan pengembang. Memiliki toggle untuk ciut, sembunyi minim (*Panel QA*), dan **tutup sepenuhnya** (*clean mode*) agar screenshot presentasi tidak terhalang.

---

## 3. Lima Pola Inti Antarmuka (Core Patterns)

### Pola 1: `DataTablePattern.tsx` (Enterprise Table)
- Tabel padat multi-kolom dengan sticky header `#f5f6f7`.
- Pengurutan kolom (sorting), pencarian instan (filter text), filter status (dropdown/tabs).
- Kolom kuantitas dengan alignment kanan dan formatting ribuan standar Indonesia (`6.500 PCS`).
- **Summary Row**: Baris rekapitulasi di baris terbawah tabel yang menjumlahkan kuantitas secara live.
- Kontrol pagination teknis (baris per halaman: 10, 25, 50).

### Pola 2: `OverviewPattern.tsx` (Executive KPI & Multi-Track)
- Grid kartu ringkasan metrik 4 kolom dengan label kecil, angka nilai besar tebal, dan konteks komparasi.
- Visualisasi progress multi-track (Tracking 3 jalur: Status Produksi, Status Pengiriman, Status Penagihan).

### Pola 3: `FormInputPattern.tsx` (Dense Multi-Item Form)
- Form input kepadatan tinggi dengan field bergaris tepi `#d5dce2` dan fokus ring `#0057d2`.
- Form builder tabel item dinamis: tambah baris part, hapus baris, pemilihan part number, input kuantitas dalam Pack atau PCS dengan kalkulasi konversi instan.
- Validasi visual inline pada field wajib.

### Pola 4: `SplitPaneDetailPattern.tsx` (Master-Detail Drawer)
- Tampilan berdampingan (*split-view*) atau laci geser (*drawer*): panel daftar sebelah kiri dan rincian lengkap entitas terpilih di sebelah kanan.
- Tab navigasi internal (Rincian Item, Dokumen Terkait, Log Riwayat Audit).

### Pola 5: `ModalDialogPattern.tsx` (Operational Confirmation Dialog)
- Dialog modal terpusat dengan backdrop overlay gelap semi-transparan (`bg-black/40 backdrop-blur-[1px]`).
- Header dialog dengan ikon peringatan bahaya/keamanan.
- Ringkasan perubahan stok fisik sebelum dieksekusi.
- Tombol aksi primer ("Konfirmasi") dan sekunder ("Batal").

---

## 4. Modal Dialog Spesifik Operasional

1. **`CreateSuratJalanModal.tsx`**:
   - Pemilihan Sales Order aktif, lokasi fisik asal muatan (Line-End Conveyor vs Gudang FG).
   - Validasi sisa kuantitas pengiriman (mencegah over-shipping).
   - Penginputan data armada: Plat nomor kendaraan dan nama driver.
2. **`DeliveryConfirmationModal.tsx`**:
   - Validasi ketersediaan stok fisik on-hand barang jadi di lokasi asal.
   - Konfirmasi serah-terima fisik yang secara resmi memicu pemotongan saldo persediaan FG (BR-DEL-02).
3. **`CreateInvoiceModal.tsx`**:
   - Seleksi Surat Jalan terverifikasi (`Delivered` & `Matched`) untuk pelanggan yang sama.
   - Form input nomor PO customer, periode penagihan, tanggal jatuh tempo.
   - Kalkulasi otomatis DPP, tarif PPN manufaktur 11%, dan Total Tagihan.
4. **`PaymentRecordModal.tsx`**:
   - Pencatatan pembayaran kas/bank untuk faktur komersial tertentu.
   - Pilihan cepat nominal 100% lunas atau 50%.
   - Validasi larangan pembayaran melebihi sisa piutang.
   - Real-time preview transisi status faktur menjadi Lunas (`Paid`).
5. **Modal Tambah Customer & Part**:
   - Form pembuatan master customer B2B dan part komponen otomotif baru.
