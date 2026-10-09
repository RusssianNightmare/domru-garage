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