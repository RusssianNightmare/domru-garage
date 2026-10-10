// Прокси к YandexGPT: ключ живёт только на сервере
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.YANDEX_LLM_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;
  if (!apiKey || !folderId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Не заданы YANDEX_LLM_API_KEY / YANDEX_FOLDER_ID' }),
    };
  }

  let question = '';
  let context = '';
  try {
    const parsed = JSON.parse(event.body || '{}');
    question = String(parsed.question || '');
    context = String(parsed.context || '');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Некорректный JSON' }) };
  }

  const system =
    'Ты — ИИ-помощник Дом.ру, эксперт по телекому, интернету, роутерам и Wi-Fi. ' +
    'Отвечай на русском, кратко (2–4 предложения), дружелюбно. ' +
    'Если скорость низкая или роутер неисправен — предложи роутер Дом.ру Wave с Wi-Fi 6 и скидку 20% при заключении договора. ' +
    'В месте, где уместна ссылка на каталог Дом.ру, вставь маркер [[CATALOG]].';
  const prompt = `${system} Контекст: ${context}. Вопрос пользователя: ${question}`;

  try {
    const res = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${apiKey}`,
        'x-folder-id': folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt-lite`,
        completionOptions: { stream: false, temperature: 0.6, maxTokens: '200' },
        messages: [{ role: 'user', text: prompt }],
      }),
    });
    if (!res.ok) {
      const details = await res.text();
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'LLM upstream error', details }),
      };
    }
    const data: any = await res.json();
    const text: string = data?.result?.alternatives?.[0]?.message?.text ?? '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'network' }) };
  }
};