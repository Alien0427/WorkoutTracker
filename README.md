# WorkoutTracker

A full-stack workout tracking application built with the MERN stack (MongoDB, Express, React, Node.js). This comprehensive fitness management platform helps users track their fitness journey with an intuitive and responsive interface.

## Features
- Track exercises, workouts, and progress
- User authentication
- RESTful API backend
- Responsive UI

## Project Structure
```
WORKOUTTRACKER/
├── client/       # React frontend
├── server/       # Node.js/Express backend
├── start-client.bat   # Windows batch to start frontend
├── start-server.bat   # Windows batch to start backend
```

## Prerequisites
- Node.js (v14 or newer recommended)
- npm

## Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/Alien0427/WorkoutTracker.git
cd WorkoutTracker
```

### 2. Install Dependencies
#### Frontend
```
cd client
npm install
```
#### Backend
```
cd ../server
npm install
```

### 3. Environment Variables
- Copy `server/.env.example` to `server/.env` and fill in required values (if .env.example exists; otherwise, edit .env directly).

### 4. Running the App
#### Start Backend
```
cd server
npm start
```
#### Start Frontend
```
cd client
npm start
```

Or use the provided batch files from the project root:
```
start-server.bat
start-client.bat
```

## Usage
- Access the frontend at [http://localhost:3000](http://localhost:3000)
- The backend runs at [http://localhost:5000](http://localhost:5000) (or as configured)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
