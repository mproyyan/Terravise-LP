# Terravise Platform Architecture & Technical Reference

> Dokumen acuan teknis, arsitektur sistem, algoritma machine learning, model data, dan alur aplikasi Terravise (sebelumnya bernama GeoSome pada repositori `/Users/royyan/Developments/ada/challenge-6/GeoSome`). Dokumen ini disusun sebagai sumber kebenaran (*single source of truth*) untuk copywriting, pengembangan landing page, dan pemahaman domain geoteknik.

---

## 1. Identitas Produk & Visi Rekayasa

### 1.1 Apa itu Terravise?
Terravise adalah sistem komputasi geoteknik lapangan berbasis iPadOS (Apple Silicon M-Series) yang memandu kampanye investigasi tanah *Cone Penetration Testing* (CPT / Sondir) secara adaptif dan berlandaskan data matematis *real-time*.

### 1.2 Masalah Rekayasa yang Diselesaikan
Dalam investigasi geoteknik konvensional, penentuan titik uji sondir mengandalkan kisi kaku seragam (*rigid uniform grid*, misal: membuat lubang uji setiap 25–50 meter). Praktik ini memicu dua kegagalan rekayasa mendasar:
1. **Pemborosan Biaya pada Tanah Seragam:** Pada formasi tanah homogen, kisi seragam menghasilkan *over-drilling* (pengeboran redundan), membakar anggaran dan waktu sewa alat berat (*rig mobilization*) untuk data yang sudah terbukti sama.
2. **Titik Buta pada Tanah Kompleks:** Patahan, lapisan batuan miring (*dipping bedrock*), dan lensa lempung lunak sensitif (*soft sensitive marine clay*) kerap berukuran kurang dari 20 meter dan terlewat di antara celah kisi seragam. Kegagalan ini baru terdeteksi setelah struktur mengalami penurunan diferensial (*differential settlement*).
3. **Kriteria Berhenti yang Sembarangan (*Arbitrary Contract Stopping*):** Pengeboran lapangan umumnya dihentikan saat kuota kontrak atau anggaran habis, bukan saat kepastian profil tanah telah terbukti secara matematis.

### 1.3 Solusi Terravise
Terravise menjalankan pipeline model generatif dalam perangkat (*on-device* Core ML) untuk merekonstruksi volume tanah 3D secara kontinu, merekomendasikan koordinat titik sondir berikutnya dengan perolehan informasi tertinggi, dan memberikan kriteria berhenti statistik yang dapat dipertanggungjawabkan (*defensible Practical STOP criteria*).

### 1.4 Persona Pengguna Utama
1. **Lead Geotechnical Engineers & Konsultan Geoteknik:** Memerlukan tata letak investigasi yang hemat biaya dan dapat dipertanggungjawabkan secara hukum/teknis (*defensible*).
2. **Kontraktor Rig CPT & Operator Lapangan:** Membutuhkan panduan navigasi alat berat di lapangan tanpa menunggu jeda analisis kantor berhari-hari.
3. **Perancang Struktur & Fondasi Tiang:** Memerlukan elevasi kedalaman lapisan tanah keras (*bearing stratum top depth*) yang akurat untuk jadwal pemancangan tiang (*pile toe schedule*).
4. **Project Directors & Pengembang Sipil:** Bertujuan memangkas 30%–50% biaya eksplorasi tanpa mengorbankan keselamatan struktural.

---

## 2. Arsitektur Komputasi Lapangan (`CPT3D-67` Engine)

Seluruh inferensi neural dieksekusi secara lokal di perangkat iPad menggunakan **Apple Neural Engine (Core ML)** tanpa ketergantungan koneksi internet (*100% offline-ready, zero cloud data leakage*).

