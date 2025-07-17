// Import required packages
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // This loads variables from the .env file

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000;

// --- Middleware Setup ---
app.use(cors());            // Enable CORS for all routes
app.use(express.json());    // Parse JSON request bodies

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // App password
  },
});

// Verify transporter config
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter configuration:', error);
  } else {
    console.log('Email transporter is ready and configured correctly.');
  }
});

// --- Contact Form Route ---
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Define email options
  const mailOptions = {
    from: `${name} <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Portfolio Contact: ${subject}`,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
    console.log('Email sent successfully: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
