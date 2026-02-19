import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageForCity } from '../../../services/cityService';

export default function TripCard({ trip, onDelete, onEdit }) {
  const navigate = useNavigate();
  const [defaultImage, setDefaultImage] = useState(null);
  
  // Destructuring with fallbacks for safety
  const { city, startDate, endDate, status, imageUrl, tripId } = trip;

  const handleViewDetails = () => {
    navigate(`/trip/${tripId}`);
  };

  // Fetch default image from backend for TO_BE_VISITED trips
  useEffect(() => {
    if (status === 'TO_BE_VISITED' && city?.name) {
      getImageForCity(city.name)
        .then(res => {
          setDefaultImage(res.data?.imageUrl || null);
        })
        .catch(err => {
          console.error('Error fetching city image:', err);
          setDefaultImage(null);
        });
    }
  }, [status, city?.name]);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={handleViewDetails}>
      
      {/* 1. Image & Badge Section */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={status === 'TO_BE_VISITED' ? (defaultImage || 'https://via.placeholder.com/400x300?text=Loading...') : (imageUrl || defaultImage || 'https://via.placeholder.com/400x300?text=No+Image')} 
          alt={city?.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Status & Rating Badges - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border text-white ${
            trip.status === 'VISITED' 
              ? 'bg-green-500 border-green-400' 
              : 'bg-blue-500 border-blue-400'
          }`}>
            {trip.status === 'VISITED' ? '✓ Visited' : trip.status === 'TO_BE_VISITED' ? '📍 Planned' : trip.status}
          </span>
          
          {/* Rating Badge - Only show for VISITED trips */}
          {trip.status === 'VISITED' && trip.rating && (
            <span className="px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-amber-300">
              ⭐ {trip.rating}/5
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">
          {city?.name || "Unknown Destination"}
        </h3>
        
        <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
          <svg className="w-4 h-4 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {startDate} — {endDate}
        </div>

        {/* Personal Remark if available - Only show for VISITED trips */}
        {trip.status === 'VISITED' && trip.personalRemark && (
          <div className="mb-4 p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
            <p className="text-sm text-slate-700 line-clamp-2 font-medium">💭 {trip.personalRemark}</p>
          </div>
        )}

        {/* Status and Rating Summary */}
        <div className="mb-4 flex items-center gap-2 flex-wrap text-xs">
          <span className={`px-2 py-1 rounded font-bold ${
            trip.status === 'VISITED' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {trip.status === 'VISITED' ? 'VISITED' : 'TO BE VISITED'}
          </span>
          {trip.status === 'VISITED' && trip.rating && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-bold">
              {Array(trip.rating).fill('⭐').join('')} ({trip.rating}/5)
            </span>
          )}
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tripId);
            }}
            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            aria-label="Delete trip"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}