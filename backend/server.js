require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(compression()); // Compress all routes
app.use(cors()); // Enable All CORS Requests for development
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter); // Apply the rate limiting middleware to all requests

// Global Error Handler Middleware (Basic)
// This should be defined after all routes and other middlewares
// For now, placing it here and will move it later if needed.
function errorHandler(err, req, res, next) {
  console.error("Global Error Handler Caught:");
  console.error("Error Status:", err.status || 500);
  console.error("Error Message:", err.message || 'Something went wrong!');
  if (err.stack) {
    console.error("Error Stack:", err.stack);
  }

  // Avoid sending stack trace to client in production
  const isProduction = process.env.NODE_ENV === 'production';
  const errorResponse = {
    success: false,
    message: err.message || 'An unexpected error occurred.',
    ...( !isProduction && err.stack && { stack: err.stack }), // include stack only in non-prod
    ...( err.errors && { errors: err.errors }) // for validation errors etc.
  };

  res.status(err.status || 500).json(errorResponse);
}


// Test DB Connection
async function checkDbConnection() {
  try {
    const pool = await db.getPool(); // Uses getPool to ensure connection
    if (pool) {
      console.log('Database connection verified via getPool().');
      // Optional: Perform a simple query
      // const result = await pool.request().query('SELECT 1 AS number');
      // console.log('Simple query result:', result.recordset[0].number);
    } else {
      console.error('Failed to get database pool.');
    }
  } catch (err) {
    console.error('Failed to connect to the database from server.js:', err.message);
  }
}

checkDbConnection();

// Basic Route
app.get('/', (req, res) => {
  res.send('Paper Management System API Running');
});

// API routes
const authRoutes = require('./routes/authRoutes');
const paperRoutes = require('./routes/paperRoutes');
const branchRoutes = require('./routes/branchRoutes');
// const userRoutes = require('./routes/userRoutes'); // To be created for user management by admin
// const permissionRoutes = require('./routes/permissionRoutes'); // To be created for permission management

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes); // Protection is handled within the paperRoutes file
app.use('/api/branches', branchRoutes);
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activity-log', require('./routes/activityLogRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/permissions', require('./routes/permissionRoutes'));


// Catch-all for 404 Not Found errors
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error); // Pass the error to the global error handler
});

// Use the Global Error Handler
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:${PORT}\`);
  console.log(\`Ensure you have a .env file in the backend directory with your SQL Server credentials.\`);
  console.log(\`Example .env content can be found in .env.example\`);
});