```
[ Lapisan Masukan CPT (1D Profiles) ]
         │
         ▼
[ CPTGridConfig & Spasial Masukan ] ──> Grid 3D Teratur [nx, ny, nz] (dx, dy, dz = 1.0 m)
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[ SchemaGAN V4.2 Flexible ]               [ QCFS CNN V3 Core ML ]
Rekonstruksi Volume 3D Ic                 Prediksi Volume Kontinu
(Soil Behavior Type Index)                qc (MPa) & fs (kPa)
         │                                         │
         ▼                                         ▼
[ Uncertainty V3 & Sufficiency ]          [ BearingRuleEngine ]
Error Bounds & Coverage (>= 80%)          Filter qc >= 15 MPa, tebal >= 2m
         │                                         │
         ├──────────────────────────┐              ▼
         ▼                          ▼        [ 3D Bearing Surface ]
[ StratigraphicStop ]      [ DQN V4.6-A Policy ]    Kontur Kedalaman Tiang (zb)
Kriteria Berhenti Nyata    Navigasi 29 Fitur
(Practical STOP)           Koordinat Terbaik
```

### 2.1 Model 1: SchemaGAN V4.2 Flexible Core ML
* **Identitas File:** `SchemaGAN_V4_2_Flexible.mlpackage`
* **Fungsi:** Merekonstruksi volume 3D kontinu indeks tipe perilaku tanah (*Robertson Soil Behavior Type Index*, $I_c$) dari data CPT 1D yang tersebar (*sparse*).
* **Parameter Normalisasi:**
  $$\mu = 2.7903323310879604, \quad \sigma = 0.7723778445702414$$
* **Mekanisme Kerja:**
  1. Data titik sondir 1D dipetakan ke sel grid $3D$ $[nx, ny, nz]$.
  2. Lapisan awal dibentuk menggunakan *Depth-aware Inverse Distance Weighting* (IDW).
  3. Jaringan generatif menginferensikan kesinambungan lapisan geoteknik di area tak terobservasi.
  4. Menghasilkan volume fisik $I_c$ dan mask validitas spasial tapak struktur.

### 2.2 Model 2: QCFS CNN V3 Core ML
* **Identitas File:** `QCFS_CNN_V3.mlpackage`
* **Fungsi:** Memprediksi nilai kontinu tahanan ujung konus ($q_c$ dalam MPa) dan gesekan selimut ($f_s$ dalam kPa) di setiap voxel dalam domain proyek.
* **Karakteristik:** Menjaga data pengukuran asli pada sel yang diobservasi dan melakukan sintesis volumetrik neural pada ruang antartitik.

### 2.3 Model 3: DQN V4.6-A Core ML (Autonomous Rig Guidance)
* **Identitas File:** `DQN_V4_6_A.mlpackage`
* **Fungsi:** Agen *Reinforcement Learning* (Deep Q-Network) yang mengevaluasi seluruh kandidat koordinat legal di dalam batas tapak proyek dan memilih titik dengan nilai $Q$ tertinggi (*maximum information gain*).
* **Vektor Masukan (29 Fitur Teknis):**
  * **11 Fitur Konteks Global:**
    1. Rasio kepadatan titik observasi terhadap ruang legal: $\log(1 + N_{\text{sites}}) / \log(1 + N_{\text{possible}})$
    2. Skala dimensi sumbu X: $\log(1 + (nx \cdot dx) / 32)$
    3. Skala dimensi sumbu Y: $\log(1 + (ny \cdot dy) / 32)$
    4. Skala kedalaman sumbu Z: $\log(1 + (nz \cdot dz) / 16)$
    5. Resolusi grid $dx$: $\log(1 + dx / 2)$
    6. Resolusi grid $dy$: $\log(1 + dy / 2)$
    7. Resolusi vertikal $dz$: $\log(1 + dz / 2)$
    8. Rata-rata global nilai $I_c$ ternormalisasi
    9. Deviasi standar global nilai $I_c$ ternormalisasi
    10. Fraksi voxel valid dalam *bounding box*
    11. Fraksi voxel terobservasi terhadap total valid
  * **18 Fitur Kandidat Lokal:**
    1. Jarak terdekat ke CPT yang sudah ada
    2. Jumlah titik CPT yang berada dalam radius 4.0 meter
    3. Gradien lateral $I_c$ lokal
    4. s/d 11. Statistik statistik rata-rata dan varians pada 4 partisi interval kedalaman vertikal
    12. Tipe tanah dangkal (*shallow soil classification zone*)
    13. Tipe tanah dalam (*deep soil classification zone*)
    14. Deviasi lateral $\Delta I_c$ terhadap klaster terdekat
