const fs = require('fs');
const path = require('path');

const BLOCKED_USERS_FILE = path.join(__dirname, 'blockedUsers.json');

// Функция для блокировки пользователя
function blockUser(userId) {
  try {
    // Читаем текущий список заблокированных пользователей
    const data = JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8'));
    
    // Проверяем, не заблокирован ли уже пользователь
    if (data.blockedUsers.some(user => user.id === userId)) {
      console.log(`Пользователь ${userId} уже заблокирован`);
      return;
    }

    // Добавляем нового пользователя в список
    data.blockedUsers.push({
      id: userId,
      blockedAt: new Date().toISOString(),
      reason: "spam"
    });

    // Записываем обновленный список
    fs.writeFileSync(BLOCKED_USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`Пользователь ${userId} успешно заблокирован`);
  } catch (error) {
    console.error('Ошибка при блокировке пользователя:', error);
  }
}

// Функция для разблокировки пользователя
function unblockUser(userId) {
  try {
    // Читаем текущий список заблокированных пользователей
    const data = JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8'));
    
    // Удаляем пользователя из списка
    data.blockedUsers = data.blockedUsers.filter(user => user.id !== userId);

    // Записываем обновленный список
    fs.writeFileSync(BLOCKED_USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`Пользователь ${userId} успешно разблокирован`);
  } catch (error) {
    console.error('Ошибка при разблокировке пользователя:', error);
  }
}

// Обработка аргументов командной строки
const [,, command, userId] = process.argv;

if (!command || !userId) {
  console.log('Использование: node blockManager.js [block|unblock] [userId]');
  process.exit(1);
}

switch (command.toLowerCase()) {
  case 'block':
    blockUser(userId);
    break;
  case 'unblock':
    unblockUser(userId);
    break;
  default:
    console.log('Неизвестная команда. Используйте "block" или "unblock"');
}