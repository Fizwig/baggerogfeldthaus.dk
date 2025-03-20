# Bagger og Feldthaus Website

This is the official website for Bagger og Feldthaus, built with Next.js and featuring a beautiful neumorphic design.

## Features

- Modern, responsive design with neumorphic elements
- Tour poster display
- Ticket purchase integration
- Contact form with email functionality
- Pink and feminine color scheme

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your EmailJS credentials in `app/components/ContactForm.tsx`:
   - Replace `YOUR_SERVICE_ID` with your EmailJS service ID
   - Replace `YOUR_TEMPLATE_ID` with your EmailJS template ID
   - Replace `YOUR_PUBLIC_KEY` with your EmailJS public key

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy!

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- EmailJS
- Neumorphic Design 