* **Batasan Spasial & Fisik:** Memastikan koordinat rekomendasi berada dalam poligon tapak, tidak menabrak titik yang sudah dibor, dan mematuhi jarak pemisahan fisik rig (*minimum separation distance*).

### 2.4 Model 4: Uncertainty V3 & Sufficiency Engine
* **Fungsi:** Mengukur ketidakpastian residual model (*voxel entropy*) dan batas galat terkalibrasi ($|I_c - I_{c,\text{true}}| \le 0.15$).
* **Predicted Coverage Metric:** Proporsi volume valid tak terobservasi yang memiliki batas kepastian $\le 0.15$. Target operasional eksplorasi ditetapkan pada **$\ge 80.0\%$**.

### 2.5 Kebijakan Penghentian Nyata: Practical Dynamic STOP
* **Identitas Kebijakan:** `practical-dynamic-stop-research-1` (kontrak beku hasil riset geoteknik).
* **3 Kondisi Mutlak untuk Status STOP:**
  1. **Dukungan Spasial Global:** Rasio jarak persentil 95 ($P_{95}$) $\le 1.0$ dan jarak maksimum $\le 1.75$ terhadap batas tapak.
  2. **Stabilitas Stratigrafi Terkini:** Titik CPT mutakhir tidak mengubah batas unit lapisan utama, kontinuitas lapisan, dan tidak menunjukkan perbedaan profil terukur pada $\ge 2$ kedalaman berurutan.
  3. **Cakupan Model Cukup:** Metrik *Uncertainty V3 predicted coverage* mencapai $\ge 0.80$ (80%).
* **Perilaku Sistem:**
  * Saat kondisi STOP tercapai, sistem mematikan rekomendasi titik CPT berikutnya (*suppress DQN dispatch*) dan menampilkan status:
    > *"CPT coverage is sufficient. Current CPT data meets the assessment requirements."*
  * Pengguna tetap diperbolehkan mengunggah data manual, namun sistem menyatakan bahwa penambahan titik sondir lebih lanjut tidak lagi bernilai ekonomis.

---

## 3. Parameter Geoteknik & Standar Uji

### 3.1 Tipe Instrumen CPT yang Didukung
| Tipe Alat | Kolom Wajib Berkas Masukan | Format Satuan |
| :--- | :--- | :--- |
| **Electrical CPT** | `depth_(m)`, `qc_(MPa)`, `fs_(kPa)` | Kedalaman (m), Tahanan Ujung (MPa), Hambatan Pelekat (kPa) |
| **CPTm Bicone (Mekanikal)** | `depth_(cm)`, `Cw_(kg/cm2)`, `Tw_(kg/cm2)` | Kedalaman (cm), Tahanan Konus & Total ($kg/cm^2$) |
| **CPTu (Piezocone)** | `depth_(m)`, `qc_(MPa)`, `fs_(kPa)`, `u2_(kPa)` | Ditambah Tekanan Air Pori Dinamis $u_2$ (kPa) |

### 3.2 Parameter Geometri Alat Standar
* Rasio luas netto konus ($\alpha$ / *net area ratio*): `0.80`
* Diameter konus: `3.57 cm` (Luas proyeksi ujung: $10\text{ cm}^2$)
* Diameter selimut gesek (*sleeve*): `3.57 cm`
* Panjang selimut gesek: `13.3 cm` (Luas selimut: $150\text{ cm}^2$)
* Laju penetrasi standar: `20 mm/detik` (sesuai ASTM D5778)

