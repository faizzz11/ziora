# Data Structure Documentation

This directory contains all the JSON data files used throughout the Ziora educational website. These files allow for easy content management without requiring code changes.

## Files Overview

### subjects.json
Contains the main subject data displayed on the subjects page.

**Structure:**
```json
{
  "subjects": [
    {
      "id": "subject-slug",
      "name": "Subject Display Name",
      "description": "Brief description",
      "icon": "emoji-icon",
      "topics": ["topic1", "topic2"],
      "materials": "materials description",
      "color": "color-class"
    }
  ]
}
```

**Used in:** `/subjects` page

### sections.json
Contains the 5 main sections for each subject page.

**Structure:**
```json
{
  "sections": [
    {
      "id": "section-slug",
      "title": "Section Title",
      "description": "Section description",
      "icon": "icon-path",
      "path": "/relative/path"
    }
  ]
}
```

**Used in:** `/subject/[subjectName]` pages

### features.json
Contains feature data for the landing page.

**Structure:**
```json
{
  "features": [
    {
      "icon": "icon-component",
      "title": "Feature Title",
      "description": "Feature description"
    }
  ]
}
```

**Used in:** Landing page features section

### content.json
Contains hero section and other content for the landing page.

**Structure:**
```json
{
  "hero": {
    "title": "Main heading",
    "subtitle": "Subheading",
    "description": "Description text",
    "cta": "Button text"
  }
}
```

**Used in:** Landing page hero section

### videos.json
Contains video lectures and notes data for each subject, organized by modules and topics.

**Structure:**
```json
{
  "subject-id": {
    "modules": [
      {
        "id": "module-id",
        "name": "Module Name",
        "pdfUrl": "Google Drive preview URL for module notes",
        "relatedVideoLink": "YouTube video URL related to this module",
        "topics": [
          {
            "id": "topic-id",
            "title": "Topic Title",
            "videoUrl": "YouTube embed URL",
            "duration": "MM:SS format",
            "notes": "Topic description/notes"
          }
        ]
      }
    ]
  }
}
```

**Key Fields:**
- `pdfUrl`: Google Drive preview URL for PDF notes (used in notes page)
- `relatedVideoLink`: YouTube video URL that relates to the entire module
- `videoUrl`: YouTube embed URL for individual topic videos
- `duration`: Video duration in MM:SS format
- `notes`: Brief description or notes about the topic

**Used in:** 
- `/subject/[subjectName]/video-lectures` - Uses topics for individual video playback
- `/subject/[subjectName]/notes` - Uses modules for PDF notes display

### pyq.json
Contains previous year question papers data for each subject.

**Structure:**
```json
{
  "subject-id": {
    "subjectName": "Subject Display Name",
    "papers": [
      {
        "id": "unique-paper-id",
        "title": "Display Title (e.g., May 2024)",
        "year": "YYYY",
        "month": "Month Name",
        "fileName": "filename.pdf",
        "imagePreview": "/PYQ-img/preview-image.jpg"
      }
    ]
  }
}
```

**Key Fields:**
- `id`: Unique identifier for the paper (e.g., "may-2024")
- `title`: Display title shown in dropdown
- `year`: Year of the question paper
- `month`: Month when the exam was conducted
- `fileName`: PDF filename stored in `/public/PYQ-img/` folder
- `imagePreview`: Preview image path for the question paper

**Used in:** `/subject/[subjectName]/previous-year-questions` - Displays question papers with dropdown selection

### syllabus.json
Contains structured syllabus data for each subject with modules, topics, and hours.

**Structure:**
```json
{
  "subject-id": {
    "subjectName": "Subject Display Name",
    "totalHours": 48,
    "modules": [
      {
        "moduleNo": "1.0",
        "title": "Module Title",
        "hours": 8,
        "topics": [
          "Topic 1: Description",
          "Topic 2: Description",
          "Topic 3: Description"
        ]
      }
    ]
  }
}
```

**Key Fields:**
- `subjectName`: Full name of the subject
- `totalHours`: Total course duration in hours
- `moduleNo`: Module number (e.g., "1.0", "2.0")
- `title`: Module title/name
- `hours`: Hours allocated to this module
- `topics`: Array of topics covered in the module

**Used in:** `/subject/[subjectName]/syllabus-important-questions` - Displays structured syllabus in tabular format

