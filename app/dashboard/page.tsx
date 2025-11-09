'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import { useBuyDataset } from '@/app/hooks/useBuyDataset';
import { useDataAccess } from '@/app/hooks/useDataAccess';
import { useAccount } from 'wagmi';
import lighthouse from '@lighthouse-web3/sdk';
import { ethers } from 'ethers';

interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string;
  timestamp: string;
  cid: string;
  seller: string;
  downloads: number;
  oydCost: number; // Cost in OYD datacoins (1KB = 1 OYD)
  uploadedBy: string;
}

interface UploadedDataset {
  id: string;
  companyName?: string;
  company_name?: string;
  dataDescription?: string;
  data_description?: string;
  category: string;
  fileSize?: number;
  file_size?: number;
  timestamp: string;
  cid: string;
  uploaderAddress?: string;
  uploader_address?: string;
  uploadedBy?: string;
  uploaded_by?: string;
  downloads: number;
  oydCost?: number;
  oyd_cost?: number;
}

// Categories for the marketplace
const categories = [
  {
    id: 'supermart',
    name: 'Supermart',
    description: 'Consumer behavior data from major supermarket chains',
    companies: ['Flipkart', 'Amazon']
  },
  {
    id: 'groceries',
    name: 'Groceries and Food',
    description: 'Food delivery and grocery shopping patterns',
    companies: ['Zepto', 'Blinkit', 'Swiggy', 'Zomato']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Healthcare and medicine purchase behavior',
    companies: ['1mg']
  },
  {
    id: 'apparels',
    name: 'Apparels',
    description: 'Fashion and clothing shopping trends',
    companies: ['Myntra', 'Ajio']
  }
];

