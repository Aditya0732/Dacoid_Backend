const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 4001;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const url = process.env.MONGODB_URL;

const routes = require('./routes');
const authenticate = require('./middleware/authMiddleware');

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect("mongodb+srv://patiladitya7219:qZIBfjtYaFdwfbB0@dacoid.xu9vbw6.mongodb.net/?retryWrites=true&w=majority&appName=dacoid", {})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});


app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
