import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'kstubhieeee/pdfs';
const MAX_FILE_SIZE = 100 * 1024 * 1024;

interface UploadRequest {
  fileName: string;
  content: string; // Base64 encoded PDF content
  year: string;
  semester: string;
  branch: string;
  subject: string;
  moduleId: string;
}

// Helper function to create folder structure
function createFolderPath(year: string, semester: string, branch: string, subject: string, moduleId: string): string {
  return `${year}/${semester}/${branch}/${subject}/${moduleId}`;
}

// Helper function to get existing files in a folder
async function getExistingFiles(folderPath: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${folderPath}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (response.status === 404) {
      return []; // Folder doesn't exist yet
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting existing files:', error);
    return [];
  }
}

// Helper function to upload file to GitHub
async function uploadToGitHub(filePath: string, content: string, message: string): Promise<any> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message,
        content,
        branch: 'main', // or 'master' depending on your default branch
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub upload failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to get file download URL
function getFileDownloadUrl(filePath: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${filePath}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const body: UploadRequest = await request.json();
    const { fileName, content, year, semester, branch, subject, moduleId } = body;

    // Validate required fields
    if (!fileName || !content || !year || !semester || !branch || !subject || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (100 MB limit)
    const fileSize = Buffer.from(content, 'base64').length;
    
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size ${(fileSize / (1024 * 1024)).toFixed(2)} MB exceeds the 100 MB limit` },
        { status: 400 }
      );
    }

    // Validate PDF file extension
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Sanitize file name to prevent URL encoding issues
    const sanitizedFileName = fileName
      .replace(/[^\w\s.-]/g, '') // Remove special characters except spaces, dots, and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Check if file name was significantly changed
    if (sanitizedFileName !== fileName) {
      console.log(`File name sanitized: "${fileName}" -> "${sanitizedFileName}"`);
    }

    // Create folder path
    const folderPath = createFolderPath(year, semester, branch, subject, moduleId);
    const filePath = `${folderPath}/${sanitizedFileName}`;

    // Check if file already exists
    const existingFiles = await getExistingFiles(folderPath);
    const fileExists = existingFiles.some((file: any) => file.name === sanitizedFileName);

    if (fileExists) {
      return NextResponse.json(
        { error: 'File with this name already exists in this module' },
        { status: 409 }
      );
    }

    // Upload to GitHub
    const uploadResult = await uploadToGitHub(
      filePath,
      content,
      `Add ${sanitizedFileName} to ${subject} - Module ${moduleId}`
    );

    // Get the download URL
    const downloadUrl = getFileDownloadUrl(filePath);

    return NextResponse.json({
      success: true,
      file: {
        name: sanitizedFileName,
        path: filePath,
        downloadUrl,
        size: Buffer.from(content, 'base64').length,
        uploadedAt: new Date().toISOString(),
        gitHubUrl: uploadResult.content.html_url,
      },
      originalFileName: fileName !== sanitizedFileName ? fileName : undefined,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const branch = searchParams.get('branch');
    const subject = searchParams.get('subject');
    const moduleId = searchParams.get('moduleId');

    if (!year || !semester || !branch || !subject || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const folderPath = createFolderPath(year, semester, branch, subject, moduleId);
    const files = await getExistingFiles(folderPath);

    // Filter only PDF files and format response
    const pdfFiles = files
      .filter((file: any) => file.name.toLowerCase().endsWith('.pdf'))
      .map((file: any) => ({
        name: file.name,
        path: file.path,
        downloadUrl: getFileDownloadUrl(file.path),
        size: file.size,
        gitHubUrl: file.html_url,
      }));

    return NextResponse.json({
      success: true,
      files: pdfFiles,
      folderPath,
    });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const { filePath, message } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Get file info to get the SHA
    const fileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = await fileResponse.json();

    // Delete the file
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: message || `Delete ${filePath}`,
          sha: fileData.sha,
          branch: 'main',
        }),
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`GitHub delete failed: ${deleteResponse.status} - ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
} 