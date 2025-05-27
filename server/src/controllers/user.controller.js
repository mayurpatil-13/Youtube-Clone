import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { default_avatar_image_path } from "../constants.js";
import { uploadToCloudnary } from "../utils/uploadToCloudnary.js";
import { apiResponse } from '../utils/apiResponse.js';

const generateAccessTokenAndRefreshToken = async (user) =>{
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return {accessToken, refreshToken};
}

const registerUser = asyncHandler( async (req, res) => {

    const {fullName, username, email, password} = req.body;

    if([fullName, username, email, password].some((field)=>
        field.trim() === ""
    )){
        throw new apiError(401, "All fields required");
    }

    const preRegisteredUser = await User.findOne({
        $or:[
                { username },
                { email }
            ]
    })
    if(preRegisteredUser){
        throw new apiError(401, "User already exist");
    }

    // better appraoch for validation is it should be validated in the frontend code 

    let avatarImagePath = default_avatar_image_path;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarImagePath = await uploadToCloudnary(req.files.avatar[0].path);
    }

    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = await uploadToCloudnary(req.files.coverImage[0].path);
    }

    if(!avatarImagePath){
        throw new apiError(500, "Something went wrong");
    }

    const user = await User.create({
        username,
        email,
        fullName,
        avatar: avatarImagePath,
        coverImage: coverImagePath,
        password
    });

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if(!createdUser){
        throw new apiError(500, "Something went wrong user not created");
    }

    res.status(200).json(
        new apiResponse(201, createdUser, "User created successfully")
    )

});

const loginUser = asyncHandler( async (req, res) => {

    const { username, email, password } = req.body;

    if(!username && !email){
        throw new apiError(400, "username or password is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new apiError(404, "User not found.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid){
        throw new apiError(404, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user);

    const loggedInUser = await User.findOne(user._id).select(
        '-password -refreshToken'
    )

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "user logged in successfully"
        )
    )
});

const logoutUser = asyncHandler( async (req, res) =>{
    const user = req.user;

    await User.findOneAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options ={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200, {}, "User Logged out")
    )

})

export { 
    registerUser,
    loginUser,
    logoutUser
 }