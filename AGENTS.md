## Agent Instructions for Paper Management System (PMS)

This document provides guidance for AI agents working on the PMS codebase.

### Project Overview
The Paper Management System (PMS) is a web application designed to manage paper inventory, including receiving, issuing, transferring, and adjusting paper stock. It features role-based access control, detailed activity logging, and reporting capabilities.

### Tech Stack
- **Frontend:** React (JSX), Tailwind CSS, HTML
- **Backend:** Node.js (Express)
- **Database:** Microsoft SQL Server
- **Authentication:** SQL Server Authentication

### Key Architectural Principles
1.  **UUIDs in URLs:** All resource identifiers in URLs MUST be UUIDs to enhance security and prevent enumeration attacks.
2.  **Role-Based Access Control (RBAC):** Access to pages, UI elements (buttons, forms), and API endpoints MUST be strictly controlled by user roles and permissions defined in the backend. Frontend checks are for UI presentation; backend checks are authoritative.
3.  **Comprehensive Logging:** All significant actions (CRUD operations, approvals, logins, stock changes) MUST be logged in an `ActivityLog` table. Logs should include who performed the action, when, what was changed (if applicable), and the entity affected.
4.  **Modularity:** Strive for modular code. Separate concerns into different files/modules (e.g., database connection, authentication logic, route handlers, utility functions).
5.  **Clear Naming Conventions:** Use consistent and descriptive names for variables, functions, files, and database tables/columns.
    *   Backend (Node.js/Express): camelCase for variables and functions. PascalCase for classes.
    *   Frontend (React): PascalCase for components. camelCase for functions and variables.
    *   Database (SQL Server): PascalCase for tables and columns.
6.  **Error Handling:** Implement robust error handling on both frontend and backend. Provide meaningful error messages to users where appropriate.
7.  **Security First:**
    *   Sanitize all user inputs to prevent XSS and SQL injection.
    *   Use parameterized queries for all database interactions.
    *   Store sensitive information (like connection strings) in environment variables, not directly in code.
    *   Regularly review and update dependencies.

### Backend Specifics
-   **Database Connection:** Manage the SQL Server connection carefully. Use a connection pool for efficiency. Ensure connections are closed properly.
-   **API Design:** Design RESTful APIs. Use appropriate HTTP verbs (GET, POST, PUT, DELETE). Return meaningful status codes.
-   **Authentication:**
    *   Use `jsonwebtoken` for session/token management.
    *   Ensure tokens have a reasonable expiration time.
    *   Implement middleware to protect routes.
-   **Calculations:** All business logic for calculations (RM to SQM, stock adjustments, returned paper deductions) should reside in the backend to ensure consistency and security.

### Frontend Specifics
-   **Component-Based Architecture:** Build UI using reusable React components.
-   **State Management:** For simple cases, component state or React Context is acceptable. For more complex global state, consider a dedicated state management library if needed (though try to keep it simple initially).
-   **API Interaction:** Use a library like `axios` for making API calls. Handle loading states and errors gracefully.
-   **Styling:** Use Tailwind CSS for styling. Adhere to its utility-first approach.
-   **Responsiveness:** Ensure the UI is responsive and works well on different screen sizes.

### Development Workflow
1.  **Understand Requirements:** Thoroughly read the task description and any related documentation.
2.  **Plan:** Create a detailed plan before writing code. Use the `set_plan` tool.
3.  **Implement:** Write code following the guidelines in this document.
4.  **Test:**
    *   Write unit tests for critical backend logic (especially calculations and authentication).
    *   Perform thorough manual testing of all features.
    *   Ensure UI elements are correctly shown/hidden based on permissions.
5.  **Document:** Add comments to code where necessary. Update `README.md` with setup and usage instructions.

### Running the Project (Target State)
-   **Backend:**
    ```bash
    cd backend
    npm install
    # Ensure .env file is configured with database credentials
    npm start
    ```
-   **Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```
-   **Default Login:** `admin` / `admin123` (to be implemented).

### Programmatic Checks (To be implemented by agent if possible during development)
-   *Placeholder for future checks. For example, a script to verify all API routes have authentication middleware, or that all database queries are parameterized.*

By adhering to these guidelines, we can build a robust, secure, and maintainable Paper Management System.