### IMP-Questions.json
Contains important questions for each subject organized by modules with frequency indicators.

**Structure:**
```json
{
  "subject-id": {
    "subjectName": "Subject Display Name",
    "modules": [
      {
        "moduleNo": "1.0",
        "title": "Module Title",
        "questions": [
          {
            "question": "Question text here?",
            "frequency": 1,
            "repetition": "Most repeated"
          }
        ]
      }
    ]
  }
}
```

**Key Fields:**
- `question`: The actual question text
- `frequency`: Numerical frequency ranking (1-4)
  - `1`: Most repeated (Red color)
  - `2`: 2nd most repeated (Blue color)
  - `3`: 3rd most repeated (Yellow color)
  - `4`: One time repeated (Black color)
- `repetition`: Human-readable repetition description

**Used in:** `/subject/[subjectName]/syllabus-important-questions` - Displays color-coded important questions

## Page Functionality

### Video Lectures Page
- **Navigation:** Previous/Next topic buttons cycle through all topics across modules
- **Sidebar:** Expandable modules showing topic lists with video durations
- **Video Player:** YouTube embedded videos with descriptions
- **Comments:** Discussion section for each video topic

### Notes Page
- **Navigation:** Previous/Next module buttons cycle through modules
- **PDF Viewer:** Large iframe displaying module PDF notes (70vh height)
- **Related Video:** Button to open related video in new tab
- **Download:** PDF download functionality
- **Sidebar:** Module selection with topic count and availability indicators
- **Comments:** Discussion section specific to module notes

### Previous Year Questions Page
- **Dropdown Selection:** Choose from available question papers by year/month
- **Paper Preview:** Image preview of the selected question paper
- **Zoom Functionality:** Click on paper to zoom in/out for better readability
- **Full Screen:** Button to open complete PDF in new tab
- **Download:** Direct download of the PDF question paper
- **Professional Layout:** Clean design matching website theme

### Syllabus & Important Questions Page
- **Tabbed Interface:** Switch between Syllabus and Important Questions views
- **Structured Syllabus Table:** Professional tabular display with modules, topics, and hours
- **Color-coded Questions:** Important questions with frequency-based color coding
- **Legend:** Clear indication of question repetition frequency
- **Module Organization:** Questions organized by course modules
- **Responsive Design:** Works well on desktop and mobile devices

## Adding New Content

### Adding a New Subject
1. Add subject entry to `subjects.json`
2. Add corresponding entries to `videos.json`, `pyq.json`, `syllabus.json`, and `IMP-Questions.json`
3. Ensure the subject ID matches across all files

### Adding Video Content
1. Upload video to YouTube
2. Get the embed URL (format: `https://www.youtube.com/embed/VIDEO_ID`)
3. Add topic entry with video URL, duration, and notes
4. For module notes, upload PDF to Google Drive and get preview URL

### Adding PDF Notes
1. Upload PDF to Google Drive
2. **Important:** Set sharing permissions correctly:
   - Right-click the PDF file in Google Drive
   - Click "Share"
   - Click "Change to anyone with the link"
   - Select "Viewer" permissions
   - Click "Copy link"
3. Convert the sharing URL to preview format:
   - **Sharing URL:** `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - **Preview URL for embedding:** `https://drive.google.com/file/d/FILE_ID/preview`
4. Add the preview URL to the `pdfUrl` field in the module in `videos.json`

### Adding Previous Year Question Papers
1. **Prepare Files:**
   - PDF file of the question paper
   - Preview image (JPG/PNG) of the first page or cover
   
2. **File Naming Convention:**
   - PDF: `subject-month-year.pdf` (e.g., `operating-system-may-2024.pdf`)
   - Image: `subject-month-year.jpg` (e.g., `operating-system-may-2024.jpg`)
   
3. **Upload Files:**
   - Place both files in `/public/PYQ-img/` folder
   - Ensure file names match exactly
   
4. **Update JSON:**
   - Add entry to `pyq.json` under the appropriate subject
   - Use correct file paths: `/PYQ-img/filename`
   
5. **Example Entry:**
```json
{
  "id": "may-2024",
  "title": "May 2024",
  "year": "2024", 
  "month": "May",
  "fileName": "operating-system-may-2024.pdf",
  "imagePreview": "/PYQ-img/operating-system-may-2024.jpg"
}
```

