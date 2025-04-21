# HealthChain - Blockchain-Based Medical Records Management System

HealthChain is a secure, decentralized application for managing medical records using blockchain technology. The system ensures data integrity, patient privacy, and controlled access to medical information.

## Features

- Secure medical record storage using blockchain technology
- Patient-controlled access management
- Healthcare provider verification system
- Immutable audit trail of all record access
- HIPAA-compliant data encryption
- Real-time record updates and synchronization

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Blockchain: Custom implementation in JavaScript
- Database: MongoDB
- Deployment: Docker

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker
- MongoDB

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthchain.git
cd healthchain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application:
```bash
npm run dev
```

## Project Structure

```
healthchain/
├── frontend/          # Frontend application files
├── backend/           # Backend API and server
├── blockchain/        # Blockchain implementation
├── src/              # Shared source code
└── docker/           # Docker configuration files
```

## Security

This project implements various security measures to ensure HIPAA compliance and protect sensitive medical data:

- End-to-end encryption
- Secure key management
- Role-based access control
- Audit logging
- Data backup and recovery procedures

## License

MIT License - see LICENSE file for details 