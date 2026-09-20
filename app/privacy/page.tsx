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
        Halaman ini menjelaskan data yang dikumpulkan oleh {SITE_NAME} saat Anda menggunakan
        layanan pengecekan akun Free Fire ini, beserta cara data tersebut digunakan.
      </p>

      <LegalSection heading="1. Data yang Kami Kumpulkan">
        <p>
          Saat Anda melakukan pencarian/lookup UID di {SITE_NAME}, kami memproses Player ID yang
          Anda masukkan untuk mengambil informasi publik akun tersebut; seperti layanan web pada
          umumnya, server kami juga dapat mencatat data teknis standar (misalnya waktu akses) yang
          dibutuhkan untuk menjaga layanan tetap berjalan dengan baik.
        </p>
        <p>
          Kami tidak meminta maupun menyimpan data pribadi seperti nama asli, email, nomor telepon,
          atau kredensial akun Free Fire Anda, karena layanan ini hanya membutuhkan Player ID
          publik untuk bekerja.
        </p>
      </LegalSection>

      <LegalSection heading="2. Kenapa Data Ini Dikumpulkan">
        <p>
          Data yang tercatat digunakan secara internal semata-mata untuk menjaga layanan tetap
          berjalan stabil dan dapat diakses oleh semua orang, dan kami tidak menjual maupun
          membagikan data ini kepada pihak ketiga untuk kepentingan iklan.
        </p>
      </LegalSection>

      <LegalSection heading="3. Data dari Pihak Ketiga">
        <p>
          Informasi profil Free Fire (nickname, level, rank, guild, koleksi item, dan sebagainya)
          yang ditampilkan berasal dari API pihak ketiga yang mengambil data publik dari server
          game, dan kami tidak mengontrol bagaimana pihak ketiga tersebut mengelola datanya di sisi
          mereka.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cookie & Penyimpanan Lokal">
        <p>
          Layanan ini tidak menggunakan cookie pelacakan pihak ketiga untuk iklan; jika ada data
          yang disimpan pada sisi browser Anda (misalnya preferensi tampilan), data tersebut hanya
          digunakan untuk fungsi dasar layanan dan tidak dibagikan kepada pihak manapun.
        </p>
      </LegalSection>

      <LegalSection heading="5. Keamanan Data">
        <p>
          Kami berupaya menjaga data yang tercatat dengan langkah keamanan yang wajar, namun tetap
          tidak dapat menjamin keamanan absolut atas data yang dikirim melalui internet.
        </p>
      </LegalSection>

      <LegalSection heading="6. Perubahan Kebijakan">
        <p>
          Kebijakan privasi ini dapat diperbarui sewaktu-waktu mengikuti perkembangan layanan, dan
          perubahan akan tercermin melalui tanggal "Terakhir diperbarui" pada bagian atas halaman
          ini.
        </p>
      </LegalSection>

      <LegalSection heading="7. Kontak">
        <p>
          Jika Anda memiliki pertanyaan atau permintaan terkait data Anda, silakan hubungi kami
          melalui Telegram atau WhatsApp yang tercantum pada footer halaman utama.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
