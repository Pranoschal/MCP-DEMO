import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const config = {
  api: {
    bodyParser: false, 
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' }, 
        { status: 400 }
      );
    }

    const sasUrl = process.env.AZURE_BLOB_SAS_URL;
    const container = process.env.AZURE_STORAGE_CONTAINER_NAME as string

    if (!sasUrl) {
      return NextResponse.json(
        { message: 'Blob storage URL not configured' }, 
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const uniqueFileName = `${timestamp}-${originalName}`;

    const arrayBuffer = await file.arrayBuffer();
    
    const buffer = Buffer.from(arrayBuffer);

    const blobServiceClient = new BlobServiceClient(sasUrl);

    const containerClient = blobServiceClient.getContainerClient('');

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
    
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type || 'application/octet-stream'
      }
    });

    const blobUrlWithoutSAS = new URL(blockBlobClient.url);
    blobUrlWithoutSAS.search = '';

    return NextResponse.json(
      { 
        message: 'File uploaded successfully', 
        url: blobUrlWithoutSAS.toString(),
        fileName: uniqueFileName 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}