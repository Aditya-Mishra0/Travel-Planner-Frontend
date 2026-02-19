import { use } from "react";
import api from "./api";

export const getTrips = (userId) => api.get(`/trips/user/${userId}`) ;
export const deleteTrip = (userId, tripId) => api.delete(`/trips/user/${userId}/${tripId}`) ;

export const getTripById = async (userId, tripId) => {
    // Since there's no specific endpoint, we fetch all and filter
    const response = await api.get(`/trips/user/${userId}`);
    return response.data.find(t => t.tripId === parseInt(tripId));
};

export const createTrip = async (userId, tripData, imageFile) => {
    const formData = new FormData();

    const tripBlob = new Blob([JSON.stringify(tripData)], {
        type: 'application/json',
    });
    formData.append('trip', tripBlob);

    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await api.post(`/trips/user/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateTrip = async (userId, tripId, tripData, imageFile) => {
    const formData = new FormData();

    const tripBlob = new Blob([JSON.stringify(tripData)], {
        type: 'application/json',
    });
    formData.append('trip', tripBlob);

    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await api.put(`/trips/${tripId}/user/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};