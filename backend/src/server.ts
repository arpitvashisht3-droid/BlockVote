import express from 'express';
import { config } from './config/env';
import healthRouter from './routes/health';
import electionsRouter from './routes/elections';
import candidatesRouter from './routes/candidates';
import usersRouter from './routes/users';
import transactionsRouter from './routes/transactions';
import { authenticateUser } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = config.port;

// CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// Public routes
app.use('/api', healthRouter);
app.use('/api/users', usersRouter); // Handles its own public (/register, /login) and protected (/me) endpoints

// Protected routes requiring Bearer authentication
app.use(authenticateUser);
app.use('/api/elections', electionsRouter);
app.use('/api/elections', candidatesRouter);
app.use('/api/transactions', transactionsRouter);

// Centralized error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
