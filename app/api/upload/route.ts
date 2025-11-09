import { NextResponse } from 'next/server';

export interface UploadRequest {
  category: string;
  companyName: string;
  dataName: string;
  dataDescription: string;
  cid: string;
  timestamp: string;
  fileSize: number;
  uploaderAddress: string;
  uploadedBy: string;
}

export async function POST(request: Request) {
  try {
    // Get and validate request data
    const body: UploadRequest = await request.json();
    
    // Validate required fields
    const { category, companyName, dataName, dataDescription, cid, timestamp, fileSize, uploaderAddress, uploadedBy } = body;
    if (!category || !companyName || !dataName || !dataDescription || !cid || !timestamp || !fileSize || !uploaderAddress || !uploadedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: category, companyName, dataName, dataDescription, cid, timestamp, fileSize, uploaderAddress, uploadedBy' },
        { status: 400 }
      );
    }

    // Here you would typically save to your database
    // For now, we'll simulate a database save
    const datasetRecord = {
      id: `${companyName}-${Date.now()}`,
      category,
      companyName,
      dataName,
      dataDescription,
      cid,
      timestamp,
      fileSize,
      uploaderAddress,
      uploadedBy,
      oydCost: Math.ceil(fileSize / 1024), // 1KB = 1 OYD datacoin
      downloads: 0,
      createdAt: new Date().toISOString()
    };

    // Save directly to Supabase instead of calling API
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Transform the dataset to match our database schema
      const dbDataset = {
        id: datasetRecord.id,
        company_name: datasetRecord.companyName,
        data_name: datasetRecord.dataName,
        data_description: datasetRecord.dataDescription,
        category: datasetRecord.category,
        cid: datasetRecord.cid,
        timestamp: datasetRecord.timestamp,
        file_size: datasetRecord.fileSize,
        uploader_address: datasetRecord.uploaderAddress,
        uploaded_by: datasetRecord.uploadedBy,
        oyd_cost: datasetRecord.oydCost,
        downloads: datasetRecord.downloads || 0,
        created_at: new Date().toISOString()
      };

      console.log('Saving dataset to Supabase:', dbDataset);

      const { data, error } = await supabase
        .from('datasets')
        .insert([dbDataset])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }

      console.log('Successfully saved dataset to Supabase:', data);
    } catch (e) {
      console.error('Failed to save to database:', e);
      // Don't throw here - we still want the upload to succeed even if DB save fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Dataset successfully saved to database',
      dataset: datasetRecord,
      decryptUrl: `https://decrypt.mesh3.network/evm/${cid}`
    });

  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save dataset record' },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
