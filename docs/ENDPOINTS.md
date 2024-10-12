# API Documentation

Welcome to our API documentation. This guide provides a comprehensive overview of all available endpoints in our application, designed to help developers integrate and interact with our services efficiently.

## Table of Contents
1. [Admin Operations](#admin-operations)
2. [Authentication](#authentication)
3. [Business Services](#business-services)
4. [Operator Management](#operator-management)
5. [Data Pagination](#data-pagination)
6. [Public Interfaces](#public-interfaces)
7. [User Account Management](#user-account-management)

## Admin Operations

These endpoints are restricted to administrators and provide powerful tools for managing the application.

### Add New Administrator
- **Endpoint**: `api/admin/add`
- **Method**: PUT
- **Description**: Grants administrative privileges to an existing user account.
- **Authentication**: Admin access required

### Upload Company Logo
- **Endpoint**: `api/admin/upload`
- **Method**: POST
- **Description**: Adds a new company logo to the system.
- **Authentication**: Admin access required

### Retrieve Uploaded Images
- **Endpoint**: `api/admin/images`
- **Method**: GET
- **Description**: Fetches a list of all uploaded logo images.
- **Authentication**: Admin access required

### Update Existing Logo
- **Endpoint**: `api/admin/reupload`
- **Method**: PUT
- **Description**: Replaces an existing company logo with a new image.
- **Authentication**: Admin access required

## Authentication

Secure endpoints for user authentication and account management.

### User Login
- **Endpoint**: `api/auth/signin`
- **Method**: POST
- **Description**: Authenticates a user and initiates a new session.

### New User Registration
- **Endpoint**: `api/auth/signup`
- **Method**: POST
- **Description**: Creates a new user account in the system.

### User Logout
- **Endpoint**: `api/auth/signout`
- **Method**: GET
- **Description**: Terminates the current user session.

### Token Verification
- **Endpoint**: `api/auth/verify`
- **Method**: GET
- **Description**: Validates the authenticity of a user's session token.

### Password Recovery Initiation
- **Endpoint**: `api/auth/forgot-password`
- **Method**: POST
- **Description**: Starts the process for resetting a forgotten password.

### Password Reset Page
- **Endpoint**: `api/auth/reset-password`
- **Method**: GET
- **Description**: Serves the interface for entering a new password.

### Password Update
- **Endpoint**: `api/auth/reset-password`
- **Method**: PATCH
- **Description**: Processes and applies the new password for a user account.

## Business Services

Public endpoints for accessing company logo information.

### Retrieve Company Logo
- **Endpoint**: `api/business/logo`
- **Method**: GET
- **Description**: Fetches the logo for a specified company.

### Search Company Logos
- **Endpoint**: `api/business/search`
- **Method**: GET
- **Description**: Performs a search query on the company logo database.

## Operator Management

Specialized endpoints for operator-level account management.

### Revert Operator to Customer
- **Endpoint**: `api/operator/revert`
- **Method**: PUT
- **Description**: Downgrades an operator account to standard customer status.
- **Authentication**: Operator access required

## Data Pagination

Endpoints designed for efficient data retrieval in paginated format.

### Paginated Operator Data
- **Endpoint**: `api/common/pagination`
- **Method**: GET
- **Description**: Retrieves operator data in manageable, paginated chunks.
- **Authentication**: Operator access required

## Public Interfaces

Publicly accessible endpoints for general use.

### Submit Contact Form
- **Endpoint**: `api/public/contact-us`
- **Method**: POST
- **Description**: Processes and submits a user's contact form data.

### Retrieve Demo Logo
- **Endpoint**: `api/public/logo`
- **Method**: GET
- **Description**: Provides a sample logo for demonstration purposes.

### Demo Logo Search
- **Endpoint**: `api/public/search`
- **Method**: GET
- **Description**: Demonstrates the logo search functionality with sample data.

## User Account Management

Endpoints for users to manage their own account details and API access.

### Fetch User Information
- **Endpoint**: `api/user/data`
- **Method**: GET
- **Description**: Retrieves the complete profile data for the authenticated user.
- **Authentication**: User login required

### Update User Password
- **Endpoint**: `api/user/update-password`
- **Method**: POST
- **Description**: Allows a user to change their account password.
- **Authentication**: User login required

### Modify User Profile
- **Endpoint**: `api/user/update-profile`
- **Method**: PATCH
- **Description**: Updates specific details in the user's profile information.
- **Authentication**: User login required

### Account Deletion
- **Endpoint**: `api/user/delete`
- **Method**: DELETE
- **Description**: Permanently removes the user's account and associated data.
- **Authentication**: User login required

### Create New API Key
- **Endpoint**: `api/user/generate`
- **Method**: POST
- **Description**: Generates a new API key for the authenticated user.
- **Authentication**: User login required

### Revoke API Key
- **Endpoint**: `api/user/destroy`
- **Method**: DELETE
- **Description**: Invalidates and removes a specified API key.
- **Authentication**: User login required