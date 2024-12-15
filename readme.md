
# YouTweet API

**YouTweet** is a robust backend-focused social sharing API, inspired by the features of both YouTube and Twitter.
Designed with scalability and security in mind, YouTweet allows users to upload and manage videos, interact socially,
and maintain a personalized profile. The API is built using modern technologies like **Node.js**, **Express.js**,
and **MongoDB**, ensuring a seamless and responsive experience.
This API supports secure user authentication, media management, and dynamic social interactions  making it ideal for building
content-driven communities or media sharing platforms.

---

## Features

- **User Authentication and Authorization**
  - Sign up, log in, and manage accounts securely.
  - Role-based access control for features like admin dashboards.

- **Video Upload and Management**
  - Support for uploading videos with metadata.
  - Efficient video storage and retrieval.

- **Social Interactions**
  - Like, comment, and share functionality.
  - Follower and following system to enable user interactions.

- **Scalable Architecture**
  - Modular design for easy maintenance and scalability.
  - Integration with cloud services for video hosting.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcrypt for password hashing
- **File Storage**: Multer (local setup), options for cloud storage (e.g., AWS S3, Google Cloud Storage)
- **Environment Management**: dotenv for configuration

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

3. **Set Up Environment Variables**  
   Create a `.env` file in the root directory and provide the following details:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/youtweet
   JWT_SECRET=your_jwt_secret
   CLOUD_STORAGE_URL=your_cloud_storage_url (optional)
   ```

4. **Start the Server**

   ```bash
   npm start
   ```

   The server will run at `http://localhost:5000`.

---

## API Endpoints

### **User Routes**

- **POST** `/api/v1/users/register`  
  Register a new user. Optionally upload an avatar and cover image during registration.  
  **Fields:**  
  - `avatar` (optional)  
  - `coverImage` (optional)  

- **POST** `/api/v1/users/login`  
  Log in with credentials to receive a JWT token.

- **POST** `/api/v1/users/refreshtoken`  
  Refresh the access token using a refresh token.

- **POST** `/api/v1/users/logout`  
  Log out the user by invalidating the current JWT token.  
  **Authentication:** Required (JWT).

- **GET** `/api/v1/users/profile`  
  Get the profile details of the currently authenticated user.  
  **Authentication:** Required (JWT).

- **POST** `/api/v1/users/changepassword`  
  Change the password of the currently authenticated user.  
  **Authentication:** Required (JWT).

- **PATCH** `/api/v1/users/updatedetails`  
  Update the details (e.g., name, email) of the currently authenticated user.  
  **Authentication:** Required (JWT).

- **PATCH** `/api/v1/users/updatecoverimg`  
  Update the cover image for the user profile.  
  **Authentication:** Required (JWT).  
  **Fields:**  
  - `coverimg` (optional)

- **PATCH** `/api/v1/users/updateavatarimg`  
  Update the avatar image for the user profile.  
  **Authentication:** Required (JWT).  
  **Fields:**  
  - `avatarimg` (optional)

- **GET** `/api/v1/users/channel/:username`  
  Retrieve the channel profile of a user by their username.  
  **Authentication:** Required (JWT).

- **GET** `/api/v1/users/history`  
  Get the watch history of the currently authenticated user.  
  **Authentication:** Required (JWT).

### **Video Routes**

- **POST** `/api/videos/upload`  
  Upload a video.

- **GET** `/api/videos/:id`  
  Retrieve video details.

- **DELETE** `/api/videos/:id`  
  Delete a video (authorized).

### **Interaction Routes**

- **POST** `/api/interactions/like`  
  Like a video.

- **POST** `/api/interactions/comment`  
  Comment on a video.

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
├── tests/                # Test cases
├── .env.example          # Example environment variables
├── package.json          # Node.js dependencies
├── README.md             # Project documentation
├── app.js                # Express app setup
└── index.js              # Entry point
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

Feel free to explore and contribute to **YouTweet**! Let’s build something amazing together.
