'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '@/app/components/Navbar';
import { useDatasetRegistry } from '@/app/hooks/useDatasetRegistry';
import lighthouse from '@lighthouse-web3/sdk';

interface UploadFormData {
  category: string;
  companyName: string;
  dataName: string;
  dataDescription: string;
  file: File | null;
}

export default function UploadPage() {
  const { isConnected } = useAccount();
  const { } = useDatasetRegistry();

  const [formData, setFormData] = useState<UploadFormData>({
    category: '',
    companyName: '',
    dataName: '',
    dataDescription: '',
    file: null,
  });

  const [uploadStatus, setUploadStatus] = useState<{
    step: 'idle' | 'uploading' | 'uploaded' | 'registering' | 'completed' | 'error';
    message: string;
    cid?: string;
    error?: string;
  }>({
    step: 'idle',
    message: '',
  });

  const [fileInfo, setFileInfo] = useState<{
    size: number;
    oydCoins: number;
  } | null>(null);

  const [successData, setSuccessData] = useState<{
    dataset: {
      id: string;
      category: string;
      companyName: string;
      dataName: string;
      dataDescription: string;
      cid: string;
      timestamp: string;
      fileSize: number;
      uploaderAddress: string;
      uploadedBy: string;
      oydCost: number;
      downloads: number;
      createdAt: string;
    } | null;
    show: boolean;
  }>({
    dataset: null,
    show: false
  });

  // Categories and companies matching dashboard
  const categories = [
    {
      id: 'supermart',
      name: 'Supermart',
      companies: ['Flipkart', 'Amazon']
    },
    {
      id: 'groceries',
      name: 'Groceries and Food',
      companies: ['Zepto', 'Blinkit', 'Swiggy', 'Zomato']
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy',
      companies: ['1mg']
    },
    {
      id: 'apparels',
      name: 'Apparels',
      companies: ['Myntra', 'Ajio']
    }
  ];

  const getCompaniesForCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.companies : [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Reset company selection when category changes
      if (name === 'category') {
        newData.companyName = '';
      }
      
      return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file
    }));

    // Calculate file size and OYD coins (1KB = 1 OYD)
    if (file) {
      const sizeInBytes = file.size;
      const sizeInKB = Math.ceil(sizeInBytes / 1024); // Round up to nearest KB
      const oydCoins = sizeInKB; // 1KB = 1 OYD

      setFileInfo({
        size: sizeInBytes,
        oydCoins: oydCoins
      });
    } else {
      setFileInfo(null);
    }
  };

  // Function to sign the authentication message using Wallet
  const signAuthMessage = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length === 0) {
          throw new Error("No accounts returned from Wallet.");
        }
        const signerAddress = accounts[0];
        const { message } = (await lighthouse.getAuthMessage(signerAddress)).data;
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, signerAddress],
        });
        return { signature, signerAddress };
      } catch (error) {
        console.error("Error signing message with Wallet", error);
        return null;
      }
    } else {
      console.log("Please install Wallet!");
      return null;
    }
  };

  // Progress callback for upload
  // const progressCallback = (progressData: { uploaded: number; total: number }) => {
  //   if (progressData?.total && progressData?.uploaded) {
  //     const percentageDone = 100 - Number((progressData.total / progressData.uploaded).toFixed(2));
  //     console.log(percentageDone);
  //   }
  // };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setUploadStatus({
        step: 'error',
        message: 'Please connect your wallet first',
        error: 'Wallet not connected'
      });
      return;
    }

    if (!formData.file || !formData.category || !formData.companyName || !formData.dataName || !formData.dataDescription) {
      setUploadStatus({
        step: 'error',
        message: 'Please fill in all required fields',
        error: 'Missing required fields'
      });
      return;
    }

    try {
      // Step 1: Upload encrypted file to IPFS using Lighthouse
      setUploadStatus({
        step: 'uploading',
        message: 'Encrypting and uploading dataset to IPFS...'
      });

      // Get authentication for encryption
      const encryptionAuth = await signAuthMessage();
      if (!encryptionAuth) {
        throw new Error('Failed to sign the authentication message');
      }

      const { signature, signerAddress } = encryptionAuth;
      const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

      if (!apiKey) {
        throw new Error('Lighthouse API key not configured');
      }

      // Upload encrypted file
      const output = await lighthouse.uploadEncrypted(
        [formData.file],
        apiKey,
        signerAddress,
        signature
      );

      console.log("Encrypted File Status:", output);
      
      if (!output.data || output.data.length === 0) {
        throw new Error('Failed to upload encrypted file');
      }

      const cid = output.data[0].Hash;
      const timestamp = new Date().toISOString();

      // Step 2: Save to database via API
      setUploadStatus({
        step: 'uploaded',
        message: 'File uploaded successfully. Saving to database...',
        cid: cid
      });

      const saveResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          companyName: formData.companyName,
          dataName: formData.dataName,
          dataDescription: formData.dataDescription,
          cid: cid,
          timestamp: timestamp,
          fileSize: formData.file.size,
          uploaderAddress: signerAddress,
          uploadedBy: signerAddress
        }),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Failed to save to database');
      }

      setUploadStatus({
        step: 'completed',
        message: 'Dataset successfully uploaded and encrypted on IPFS!',
        cid: cid
      });

      // Show success modal with dataset info
      setSuccessData({
        dataset: saveResult.dataset,
        show: true
      });

      // Reset form
      setFormData({
        category: '',
        companyName: '',
        dataName: '',
        dataDescription: '',
        file: null,
      });

      // Reset file info
      setFileInfo(null);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        step: 'error',
        message: 'Failed to upload dataset',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="lg:ml-64 mt-4 transition-all bg-white duration-300 pt-16 lg:pt-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Dataset</h1>
          <p className="text-slate-600">Upload your dataset to IPFS and register it on the blockchain</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full border text-black border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                Company Name *
              </label>
              <input
                type='text'
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full border text-black border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
              </input>
              {!formData.category && (
                <p className="text-xs text-slate-500 mt-1">Please select a category first</p>
              )}
            </div>

            {/* Data Name */}
            <div>
              <label htmlFor="dataName" className="block text-sm font-medium text-slate-700 mb-2">
                Data Name *
              </label>
              <input
                type="text"
                id="dataName"
                name="dataName"
                value={formData.dataName}
                onChange={handleInputChange}
                required
                className="w-full border text-black border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter dataset name"
              />
            </div>

            {/* Data Description */}
            <div>
              <label htmlFor="dataDescription" className="block text-sm font-medium text-slate-700 mb-2">
                Data Description *
              </label>
              <textarea
                id="dataDescription"
                name="dataDescription"
                value={formData.dataDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border text-black border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your dataset"
              />
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-2">
                Dataset File *
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                required
                accept=".json,.csv,.txt,.xml"
                className="w-full border text-black border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: JSON, CSV, TXT, XML
              </p>
              
              {/* File Size and OYD Display */}
              {fileInfo && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-900">File Size</div>
                      <div className="text-lg font-bold text-blue-700">{formatFileSize(fileInfo.size)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-900">OYD Coins to Mint</div>
                      <div className="text-2xl font-bold text-blue-600">{fileInfo.oydCoins.toLocaleString()}</div>
                      <div className="text-xs text-blue-600">OYD datacoins</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    Rate: 1 KB = 1 OYD datacoin
                  </div>
                </div>
              )}
            </div>

            {/* Upload Status */}
            {uploadStatus.step !== 'idle' && (
              <div className={`p-4 rounded-lg border ${
                uploadStatus.step === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : uploadStatus.step === 'completed'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {uploadStatus.step === 'uploading' || uploadStatus.step === 'registering' ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : uploadStatus.step === 'completed' ? (
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : uploadStatus.step === 'error' ? (
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                    <div>
                      <p className="font-medium">{uploadStatus.message}</p>
                      {uploadStatus.cid && (
                        <p className="text-sm mt-1">CID: {uploadStatus.cid}</p>
                      )}
                      {uploadStatus.error && (
                        <p className="text-sm mt-1">{uploadStatus.error}</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isConnected || uploadStatus.step === 'uploading' || uploadStatus.step === 'uploaded'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {!isConnected ? 'Connect Wallet First' :
               uploadStatus.step === 'uploading' ? 'Encrypting & Uploading...' :
               uploadStatus.step === 'uploaded' ? 'Saving to Database...' :
               'Upload Encrypted Dataset'}
            </button>
          </form>
        </div>

        {/* Success Modal */}
        {successData.show && successData.dataset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Successful! 🎉</h3>
                <p className="text-slate-600">Your dataset has been encrypted and uploaded to IPFS</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Dataset Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Company:</span>
                    <span className="font-medium text-slate-900">{successData.dataset.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dataset Name:</span>
                    <span className="font-medium text-slate-900">{successData.dataset.dataName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium text-slate-900">{successData.dataset.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">File Size:</span>
                    <span className="font-medium text-slate-900">{formatFileSize(successData.dataset.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">CID:</span>
                    <span className="font-mono text-xs text-slate-700">{successData.dataset.cid.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>

              {/* OYD Coins Minted */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-900 mb-1">OYD Datacoins Minted</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {successData.dataset.oydCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700">OYD datacoins (1 KB = 1 OYD)</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessData({ dataset: null, show: false })}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSuccessData({ dataset: null, show: false });
                    // Navigate to dashboard to see the uploaded dataset
                    window.location.href = '/dashboard';
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  View in Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}