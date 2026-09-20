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
        <p>
          Saat kamu melakukan pencarian/lookup UID di {SITE_NAME}, kami memproses Player ID yang
          kamu masukkan untuk mengambil informasi publik akun tersebut. Seperti layanan web pada
          umumnya, server kami juga bisa mencatat data teknis standar (misalnya waktu akses) yang
          dibutuhkan untuk menjaga layanan tetap berjalan dengan baik.
        </p>
        <p>
          Kami gak meminta ataupun menyimpan data pribadi seperti nama asli, email, nomor telepon,
          atau kredensial akun Free Fire kamu - layanan ini cuma butuh Player ID publik untuk
          bekerja.
        </p>
      </LegalSection>

      <LegalSection heading="2. Kenapa Data Ini Dikumpulkan">
        <p>
          Data yang tercatat dipakai secara internal semata-mata untuk menjaga layanan tetap
          berjalan stabil dan bisa diakses semua orang. Kami gak menjual atau membagikan data ini
          ke pihak ketiga untuk kepentingan iklan.
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
