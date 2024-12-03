import React from 'react';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { locations } from '../data/locations';
import { INFO_TEXTS } from '../data/constants';

const LocationList = ({ onLocationSelect }) => {
  const formatSchedule = (schedule) => {
    if (schedule?.period && schedule?.time) {
      return `${schedule.period}, ${schedule.time}`;
    }
    if (schedule?.days) {
      return Object.entries(schedule.days)
        .map(([day, time]) => {
          const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
          return `${days[day - 1]}: ${time}`;
        })
        .join(', ');
    }
    return 'Расписание уточняется';
  };

  return (
    <div className="space-y-4">
      {/* Информационный блок */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {INFO_TEXTS.DOCUMENTS.title}
            </h3>
            <ul className="mt-2 space-y-1">
              {INFO_TEXTS.DOCUMENTS.items.map((item, index) => (
                <li key={index} className="text-sm text-yellow-700">• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Список локаций */}
      {locations.map(location => (
        <div
          key={location.id}
          className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onLocationSelect(location)}
        >
          <h2 className="text-lg font-semibold mb-2">{location.name}</h2>
          <p className="text-gray-600 flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            {location.address}
          </p>
          {location.schedule && (
            <p className="text-gray-600 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              {formatSchedule(location.schedule)}
            </p>
          )}
          <p className="text-sm text-gray-500">{location.type}</p>
        </div>
      ))}
    </div>
  );
};

export default LocationList;