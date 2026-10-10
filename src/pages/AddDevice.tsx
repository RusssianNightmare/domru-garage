import { useState, type ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, X, ReceiptText } from 'lucide-react';
import {
  type Device,
  type QrDraft,
  loadDevices,
  saveDevices,
  parseDateRu,
  formatDateRu,
  addMonthsIso,
  maskDateInput,
} from '../lib/devices';

function AddDevice() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state ?? null) as QrDraft | null;

  const [name, setName] = useState(draft?.name ?? '');
  const [purchaseDateRu, setPurchaseDateRu] = useState(draft?.purchaseDateRu ?? '');
  const [warrantyMonths, setWarrantyMonths] = useState(
    draft?.warrantyMonths ? String(draft.warrantyMonths) : ''
  );
  const [photo, setPhoto] = useState<string | null>(draft?.photo ?? null);
  const [error, setError] = useState('');

  // АВТОРАСЧЁТ (требование ТЗ): дата покупки + срок = дата истечения
  const purchaseIso = parseDateRu(purchaseDateRu);
  const months = Number(warrantyMonths);
  const expiryIso =
    purchaseIso && warrantyMonths !== '' && months > 0
      ? addMonthsIso(purchaseIso, months)
      : null;

  // Фото чека через камеру
  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Подтверждение добавления
  const submit = () => {
    if (!name.trim()) {
      setError('Введите имя устройства');
      return;
    }
    if (!purchaseIso) {
      setError('Введите день покупки в формате дд.мм.гггг');
      return;
    }
    if (!months || months <= 0) {
      setError('Введите гарантийный срок в месяцах');
      return;
    }
    setError('');
    const device: Device = {
      id: Date.now(),
      name: name.trim(),
      purchaseDate: purchaseIso,
      warrantyMonths: months,
      receiptPhoto: photo,
    };
    saveDevices([...loadDevices(), device]);
    navigate('/garage');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD166] to-[#EF476F] p-4 pb-24">
      <h1 className="text-white text-2xl font-bold mb-4">дом.ру</h1>
            <h2 className="text-gray-900 text-2xl font-extrabold mb-4">
        Добро пожаловать в архив техники от Дом.ру
      </h2>

          {/* Баннер распознанного чека */}
      {draft?.source === 'fns' && (
        <div className="bg-white rounded-2xl p-4 mb-3 flex gap-3 items-start">
          <ReceiptText size={20} className="text-gray-800 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-800 font-medium">
            {draft.purchaseDateRu
              ? <>Дата покупки{draft.sum ? ` и сумма ${draft.sum.toLocaleString('ru-RU')} ₽` : ''} — из QR‑кода. </>
              : <>Сумма{draft.sum ? ` ${draft.sum.toLocaleString('ru-RU')} ₽` : ''} — из QR‑кода, дату введите вручную. </>}
            Гарантийный срок в чеке <b>не указан</b> (это условие производителя, его нет в фискальном QR по 54‑ФЗ),
            поэтому подставлен базовый {draft.warrantyMonths} мес — проверьте по документам и измените при необходимости.
          </p>
        </div>
      )}
      {draft?.source === 'unknown' && (
        <div className="bg-white rounded-2xl p-4 mb-3">
          <p className="text-sm text-gray-800 font-medium">
            Фото чека прикреплено из сканера. QR‑код не распознан как фискальный чек —
            заполните дату и название вручную. Гарантия по умолчанию {draft.warrantyMonths} мес (в чеке её нет).
          </p>
        </div>
      )}

      {/* Имя устройства */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <label className="text-sm font-semibold text-gray-800">Имя устройства:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Роутер G-Likn 1100"
          className="w-full mt-1 p-2 border-0 focus:outline-none text-gray-800"
        />
      </div>

      {/* День покупки */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <label className="text-sm font-semibold text-gray-800">День покупки:</label>
        <input
          type="text"
          inputMode="numeric"
          value={purchaseDateRu}
          onChange={(e) => setPurchaseDateRu(maskDateInput(e.target.value, purchaseDateRu))}
          placeholder="дд.мм.гггг"
          maxLength={10}
          className="w-full mt-1 p-2 border-0 focus:outline-none text-gray-800"
        />
      </div>

      {/* Гарантийный срок + авторасчёт истечения */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <label className="text-sm font-semibold text-gray-800">
          Гарантийный срок (в месяцах):
        </label>
        <input
          type="number"
          min={1}
          value={warrantyMonths}
          onChange={(e) => setWarrantyMonths(e.target.value)}
          placeholder="12"
          className="w-full mt-1 p-2 border-0 focus:outline-none text-gray-800"
        />
        <p className="text-sm font-semibold text-gray-800 mt-3">
          Гарантия истечёт: {expiryIso ? formatDateRu(expiryIso) : 'xx.xx.xxxx'}
        </p>
      </div>

      {/* Фото чека (опционально) */}
      <div className="bg-white rounded-2xl p-4 mb-4 text-center">
        {photo ? (
          <div className="relative inline-block">
            <img src={photo} alt="Чек" className="max-h-48 rounded-xl mx-auto" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
              title="Убрать фото"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-gray-200 rounded-xl h-40 flex items-center justify-center">
            <Camera size={64} strokeWidth={1} />
          </div>
        )}
        <label className="block mt-3 font-semibold text-gray-800 cursor-pointer">
          {photo ? 'Переснять фото' : 'Добавьте фото вашего чека (опционально)'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPhotoChange}
          />
        </label>
      </div>

      {/* Ошибка валидации */}
      {error && (
        <p className="text-white text-sm font-semibold mb-3 text-center">{error}</p>
      )}

      {/* Кнопка подтверждения */}
      <button
        onClick={submit}
        className="w-full bg-white rounded-2xl p-4 font-semibold text-gray-800 active:scale-95 transition-transform"
      >
        Подтвердить добавление устройства
      </button>
    </div>
  );
}

export default AddDevice;