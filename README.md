# QuizMorph

QuizMorph is a visual-first personality quiz platform. Build beautiful interactives and share them with the world.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB (Defaults to `mongodb-memory-server` if no `MONGO_URI` is provided for zero-config local development setup)

## Setup Instructions

### Environment Variables
By default, the backend configures an in-memory MongoDB structure. When you're ready for production:
1. Navigate to the `backend/` folder
2. Create `.env` file
3. Add `MONGO_URI=your_atlas_connection_string` and `JWT_SECRET=your_jwt_secret`

### Starting the Project (Local Development)

The project consists of a separate frontend and backend folder.

**1. Start Backend:**
```bash
cd backend
npm install
npm run dev # or node server.js
```
The server runs on http://localhost:5000.

**2. Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The site will run on http://localhost:5173.

## Features
- **Public Exploration**: Discover and play published personality quizzes.
- **Creator Dashboard**: View analytics and drafts of your created quizzes.
- **Advanced Builder**:
  - Add potential Outcomes/Results (`Keys`)
  - Create visual questions
  - Map specific multi-choice options to increment score vectors for each `Key`
- **Quiz Player Engine**: Dynamic scoring calculates the highest weighing result at the end of the quiz!
