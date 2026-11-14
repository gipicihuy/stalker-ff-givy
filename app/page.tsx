import { redirect } from 'next/navigation';

// Halaman utama langsung diarahkan ke /stalk.
// Pakai redirect() (307, sementara) supaya gampang diganti lagi kalau
// nanti landing page beneran sudah siap.
export default function HomePage() {
  redirect('/stalk');
}
