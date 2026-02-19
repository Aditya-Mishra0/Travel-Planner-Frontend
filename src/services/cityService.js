import api from "./api";

export const getCities = (cityName) => 
  api.get('/cities/search-api', { 
    params: { name: cityName } 
  });

export const saveCity = (fullName) => api.post('/cities/save', {}, {
  params: { fullName }
});

export const getImageForCity = (cityName) => 
  api.get('/cities/image', { 
    params: { name: cityName } 
  });