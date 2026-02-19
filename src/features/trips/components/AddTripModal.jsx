import { useState, useEffect } from 'react';
import { createTrip, updateTrip } from '../../../services/tripsService';
import { getCities } from '../../../services/cityService';
import { showError, showSuccess } from '../../../utils/notifications';

export default function AddTripModal({ userId, tripToEdit, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingCity, setSearchingCity] = useState(false);
  
  const [formData, setFormData] = useState({
    cityName: '',
    startDate: '',
    endDate: '',
    status: 'TO_BE_VISITED',
    personalRemark: '',
    rating: null,
    image: null
  });

  // Effect to pre-fill form if we are editing
  useEffect(() => {
    if (tripToEdit) {
      // Extract date portion only (YYYY-MM-DD format needed for input type="date")
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM:SS" formats
        return dateString.split('T')[0];
      };

      setFormData({
        cityName: tripToEdit.city?.name || '',
        startDate: formatDateForInput(tripToEdit.startDate),
        endDate: formatDateForInput(tripToEdit.endDate),
        status: tripToEdit.status || 'TO_BE_VISITED',
        personalRemark: tripToEdit.personalRemark || '',
        rating: tripToEdit.rating || null,
        image: null // We don't pre-fill the file input for security/technical reasons
      });
      if (tripToEdit.imageUrl) {
        setPreviewUrl(tripToEdit.imageUrl);
      }
    } else {
      // Reset to default for new trip
      setFormData({
        cityName: '',
        startDate: '',
        endDate: '',
        status: 'TO_BE_VISITED',
        personalRemark: '',
        rating: null,
        image: null
      });
      setPreviewUrl(null);
    }
  }, [tripToEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else if (name === 'rating') {
      const ratingValue = value ? parseInt(value) : null;
      setFormData(prev => ({ ...prev, [name]: ratingValue }));
      // Clear error when user starts correcting
      if (error) setError(null);
    } else if (name === 'cityName') {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Fetch city suggestions
      if (value.trim().length > 0) {
        searchCities(value);
        setShowSuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
      if (error) setError(null);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts correcting
      if (error) setError(null);
    }
  };

  const searchCities = async (query) => {
    try {
      setSearchingCity(true);
      const response = await getCities(query);
      
      let cities = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Backend returns array of City objects with { id, name, country, imageUrl, description }
          cities = response.data.map(city => ({
            name: city.name || '',
            country: city.country || '',
            fullCity: city
          }));
        } else if (response.data.data && Array.isArray(response.data.data)) {
          cities = response.data.data;
        }
      }
      
      // Limit to 10 suggestions
      const uniqueCities = Array.isArray(cities) 
        ? cities.slice(0, 10)
        : [];
      
      setCitySuggestions(uniqueCities);
    } catch (err) {
      console.error('Error searching cities:', err);
      setCitySuggestions([]);
    } finally {
      setSearchingCity(false);
    }
  };

  const handleSelectCity = (city) => {
    let cityName = '';
    if (typeof city === 'string') {
      cityName = city;
    } else if (city && city.name) {
      cityName = city.name; // City object from backend with name property
    } else {
      cityName = city?.fullName || '';
    }
    setFormData(prev => ({ ...prev, cityName }));
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.cityName || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Validate dates - start date must be before or equal to end date
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate > endDate) {
      setError("Start date must be before or equal to end date");
      setLoading(false);
      return;
    }

    const tripData = {
      city: { name: formData.cityName },
      startDate: formData.startDate, 
      endDate: formData.endDate,     
      status: formData.status || 'TO_BE_VISITED',
      personalRemark: formData.personalRemark || null,
      rating: formData.rating || null
    };

    try {
      if (tripToEdit) {
        // update api call
        await updateTrip(userId, tripToEdit.tripId, tripData, formData.image);
        showSuccess('Trip updated successfully! ✨');
      } else {
        // create api call
        await createTrip(userId, tripData, formData.image);
        showSuccess('Trip created successfully! 🎉');
      }
      onSuccess(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Something went wrong. Please check your data.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              {tripToEdit ? 'Edit Journey' : 'New Adventure'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Destination</label>
              <input
                required
                name="cityName"
                value={formData.cityName}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Where to?"
                autoComplete="off"
              />
              
              {/* City Suggestions Dropdown  eg : Ca would suggest Canada, California etc.*/ }
              {showSuggestions && (
                <div className="absolute top-[100%] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
                  {searchingCity ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      Searching cities...
                    </div>
                  ) : citySuggestions.length > 0 ? (
                    citySuggestions.map((city, index) => {
                      let cityDisplay = '';
                      let cityObj = city;
                      
                      if (typeof city === 'string') {
                        cityDisplay = city;
                      } else if (city && city.name) {
                        // City object from backend with { name, country, ... }
                        cityDisplay = city.name;
                        cityObj = city;
                      } else {
                        cityDisplay = JSON.stringify(city);
                      }
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectCity(cityObj)}
                          className="w-full text-left px-5 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-b-0 font-medium text-slate-900 text-sm"
                        >
                          📍 {cityDisplay}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Start Date</label>
                <input
                  required
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">End Date</label>
                <input
                  required
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || ''}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:opacity-50"
              >
                <option value="TO_BE_VISITED">To Visit</option>
                <option value="VISITED">Visited</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Rating (1-5)</label>
              <select
                name="rating"
                value={formData.rating || ''}
                onChange={handleChange}
                disabled={formData.status === 'TO_BE_VISITED'}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:opacity-50"
              >
                <option value="">No rating</option>
                <option value="1">⭐</option>
                <option value="2">⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
              </select>
              {formData.status === 'TO_BE_VISITED' && (
                <p className="text-xs text-slate-400 mt-1">💡 Mark trip as Visited to add rating</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Personal Remark/Description</label>
              <textarea
                name="personalRemark"
                value={formData.personalRemark}
                onChange={handleChange}
                placeholder="Share your experience..."
                disabled={formData.status === 'TO_BE_VISITED'}
                rows="3"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:opacity-50"
              />
              {formData.status === 'TO_BE_VISITED' && (
                <p className="text-xs text-slate-400 mt-1">💡 Mark trip as Visited to add remarks</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Cover Image</label>
              <div className={`relative group border-2 border-dashed rounded-[2rem] transition-all overflow-hidden ${previewUrl ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'} ${!tripToEdit || tripToEdit.status === 'VISITED' ? '' : 'opacity-50 pointer-events-none'}`}>
                {previewUrl ? (
                  <div className="relative h-40">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {(!tripToEdit || tripToEdit.status === 'VISITED') && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900">
                          Change Photo
                          <input name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <label className={`cursor-pointer block ${!tripToEdit || tripToEdit.status === 'VISITED' ? '' : 'opacity-50'}`}>
                      <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">Upload Image</span>
                      <input name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" disabled={tripToEdit && tripToEdit.status !== 'VISITED'} />
                    </label>
                  </div>
                )}
              </div>
              {tripToEdit && tripToEdit.status === 'TO_BE_VISITED' && (
                <p className="text-xs text-slate-400 mt-2 italic">💡 You can upload images once you mark this trip as visited.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 uppercase tracking-[0.15em] text-xs"
            >
              {loading ? 'Processing...' : tripToEdit ? 'Save Changes' : 'Confirm Trip'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}