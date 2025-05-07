# Gemini AI Multimodal Demo

This is a multimodal AI application that demonstrates the capabilities of Google's Gemini 1.5 Flash model. The application allows users to upload images and analyze them using different AI tasks.

## Features

- Multiple AI tasks support:
  - Image analysis and description
  - Visual question answering
  - Text extraction from images
  - Creative content generation based on images
- User-friendly interface with Google-inspired design
- Drag-and-drop image upload capability
- Configurable prompts for different tasks
- Real-time preview of uploaded images
- Client-side caching of results
- Advanced error handling
- Biome.js for code linting and formatting

## Getting Started

### Prerequisites

- Node.js 18+ installed on your local development machine
- A Google API key for Gemini models

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env.local` file in the root directory and add your Gemini API key:
   \`\`\`
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

This project uses Biome.js for linting and formatting. You can run the following commands:

- `npm run lint` - Check for linting issues
- `npm run format` - Format code
- `npm run check` - Check and fix linting issues

## How It Works

1. Select a task type (analysis, Q&A, text extraction, or creative generation)
2. Upload an image via drag-and-drop or file selection
3. Customize the prompt or use task-specific defaults
4. Click "Analyze with Gemini" to process the request
5. View the results in the formatted output panel

## Environment Variables

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google API key for Gemini models

## License

This project is licensed under the MIT License - see the LICENSE file for details.
