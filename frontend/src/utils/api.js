import axios from 'axios';

export const uploadImages = async (images, category) => {
  const formData = new FormData();

  // Append all images
  images.forEach((file) => {
    formData.append('images', file); // key must match multer field: `.array('images')`
  });

  // Append category
  formData.append('category', category); // backend uses req.body.category

  // Make the POST request
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  console.log(response)
  console.log(response.data)

  return response.data; // { message, files: [...] } before // now { message, files: [...], details }

};
