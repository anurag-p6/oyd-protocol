import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Fetching datasets from Supabase...');
    
    const { data: datasets, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to fetch datasets from database',
          details: error.message,
          hint: error.hint || 'Make sure the datasets table exists in your Supabase database'
        },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${datasets?.length || 0} datasets`);
    return NextResponse.json({
      success: true,
      datasets: datasets || []
    });
  } catch (error) {
    console.error('Get datasets error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch datasets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const dataset = await request.json();
    console.log('Saving dataset to Supabase:', dataset);
    
    // Transform the dataset to match our database schema
    const dbDataset = {
      id: dataset.id,
      company_name: dataset.companyName,
      data_name: dataset.dataName,
      data_description: dataset.dataDescription,
      category: dataset.category,
      cid: dataset.cid,
      timestamp: dataset.timestamp,
      file_size: dataset.fileSize,
      uploader_address: dataset.uploaderAddress,
      uploaded_by: dataset.uploadedBy,
      oyd_cost: dataset.oydCost,
      downloads: dataset.downloads || 0,
      created_at: new Date().toISOString()
    };

    console.log('Transformed dataset for database:', dbDataset);

    const { data, error } = await supabase
      .from('datasets')
      .insert([dbDataset])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to save dataset to database',
          details: error.message,
          hint: error.hint || 'Make sure the datasets table exists and has the correct schema'
        },
        { status: 500 }
      );
    }

    console.log('Successfully saved dataset:', data);
    return NextResponse.json({
      success: true,
      message: 'Dataset added successfully',
      dataset: data
    });
  } catch (error) {
    console.error('Add dataset error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add dataset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
