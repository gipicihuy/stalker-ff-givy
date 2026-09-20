import type { Metadata } from 'next';
import LegalPageShell, { LegalSection } from '../components/LegalPageShell';
import { SITE_NAME } from '../lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Syarat dan ketentuan penggunaan layanan ${SITE_NAME}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updatedAt="20 September 2026">
      <p>
        Dengan mengakses dan menggunakan {SITE_NAME} ("kami", "layanan"), kamu setuju untuk terikat
        dengan syarat dan ketentuan di bawah ini. Kalau kamu gak setuju sama salah satu poinnya,
        mohon untuk gak menggunakan layanan ini.
      </p>

      <LegalSection heading="1. Tentang Layanan">
        <p>
          {SITE_NAME} adalah alat pihak ketiga yang gak berafiliasi, gak disponsori, dan gak
          didukung secara resmi oleh Garena atau pengembang Free Fire manapun. Layanan ini
          menampilkan informasi publik akun Free Fire (seperti nickname, level, rank, guild, dan
          koleksi item) berdasarkan Player ID / UID yang kamu masukkan sendiri.
        </p>
      </LegalSection>

      <LegalSection heading="2. Penggunaan yang Diperbolehkan">
        <p>
          Layanan ini disediakan untuk keperluan pengecekan informasi akun secara pribadi dan
          non-komersial. Kamu setuju untuk gak menyalahgunakan layanan ini, termasuk namun gak
          terbatas pada: melakukan scraping massal, membebani sistem dengan permintaan otomatis
          berlebihan, atau menggunakan data yang ditampilkan untuk tujuan yang melanggar hukum
          maupun merugikan pihak lain.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sumber Data & Akurasi">
        <p>
          Data yang ditampilkan diambil dari API pihak ketiga yang mengumpulkan informasi publik
          dari server game. Kami gak menjamin data yang ditampilkan selalu akurat, lengkap, atau
          real-time, karena bergantung pada ketersediaan dan pembaruan dari sumber data tersebut.
        </p>
      </LegalSection>

      <LegalSection heading="4. Batasan Tanggung Jawab">
        <p>
          Layanan ini disediakan "apa adanya" tanpa jaminan dalam bentuk apapun. Kami gak
          bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari
          penggunaan layanan ini, termasuk gangguan layanan, ketidakakuratan data, atau tindakan
          yang diambil pihak lain (termasuk Garena) terhadap akun yang di-lookup.
        </p>
      </LegalSection>

      <LegalSection heading="5. Perubahan Layanan & Ketentuan">
        <p>
          Kami berhak mengubah, menghentikan sementara, atau menghentikan sebagian maupun seluruh
          layanan kapan saja tanpa pemberitahuan sebelumnya. Ketentuan ini juga dapat diperbarui
          dari waktu ke waktu; penggunaan layanan setelah perubahan berarti kamu menyetujui
          ketentuan yang telah diperbarui.
        </p>
      </LegalSection>

      <LegalSection heading="6. Kontak">
        <p>
          Ada pertanyaan soal ketentuan ini? Hubungi kami lewat Telegram atau WhatsApp yang
          tercantum di footer halaman utama.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
