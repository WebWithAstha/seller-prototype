import { useEffect, useState } from 'react';

const ImageApproval = ({ onComplete, onError }) => {
  const [images, setImages] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [details, setDetails] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    // const storedImages = JSON.parse(localStorage.getItem('p')) || [];
    const savedApprovals = JSON.parse(localStorage.getItem('imageApprovals') || '{}');
    const storedInfo = JSON.parse(localStorage.getItem('productInfo')) || {};

    // console.log("storedInfo ki images : ", storedInfo.images);
    if (storedInfo.images) setImages(storedInfo.images);
    setApprovals(savedApprovals);
    if (storedInfo.details) setDetails(storedInfo.details);
  }, []);


  const handleApprovalChange = (id, status) => {
    const updated = { ...approvals, [id]: status };
    setApprovals(updated);
    localStorage.setItem('imageApprovals', JSON.stringify(updated));
  };

  const handleApproveAll = () => {
    const updated = {};
    const approvedList = [];

    images.forEach((img) => {
      const id = img.original;
      updated[id] = true;
      approvedList.push({ original: img.original, approved: img.enhanced });
    });

    setApprovals(updated);
    localStorage.setItem('imageApprovals', JSON.stringify(updated));

    const productInfo = JSON.parse(localStorage.getItem('productInfo')) || {};
    productInfo.approvedImages = approvedList;
    localStorage.setItem('productInfo', JSON.stringify(productInfo));
  };

  const handleFinalizeDetails = () => {
    const productInfo = JSON.parse(localStorage.getItem('productInfo')) || {};
    productInfo.details = details;
    localStorage.setItem('productInfo', JSON.stringify(productInfo));
    alert('Details finalized and saved!');
  };

  const handleProceed = () => {
    const hasApprovedImages = Object.values(approvals).some((v) => v === true);
    if (!hasApprovedImages) {
      if (onError) onError('Please approve at least one image to proceed.');
      return;
    }

    const approvedList = images.map((img) => {
      const id = img.original;
      return {
        original: img.original,
        approved: approvals[id] ? img.enhanced : img.original,
      };
    });

    const productInfo = JSON.parse(localStorage.getItem('productInfo')) || {};
    productInfo.approvedImages = approvedList;
    localStorage.setItem('productInfo', JSON.stringify(productInfo));

    if (onComplete) onComplete();
  };

  const handleClear = () => {
    localStorage.removeItem('uploadedImages');
    localStorage.removeItem('imageApprovals');
    localStorage.removeItem('productInfo');
    setImages([]);
    setApprovals({});
    setDetails(null);
  };


  if (images.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No uploaded images found. Please upload and process first.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Image Approval</h2>
        <div>
          <button
            onClick={handleApproveAll}
            className="text-green-600 underline hover:text-green-800 mr-4"
          >
            Approve All
          </button>
          <button
            onClick={handleClear}
            className="text-rose-600 underline hover:text-rose-800"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img) => {
          const id = img.original;
          return (
            <div key={id} className="bg-white shadow p-4 rounded-md">
              <div className="flex gap-2">
                <div className="w-1/2 bg-zinc-200 p-2 flex items-center justify-center flex-col">
                  <img className="h-54 object-contain" src={`${import.meta.env.VITE_API_URL}/uploads/original/${img.original}`} alt="Original" />
                  <p className="text-sm text-center mt-1">Original</p>
                </div>
                <div className="w-1/2 bg-zinc-200 p-2 flex items-center justify-center flex-col">
                  <img className="h-54 object-contain" src={`${import.meta.env.VITE_API_URL}/uploads/ai/${img.enhanced}`} alt="Enhanced" />
                  <p className="text-sm text-center mt-1">Enhanced</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-medium mb-1">Approval</label>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name={`approval-${id}`}
                      checked={approvals[id] === true}
                      onChange={() => handleApprovalChange(id, true)}
                    />
                    <span className="ml-2 text-green-700">Approve</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`approval-${id}`}
                      checked={approvals[id] === false}
                      onChange={() => handleApprovalChange(id, false)}
                    />
                    <span className="ml-2 text-rose-700">Reject</span>
                  </label>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Category: <strong>{img.category}</strong> | Processed in: <strong>{img.processingTime}s</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editable Details Form */}
      {details && (
        <div className="mt-10 bg-white p-6 rounded-md shadow">
          <h3 className="text-xl font-semibold mb-4">Product Details (Edit if needed)</h3>
          {Object.keys(details).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
              {Array.isArray(details[key]) ? (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={details[key].join(', ')}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      [key]: e.target.value.split(',').map((item) => item.trim()),
                    })
                  }
                />
              ) : (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={details[key]}
                  onChange={(e) =>
                    setDetails({ ...details, [key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}

          <button
            onClick={handleFinalizeDetails}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Finalize Details
          </button>
        </div>
      )}

      {/* Proceed Button */}
      {Object.keys(approvals).length > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={handleProceed}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-700 font-medium"
          >
            Proceed to Final Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageApproval;
