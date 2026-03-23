const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models');

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://expense-tracking2.vercel.app',
  'https://expense-tracker-okxp.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
   
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });