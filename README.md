# Famasi Backend

A robust and scalable backend API for the Famasi Pharmacy Management System, built with Node.js, Express, and TypeScript.

## 🚀 Features

- **RESTful API**: Clean and intuitive API endpoints
- **Type Safety**: Full TypeScript implementation
- **Database ORM**: Prisma for type-safe database operations
- **Authentication**: JWT-based authentication system
- **Input Validation**: Request validation using Joi and Express Validator
- **File Handling**: Support for CSV and Excel file processing
- **API Documentation**: Swagger UI for API documentation
- **Containerization**: Docker support with multi-stage builds
- **Reverse Proxy**: Traefik integration for routing and SSL
- **Environment Configuration**: Flexible environment variable management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Joi + Express Validator
- **File Processing**: 
  - ExcelJS for Excel files
  - csv-parse for CSV files
- **Documentation**: Swagger UI Express
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik
- **Web Server**: Nginx

## 📁 Project Structure

```
src/
├── controllers/    # Request handlers and business logic
├── middleware/     # Custom middleware functions
├── routes/         # API route definitions
├── utils/         # Utility functions and helpers
├── validations/   # Request validation schemas
├── types/         # TypeScript type definitions
├── docs/          # API documentation
└── index.ts       # Application entry point

prisma/
├── schema.prisma  # Database schema definition
└── seed.ts       # Database seeding script
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd famasi_backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/famasi"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

### Docker Deployment

1. Build and start the containers:
```bash
docker-compose up --build
```

2. For production deployment:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- Token-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Token refresh mechanism

## 📊 Database

- PostgreSQL database
- Prisma ORM for type-safe database operations
- Migrations for database schema changes
- Seeding script for initial data

## 📝 API Documentation

API documentation is available through Swagger UI:

```bash
# Access the API documentation
http://localhost:3000/api-docs
```

## 🔄 Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Run tests (if available)
4. Create a pull request

## 🐳 Docker Configuration

The application includes multiple Docker configurations:

- Development environment
- Production environment
- Nginx configuration
- Traefik reverse proxy setup

### Docker Compose Services

- **API**: Node.js application
- **Database**: PostgreSQL
- **Nginx**: Web server
- **Traefik**: Reverse proxy

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Medicines
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/reports` - Generate sales reports

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📈 Monitoring and Logging

- Request logging
- Error tracking
- Performance monitoring
- Database query logging

## 🔐 Security Features

- CORS configuration
- Rate limiting
- Input sanitization
- SQL injection prevention
- XSS protection

## 📝 License

[Your License]

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email [your-email] or open an issue in the repository.
