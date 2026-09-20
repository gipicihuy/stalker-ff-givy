import type { Metadata } from 'next';
import LegalPageShell, { LegalSection } from '../components/LegalPageShell';
import { SITE_NAME } from '../lib/seo';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Tentang ${SITE_NAME} - alat pengecekan informasi akun Free Fire lewat UID.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <LegalPageShell title="About Us" updatedAt="20 September 2026">
      <p>
        {SITE_NAME} adalah alat pengecekan informasi akun Free Fire secara gratis dan cepat, cukup
        dengan memasukkan Player ID (UID). Layanan ini menampilkan data publik akun seperti
        nickname, level, rank, guild, hingga koleksi item yang sedang dipakai pemain.
      </p>

      <LegalSection heading="Tentang Layanan">
        <p>
          {SITE_NAME} merupakan proyek independen yang dibuat untuk memudahkan pemain melihat
          informasi akun Free Fire tanpa perlu login atau membuka aplikasi game. Layanan ini tidak
          berafiliasi, tidak disponsori, dan tidak didukung secara resmi oleh Garena maupun
          pengembang Free Fire manapun.
        </p>
      </LegalSection>

      <LegalSection heading="Dikembangkan Oleh">
        <p>
          {SITE_NAME} dibuat dan dikelola oleh Givy. Jika ada pertanyaan, masukan, atau laporan
          bug, silakan hubungi kami melalui Telegram atau WhatsApp yang tercantum pada footer
          halaman utama.
        </p>
      </LegalSection>

      <LegalSection heading="Sumber Data">
        <p>
          Data yang ditampilkan diambil dari API pihak ketiga yang mengumpulkan informasi publik
          dari server game, sehingga akurasi dan kelengkapannya bergantung pada sumber data
          tersebut.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