### 3.3 Klasifikasi Perilaku Tanah (Robertson 9-Zone SBT)
Berdasarkan nilai ambang batas indeks perilaku tanah ($I_c$ cutoffs: $1.31, 2.05, 2.60, 2.95, 3.60$):
1. **Zone 1:** Sensitive fine-grained soil ($I_c \ge 3.60$, dangkal) - *Bahaya konsolidasi tinggi*
2. **Zone 2:** Clay - organic soil ($I_c \ge 3.20$)
3. **Zone 3:** Clays: clay to silty clay ($2.95 \le I_c < 3.20$)
4. **Zone 4:** Silt mixtures: clayey silt & silty clay ($2.60 \le I_c < 2.95$)
5. **Zone 5:** Sand mixtures: silty sand to sandy silt ($2.30 \le I_c < 2.60$)
6. **Zone 6:** Sands: clean sands to silty sands ($1.65 \le I_c < 2.30$)
7. **Zone 7:** Dense sand to gravelly sand ($I_c < 1.65$) - *Target tanah keras*
8. **Zone 8:** Stiff sand to clayey sand
9. **Zone 9:** Stiff fine grained

---

## 4. Mesin Evaluasi Lapisan Keras Fondasi (`BearingRuleEngine`)

### 4.1 Definisi Kriteria Lapisan Pendukung Tiang (*Bearing Layer*)
Lapisan tanah keras yang layak memikul beban tiang fondasi ditentukan secara parametrik:
1. **Tahanan Konus Minimum ($q_c$):** Default $\ge 15.0\text{ MPa}$ (rentang penyesuaian: $5.0 - 30.0\text{ MPa}$).
2. **Indeks SBT Maksimum ($I_c$):** Default $\le 1.80$ (memastikan material berbutir kasar/pasir padat, bukan lempung keras kaku).
3. **Ketebalan Kontinu Minimum:** Default $\ge 2.0\text{ meter}$ (mencegah penumpuan pada lensa tipis mengambang / *false refusal*).
4. **Jejak Lateral Minimum (*Footprint Fraction*):** Minimum $5\%$ dari luas tapak bangunan.

### 4.2 Analisis Komponen Terhubung 3D (6-Neighbor Connected Components)
Voxel yang memenuhi ambang batas $q_c$ dikelompokkan berdasarkan keterhubungan 6-arah dalam ruang 3D. Hanya badan tanah keras yang memiliki ketebalan vertikal $\ge 2\text{ m}$ dan penyebaran lateral cukup yang diakui sebagai lapisan tanah pendukung (*bearing layer component*).

### 4.3 Keluaran Rekayasa (*Deliverables*)
* **Top Depth ($z_b$):** Kedalaman puncak tanah keras di setiap kolom tapak struktur.
* **Bottom Depth & Thickness:** Ketebalan efektif badan tanah keras.
* **Pile Toe Directive:** Rekomendasi elevasi terminasi ujung tiang (contoh: *Toe at -16.0m with 1.2m socket embedment*).
* **Export Format:** Kompatibel dengan CSV, LandXML, dan Bentley gINT.

---

## 5. Alur Pengguna & Arsitektur Layar Aplikasi (iPadOS)

```
[ 1. Project Management ] ──> Buat / Pilih Proyek, Tinjau Riwayat
         │
         ▼
[ 2. Boundary Definition ] ──> Gambar Poligon Batas Tapak di Peta Satelit
         │
         ▼
[ 3. CPT Recommendation ]  ──> Unggah Data Sondir Lapangan (CSV / XLSX)
         │                    Melihat Koordinat Target Rekomendasi (DQN)
         │                    Membaca Rationale: "Why this point?"
         │                    Memantau Metrik Ground Certainty & Status STOP
         ▼
[ 4. Result Analysis ]     ──> Tab 1: Soil Interpolation (Voxel Slicing 3D)
                              Tab 2: Bearing Layer (Kontur Tanah Keras & Komparasi Tiang)
```

### 5.1 Layar 1: Manajemen Proyek (`HomePage`)
* Menampilkan daftar proyek yang tersimpan dengan metadata: nama proyek, tanggal modifikasi, jumlah titik CPT, dan luas area poligon.
* Latar belakang kontur topografi (*topography contours*).
* Tombol aksi: `StartProjectButton` (+ Proyek Baru).

### 5.2 Layar 2: Penentuan Batas Investigasi (`BoundaryCreationView`)
* Menggunakan peta interaktif MapKit (tampilan satelit resolusi tinggi).
* Interaksi penambahan koordinat melalui ketukan peta (*tap-to-add*) atau input numerik langsung (Latitude/Longitude atau proyeksi UTM Easting/Northing).
* Kalkulasi otomatis luas poligon dalam meter persegi ($m^2$) dan hektare ($ha$), titik berat (*centroid*), dan keliling batas tapak.
* Validasi topologi poligon (mencegah garis potong mandiri / *self-intersection*).

