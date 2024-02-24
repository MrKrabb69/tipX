"use client"
import { useState } from 'react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Empower Your Favorites with <span className="text-blue-600">tipX</span>
        </h1>
        <p className="mt-3 text-2xl">
          The easiest way to support influencers on Twitter, directly through Chrome.
        </p>
        <button
          className="mt-6 bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowModal(true)}
        >
          Download the Extension
        </button>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Coming Soon!</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  We're working hard to bring you tipX. Stay updated by joining our mailing list.
                </p>
                {/* Include an email input and a submit button here */}
                <button
                  className="mt-3 bg-blue-500 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
