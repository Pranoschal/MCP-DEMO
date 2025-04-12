'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadStatus('');
      setUploadedFileUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setUploadStatus('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log(result,'RESULTTTTTTTTTTTTTTTTTTT')

      if (response.ok) {
        setUploadStatus(`Upload successful: ${file.name}`);
        setUploadedFileUrl(result.url);
        setFile(null);
        // Reset file input
        const input = document.getElementById('fileInput') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        setUploadStatus(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex justify-center items-center'>
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="fileInput" 
            className="block text-sm font-medium text-gray-700"
          >
            Choose file
          </label>
          <input 
            id="fileInput"
            type="file" 
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected file: {file.name}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file || isUploading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded 
          hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>

        {uploadStatus && (
          <div 
            className={`mt-4 text-center text-sm ${
              uploadStatus.includes('successful') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}
          >
            {uploadStatus}
          </div>
        )}

        {uploadedFileUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Uploaded File URL:</p>
            <a 
              href={uploadedFileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-words"
            >
              {uploadedFileUrl}
            </a>
          </div>
        )}
      </form>
    </div>
    </div>
  );
}