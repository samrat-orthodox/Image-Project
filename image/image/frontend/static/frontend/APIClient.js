

export const uploadImages = data => {
  const url = '127.0.0.1:8000/api/photo/';
  return APIClient.post(url, data);
};

export const updateImage = (imageId, data) => {
  const url = '127.0.0.1:8000/api/photo/'+imageId+'/';
  return APIClient.put(url, data);
};

export const deleteImageAPI = (imageId, data) => {
  const url = '127.0.0.1:8000/api/photo/'+imageId+'/';
  return APIClient.put(url, data);
};
