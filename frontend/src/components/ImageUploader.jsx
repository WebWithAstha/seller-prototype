import { useState } from 'react';
import { uploadImages } from '../utils/api';

const ImageUploader = ({ onComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('auto-detect');

  const categories = [
    { value: 'auto-detect', label: 'Auto Detect' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'home_decor', label: 'Home Decor' },
    { value: 'grocery', label: 'Grocery' }
  ];
  // console.log(901658916)



  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length > 4) {
      console.log('Please select exactly 4 images');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      console.log('Only JPEG, PNG, WebP, BMP, and TIFF files are allowed');
      return;
    }

    setSelectedFiles(files);
    
    // Generate previews
    const newPreviews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target.result;
        if (newPreviews.length === files.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };


  const handleUpload = async () => {
    if (selectedFiles.length !== 4) {
      console.log('Please select exactly 4 images');
      return;
    }
  
    setUploading(true);
  
    try {
      const response = await uploadImages(selectedFiles, category); // 🧠 Pass category here
  
      console.log('Images uploaded:', response.files);
    console.log('Details received:', response.details);
  
      const structuredProduct = {
      images: response.files,     // array of image URLs/paths
      details: response.details,  // JSON object from Gemini
    };

    // Save structured object in localStorage
    localStorage.setItem('productInfo', JSON.stringify(structuredProduct));

      // Reset states
      setSelectedFiles([]);
      setPreviews([]);
      setUploading(false);
  
      alert('Images uploaded successfully!');
      
      // Call onComplete callback to move to next step
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error uploading images:', error.message);
      alert('Image upload failed!');
      setUploading(false);
    }
  };
  
  

  const isReady = selectedFiles.length === 4 && !uploading;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Images
        </h2>
        <p className="text-gray-600">
          Select exactly 4 product images to enhance
        </p>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Product Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          disabled={uploading}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Input */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="images"
            className={`
              flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100
              ${uploading ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP, BMP, TIFF (Max 10MB each)
              </p>
            </div>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Images ({previews.length}/4)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  // onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-rose-600"
                  disabled={uploading}
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {selectedFiles[index]?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={!isReady}
          className={`
            px-6 py-2.5 text-sm rounded-full font-medium text-white transition-colors
            ${isReady
              ? 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2'
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading Images...
            </div>
          ) : (
            'Upload Images'
          )}
        </button>
        
        {selectedFiles.length > 0 && selectedFiles.length !== 4 && (
          <p className="text-sm text-rose-600 mt-2">
            Please select exactly 4 images ({selectedFiles.length}/4 selected)
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;