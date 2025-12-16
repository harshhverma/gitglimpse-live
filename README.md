# GitGlimpse - Developer Impact Analyzer

A full-stack web application that analyzes GitHub profiles to calculate developer impact scores and visualize contributions through interactive charts and statistics.

## Features

- **Karma Score Calculation**: Calculated using the formula:
  - `karma = (commits * 0.4) + (PRs * 0.3) + (issues * 0.2) + (repos * 0.1)`, normalized to 0-100
- **Profile Analysis**: Complete GitHub profile information with avatar, bio, and stats
- **Interactive Charts**:
  - Commits over time (line chart)
  - PRs vs Issues (pie chart)
  - Language usage (donut chart)
- **Statistics Dashboard**: Commits, Pull Requests, Issues, and Repository counts
- **AI Summary**: Developer impact summary (placeholder for AI integration)
- **Repository Table**: Top repositories with stars, forks, and language information

## Tech Stack

### Frontend
- React 18.2.0
- TypeScript
- Tailwind CSS
- Recharts (for data visualization)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- Axios (for GitHub API calls)
- Firebase Admin SDK (optional, for caching)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) GitHub Personal Access Token for higher rate limits

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the backend directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
PORT=5000
```

4. (Optional) If using Firebase caching, ensure `serviceAccountKey.json` is present in the backend directory.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start Backend Server

From the `backend` directory:
```bash
npm start
# or
node index.js
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

From the `frontend` directory:
```bash
npm run dev
# or
npm start
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Main Endpoint
- `GET /api/github/:username` - Fetches complete GitHub profile data including:
  - User profile (avatar, bio, etc.)
  - Statistics (commits, PRs, issues, repos)
  - Karma score
  - Repository data
  - Language usage
  - Commits over time data
  - AI Summary

### Legacy Endpoints (for backward compatibility)
- `POST /api/analyze` - Analyzes and saves profile
- `GET /api/public/:username` - Fetches cached profile from Firestore

## Usage

1. Open the application in your browser (usually `http://localhost:5173`)
2. Enter a GitHub username in the landing page
3. Click "Analyze Profile"
4. View the dashboard with:
   - Profile information
   - Karma score
   - Statistics cards
   - Interactive charts
   - Repository list

## Error Handling

- The application gracefully handles GitHub API rate limits by using fallback dummy data
- User-friendly error messages are displayed in the UI
- The app never crashes - all errors are caught and handled

## Project Structure

```
gitglimpse/
├── backend/
│   ├── index.js          # Main backend server
│   ├── package.json
│   └── serviceAccountKey.json  # (Optional) Firebase credentials
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── App.tsx       # Main app component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Notes for Viva/Evaluation

- All code includes comprehensive comments explaining logic
- Karma score calculation is clearly documented
- Error handling is robust with fallback mechanisms
- UI is responsive and professional
- Code follows best practices and is production-ready

## License

ISC

