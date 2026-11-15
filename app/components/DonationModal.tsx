'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { QRIS_ROWS, QRIS_SIZE } from '../lib/qris-data';

// Modal donasi: muncul setiap kali user membuka web (tiap load/refresh).
// Pindah halaman di dalam web (navigasi client-side) tidak memunculkannya lagi.
const SHOW_DELAY_MS = 1500;
const QUIET = 2; // quiet zone (modul) di sekeliling QR

function buildQrPath() {
  let d = '';
  for (let y = 0; y < QRIS_SIZE; y++) {
    const row = QRIS_ROWS[y];
    let x = 0;
    while (x < QRIS_SIZE) {
      if (row[x] === '1') {
        let len = 1;
        while (x + len < QRIS_SIZE && row[x + len] === '1') len++;
        d += `M${x + QUIET} ${y + QUIET}h${len}v1h-${len}z`;
        x += len;
      } else {
        x++;
      }
    }
  }
  return d;
}

function downloadQr() {
  const total = QRIS_SIZE + QUIET * 2;
  const cell = 16;
  const size = total * cell;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#141B2D';
  for (let y = 0; y < QRIS_SIZE; y++) {
    for (let x = 0; x < QRIS_SIZE; x++) {
      if (QRIS_ROWS[y][x] === '1') {
        ctx.fillRect((x + QUIET) * cell, (y + QUIET) * cell, cell, cell);
      }
    }
  }
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qris-donasi.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}

export default function DonationModal() {
  const [open, setOpen] = useState(false);
  const qrPath = useMemo(buildQrPath, []);
  const vb = QRIS_SIZE + QUIET * 2;

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="donate-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        className="donate-card"
      >
        <button type="button" className="donate-close" onClick={close} aria-label="Tutup">
          <X size={18} />
        </button>

        <div className="donate-emoji" aria-hidden="true">
          ☕
        </div>

        <h2 id="donate-title" className="donate-title">
          Dukung Stalker FF 💛
        </h2>
        <p className="donate-text">
          Kalau Stalker membantu kamu mengecek akun Free Fire dengan cepat, kamu bisa ikut mendukung
          pengembangannya agar web ini tetap aktif dan terus bisa digunakan.
        </p>

        <div className="donate-qr">
          <svg
            viewBox={`0 0 ${vb} ${vb}`}
            role="img"
            aria-label="QRIS donasi"
            shapeRendering="crispEdges"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          >
            <rect width={vb} height={vb} fill="#ffffff" />
            <path d={qrPath} fill="#141B2D" />
          </svg>
        </div>

        <p className="donate-amount">Nominal bebas, berapa pun sangat berarti 🙏</p>

        <div className="donate-chips">
          <span className="donate-chip">🔒 Aman via QRIS</span>
          <span className="donate-chip">📲 Semua e-wallet &amp; m-banking</span>
        </div>

        <div className="donate-actions">
          <button type="button" className="donate-btn primary" onClick={downloadQr}>
            💛 Simpan QR
          </button>
          <button type="button" className="donate-btn ghost" onClick={close}>
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}
