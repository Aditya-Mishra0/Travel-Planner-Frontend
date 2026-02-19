import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrips, deleteTrip } from '../../services/tripsService';
import { showError, showSuccess } from '../../utils/notifications';
import AddTripModal from './components/AddTripModal';

export default function TripPage({ userId }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await getTrips(userId);
        const foundTrip = response.data.find(t => t.tripId === parseInt(tripId));
        if (foundTrip) {
          setTrip(foundTrip);
        } else {
          showError('Trip not found');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (err) {
        console.error("Error fetching trip details", err);
        showError("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId, userId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trip permanently?")) {
      try {
        await deleteTrip(userId, trip.tripId);
        showSuccess("Trip deleted successfully!");
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        console.error("Delete error:", err);
        showError("Failed to delete trip");
      }
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Refresh trip data
    const fetchUpdated = async () => {
      try {
        const response = await getTrips(userId);
        const updated = response.data.find(t => t.tripId === parseInt(tripId));
        if (updated) setTrip(updated);
      } catch (err) {
        console.error("Error refetching trip", err);
      }
    };
    fetchUpdated();
  };

  if (loading) return (
    <div className="p-20 text-center font-bold text-slate-400">
      <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p>Loading itinerary...</p>
    </div>
  );
  
  if (!trip) return (
    <div className="p-20 text-center">
      <p className="text-slate-500 font-bold">Trip not found.</p>
    </div>
  );

  const daysCount = trip.startDate && trip.endDate 
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1 
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img 
          src={trip.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"} 
          className="w-full h-full object-cover"
          alt={trip.city?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-12">
          <div className="w-full">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mb-6 flex items-center text-white/80 hover:text-white transition-colors font-bold"
            >
              ← Back to Dashboard
            </button>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-6xl font-black text-white uppercase tracking-tighter">
                  {trip.city?.name || 'Unknown Destination'}
                </h1>
                <p className="text-white/90 text-xl font-medium mt-2">
                  {trip.startDate} — {trip.endDate}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Details Section */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-3xl border border-indigo-200">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Status</h4>
              <span className="px-4 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm inline-block">
                {trip.status === 'VISITED' ? 'Visited' : trip.status === 'TO_BE_VISITED' ? 'Planned' : trip.status}
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border border-amber-200">
              <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Duration</h4>
              <p className="text-2xl font-black text-amber-900">{daysCount} Day{daysCount !== 1 ? 's' : ''}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border border-green-200">
              <h4 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Destination</h4>
              <p className="text-lg font-black text-green-900">{trip.city?.name}</p>
            </div>

            {trip.status === 'VISITED' && trip.rating && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border border-yellow-200">
                <h4 className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-2">Your Rating</h4>
                <p className="text-2xl">{Array(trip.rating).fill('⭐').join('')}</p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Journey Details</h2>
            
            <div className="space-y-6">
              {/* Trip Information Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Departure</h3>
                  <p className="text-lg font-bold text-slate-900">{trip.startDate}</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Return</h3>
                  <p className="text-lg font-bold text-slate-900">{trip.endDate}</p>
                </div>
              </div>

              {/* Personal Remark Section - Only visible if status is VISITED */}
              {trip.status === 'VISITED' && trip.personalRemark && (
                <div className="mt-8 p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl border border-blue-200">
                  <h3 className="text-lg font-black text-blue-900 mb-3">💭 Your Experience</h3>
                  <p className="text-slate-700 leading-relaxed">{trip.personalRemark}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p className="text-sm text-indigo-700">
                  <span className="font-bold">💡 Tip:</span> Click the Edit button to update your trip details, dates, or cover photo anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AddTripModal 
          userId={userId}
          tripToEdit={trip}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}