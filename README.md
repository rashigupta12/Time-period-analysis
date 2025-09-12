# Wholesale Jeans Business Management System

## Overview

This system is designed for a wholesale/manufacturing jeans business where multiple salespeople travel to different states and cities to collect orders from customers. The system centralizes order management, allowing the business owner to track all orders from creation to delivery.

## Business Problem Statement

- **Business Owner**: Runs a wholesale/manufacturing jeans shop
- **Salespeople**: Multiple sales representatives who travel to different locations
- **Customers**: Retail shops and businesses that purchase jeans in bulk
- **Process Flow**: Salespeople visit customers → Create/manage orders → Orders flow to business owner → Delivery tracking

## System Features

### 1. User Management
- **Admin Role**: Business owner with full system access
- **Salesperson Role**: Field representatives who create orders
- Custom authentication with username/password
- User details including full name, phone, and Aadhar card information

### 2. Customer Management
- Create new customers or select existing ones
- Edit customer details (name, address, phone, email, notes)
- Upload and store customer visiting cards/business cards
- Maintain customer history and contact information

### 3. Product Management
- Catalog of jeans products with descriptions
- Product images for easy identification
- Unique product identification system

### 4. Order Creation Process
**For Salespeople:**
1. Select or create a customer
2. Add multiple products to the order:
   - Upload/capture product images
   - Specify quantities for each product
   - Add remarks (e.g., "size 32 only")
3. Record audio notes for additional context
4. Generate unique order numbers automatically

**For Business Owner:**
- Can create orders directly
- Access to all orders from all salespeople
- Centralized order management dashboard

### 5. Order Processing & Delivery
- **Order Status Tracking**: CREATED → PROCESSING → DELIVERED → CANCELED
- **Delivery Documentation**:
  - Bill number recording
  - Transport company name
  - Bill photo upload
- **Order History**: Complete tracking from creation to delivery

## Database Schema

### Core Tables

#### Users (`users`)
- Stores salesperson and admin accounts
- Username-based authentication with password hashing
- Role-based access control (ADMIN/SALESPERSON)

#### Customers (`customers`)
- Customer information and contact details
- Visiting card storage capability
- Order history tracking

#### Products (`products`)
- Jeans catalog with images and descriptions
- Product identification for order items

#### Orders (`orders`)
- Central order management
- Links customers, salespeople, and products
- Status tracking and delivery information
- Audio recording storage

#### Order Items (`order_items`)
- Junction table for order-product relationships
- Quantity and remark tracking per product
- Supports multiple products per order

#### Supporting Tables
- `user_details`: Extended user information
- `customer_visiting_cards`: Business card storage
- `bill_photos`: Delivery documentation

## User Workflows

### Salesperson Workflow
1. **Login** with username/password
2. **Customer Management**:
   - Search existing customers
   - Create new customer profiles
   - Edit customer details
   - Upload visiting cards
3. **Order Creation**:
   - Select customer
   - Add products with images and quantities
   - Record audio notes
   - Submit order (status: CREATED)
4. **Order Tracking**: View order status updates

### Business Owner (Admin) Workflow
1. **Order Management**:
   - View all orders from all salespeople
   - Update order status to PROCESSING
   - Create direct orders if needed
2. **Delivery Management**:
   - Update orders to DELIVERED
   - Record bill numbers
   - Add transport company details
   - Upload bill photos
3. **Business Intelligence**:
   - Track salesperson performance
   - Monitor customer ordering patterns
   - Manage product catalog

## Key System Benefits

### For Salespeople
- **Mobile-Friendly**: Create orders on-the-go
- **Offline Capability**: Can work with limited connectivity
- **Visual Order Creation**: Image-based product selection
- **Audio Notes**: Capture complex requirements quickly

### For Business Owner
- **Centralized Control**: All orders in one place
- **Real-Time Updates**: Track order progress
- **Documentation**: Complete audit trail
- **Scalability**: Support multiple salespeople and locations

### For Customers
- **Faster Service**: Streamlined order process
- **Better Communication**: Audio notes capture specific requirements
- **Tracking**: Order status visibility
- **History**: Previous order reference

## Technical Features

### Security
- Password hashing for user authentication
- Role-based access control
- Cascade delete protection for data integrity

### Data Management
- Automatic timestamp tracking
- Unique constraints for data consistency
- Foreign key relationships for data integrity
- Optimized for PostgreSQL database

### Scalability
- Support for multiple salespeople
- Unlimited customers and products
- Efficient query performance with proper indexing

## Implementation Considerations

### Mobile Application Requirements
- Offline order creation capability
- Camera integration for product images
- Audio recording functionality
- Sync with central database when connected

### Web Dashboard Features
- Order management interface for admin
- Real-time status updates
- Reporting and analytics
- Customer and product management

### Integration Points
- Image storage service (AWS S3, Cloudinary, etc.)
- Audio file storage
- Push notifications for order updates
- SMS/Email notifications for customers

## Future Enhancements

### Potential Features
- **Inventory Management**: Track stock levels
- **Pricing System**: Dynamic pricing based on customer types
- **Payment Tracking**: Invoice and payment status
- **Analytics Dashboard**: Sales reports and trends
- **Customer Portal**: Direct customer access to order status
- **GPS Integration**: Location tracking for field sales

### Scalability Options
- **Multi-Location Support**: Multiple warehouses/shops
- **Franchise Management**: Support for business expansion
- **API Development**: Integration with accounting systems
- **Mobile App**: Native iOS/Android applications

## Data Flow Summary

1. **User Onboarding**: Admin creates salesperson account and shares credentials via WhatsApp/Email
2. **First Login**: Salesperson must change password before accessing system
3. **Order Creation**: Salesperson creates order with customer and product details
4. **Order Processing**: Admin reviews and updates order status
5. **Production/Fulfillment**: Items are prepared for shipping
6. **Delivery**: Transport details and bill information recorded
7. **Completion**: Order marked as delivered with documentation

This system transforms a traditional paper-based wholesale business into a modern, efficient, and trackable operation that scales with business growth.