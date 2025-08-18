# Email Configuration Guide - Gmail SMTP

This guide explains the Gmail SMTP configuration for the AI Grocery Store application.

## Overview

The application is configured to use **Gmail SMTP** for all email functionality:

- OTP verification emails
- Password reset emails
- Order confirmation emails
- Welcome emails
- And more...

## Production Configuration

### Gmail SMTP Setup

The application is pre-configured with your Gmail account:
- **Email**: thedynamiccoder@gmail.com
- **SMTP Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Authentication**: App Password

### Configuration Files

#### 1. Production Configuration (`application-prod.yaml`)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: thedynamiccoder@gmail.com
    password: gsdy yzac zdwb gszz
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

#### 2. Development Configuration (`application-dev.yaml`)
```yaml
spring:
  mail:
    host: ${MAIL_HOST:smtp.gmail.com}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:thedynamiccoder@gmail.com}
    password: ${MAIL_PASSWORD:gsdy yzac zdwb gszz}
```

## Testing Email Functionality

### 1. OTP Verification

1. Start the application with production profile:
   ```bash
   java -jar your-app.jar --spring.profiles.active=prod
   ```

2. Go to registration page
3. Fill in the form and submit
4. Check your Gmail inbox for the OTP email
5. Verify the OTP functionality

### 2. Email Templates

The application uses Thymeleaf templates located in:
- `src/main/resources/templates/otp-verification.html`
- `src/main/resources/templates/order-confirmation.html`
- And more...

### 3. Debugging

Enable debug logging in `application-dev.yaml`:
```yaml
logging:
  level:
    org.springframework.mail: DEBUG
    com.groceryapp.backend.service.EmailService: DEBUG
```

## Gmail SMTP Limits

### Free Tier Limits
- **Daily Limit**: 500 emails per day
- **Rate Limit**: ~20 emails per minute
- **Storage**: 15GB (shared with Gmail)

### Upgrading for Higher Volume
- **Gmail Workspace**: $6/month for 10K emails/day
- **Better support and features**

## Security Considerations

1. **App Password Security**
   - Keep your app password secure
   - Don't commit it to version control
   - Use environment variables in production

2. **Gmail Account Security**
   - 2FA must be enabled on your Gmail account
   - App passwords are tied to your Gmail account
   - Monitor for any security alerts

3. **Email Delivery**
   - Gmail has excellent delivery rates
   - Emails are less likely to go to spam
   - Professional sender reputation

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Verify 2FA is enabled on Gmail
   - Check app password is correct
   - Ensure account is not locked

2. **Connection Timeout**
   - Check firewall settings
   - Verify port 587 is open
   - Check internet connectivity

3. **Rate Limiting**
   - Monitor daily email count
   - Implement email queuing if needed
   - Consider upgrading Gmail plan

4. **Email Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check Gmail's "Sent" folder

### Development Tips:

1. **Test with Gmail** for consistent behavior
2. **Check application logs** for email errors
3. **Monitor Gmail's "Sent" folder** for delivery confirmation
4. **Use production profile** for final testing

## Environment Variables (Optional)

For additional security, you can set these environment variables:

```bash
# Gmail SMTP Configuration
export MAIL_USERNAME=thedynamiccoder@gmail.com
export MAIL_PASSWORD=gsdy yzac zdwb gszz

# Application Configuration
export FRONTEND_URL=https://your-production-domain.com
export JWT_SECRET_KEY=your-secure-jwt-key
```

## Production Deployment

### Starting the Application

#### Development Profile
```bash
java -jar your-app.jar --spring.profiles.active=dev
```

#### Production Profile
```bash
java -jar your-app.jar --spring.profiles.active=prod
```

### Monitoring

1. **Check Gmail's "Sent" folder** for email delivery
2. **Monitor application logs** for email errors
3. **Track user registration success** rates
4. **Monitor daily email count** to stay within limits

## Email Templates

The application includes professionally designed email templates:

- **OTP Verification**: Clean, modern design with security warnings
- **Order Confirmation**: Detailed order information
- **Password Reset**: Secure password reset links
- **Welcome Email**: Branded welcome message

All templates are responsive and work across different email clients.

---

**🎉 Your Gmail SMTP email system is ready for production!**

The application will now send professional emails using your Gmail account with proper security and reliability.
