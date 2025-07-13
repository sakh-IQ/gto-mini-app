// api/webhook.js
const TELEGRAM_BOT_TOKEN = "7573309906:AAEnBRhkz1gUED5eDAR1A3BXd2LDJkUW8AA";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "sakh-IQ/gto-mini-app";
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Список администраторов
const ADMINS = {
  '294959005': 'Илья',
};

// Проверка админских прав
const isAdmin = (userId) => Object.keys(ADMINS).includes(userId.toString());

// Функция для отправки данных в Google Таблицу с детальной диагностикой
async function sendToGoogleSheets(data) {
  console.log('=== НАЧАЛО ОТПРАВКИ В GOOGLE SHEETS ===');
  console.log('GOOGLE_APPS_SCRIPT_URL:', GOOGLE_APPS_SCRIPT_URL);
  console.log('URL присутствует:', !!GOOGLE_APPS_SCRIPT_URL);
  
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.log('❌ Google Apps Script URL не настроен');
    return { success: false, error: 'Google Apps Script URL не настроен' };
  }

  try {
    console.log('📤 Отправляем данные:', JSON.stringify(data, null, 2));
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Webhook/1.0)',
      },
      body: JSON.stringify(data),
    };
    
    console.log('📋 Параметры запроса:', {
      url: GOOGLE_APPS_SCRIPT_URL,
      method: requestOptions.method,
      headers: requestOptions.headers,
      bodyLength: requestOptions.body.length
    });
    
    console.log('⏳ Выполняем fetch запрос...');
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, requestOptions);
    
    console.log('📥 Получен ответ от Google Apps Script');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ HTTP ошибка:', response.status, response.statusText);
      
      // Пытаемся получить текст ошибки
      let errorText = 'Неизвестная ошибка';
      try {
        errorText = await response.text();
        console.log('📋 Текст ошибки:', errorText);
      } catch (e) {
        console.log('Не удалось получить текст ошибки:', e.message);
      }
      
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    console.log('⏳ Парсим JSON ответ...');
    const result = await response.json();
    console.log('✅ Результат от Google Apps Script:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('❌ Ошибка от Google Apps Script:', result.error);
    } else {
      console.log('🎉 Данные успешно записаны в Google Таблицу');
    }
    
    console.log('=== КОНЕЦ ОТПРАВКИ В GOOGLE SHEETS ===');
    return result;
    
  } catch (error) {
    console.error('💥 Критическая ошибка при отправке в Google Таблицу:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Дополнительная информация об ошибке
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    console.log('=== КОНЕЦ ОТПРАВКИ В GOOGLE SHEETS (С ОШИБКОЙ) ===');
    return { 
      success: false, 
      error: error.message,
      errorType: error.name,
      stack: error.stack
    };
  }
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
  return response.json();
}

// Получение файла с GitHub
async function getBlockedUsersFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/blockedUsers.json?ref=main&t=${Date.now()}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      return { data: JSON.parse(content), sha: data.sha };
    }
    
    return { data: { blockedUsers: [] }, sha: null };
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return { data: { blockedUsers: [] }, sha: null };
  }
}

