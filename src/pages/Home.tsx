import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD166] to-[#EF476F] p-4">
      {/* Шапка с номером телефона */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-white text-sm font-medium">+7 (917) 316-56-37</p>
          <p className="text-white text-xs opacity-80">📍 Москва</p>
        </div>
        <button className="text-white text-2xl">🔔</button>
      </div>

      {/* Логотип Дом.ру */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold">дом.ру</h1>
      </div>

      {/* Заголовок секции */}
      <div className="mb-4">
        <h2 className="text-white text-lg font-semibold">Опробуйте наши экспериментальные функции</h2>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-4 mb-6">
        <button
          onClick={() => navigate('/garage')}
          className="w-full bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="text-4xl">📦</div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Учет техники</h3>
            <p className="text-sm text-gray-500">Архив гаджетов и гарантий</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/diagnostics')}
          className="w-full bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="text-4xl"></div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Диагностика вашей сети</h3>
            <p className="text-sm text-gray-500">Проверьте скорость интернета</p>
          </div>
        </button>
      </div>

                {/* Умные устройства для вашего дома */}
      <h2 className="text-white text-lg font-extrabold mb-3 mt-6">
        Умные устройства для вашего дома
      </h2>
      <button
        onClick={() => navigate('/smart-home')}
        className="w-full bg-white rounded-2xl p-3 border border-gray-200 shadow-md flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <span className="bg-gray-100 rounded-xl h-14 w-14 flex items-center justify-center text-2xl shrink-0">
          📡
        </span>
        <span className="bg-gray-100 rounded-xl h-14 w-14 flex items-center justify-center text-2xl shrink-0">
          📷
        </span>
        <span className="flex-1 text-left text-sm font-semibold text-gray-800">
          Камеры, роутеры и датчики — смотреть все
        </span>
        <span className="text-gray-400 text-xl">›</span>
      </button>

      {/* Нижнее меню навигации */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-2 flex justify-around">
        <button className="flex flex-col items-center text-gray-800">
          <span className="text-xl">🏠</span>
          <span className="text-xs">Главная</span>
        </button>
        <button 
          onClick={() => navigate('/catalog')}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-xl">🛒</span>
          <span className="text-xs">Каталог</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-xs">Дом.ру ID</span>
        </button>
      </div>
    </div>
  );
}

export default Home;