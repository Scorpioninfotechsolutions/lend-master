# Lend Master

A comprehensive lending management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication with role-based access control (Admin, Lender, Borrower, Referrer)
- Loan creation and management
- Repayment tracking and scheduling
- Dashboard with key metrics and insights
- Reports generation

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd lend-master
```

2. Install dependencies for both client and server
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
   - In the server directory, create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   COOKIE_EXPIRE=30
   ```

### Running the Application

1. Start the server
```
cd server
npm run dev
```

2. In a new terminal window, start the client
```
cd client
npm run dev
```

3. Access the application at `http://localhost:5173`

## License

This project is licensed under the ISC License. 


String= mongodb+srv://gokul:Gokul16668@cluster0.lfzseao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

user: admin
Pass: admin123