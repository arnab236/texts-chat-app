import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!email || !fullName || !password || !bio) {
            return res.status(400).json({success:false, message: "Please provide all required fields" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({success:false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);

        res.json({success:true, userData: newUser, token, message: "User registered successfully"});

    } catch (error) {
        console.error(error.message);
        res.json({success:false, message: error.message });
    }
}

// Controller for user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const userData = await User.findOne({ email });
        const isPasswordCorrect =  await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.status(400).json({success:false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        res.json({success:true, userData, token, message: "User logged in successfully"});

    } catch (error) {
        console.error(error.message);
        res.status(500).json({success:false, message: error.message });
    }
}

// Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    try {
        res.json({success:true, user: req.user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success:false, message: error.message });
    }
}

// Controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, {
                fullName,
                bio
            },
            { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
        
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, fullName, bio }, { new: true });
        }

        // const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        //     fullName,
        //     bio,
        //     avatar
        // }, { new: true });

        return res.json({success:true, user: updatedUser, message: "Profile updated successfully"});

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success:false, message: error.message });
    }
}