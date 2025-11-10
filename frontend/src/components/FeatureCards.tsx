import React from 'react';

const features = [
  { title: 'Real-time Tracking', desc: 'Track the availability and location of books in real-time across all library branches', icon: '📍' },
  { title: 'Personalized Recommendations', desc: 'Get book suggestions tailored to your reading history and preferences.', icon: '✨' },
  { title: 'Fast Issue & Return', desc: 'Quick and seamless book borrowing and returning process with digital verification.', icon: '⚡' }
];

const FeatureCards: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
            <h4 className="font-semibold text-gray-800 mb-2">{f.title}</h4>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
