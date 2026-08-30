/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Client Details Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">{client.name}</h2>
          <p className="text-gray-500">Client Details</p>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Number</label>
              <p className="text-lg font-semibold text-gray-800">{client.phoneNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Location</label>
              <p className="text-lg font-semibold text-gray-800">{client.place}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">District</label>
              <p className="text-lg font-semibold text-gray-800">{client.district}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Created At</label>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Comments</label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-700">
                {client.comments || 'No additional comments'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;