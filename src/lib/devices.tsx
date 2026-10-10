// src/lib/devices.ts — общая логика устройств для всех экранов

export interface Device {
  id: number;
  name: string;
  purchaseDate: string; // ISO: гггг-мм-дд
  warrantyMonths: number;
  receiptPhoto: string | null;
}

const STORAGE_KEY = 'domru_devices'; // тот же ключ, что использует Garage

export const loadDevices = (): Device[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? (JSON.parse(saved) as Device[]) : [];
};

export const saveDevices = (devices: Device[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

// дд.мм.гггг -> ISO (null, если формат неверный или дата несуществующая)
export const parseDateRu = (value: string): string | null => {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const dd = Number(match[1]);
  const mm = Number(match[2]);
  const yyyy = Number(match[3]);
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getDate() !== dd || date.getMonth() !== mm - 1) return null;
  return toIsoLocal(date);
};

// ISO -> дд.мм.гггг
export const formatDateRu = (iso: string): string => {
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}.${mm}.${yyyy}`;
};

// ISO + N месяцев -> ISO (для авторасчёта истечения гарантии)
export const addMonthsIso = (iso: string, months: number): string => {
  const [yyyy, mm, dd] = iso.split('-');
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  date.setMonth(date.getMonth() + months);
  return toIsoLocal(date);
};

// Дата в ISO без сюрпризов с часовыми поясами
const toIsoLocal = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Маска ввода даты: дд.мм.гггг из сплошных цифр
export const maskDateInput = (raw: string, prev: string): string => {
  let digits = raw.replace(/\D/g, '').slice(0, 8);
  const prevDigits = prev.replace(/\D/g, '');
  // Пользователь стёр точку (длина уменьшилась, а цифр столько же) —
  // убираем и последнюю цифру, иначе маска мгновенно вернёт точку
  // и backspace будет казаться "сломанным"
  if (raw.length < prev.length && digits.length === prevDigits.length) {
    digits = digits.slice(0, -1);
  }
  if (digits.length > 4)
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return digits;
};

// ---------- Распознавание QR чеков ----------
export interface QrDraft {
  name: string;
  purchaseDateRu: string | null;
  warrantyMonths: number | null;
  sum: number | null;
  photo: string | null;
  source: 'domru' | 'fns' | 'unknown';
  // откуда гарантия: 'qr' = реально из данных кода (демо-формат),
  // 'default' = базовый дефолт, т.к. в fns-QR гарантии нет по 54-ФЗ
  warrantySource: 'qr' | 'default';
}

// Базовая гарантия по умолчанию для электроники (в чеке её нет — см. 54-ФЗ)
const DEFAULT_WARRANTY_MONTHS = 12;

// Извлечение даты покупки из любого fns-QR (несколько форматов, чтобы не зависеть от одной кассы)
const extractDateRu = (raw: string): string | null => {
  // 1) строгий формат ФНС: t=20251002T1237 / t=20251002T123700
  let m = raw.match(/(?:^|[?&;])t=(\d{8})T\d{4,6}/i);
  if (m) {
    const d = m[1];
    return `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}`;
  }
  // 2) мягкий: t=20251002 (без времени или с слипнутым временем)
  m = raw.match(/(?:^|[?&;])t=(\d{8})(?:\D|$)/);
  if (m) {
    const d = m[1];
    return `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}`;
  }
  // 3) человеческий дд.мм.гггг / дд/мм/гггг (если сканировали не ссылочный QR)
  m = raw.match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/);
  if (m) return `${m[1]}.${m[2]}.${m[3]}`;
  // 4) ISO гггг-мм-дд
  m = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return null;
};

const extractSum = (raw: string): number | null => {
  const m = raw.match(/(?:^|[?&;])s=(\d+(?:[.,]\d+)?)/);
  return m ? Math.round(Number(m[1].replace(',', '.'))) : null;
};

// признак «это чек ФНС»: фискальные реквизиты или домен nalog
const isFnsQr = (raw: string): boolean =>
  /(?:^|[?&;])(?:fn|fp)=\d{6,}|nalog\.ru/i.test(raw);

export const parseReceiptQr = (raw: string, photo: string | null): QrDraft => {
  // Наш демо-формат: DOMRU-GARAGE|Название|дд.мм.гггг|месяцев
  const parts = raw.split('|');
  if (parts[0] === 'DOMRU-GARAGE' && parts.length >= 4) {
    return {
      name: parts[1],
      purchaseDateRu: parts[2],
      warrantyMonths: Number(parts[3]) || DEFAULT_WARRANTY_MONTHS,
      sum: null,
      photo,
      source: 'domru',
      warrantySource: 'qr', // срок реально зашит в демо-код
    };
  }

  // Любой фискальный чек ФНС: дата и сумма — авто; гарантии в QR нет
  const dateRu = extractDateRu(raw);
  const sum = extractSum(raw);
  if (isFnsQr(raw) || dateRu || sum !== null) {
    return {
      name: '',
      purchaseDateRu: dateRu,
      warrantyMonths: DEFAULT_WARRANTY_MONTHS, // дефолт, НЕ из чека
      sum,
      photo,
      source: 'fns',
      warrantySource: 'default',
    };
  }

  // Чужой QR: сохраняем хотя бы фото чека
  return {
    name: '',
    purchaseDateRu: null,
    warrantyMonths: DEFAULT_WARRANTY_MONTHS,
    sum: null,
    photo,
    source: 'unknown',
    warrantySource: 'default',
  };
};