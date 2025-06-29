import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Get total users count
    const totalUsers = await usersCollection.countDocuments();

    // Get users with recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await usersCollection.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Aggregate total login count and content views
    const aggregationResult = await usersCollection.aggregate([
      {
        $group: {
          _id: null,
          totalLogins: { $sum: { $ifNull: ["$loginCount", 0] } },
          totalContentViews: { $sum: { $ifNull: ["$contentViews", 0] } }
        }
      }
    ]).toArray();

    const totals = aggregationResult[0] || { totalLogins: 0, totalContentViews: 0 };

    // Get user registration data for growth chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await usersCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Format monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyData = monthlyGrowth.map(item => ({
      month: monthNames[item._id.month - 1],
      users: item.count,
      pagesVisited: Math.floor(item.count * 15), // Estimated based on user count
      logins: Math.floor(item.count * 8) // Estimated based on user count
    }));

    // Calculate growth rate (comparing last month to previous month)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonth = lastMonth === 0 ? 11 : lastMonth - 1;

    const lastMonthUsers = await usersCollection.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), lastMonth, 1),
        $lt: new Date(new Date().getFullYear(), currentMonth, 1)
      }
    });

    const previousMonthUsers = await usersCollection.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), previousMonth, 1),
        $lt: new Date(new Date().getFullYear(), lastMonth, 1)
      }
    });

    const growthRate = previousMonthUsers > 0 
      ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 
      : 0;

    const analytics = {
      totalUsers,
      activeUsers,
      totalPagesVisited: totals.totalContentViews,
      totalLogins: totals.totalLogins,
      growthRate: Math.round(growthRate * 10) / 10,
      popularSubjects: [
        { name: "Data Structures", pagesVisited: Math.floor(totals.totalContentViews * 0.15), visits: Math.floor(totals.totalContentViews * 0.1) },
        { name: "Database Management", pagesVisited: Math.floor(totals.totalContentViews * 0.13), visits: Math.floor(totals.totalContentViews * 0.09) },
        { name: "Operating Systems", pagesVisited: Math.floor(totals.totalContentViews * 0.11), visits: Math.floor(totals.totalContentViews * 0.08) },
        { name: "Computer Networks", pagesVisited: Math.floor(totals.totalContentViews * 0.10), visits: Math.floor(totals.totalContentViews * 0.07) },
        { name: "Software Engineering", pagesVisited: Math.floor(totals.totalContentViews * 0.09), visits: Math.floor(totals.totalContentViews * 0.06) },
      ],
      monthlyData: formattedMonthlyData.length > 0 ? formattedMonthlyData : [
        { month: "Jan", users: 0, pagesVisited: 0, logins: 0 },
        { month: "Feb", users: 0, pagesVisited: 0, logins: 0 },
        { month: "Mar", users: 0, pagesVisited: 0, logins: 0 },
        { month: "Apr", users: 0, pagesVisited: 0, logins: 0 },
        { month: "May", users: 0, pagesVisited: 0, logins: 0 },
        { month: "Jun", users: 0, pagesVisited: 0, logins: 0 },
      ],
      userGrowth: formattedMonthlyData.map((data, index, arr) => ({
        month: data.month,
        growth: index > 0 ? ((data.users - arr[index - 1].users) / (arr[index - 1].users || 1)) * 100 : 0
      }))
    };

    return NextResponse.json({ success: true, data: analytics });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching analytics data' },
      { status: 500 }
    );
  }
} 