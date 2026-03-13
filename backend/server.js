const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models');

const app = express();

// 🔥 SUPER PERMISSIVE CORS FOR TESTING - Replace your entire CORS config with this
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://expense-tracking2.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Also keep the cors package for good measure
app.use(cors({
  origin: 'https://expense-tracking2.vercel.app',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to verify backend is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running!',
    frontend: 'https://expense-tracking2.vercel.app',
    cors: 'enabled'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Test endpoint working' });
});

// Your routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));

console.log('📋 Registered Routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`  ${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router' && r.handle.stack) {
    console.log(`  Router: ${r.regexp}`);
  }
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Accepting requests from: https://expense-tracking2.vercel.app`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });