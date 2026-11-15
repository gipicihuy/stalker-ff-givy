'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Heart, X } from 'lucide-react';
import { QRIS_ROWS, QRIS_SIZE } from '../lib/qris-data';

// Modal donasi: muncul sekali tiap sesi (tab) setelah user masuk ke web.
// Ganti SESSION_KEY kalau mau "mereset" supaya user yang sudah pernah
// nutup modalnya dapat lihat lagi.
const SESSION_KEY = 'donate-modal-seen-v1';
const SHOW_DELAY_MS = 1800;

const GOLD = '#fabf00';
const QUIET = 2; // quiet zone (modul) di sekeliling QR

function buildQrPath() {
  // Satu <path> untuk semua modul gelap -> ringan & tajam di semua ukuran.
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

function downloadQrCard() {
  const W = 1000;
  const H = 1260;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1c1f26');
  bg.addColorStop(1, '#14161b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 330, 520);
  glow.addColorStop(0, 'rgba(250,191,0,0.22)');
  glow.addColorStop(1, 'rgba(250,191,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Border emas
  const border = ctx.createLinearGradient(0, 0, W, H);
  border.addColorStop(0, '#fdda25');
  border.addColorStop(0.5, '#b88700');
  border.addColorStop(1, '#fdda25');
  ctx.strokeStyle = border;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 58px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Dukung Stalker', W / 2, 130);
  ctx.fillStyle = GOLD;
  ctx.font = '600 30px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('SCAN PAKAI QRIS', W / 2, 184);

  // Panel putih + QR
  const panel = 740;
  const px = (W - panel) / 2;
  const py = 230;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(px, py, panel, panel, 28);
  ctx.fill();

  const total = QRIS_SIZE + QUIET * 2;
  const cell = Math.floor((panel - 40) / total);
  const qrPx = cell * total;
  const ox = px + (panel - qrPx) / 2;
  const oy = py + (panel - qrPx) / 2;
  ctx.fillStyle = '#141B2D';
  for (let y = 0; y < QRIS_SIZE; y++) {
    for (let x = 0; x < QRIS_SIZE; x++) {
      if (QRIS_ROWS[y][x] === '1') {
        ctx.fillRect(ox + (x + QUIET) * cell, oy + (y + QUIET) * cell, cell, cell);
      }
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Nominal bebas', W / 2, 1075);
  ctx.fillStyle = '#d1d4da';
  ctx.font = '400 32px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Semua e-wallet & m-banking yang mendukung QRIS', W / 2, 1130);
  ctx.fillStyle = '#888d97';
  ctx.font = '400 28px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Terima kasih sudah mendukung 💛', W / 2, 1190);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qris-donasi-stalker.png';
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
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // storage diblokir -> tetap tampilkan sekali per load
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {}
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="donate-backdrop"
          className="donate-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donate-title"
            className="donate-card"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="donate-glow" aria-hidden="true" />

            <button type="button" className="donate-close" onClick={close} aria-label="Tutup">
              <X size={18} />
            </button>

            <div className="donate-heart" aria-hidden="true">
              <Heart size={22} fill={GOLD} color={GOLD} />
            </div>

            <h2 id="donate-title" className="donate-title">
              Dukung Stalker
            </h2>
            <p className="donate-sub">
              Website ini gratis dipakai. Kalau terbantu, boleh traktir buat bantu biaya server dan
              pengembangan fitur baru.
            </p>

            <div className="donate-qr-frame">
              <i className="donate-corner tl" />
              <i className="donate-corner tr" />
              <i className="donate-corner bl" />
              <i className="donate-corner br" />
              <div className="donate-qr-panel">
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
              <span className="donate-scanline" aria-hidden="true" />
            </div>

            <div className="donate-amount">Nominal bebas</div>
            <div className="donate-note">Scan pakai e-wallet / m-banking apa saja yang mendukung QRIS</div>

            <div className="donate-actions">
              <button type="button" className="donate-btn primary" onClick={downloadQrCard}>
                <Download size={16} />
                Simpan QR
              </button>
              <button type="button" className="donate-btn ghost" onClick={close}>
                Nanti saja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
