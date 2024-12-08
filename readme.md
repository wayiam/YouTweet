# YouTweet API

**YouTweet** is a backend-focused social sharing API inspired by the features of YouTube and Twitter. It allows users to upload videos, interact with others, and manage their content in a scalable and secure environment. This project is built with Node.js, Express, and MongoDB, with a focus on modular architecture and clean code.

---

## Features

- **User Authentication and Authorization:**
  - Sign up, log in, and manage accounts securely.
  - Role-based access control for features like admin dashboards.

- **Video Upload and Management:**
  - Support for uploading videos with metadata.
  - Efficient video storage and retrieval.

- **Social Interactions:**
  - Like, comment, and share functionality.
  - Follower and following system to enable user interactions.

- **Scalable Architecture:**
  - Modular design for easy maintenance and scalability.
  - Integration with cloud services for video hosting.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **File Storage:** Multer (local setup), options for cloud storage (e.g., AWS S3, Google Cloud Storage)
- **Environment Management:** dotenv
- **Testing:** Jest, Supertest

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/YouTweet.git
   cd YouTweet
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the root directory and provide the following details:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/youtweet
   JWT_SECRET=your_jwt_secret
   CLOUD_STORAGE_URL=your_cloud_storage_url (optional)
   ```

4. **Run the Server**
   ```bash
   npm start
   ```
   The server will start at `http://localhost:5000`.

---

## API Endpoints

### User Routes
- **POST** `/api/users/register` - Register a new user.
- **POST** `/api/users/login` - Log in with credentials.
- **GET** `/api/users/profile` - Get user profile (authenticated).

### Video Routes
- **POST** `/api/videos/upload` - Upload a video.
- **GET** `/api/videos/:id` - Retrieve video details.
- **DELETE** `/api/videos/:id` - Delete a video (authorized).

### Interaction Routes
- **POST** `/api/interactions/like` - Like a video.
- **POST** `/api/interactions/comment` - Comment on a video.

---

## Project Structure

```plaintext
YouTweet/
├── src/
│   ├── controllers/      # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Middleware functions
│   ├── utils/            # Utility functions
│   ├── db/               # Database connection setup
│   └── app.js            # Express app setup
├── tests/                # Test cases
├── .env.example          # Example environment variables
├── package.json          # Node.js dependencies
├── README.md             # Project documentation
└── server.js             # Entry point
```

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature name'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- Inspired by social platforms like **YouTube** and **Twitter**.
- Built with ❤️ using Node.js and MongoDB.

---

Feel free to explore and contribute to **YouTweet**! Let us build something awesome together.