### 5.3 Layar 3: Navigasi Rekomendasi Titik Sondir (`CPTRecommendationView`)
* **Peta Lapangan:** Menampilkan poligon batas tapak, titik CPT yang telah diuji (lingkaran abu-abu dengan label ID dan kedalaman), serta pin radar menyala (*emerald crosshair*) pada titik target rekomendasi.
* **Lembar Kerja Bawah (*Bottom Sheet*):**
  * **Kartu Rekomendasi Utama:** Menampilkan nama titik (contoh: *Spot 2* atau *Recommendation Point 2*), koordinat UTM, jarak terdekat ke titik eksisting, dan tingkat keyakinan (*confidence level*).
  * **Bagian "Why this point?":** Menjelaskan alasan pemilihan koordinat dalam 3 kriteria transparan:
    1. *Data Gap Optimization:* Mengisi kekosongan spasial terbesar di bawah beban inti struktur (contoh: 16.2 m dari titik terdekat, 0 titik dalam radius 4 m).
    2. *Stratigraphic Transition:* Mendeteksi batas lapisan kritis (contoh: prediksi pasir bersih berganti menjadi lempung lunak di kedalaman 8.5 m).
    3. *Soil Behavior Anomaly:* Mengidentifikasi divergensi perilaku tanah ($\Delta I_c = 0.18$) terhadap klaster sekitarnya.
  * **Karakterisasi Stratigrafi Lapangan:** Status keterpenuhan formasi (*Sufficient / Insufficient / Undetermined*).
  * **Banner Kepastian Tanah (*Practical STOP*):** Tampil saat *predicted coverage* mencapai $\ge 80\%$, memberikan rekomendasi legal untuk menyelesaikan pengujian sondir.
  * **Daftar Data Sondir (*CPT Data List*):** Lembar peninjau seluruh berkas CPT yang telah diunggah lengkap dengan grafik profil tahanan konus.

### 5.4 Layar 4: Analisis Voxel 3D & Tanah Keras (`ResultAnalysisView`)
Menyediakan dua mode navigasi di pojok kanan atas:
1. **Mode 1: Soil Interpolation (`threeDLayer`):**
   * Visualisasi RealityKit 3D volumetrik penampang tanah.
   * Kartu kontrol irisan (*Slicing Control*): Slider sumbu Easting ($X$) dan Northing ($Z$) untuk membelah tanah secara melintang maupun membujur.
   * Warna horizon tanah mengikuti 9 zona palet Robertson dengan tekstur geologi nyata (pasir, lanau, lempung, kerikil).
   * Menampilkan batang sondir virtual (*sounding rods*) yang menembus tanah.
2. **Mode 2: Bearing Layer (`bearingLayer`):**
   * Menampilkan kontur permukaan 3D lapisan tanah pendukung fondasi (*bearing stratum*).
   * Slider kriteria parametrik: $q_c$ (MPa), $I_c$, dan ketebalan minimum (m).
   * Peta kontur elevasi lapisan keras dengan gradien warna kedalaman (*depth legend*).
   * Popover titik bor: Menampilkan kedalaman puncak tanah keras ($z_b$), jarak terdekat, dan rekomendasi tiang pancang.
   * Lembar komparasi data tiang (*Compare Data Sheet*): Tabel rekapitulasi elevasi ujung tiang di semua kolom untuk serah terima ke tim perancang struktur.

---

## 6. Glosarium Istilah Geoteknik & Kode Sistem

