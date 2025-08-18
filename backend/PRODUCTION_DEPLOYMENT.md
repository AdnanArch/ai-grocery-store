# Production Deployment Guide - Gmail SMTP

## 🚀 **Production Email Configuration**

Your AI Grocery Store is now configured to use **Gmail SMTP** for production email functionality.

### **📧 Email Configuration Details**

- **Email Provider**: Gmail SMTP
- **From Address**: thedynamiccoder@gmail.com
- **SMTP Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Authentication**: Enabled with App Password

### **🔧 Environment Variables (Optional)**

For additional security, you can set these environment variables:

```bash
# Gmail SMTP Configuration
export MAIL_USERNAME=thedynamiccoder@gmail.com
export MAIL_PASSWORD=gsdy yzac zdwb gszz

# Application Configuration
export FRONTEND_URL=https://your-production-domain.com
export JWT_SECRET_KEY=your-secure-jwt-key
```

### **📋 Production Profiles**

#### **Development Profile**

```bash
# Uses Gmail SMTP for testing
java -jar your-app.jar --spring.profiles.active=dev
```

#### **Production Profile**

```bash
# Uses optimized Gmail SMTP settings
java -jar your-app.jar --spring.profiles.active=prod
```

### **✅ Email Features Available**

1. **OTP Verification Emails**

   - Professional HTML templates
   - 6-digit verification codes
   - 5-minute expiration
   - Security warnings

2. **Password Reset Emails**

   - Secure reset links
   - 24-hour expiration
   - Professional branding

3. **Order Confirmation Emails**

   - Detailed order information
   - Tracking links
   - Professional design

4. **Welcome Emails**
   - Branded welcome messages
   - Account setup guidance

### **🔒 Security Features**

- **TLS Encryption**: All emails sent over encrypted connection
- **App Password**: Uses Gmail App Password (not regular password)
- **Rate Limiting**: Gmail's built-in rate limiting (500 emails/day free)
- **SPF/DKIM**: Gmail handles email authentication

### **📊 Monitoring & Limits**

#### **Gmail SMTP Limits**

- **Free Tier**: 500 emails per day
- **Paid Gmail**: 2,000 emails per day
- **Gmail Workspace**: 10,000 emails per day

#### **Monitoring**

- Check Gmail's "Sent" folder for email delivery
- Monitor application logs for email errors
- Gmail provides delivery reports

### **🚨 Important Notes**

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

### **🔧 Troubleshooting**

#### **Common Issues**

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

### **📈 Scaling Considerations**

#### **For Higher Volume (500+ emails/day)**

1. **Upgrade Gmail Plan**

   - Gmail Workspace: $6/month for 10K emails/day
   - Better support and features

2. **Alternative Services**
   - SendGrid: $15/month for 50K emails
   - Amazon SES: $0.10 per 1K emails
   - Mailgun: $35/month for 50K emails

### **🎯 Next Steps**

1. **Test Email Functionality**

   ```bash
   # Start application with production profile
   java -jar your-app.jar --spring.profiles.active=prod
   ```

2. **Test OTP Registration**

   - Register a new user
   - Check email delivery
   - Verify OTP functionality

3. **Monitor Performance**
   - Check email delivery rates
   - Monitor application logs
   - Track user registration success

### **📞 Support**

If you encounter issues:

1. Check Gmail account settings
2. Verify app password is working
3. Review application logs
4. Test with a simple email first

---

**🎉 Your production email system is ready!**

The application will now send professional emails using your Gmail account with proper security and reliability.
