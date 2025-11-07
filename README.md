# Real-Time Account Balance Dashboard

A unified dashboard for retail banking customers to view real-time balances for all their linked accounts (checking, savings, credit, etc.) across web and mobile platforms. The dashboard aggregates data from the core banking system, ensures secure and accessible display, and provides robust error handling.

---

## Features

- **Real-time balances** for all linked customer accounts on a single dashboard
- **Automatic updates** when accounts are linked or closed
- **Robust error handling** with user-friendly messages
- **Responsive and accessible UI** (WCAG 2.1 AA compliant) for web and mobile
- **Secure data transmission** (HTTPS/TLS 1.2+)
- **No sensitive data** in client-side logs or browser storage
- **JWT authentication** and per-user rate limiting (10 requests/min)
- **Stateless, scalable, and containerized** architecture

---

## Tech Stack

- **Backend:** Node.js (Express) with TypeScript
- **Frontend:** React (TypeScript), TailwindCSS (or styled-components)
- **Testing:** Jest, React Testing Library, jest-axe, supertest
- **API Docs:** OpenAPI/Swagger
- **DevOps:** Docker, docker-compose, GitHub Actions (CI/CD), OWASP ZAP (security)
- **No persistent database** (all data is transient)

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- Node.js (v18+) and npm (for local development outside Docker)

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-org/rt-balance-dashboard.git
   cd rt-balance-dashboard
   ```

2. **Generate or provide TLS certificates:**
   - Place `server.crt` and `server.key` in the `certs/` directory (self-signed for local OK).

3. **Start all services:**
   ```sh
   docker-compose up --build
   ```
   - Backend: https://localhost:443/api
   - Frontend: https://localhost:3000

4. **Login and set JWT:**
   - For demo, set JWT in `sessionStorage`:
     ```js
     sessionStorage.setItem('jwt', '<your-jwt-here>');
     ```
   - In production, use secure HTTP-only cookies.

5. **Access the dashboard:**
   - Open [https://localhost:3000](https://localhost:3000) in your browser.

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── integrations/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── server.ts
│   │   └── routes.ts
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── tests/
├── certs/
├── docs/
│   └── openapi.yaml
├── docker-compose.yml
└── README.md
```

---

## API Documentation

- OpenAPI/Swagger spec: [`docs/openapi.yaml`](docs/openapi.yaml)
- Example endpoint:
  - `GET /api/balances` — Returns all linked account balances for the authenticated user

---

## Testing

- **Backend:**  
  ```sh
  cd backend
  npm install
  npm test
  ```
- **Frontend:**  
  ```sh
  cd frontend
  npm install
  npm test
  ```
- **Accessibility:**  
  ```sh
  cd frontend
  npm run test:accessibility
  ```

---

## Security & Compliance

- All traffic uses **HTTPS/TLS 1.2+**
- **JWT authentication** required for all API endpoints
- **Rate limiting:** 10 requests/min/user
- **No sensitive data** in logs or browser storage
- **No persistent storage** of account/balance data
- **WCAG 2.1 AA** accessibility compliance

---

## Contributing

1. Fork the repo and create your feature branch (`git checkout -b feature/your-feature`)
2. Commit your changes with clear messages
3. Ensure all tests pass and code is linted
4. Submit a pull request for review

---

## License

MIT License

---

## Contact

For support or questions, contact [support@rtbalance.example.com](mailto:support@rtbalance.example.com).