// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config()
const port = process.env.PORT


const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const authRoutes = require('./routes/authRoutes');
const blogGenerateRoutes = require('./routes/blogGenerateRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productReviewRoutes')
const creditRoutes = require('./routes/creditRoutes')
const subsRoutes = require('./routes/subscriptionRoutes')
const customizeContent = require('./routes/customizeContentRoutes')
const promptRoutes = require('./routes/promptRoutes')

app.use('/auth', authRoutes);
app.use('/blog-generate', blogGenerateRoutes);
app.use('/website', websiteRoutes);
app.use('/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/product-review', productRoutes);
app.use('/credits', creditRoutes);
app.use('/subscription', subsRoutes)
app.use('/', customizeContent)
app.use('/prompt', promptRoutes)




app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
