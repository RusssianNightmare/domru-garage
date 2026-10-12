import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const items: Item[] = [
  { to: '/', label: 'Главная', icon: Home, match: (p) => p === '/' },
  {
    to: '/catalog',
    label: 'Каталог',
    icon: ShoppingCart,
    match: (p) => p === '/catalog' || p === '/smart-home',
  },
  { to: '/profile', label: 'Дом.ру ID', icon: User, match: (p) => p === '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // На flow-экранах меню не показываем — пользователь в процессе
  if (
    pathname === '/garage/qr' ||
    pathname === '/garage/add' ||
    pathname.startsWith('/garage/edit')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-2 py-2 flex justify-around z-40">
      {items.map((it) => {
        const active = it.match(pathname);
        const Icon = it.icon;
        return (
          <button
            key={it.to}
            onClick={() => navigate(it.to)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
              active ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}