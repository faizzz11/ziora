import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface SecurityEvent {
  userId?: string | null;
  userEmail?: string | null;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  eventType: 'screenshot_attempt' | 'right_click' | 'dev_tools_open' | 'copy_attempt' | 'print_attempt';
  page: string;
  pagePath: string;
  timestamp: Date;
  details?: {
    method?: string;
    keyPressed?: string;
    browserInfo?: string;
    deviceInfo?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      eventType, 
      page, 
      pagePath, 
      userEmail,
      details = {} 
    } = body;

    if (!eventType || !page || !pagePath) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const securityEventsCollection = db.collection("security_events");
    const usersCollection = db.collection("users");

    // Try to get user data if email is provided
    let userId = null;
    if (userEmail) {
      const user = await usersCollection.findOne({ email: userEmail });
      if (user) {
        userId = user._id.toString();
      }
    }

    // Create security event
    const securityEvent: SecurityEvent = {
      userId,
      userEmail: userEmail || null,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ipAddress: clientIP,
      userAgent,
      eventType,
      page,
      pagePath,
      timestamp: new Date(),
      details: {
        ...details,
        browserInfo: userAgent,
        deviceInfo: details.deviceInfo || 'unknown'
      }
    };

    // Insert the security event
    const result = await securityEventsCollection.insertOne(securityEvent);

    // Update user statistics if user exists
    if (userId) {
      const updateFields: any = {};
      
      switch (eventType) {
        case 'screenshot_attempt':
          updateFields['$inc'] = { 'securityEvents.screenshotAttempts': 1 };
          break;
        case 'right_click':
          updateFields['$inc'] = { 'securityEvents.rightClicks': 1 };
          break;
        case 'dev_tools_open':
          updateFields['$inc'] = { 'securityEvents.devToolsOpened': 1 };
          break;
        case 'copy_attempt':
          updateFields['$inc'] = { 'securityEvents.copyAttempts': 1 };
          break;
        case 'print_attempt':
          updateFields['$inc'] = { 'securityEvents.printAttempts': 1 };
          break;
      }

      if (Object.keys(updateFields).length > 0) {
        await usersCollection.updateOne(
          { _id: { $oid: userId } },
          {
            ...updateFields,
            '$set': { 'securityEvents.lastEventAt': new Date() }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      eventId: result.insertedId,
      message: 'Security event logged successfully'
    });

  } catch (error) {
    console.error('Error logging security event:', error);
    return NextResponse.json(
      { success: false, error: 'Error logging security event' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventType = searchParams.get('eventType');
    const userEmail = searchParams.get('userEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const securityEventsCollection = db.collection("security_events");

    // Build query
    const query: any = {};
    
    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    if (userEmail) {
      query.userEmail = userEmail;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Get events with pagination
    const events = await securityEventsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await securityEventsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get event type statistics
    const eventStats = await securityEventsCollection.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastEvent: { $max: '$timestamp' }
        }
      }
    ]).toArray();

    const statistics = {
      total: totalCount,
      byType: eventStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          lastEvent: stat.lastEvent
        };
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        ...event,
        _id: event._id.toString()
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics
    });

  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching security events' },
      { status: 500 }
    );
  }
} 