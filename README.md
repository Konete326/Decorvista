# DecorVista - Interior Design Platform

A full-stack MERN application that connects homeowners with interior designers, featuring a product catalog and inspiration gallery.

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

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

### 1. Navigate to the project directory
```bash
cd decorvista
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/decorvista
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
NODE_ENV=development
TEST_MONGODB_URI=mongodb://localhost:27017/decorvista-test
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:3000

## Seeding the Database

To create an admin account:
```bash
cd backend
npm run seed
```
Follow the prompts to create an admin user.

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

## Support

For support, email sameerdevexpertgmail.com or open an issue in the repository.
