const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const studentRoutes = require('./routes/studentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const staffRoutes = require('./routes/staffRoutes');
const messRoutes = require('./routes/messRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT || 5001);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db.meta.mode,
  });
});

app.use('/students', studentRoutes);
app.use('/bookings', bookingRoutes);
app.use('/complaints', complaintRoutes);
app.use('/payments', paymentRoutes);
app.use('/rooms', roomRoutes);
app.use('/staff', staffRoutes);
app.use('/mess', messRoutes);

app.use(errorHandler);

db.connect((error) => {
  if (error) {
    console.error(`Failed to connect to MySQL: ${error.message}`);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port} using ${db.meta.mode} database mode`);
  });
});