// Company datasets organized by category
const companyDatasets: { [key: string]: Dataset[] } = {
  supermart: [
    {
      id: 'flipkart-1',
      name: 'Flipkart',
      description: 'Consumer purchase patterns, product preferences, and seasonal shopping trends from Flipkart marketplace.',
      category: 'Supermart',
      size: '2.5 GB',
      timestamp: '2024-01-20T10:30:00Z',
      cid: 'QmFlipkart1BnNjpGhJ2fR4vL9mX5sT7uE1wP6qA3nB8dC9fG2h',
      seller: '0xFlip...kart',
      downloads: 156,
      oydCost: 2621440, // 2.5 GB = ~2,621,440 KB = 2,621,440 OYD
      uploadedBy: '0xFlip...kart'
    },
    {
      id: 'amazon-1',
      name: 'Amazon',
      description: 'Comprehensive shopping behavior data including cart abandonment, product reviews, and purchase history.',
      category: 'Supermart',
      size: '4.2 GB',
      timestamp: '2024-01-18T14:45:00Z',
      cid: 'QmAmazon1BnNjpGhJ3fR5vL0mX6sT8uE2wP7qA4nB9dC0fG3h',
      seller: '0xAmaz...ozon',
      downloads: 203,
      oydCost: 4404019, // 4.2 GB = ~4,404,019 KB = 4,404,019 OYD
      uploadedBy: '0xAmaz...ozon'
    }
  ],
  groceries: [
    {
      id: 'zepto-1',
      name: 'Zepto',
      description: 'Quick commerce data with delivery preferences, time-based ordering patterns, and product demand.',
      category: 'Groceries and Food',
      size: '1.8 GB',
      timestamp: '2024-01-22T09:15:00Z',
      cid: 'QmZepto1BnNjpGhJ4fR6vL1mX7sT9uE3wP8qA5nB0dC1fG4h',
      seller: '0xZept...opto',
      downloads: 89,
      oydCost: 1887437, // 1.8 GB = ~1,887,437 KB = 1,887,437 OYD
      uploadedBy: '0xZept...opto'
    },
    {
      id: 'blinkit-1',
      name: 'Blinkit',
      description: 'Instant grocery delivery patterns, peak hour analysis, and customer retention data.',
      category: 'Groceries and Food',
      size: '1.5 GB',
      timestamp: '2024-01-21T16:20:00Z',
      cid: 'QmBlinkit1BnNjpGhJ5fR7vL2mX8sT0uE4wP9qA6nB1dC2fG5h',
      seller: '0xBlin...nkit',
      downloads: 67,
      oydCost: 1572864, // 1.5 GB = ~1,572,864 KB = 1,572,864 OYD
      uploadedBy: '0xBlin...nkit'
    },
    {
      id: 'swiggy-1',
      name: 'Swiggy',
      description: 'Food delivery preferences, restaurant ratings impact, and order timing patterns.',
      category: 'Groceries and Food',
      size: '3.1 GB',
      timestamp: '2024-01-19T12:30:00Z',
      cid: 'QmSwiggy1BnNjpGhJ6fR8vL3mX9sT1uE5wP0qA7nB2dC3fG6h',
      seller: '0xSwig...iggy',
      downloads: 134,
      oydCost: 3251159, // 3.1 GB = ~3,251,159 KB = 3,251,159 OYD
      uploadedBy: '0xSwig...iggy'
    },
    {
      id: 'zomato-1',
      name: 'Zomato',
      description: 'Restaurant discovery patterns, user reviews analysis, and dining preferences data.',
      category: 'Groceries and Food',
      size: '2.7 GB',
      timestamp: '2024-01-17T11:45:00Z',
      cid: 'QmZomato1BnNjpGhJ7fR9vL4mX0sT2uE6wP1qA8nB3dC4fG7h',
      seller: '0xZoma...mato',
      downloads: 98,
      oydCost: 2831155, // 2.7 GB = ~2,831,155 KB = 2,831,155 OYD
      uploadedBy: '0xZoma...mato'
    }
  ],
  pharmacy: [
    {
      id: '1mg-1',
      name: '1mg',
      description: 'Healthcare product purchase behavior, prescription patterns, and wellness product preferences.',
      category: 'Pharmacy',
      size: '900 MB',
      timestamp: '2024-01-23T08:00:00Z',
      cid: 'Qm1mg1BnNjpGhJ8fR0vL5mX1sT3uE7wP2qA9nB4dC5fG8h',
      seller: '0x1mg1...mg11',
      downloads: 45,
      oydCost: 921600, // 900 MB = ~921,600 KB = 921,600 OYD
      uploadedBy: '0x1mg1...mg11'
    }
  ],
  apparels: [
    {
      id: 'myntra-1',
      name: 'Myntra',
      description: 'Fashion trends, seasonal clothing preferences, brand loyalty, and size-based purchase patterns.',
      category: 'Apparels',
      size: '2.1 GB',
      timestamp: '2024-01-16T15:30:00Z',
      cid: 'QmMyntra1BnNjpGhJ9fR1vL6mX2sT4uE8wP3qA0nB5dC6fG9h',
      seller: '0xMynt...ntra',
      downloads: 112,
      oydCost: 2202010, // 2.1 GB = ~2,202,010 KB = 2,202,010 OYD
      uploadedBy: '0xMynt...ntra'
    },
    {
      id: 'ajio-1',
      name: 'Ajio',
      description: 'Youth fashion preferences, discount sensitivity analysis, and social media influenced purchases.',
      category: 'Apparels',
      size: '1.6 GB',
      timestamp: '2024-01-15T13:15:00Z',
      cid: 'QmAjio1BnNjpGhJ0fR2vL7mX3sT5uE9wP4qA1nB6dC7fG0h',
      seller: '0xAjio...jio1',
      downloads: 78,
      oydCost: 1677722, // 1.6 GB = ~1,677,722 KB = 1,677,722 OYD
      uploadedBy: '0xAjio...jio1'
    }
  ]
};

