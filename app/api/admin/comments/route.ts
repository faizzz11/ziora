import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ziora");
    
    // Query the academic_content collection
    const academicCollection = db.collection("academic_content");
    const documents = await academicCollection.find({}).toArray();

    let allComments: any[] = [];

    // Process each document in the academic_content collection
    for (const doc of documents) {
      // Process each year level (SE, TE, FE, BE)
      for (const [yearKey, yearData] of Object.entries(doc)) {
        if (['SE', 'TE', 'FE', 'BE'].includes(yearKey) && typeof yearData === 'object') {
          const year = yearData as any;
          
          // Process each semester
          for (const [semesterKey, semesterData] of Object.entries(year)) {
            if (semesterKey.startsWith('sem-') && typeof semesterData === 'object') {
              const semester = semesterData as any;
              
              // Process each branch
              for (const [branchKey, branchData] of Object.entries(semester)) {
                if (typeof branchData === 'object') {
                  const branch = branchData as any;
                  
                  // Process each subject
                  for (const [subjectKey, subjectData] of Object.entries(branch)) {
                    if (typeof subjectData === 'object') {
                      const subject = subjectData as any;
                      
                      // Process notes comments
                      if (subject.notes?.modules) {
                        for (const module of subject.notes.modules) {
                          if (module.comments) {
                            for (const comment of module.comments) {
                              allComments.push({
                                ...comment,
                                year: yearKey,
                                semester: semesterKey,
                                branch: branchKey,
                                subject: subjectKey,
                                module: module.name,
                                type: 'notes',
                                contentId: module.id,
                                path: `${yearKey}/${semesterKey}/${branchKey}/${subjectKey}/notes/modules`
                              });
                              
                              // Process nested replies
                              if (comment.replies) {
                                const flattenReplies = (replies: any[], parentId: string) => {
                                  for (const reply of replies) {
                                    allComments.push({
                                      ...reply,
                                      year: yearKey,
                                      semester: semesterKey,
                                      branch: branchKey,
                                      subject: subjectKey,
                                      module: module.name,
                                      type: 'notes',
                                      contentId: module.id,
                                      parentId: parentId,
                                      path: `${yearKey}/${semesterKey}/${branchKey}/${subjectKey}/notes/modules`
                                    });
                                    if (reply.replies) {
                                      flattenReplies(reply.replies, reply.id);
                                    }
                                  }
                                };
                                flattenReplies(comment.replies, comment.id);
                              }
                            }
                          }
                        }
                      }
                      
                      // Process video-lectures comments
                      if (subject['video-lecs']?.modules) {
                        for (const module of subject['video-lecs'].modules) {
                          if (module.topics) {
                            for (const topic of module.topics) {
                              if (topic.comments) {
                                for (const comment of topic.comments) {
                                  allComments.push({
                                    ...comment,
                                    year: yearKey,
                                    semester: semesterKey,
                                    branch: branchKey,
                                    subject: subjectKey,
                                    module: module.name,
                                    topic: topic.title,
                                    type: 'videos',
                                    contentId: topic.id,
                                    path: `${yearKey}/${semesterKey}/${branchKey}/${subjectKey}/video-lecs/modules`
                                  });
                                  
                                  // Process nested replies
                                  if (comment.replies) {
                                    const flattenReplies = (replies: any[], parentId: string) => {
                                      for (const reply of replies) {
                                        allComments.push({
                                          ...reply,
                                          year: yearKey,
                                          semester: semesterKey,
                                          branch: branchKey,
                                          subject: subjectKey,
                                          module: module.name,
                                          topic: topic.title,
                                          type: 'videos',
                                          contentId: topic.id,
                                          parentId: parentId,
                                          path: `${yearKey}/${semesterKey}/${branchKey}/${subjectKey}/video-lecs/modules`
                                        });
                                        if (reply.replies) {
                                          flattenReplies(reply.replies, reply.id);
                                        }
                                      }
                                    };
                                    flattenReplies(comment.replies, comment.id);
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Sort by timestamp (newest first) and limit
    allComments.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    allComments = allComments.slice(0, 100); // Limit to latest 100 comments

    // Transform data to match the expected interface
    const transformedComments = allComments.map(comment => ({
      id: comment.id,
      user: {
        name: comment.author || 'Anonymous',
        email: `${comment.author || 'anonymous'}@ziora.com`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.author || 'Anonymous')}`
      },
      content: comment.content,
      subject: comment.subject.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      module: comment.module || 'General',
      topic: comment.topic || undefined,
      timestamp: formatTimestamp(comment.timestamp),
      status: comment.status || 'pending', // Default to pending if no status
      replies: comment.parentId ? 0 : (comment.replies?.length || 0),
      likes: typeof comment.likes === 'object' ? comment.likes.$numberInt || 0 : (comment.likes || 0),
      type: comment.type,
      contentId: comment.contentId,
      year: comment.year,
      semester: comment.semester,
      branch: comment.branch.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      path: comment.path,
      parentId: comment.parentId
    }));

    return NextResponse.json({
      success: true,
      comments: transformedComments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching comments' },
      { status: 500 }
    );
  }
}

// PATCH - Flag comment
export async function PATCH(req: Request) {
  try {
    const { commentId, action } = await req.json();

    if (!commentId || action !== 'flag') {
      return NextResponse.json(
        { success: false, error: 'Comment ID and flag action are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ziora");
    const academicCollection = db.collection("academic_content");

    // Find and update the comment
    const result = await updateCommentInNestedStructure(academicCollection, commentId, { status: 'flagged' });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Comment flagged successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error flagging comment:', error);
    return NextResponse.json(
      { success: false, error: 'Error flagging comment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(req: Request) {
  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ziora");
    const academicCollection = db.collection("academic_content");

    // Find and delete the comment
    const result = await deleteCommentFromNestedStructure(academicCollection, commentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting comment' },
      { status: 500 }
    );
  }
}

// Helper function to update comment in nested structure
async function updateCommentInNestedStructure(collection: any, commentId: string, updateData: any) {
  try {
    // Update in notes modules
    let result = await collection.updateOne(
      { [`SE.sem-4.computer-engineering.operating-system.notes.modules.comments.id`]: commentId },
      { $set: { [`SE.sem-4.computer-engineering.operating-system.notes.modules.$[module].comments.$[comment].status`]: updateData.status } },
      { 
        arrayFilters: [
          { 'module.comments.id': commentId },
          { 'comment.id': commentId }
        ]
      }
    );

    if (result.matchedCount > 0) {
      return { success: true };
    }

    // If not found, try a more comprehensive search across all possible paths
    const documents = await collection.find({}).toArray();
    
    for (const doc of documents) {
      for (const [yearKey, yearData] of Object.entries(doc)) {
        if (['SE', 'TE', 'FE', 'BE'].includes(yearKey) && typeof yearData === 'object') {
          const year = yearData as any;
          
          for (const [semesterKey, semesterData] of Object.entries(year)) {
            if (semesterKey.startsWith('sem-') && typeof semesterData === 'object') {
              const semester = semesterData as any;
              
              for (const [branchKey, branchData] of Object.entries(semester)) {
                if (typeof branchData === 'object') {
                  const branch = branchData as any;
                  
                  for (const [subjectKey, subjectData] of Object.entries(branch)) {
                    if (typeof subjectData === 'object') {
                      const subject = subjectData as any;
                      
                      // Check notes modules
                      if (subject.notes?.modules) {
                        for (let moduleIndex = 0; moduleIndex < subject.notes.modules.length; moduleIndex++) {
                          const module = subject.notes.modules[moduleIndex];
                          if (module.comments) {
                            const commentIndex = module.comments.findIndex((c: any) => c.id === commentId);
                            if (commentIndex !== -1) {
                              const updatePath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.notes.modules.${moduleIndex}.comments.${commentIndex}.status`;
                              await collection.updateOne(
                                { _id: doc._id },
                                { $set: { [updatePath]: updateData.status } }
                              );
                              return { success: true };
                            }
                            
                            // Check replies
                            for (let commentIdx = 0; commentIdx < module.comments.length; commentIdx++) {
                              const comment = module.comments[commentIdx];
                              if (comment.replies) {
                                const replyIndex = findReplyIndexRecursively(comment.replies, commentId);
                                if (replyIndex.found) {
                                  const updatePath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.notes.modules.${moduleIndex}.comments.${commentIdx}.replies.${replyIndex.path}.status`;
                                  await collection.updateOne(
                                    { _id: doc._id },
                                    { $set: { [updatePath]: updateData.status } }
                                  );
                                  return { success: true };
                                }
                              }
                            }
                          }
                        }
                      }
                      
                      // Check video-lecs modules
                      if (subject['video-lecs']?.modules) {
                        for (let moduleIndex = 0; moduleIndex < subject['video-lecs'].modules.length; moduleIndex++) {
                          const module = subject['video-lecs'].modules[moduleIndex];
                          if (module.topics) {
                            for (let topicIndex = 0; topicIndex < module.topics.length; topicIndex++) {
                              const topic = module.topics[topicIndex];
                              if (topic.comments) {
                                const commentIndex = topic.comments.findIndex((c: any) => c.id === commentId);
                                if (commentIndex !== -1) {
                                  const updatePath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.video-lecs.modules.${moduleIndex}.topics.${topicIndex}.comments.${commentIndex}.status`;
                                  await collection.updateOne(
                                    { _id: doc._id },
                                    { $set: { [updatePath]: updateData.status } }
                                  );
                                  return { success: true };
                                }
                                
                                // Check replies
                                for (let commentIdx = 0; commentIdx < topic.comments.length; commentIdx++) {
                                  const comment = topic.comments[commentIdx];
                                  if (comment.replies) {
                                    const replyIndex = findReplyIndexRecursively(comment.replies, commentId);
                                    if (replyIndex.found) {
                                      const updatePath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.video-lecs.modules.${moduleIndex}.topics.${topicIndex}.comments.${commentIdx}.replies.${replyIndex.path}.status`;
                                      await collection.updateOne(
                                        { _id: doc._id },
                                        { $set: { [updatePath]: updateData.status } }
                                      );
                                      return { success: true };
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { success: false };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false };
  }
}

// Helper function to delete comment from nested structure
async function deleteCommentFromNestedStructure(collection: any, commentId: string) {
  try {
    const documents = await collection.find({}).toArray();
    
    for (const doc of documents) {
      for (const [yearKey, yearData] of Object.entries(doc)) {
        if (['SE', 'TE', 'FE', 'BE'].includes(yearKey) && typeof yearData === 'object') {
          const year = yearData as any;
          
          for (const [semesterKey, semesterData] of Object.entries(year)) {
            if (semesterKey.startsWith('sem-') && typeof semesterData === 'object') {
              const semester = semesterData as any;
              
              for (const [branchKey, branchData] of Object.entries(semester)) {
                if (typeof branchData === 'object') {
                  const branch = branchData as any;
                  
                  for (const [subjectKey, subjectData] of Object.entries(branch)) {
                    if (typeof subjectData === 'object') {
                      const subject = subjectData as any;
                      
                      // Check notes modules
                      if (subject.notes?.modules) {
                        for (let moduleIndex = 0; moduleIndex < subject.notes.modules.length; moduleIndex++) {
                          const module = subject.notes.modules[moduleIndex];
                          if (module.comments) {
                            const commentIndex = module.comments.findIndex((c: any) => c.id === commentId);
                            if (commentIndex !== -1) {
                              const pullPath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.notes.modules.${moduleIndex}.comments`;
                              await collection.updateOne(
                                { _id: doc._id },
                                { $pull: { [pullPath]: { id: commentId } } }
                              );
                              return { success: true };
                            }
                            
                            // Check and delete from replies
                            for (let commentIdx = 0; commentIdx < module.comments.length; commentIdx++) {
                              const comment = module.comments[commentIdx];
                              if (comment.replies) {
                                const deletedFromReplies = await deleteFromRepliesRecursively(
                                  collection, 
                                  doc._id, 
                                  `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.notes.modules.${moduleIndex}.comments.${commentIdx}.replies`,
                                  comment.replies,
                                  commentId
                                );
                                if (deletedFromReplies) {
                                  return { success: true };
                                }
                              }
                            }
                          }
                        }
                      }
                      
                      // Check video-lecs modules
                      if (subject['video-lecs']?.modules) {
                        for (let moduleIndex = 0; moduleIndex < subject['video-lecs'].modules.length; moduleIndex++) {
                          const module = subject['video-lecs'].modules[moduleIndex];
                          if (module.topics) {
                            for (let topicIndex = 0; topicIndex < module.topics.length; topicIndex++) {
                              const topic = module.topics[topicIndex];
                              if (topic.comments) {
                                const commentIndex = topic.comments.findIndex((c: any) => c.id === commentId);
                                if (commentIndex !== -1) {
                                  const pullPath = `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.video-lecs.modules.${moduleIndex}.topics.${topicIndex}.comments`;
                                  await collection.updateOne(
                                    { _id: doc._id },
                                    { $pull: { [pullPath]: { id: commentId } } }
                                  );
                                  return { success: true };
                                }
                                
                                // Check and delete from replies
                                for (let commentIdx = 0; commentIdx < topic.comments.length; commentIdx++) {
                                  const comment = topic.comments[commentIdx];
                                  if (comment.replies) {
                                    const deletedFromReplies = await deleteFromRepliesRecursively(
                                      collection,
                                      doc._id,
                                      `${yearKey}.${semesterKey}.${branchKey}.${subjectKey}.video-lecs.modules.${moduleIndex}.topics.${topicIndex}.comments.${commentIdx}.replies`,
                                      comment.replies,
                                      commentId
                                    );
                                    if (deletedFromReplies) {
                                      return { success: true };
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { success: false };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false };
  }
}

// Helper function to find reply index recursively
function findReplyIndexRecursively(replies: any[], commentId: string, currentPath: string = ''): { found: boolean, path: string } {
  for (let i = 0; i < replies.length; i++) {
    const reply = replies[i];
    const newPath = currentPath ? `${currentPath}.${i}` : `${i}`;
    
    if (reply.id === commentId) {
      return { found: true, path: newPath };
    }
    
    if (reply.replies && reply.replies.length > 0) {
      const result = findReplyIndexRecursively(reply.replies, commentId, `${newPath}.replies`);
      if (result.found) {
        return result;
      }
    }
  }
  
  return { found: false, path: '' };
}

// Helper function to delete from replies recursively
async function deleteFromRepliesRecursively(collection: any, docId: any, basePath: string, replies: any[], commentId: string): Promise<boolean> {
  for (let i = 0; i < replies.length; i++) {
    const reply = replies[i];
    
    if (reply.id === commentId) {
      // Delete this reply
      await collection.updateOne(
        { _id: docId },
        { $pull: { [basePath]: { id: commentId } } }
      );
      return true;
    }
    
    if (reply.replies && reply.replies.length > 0) {
      const found = await deleteFromRepliesRecursively(
        collection,
        docId,
        `${basePath}.${i}.replies`,
        reply.replies,
        commentId
      );
      if (found) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date | string): string {
  if (!timestamp) return 'Unknown time';
  
  let date: Date;
  
  // Handle custom timestamp formats from your database
  if (typeof timestamp === 'string') {
    // Parse custom formats like "22/06/2025, 00:46:48" or "6/29/2025, 7:26:23 PM"
    try {
      // Try to parse the custom format
      if (timestamp.includes(',')) {
        const [datePart, timePart] = timestamp.split(', ');
        
        // Handle both DD/MM/YYYY and M/D/YYYY formats
        let day: string, month: string, year: string;
        
        const dateParts = datePart.split('/');
        if (dateParts.length === 3) {
          // Determine if it's DD/MM/YYYY or M/D/YYYY format
          const firstPart = parseInt(dateParts[0]);
          const secondPart = parseInt(dateParts[1]);
          
          // If first part > 12, it's likely DD/MM/YYYY
          // If second part > 12, it's likely M/D/YYYY  
          if (firstPart > 12) {
            // DD/MM/YYYY format
            [day, month, year] = dateParts;
          } else {
            // M/D/YYYY format (US format)
            [month, day, year] = dateParts;
          }
        } else {
          throw new Error('Invalid date format');
        }
        
        // Create ISO format: YYYY-MM-DD HH:mm:ss
        let timeFormatted = timePart.trim();
        if (timePart.includes('PM') || timePart.includes('AM')) {
          timeFormatted = convertTo24Hour(timePart.trim());
        }
        
        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timeFormatted}`;
        date = new Date(isoString);
      } else {
        // Fallback to standard parsing
        date = new Date(timestamp);
      }
    } catch (error) {
      console.warn('Failed to parse timestamp:', timestamp, error);
      // Try one more fallback with direct Date parsing
      try {
        date = new Date(timestamp);
      } catch (fallbackError) {
        console.warn('All timestamp parsing failed:', timestamp);
        return 'Invalid date';
      }
    }
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid date after parsing:', timestamp);
    return 'Invalid date';
  }
  
  const now = Date.now();
  const commentTime = date.getTime();
  const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
}

// Helper function to convert 12-hour time to 24-hour time
function convertTo24Hour(timeStr: string): string {
  const isPM = timeStr.toUpperCase().includes('PM');
  const isAM = timeStr.toUpperCase().includes('AM');
  
  if (!isPM && !isAM) return timeStr; // Already 24-hour format
  
  let cleanTime = timeStr.replace(/\s*(AM|PM)/i, '').trim();
  const timeParts = cleanTime.split(':');
  
  if (timeParts.length < 2) {
    console.warn('Invalid time format:', timeStr);
    return '00:00:00';
  }
  
  const hours = timeParts[0];
  const minutes = timeParts[1] || '00';
  const seconds = timeParts[2] || '00';
  
  let hour24 = parseInt(hours);
  
  if (isNaN(hour24)) {
    console.warn('Invalid hour value:', hours);
    return '00:00:00';
  }
  
  if (isPM && hour24 !== 12) {
    hour24 += 12;
  } else if (isAM && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
} 