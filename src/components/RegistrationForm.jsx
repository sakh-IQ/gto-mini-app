import React, { useState } from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import { INFO_TEXTS } from '../data/constants';

const RegistrationForm = ({ location, user, onSubmit }) => {
 const [formData, setFormData] = useState({
   lastName: '',
   firstName: '',
   middleName: '',
   uin: '',
   phone: '',
   disciplines: []
 });

 const [errors, setErrors] = useState({});

 const validateForm = () => {
   const newErrors = {};
   if (!formData.lastName) newErrors.lastName = 'Введите фамилию';
   if (!formData.firstName) newErrors.firstName = 'Введите имя';
   if (!formData.middleName) newErrors.middleName = 'Введите отчество';
   if (!formData.uin) newErrors.uin = 'Введите УИН';
   if (!formData.phone) newErrors.phone = 'Введите телефон';
   if (formData.disciplines.length === 0) newErrors.disciplines = 'Выберите хотя бы одну дисциплину';
   
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = (e) => {
   e.preventDefault();
   if (validateForm()) {
     console.log('Submitting form data:', formData); // для отладки
     onSubmit(formData);
   }
 };

 const handlePhoneShare = () => {
   const tg = window.Telegram?.WebApp;
   if (tg) {
     tg.requestContact().then(contact => {
      // Если contact существует, берём из него номер телефона
       if (contact && contact.phone_number) {
         setFormData(prev => ({
           ...prev,
           phone: contact.phone_number
         }));
       }
     }).catch(error => {
       console.error('Error requesting contact:', error);
     });
   }
 };

 return (
   <form onSubmit={handleSubmit} className="space-y-6">
     <div className="bg-white rounded-lg shadow-sm p-4">
       <h2 className="text-xl font-semibold mb-4">Запись на сдачу нормативов</h2>
       <div className="text-sm text-gray-600 mb-6">Место: {location.name}</div>

       <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">Фамилия *</label>
             <input
               type="text"
               className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : ''}`}
               value={formData.lastName}
               onChange={e => setFormData({...formData, lastName: e.target.value})}
             />
             {errors.lastName && (
               <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Имя *</label>
             <input
               type="text"
               className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : ''}`}
               value={formData.firstName}
               onChange={e => setFormData({...formData, firstName: e.target.value})}
             />
             {errors.firstName && (
               <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Отчество *</label>
             <input
               type="text"
               className={`w-full p-2 border rounded ${errors.middleName ? 'border-red-500' : ''}`}
               value={formData.middleName}
               onChange={e => setFormData({...formData, middleName: e.target.value})}
             />
             {errors.middleName && (
               <p className="text-red-500 text-xs mt-1">{errors.middleName}</p>
             )}
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">УИН *</label>
             <input
               type="text"
               className={`w-full p-2 border rounded ${errors.uin ? 'border-red-500' : ''}`}
               value={formData.uin}
               onChange={e => setFormData({...formData, uin: e.target.value})}
             />
             {errors.uin && (
               <p className="text-red-500 text-xs mt-1">{errors.uin}</p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Телефон *</label>
             <div className="flex gap-2">
               <input
                 type="tel"
                 className={`flex-1 p-2 border rounded ${errors.phone ? 'border-red-500' : ''}`}
                 value={formData.phone}
                 onChange={e => setFormData({...formData, phone: e.target.value})}
               />
               <button
                 type="button"
                 onClick={handlePhoneShare}
                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
               >
                 <Phone className="w-4 h-4" />
                 <span>Из Telegram</span>
               </button>
             </div>
             {errors.phone && (
               <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
             )}
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium mb-2">Выберите дисциплины *</label>
           <div className="space-y-2">
             {location.disciplines.map(discipline => (
               <label key={discipline} className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={formData.disciplines.includes(discipline)}
                   onChange={(e) => {
                     const disciplines = e.target.checked
                       ? [...formData.disciplines, discipline]
                       : formData.disciplines.filter(d => d !== discipline);
                     setFormData({...formData, disciplines: disciplines});
                   }}
                 />
                 <span>{discipline}</span>
               </label>
             ))}
           </div>
           {errors.disciplines && (
             <p className="text-red-500 text-xs mt-1">{errors.disciplines}</p>
           )}
         </div>
       </div>
     </div>

     <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
       <div className="flex">
         <AlertCircle className="w-5 h-5 text-yellow-400" />
         <div className="ml-3">
           <h3 className="text-sm font-medium text-yellow-800">
             {INFO_TEXTS.UIN_INFO.title}
           </h3>
           <p className="text-sm text-yellow-700 mt-1">
             {INFO_TEXTS.UIN_INFO.text}
           </p>
         </div>
       </div>
     </div>

     <div className="flex justify-end">
       <button
         type="submit"
         className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
       >
         Отправить
       </button>
     </div>
   </form>
 );
};

export default RegistrationForm;