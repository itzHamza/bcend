const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const cors = require("cors");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Create uploads and output directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Middleware to handle binary PDF uploads
app.use(express.raw({ type: "application/pdf", limit: "50mb" }));

// Helper function to execute pdf2htmlEX conversion
async function convertPdfToHtml(pdfPath, outputDir, uniqueId) {
  return new Promise((resolve, reject) => {
    const outputFilename = `${uniqueId}.html`;

    // pdf2htmlEX command with options for text selection
    const command = `pdf2htmlEX --dest-dir ${outputDir} --zoom 1.3 --process-outline 0 --fit-width 800 --font-format woff --embed-css 1 --embed-font 1 --embed-image 1 --embed-javascript 0 --embed-outline 0 --split-pages 0 --bg-format png --fallback 1 --dest-dir ${outputDir} --optimize-text 1 --correct-text-visibility 1 --space-as-offset 0 --tounicode 1 ${pdfPath} ${outputFilename}`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during conversion: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return reject(new Error(`Conversion failed: ${error.message}`));
      }

      console.log(`stdout: ${stdout}`);

      const outputPath = path.join(outputDir, outputFilename);
      if (fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error("Output file not found after conversion"));
      }
    });
  });
}

// Handle direct PDF uploads via FormData
app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    // If we have a file from multer
    if (req.file) {
      console.log("Processing uploaded file via FormData");
      const pdfPath = req.file.path;
      const uniqueId = path.basename(pdfPath).split("-")[0];

      try {
        const outputPath = await convertPdfToHtml(pdfPath, outputDir, uniqueId);

        // Read the generated HTML
        const htmlContent = fs.readFileSync(outputPath, "utf8");

        // Cleanup files
        cleanupFiles(pdfPath, outputPath);

        // Return the HTML content
        res.send(htmlContent);
      } catch (error) {
        console.error("Conversion error:", error);
        res
          .status(500)
          .json({ error: `PDF conversion failed: ${error.message}` });
      }
    }
    // If we have raw binary data
    else if (req.headers["content-type"] === "application/pdf") {
      console.log("Processing direct binary upload");
      const uniqueId = uuidv4();
      const pdfPath = path.join(uploadsDir, `${uniqueId}-document.pdf`);

      // Write the binary data to a file
      fs.writeFileSync(pdfPath, req.body);

      try {
        const outputPath = await convertPdfToHtml(pdfPath, outputDir, uniqueId);

        // Read the generated HTML
        const htmlContent = fs.readFileSync(outputPath, "utf8");

        // Cleanup files
        cleanupFiles(pdfPath, outputPath);

        // Return the HTML content
        res.send(htmlContent);
      } catch (error) {
        console.error("Conversion error:", error);
        res
          .status(500)
          .json({ error: `PDF conversion failed: ${error.message}` });
      }
    } else {
      res.status(400).json({ error: "No PDF file provided" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// Handle PDF URLs
app.post("/convert-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No PDF URL provided" });
    }

    console.log(`Processing PDF from URL: ${url}`);

    // Download the PDF
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(400)
        .json({ error: `Failed to download PDF: ${response.statusText}` });
    }

    const buffer = await response.buffer();
    const uniqueId = uuidv4();
    const pdfPath = path.join(uploadsDir, `${uniqueId}-document.pdf`);

    // Save the downloaded PDF
    fs.writeFileSync(pdfPath, buffer);

    try {
      const outputPath = await convertPdfToHtml(pdfPath, outputDir, uniqueId);

      // Read the generated HTML
      const htmlContent = fs.readFileSync(outputPath, "utf8");

      // Cleanup files
      cleanupFiles(pdfPath, outputPath);

      // Return the HTML content
      res.send(htmlContent);
    } catch (error) {
      console.error("Conversion error:", error);
      res
        .status(500)
        .json({ error: `PDF conversion failed: ${error.message}` });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// Helper function to clean up temporary files
function cleanupFiles(pdfPath, htmlPath) {
  try {
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
}

// Simple test route
app.get("/", (req, res) => {
  res.send("PDF to HTML Conversion API is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