// Обновление файла на GitHub
async function updateBlockedUsersOnGitHub(blockedUsers, sha) {
  const content = Buffer.from(JSON.stringify(blockedUsers, null, 2)).toString('base64');
  
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/blockedUsers.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Update blocked users - ${new Date().toISOString()}`,
      content: content,
      sha: sha
    })
  });
  
  return response.json();
}

// Редактирование сообщения
async function editMessage(chatId, messageId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    
    // Логируем все входящие запросы
    console.log('🔄 Получен webhook update:', JSON.stringify(update, null, 2));
    
    // 🆕 НОВЫЙ ФУНКЦИОНАЛ: Прокси для Google Sheets
    if (update.proxy_action === 'save_to_sheets') {
      console.log('📊 Получен запрос на сохранение в Google Sheets через прокси');
      console.log('📋 Данные для сохранения:', JSON.stringify(update.data, null, 2));
      
      try {
        const result = await sendToGoogleSheets(update.data);
        console.log('✅ Результат записи в Google Sheets:', JSON.stringify(result, null, 2));
        
        return res.status(200).json({
          success: result.success,
          message: result.message || 'Данные обработаны',
          error: result.error,
          details: result.details,
          errorType: result.errorType
        });
      } catch (error) {
        console.error('❌ Ошибка при записи через прокси:', error);
        return res.status(500).json({
          success: false,
          error: error.message,
          errorType: error.name,
          stack: error.stack
        });
      }
    }
    
    // Обработка нажатий на кнопки
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const data = callbackQuery.data;
      const userId = callbackQuery.from.id;
      
      console.log('👆 Нажата кнопка:', data, 'пользователем:', userId);
      
      if (!isAdmin(userId)) {
        console.log('❌ Пользователь не является админом');
        return res.status(200).json({ ok: true });
      }
      
      if (data.startsWith('take:')) {
        const targetUserId = data.split(':')[1];
        const adminName = ADMINS[userId.toString()];
        
        console.log('📋 Админ', adminName, 'берет в работу пользователя:', targetUserId);
        
        // Отправляем обновление в Google Таблицу
        const sheetsResult = await sendToGoogleSheets({
          action: 'take_in_work',
          userId: targetUserId,
          adminName: adminName
        });
        
        console.log('📊 Результат обновления статуса в Google Sheets:', sheetsResult);
        
        const newText = callbackQuery.message.text + `\n\n📋 Взято в работу: ${adminName}`;
        
        await editMessage(chatId, messageId, newText, {
          inline_keyboard: [
            [{
              text: `👤 В работе: ${adminName}`,
              callback_data: `processing:${targetUserId}:${userId}`
            }],
            [{
              text: '✅ Завершить',
              callback_data: `complete:${targetUserId}:${userId}`
            }, {
              text: '🚫 Блок',
              callback_data: `block:${targetUserId}:${userId}`
            }]
          ]
        });
        
      } else if (data.startsWith('block:')) {
        const targetUserId = data.split(':')[1];
        const adminName = ADMINS[userId.toString()];
        
        console.log('🚫 Админ', adminName, 'блокирует пользователя:', targetUserId);
        
        // Получаем текущий список заблокированных
        const { data: blockedData, sha } = await getBlockedUsersFromGitHub();
        
        // Проверяем, не заблокирован ли уже
        const isAlreadyBlocked = blockedData.blockedUsers.some(user => user.id.toString() === targetUserId);
        
        if (!isAlreadyBlocked) {
          // Добавляем пользователя в список
          blockedData.blockedUsers.push({
            id: targetUserId,
            blockedAt: new Date().toISOString(),
            reason: "spam",
            blockedBy: userId,
            adminName: adminName
          });
          
          // Обновляем файл на GitHub
          await updateBlockedUsersOnGitHub(blockedData, sha);
        }
        
        // Отправляем обновление в Google Таблицу
        const sheetsResult = await sendToGoogleSheets({
          action: 'block',
          userId: targetUserId,
          adminName: adminName
        });
        
        console.log('📊 Результат записи блокировки в Google Sheets:', sheetsResult);
        
        const newText = callbackQuery.message.text + 
          `\n\n🚫 Пользователь заблокирован\nАдминистратор: ${adminName}\n${new Date().toLocaleString()}`;
        
        await editMessage(chatId, messageId, newText, { inline_keyboard: [] });
        
      } else if (data.startsWith('complete:')) {
        const targetUserId = data.split(':')[1];
        const adminName = ADMINS[userId.toString()];
        
        console.log('✅ Админ', adminName, 'завершает заявку пользователя:', targetUserId);
        
        // Отправляем обновление в Google Таблицу
        const sheetsResult = await sendToGoogleSheets({
          action: 'complete',
          userId: targetUserId,
          adminName: adminName
        });
        
        console.log('📊 Результат завершения в Google Sheets:', sheetsResult);
        
        const newText = callbackQuery.message.text + 
          `\n\n✅ Обработано: ${adminName}\n${new Date().toLocaleString()}`;
        
        await editMessage(chatId, messageId, newText, { inline_keyboard: [] });
      }
    }
    
    // Обработка команд в чате
    if (update.message && update.message.text) {
      const message = update.message;
      const chatId = message.chat.id;
      const userId = message.from.id;
      const text = message.text;
      
      if (!isAdmin(userId)) {
        return res.status(200).json({ ok: true });
      }
      
      // Команда /blocked - показать заблокированных
      if (text === '/blocked') {
        const { data: blockedData } = await getBlockedUsersFromGitHub();
        
        if (blockedData.blockedUsers.length === 0) {
          await sendTelegramMessage(chatId, 'Список заблокированных пользователей пуст');
        } else {
          const messageText = blockedData.blockedUsers.map(user => {
            const date = new Date(user.blockedAt).toLocaleString();
            const admin = user.adminName || 'Неизвестно';
            return `👤 ID: ${user.id}\n📅 Дата: ${date}\n👮‍♂️ Админ: ${admin}\n\nРазблокировать: /unblock_${user.id}`;
          }).join('\n\n');
          
          await sendTelegramMessage(chatId, '📋 Заблокированные пользователи:\n\n' + messageText);
        }
      }
      
      // Команда /unblock_ID - разблокировать пользователя
      if (text.startsWith('/unblock_')) {
        const targetUserId = text.replace('/unblock_', '');
        const { data: blockedData, sha } = await getBlockedUsersFromGitHub();
        
        const userIndex = blockedData.blockedUsers.findIndex(user => user.id.toString() === targetUserId);
        
        if (userIndex === -1) {
          await sendTelegramMessage(chatId, 'Пользователь не найден в списке заблокированных');
        } else {
          blockedData.blockedUsers.splice(userIndex, 1);
          await updateBlockedUsersOnGitHub(blockedData, sha);
          
          const adminName = ADMINS[userId.toString()];
          await sendTelegramMessage(chatId, `✅ Пользователь с ID ${targetUserId} разблокирован\n👮‍♂️ Разблокировал: ${adminName}`);
        }
      }
    }
    
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('💥 Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}