# DecorVista - Interior Design Platform

A full-stack MERN application that connects homeowners with interior designers, featuring a product catalog and inspiration gallery.

## Developer Information

**Developer:** Muhammad Sameer  
**Email:** sameerdevexpert@gmail.com  
**GitHub:** (https://github.com/Konete326) 
**LinkedIn:** (https://profile.indeed.com/?hl=en_PK&co=PK&from=gnav-homepage)

This project is developed and maintained by Muhammad Sameer, a full-stack developer specializing in MERN stack applications.

## Features

- **User Authentication**: JWT-based authentication with role-based access (Admin, Designer, Homeowner)
- **Product Catalog**: Browse and purchase furniture and decor items
- **Designer Directory**: Find and connect with professional interior designers
- **Consultation Booking**: Schedule consultations with designers
- **Inspiration Gallery**: Browse room designs for inspiration
- **Shopping Cart**: Add products to cart and checkout
- **Role-based Dashboards**: Customized dashboards for each user type
- **File Upload**: Support for image uploads for products and gallery items
- **Reviews & Ratings**: Rate designers and products

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- Express Validator for input validation
- Helmet & Rate Limiting for security

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios for API calls
- Context API for state management
- Recharts for data visualization

## Prerequisites

Before starting, make sure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - You can use:
  - Local MongoDB installation - [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (Cloud) - [Create free account](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Code Editor** - VS Code recommended - [Download VS Code](https://code.visualstudio.com/)

## Complete Installation Guide for Beginners

### Step 1: Clone the Repository
```bash
# Clone the project
git clone https://github.com/Konete326/Decorvista.git
cd DecorVista
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install all backend dependencies
npm install
```

**Create Backend Environment File:**
Create a file named `.env` in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/decorvista
TEST_MONGODB_URI=mongodb://localhost:27017/decorvista-test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install all frontend dependencies
npm install
```

**Create Frontend Environment File:**
Create a file named `.env` in the `frontend` folder with the following content:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### Step 4: Database Setup

**Option A: Local MongoDB**
1. Start MongoDB service on your system
2. MongoDB will create the database automatically when you run the application

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in backend `.env` file with your Atlas connection string

### Step 5: Create Admin Account

```bash
# Navigate to backend folder
cd backend

# Run the database seeder to create admin account
npm run seed
```

**Default Admin Credentials:**
- **Email:** admin@decorvista.com
- **Password:** admin123
- **Role:** Admin

### Step 6: Start the Application

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```
✅ Backend will run on: http://localhost:5000

**Terminal 2 - Start Frontend Server:**
```bash
cd frontend
npm run dev
```
✅ Frontend will run on: http://localhost:3000

### Step 7: Access the Application

1. Open your browser and go to: http://localhost:3000
2. Login with admin credentials:
   - Email: admin@decorvista.com
   - Password: admin123

## Admin Panel Access

After logging in as admin, you can:
- **Manage Products:** Add, edit, delete products
- **Manage Users:** View and manage all users
- **View Analytics:** See platform statistics
- **Manage Orders:** Handle customer orders
- **Manage Gallery:** Add inspiration images
- **Manage Designers:** Approve/reject designer applications

## Creating Additional Admin Users

To create more admin users:

1. Register a new user through the frontend
2. Go to MongoDB (using MongoDB Compass or Atlas)
3. Find the user in the `users` collection
4. Change the `role` field from `"homeowner"` to `"admin"`
5. The user will now have admin privileges

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Product Endpoints
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Designer Endpoints
- `GET /api/designers` - Get all designers
- `GET /api/designers/:id` - Get designer by ID
- `POST /api/designers` - Create designer profile
- `PUT /api/designers/:id` - Update designer profile

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart items
- `POST /api/cart/checkout` - Checkout cart

### Consultation Endpoints
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Book consultation
- `PUT /api/consultations/:id` - Update consultation status

### Gallery Endpoints
- `GET /api/gallery` - Get gallery items
- `POST /api/gallery` - Create gallery item

### Upload Endpoints
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images

## Project Structure

```
decorvista/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── tests/         # Test files
│   │   ├── utils/         # Utility functions
│   │   ├── index.js       # Entry point
│   │   └── seed.js        # Database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## User Roles

### Admin
- Manage products, categories, and users
- View platform analytics
- Access admin dashboard

### Designer
- Create and manage designer profile
- Accept/decline consultation requests
- View reviews and ratings
- Access designer dashboard

### Homeowner
- Browse products and add to cart
- Book consultations with designers
- Leave reviews and ratings
- Access homeowner dashboard

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload with type validation
- CORS configuration
- Helmet.js for security headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting Common Issues

### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running on your system or check your MongoDB Atlas connection string.

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in backend `.env` file or kill the process using that port.

### Issue 3: JWT Secret Error
```
Error: secretOrPrivateKey has a value of "undefined"
```
**Solution:** Make sure you have set JWT_SECRET in your backend `.env` file.

### Issue 4: CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Ensure FRONTEND_URL is correctly set in backend `.env` file.

### Issue 5: File Upload Issues
**Solution:** Make sure the `uploads` folder exists in the backend directory.

## Deployment Guide

### Deploy to Heroku (Backend)
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables in Heroku dashboard
3. Deploy: `git push heroku main`

### Deploy to Netlify (Frontend)
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy to Vercel (Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard

## Contributing Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the coding standards:
   - Use meaningful variable names
   - Add comments for complex logic
   - Follow React best practices
   - Use proper error handling
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Project Roadmap

### Completed Features ✅
- User authentication and authorization
- Product catalog with search and filters
- Designer directory and profiles
- Consultation booking system
- Shopping cart and checkout
- Admin dashboard with analytics
- File upload system
- Reviews and ratings
- Responsive design

### Upcoming Features 🚀
- Real-time chat between users and designers
- Advanced search with AI recommendations
- Payment gateway integration
- Email notifications
- Mobile app development
- Advanced analytics dashboard
- Social media integration

## Support & Contact

**Developer:** Muhammad Sameer  
**Email:** sameerdevexpert@gmail.com  
**Project Issues:** Open an issue in this repository  
**Feature Requests:** Contact the developer directly

For technical support, please include:
1. Your operating system
2. Node.js version (`node --version`)
3. Error messages (full stack trace)
4. Steps to reproduce the issue

## Quick Commands

```bash
# Create admin account
node src/seed.js

# Test admin login
node test-admin.js
```

For support, email sameerdevexpert@gmail.com or open an issue in the repository.
