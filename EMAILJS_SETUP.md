# EmailJS Setup Guide

## 📧 How to Make Your Contact Form Send Real Emails

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. Go to "Email Services" in your EmailJS dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions
5. Note your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: New Contact Form Message: {{subject}}

Hello {{to_name}},

You have received a new message from your portfolio contact form:

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Reply to: {{reply_to}}
This message was sent from your portfolio website.
```

4. Save the template and note your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Find your **Public Key**

### Step 5: Configure Your App

#### Option A: Environment Variables (Recommended)
1. Create a `.env` file in your project root:
```bash
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

2. Replace the placeholder values with your actual IDs
3. Restart your development server

#### Option B: Direct Configuration
1. Open `src/config/emailjs.js`
2. Replace the placeholder values:
```javascript
export const emailjsConfig = {
  serviceID: 'your_actual_service_id',
  templateID: 'your_actual_template_id', 
  publicKey: 'your_actual_public_key',
};
```

### Step 6: Test Your Form
1. Start your development server: `npm run dev`
2. Navigate to the contact section
3. Fill out and submit the form
4. Check your email for the message!

## 🔒 Security Notes
- Never commit your actual EmailJS keys to public repositories
- Use environment variables for production
- EmailJS free tier allows 200 emails/month
- Consider upgrading for higher limits

## 🚀 Alternative Solutions

### Netlify Forms (If hosting on Netlify)
Add `netlify` attribute to your form:
```html
<form netlify>
```

### Formspree
1. Sign up at [https://formspree.io/](https://formspree.io/)
2. Get your form endpoint
3. Update form action to point to Formspree

### Custom Backend
For full control, create a backend API with:
- Node.js + Express + Nodemailer
- Python + Flask/FastAPI
- PHP mail functions

## 📞 Need Help?
If you run into issues:
1. Check the browser console for errors
2. Verify your EmailJS configuration
3. Test with a simple message first
4. Check your email spam folder

Happy coding! 🚀