import { useState, useEffect } from 'react';
import { getTrips, deleteTrip } from '../../services/tripsService';
import TripCard from './components/TripCard';
import AddTripModal from './components/AddTripModal'; // Ensure this path is correct
import { showError, showSuccess } from '../../utils/notifications';

export default function TripDashboard({ userId, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null); // Holds trip data when editing

  useEffect(() => {
    fetchTrips();
  }, [userId]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await getTrips(userId);
      setTrips(response.data || []);
      console.log('Trips loaded:', response.data); // Debug log
    } catch (err) {
      console.error("Failed to load trips", err);
      showError("Failed to load your trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(userId, tripId);
        setTrips(trips.filter(t => t.tripId !== tripId));
        showSuccess("Trip deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        showError("Failed to delete trip. Please try again.");
      }
    }
  };

  const handleEdit = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null); // Reset after closing
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">MY JOURNEYS</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            + Plan New Trip
          </button>
          <button 
            onClick={onLogout}
            className="text-slate-400 font-bold hover:text-rose-600 transition-all px-4"
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32 space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Adventures...</p>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => (
            <TripCard 
              key={trip.tripId} 
              trip={trip} 
              onDelete={() => handleDelete(trip.tripId)}
              onEdit={() => handleEdit(trip)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 mb-6 font-bold uppercase tracking-widest text-sm">No trips planned yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 font-black text-lg hover:text-indigo-800 underline underline-offset-8"
          >
            Start by adding your first destination!
          </button>
        </div>
      )}

      {/* The Modal for both Adding and Editing */}
      {isModalOpen && (
        <AddTripModal 
          userId={userId}
          tripToEdit={selectedTrip} 
          onClose={handleCloseModal}
          onSuccess={() => {
            fetchTrips();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}