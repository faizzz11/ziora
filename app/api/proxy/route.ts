import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
  // Get the URL to proxy from the query parameter
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Check if this is a GitHub raw URL and add authentication for private repos
    const isGitHubRaw = url.includes('raw.githubusercontent.com');
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 File Proxy',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Add GitHub token for private repository access
    if (isGitHubRaw && process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    // Fetch the requested resource
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Special handling for GitHub authentication issues
      if (response.status === 404 && isGitHubRaw) {
        return NextResponse.json(
          { 
            error: `File not found (404). This could mean:
• The file is still being processed
• The file path is incorrect
• The file was deleted or moved
• Access permissions are required`
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type and other relevant headers from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');
    const contentLength = response.headers.get('content-length');
    
    // Create headers object with all necessary headers
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Proxy-Source': 'File-Proxy'
    });
    
    // Add additional headers if they exist
    if (contentDisposition) responseHeaders.set('Content-Disposition', contentDisposition);
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    
    // Handle different content types appropriately
    if (contentType.includes('text/') || 
        contentType.includes('application/json') || 
        contentType.includes('application/javascript') ||
        url.toLowerCase().endsWith('.md') ||
        url.toLowerCase().endsWith('.markdown')) {
      // For text-based content, use text()
      const text = await response.text();
      responseHeaders.set('Content-Type', 'text/plain; charset=utf-8');
      return new NextResponse(text, {
        status: 200,
        headers: responseHeaders,
      });
    } else if (contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf')) {
      // For PDF files, add additional headers
      responseHeaders.set('Content-Type', 'application/pdf');
      responseHeaders.set('Accept-Ranges', 'bytes');
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: responseHeaders,
      });
    } else {
      // For all other content types, use arrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 