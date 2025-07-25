import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

const FinalPreview = ({ onRestart }) => {
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const productInfo = JSON.parse(localStorage.getItem('productInfo') || '{}');
    const approvedImages = productInfo.approvedImages || [];
    const storedDetails = productInfo.details || null;

    setImages(approvedImages);
    setDetails(storedDetails);

    if (approvedImages.length > 0) {
      setMainImage(`${import.meta.env.VITE_API_URL}/uploads/ai/${approvedImages[0].approved}`);
    }
  }, []);

  if (!images.length) {
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Approved Images</h3>
          <p className="text-yellow-700 mb-4">
            You need to approve at least one image to view the final preview.
          </p>
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium"
          >
            Start New Process
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Final Preview</h2>
        <button
          onClick={onRestart}
          className="text-xs px-2 py-2 uppercase bg-sky-500 text-white rounded-full hover:bg-sky-700 font-medium flex items-center gap-2 justify-center"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Images */}
      <div className="flex flex-col md:flex-row items-start gap-6 mt-6">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-hidden">
          {images.map((img, idx) => {
            const folder = img.approved === img.original ? 'original' : 'ai';
            const imagePath = `${import.meta.env.VITE_API_URL}/uploads/${folder}/${img.approved}`;
            console.log(imagePath)

            return (
              <img
                key={idx}
                src={imagePath}
                alt={`Thumb ${idx + 1}`}
                onClick={() => setMainImage(imagePath)}
                className={`
                  w-16 h-20 md:w-24 md:h-28 object-cover rounded-md border cursor-pointer
                  ${mainImage === imagePath ? 'border-sky-600' : 'border-gray-300'}
                `}
              />
            );
          })}
        </div>

        {/* Main Image */}
        <div className="flex-1 border h-[70vh] flex items-center justify-center rounded-md overflow-hidden">
          <img
            src={mainImage}
            alt="Main Preview"
            className="w-full max-h-[600px] object-contain"
          />
        </div>
      </div>

      {/* Product Details */}
      {details && (
        <div className="mt-10 bg-white shadow-md p-6 rounded-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm font-medium text-gray-600 capitalize">{key}</p>
                <p className="text-base text-gray-900">
                  {Array.isArray(value) ? value.join(', ') : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalPreview;
