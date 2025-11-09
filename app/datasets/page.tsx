'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { useBuyDataset } from '@/app/hooks/useBuyDataset';
import { useDataAccess } from '@/app/hooks/useDataAccess';

interface Dataset {
  id: string;
  name: string;
  description: string;
  priceETH: string;
  priceUSDC: string;
  category: string;
  size: string;
  lastUpdated: string;
  ipfsHash: string;
  seller: string;
  downloads: number;
  rating: number;
}

const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Global Climate Data 2024',
    description: 'Comprehensive climate measurements from weather stations worldwide, including temperature, humidity, and precipitation data.',
    priceETH: '0.5',
    priceUSDC: '1250',
    category: 'Environmental',
    size: '2.3 GB',
    lastUpdated: '2024-01-15',
    ipfsHash: 'QmYx8K3BnNjpGhJ2fR4vL9mX5sT7uE1wP6qA3nB8dC9fG2h',
    seller: '0x1234...5678',
    downloads: 142,
    rating: 4.8
  },
  {
    id: '2',
    name: 'E-commerce User Behavior',
    description: 'Anonymized user interaction data from major e-commerce platforms, perfect for ML training and behavior analysis.',
    priceETH: '1.2',
    priceUSDC: '3000',
    category: 'Business',
    size: '5.7 GB',
    lastUpdated: '2024-01-10',
    ipfsHash: 'QmZx9K4BnNjpGhJ3fR5vL0mX6sT8uE2wP7qA4nB9dC0fG3h',
    seller: '0x2345...6789',
    downloads: 89,
    rating: 4.6
  },
  {
    id: '3',
    name: 'Medical Research Dataset',
    description: 'De-identified patient data for cardiovascular research, including diagnostic imaging and treatment outcomes.',
    priceETH: '2.0',
    priceUSDC: '5000',
    category: 'Healthcare',
    size: '12.1 GB',
    lastUpdated: '2024-01-08',
    ipfsHash: 'QmAx7K5BnNjpGhJ4fR6vL1mX7sT9uE3wP8qA5nB0dC1fG4h',
    seller: '0x3456...7890',
    downloads: 45,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Financial Market Indicators',
    description: 'Real-time financial data including stock prices, trading volumes, and market sentiment indicators.',
    priceETH: '0.8',
    priceUSDC: '2000',
    category: 'Finance',
    size: '800 MB',
    lastUpdated: '2024-01-20',
    ipfsHash: 'QmBx6K6BnNjpGhJ5fR7vL2mX8sT0uE4wP9qA6nB1dC2fG5h',
    seller: '0x4567...8901',
    downloads: 203,
    rating: 4.7
  }
];

export default function MyDatasets() {
  const { purchasedDatasets } = useBuyDataset();
  const { accessData, downloadDataset, hasAccess, getRemainingDownloads, error } = useDataAccess();
  const [notification, setNotification] = useState<string | null>(null);

  const purchasedDatasetObjects = mockDatasets.filter(dataset =>
    purchasedDatasets.includes(dataset.id)
  );

  const handleDownload = async (datasetId: string) => {
    const success = await downloadDataset(datasetId);
    if (success) {
      setNotification('Download started successfully!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Environmental: 'from-green-500 to-emerald-500',
      Business: 'from-blue-500 to-cyan-500',
      Healthcare: 'from-red-500 to-pink-500',
      Finance: 'from-yellow-500 to-orange-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (purchasedDatasetObjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Datasets Yet</h2>
            <p className="text-gray-400 mb-8">You haven&apos;t purchased any datasets yet. Browse the marketplace to find valuable data.</p>
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-block"
            >
              Browse Datasets
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Datasets</h1>
          <p className="text-gray-400">Access and download your purchased datasets</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Dataset Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedDatasetObjects.map((dataset) => {
            const access = accessData.find(a => a.datasetId === dataset.id);
            const remainingDownloads = getRemainingDownloads(dataset.id);

            return (
              <div
                key={dataset.id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
              >
                <div className={`h-32 bg-gradient-to-r ${getCategoryColor(dataset.category)} relative`}>
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                      {dataset.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      ✓ Owned
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 text-white text-sm">
                    {dataset.size}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                    {dataset.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {dataset.description}
                  </p>

                  {access && (
                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Downloads:</span>
                          <span className="text-white ml-2">{access.downloadCount}</span>
                        </div>
                        {remainingDownloads !== null && (
                          <div>
                            <span className="text-gray-400">Remaining:</span>
                            <span className="text-white ml-2">{remainingDownloads}</span>
                          </div>
                        )}
                        {access.expiresAt && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Expires:</span>
                            <span className="text-white ml-2">{formatDate(access.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(dataset.id)}
                      disabled={!hasAccess(dataset.id) || (remainingDownloads !== null && remainingDownloads <= 0)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => window.open(`https://ipfs.io/ipfs/${dataset.ipfsHash}`, '_blank')}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="View on IPFS"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Notification */}
        {notification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{notification}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}