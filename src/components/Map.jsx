import React, { useEffect, useRef } from 'react';
import { locations } from '../data/locations';

const Map = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Проверяем загрузку API
    if (!window.ymaps) {
      console.error('Yandex Maps API не загружен');
      return;
    }

    window.ymaps.ready(() => {
      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: [46.952106, 142.761307], // Координаты центра
        zoom: 12,
        controls: ['zoomControl']
      });

      // Добавляем маркеры для каждой локации
      locations.forEach(location => {
        const marker = new window.ymaps.Placemark(
          location.coordinates,
          {
            balloonContentHeader: location.name,
            balloonContentBody: `
              <div>
                <p>${location.address}</p>
                <p>${location.type}</p>
                <button id="select-${location.id}" 
                  style="background: #dc2626; color: white; padding: 8px 16px; border-radius: 4px; margin-top: 8px;">
                  Выбрать
                </button>
              </div>
            `
          },
          {
            preset: 'islands#redSportIcon'
          }
        );

        marker.events.add('balloonopen', () => {
          setTimeout(() => {
            const button = document.getElementById(`select-${location.id}`);
            if (button) {
              button.onclick = () => {
                onLocationSelect(location);
                marker.balloon.close();
              };
            }
          }, 100);
        });

        map.geoObjects.add(marker);
        markersRef.current[location.id] = marker;
      });

      // Устанавливаем границы карты по маркерам
      map.setBounds(map.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 50
      });
    });
  }, [onLocationSelect]);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} className="rounded-lg" />
    </div>
  );
};

export default Map;