| Istilah / Kode | Definisi Teknis | Terjemahan Bahasa Indonesia |
| :--- | :--- | :--- |
| **CPT / Sondir** | *Cone Penetration Testing*: Uji penetrasi konus kuasi-statis ke dalam tanah. | Uji Penetrasi Konus / Uji Sondir |
| **$q_c$ (Cone Resistance)** | Tahanan ujung konus terhadap penetrasi tanah, diukur dalam MPa atau $kg/cm^2$. | Tahanan Ujung Konus |
| **$f_s$ (Sleeve Friction)** | Gesekan tanah terhadap selimut konus di atas ujung penusuk, diukur dalam kPa. | Hambatan Pelekat / Gesekan Selimut |
| **$u_2$ (Pore Pressure)** | Tekanan air pori dinamis yang timbul saat konus menembus formasi tanah permeabilitas rendah. | Tekanan Air Pori Dinamis |
| **$R_f$ (Friction Ratio)** | Rasio antara hambatan pelekat terhadap tahanan ujung konus ($R_f = f_s / q_c \times 100\%$). | Rasio Gesekan |
| **$I_c$ (SBT Index)** | *Soil Behavior Type Index* menurut Robertson (1990/2010), menunjukkan tipe tanah berdasarkan sifat mekanis penetrasi. | Indeks Tipe Perilaku Tanah |
| **Bearing Stratum** | Formasi tanah padat atau batuan yang memenuhi kriteria tahanan dan ketebalan untuk memikul tiang fondasi. | Lapisan Tanah Keras / Lapisan Pendukung Fondasi |
| **Ground Certainty** | Nilai statistik cakupan volume tanah valid yang memiliki batas galat terkalibrasi $\le 0.15$ ($Coverage \ge 80\%$). | Kepastian Formasi Bawah Permukaan |
| **Practical STOP** | Keputusan penghentian pemboran sondir karena penambahan titik baru tidak lagi menghasilkan data baru yang signifikan. | Kriteria Penghentian Statutori / Penghentian Praktis |
| **Information Gain** | Besarnya penurunan ketidakpastian matematis model pada suatu koordinat target pemboran. | Perolehan Informasi |
| **Differential Settlement** | Penurunan fondasi yang tidak merata antar kolom bangunan, pemicu keretakan struktural utama. | Penurunan Diferensial |
| **UTM (Universal Transverse Mercator)** | Sistem proyeksi koordinat kartesian berbasis meter di permukaan bumi (contoh: UTM Zone 48S). | Sistem Koordinat UTM |

---

## 7. Pedoman Penulisan Copywriting & Pernyataan Nilai (Value Propositions)

Berdasarkan aturan **`unslop`** dan integritas domain geoteknik:

### 7.1 Pernyataan Kunci (Boleh Digunakan)
* *"A defensible foundation starts below the blind grid."* (Fondasi yang dapat dipertanggungjawabkan dimulai di bawah kisi buta).
* *"From blind uniform drilling to mathematical certainty."* (Dari pengeboran seragam tanpa arah menuju kepastian matematis).
* *"35% to 45% rig mobilization hours saved without missing critical weak lenses."* (Hemat 35% hingga 45% jam operasional rig tanpa melewatkan lensa lempung lunak).
* *"On-device Apple silicon neural computation. Zero telemetry off device."* (Komputasi neural lokal Apple Silicon. Nol transmisi data keluar perangkat).
* *"ASTM D5778 and SNI 8460:2017 compliant methodology."* (Metodologi selaras dengan standar ASTM D5778 dan SNI 8460:2017).

### 7.2 Kata & Pola yang Dilarang (AI Slop Anti-Patterns)
* **Dilarang menggunakan tanda pisah panjang (*em dash* `—` atau *en dash* `–`)**: Gunakan tanda titik atau koma.
* **Dilarang memakai kata klise AI**: *additionally, crucial, delve, enhance, foster, landscape, pivotal, showcase, testament, underscore, vibrant, copilot*.
* **Dilarang menggunakan metafora abstrak tanpa mekanisme**: Jangan sebut *"harnessing the power of AI"*, sebutlah *"DQN agent ranks candidate coordinates by maximum information gain"*.
* **Dilarang menggunakan klaim tanpa angka**: Selalu sertakan fakta konkret: $q_c \ge 15\text{ MPa}$, tebal $\ge 2.0\text{ m}$, kecepatan $20\text{ mm/s}$, cakupan $\ge 80\%$.
* **Dilarang menggunakan emoji dekoratif** di seluruh materi resmi engineering.
