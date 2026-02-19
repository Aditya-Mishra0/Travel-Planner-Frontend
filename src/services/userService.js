import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post('/user/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/user/login', credentials);
  return response.data;
};

export const updateProfile = (id, profileData) => api.put(`/user/${id}`, profileData);

export const logoutUser = () => {
    localStorage.removeItem('userId');
};
