import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle, ShoppingCart } from 'lucide-react';

type Product = {
  id: string;
  emoji: string;
  name: string;
  price: number;
  desc: string;
  tag?: string;
};

const products: Product[] = [
  { id: 'movix', emoji: '📺', name: 'Movix 4K', price: 4950, desc: 'HDR10, Dolby Audio', tag: 'Хит' },
  { id: 'wave', emoji: '📡', name: 'Дом.ру Wave', price: 4990, desc: 'Wi‑Fi 6, до 1500 Мбит/с', tag: 'Рекомендуем' },
  { id: 'cam', emoji: '📷', name: 'Камера Dom.ru Eye', price: 3490, desc: 'Full HD, ночной режим' },
  { id: 'socket', emoji: '🔌', name: 'Умная розетка', price: 1490, desc: 'Управление через приложение' },
];

const categories = ['Рекомендуем', 'Wi‑Fi роутеры', 'ТВ‑приставки', 'Домофоны', 'Умный дом'];

export default function Catalog() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('Рекомендуем');
  const [cart, setCart] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selected = products.filter((p) => cart.has(p.id));
  const total = selected.reduce((s, p) => s + p.price, 0);
  const discount = Math.round(total * 0.2);

  const askAiAbout = (p: Product) => {
    navigate('/ai-assistant', { state: { question: `Расскажи про ${p.name}: чем хорош и кому подойдёт?` } });
  };

  const checkout = () => {
    if (selected.length === 0) return;
    alert(
      `Заявка оформлена!\n\n` +
        `Товары: ${selected.map((p) => p.name).join(', ')}\n` +
        `Сумма: ${total.toLocaleString('ru-RU')} ₽\n` +
        `Скидка 20% по договору: −${discount.toLocaleString('ru-RU')} ₽\n` +
        `Итого: ${(total - discount).toLocaleString('ru-RU')} ₽`
    );
    setCart(new Set());
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-36">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Каталог</h1>
        <p className="text-gray-500 text-sm">📍 Москва</p>
      </div>

      {/* Категории */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCat === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Товары */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => {
          const inCart = cart.has(p.id);
          return (
            <div key={p.id} className="border border-gray-200 rounded-xl p-3 flex flex-col relative">
              {p.tag && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {p.tag}
                </span>
              )}
              <div className="bg-gray-100 h-28 rounded-lg mb-2 flex items-center justify-center text-4xl">
                {p.emoji}
              </div>
              <p className="font-bold text-lg text-gray-900">{p.price.toLocaleString('ru-RU')} ₽</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{p.name}</p>
              <p className="text-xs text-gray-500 mb-2">{p.desc}</p>

              <button
                onClick={() => askAiAbout(p)}
                className="flex items-center justify-center gap-1 text-xs text-gray-700 py-1.5 mb-1.5 hover:bg-gray-50 rounded-lg"
              >
                <MessageCircle size={14} /> Спросить ИИ
              </button>

              <button
                onClick={() => toggle(p.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:scale-95 transition-all ${
                  inCart ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
                }`}
              >
                {inCart ? (
                  <>
                    <Check size={14} /> В корзине
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} /> В корзину
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Плавающая корзина */}
      {selected.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-gray-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-2xl z-30">
          <div>
            <p className="text-xs text-gray-300">
              {selected.length} {selected.length === 1 ? 'товар' : 'товара'} • {(total - discount).toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-[11px] text-green-400">−20% по договору: −{discount.toLocaleString('ru-RU')} ₽</p>
          </div>
          <button
            onClick={checkout}
            className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold active:scale-95"
          >
            Оформить
          </button>
        </div>
      )}
    </div>
  );
}