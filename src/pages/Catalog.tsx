import { useNavigate } from 'react-router-dom';

function Catalog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-4 pb-20">
      {/* Шапка */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Каталог</h1>
        <p className="text-gray-500">📍 Москва</p>
      </div>

      {/* Категории */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm whitespace-nowrap">Рекомендуем</button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm whitespace-nowrap">Wi-Fi роутеры</button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm whitespace-nowrap">ТВ-приставки</button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm whitespace-nowrap">Домофоны</button>
      </div>

      {/* Товары */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-3">
          <div className="bg-gray-100 h-32 rounded-lg mb-2 flex items-center justify-center text-4xl">📺</div>
          <p className="font-bold text-lg">4 950 ₽</p>
          <p className="text-sm text-gray-600">Movix 4K, HDR10</p>
          <button className="w-full bg-gray-800 text-white py-2 rounded-lg mt-2 text-sm">В корзину...</button>
        </div>

        <div className="border border-gray-200 rounded-xl p-3">
          <div className="bg-gray-100 h-32 rounded-lg mb-2 flex items-center justify-center text-4xl">📡</div>
          <p className="font-bold text-lg">4 990 ₽</p>
          <p className="text-sm text-gray-600">Дом.ру Wave до 1500 Мбит/с</p>
          <button className="w-full bg-gray-800 text-white py-2 rounded-lg mt-2 text-sm">В корзину...</button>
        </div>
      </div>

      {/* Нижнее меню навигации */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-2 flex justify-around">
        <button 
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs">Главная</span>
        </button>
        <button className="flex flex-col items-center text-gray-800">
          <span className="text-xl">🛒</span>
          <span className="text-xs">Каталог</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xl"></span>
          <span className="text-xs">Дом.ру ID</span>
        </button>
      </div>
    </div>
  );
}

export default Catalog;