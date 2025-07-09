import { NextRequest, NextResponse } from 'next/server';

interface PlaylistData {
  playlistTitle: string;
  videos: {
    id: string;
    title: string;
    videoUrl: string;
    duration?: string;
  }[];
}

// Extract playlist ID from various YouTube playlist URL formats
function extractPlaylistId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/watch\?.*list=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/.*\?.*list=)([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]+)$/ // Just the playlist ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Scrape playlist information from YouTube
async function scrapePlaylist(playlistId: string): Promise<PlaylistData> {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    
    // Fetch the playlist page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract playlist title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const rawTitle = titleMatch ? titleMatch[1] : 'Imported Playlist';
    
    // Clean up the title (remove " - YouTube" suffix)
    const playlistTitle = rawTitle.replace(/\s*-\s*YouTube\s*$/, '').trim();

    // Extract video data from the page
    const videos: PlaylistData['videos'] = [];
    
    // Look for video entries in the page
    const videoPattern = /"videoId":"([^"]+)".*?"title":{"runs":\[{"text":"([^"]+)"/g;
    const videoMatches = [...html.matchAll(videoPattern)];
    
    // Also try alternative pattern for video extraction
    const altVideoPattern = /"watchEndpoint":{"videoId":"([^"]+)".*?"title":"([^"]+)"/g;
    const altVideoMatches = [...html.matchAll(altVideoPattern)];
    
    // Combine both patterns
    const allMatches = [...videoMatches, ...altVideoMatches];
    
    // Remove duplicates and process videos
    const seenVideoIds = new Set<string>();
    
    for (const match of allMatches) {
      const videoId = match[1];
      const title = match[2];
      
      if (videoId && title && !seenVideoIds.has(videoId)) {
        seenVideoIds.add(videoId);
        
        videos.push({
          id: `topic-${Date.now()}-${videoId}`,
          title: title.replace(/\\u0026/g, '&').replace(/\\"/g, '"'),
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          duration: 'N/A' // Duration extraction would require additional API calls
        });
      }
    }

    // Fallback: if no videos found with regex, try another approach
    if (videos.length === 0) {
      // Look for ytInitialData in the HTML
      const ytDataMatch = html.match(/var ytInitialData = ({.*?});/);
      if (ytDataMatch) {
        try {
          const ytData = JSON.parse(ytDataMatch[1]);
          
          // Navigate the YouTube data structure to find videos
          const contents = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
          
          if (contents) {
            for (const section of contents) {
              const videoList = section?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
              
              if (videoList) {
                for (const item of videoList) {
                  const videoRenderer = item?.playlistVideoRenderer;
                  if (videoRenderer) {
                    const videoId = videoRenderer?.videoId;
                    const title = videoRenderer?.title?.runs?.[0]?.text || videoRenderer?.title?.simpleText;
                    
                    if (videoId && title && !seenVideoIds.has(videoId)) {
                      seenVideoIds.add(videoId);
                      
                      videos.push({
                        id: `topic-${Date.now()}-${videoId}`,
                        title: title,
                        videoUrl: `https://www.youtube.com/embed/${videoId}`,
                        duration: 'N/A'
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing ytInitialData:', e);
        }
      }
    }

    if (videos.length === 0) {
      throw new Error('No videos found in playlist. The playlist might be private or empty.');
    }

    return {
      playlistTitle: playlistTitle || 'Imported Playlist',
      videos: videos.slice(0, 50) // Limit to first 50 videos
    };

  } catch (error) {
    console.error('Error scraping playlist:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playlistUrl } = await request.json();

    if (!playlistUrl) {
      return NextResponse.json(
        { error: 'Playlist URL is required' },
        { status: 400 }
      );
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      return NextResponse.json(
        { error: 'Invalid YouTube playlist URL' },
        { status: 400 }
      );
    }

    // Scrape playlist data
    const playlistData = await scrapePlaylist(playlistId);
    
    return NextResponse.json({
      success: true,
      data: playlistData
    });

  } catch (error: any) {
    console.error('Error processing playlist:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process playlist',
        success: false
      },
      { status: 500 }
    );
  }
} 