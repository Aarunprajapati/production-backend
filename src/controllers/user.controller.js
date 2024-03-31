import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  // console.log(userId)
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validationBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "something went wrong while generating access token and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // req.body-> user deatils
  // validation check - username, email, password, fullname
  // user find via username or email
  // upload image on cloudinary
  // validation check of avatar image
  // existing user is present or not?
  // if existing user is present show notification
  // if user is not present create one
  // remove password or refreshToken form database
  // return res

  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiErrors(409, "User with email or username already exists");
  }
  // get filelocalopath from multer diskStorage
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar Image are required");
  }

  //send to the cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiErrors(400, "Avatar Image is required");
  }

  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    new ApiErrors(500, "something went wrong while registering User");
  }
  res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "user are registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // validation check for username or email
  // find out user from db
  // password hashing
  // refresh token and accesstoken generate
  // set in cookies
  // return res

  const { userName, email, password } = req.body;

  if (!(userName || email)) {
    throw new ApiErrors(400, "Invalid username or email");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiErrors(401, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrors(401, "password is not valid");
  }

  // generate accessToken and refreshToken
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  const user =  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
    
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

export { registerUser, loginUser, logOut };
