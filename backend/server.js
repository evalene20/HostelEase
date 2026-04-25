const express = require('express');
const cors = require('cors');   // 👈 ADD THIS

const app = express();

const errorHandler = require('./middleware/errorHandler');

app.use(cors());                // 👈 ADD THIS (VERY IMPORTANT POSITION)
app.use(express.json()); 

// Routes
const studentRoutes = require('./routes/studentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const staffRoutes = require('./routes/staffRoutes');
const messRoutes = require('./routes/messRoutes');

app.use('/students', studentRoutes);
app.use('/bookings', bookingRoutes);
app.use('/complaints', complaintRoutes);
app.use('/payments', paymentRoutes);
app.use('/rooms', roomRoutes);
app.use('/staff', staffRoutes);
app.use('/mess', messRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
