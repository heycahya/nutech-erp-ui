# Nutech ERP — Design Guideline
> Berdasarkan audit komprehensif terhadap dokumen spesifikasi fondasi [design.md](file:///home/cahya/Development/nutech-erp/docs/design.md) (versi: alpha — SAP Analysis).

---

## 1. Ringkasan & Filosofi Desain

Sistem desain ini mengadopsi bahasa desain enterprise (*SAP Design Language*) yang memperlakukan antarmuka web sebagai **frame aplikasi** (*application frame*), bukan sekadar halaman pemasaran (*marketing surface*).

### Prinsip Utama (Core Principles)
1. **Dominasi Canvas Putih (57%–69%)**: Sebagian besar permukaan kerja adalah `{colors.canvas}` (#ffffff). Halaman tidak dibebani oleh dekorasi atau kartu berbayang.
2. **Struktur Berbasis Dua Abu-Abu dan Satu Biru**: Fondasi visual dibangun secara disiplin menggunakan dua varian abu-abu (`{colors.chrome}` dan `{colors.band}`) serta satu aksen fungsional utama (`{colors.primary}` #0057d2).
3. **Kedalaman Melalui Pita Datar (Broad Flat Bands)**: Kedalaman visual (*elevation*) dicapai melalui bentangan pita horizontal (*bands*) satu warna penuh dari ujung ke ujung (*full-bleed*), bukan menggunakan border tebal atau *drop shadow*.
4. **Sudut Tegas dan Band Kotak (`rounded.none`)**: Semua band horizontal berjalan siku penuh (`rounded.none` / 0px) agar terbaca sebagai *zona/seksi*, bukan *kartu*. Sudut tumpul dibatasi maksimal 8px pada elemen kontrol dan 12px pada media.
5. **Ritme Interval Putih**: Dua band berwarna (misal hero band dan content band) **dilarang bersebelahan langsung** tanpa jeda kanvas putih di antaranya.
6. **Tipografi Berbasis Aksis Bobot (Variable Weight)**: Perbedaan peran teks (misalnya antara tautan navigasi dan item daftar pada ukuran yang sama, 15px) dibedakan secara tegas melalui aksis bobot tipografi (350 vs 400), bukan sekadar mengubah ukuran font.
7. **Scoping Warna Aksi Tunggal**: Warna primer hanya diperuntukkan bagi elemen interaktif (tombol, tautan, tab aktif). Tidak diperkenankan menambah warna aksen kedua untuk kebutuhan umum.

---

## 2. Sistem Warna (Color Tokens)

### 2.1 Brand & Aksen
| Token | Nilai Hex | Peruntukan / Aturan Penggunaan |
|---|---|---|
| `{colors.primary}` | `#0057d2` | **Warna aksi utama (acting colour)**. Digunakan untuk semua tombol isi (*filled button*), teks link inline, dan tab produk yang sedang aktif. Dilarang digunakan untuk dekorasi pasif. |
| `{colors.primary-deep}` | `#0040b0` | Solid hero band pada halaman interior; warna teks pada tombol outline di atas permukaan putih. |
| `{colors.on-primary}` | `#ffffff` | Warna teks di atas latar biru atau di dalam hero band. |
| `{colors.navy}` | `#022879` | Jangkar gradien hero halaman beranda (*home page atmospheric gradient*). |
| `{colors.sky}` | `#6bc0ff` | Panel biru muda khusus di dalam layout layanan (*services layout*). Scoped, bukan aksen umum. |

### 2.2 Permukaan (Surface & Bands)
| Token | Nilai Hex | Peruntukan / Aturan Penggunaan |
|---|---|---|
| `{colors.canvas}` | `#ffffff` | **Working ground utama** (mencakup 57%–69% halaman). Panel konten, kartu, dan badan seksi utama duduk di atas kanvas ini. |
| `{colors.chrome}` | `#f5f6f7` | Latar navigasi global atas (*global nav-bar*) dan seksi netral untuk membedakan zona konten. |
| `{colors.band}` | `#eaecee` | Latar footer; permukaan non-putih tunggal terbesar pada layout beranda. |
| `{colors.band-blue}` | `#ebf8ff` | Strip biru pucat untuk mengangkat seksi keluar dari hamparan putih. |
| `{colors.band-lavender}` | `#f7f4ff` | Strip lavender lembut untuk halaman produk; satu-satunya band dengan lengkungan tepi atas (*curved upper edge*). |

### 2.3 Tipografi & Teks (Text Ladder)
Hierarki teks menggunakan tangga 5 tingkat (*five-tier ladder*) yang mengalami pergeseran rona (*hue shift*) dari hitam murni menuju *slate*:

| Token | Nilai Hex | Rona / Karakter | Peruntukan |
|---|---|---|---|
| `{colors.ink}` | `#000000` | Pure Black | Judul dan heading di semua tingkatan. Menegaskan kontras tajam. |
| `{colors.ink-lead}` | `#3c3c3c` | Warm Grey | Paragraf pembuka / lead (ukuran 28px) setelah judul display. Hanya muncul pada tier ini. |
| `{colors.ink-body}` | `#223548` | Deep Slate | Teks isi (*body copy*). Menggunakan rona slate (kebiruan), bukan abu-abu netral. |
| `{colors.ink-list}` | `#354a5f` | Mid Slate | Item daftar (*list items*), satu tingkat lebih terang daripada body text. |
| `{colors.ink-meta}` | `#475e75` | Light Slate | Keterangan (*captions*), catatan kaki (*footnotes*), dan teks pendukung paling tenang. |
| `{colors.ink-nav}` | `#545454` | Neutral Grey | Tautan navigasi, rekam jejak (*breadcrumb*), dan label tab tidak aktif. Warna abu-abu netral menjaga pemisahan krom dari konten. |

### 2.4 Semantik / Garis Batas
| Token | Nilai Hex | Peruntukan |
|---|---|---|
| `{colors.hairline}` | `#475e75` | Garis batas tipis untuk tombol outline, pembatas baris tabel (*row rules*), dan sekat kisi 2x2. Nilai hex identik dengan `{colors.ink-meta}`. |

---

## 3. Sistem Tipografi (Typography)

### 3.1 Spesifikasi Rupa Huruf
- **Primary Typeface**: `72 Brand Variable` (milik SAP).
- **Secondary / Monospace**: Tidak ada keluarga huruf kedua dan tidak ada monospace dalam spesifikasi.
- **Letter Spacing**: `0` (nol) untuk seluruh skala tipografi.
- **Rasio Line-Height**:
  - Headings: Ketat (*tight*) mendekati **1.1** (misal 57px/62.7px, 32px/35.2px).
  - Body & Content: Terbuka (*open*) di kisaran **1.5** (misal 20px/30px, 18px/27px).
  - Button: Padat (*solid*) di 16px/17.6px (mencegah pergeseran vertikal label pada tombol tinggi 44px).

### 3.2 Tabel Skala Tipografi
| Token | Size | Weight | Line Height | Tracking | Peruntukan Utama |
|---|---|---|---|---|---|
| `{typography.display}` | 57px | 700 | 62.7px | 0 | Display headline halaman beranda (satu-satunya peran berbobot 700) |
| `{typography.hero-title}` | 36px | 500 | 39.6px | 0 | Judul hero pada halaman interior |
| `{typography.section-title}` | 32px | 500 | 35.2px | 0 | Judul seksi utama (*section headings*) |
| `{typography.lead}` | 28px | 400 | 30.8px | 0 | Paragraf pembuka / lead pendamping display headline |
| `{typography.subhead}` | 20px | 500 | 22px | 0 | Judul fitur (*feature titles*), label tab aktif |
| `{typography.body-lg}` | 20px | 400 | 30px | 0 | Teks isi berukuran besar |
| `{typography.body}` | 18px | 400 | 27px | 0 | Teks isi standar (*standard body copy*) |
| `{typography.button}` | 16px | 500 | 17.6px | 0 | Label tombol kontrol |
| `{typography.link}` | 16px | 400 | 24px | 0 | Tautan teks inline (biasanya diikuti chevron) |
| `{typography.nav-link}` | 15px | 400 | 21px | 0 | Navigasi global, breadcrumbs |
| `{typography.list-item}` | 15px | 350 | 21px | 0 | Item daftar tertaut (bobot teringan dalam sistem: 350) |
| `{typography.caption}` | 14px | 400 | 21px | 0 | Keterangan gambar, label tab tidak aktif, catatan kaki |

### 3.3 Panduan Font Substitusi (Open Source Fallback)
Keluarga huruf `72 Brand Variable` bersifat proprietary. Jika implementasi tidak memiliki lisensi resmi, substitusi wajib memenuhi syarat berikut:
1. Wajib mendukung aksis bobot variabel nyata yang menjangkau bobot **di bawah 400** (khususnya **350**), karena bobot 350 pada `{typography.list-item}` bersifat struktural untuk membedakannya dari `{typography.nav-link}` (400) pada ukuran sama 15px.
2. Rekomendasi font terbuka: **Inter Variable** atau **Source Sans 3 Variable**.
3. **Peringatan**: Nilai *line-height* pada tabel di atas wajib diterapkan secara literal (*verbatim*), jangan menggunakan default bawaan font pengganti.

---

## 4. Spacing, Sizing, & Skala Dimensi

### 4.1 Skala Spacing
Sistem berbasis kelipatan **8px**, dengan sub-langkah kecil untuk kontrol internal:

| Token | Nilai | Penggunaan Khas |
|---|---|---|
| `{spacing.xxs}` | `2px` | Penyesuaian micro-spacing |
| `{spacing.xs}` | `3px` | Penyesuaian micro-spacing |
| `{spacing.sm}` | `8px` | Padding kontrol kecil, jarak elemen rapat |
| `{spacing.md}` | `9px` | Padding tombol outline (vertikal 8px, horizontal 9px) |
| `{spacing.lg}` | `10px` | Ruang internal elemen ringkas |
| `{spacing.xl}` | `12px` | Padding tombol primer (vertikal), padding tabel |
| `{spacing.xxl}` | `15px` | Jarak antar elemen list |
| `{spacing.wide}` | `16px` | Padding horizontal dasar (tombol 14-16px, tabel) |
| `{spacing.section}` | `20px` | Padding kontrol melayang (*floating button* vertikal) |
| `{spacing.giant}` | `24px` | Padding internal kartu (tier, form, modal dasar) |
| `{spacing.max}` | `32px` | Jeda vertikal antar seksi rapat, padding modal card |
| `{spacing.huge}` | `40px` | Padding empty-state card, jeda antar blok |
| `{spacing.hero}` | `48px` | Ruang interior hero |
| `{spacing.band}` | `56px` | Jarak vertikal standar pemisah band |
| `{spacing.page}` | `72px` | Ritme vertikal makro halaman |

---

## 5. Bentuk & Sudut Sudut (Border Radius Scale)

| Token | Nilai | Aturan & Penerapan |
|---|---|---|
| `{rounded.none}` | `0px` | **Wajib untuk semua band penuh**, bilah navigasi (*nav-bar*), rel tab (*tab-rail*), dan footer. Mencegah band terbaca sebagai kartu. |
| `{rounded.sm}` | `4px` | Hanya digunakan pada permukaan jangkar inline (*inline-anchor*). |
| `{rounded.md}` | `8px` | **Batas standar kontrol**: semua tombol, baris sidebar nav, toast, kartu form, kartu pricing. |
| `{rounded.lg}` | `12px` | **Batas maksimum media & modal**: wadah gambar (*media-frame*), kartu dialog modal, empty-state frame. |

> **Aturan Bentuk Mutlak**: Tidak ada elemen berbentuk kapsul (*pill*) di seluruh sistem. Tidak ada elemen berbentuk lingkaran kecuali tombol pemutar (*play button*) pada thumbnail video.

---

## 6. Elevasi & Tingkat Kedalaman (Elevation & Depth)

Desain bersifat **datar secara bawaan (flat by default)**. Tidak ada bayangan (*drop shadow*) pada tombol, kartu biasa, maupun seksi pembatas.

| Level | Perlakuan Visual | Peruntukan |
|---|---|---|
| **0** | Canvas murni, tanpa border, tanpa shadow | Panel konten, sebagian besar seksi utama |
| **1** | Pita datar penuh (*flat band*) — `{colors.chrome}`, `{colors.band}`, `{colors.band-blue}`, `{colors.band-lavender}` | Pemisah antar zona konten, footer |
| **2** | Pita warna solid — `{colors.primary-deep}` | Hero pada halaman interior |
| **3** | Gradien atmosferik — jangkar `{colors.navy}` atau strip promo violet-ke-biru | Hero beranda, strip promo event |
| **4** | Soft Drop Shadow (Sangat terbatas) | **Hanya** untuk kartu UI ilustratif yang melayang di dalam gambar produk (untuk menggambarkan antarmuka aplikasi, bukan dekorasi layout). |

---

## 7. Tata Letak, Chrome, & Template Halaman

### 7.1 Two-Storey Chrome
Antarmuka dipayungi oleh chrome dua tingkat:
1. **Lantai 1**: Bilah global (`nav-bar`), tinggi 60px, latar `{colors.chrome}`, teks `{colors.ink-nav}`, sudut siku (`rounded.none`).
2. **Lantai 2**: Rel produk (*product rail*), latar `{colors.canvas}` yang memuat:
   - Rekam jejak (*breadcrumb*): tinggi 17px, teks `{colors.ink-nav}`, tipografi `{typography.nav-link}`.
   - Deretan tab (*tab row*): tab inaktif tinggi 32px; tab aktif tinggi 44px dengan garis bawah biru, teks `{colors.primary}` dan tipe `{typography.subhead}`.

### 7.2 Tiga Pola Hero Berdasarkan Template
1. **Home Page**: Bidang gradien penuh berbasis `{colors.navy}` dengan teks `{colors.on-primary}`, lockup produk di sisi kanan, atau judul display (`hero-display` 57px) di atas kanvas putih.
2. **Services Page**: Hero band padat (`hero-band`) tinggi 450px berwarna `{colors.primary-deep}` dengan judul `{typography.hero-title}` (36px). Konten layanan berupa kisi 2x2 yang dipisahkan oleh garis rambut (`{colors.hairline}`), bukan border kartu.
3. **Product Page**: Tanpa band hero berwarna. Menampilkan tipografi terpusat di atas `{colors.canvas}` putih langsung di atas ilustrasi alur kerja.

---

## 8. Spesifikasi Komponen

### 8.1 Kelompok Chrome & Navigasi
- **`nav-bar`**: Background `{colors.chrome}`, text `{colors.ink-nav}`, type `{typography.nav-link}`, `rounded.none`, height 60px.
- **`nav-link`**: Background `{colors.chrome}`, text `{colors.ink-nav}`, type `{typography.nav-link}`, `rounded.none`.
- **`breadcrumb`**: Background `{colors.canvas}`, text `{colors.ink-nav}`, type `{typography.nav-link}`, `rounded.none`, height 17px.
- **`product-tab`**: Background `{colors.canvas}`, text `{colors.ink-nav}`, type `{typography.caption}`, `rounded.none`, height 32px.
- **`product-tab-active`**: Background `{colors.canvas}`, text `{colors.primary}`, type `{typography.subhead}`, `rounded.none`, height 44px (aksen garis bawah biru, naik ukuran & bobot).

### 8.2 Kelompok Tombol (Buttons)
- **`button-primary`**: Tombol aksi utama. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, `rounded.md` (8px), padding `12px 14px`, height 44px.
- **`button-outline`**: Tombol sekunder di samping tombol utama. Background `{colors.canvas}`, text `{colors.primary-deep}`, border `{colors.hairline}`, type `{typography.button}`, `rounded.md`, padding `8px 9px`.
- **`button-floating`**: Tombol kontak mengambang di pojok kanan bawah. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.caption}`, `rounded.md`, padding `16px 20px`, height 58px.

### 8.3 Kelompok Konten & Teks
- **`section-heading`**: Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.section-title}`, height 35px.
- **`lead-paragraph`**: Background `{colors.canvas}`, text `{colors.ink-lead}`, type `{typography.lead}` (28px).
- **`body-copy`**: Background `{colors.canvas}`, text `{colors.ink-body}`, type `{typography.body}` (18px).
- **`feature-title`**: Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.subhead}`, height 22px.
- **`list-item`**: Background `{colors.canvas}`, text `{colors.ink-list}`, type `{typography.list-item}` (15px / weight 350), height 38px.
- **`meta-note`**: Background `{colors.canvas}`, text `{colors.ink-meta}`, type `{typography.caption}` (14px).
- **`text-link`**: Background `{colors.canvas}`, text `{colors.primary}`, type `{typography.link}`, diakhiri chevron.
- **`inline-anchor`**: Background `{colors.canvas}`, text `{colors.primary}`, type `{typography.caption}`, `rounded.sm` (4px).
- **`media-frame`**: Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.caption}`, `rounded.lg` (12px).

### 8.4 Kelompok Band & Panel
- **`band-neutral`**: Background `{colors.chrome}`, text `{colors.ink-body}`, type `{typography.body}`, `rounded.none`.
- **`band-blue`**: Background `{colors.band-blue}`, text `{colors.ink-body}`, type `{typography.body}`, `rounded.none`.
- **`band-lavender`**: Background `{colors.band-lavender}`, text `{colors.ink-body}`, type `{typography.body}`, `rounded.none` (tepi atas melengkung).
- **`sky-panel`**: Background `{colors.sky}`, text `{colors.ink}`, type `{typography.body}`, `rounded.none`.
- **`footer`**: Background `{colors.band}`, text `{colors.ink-nav}`, type `{typography.nav-link}`, `rounded.none`.

### 8.5 Pola Contoh SaaS (Illustrative Kit-Mirror)
- **`ex-pricing-tier`**: Kartu harga reguler pada kanvas putih, border `{colors.hairline}`, `rounded.md`, padding `{spacing.giant}` (24px).
- **`ex-pricing-tier-featured`**: Kartu harga promosi, invert warna latar `{colors.ink}` dengan teks `{colors.on-primary}`, `rounded.md`, padding `{spacing.giant}`.
- **`ex-product-selector`**: Kartu ringkasan paket enterprise, `rounded.md`, padding `{spacing.giant}`.
- **`ex-cart-drawer`**: Ringkasan langganan dengan pemisah item `{colors.hairline}`, `rounded.md`, padding `{spacing.giant}`.
- **`ex-app-shell-row`**: Baris navigasi sidebar, aktif ditandai garis `{colors.primary}`, `rounded.md`, padding `{spacing.xl} {spacing.wide}`.
- **`ex-data-table-cell`**: Header `{typography.caption}`, isi `{typography.body}`, border baris `{colors.hairline}`, padding sel `{spacing.xl} {spacing.wide}`.
- **`ex-auth-form-card`**: Kartu login pada kanvas putih, `rounded.md`, padding `{spacing.giant}`.
- **`ex-modal-card`**: Dialog modal dengan sudut media `rounded.lg` (12px), padding `{spacing.max}` (32px).
- **`ex-empty-state-card`**: Wadah empty-state `rounded.lg` (12px), padding `{spacing.huge}` (40px).
- **`ex-toast`**: Toast notifikasi `rounded.md` (8px), padding `{spacing.xl} {spacing.wide}`.

---

## 9. Responsivitas & Target Sentuh

### 9.1 Skala Breakpoint
| Tier | Rentang Resolusi | Perilaku Layout |
|---|---|---|
| **Mobile** | `< 768px` | Satu kolom; bilah navigasi menciut ke menu hamburger (logo, search, account tetap); rel tab menjadi horizontal scroller; hero menumpuk vertikal; target sentuh membesar. |
| **Tablet** | `768px – 1023px` | Dua kolom fitur tetap bertahan; breadcrumb dipotong (*truncated*); gambar hero berpindah ke bawah teks. |
| **Laptop** | `1024px – 1279px` | Grid penuh; seluruh tab pada rel tampil; hero kembali berdampingan (*side-by-side*). |
| **Desktop** | `1280px – 1439px` | Kolom konten di tengah dengan lebar penuh yang ditentukan. |
| **Wide** | `≥ 1440px` | Gutter samping menyerap kelebihan lebar layar; band tetap membentang penuh (*full-bleed*). |

### 9.2 Ukuran Target Sentuh (Touch Targets)
- `{component.button-floating}`: 58px (melampaui standar WCAG AAA 44x44px).
- `{component.button-primary}`: 44px (memenuhi batas minimum WCAG AAA).
- `{component.product-tab-active}`: 44px.
- `{component.product-tab}` (inaktif): 32px — **Catatan penting**: Pada layar sentuh (*mobile/tablet*), tab inaktif wajib dinaikkan paddingnya hingga minimal 44px.
- `{component.breadcrumb}`: 17px (merupakan penanda navigasi visual, bukan kontrol aksi utama).

---

## 10. Panduan Do dan Don't (Aturan Baku)

### Wajib Dilakukan (DO)
1. **Pertahankan `{colors.primary}` untuk elemen interaktif saja**: Gunakan hanya untuk tombol aksi, link aktif, dan tab terpilih. Biarkan semua elemen lain netral.
2. **Pemisahan Seksi Menggunakan Band Penuh**: Pisahkan seksi halaman menggunakan pita horizontal satu warna penuh (*full-width band*), bukan menggunakan border atau shadow.
3. **Seluruh Band Berbentuk Siku**: Pertahankan `{rounded.none}` pada seluruh bentangan band agar terbaca sebagai zona arsitektur halaman.
4. **Manfaatkan Variasi Bobot pada Teks Kecil**: Bedakan peran pada ukuran 15px menggunakan bobot: `{typography.list-item}` bobot 350 vs `{typography.nav-link}` bobot 400.
5. **Gunakan Hitam Murni untuk Judul dan Slate untuk Body**: Tetapkan judul pada `{colors.ink}` (#000000) dan teks isi pada `{colors.ink-body}` (#223548). Pergeseran rona (*hue shift*) menegaskan hierarki.
6. **Krom Navigasi Menggunakan Abu-Abu Netral**: Pastikan chrome menggunakan `{colors.ink-nav}` (#545454) agar terpisah secara visual dari teks konten.
7. **Batasi Sudut**: Maksimal 8px (`rounded.md`) untuk kontrol/tombol dan 12px (`rounded.lg`) untuk media/gambar/modal.
8. **Shadow Hanya di Dalam Gambar Ilustrasi**: Biarkan bayangan hanya muncul pada mockup/kartu UI yang mengapung di dalam gambar produk untuk menjelaskan alur kerja aplikasi.

### Dilarang Keras (DON'T)
1. **Jangan memberi elevasi/shadow pada tombol atau kartu UI**: Sistem ini mengandalkan bidang datar (*flat*); kedalaman hanya dibangun lewat band dan gradien.
2. **Jangan membulatkan sudut band yang membentang penuh**: Band yang dibulatkan akan tampak seperti kartu raksasa dan merusak ritme horizontal halaman.
3. **Jangan menambahkan warna aksen kedua**: `{colors.sky}` dan `{colors.navy}` adalah warna dengan cakupan khusus (*scoped*), bukan aksen umum bebas pakai.
4. **Jangan menggunakan `{colors.ink-nav}` untuk teks isi**: Abu-abu netral tersebut milik chrome navigasi; teks konten wajib menggunakan jenjang slate.
5. **Jangan menyederhanakan variasi bobot hanya menjadi 400 dan 700**: Menghilangkan bobot 350 dan 500 akan menghancurkan 3 peran visual yang berbeda pada rentang ukuran 14–16px.
6. **Jangan menambahkan letter-spacing**: Metrik tipografi sudah dirancang pas untuk skala ukuran yang digunakan.
7. **Jangan memotong gambar produk ke rasio seragam (1:1 atau 16:9)**: Setiap komposisi gambar ilustrasi harus berukuran proporsional sesuai kebutuhan penjelasan fiturnya.
8. **Jangan menempatkan dua band berwarna berdampingan tanpa jeda putih**: Wajib menyisipkan interval kanvas putih (`{colors.canvas}`) di antara band hero dan band konten.

---

## 11. Analisis Gap & Keputusan yang Masih Belum Jelas (Pending Decisions)

Berdasarkan audit mendalam terhadap [design.md](file:///home/cahya/Development/nutech-erp/docs/design.md), ditemukan sejumlah celah spesifikasi yang belum ditetapkan dan memerlukan keputusan desain/engineering sebelum implementasi produksi:

### 1. State Interaktif (Hover, Focus, Pressed, Disabled)
- **Status di Dokumen Asli**: Dokumen secara eksplisit mencatat: `> **No hover states documented.** Every component below documents its default state only.`
- **Kebutuhan Keputusan**:
  - Apa warna hover dan pressed untuk `{component.button-primary}` (#0057d2)? Apakah menggelap ke `#0040b0` (`primary-deep`) atau menggunakan overlay?
  - Bagaimana state hover untuk `{component.button-outline}` dan teks link `{component.text-link}`?
  - Bagaimana visualisasi `focus-visible` (ring fokus) untuk aksesibilitas keyboard (WCAG 2.1 AA)?
  - Bagaimana representasi elemen non-aktif (*disabled state* — warna latar, teks, dan opacity)?

### 2. Spesifikasi Primitif Form Input (Form Controls)
- **Status di Dokumen Asli**: Dokumen hanya menyediakan contoh tingkat tinggi `ex-auth-form-card`, tanpa definisi primitif untuk komponen input.
- **Kebutuhan Keputusan**:
  - Belum ada spesifikasi tinggi, padding, border, border-radius, dan tipografi untuk Text Input, Textarea, Dropdown/Select, Checkbox, Radio, dan Switch.
  - Apakah input menggunakan border `{colors.hairline}` dan sudut `{rounded.md}`?

### 3. Palet Warna Semantik & Status (Feedback Tokens)
- **Status di Dokumen Asli**: Sistem warna hanya memuat token brand, surface, dan text ladder slate.
- **Kebutuhan Keputusan**:
  - Belum ada token warna status standar enterprise: **Success/Green**, **Warning/Amber**, **Danger/Error/Red**, dan **Information/Blue**.
  - Diperlukan definisi token alert banner, badge status pesanan/pembayaran, dan validasi form inline.

### 4. Batas Maksimum Kontainer (Container Max-Width) & Grid Kolom
- **Status di Dokumen Asli**: Disebutkan bahwa kolom konten *"centred and capped"* dan breakpoint desktop `1280–1439px` serta wide `≥ 1440px`.
- **Kebutuhan Keputusan**:
  - Berapa nilai tepat `max-width` untuk kontainer konten tengah? (Apakah 1200px, 1280px, 1320px, atau 1440px?).
  - Berapa jumlah kolom standar (12 kolom?), lebar *gutter*, dan *margin* luar pada grid desktop?

### 5. Durasi & Kurva Animasi (Motion & Transition Tokens)
- **Status di Dokumen Asli**: Tidak ada variabel atau token transisi/animasi yang terdokumentasi.
- **Kebutuhan Keputusan**:
  - Perlu penetapan durasi transisi (misal: 150ms untuk tombol, 250ms untuk menu navigasi/drawer) dan timing function (`ease-in-out` / `cubic-bezier`).

### 6. Kebijakan Dukungan Dark Mode
- **Status di Dokumen Asli**: Dokumen 100% didasarkan pada kanvas putih (*white ground*) dengan kontras slate/black murni.
- **Kebutuhan Keputusan**:
  - Apakah sistem ERP ini murni hanya mendukung Light Mode, ataukah akan ada pemetaan inversi token untuk Dark Mode di masa mendatang?
