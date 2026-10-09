import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { QrCode } from 'lucide-react';
import { parseReceiptQr } from '../lib/devices';
function QrScan() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const processedRef = useRef(false); // защита от повторных срабатываний
  const [cameraError, setCameraError] = useState('');
  const [success, setSuccess] = useState('');

  // ---------- Распознали QR → черновик в форму добавления ----------
  const handleRaw = (raw: string) => {
    if (processedRef.current) return;
    processedRef.current = true;
    const photo = captureFrame();
    scannerRef.current?.stop();
    const draft = parseReceiptQr(raw, photo);
    const hint = draft.purchaseDateRu ? `: покупка от ${draft.purchaseDateRu}` : '';
    setSuccess(`Чек распознан${hint}. Проверьте данные`);
    setTimeout(() => navigate('/garage/add', { state: draft }), 1500);
  };

  // ---------- Снимок кадра камеры (фото чека по ТЗ) ----------
  const captureFrame = (): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  // ---------- Запуск камеры при открытии экрана ----------
  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
            (result) => {
        handleRaw(result.data);
      },
      {
        highlightScanRegion: true,   // рамка зоны сканирования
        highlightCodeOutline: true,  // подсветка найденного QR
      }
    );

    scannerRef.current = scanner;
    scanner.start().catch(() => {
      setCameraError('Не удалось получить доступ к камере. Разрешите доступ в браузере или добавьте устройство вручную.');
    });

    return () => {
      scanner.destroy();
    };
  }, []);

  // ---------- Кнопка-страховка для защиты (если камера откажет) ----------
   const demoScan = () =>
    handleRaw('DOMRU-GARAGE|Телевизор Android Compact-1|15.03.2025|24');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD166] to-[#EF476F] p-4">
      <h1 className="text-white text-2xl font-bold mb-4">дом.ру</h1>

      <div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3">
        <QrCode size={28} />
        <p className="font-semibold text-gray-800">Сканировать QR-код чека</p>
      </div>

      {/* Окно камеры */}
      <div className="relative bg-black rounded-2xl overflow-hidden mb-3" style={{ minHeight: 320 }}>
        <video ref={videoRef} className="w-full rounded-2xl" />
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-white text-sm text-center">{cameraError}</p>
          </div>
        )}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-600/80 p-6">
            <p className="text-white text-lg font-bold text-center">✅ {success}</p>
          </div>
        )}
      </div>

      <p className="text-white text-sm text-center mb-4">Наведите камеру на QR-код чека</p>

      {/* Кнопки по макету */}
      <button
        onClick={() => navigate('/garage/add')}
        className="w-full bg-white rounded-2xl p-4 mb-3 text-sm font-medium text-gray-800 active:scale-95 transition-transform"
      >
        Не получается отсканировать чек? Добавьте устройство вручную, нажав на эту кнопку
      </button>
      <button
        onClick={() => navigate('/garage')}
        className="w-full bg-white rounded-2xl p-4 mb-3 text-sm font-medium text-gray-800 active:scale-95 transition-transform"
      >
        Перейти к моим устройствам
      </button>

      {/* Страховка для демо: имитация успешного скана */}
      <button
        onClick={demoScan}
        className="w-full text-white/70 text-xs underline py-2"
      >
        (демо-режим) Симулировать успешное сканирование
      </button>
    </div>
  );
}

export default QrScan;