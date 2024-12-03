import { useState, useEffect } from 'react';

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || {});
      
      // Настраиваем внешний вид
      tg.setHeaderColor('#dc2626'); // red-600
      tg.setBackgroundColor('#f9fafb'); // gray-50

      // Скрываем основную кнопку, если она есть
      tg.MainButton.hide();
    }
  }, []);

  return { webApp, user };
};