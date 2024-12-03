import React from 'react';
import { MapPin, Clock, Award, AlertCircle } from 'lucide-react';
import { INFO_TEXTS } from '../data/constants';

const LocationDetails = ({ location, onStartRegistration }) => {
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">{location.name}</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-gray-600">{location.address}</p>
            </div>
          </div>

          {location.schedule && (
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-gray-600">{formatSchedule(location.schedule)}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Award className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <h3 className="font-medium mb-2">Доступные дисциплины:</h3>
              <div className="flex flex-wrap gap-2">
                {location.disciplines.map(discipline => (
                  <span
                    key={discipline}
                    className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                  >
                    {discipline}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {location.description && (
            <p className="text-gray-600 mt-4">{location.description}</p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {INFO_TEXTS.RETAKE_RULES.title}
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {INFO_TEXTS.RETAKE_RULES.text}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStartRegistration}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Записаться
      </button>
    </div>
  );
};

export default LocationDetails;