### Adding Syllabus Content
1. **Structure your syllabus data:**
   - Break down the course into logical modules
   - List all topics covered in each module
   - Specify hours allocated to each module
   
2. **Update syllabus.json:**
   - Add entry under the subject ID
   - Include subject name and total hours
   - List all modules with their topics and hours
   
3. **Example Entry:**
```json
{
  "subject-id": {
    "subjectName": "Subject Name",
    "totalHours": 48,
    "modules": [
      {
        "moduleNo": "1.0",
        "title": "Introduction Module",
        "hours": 8,
        "topics": [
          "Topic 1 description",
          "Topic 2 description"
        ]
      }
    ]
  }
}
```

### Adding Important Questions
1. **Organize questions by modules:**
   - Group questions according to course modules
   - Assign frequency rankings based on repetition
   
2. **Frequency Guidelines:**
   - `1` (Red): Questions that appear in most exams
   - `2` (Blue): Questions that appear frequently
   - `3` (Yellow): Questions that appear occasionally
   - `4` (Black): Questions that appear rarely
   
3. **Update IMP-Questions.json:**
   - Add entry under the subject ID
   - Include all modules with their questions
   - Assign appropriate frequency and repetition labels
   
4. **Example Entry:**
```json
{
  "subject-id": {
    "subjectName": "Subject Name",
    "modules": [
      {
        "moduleNo": "1.0",
        "title": "Module Title",
        "questions": [
          {
            "question": "What is the main concept? Explain in detail.",
            "frequency": 1,
            "repetition": "Most repeated"
          }
        ]
      }
    ]
  }
}
```

### Google Drive PDF Setup (Important!)
To avoid 403 errors when embedding PDFs:

1. **File Permissions:**
   - File must be shared with "Anyone with the link can view"
   - Must NOT be restricted to specific people or organizations
   - Must NOT require sign-in to view

2. **URL Format:**
   - ✅ **Correct:** `https://drive.google.com/file/d/FILE_ID/preview`
   - ❌ **Wrong:** `https://drive.google.com/file/d/FILE_ID/view`
   - ❌ **Wrong:** `https://drive.google.com/file/d/FILE_ID/edit`

3. **Troubleshooting 403 Errors:**
   - Check if the file sharing is set to "Anyone with the link"
   - Ensure you're using `/preview` not `/view` in the URL
   - Try opening the preview URL directly in a browser to test
   - The PDF should be accessible without requiring Google sign-in

4. **File Size Limitations:**
   - Very large PDFs (>25MB) might not preview properly
   - Consider compressing large PDF files before uploading

### YouTube URL Formats
- **For individual topics:** `https://www.youtube.com/embed/VIDEO_ID`
- **For related videos:** `https://www.youtube.com/watch?v=VIDEO_ID` or embed format

### Google Drive PDF URLs
- **Sharing URL:** `https://drive.google.com/file/d/FILE_ID/view`
- **Preview URL for embedding:** `https://drive.google.com/file/d/FILE_ID/preview`

## Content Management Tips

1. **Consistent IDs:** Use kebab-case for all IDs (e.g., "operating-system", "module-1")
2. **Video Durations:** Always include accurate durations in MM:SS format
3. **Descriptions:** Keep topic notes concise but informative
4. **PDF Quality:** Ensure PDFs are high quality and readable when embedded
5. **Testing:** Always test new URLs before adding to production data
6. **PDF Sharing:** Double-check Google Drive sharing permissions to avoid 403 errors
7. **PYQ Images:** Use high-quality preview images for better user experience
8. **File Organization:** Keep consistent naming conventions for easy management
9. **Syllabus Structure:** Break down complex topics into digestible subtopics
10. **Question Frequency:** Be consistent with frequency assignments across subjects
11. **Module Hours:** Ensure module hours add up to total course hours
12. **Question Quality:** Focus on exam-relevant questions for important questions section

## File Dependencies

- **subjects.json** → Used by subjects page and all subject-specific pages
- **videos.json** → Used by video lectures and notes pages  
- **sections.json** → Used by individual subject pages
- **features.json** → Used by landing page
- **content.json** → Used by landing page
- **pyq.json** → Used by previous year questions pages
- **syllabus.json** → Used by syllabus & important questions page (syllabus tab)
- **IMP-Questions.json** → Used by syllabus & important questions page (important questions tab)

Make sure to maintain consistency across these files, especially with subject IDs and naming conventions. 