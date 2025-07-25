import { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ApprovalFlow from './components/ApprovalFlow';
import FinalPreview from './components/FinalPreview';

const App = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Approval, 3: Preview

  // Determine step on mount
  useEffect(() => {
    const productInfo = JSON.parse(localStorage.getItem('productInfo') || '{}');
    const approvals = JSON.parse(localStorage.getItem('imageApprovals') || '{}');

    const hasImages = Array.isArray(productInfo.images) && productInfo.images.length > 0;
    const hasApprovals = Object.keys(approvals).length > 0;

    if (!hasImages) {
      setStep(1);
    } else if (hasImages && !hasApprovals) {
      setStep(2);
    } else {
      setStep(3);
    }
  }, []);

  // Sync flowStep (optional, for debug or resume later)
  useEffect(() => {
    localStorage.setItem('flowStep', String(step));
  }, [step]);

  const handleUploadComplete = () => setStep(2);
  const handleApprovalComplete = () => setStep(3);

  const handleError = (msg) => {
    alert(msg);
    localStorage.clear();
    setStep(1);
  };

  const handleRestart = () => {
    localStorage.clear();
    setStep(1);
  };

  const handleStepClick = (targetStep) => {
    const productInfo = JSON.parse(localStorage.getItem('productInfo') || '{}');
    const approvals = JSON.parse(localStorage.getItem('imageApprovals') || '{}');

    const hasImages = Array.isArray(productInfo.images) && productInfo.images.length > 0;
    const hasApprovals = Object.keys(approvals).length > 0;

    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2 && hasImages) {
      setStep(2);
    } else if (targetStep === 3 && hasImages && hasApprovals) {
      setStep(3);
    }
  };

  const getStepStatus = (stepNumber) => {
    const productInfo = JSON.parse(localStorage.getItem('productInfo') || '{}');
    const approvals = JSON.parse(localStorage.getItem('imageApprovals') || '{}');

    const hasImages = Array.isArray(productInfo.images) && productInfo.images.length > 0;
    const hasApprovals = Object.keys(approvals).length > 0;

    if (stepNumber === 1) {
      return !hasImages ? (step === 1 ? 'current' : 'pending') : 'completed';
    } else if (stepNumber === 2) {
      if (!hasImages) return 'disabled';
      return !hasApprovals ? (step === 2 ? 'current' : 'pending') : 'completed';
    } else if (stepNumber === 3) {
      if (!hasImages || !hasApprovals) return 'disabled';
      return step === 3 ? 'current' : 'pending';
    }

    return 'pending';
  };

  return (
    <>
    <div className="w-full py-2 bg-lime-200 font-bold px-2 text-center text-lime-800 fixed z-[999]">AI Seller Dashboard — No Studio Photos Needed</div>
    <div className="min-h-screen bg-gray-50 py-4 px-6 pt-20 md:pt-14">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-gray-800">Image Enhancement Flow</h1>
          {step > 1 && (
            <button
              onClick={handleRestart}
              className="text-sm px-6 py-2 uppercase bg-rose-500 text-white rounded-full hover:bg-rose-600"
            >
              Restart
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 bg-white flex items-center justify-center border-b border-gray-200 p-6">
          <div className="flex w-max min-w-[50%] items-center gap-4 justify-between">
            {[
              { number: 1, title: 'Upload Images' },
              { number: 2, title: 'Review & Approve' },
              { number: 3, title: 'Final Preview' },
            ].map((stepItem, index) => {
              const status = getStepStatus(stepItem.number);
              const isClickable = status !== 'disabled';

              return (
                <div key={stepItem.number} className="flex items-center justify-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => isClickable && handleStepClick(stepItem.number)}
                      disabled={!isClickable}
                      className={`
                        p-1 aspect-square rounded-full flex items-center justify-center text-sm font-semibold
                        transition-all duration-200
                        ${status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'current'
                          ? 'bg-sky-500 text-white'
                          : status === 'disabled'
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-600 hover:bg-gray-400'}
                      `}
                    >
                      {status === 'completed' ? '✓' : stepItem.number}
                    </button>
                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs font-medium ${
                          status === 'current'
                            ? 'text-sky-600'
                            : status === 'completed'
                            ? 'text-green-600'
                            : status === 'disabled'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {stepItem.title}
                      </div>
                    </div>
                  </div>

                  {index < 2 && (
                    <div
                      className={`flex-1 h-px mx-4 ${
                        ['completed', 'current'].includes(getStepStatus(stepItem.number + 1))
                          ? 'bg-sky-300'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && <ImageUploader onComplete={handleUploadComplete} />}
        {step === 2 && (
          <ApprovalFlow onComplete={handleApprovalComplete} onError={handleError} />
        )}
        {step === 3 && <FinalPreview onRestart={handleRestart} />}
      </div>
    </div>
    </>
  );
};

export default App;
