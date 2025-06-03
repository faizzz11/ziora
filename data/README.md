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

## Adding New Content

### Adding a New Subject
1. Add subject entry to `subjects.json`
2. Add corresponding entry to `videos.json` with modules and topics
3. Ensure the subject ID matches between both files

### Adding Video Content
1. Upload video to YouTube
2. Get the embed URL (format: `https://www.youtube.com/embed/VIDEO_ID`)
3. Add topic entry with video URL, duration, and notes
4. For module notes, upload PDF to Google Drive and get preview URL

### Adding PDF Notes
1. Upload PDF to Google Drive
2. Set sharing to "Anyone with the link can view"
3. Get the preview URL (format: `https://drive.google.com/file/d/FILE_ID/preview`)
4. Add `pdfUrl` field to the module in `videos.json`

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

## File Dependencies

- **subjects.json** → Used by subjects page and all subject-specific pages
- **videos.json** → Used by video lectures and notes pages  
- **sections.json** → Used by individual subject pages
- **features.json** → Used by landing page
- **content.json** → Used by landing page

Make sure to maintain consistency across these files, especially with subject IDs and naming conventions. 