import React from 'react';

const HeroBanner: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl overflow-hidden shadow-lg">
        <div className="p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Welcome to the Library Management</h2>
          <p className="text-sm md:text-base opacity-90">Experience the easiest way to borrow, return and track books across campus with digital verification and real-time updates.</p>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
