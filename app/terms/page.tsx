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
        Dengan mengakses dan menggunakan {SITE_NAME} ("kami", "layanan"), Anda dianggap setuju
        untuk terikat dengan syarat dan ketentuan di bawah ini; jika Anda tidak setuju dengan salah
        satu poinnya, mohon untuk tidak menggunakan layanan ini.
      </p>

      <LegalSection heading="1. Tentang Layanan">
        <p>
          {SITE_NAME} merupakan alat pihak ketiga yang tidak berafiliasi, tidak disponsori, dan
          tidak didukung secara resmi oleh Garena maupun pengembang Free Fire manapun, dan
          menampilkan informasi publik akun Free Fire (seperti nickname, level, rank, guild, serta
          koleksi item) berdasarkan Player ID/UID yang Anda masukkan sendiri.
        </p>
      </LegalSection>

      <LegalSection heading="2. Penggunaan yang Diperbolehkan">
        <p>
          Layanan ini disediakan untuk keperluan pengecekan informasi akun secara pribadi dan
          non-komersial. Anda setuju untuk tidak menyalahgunakan layanan ini, termasuk namun tidak
          terbatas pada melakukan scraping massal, membebani sistem dengan permintaan otomatis
          berlebihan, atau menggunakan data yang ditampilkan untuk tujuan yang melanggar hukum
          maupun merugikan pihak lain.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sumber Data & Akurasi">
        <p>
          Data yang ditampilkan diambil dari API pihak ketiga yang mengumpulkan informasi publik
          dari server game, sehingga kami tidak menjamin data tersebut selalu akurat, lengkap, atau
          real-time, karena bergantung pada ketersediaan dan pembaruan dari sumber data yang
          bersangkutan.
        </p>
      </LegalSection>

      <LegalSection heading="4. Batasan Tanggung Jawab">
        <p>
          Layanan ini disediakan "apa adanya" tanpa jaminan dalam bentuk apapun, dan kami tidak
          bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari
          penggunaan layanan ini, termasuk gangguan layanan, ketidakakuratan data, atau tindakan
          yang diambil pihak lain (termasuk Garena) terhadap akun yang di-lookup.
        </p>
      </LegalSection>

      <LegalSection heading="5. Perubahan Layanan & Ketentuan">
        <p>
          Kami berhak mengubah, menghentikan sementara, atau menghentikan sebagian maupun seluruh
          layanan kapan saja tanpa pemberitahuan sebelumnya, dan ketentuan ini juga dapat
          diperbarui dari waktu ke waktu; penggunaan layanan setelah perubahan berarti Anda
          menyetujui ketentuan yang telah diperbarui.
        </p>
      </LegalSection>

      <LegalSection heading="6. Kontak">
        <p>
          Jika ada pertanyaan mengenai ketentuan ini, silakan hubungi kami melalui Telegram atau
          WhatsApp yang tercantum pada footer halaman utama.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
