# Paper Management System (PMS)

## 1. Overview

The Paper Management System (PMS) is a comprehensive web application designed for managing paper inventory in a multi-branch environment. It provides features for tracking paper stock from receipt to consumption, including transfers, adjustments, and detailed reporting. The system is built with a secure, role-based access control system to ensure that users can only perform actions and view data that they are authorized for.

This project was built from the ground up based on a detailed set of requirements, featuring a modern tech stack and a focus on security, performance, and usability.

## 2. Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| **Frontend** | React (with Hooks), Tailwind CSS |
| **Backend**  | Node.js with Express.js     |
| **Database** | Microsoft SQL Server      |
| **Auth**     | JWT with SQL Server Auth  |

## 3. Features

- **Secure Authentication:** Role-based access control (RBAC) with permissions managed by an administrator. All routes and sensitive actions are protected.
- **Full Inventory Lifecycle:** Track paper from Receive, Issue, Consume, Reject, Return, and Transfer.
- **Branch Management:** Multi-branch support for all inventory actions.
- **Paper Master Data:** Centralized management of all paper types (manufacturer, grade, width, GSM, rate).
- **Advanced Inventory Actions:**
    - **Deckle Match:** Split a paper roll into two new sizes with automatic stock updates.
    - **Paper Adjustment:** Manually add or subtract stock with a full history log.
    - **Branch-to-Branch Transfers:** An approval-based workflow for moving stock between branches, complete with notifications.
- **Excel Import:** Bulk-add new paper definitions from an Excel file.
- **Notifications:** A real-time (polling-based) notification system for events like transfer approvals.
- **Comprehensive Reporting:**
    - Detailed, filterable, and exportable reports for all major inventory actions (Stock, Issued, Returned, etc.).
    - A global, paginated Activity Log for a complete system audit trail.
- **Per-Item History:** A history button on data rows to view a detailed log of all actions performed on that specific item.
- **Performance Optimized:** Features API response compression, pagination for large data tables, and sticky table headers for better UX.

## 4. Project Setup

### Prerequisites

- **Node.js** (v16 or later recommended)
- **npm** or **yarn**
- **Microsoft SQL Server:** An accessible instance of SQL Server (any edition, including Express).

### Step 1: Database Setup

1.  **Create the Database:**
    -   Open SQL Server Management Studio (SSMS) or your preferred SQL client.
    -   Create a new database. The recommended name is `PMS_DB`, but you can use any name.

2.  **Run the Schema Scripts:**
    -   The setup scripts are located in the `backend/database_schema/` directory.
    -   You must execute these scripts **in numerical order** against the database you just created.
        1.  `01_create_roles_table.sql`
        2.  `02_create_users_table.sql`
        3.  `03_create_pages_actions_permissions_tables.sql`
        4.  `04_seed_admin_user.sql` (This creates the default `admin`/`admin123` user)
        5.  `05_create_branches_table.sql`
        6.  `06_create_papers_table.sql`
        7.  `07_create_machines_table.sql`
        8.  `08_create_inventory_transactions_table.sql`
        9.  `09_create_deckle_history_table.sql`
        10. `10_create_paper_adjustments_table.sql`
        11. `11_create_transfers_table.sql`
        12. `12_create_notifications_table.sql`
        13. `13_create_activity_log_table.sql`

### Step 2: Backend Configuration

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    -   Create a new file named `.env` in the `backend` directory.
    -   Copy the contents of `.env.example` into your new `.env` file.
    -   Update the `.env` file with your specific SQL Server credentials:
        ```env
        DB_USER=your_sql_user
        DB_PASSWORD=your_sql_password
        DB_SERVER=your_server_address # e.g., localhost, ServerName\\SQLEXPRESS
        DB_DATABASE=PMS_DB # The name of the database you created
        DB_PORT=1433
        DB_ENCRYPT=false
        JWT_SECRET=a_very_strong_and_secret_key_that_you_should_change
        PORT=5000
        ```

4.  **Run the backend server:**
    ```bash
    # For development with auto-reloading
    npm run dev

    # For production
    npm start
    ```
    The backend API should now be running on `http://localhost:5000`.

### Step 3: Frontend Configuration

1.  **Navigate to the frontend directory:**
    ```bash
    # from the project root
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(Note: If you encounter issues with `npm install`, ensure you are in the correct `frontend` directory.)*

3.  **Run the frontend client:**
    ```bash
    npm start
    ```
    The frontend application should now be running and will open automatically in your browser at `http://localhost:3000`.

## 5. How to Use

-   **Login:**
    -   Navigate to `http://localhost:3000`.
    -   Use the default credentials:
        -   **Username:** `admin`
        -   **Password:** `admin123`
-   **Explore:** The `admin` user has full permissions to all features. You can explore all the sidebar menu items, create master data, and perform inventory actions.
-   **Create New Users:** Navigate to `Administration -> User Management` to create new users and assign them roles.
-   **Manage Permissions:** Navigate to `Administration -> Permission Management` to customize what each role can see and do.
