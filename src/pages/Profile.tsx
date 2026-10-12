import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Wifi, Coins, Sparkles, Pencil } from 'lucide-react';
import { loadDevices } from '../lib/devices';

const NAME_KEY = 'domru_profile_name';

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || 'Артём');
  const devicesCount = loadDevices().length;
  const lastNet = (() => {
    try {
      const raw = localStorage.getItem('domru_last_net');
      return raw ? (JSON.parse(raw) as { incoming: number; ping: number }) : null;
    } catch {
      return null;
    }
  })();

  const editName = () => {
    const next = window.prompt('Имя в договоре Дом.ру:', name);
    if (next && next.trim()) {
      setName(next.trim());
      localStorage.setItem(NAME_KEY, next.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-24">
      {/* Шапка профиля */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD166] to-[#EF476F] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-gray-900 break-words">
            Дом.ру ID — {name}
          </h1>
          <p className="text-sm text-gray-500">Клиент с марта 2023 • Договор № 7747-2025-0142</p>
        </div>
        <button onClick={editName} className="text-gray-400 p-2" title="Изменить имя">
          <Pencil size={18} />
        </button>
      </div>

      {/* Тариф */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-3">
        <p className="text-sm text-gray-500">Тариф</p>
        <p className="font-bold text-gray-900">«Домашний 100 Мбит/с» • 650 ₽/мес</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {['Интернет', 'ТВ', 'Мобильная связь'].map((s) => (
            <span key={s} className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Кликабельные карточки с живыми данными */}
      <button
        onClick={() => navigate('/garage')}
        className="w-full bg-gray-50 rounded-2xl p-4 mb-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
      >
        <Package className="text-gray-800 shrink-0" size={22} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Мои устройства</p>
          <p className="text-xs text-gray-500">В архиве техники: {devicesCount}</p>
        </div>
        <span className="text-gray-400 text-xl">›</span>
      </button>

      <button
        onClick={() => navigate('/diagnostics')}
        className="w-full bg-gray-50 rounded-2xl p-4 mb-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
      >
        <Wifi className="text-gray-800 shrink-0" size={22} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Диагностика сети</p>
          <p className="text-xs text-gray-500">
            {lastNet
              ? `Последний замер: ${lastNet.incoming} Мбит/с, пинг ${lastNet.ping} мс`
              : 'Ещё не проводилась'}
          </p>
        </div>
        <span className="text-gray-400 text-xl">›</span>
      </button>

      <button
        onClick={() => navigate('/catalog')}
        className="w-full bg-gray-50 rounded-2xl p-4 mb-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
      >
        <Coins className="text-gray-800 shrink-0" size={22} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Бонусные баллы</p>
          <p className="text-xs text-gray-500">1 240 баллов — потратить в каталоге</p>
        </div>
        <span className="text-gray-400 text-xl">›</span>
      </button>

      <button
        onClick={() => navigate('/ai-assistant')}
        className="w-full bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
      >
        <Sparkles size={18} /> Спросить ИИ-помощника
      </button>
    </div>
  );
}
export default Profile;