export default function Dashboard() {
  const { address } = useAccount();
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<{
    show: boolean;
    type: 'download' | 'request';
  }>({ show: false, type: 'download' });
  const [uploadedDatasets, setUploadedDatasets] = useState<UploadedDataset[]>([]);
  const [datasetAccess, setDatasetAccess] = useState<{ [key: string]: boolean }>({});
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState<{ [key: string]: boolean }>({});
  const [authCache, setAuthCache] = useState<{ [address: string]: { signedMessage: string; publicKey: string; timestamp: number } }>({});
  const [purchaseModal, setPurchaseModal] = useState<{
    show: boolean;
    dataset: Dataset | null;
    isProcessing: boolean;
    error: string | null;
  }>({
    show: false,
    dataset: null,
    isProcessing: false,
    error: null
  });
  const { buyDataset, isLoading, error } = useBuyDataset();
  const { generateAccess } = useDataAccess();

  // Fetch uploaded datasets
  const fetchUploadedDatasets = async () => {
    try {
      const response = await fetch('/api/datasets');
      const data = await response.json();
      if (data.success) {
        setUploadedDatasets(data.datasets);
      }
    } catch (error) {
      console.error('Failed to fetch uploaded datasets:', error);
    }
  };

  useEffect(() => {
    fetchUploadedDatasets();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchUploadedDatasets, 30000);
    
    // Listen for access granted events
    const handleAccessGranted = (event: CustomEvent) => {
      const { requesterAddress } = event.detail;
      if (requesterAddress === address) {
        // Clear access cache so user can manually refresh if needed
        setDatasetAccess({});
      }
    };

    window.addEventListener('accessGranted', handleAccessGranted as EventListener);
    
    return () => {
      clearInterval(interval);
    };
  }, [address]);

  // Note: Removed automatic access checking to prevent background wallet signing
  // Access is now only checked when user manually clicks "Refresh Access" button

  // Clear access cache when wallet address changes
  useEffect(() => {
    setDatasetAccess({}); // Clear previous access data
    setRequestingAccess({}); // Clear previous request states
    setCheckingAccess(false); // Stop any ongoing checks
  }, [address]);

  // Get datasets - prioritize real data over mock data
  const getAllDatasets = useCallback(() => {
    const allDatasets: { [key: string]: Dataset[] } = {};
    
    // Initialize empty arrays for all categories
    categories.forEach(category => {
      allDatasets[category.id] = [];
    });
    
    // Add uploaded datasets to their respective categories
    uploadedDatasets.forEach(dataset => {
      // Handle both old format (UploadedDataset) and new format (DatabaseDataset)
      const categoryKey = dataset.category;
      if (!allDatasets[categoryKey]) {
        allDatasets[categoryKey] = [];
      }
      
      // Convert uploaded dataset to match our Dataset interface
      const formattedDataset: Dataset = {
        id: dataset.id,
        name: dataset.companyName || dataset.company_name || 'Unknown Company',
        description: dataset.dataDescription || dataset.data_description || 'No description available',
        category: categories.find(cat => cat.id === dataset.category)?.name || dataset.category,
        size: dataset.fileSize ? formatFileSize(dataset.fileSize) : formatFileSize(dataset.file_size || 0),
        timestamp: dataset.timestamp,
        cid: dataset.cid,
        seller: dataset.uploaderAddress || dataset.uploader_address || 'Unknown',
        downloads: dataset.downloads || 0,
        oydCost: dataset.oydCost || dataset.oyd_cost || 0,
        uploadedBy: dataset.uploadedBy || dataset.uploaded_by || 'Unknown'
      };
      
      allDatasets[categoryKey].push(formattedDataset);
    });
    
    // Remove duplicates based on ID
    Object.keys(allDatasets).forEach(categoryKey => {
      const seen = new Set();
      allDatasets[categoryKey] = allDatasets[categoryKey].filter(dataset => {
        if (seen.has(dataset.id)) {
          return false;
        }
        seen.add(dataset.id);
        return true;
      });
    });
    
    // If no real data exists, show mock data for demo purposes
    if (uploadedDatasets.length === 0) {
      Object.keys(companyDatasets).forEach(categoryKey => {
        if (companyDatasets[categoryKey]) {
          allDatasets[categoryKey] = [...companyDatasets[categoryKey]];
        }
      });
    }

    return allDatasets;
  }, [uploadedDatasets]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Encryption signature for decryption
  const encryptionSignature = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask!');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAddress = await signer.getAddress();
    
    // Check if we have a cached signature for this address (valid for 4 hours)
    const cached = authCache[currentAddress];
    const fourHours = 4 * 60 * 60 * 1000;
    
    if (cached && (Date.now() - cached.timestamp) < fourHours) {
      return {
        signedMessage: cached.signedMessage,
        publicKey: cached.publicKey
      };
    }
    
    // Get new signature if no cache or expired
    const messageRequested = (await lighthouse.getAuthMessage(currentAddress)).data.message;
    const signedMessage = await signer.signMessage(messageRequested || '');
    
    // Cache the signature
    setAuthCache(prev => ({
      ...prev,
      [currentAddress]: {
        signedMessage,
        publicKey: currentAddress,
        timestamp: Date.now()
      }
    }));
    
    return {
      signedMessage: signedMessage,
      publicKey: currentAddress
    };
  }, [authCache]);

  // Show purchase confirmation modal (only for downloads)
  const showDownloadModal = (dataset: Dataset) => {
    setPurchaseModal({
      show: true,
      dataset,
      isProcessing: false,
      error: null
    });
  };

  // Handle buy request (create data request)
  const handleBuyRequest = async (dataset: Dataset) => {
    // Prevent users from requesting access to their own data
    if (dataset.uploadedBy === address) {
      alert('You cannot request access to your own dataset. You already have full access.');
      return;
    }

    setRequestingAccess(prev => ({ ...prev, [dataset.id]: true }));
    
    try {
      const requestPayload = {
        datasetId: dataset.id,
        datasetName: dataset.name,
        datasetDescription: dataset.description,
        cid: dataset.cid,
        requesterAddress: address!,
        uploaderAddress: dataset.uploadedBy,
        category: dataset.category,
        size: dataset.size,
        oydCost: dataset.oydCost
      };

      console.log('Sending data request:', requestPayload);
      
      const response = await fetch('/api/data-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to create data request: ${responseData.error || 'Unknown error'}`);
      }

      // Show request sent message
      setShowSuccess({ show: true, type: 'request' });
      setTimeout(() => {
        setShowSuccess({ show: false, type: 'request' });
      }, 3000);

    } catch (error) {
      console.error('Buy request error:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setRequestingAccess(prev => ({ ...prev, [dataset.id]: false }));
    }
  };

  // Handle try download - checks access first, then downloads or shows buy option
  const handleTryDownload = async (dataset: Dataset) => {
    try {
      // Check if user has access to this specific dataset
      const hasAccess = await checkDataAccess(dataset.cid);
      
      // Update the access state for this dataset
      setDatasetAccess(prev => ({ ...prev, [dataset.id]: hasAccess }));
      
      if (hasAccess) {
        // User has access, proceed to download
        showDownloadModal(dataset);
      } else {
        // User doesn't have access, they can request it
        // The button will automatically change to "Buy" due to state update
      }
    } catch (error) {
      console.error('Access check failed:', error);
      // On error, assume no access
      setDatasetAccess(prev => ({ ...prev, [dataset.id]: false }));
    }
  };

  // Handle direct download (only called when user has access)
  const handlePurchaseAndDownload = async (dataset: Dataset) => {
    setPurchaseModal(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      await handleDirectDownload(dataset);
    } catch (error) {
      console.error('Download error:', error);
      setPurchaseModal(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to download file'
      }));
    }
  };

  // Direct download function
  const handleDirectDownload = async (dataset: Dataset) => {
    const cid = dataset.cid;
    const { publicKey, signedMessage } = await encryptionSignature();
    
    // Fetch encryption key
    const keyObject = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );

    // Decrypt file
    let decrypted;
    let fileName = `${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}-${dataset.id}`;
    
    try {
      decrypted = await lighthouse.decryptFile(cid, keyObject.data.key || '');
      
      // Try to determine file type from content
      const text = await decrypted.text();
      try {
        JSON.parse(text);
        fileName += '.json';
      } catch {
        fileName += '.txt';
      }
      
      // Recreate blob with detected type
      decrypted = new Blob([text], { type: fileName.endsWith('.json') ? 'application/json' : 'text/plain' });
      
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt file. Please check your access permissions.');
    }
    
    // Create download link and trigger download
    const url = URL.createObjectURL(decrypted);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    // Close modal and show success
    setPurchaseModal({ show: false, dataset: null, isProcessing: false, error: null });
    setShowSuccess({ show: true, type: 'download' });
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess({ show: false, type: 'download' });
    }, 3000);
  };

  // Check if user has access to data
  const checkDataAccess = useCallback(async (cid: string): Promise<boolean> => {
    try {
      const { publicKey, signedMessage } = await encryptionSignature();
      
      // Method 1: Check access conditions first
      try {
        const accessConditions = await lighthouse.getAccessConditions(cid);
        console.log('Access conditions for CID', cid, ':', accessConditions);
        
        // Check if current user is in the sharedTo list or is the owner
        if (accessConditions.data) {
          const { sharedTo, owner } = accessConditions.data;
          const currentAddress = publicKey.toLowerCase();
          
          // User is owner
          if (owner && owner.toLowerCase() === currentAddress) {
            console.log('User is owner of', cid);
            return true;
          }
          
          // User is in shared list
          if (sharedTo && Array.isArray(sharedTo)) {
            const hasAccess = sharedTo.some(addr => addr.toLowerCase() === currentAddress);
            if (hasAccess) {
              console.log('User has shared access to', cid);
              return true;
            }
          }
        }
      } catch (conditionError) {
        console.log('Could not get access conditions, trying direct key fetch:', conditionError);
      }
      
      // Method 2: Try to fetch encryption key - if successful, user has access
      await lighthouse.fetchEncryptionKey(cid, publicKey, signedMessage);
      console.log('User can fetch encryption key for', cid);
      return true;
    } catch (error) {
      console.log('No access to', cid, ':', error);
      return false;
    }
  }, [encryptionSignature]);

  // Check access for all datasets (optimized)
  const checkAllDatasetAccess = useCallback(async () => {
    if (!address) return;
    
    setCheckingAccess(true);
    const allDatasets = getAllDatasets();
    const accessChecks: { [key: string]: boolean } = { ...datasetAccess }; // Start with existing checks

    for (const categoryKey of Object.keys(allDatasets)) {
      for (const dataset of allDatasets[categoryKey]) {
        // Skip if already checked and cached
        if (accessChecks[dataset.id] !== undefined) {
          continue;
        }

        // Owner always has access - no need to check
        if (dataset.uploadedBy === address) {
          accessChecks[dataset.id] = true;
          continue;
        }

        // Only check access for external datasets we haven't checked
        try {
          const hasAccess = await checkDataAccess(dataset.cid);
          accessChecks[dataset.id] = hasAccess;
        } catch {
          accessChecks[dataset.id] = false;
        }
      }
    }

    setDatasetAccess(accessChecks);
    setCheckingAccess(false);
  }, [address, getAllDatasets, checkDataAccess, datasetAccess]);

  // Check access for all datasets when data changes
  useEffect(() => {
    if (address && uploadedDatasets.length > 0) {
      checkAllDatasetAccess();
    }
  }, [address, uploadedDatasets, checkAllDatasetAccess]);

  // Listen for access granted events
  useEffect(() => {
    const handleAccessGranted = (event: CustomEvent) => {
      const { requesterAddress } = event.detail;
      if (requesterAddress === address) {
        // Refresh access status for this user
        checkAllDatasetAccess();
      }
    };

    window.addEventListener('accessGranted', handleAccessGranted as EventListener);

    return () => {
      window.removeEventListener('accessGranted', handleAccessGranted as EventListener);
    };
  }, [address, checkAllDatasetAccess]);

  const handleBuyDataset = async (dataset: Dataset) => {
    // For now, we'll use ETH as the currency type since the hook expects it
    // In a real implementation, you'd update the hook to support OYD
    const success = await buyDataset(dataset.id, dataset.oydCost.toString(), 'ETH');

    if (success) {
      await generateAccess(dataset.id, dataset.cid);
      setSelectedDataset(null);
      setShowSuccess({ show: true, type: 'download' });
      setTimeout(() => setShowSuccess({ show: false, type: 'download' }), 5000);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Supermart: 'from-blue-500 to-indigo-500',
      'Groceries and Food': 'from-emerald-500 to-green-500',
      Pharmacy: 'from-rose-500 to-pink-500',
      Apparels: 'from-purple-500 to-violet-500'
    };
    return colors[category as keyof typeof colors] || 'from-slate-500 to-slate-600';
  };

  // const getCategoryBadgeColor = (category: string) => {
  //   const colors = {
  //     Supermart: 'bg-blue-100 text-blue-700 border-blue-200',
  //     'Groceries and Food': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  //     Pharmacy: 'bg-rose-100 text-rose-700 border-rose-200',
  //     Apparels: 'bg-purple-100 text-purple-700 border-purple-200'
  //   };
  //   return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
  // };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Ecommerce Consumer Behaviour</h1>
              <p className="text-slate-600">
                {selectedCategory 
                  ? `Browse ${selectedCategory} datasets from leading companies`
                  : 'Discover consumer behavior datasets from top ecommerce platforms'
                }
              </p>
              {uploadedDatasets.length > 0 && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Showing {uploadedDatasets.length} real dataset{uploadedDatasets.length !== 1 ? 's' : ''}
                </div>
              )}
              {uploadedDatasets.length === 0 && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Showing demo data (upload a dataset to see real data)
                </div>
              )}
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                Click &quot;Try Download&quot; to check access or &quot;Refresh Access&quot; to check all
              </div>
            </div>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchUploadedDatasets}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Refresh Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setDatasetAccess({}); // Clear cache to force recheck
                      checkAllDatasetAccess();
                    }}
                    disabled={checkingAccess}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingAccess ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span>Refresh Access</span>
                      </>
                    )}
                  </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  ← Back to Categories
                </button>
              )}
              <div className="bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500">
                  {selectedCategory ? 'Companies' : 'Categories'}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {selectedCategory 
                    ? Array.from(new Set(getAllDatasets()[selectedCategory]?.map(dataset => dataset.name) || [])).length
                    : categories.length
                  }
                </div>
              </div>
              {selectedCategory && (
                <div className="bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500">Total Datasets</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {getAllDatasets()[selectedCategory]?.length || 0}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category or Company Grid */}
        {!selectedCategory ? (
          // Show Categories
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className={`h-24 bg-gradient-to-r ${getCategoryColor(category.name)} relative`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <h3 className="text-lg font-bold">{category.name}</h3>
          </div>
                  <div className="absolute top-3 right-4 text-white text-sm bg-black/20 px-2 py-1 rounded">
                    {category.companies.length} companies
        </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.companies.map((company, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show Companies in Selected Category with Individual Tables
          <div className="space-y-8">
            {/* Get unique companies in the selected category */}
            {Array.from(new Set(getAllDatasets()[selectedCategory]?.map(dataset => dataset.name) || [])).map((companyName) => {
              const companyData = getAllDatasets()[selectedCategory]?.filter(dataset => dataset.name === companyName) || [];
              
              return (
                <div key={companyName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Company Header */}
                  <div className={`bg-gradient-to-r ${getCategoryColor(companyData[0]?.category || '')} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{companyName}</h3>
                        <p className="text-white/80 text-sm">{companyData.length} dataset{companyData.length !== 1 ? 's' : ''} available</p>
                </div>
                      <div className="text-white/80 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/30 bg-white/10`}>
                          {companyData[0]?.category}
                        </span>
                    </div>
                    </div>
                  </div>

                  {/* Company Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Data Name</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Description</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Timestamp</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Size</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">CID</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Downloads</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Cost (OYD)</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Uploaded By</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Seller</th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {companyData.map((dataset) => (
                          <tr key={dataset.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-900 text-sm">{dataset.name}</div>
                            </td>
                            <td className="py-4 px-6 max-w-xs">
                              <div className="text-sm text-slate-600 line-clamp-2" title={dataset.description}>
                                {dataset.description}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-700 whitespace-nowrap">
                              {formatTimestamp(dataset.timestamp)}
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                              {dataset.size}
                            </td>
                            <td className="py-4 px-6 text-xs font-mono text-slate-700">
                              <div className="flex items-center space-x-2">
                                <span>{dataset.cid.slice(0, 12)}...</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(dataset.cid)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Copy full CID"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                  </svg>
                                </button>
                    </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-700">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                                </svg>
                                <span>{dataset.downloads}</span>
                  </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-bold text-blue-600">{dataset.oydCost}</span>
                                <span className="text-xs text-slate-500">OYD</span>
                </div>
                            </td>
                            <td className="py-4 px-6 text-xs font-mono text-slate-600">
                              {dataset.uploadedBy.length > 10 ? 
                                `${dataset.uploadedBy.slice(0, 6)}...${dataset.uploadedBy.slice(-4)}` : 
                                dataset.uploadedBy
                              }
                            </td>
                            <td className="py-4 px-6 text-xs font-mono text-slate-600">
                              {dataset.seller}
                            </td>
                            <td className="py-4 px-6">
                              {/* Show different buttons based on ownership */}
                              {dataset.uploadedBy === address ? (
                                // Owner can always download
                                <button
                                  onClick={() => showDownloadModal(dataset)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Download
                                </button>
                              ) : datasetAccess[dataset.id] === true ? (
                                // Non-owner with confirmed access can download
                                <button
                                  onClick={() => showDownloadModal(dataset)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Download
                                </button>
                              ) : datasetAccess[dataset.id] === false ? (
                                // Non-owner with confirmed no access can request
                                <button
                                  onClick={() => handleBuyRequest(dataset)}
                                  disabled={requestingAccess[dataset.id]}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {requestingAccess[dataset.id] ? (
                                    <div className="flex items-center">
                                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                                      Requesting...
                  </div>
                ) : (
                                    'Buy'
                                  )}
                                </button>
                              ) : (
                                // Unknown access status - show try download button
                  <button
                                  onClick={() => handleTryDownload(dataset)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                                  Try Download
                  </button>
                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Company Summary Footer */}
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div>
                        Total Datasets: <span className="font-semibold text-slate-900">{companyData.length}</span>
                      </div>
                      <div>
                        Total Downloads: <span className="font-semibold text-slate-900">
                          {companyData.reduce((sum, dataset) => sum + dataset.downloads, 0)}
                        </span>
                      </div>
                      <div>
                        Total Size: <span className="font-semibold text-slate-900">
                          {(() => {
                            const totalMB = companyData.reduce((sum, dataset) => {
                              const sizeInMB = parseFloat(dataset.size.replace(/[^\d.]/g, '')) * 
                                (dataset.size.includes('GB') ? 1024 : 1);
                              return sum + sizeInMB;
                            }, 0);
                            return totalMB > 1024 ? `${(totalMB / 1024).toFixed(1)} GB` : `${totalMB.toFixed(0)} MB`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* No data message */}
            {(!getAllDatasets()[selectedCategory] || getAllDatasets()[selectedCategory].length === 0) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-center py-16">
                  <div className="text-slate-500 text-xl mb-2">No datasets available</div>
                  <div className="text-slate-400 text-sm">Companies in this category haven&apos;t uploaded any datasets yet</div>
                </div>
              </div>
            )}
            </div>
        )}

        {/* Purchase Modal */}
        {selectedDataset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Purchase Dataset</h3>
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{selectedDataset.name}</h4>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{selectedDataset.description}</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-medium">Price:</span>
                    <span className="text-blue-600 font-bold text-lg">
                      {selectedDataset.oydCost} OYD datacoins
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-medium">Size:</span>
                    <span className="text-slate-900 font-semibold">{selectedDataset.size}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-medium">Timestamp:</span>
                    <span className="text-slate-900 text-sm">{formatTimestamp(selectedDataset.timestamp)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-medium">CID:</span>
                    <span className="text-slate-900 font-mono text-sm">{selectedDataset.cid.slice(0, 20)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Seller:</span>
                    <span className="text-slate-900 font-mono text-sm">{selectedDataset.seller}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBuyDataset(selectedDataset)}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {showSuccess.show && (
          <div className="fixed top-4 right-4 bg-white border border-emerald-200 shadow-xl rounded-xl p-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                  <div className="font-semibold text-slate-900">
                    {showSuccess.type === 'download' ? 'Download Successful!' : 'Request Sent!'}
                  </div>
                  <div className="text-sm text-slate-600">
                    {showSuccess.type === 'download' 
                      ? 'Dataset has been downloaded to your device'
                      : 'Data access request has been sent to the uploader'
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess({ show: false, type: 'download' })}
                className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Purchase Confirmation Modal */}
        {purchaseModal.show && purchaseModal.dataset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Download Dataset</h3>
                  <button
                    onClick={() => setPurchaseModal({ show: false, dataset: null, isProcessing: false, error: null })}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={purchaseModal.isProcessing}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {purchaseModal.isProcessing ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 mb-2">Decrypting and downloading...</p>
                    <p className="text-sm text-slate-500">Please sign the message in your wallet to decrypt the file</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-2">{purchaseModal.dataset.name}</h4>
                      <p className="text-sm text-slate-600 mb-4">{purchaseModal.dataset.description}</p>
                      
                      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Size:</span>
                          <span className="font-medium">{purchaseModal.dataset.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Category:</span>
                          <span className="font-medium">{purchaseModal.dataset.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Downloads:</span>
                          <span className="font-medium">{purchaseModal.dataset.downloads}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-900">Dataset Value</div>
                          <div className="text-2xl font-bold text-green-600">
                            {purchaseModal.dataset.oydCost.toLocaleString()} OYD
                          </div>
                          <div className="text-xs text-green-700">datacoins (demo mode)</div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {purchaseModal.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-800 text-sm">{purchaseModal.error}</p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-slate-500 mb-6">
                      The dataset will be decrypted and downloaded to your device.
                    </div>
                  </>
                )}
              </div>

              {!purchaseModal.isProcessing && (
                <div className="flex gap-3 p-6 border-t border-slate-200">
                  <button
                    onClick={() => setPurchaseModal({ show: false, dataset: null, isProcessing: false, error: null })}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePurchaseAndDownload(purchaseModal.dataset!)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    Download Dataset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}