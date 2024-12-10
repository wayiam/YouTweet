import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jwt";

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowecase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowecase: true,
        trim: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Videos",
    }, ],
    password: {
        type: String,
        required: [true, "password is required"],
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamp: true,
});

userSchema.pre("save", async function(next) {
    if (!this.modified("password")) {
        next();
    }
    this.password = bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken = async function() {
    //short time web token generation
    return jwt.sign({
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRY
    );
};

userSchema.methods.generateRefreshToken = async function() {
    //short time web token generation
    return jwt.sign({
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRY
    );
};

export const User = mongoose.model("User", userSchema);