# PDF to HTML Conversion with Drawing Tools

This project provides a web application that allows you to:
1. Convert PDF files to HTML for web display
2. Draw annotations directly on the converted PDF
3. Upload PDFs or provide URLs to convert them

## Architecture

The system consists of two main parts:

1. **Backend Service**: Node.js Express server that handles PDF-to-HTML conversion
2. **Frontend Application**: React application that displays the HTML and provides drawing tools

## Prerequisites

You need to install pdf2htmlEX on your server. This is a tool that converts PDF files to HTML:

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install pdf2htmlex
```

### macOS (using Homebrew):
```bash
brew install pdf2htmlex
```

For other platforms, see the [pdf2htmlEX documentation](https://github.com/pdf2htmlEX/pdf2htmlEX).

## Backend Setup

1. Navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The server will run on http://localhost:5000 by default.

## Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000.

## How to Use

1. Open the web application
2. Either:
   - Enter a URL to a PDF file and click "Convert", or
   - Upload a PDF file from your computer
3. The PDF will be converted to HTML and displayed in the viewer
4. Use the drawing tools to annotate the document:
   - Choose between pencil, eraser, or cursor mode
   - Adjust color, line width, and opacity for the pencil
   - Draw directly on the PDF

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/upload-pdf`: Upload a PDF file for conversion
  - Request: `multipart/form-data` with a file field named `pdf`
  - Response: JSON with `success`, `message`, and `htmlUrl` fields

- `POST /api/convert-pdf-url`: Convert a PDF from a URL
  - Request: JSON with a `pdfUrl` field
  - Response: JSON with `success`, `message`, and `htmlUrl` fields

## Project Structure

```
├── backend/
│   ├── backend.js           # Express server
│   ├── package.json
│   ├── uploads/             # Temporary PDF storage
│   └── public/
│       └── converted/       # HTML output files
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx
│   │   │   ├── DrawingControls.tsx
│   │   │   ├── PDFViewer.tsx
│   │   │   └── PdfAsHtmlViewer.tsx
│   │   ├── services/
│   │   │   └── PDFService.ts
│   │   ├── types/
│   │   │   └── drawing.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```#   b c e n d  
 