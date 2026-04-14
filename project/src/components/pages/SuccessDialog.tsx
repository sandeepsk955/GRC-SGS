// src/components/common/SuccessDialog.tsx
import React from 'react';

interface SuccessDialogProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  title = 'Success',
  message,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{title}</h4>
        <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>

        <div className="flex justify-end gap-2 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};