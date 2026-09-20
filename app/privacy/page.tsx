import type { Metadata } from 'next';
import LegalPageShell, { LegalSection } from '../components/LegalPageShell';
import { SITE_NAME } from '../lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Kebijakan privasi ${SITE_NAME} - data apa yang kami kumpulkan dan bagaimana kami menggunakannya.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updatedAt="20 September 2026">
      <p>
        Halaman ini menjelaskan data apa aja yang {SITE_NAME} kumpulkan saat kamu menggunakan
        layanan pengecekan akun Free Fire ini, dan bagaimana data tersebut digunakan.
      </p>

      <LegalSection heading="1. Data yang Kami Kumpulkan">
        <p>Saat kamu melakukan pencarian/lookup UID di {SITE_NAME}, kami dapat mencatat:</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Player ID / UID yang kamu cari.</li>
          <li>Alamat IP perangkat yang digunakan untuk mengakses layanan.</li>
          <li>Waktu dan hasil singkat dari pencarian (misal status berhasil/gagal).</li>
        </ul>
        <p>
          Kami gak meminta ataupun menyimpan data pribadi seperti nama asli, email, nomor telepon,
          atau kredensial akun Free Fire kamu - layanan ini cuma butuh Player ID publik untuk
          bekerja.
        </p>
      </LegalSection>

      <LegalSection heading="2. Kenapa Data Ini Dikumpulkan">
        <p>
          Data pencarian (UID & IP) dipakai secara internal untuk memantau kestabilan layanan,
          mendeteksi penyalahgunaan (misal scraping massal atau spam request), dan membantu
          troubleshooting kalau ada laporan error. Kami gak menjual atau membagikan data ini ke
          pihak ketiga untuk kepentingan iklan.
        </p>
      </LegalSection>

      <LegalSection heading="3. Data dari Pihak Ketiga">
        <p>
          Informasi profil Free Fire (nickname, level, rank, guild, koleksi item, dsb) yang
          ditampilkan berasal dari API pihak ketiga yang mengambil data publik dari server game.
          Kami gak mengontrol bagaimana pihak ketiga tersebut mengelola datanya di sisi mereka.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cookie & Penyimpanan Lokal">
        <p>
          Layanan ini gak menggunakan cookie pelacakan pihak ketiga untuk iklan. Kalau ada data
          yang disimpan di sisi browser kamu (misalnya preferensi tampilan), itu cuma dipakai
          untuk fungsi dasar layanan dan gak dibagikan ke pihak manapun.
        </p>
      </LegalSection>

      <LegalSection heading="5. Keamanan Data">
        <p>
          Kami berupaya menjaga data yang tercatat dengan langkah keamanan yang wajar, namun tetap
          gak bisa menjamin keamanan absolut atas data yang dikirim melalui internet.
        </p>
      </LegalSection>

      <LegalSection heading="6. Perubahan Kebijakan">
        <p>
          Kebijakan privasi ini bisa diperbarui sewaktu-waktu mengikuti perkembangan layanan.
          Perubahan akan tercermin lewat tanggal "Terakhir diperbarui" di bagian atas halaman ini.
        </p>
      </LegalSection>

      <LegalSection heading="7. Kontak">
        <p>
          Kalau kamu punya pertanyaan atau permintaan terkait data kamu, hubungi kami lewat
          Telegram atau WhatsApp yang tercantum di footer halaman utama.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
