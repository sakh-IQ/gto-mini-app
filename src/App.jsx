import React, { useState, useEffect } from 'react';
import LocationList from './components/LocationList';
import LocationDetails from './components/LocationDetails';
import RegistrationForm from './components/RegistrationForm';
import Map from './components/Map';
import { MapIcon, XIcon } from 'lucide-react';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';

const TELEGRAM_BOT_TOKEN = "8025818266:AAFcZeopGZsTIUWZNRml4rrllioR0pCRo88";
const TELEGRAM_CHAT_ID = "-4738151106";
const EMAIL = "sakh.crazy.kill@gmail.com";
const BLOCKED_USERS_URL = '/gto-mini-app/blockedUsers.json'; // URL к файлу с заблокированными пользователями

const App = () => {
  const [view, setView] = useState('list');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const { webApp, user } = useTelegramWebApp();
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Загружаем список заблокированных пользователей
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await fetch(BLOCKED_USERS_URL);
        const data = await response.json();
        setBlockedUsers(data.blockedUsers.map(user => user.id));
      } catch (error) {
        console.error('Ошибка при загрузке списка заблокированных пользователей:', error);
      }
    };

    // Загружаем список сразу при запуске
    fetchBlockedUsers();

    // Устанавливаем интервал для периодической проверки
    const interval = setInterval(fetchBlockedUsers, 60000); // Проверяем каждую минуту

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setView('details');
  };

  const handleStartRegistration = () => {
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedLocation(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const userId = user?.id;
      if (!userId) {
        if (webApp) {
          webApp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось определить пользователя',
            buttons: [{ type: 'ok' }]
          });
        }
        return;
      }

      // Проверяем, не заблокирован ли пользователь
      if (blockedUsers.includes(userId.toString())) {
        if (webApp) {
          webApp.showPopup({
            title: 'Доступ ограничен',
            message: 'Вы заблокированы за спам. Для разрешения ситуации обратитесь в муниципальный центр ГТО.',
            buttons: [{ type: 'ok' }]
          });
        }
        return;
      }

      const username = user?.username ? `@${user.username}` : '';
      
      const message = `📍 Новая запись на сдачу ГТО

Место: ${selectedLocation.name}
ФИО: ${formData.lastName} ${formData.firstName} ${formData.middleName}
Телефон: ${formData.phone}
УИН: ${formData.uin}
Дисциплины: ${formData.disciplines.join(', ')}

Пользователь: ${username || 'Без username'} (ID: ${userId})

Отправлено: ${new Date().toLocaleString()}`;

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          reply_markup: {
            inline_keyboard: [[
              {
                text: "👤 Написать пользователю",
                url: `tg://user?id=${userId}`
              }
            ]]
          }
        })
      });

      const result = await response.json();

      if (!result.ok) {
        console.error('Ошибка отправки:', result);
        throw new Error(result.description || 'Ошибка отправки сообщения');
      }

      if (webApp) {
        webApp.showPopup({
          title: 'Успешно!',
          message: 'Ваша заявка принята.',
          buttons: [{ type: 'ok' }],
        });
      }

      setView('list');
      setSelectedLocation(null);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      if (webApp) {
        webApp.showPopup({
          title: 'Ошибка',
          message: 'Не удалось отправить заявку. Попробуйте позже.',
          buttons: [{ type: 'ok' }],
        });
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Запись на сдачу ГТО</h1>
          {view !== 'list' && (
            <button 
              onClick={handleBackToList}
              className="text-white"
            >
              Назад
            </button>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto p-4">
        {view === 'list' && (
          <>
            <button
              onClick={() => setShowMap(true)}
              className="w-full bg-white shadow-sm rounded-lg p-4 text-center text-gray-600 hover:bg-gray-50 mb-4"
            >
              <MapIcon className="w-5 h-5 inline-block mr-2" />
              Показать на карте
            </button>
            <LocationList onLocationSelect={handleLocationSelect} />
          </>
        )}

        {view === 'details' && selectedLocation && (
          <LocationDetails 
            location={selectedLocation}
            onStartRegistration={handleStartRegistration}
          />
        )}

        {view === 'form' && selectedLocation && (
          <RegistrationForm 
            location={selectedLocation}
            user={user}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Модальное окно с картой */}
        {showMap && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Карта мест тестирования</h2>
                <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <Map onLocationSelect={(location) => {
                  setSelectedLocation(location);
                  setShowMap(false);
                  setView('details');
                }} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;