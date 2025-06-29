import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const branch = searchParams.get('branch');
    const subject = searchParams.get('subject');
    
    if (!year || !semester || !branch || !subject) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    const queryPath = `${year}.sem-${semester}.${actualBranch}.${subject}.practicals`;
    
    const result = await collection.findOne({}, { projection: { [queryPath]: 1 } });
    const content = result && getNestedValue(result, queryPath.split('.'));
    
    return NextResponse.json(content?.experiments || []);
  } catch (error) {
    console.error('Error reading experiments:', error);
    return NextResponse.json({ error: 'Failed to read experiments' }, { status: 500 });
  }
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export async function POST(request: NextRequest) {
  try {
    const { year, semester, branch, subject, experiments } = await request.json();
    
    if (!year || !semester || !branch || !subject) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    const updatePath = `${year}.sem-${semester}.${actualBranch}.${subject}.practicals.experiments`;
    
    await collection.updateOne(
      {},
      { $set: { [updatePath]: experiments } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Experiments updated successfully' });
  } catch (error) {
    console.error('Error updating experiments:', error);
    return NextResponse.json({ error: 'Failed to update experiments' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { year, semester, branch, subject, experiments } = await request.json();
    
    if (!year || !semester || !branch || !subject) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    const updatePath = `${year}.sem-${semester}.${actualBranch}.${subject}.practicals.experiments`;
    
    await collection.updateOne(
      {},
      { $set: { [updatePath]: experiments } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Experiment updated successfully' });
  } catch (error) {
    console.error('Error updating experiment:', error);
    return NextResponse.json({ error: 'Failed to update experiment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { year, semester, branch, subject, experiments } = await request.json();
    
    if (!year || !semester || !branch || !subject) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    const updatePath = `${year}.sem-${semester}.${actualBranch}.${subject}.practicals.experiments`;
    
    await collection.updateOne(
      {},
      { $set: { [updatePath]: experiments } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    return NextResponse.json({ error: 'Failed to delete experiment' }, { status: 500 });
  }
} 