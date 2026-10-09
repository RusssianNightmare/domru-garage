import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Paintbrush, FileText, Plus, X } from 'lucide-react';

// ---------- Типы ----------
interface Device {
  id: number;
  name: string;
  purchaseDate: string; // формат ISO: гггг-мм-дд
  warrantyMonths: number;
  receiptPhoto: string | null; // base64-фото чека
}

// ---------- Вспомогательные функции ----------

// Склонение слов: 1 устройство / 2 устройства / 5 устройств
const plural = (n: number): string => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'устройство';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'устройства';
  return 'устройств';
};

// Дата в формате дд.мм.гггг
const formatDateRu = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Дата N месяцев назад (для тестовых данных)
const monthsAgoIso = (n: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().split('T')[0];
};

// Расчёт гарантии: статус + дата истечения
const getWarrantyInfo = (dev: Device) => {
  const expiry = new Date(dev.purchaseDate);
  expiry.setMonth(expiry.getMonth() + dev.warrantyMonths);
  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
  const status: 'expired' | 'expiring' | 'active' =
    daysLeft < 0 ? 'expired' : daysLeft <= 60 ? 'expiring' : 'active';
  return { status, daysLeft, expiryIso: expiry.toISOString().split('T')[0] };
};

// Демо-фото чека (заглушка-картинка)
const demoReceiptPhoto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420"><rect width="300" height="420" fill="#ffffff"/><rect x="20" y="20" width="260" height="380" fill="none" stroke="#cccccc" stroke-dasharray="6"/><text x="150" y="200" font-family="Arial" font-size="18" text-anchor="middle" fill="#555">Фото чека</text><text x="150" y="230" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">(демо-данные)</text></svg>'
  );

// Тестовые устройства (как в макете Figma)
const defaultDevices = (): Device[] => [
  { id: 1, name: 'Стиральная машина Сумсунг 8888', purchaseDate: monthsAgoIso(11), warrantyMonths: 12, receiptPhoto: demoReceiptPhoto },
  { id: 2, name: 'Роутер G-Likn 1100', purchaseDate: monthsAgoIso(30), warrantyMonths: 12, receiptPhoto: null },
  { id: 3, name: 'Телевизор Android Compact-1', purchaseDate: monthsAgoIso(2), warrantyMonths: 24, receiptPhoto: null },
];

// ---------- Компонент экрана ----------
function Garage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [photoToView, setPhotoToView] = useState<string | null>(null);

  // Загрузка из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('domru_devices');
    setDevices(saved ? (JSON.parse(saved) as Device[]) : defaultDevices());
    setLoaded(true);
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    if (loaded) localStorage.setItem('domru_devices', JSON.stringify(devices));
  }, [devices, loaded]);


  // Устройства, требующие внимания (истекает или истекла гарантия)
  const attentionDevices = devices.filter((d) => getWarrantyInfo(d).status !== 'active');
  const visibleDevices = showAll ? devices : devices.slice(0, 2);
  const hiddenCount = devices.length - visibleDevices.length;

  const confirmDelete = () => {
    if (deleteId !== null) setDevices((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
  };

  // Добавление фото чека через камеру телефона
  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, receiptPhoto: reader.result as string } : d))
      );
    reader.readAsDataURL(file);
  };


  // ========== ГЛАВНЫЙ ЭКРАН АРХИВА ==========
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD166] to-[#EF476F] p-4 pb-24">
      <h1 className="text-white text-2xl font-bold mb-4">дом.ру</h1>
      <h2 className="text-gray-900 text-2xl font-extrabold mb-4">
        Добро пожаловать в архив техники от Дом.ру
      </h2>

      {/* Плашка из ТЗ: предупреждение о гарантии */}
      {attentionDevices.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow">
          <p className="text-sm font-semibold text-gray-800">
            У вас скоро истекает гарантия на {attentionDevices.length} {plural(attentionDevices.length)}.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Если это роутер или камера, можете заказать у Дом.ру новые устройства
          </p>
        </div>
      )}

         {/* Кнопки действий */}
      <button
        onClick={() => navigate('/garage/add')}
        className="w-full bg-white rounded-2xl p-4 mb-3 font-semibold text-gray-800 active:scale-95 transition-transform"
      >
        Добавить устройство вручную
      </button>
      <button
        onClick={() => navigate('/garage/qr')}
        className="w-full bg-white rounded-2xl p-4 mb-3 font-semibold text-gray-800 active:scale-95 transition-transform"
      >
        Сканировать QR-код чека
      </button>
      <button
        onClick={() => navigate('/catalog')}
        className="w-full bg-white rounded-2xl p-4 mb-4 font-semibold text-gray-800 active:scale-95 transition-transform"
      >
        Купить новую технику от Дом.ру
      </button>

      {/* Список устройств */}
      <div className="bg-white rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3 text-center">Ваши устройства:</h3>

        <div className="space-y-3">
          {visibleDevices.map((dev) => {
            const w = getWarrantyInfo(dev);
            return (
              <div key={dev.id} className="bg-[#F9DBDB] rounded-2xl p-4 flex gap-3">
                {/* Информация об устройстве */}
                            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm break-words">Название: {dev.name}</p>
                  <p className="font-semibold text-gray-900 text-sm mt-2">
                    Гарантия истекает: {formatDateRu(w.expiryIso)}
                    {w.status === 'expired' && ' (истекла)'}
                  </p>
                  <p className="font-semibold text-gray-900 text-sm mt-2">
                    Фото чека: {dev.receiptPhoto ? 'есть' : 'нет'}
                  </p>
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setDeleteId(dev.id)}
                    className="bg-white rounded-full p-2 active:scale-90"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/garage/edit/${dev.id}`)}
                    className="bg-white rounded-full p-2 active:scale-90"
                    title="Редактировать"
                  >
                    <Paintbrush size={16} />
                  </button>
                  {dev.receiptPhoto ? (
                    <button
                      onClick={() => setPhotoToView(dev.receiptPhoto)}
                      className="bg-white rounded-full p-2 active:scale-90"
                      title="Посмотреть чек"
                    >
                      <FileText size={16} />
                    </button>
                  ) : (
                    <label className="bg-white rounded-full p-2 active:scale-90 cursor-pointer" title="Добавить фото чека">
                      <Plus size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => onPhotoChange(e, dev.id)}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Сворачивание списка (из ТЗ) */}
        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-3 bg-[#F9DBDB] rounded-2xl p-3 text-sm font-semibold text-gray-800"
          >
            И еще ({hiddenCount}) {plural(hiddenCount)}
          </button>
        )}
        {showAll && devices.length > 2 && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full mt-3 bg-[#F9DBDB] rounded-2xl p-3 text-sm font-semibold text-gray-800"
          >
            Свернуть список
          </button>
        )}

        {devices.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-6">
            Устройств пока нет — добавьте первое!
          </p>
        )}
      </div>

      {/* Модалка подтверждения удаления (из ТЗ) */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold text-gray-900 text-center mb-4">Удалить устройство?</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-[#F9DBDB] rounded-xl p-3 font-semibold text-gray-800"
              >
                Да
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-[#F9DBDB] rounded-xl p-3 font-semibold text-gray-800"
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр фото чека (требование ТЗ) */}
      {photoToView && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={() => setPhotoToView(null)}
        >
          <div className="relative">
            <img src={photoToView} alt="Чек" className="max-h-[70vh] rounded-xl" />
            <button
              className="absolute -top-3 -right-3 bg-white rounded-full p-1"
              onClick={() => setPhotoToView(null)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Garage;