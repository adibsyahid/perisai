# PERISAI: skrip video demo dan draf poster (i3EC'26)

> Semak dahulu had masa dan saiz poster dalam syarat rasmi i3EC'26. Skrip ini dirancang untuk ±2 min 30 s.
> Semua angka ketepatan mesti datang daripada penilaian dengan **mesej sebenar** (Mod Penilaian, `/eval`).

## A. Persediaan sebelum rakam (senarai semak)

| | Perkara |
|---|---|
| ☐ | **Telefon A = "Mak"**: PERISAI dipasang, profil "Mak", negeri **Pahang**. |
| ☐ | **Telefon B = "Anak"**: PERISAI dipasang, profil "Adib", sudah **Masukkan Kod** Mak dan simpan nombor Mak. |
| ☐ | Telefon B: **Hidupkan amaran**; tetapan telefon benarkan notifikasi PERISAI/Chrome; mod jimat bateri **off**. |
| ☐ | Kedua-dua telefon: **Jangan Ganggu (DND) off**, kelantangan tinggi (suara keputusan mesti kedengaran). |
| ☐ | Telefon A: mesej scam parcel ada dalam WhatsApp (dihantar dari nombor lain). Mesej sah bank ada dalam SMS. |
| ☐ | Radar: putuskan sama ada guna data demo (`/eval` → Isi data demo). Kalau guna, label "Termasuk data demo" **mesti kelihatan** dalam video. |
| ☐ | Uji keseluruhan babak 2–4 sekurang-kurangnya **3 kali** sebelum rakam sebenar. |
| ☐ | Rakam skrin telefon (screen recorder) + satu kamera luaran untuk syot dua telefon serentak. |

## B. Skrip (babak demi babak)

| # | Masa | Skrin / aksi | Suara latar (BM) |
|---|---|---|---|
| 1 | 0:00–0:15 | Teks besar: **RM2.97 bilion** hilang, **66,204 kes** (PDRM, Jun 2026). Mak tua memegang telefon. | "Tahun lepas, rakyat Malaysia hilang hampir tiga bilion ringgit kepada scam. Mangsa paling ramai? Ibu bapa kita." |
| 2 | 0:15–0:35 | Telefon A: WhatsApp terima "POS LAJU: Bungkusan anda…". Mak ragu-ragu. | "Mak terima mesej Pos Laju. Nampak betul. Ada pautan. Ada tarikh akhir." |
| 3 | 0:35–1:00 | Mak tekan lama → **Copy** → buka PERISAI → **Tampal & Imbas**. Animasi perisai → skrin **merah SCAM**, "Penipuan Parcel", tanda bahaya diserlahkan, **suara membaca keputusan**. | "Dengan PERISAI, Mak salin mesej dan tekan satu butang. Dalam beberapa saat: SCAM. PERISAI tunjuk perkataan yang mencurigakan, dan bacakan apa perlu buat." |
| 4 | 1:00–1:25 | **Telefon B** berbunyi: "⚠️ Amaran PERISAI: Mak baru terima mesej SCAM (Penipuan Parcel / Kurier)". Anak tekan → skrin merah → **Call Mak**. | "Pada masa yang sama, anak terima amaran. Satu tekan, terus telefon Mak, sebelum Mak sempat klik apa-apa." |
| 5 | 1:25–1:45 | Tab **Radar**: peta gelap, titik baru berdenyut di **Pahang**, kaunter naik +1, suapan "dikesan di Pahang · sekarang". | "Setiap scam dilaporkan tanpa nama ke Radar Scam, jadi seluruh Malaysia nampak scam yang sedang aktif." |
| 6 | 1:45–2:00 | Imbas SMS bank sebenar → **SELAMAT** (hijau). | "PERISAI tidak menuduh membuta tuli. Notis bank yang sah dikenal pasti sebagai selamat." |
| 7 | 2:00–2:15 | Mod Penilaian: ayat keputusan dan jubin metrik (angka **sebenar**). | "Kami uji dengan [X] mesej scam sebenar dan [Y] mesej sah: [ayat keputusan dari /eval]." |
| 8 | 2:15–2:30 | Poster QR → juri imbas → PERISAI terbuka di telefon. Logo + "PERISAI: Pelindung keluarga daripada scam". | "Tiada app store. Imbas kod ini dan PERISAI terus berada di telefon anda, Android atau iPhone." |

**Kalau masa terhad**, buang babak 6 dahulu. Jangan buang babak 3–4 (detik demo utama).

## C. Draf kandungan poster

1. **Tajuk:** PERISAI: Pelindung Keluarga daripada Scam
2. **Masalah:** RM2.97 bilion hilang, 66,204 kes scam dalam talian di Malaysia pada 2025 (PDRM, Jun 2026).
   Warga emas paling mudah menjadi mangsa, dan keluarga selalunya tahu selepas wang sudah hilang.
3. **Penyelesaian (3 ikon):**
   - **Imbas**: tampal mesej, pautan, nombor atau screenshot → SCAM / MENCURIGAKAN / SELAMAT dalam ±2.5 s, dengan suara.
   - **Penjaga Keluarga**: keputusan SCAM terus memberi amaran ke telefon anak, dengan butang Call.
   - **Radar Scam**: peta scam masa nyata seluruh Malaysia, tanpa nama.
4. **Cara ia berfungsi (rajah aliran):** Telefon (padam IC/kad) → API PERISAI (semak pautan + Gemini AI) →
   keputusan + amaran keluarga (Web Push) + laporan Radar tanpa nama (Firestore).
5. **Keputusan:** [ayat dan metrik dari `/eval` dengan sampel sebenar], kebolehcapaian Lighthouse **100/100**.
6. **Privasi:** mesej tidak disimpan; IC dan nombor kad dipadam di telefon; sejarah kekal dalam telefon;
   Radar tanpa nama. (Prototaip guna tier percuma Gemini; produksi akan guna tier berbayar.)
7. **Teknologi:** PWA (Next.js, TypeScript), Gemini AI, Firebase, Vercel. Satu kod untuk semua telefon.
8. **Hala tuju:** Google Play (TWA) dan App Store daripada kod yang sama; kerjasama dengan bank, telco dan NSRC.
9. **QR besar:** `public/qr/perisai-qr-poster.png` + `perisai-three.vercel.app`.
10. **Pasukan:** Ahmad Adib Syahid (ketua) dan ahli pasukan, Kolej Profesional MARA Beranang.
