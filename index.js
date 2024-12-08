import { app } from './app.js';
import connectDB from './src/db/mydb.js'
import env from 'dotenv'


env.config({
    path: "/.env",
})

const PORT = process.env.PORT || 7000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at the ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("MongoDB conenction failed", err)
    })