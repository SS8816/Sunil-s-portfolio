// Import required packages
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // This loads variables from the .env file

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000;

// --- Middleware Setup ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
// This allows your frontend (running on a different origin) to make requests to this backend.
app.use(cors());

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// --- Nodemailer Transporter Setup ---
// This 'transporter' object is what will actually send the emails.
// We configure it with our email service provider (Gmail) and our credentials.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address from the .env file
    pass: process.env.EMAIL_PASS, // Your generated App Password from the .env file
  },
});

// Optional: Verify that the transporter configuration is correct
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter configuration:', error);
  } else {
    console.log('Email transporter is ready and configured correctly.');
  }
});

// --- API Endpoint for Handling Contact Form Submission ---
// We define a POST route at '/api/contact'. The frontend will send its data here.
app.post('/api/contact', (req, res) => {
  // Destructure the form data from the request's body
  const { name, email, subject, message } = req.body;

  // Basic validation to ensure all fields are present
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Define the email's content
  const mailOptions = {
    from: "${name}" <${process.env.EMAIL_USER}>, // Use your email, but show the sender's name
    to: process.env.EMAIL_USER,                      // The email address that will receive the form submission
    subject: New Portfolio Contact: ${subject},     // Subject line of the email
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Use the transporter to send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // Send a server error status back to the frontend
      return res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
    console.log('Email sent successfully: ' + info.response);
    // Send a success status back to the frontend
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});

// --- Start the Server ---
// This command starts the server and makes it listen for incoming requests on the specified port.
app.listen(port, () => {
  console.log(Server is running on port: ${port});
});