'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '@/app/components/Navbar';
import lighthouse from '@lighthouse-web3/sdk';
import { ethers } from 'ethers';

interface DataRequest {
  id: string;
  datasetId: string;
  datasetName: string;
  datasetDescription: string;
  cid: string;
  requesterAddress: string;
  uploaderAddress: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  size: string;
  oydCost: number;
}

export default function RequestedDataPage() {
  const { address, isConnected } = useAccount();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [authCache, setAuthCache] = useState<{ [address: string]: { signedMessage: string; publicKey: string; timestamp: number } }>({});

  // Fetch data requests from API - refresh when address changes
  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      setRequests([]); // Clear previous requests
      fetchRequests();
    } else {
      setRequests([]); // Clear requests when disconnected
      setLoading(false);
    }
  }, [isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequests = useCallback(async () => {
    try {
      console.log('Fetching requests for uploader:', address);
      const response = await fetch(`/api/data-requests?uploaderAddress=${address}`);
      const data = await response.json();
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response data:', data);
      
      if (data.success) {
        // Transform database format to component format
        const transformedRequests = data.requests.map((req: {
          id: string;
          dataset_id: string;
          dataset_name: string;
          dataset_description: string;
          cid: string;
          requester_address: string;
          uploader_address: string;
          requested_at: string;
          status: string;
          category: string;
          size: string;
          oyd_cost: number;
        }) => ({
          id: req.id,
          datasetId: req.dataset_id,
          datasetName: req.dataset_name,
          datasetDescription: req.dataset_description,
          cid: req.cid,
          requesterAddress: req.requester_address,
          uploaderAddress: req.uploader_address,
          requestedAt: req.requested_at,
          status: req.status,
          category: req.category,
          size: req.size,
          oydCost: req.oyd_cost
        }));
        
        console.log('Transformed requests:', transformedRequests);
        setRequests(transformedRequests);
      } else {
        console.error('API returned failure:', data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Encryption signature for sharing (with caching)
  const encryptionSignature = async () => {
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
  };

  // Share file with requester
  const handleApproveRequest = async (request: DataRequest) => {
    setProcessingId(request.id);
    
    try {
      const { publicKey, signedMessage } = await encryptionSignature();
      
      console.log('Sharing file with details:', {
        owner: publicKey,
        receivers: [request.requesterAddress],
        cid: request.cid,
        hasSignature: !!signedMessage
      });
      
      const shareResponse = await lighthouse.shareFile(
        publicKey,
        [request.requesterAddress],
        request.cid,
        signedMessage
      );

      console.log('Share response:', shareResponse);

      // Verify the sharing was successful
      if (shareResponse.data && shareResponse.data.status === 'Success') {
        console.log('✅ File sharing successful!');
        
        // Check access conditions after sharing
        try {
          const accessConditions = await lighthouse.getAccessConditions(request.cid);
          console.log('Updated access conditions:', accessConditions);
        } catch (condError) {
          console.log('Could not verify access conditions:', condError);
        }
        
        // Update request status in database
        await updateRequestStatus(request.id, 'approved');

        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'approved' as const }
            : req
        ));

        // Notify that access has been granted (this will refresh access in dashboard)
        window.dispatchEvent(new CustomEvent('accessGranted', { 
          detail: { cid: request.cid, requesterAddress: request.requesterAddress }
        }));
        
        alert(`Successfully shared file with ${request.requesterAddress}`);
      } else {
        throw new Error('Sharing response indicates failure');
      }

    } catch (error) {
      console.error('Error sharing file:', error);
      alert(`Failed to share file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Reject request
  const handleRejectRequest = async (request: DataRequest) => {
    try {
      // Update request status in database
      await updateRequestStatus(request.id, 'rejected');

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === request.id 
          ? { ...req, status: 'rejected' as const }
          : req
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  // Update request status in database
  const updateRequestStatus = async (requestId: string, status: string) => {
    const response = await fetch('/api/data-requests', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update request status');
    }

    return response.json();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
            <p className="text-slate-600">Please connect your wallet to view data requests</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Requested Data</h1>
          <p className="text-slate-600">Manage data access requests from buyers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Requests</h3>
              <p className="text-slate-500">You haven&apos;t received any data access requests yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{request.datasetName}</h3>
                      <p className="text-sm text-slate-600 mb-3">{request.datasetDescription}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>Category: {request.category}</span>
                        <span>Size: {request.size}</span>
                        <span>Value: {request.oydCost.toLocaleString()} OYD</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-slate-600">Requested by:</span>
                        <span className="ml-2 font-mono text-slate-900">{request.requesterAddress}</span>
                      </div>
                      <div className="text-slate-500">
                        {formatTimestamp(request.requestedAt)}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRejectRequest(request)}
                        className="flex-1 bg-red-50 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveRequest(request)}
                        disabled={processingId === request.id}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Sharing...
                          </div>
                        ) : (
                          'Approve & Share'
                        )}
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-800 text-sm font-medium">Access granted - Buyer can now download</span>
                      </div>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 text-sm font-medium">Request rejected</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
