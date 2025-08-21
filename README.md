# AI Grocery Store

A full-stack e-commerce application with AI-powered product recommendations, built with React, Spring Boot, and Python Flask.

## 🚀 Features

- **AI-Powered Recommendations**: Machine learning-based product suggestions
- **User Authentication**: JWT-based authentication with email verification
- **Payment Integration**: Stripe payment gateway with webhook support
- **Real-time Notifications**: WebSocket-based notifications
- **Admin Dashboard**: Analytics and management tools
- **Responsive Design**: Mobile-first approach
- **Email Notifications**: Order confirmations and password reset

## 🏗️ Architecture

```
├── frontend/          # React.js application
├── backend/           # Spring Boot REST API
├── ai-service/        # Python Flask AI service
└── docker-compose.yml # Container orchestration
```

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- Java 17+ (for local development)
- Python 3.8+ (for local development)

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-grocery-store
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` file with your actual values:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_mysql_root_password
MYSQL_DATABASE=grocerystore
MYSQL_USER=grocery
MYSQL_PASSWORD=your_secure_mysql_user_password

# JWT Configuration
JWT_KEY=your_jwt_secret_key_here_make_it_long_and_secure_at_least_256_bits
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=86400000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Email Configuration (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_AUTH=true
MAIL_STARTTLS=true

# Stripe Webhook Configuration
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Application URLs
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_AI_SERVICE_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
AI_SERVICE_URL=http://localhost:5000

# Spring Profiles
SPRING_PROFILES_ACTIVE=dev
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

This will start all services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8081

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8080/api
- **Database Admin**: http://localhost:8081 (root/admin)

## 🔧 Local Development

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Backend Development

```bash
cd backend
./mvnw spring-boot:run
```

### AI Service Development

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

## 📁 Project Structure

### Frontend (`/frontend`)

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── context/       # React context providers
├── utils/         # Utility functions
└── styles/        # CSS styles
```

### Backend (`/backend`)

```
src/main/java/com/groceryapp/backend/
├── controller/    # REST controllers
├── service/       # Business logic
├── repository/    # Data access layer
├── model/         # Entity classes
├── config/        # Configuration classes
└── security/      # Security configuration
```

### AI Service (`/ai-service`)

```
├── app.py         # Flask application
├── models/        # ML models
└── requirements.txt
```

## 🔐 Security Configuration

### JWT Configuration

- Generate a secure JWT key (at least 256 bits)
- Configure token expiration times
- Use HTTPS in production

### Database Security

- Use strong passwords
- Restrict database access
- Enable SSL connections in production

### Email Configuration

- Use Gmail App Passwords (not regular passwords)
- Enable 2FA on your Gmail account
- Use environment variables for credentials

## 🚀 Deployment

### Production Environment Variables

For production deployment, update the following:

```env
# Production URLs
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_AI_SERVICE_URL=https://yourdomain.com/ai

# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key

# Production Database
DB_HOST=your_production_db_host
DB_PORT=3306
DB_NAME=grocerystore
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password

# Production Email
MAIL_USERNAME=your_production_email
MAIL_PASSWORD=your_production_email_password
```

### Docker Production Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration Options

### Environment Variables

| Variable              | Description         | Default                   |
| --------------------- | ------------------- | ------------------------- |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | -                         |
| `MYSQL_DATABASE`      | Database name       | grocerystore              |
| `JWT_KEY`             | JWT secret key      | -                         |
| `STRIPE_SECRET_KEY`   | Stripe secret key   | -                         |
| `MAIL_USERNAME`       | Email username      | -                         |
| `MAIL_PASSWORD`       | Email password      | -                         |
| `FRONTEND_URL`        | Frontend URL        | http://localhost:3000     |
| `REACT_APP_API_URL`   | Backend API URL     | http://localhost:8080/api |

### Port Configuration

| Service    | Default Port | Environment Variable |
| ---------- | ------------ | -------------------- |
| Frontend   | 3000         | `FRONTEND_PORT`      |
| Backend    | 8080         | `BACKEND_PORT`       |
| AI Service | 5000         | `AI_SERVICE_PORT`    |
| MySQL      | 3307         | `MYSQL_PORT`         |
| phpMyAdmin | 8081         | -                    |

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Change ports in `.env` file
2. **Database Connection**: Check MySQL credentials and network
3. **Email Not Working**: Verify Gmail app password and 2FA
4. **JWT Errors**: Ensure JWT key is properly set

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ai-service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the configuration documentation

## 🔄 Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

---

**Note**: Always keep your `.env` file secure and never commit it to version control. The `.env.example` file serves as a template for required environment variables.
