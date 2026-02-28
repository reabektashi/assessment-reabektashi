# VideoLab

VideoLab is a full-stack web application that allows authenticated users to upload videos, create timestamped bookmarks, and draw annotations directly on top of video playback. The application also includes role-based access control with an admin dashboard that provides an overview of all content.

---

## Project Overview

The purpose of this project is to demonstrate how users can interact with video content by marking important moments and visually annotating frames. The application focuses on authentication, file uploads, synchronized overlays, and a clean RESTful backend structure.


---

## How to Run the Project

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd videolab
```

---

### 2. Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

---

### 3. Configure environment variables

Create a `.env` file inside the `server` folder:

```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret_key"
PORT=4000
```

---

### 4. Run database migrations

```bash
npx prisma migrate dev
```

---

### 5. Start the development servers

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

The frontend will run at:

```
http://localhost:5173
```

The backend will run at:

```
http://localhost:4000
```

---

## Technologies Used

### Frontend

* React (Vite)
* React Router
* Axios
* HTML5 Canvas for drawing annotations

### Backend

* Node.js
* Express.js
* Prisma ORM
* MySQL or SQLite (depending on configuration)
* JWT for authentication
* Multer for file uploads

### Development Tools

* Git and GitHub
* Prisma Studio

---

## Authentication and Roles

The application uses JWT-based authentication.

## Role-Based Access Design
The dashboard is the main authenticated entry point to upload a video and open it to create bookmarks and annotations.
The dashboard is shared between roles to keep the user experience simple and consistent.  
Admin-specific capabilities are available in a dedicated Admin view, which is protected by role-based authorization on the backend.
Users can have two roles:

**User**

* Upload videos
* Create bookmarks
* Create annotations
* View the shared video library

**Admin**

* View all videos
* View all bookmarks
* View all annotations

---

## Features

### Video Management

* Upload videos
* Watch videos directly in the browser
* Shared video library for authenticated users

### Bookmarks

* Create bookmarks with a title and timestamp
* Clicking a bookmark navigates the video to the saved time
* Edit and delete functionality

### Annotations

* Freehand drawing
* Rectangle drawing
* Timestamp and description stored with each annotation
* Drawings appear automatically when the video reaches the related timestamp
* Edit and delete functionality

### Admin Dashboard

* Global view of all videos, bookmarks, and annotations

---

## Assumptions, Shortcuts, and Limitations

### Assumptions

* The system uses a shared video library model where all authenticated users can view videos uploaded by others.
* The project is intended for demonstration and evaluation purposes rather than production use.

### Shortcuts

* Video files are stored locally in an uploads directory instead of using cloud storage.
* The interface uses simple styling rather than a full design system.
* Large datasets are not paginated.

### Limitations

* No real-time collaboration between users.
* Videos are served directly without streaming optimization.
* Drawing tools are limited to freehand and rectangles.
* Authentication tokens are stored in local storage, which is sufficient for a demo but not recommended for production security.

---

## Possible Future Improvements

* Cloud storage integration (e.g., AWS S3)
* Real-time annotations
* Advanced drawing tools (colors, shapes, undo/redo)
* Search and filtering
* Pagination for large datasets
* Video streaming optimization

---

## Author
Rea Bektashi

This project was developed as part of a technical assessment.
