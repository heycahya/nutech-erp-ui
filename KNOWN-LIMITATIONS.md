# DAFTAR BATASAN PROTOTYPE & KEPUTUSAN TBD (KNOWN LIMITATIONS)

Dokumen ini mendokumentasikan secara transparan seluruh batasan fungsional pada prototype antarmuka pengguna NUTECH ERP, status keputusan bisnis yang masih ditangguhkan (*To Be Decided / TBD*), dan aspek yang memerlukan pengembangan backend lebih lanjut.

---

## 1. Daftar Keputusan Bisnis Ditangguhkan (TBD Decisions)

| Kode TBD | Deskripsi Kebijakan | Status Prototipe Saat Ini | Tindakan yang Dibutuhkan untuk Backend |
| :--- | :--- | :--- | :--- |
| **TBD-06** | Formula MRP Definitif, Dinamika BOM Multi-Level, & Scrap Factor | Disimulasikan secara demonstratif dengan buffer statis 14 hari kerja dan faktor scrap konstan. | Diperlukan konfirmasi resmi dari manajemen engineering untuk struktur BOM multi-level dan persentase scrap per mesin. |
| **TBD-09** | Daftar Harga Komponen Resmi (Price List OEM) | Menggunakan estimasi harga simulasi demonstratif dengan label transparan (*Estimasi Simulasi TBD-09*). | Perlu modul master kontrak harga (Price Agreement) yang menghubungkan customer PO dan part number. |
| **TBD-14** | Kebijakan Termin Pembayaran (Term of Payment) & Plafon Kredit | Menggunakan asumsi termin Net 30 (ADM) dan Net 45 (TMMIN). AR aging dihitung dari tanggal jatuh tempo. | Menetapkan aturan denda keterlambatan resmi, credit limit enforcement, dan integrasi persetujuan direksi untuk perpanjangan kredit. |
| **TBD-Search** | Pencarian Global (*Global Header Search*) | Dinonaktifkan sementara (*disabled*) di bilah atas dengan tooltip status TBD. | Backend search engine (e.g., PostgreSQL Full-Text Search / Meilisearch / Elasticsearch) untuk mencari melintasi tabel SO, SJ, PO, Customer, dan Part. |
| **TBD-PDF** | Template Cetak Dokumen Resmi (PDF) | Tombol cetak dokumen ditandai berstatus TBD / Mock Cetak. | Menyediakan layout cetak formal A4/Continuous Paper untuk Surat Jalan fisik, Purchase Order, dan Faktur Pajak. |
| **TBD-Lane4** | Konfigurasi Lini 4 (Assembly & Packing) | Ditandai berstatus `PENDING (TBD)` dan dilarang dipilih sebagai lini operasional aktif. | Sesuai BRD §2.1, Lini 4 ditangguhkan hingga fase ekspansi fasilitas perakitan otomotif tahap berikutnya. |

---

## 2. Batasan Teknis Prototipe (Technical Limitations)

1. **State Persistence**:
   - Seluruh data operasional (penambahan SO baru, penerbitan SJ, penginputan aktual produksi, pembuatan invoice, dan pencatatan kas) disimpan secara *in-memory* di dalam state browser React.
   - Melakukan *hard reload* halaman akan mereset data kembali ke status baseline `data-seeder.md`.
2. **Ketiadaan Modul General Ledger (GL)**:
   - Sesuai batasan eksplisit sprint, sistem Finance hanya mengelola modul penagihan komersial (*commercial billing*) dan pelacakan saldo piutang (*accounts receivable*).
   - Prototipe **TIDAK** mencakup modul jurnal akuntansi ganda (*double-entry bookkeeping*), neraca saldo (*trial balance*), buku besar (*general ledger*), atau integrasi bank payment gateway riil.
3. **Pencatatan Fisik vs Digital**:
   - Tanda tangan pengemudi dan cap basah penerima pabrik disimulasikan melalui input teks konfirmasi, catatan log audit, dan nomor identitas armada truk.
4. **Alur Kerja Persetujuan Multi-Level (Workflow Approvals)**:
   - Persetujuan PO di atas nominal tertentu atau penyesuaian stok saat ini disimulasikan sebagai otorisasi langsung satu tingkat tanpa rantai persetujuan berjenjang (*multi-tier approval workflow*).
