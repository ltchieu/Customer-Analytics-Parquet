import { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadFile, clusterData } from '../services/api';
import { UploadResponse } from '../model/file_upload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clustering, setClustering] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numClusters, setNumClusters] = useState(5);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    const validExtensions = ['.csv', '.json'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      setError('Please select a valid CSV or JSON file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadResponse(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const response = await uploadFile(file);
      console.log('Upload response:', response);
      setUploadResponse(response);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCluster = async () => {
    if (!uploadResponse?.parquetPath) return;

    try {
      setClustering(true);
      setError(null);
      const response = await clusterData({
        filePath: uploadResponse.parquetPath,
        numClusters: numClusters,
      });

      if (response) {
        // Show success and close modal after a delay
        setTimeout(() => {
          onClose();
          // Optionally refresh the page or redirect to segments page
          window.location.href = '/segments';
        }, 1500);
      }
    } catch (err) {
      setError('Failed to cluster data. Please try again.');
      console.error('Clustering error:', err);
    } finally {
      setClustering(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResponse(null);
    setError(null);
    setNumClusters(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload & Cluster Data</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Upload Section */}
          {!uploadResponse && (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: CSV, JSON
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.json,text/csv,application/json"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Select File
                </label>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload & Convert'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Section */}
          {uploadResponse && (
            <div>
              {/* Success Message */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-green-800 font-medium">{uploadResponse.message}</p>
                </div>
              </div>

              {/* Data Preview */}


              {/* Clustering Section */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Run Clustering Model
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Clusters
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={numClusters}
                      onChange={(e) => setNumClusters(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="pt-7">
                    <button
                      onClick={handleCluster}
                      disabled={clustering}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {clustering ? 'Clustering...' : 'Cluster Now'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  This will run the K-Means clustering algorithm on your uploaded data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
