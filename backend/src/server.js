const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config(); // ✅ VIP Workflow System — Phase 1 Complete

const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Connect DB
connectDB();

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use http server and attach socket.io
const http = require('http');
const server = http.createServer(app);
const { init } = require('./utils/socket');
init(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});