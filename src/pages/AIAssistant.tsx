import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles } from 'lucide-react';

interface Msg {
  id: number;
  from: 'bot' | 'user';
  before: string;
  linkLabel?: string;
  linkTo?: string;
  after?: string;
}

// ---------- Ответы бота по ключевым словам ----------
const botReply = (q: string): Omit<Msg, 'id' | 'from'> => {
  const s = q.toLowerCase();
  if (s.includes('роутер')) {
    return {
      before: 'Если скорость ниже тарифной при хорошем канале — узкое место обычно роутер. Рекомендую ',
      linkLabel: 'Дом.ру Wave с поддержкой Wi-Fi 6',
      linkTo: '/catalog',
      after: ': он держит до 1500 Мбит/с и сам выбирает свободный канал эфира.',
    };
  }
  if (s.includes('пинг') || s.includes('лаг') || s.includes('тормоз')) {
    return {
      before: 'Высокий пинг и лаги чаще всего дают перегруженный эфир 2.4 ГГц или проблемы на линии. Сначала прогоните ',
      linkLabel: 'диагностику сети',
      linkTo: '/diagnostics',
      after: ', а я подскажу решение по результатам.',
    };
  }
  if (s.includes('скидк') || s.includes('договор') || s.includes('подключ')) {
    return {
      before: 'При заключении договора Дом.ру вы получите скидку 20% на роутер из ',
      linkLabel: 'каталога',
      linkTo: '/catalog',
      after: '. Оформление онлайн занимает 5–15 минут.',
    };
  }
  if (s.includes('скорост')) {
    return {
      before: 'Причины низкой скорости: устаревший роутер, перегруженный эфир, проблемы на линии провайдера. Точный ответ даст ',
      linkLabel: 'тест сети',
      linkTo: '/diagnostics',
      after: ' — замерьте и пришлите результат.',
    };
  }
  return {
    before: 'Я специализируюсь на телекоме и интернете Дом.ру. Спросите про роутер, скорость, пинг или скидку при подключении — подскажу точнее.',
  };
};


// ---------- Реальная НН: YandexGPT через прокси Netlify ----------
const askLLM = async (question: string): Promise<string | null> => {
  const lastNet = localStorage.getItem('domru_last_net');
  let ctx = 'данных о последней диагностике нет';
  if (lastNet) {
    try {
      const n = JSON.parse(lastNet) as { incoming: number; ping: number };
      ctx = `последняя диагностика: входящая ${n.incoming} Мбит/с, пинг ${n.ping} мс`;
    } catch {
      /* игнорируем битый JSON */
    }
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch('/.netlify/functions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: ctx }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    const text = (data.text ?? '').trim();
    return text.length > 0 ? text : null;
  } catch {
    return null; // НН недоступна → фолбэк на бота по ТЗ
  }
};

// Ответ НН → Msg; гиперссылка в каталог гарантирована ТЗ
const llmToMsg = (text: string): Omit<Msg, 'id' | 'from'> => {
  const marker = '[[CATALOG]]';
  if (text.includes(marker)) {
    const [before, after = ''] = text.split(marker);
    return {
      before: before.trim() + ' ',
      linkLabel: 'каталог Дом.ру',
      linkTo: '/catalog',
      after: after.trim(),
    };
  }
  return {
    before: text.trim() + ' Если нужно оборудование, смотрите ',
    linkLabel: 'роутер Дом.ру Wave в каталоге',
    linkTo: '/catalog',
    after: '.',
  };
};

// ---------- Первое сообщение: диагноз по последней диагностике ----------
const firstMessage = (): Msg => {
  let incoming: number | null = null;
  const saved = localStorage.getItem('domru_last_net');
  if (saved) {
    try {
      incoming = (JSON.parse(saved) as { incoming: number }).incoming;
    } catch {
      incoming = null;
    }
  }

  if (incoming !== null && incoming > 200) {
    return {
      id: 1,
      from: 'bot',
      before: 'Скорость отличная! Если хотите выжать максимум из канала — обратите внимание на ',
      linkLabel: 'умные устройства и Movix от Дом.ру',
      linkTo: '/catalog',
      after: ': на полном канале они раскрываются лучше всего.',
    };
  }
  if (incoming !== null && incoming >= 100) {
    return {
      id: 1,
      from: 'bot',
      before: 'Анализ показал: скорость средняя. Частая причина — перегруженный эфир 2.4 ГГц и устаревший стандарт роутера. Рекомендую ',
      linkLabel: 'роутер Дом.ру Wave с Wi-Fi 6',
      linkTo: '/catalog',
      after: ': он даст стабильный канал до 1500 Мбит/с.',
    };
  }
  // По умолчанию (и при низкой скорости) — текст дословно из макета Figma
  return {
    id: 1,
    from: 'bot',
    before:
      'Проведенный анализ показал: скорее всего, ваш роутер сломан, так как скорость сети аномально низкая. Нужно заменить устройство. Можно приобрести роутер ',
    linkLabel: 'Wave от Дом.ру с поддержкой Wi-Fi 6',
    linkTo: '/catalog',
    after: ' по выгодной цене, а при заключении договора Вы получите скидку 20% на сам роутер.',
  };
};

function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>(() => [firstMessage()]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'user', before: q }]);
    setInput('');
    setTyping(true);
    const llmText = await askLLM(q); // реальный YandexGPT, таймаут 12 сек
    const reply = llmText ? llmToMsg(llmText) : botReply(q); // страховка по ТЗ
    setMessages((m) => [...m, { ...reply, id: Date.now() + 1, from: 'bot' }]);
    setTyping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C9D4F2] to-[#4A8FD4] flex flex-col">
      {/* Шапка */}
      <div className="p-4 pb-2">
        <h1 className="text-white text-2xl font-bold">дом.ру</h1>
        <h2 className="text-gray-900 text-xl font-extrabold mt-2 flex items-center gap-2">
          <Sparkles size={20} /> ИИ-помощь
        </h2>
      </div>

      {/* Лента сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.map((m) =>
          m.from === 'bot' ? (
            <div key={m.id} className="bg-white rounded-2xl p-4 max-w-[90%] shadow">
              <p className="text-gray-800 text-sm leading-relaxed">
                {m.before}
                {m.linkLabel && (
                  <button
                    onClick={() => navigate(m.linkTo ?? '/catalog')}
                    className="underline font-bold text-gray-900"
                  >
                    {m.linkLabel}
                  </button>
                )}
                {m.after}
              </p>
            </div>
          ) : (
            <div key={m.id} className="bg-white/25 backdrop-blur rounded-2xl p-3 max-w-[80%] ml-auto">
              <p className="text-white text-sm font-medium">{m.before}</p>
            </div>
          )
        )}

        {typing && (
          <div className="bg-white rounded-2xl p-4 max-w-[60%] shadow">
            <p className="text-gray-500 text-sm animate-pulse">ИИ печатает…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Быстрые вопросы (удобно на защите) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex gap-2 overflow-x-auto">
        {['Почему тормозит интернет?', 'Какой роутер выбрать?', 'Как получить скидку?'].map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="bg-white/20 backdrop-blur text-white text-xs rounded-full px-3 py-2 whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Поле ввода */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Введите вопрос:"
          className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
        />
        <button
          onClick={() => send()}
          className="bg-gray-900 text-white rounded-xl px-4 active:scale-95 transition-transform"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;