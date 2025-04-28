import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import validator from "validator";
import asyncHandler from "../../shared/middleware/async";
import ErrorResponse from "../../utils/errorResponse";
import Token from "../token/token.model";
import User, { UserDocument } from "../user/user.model";
import authService, { resetUserPassword } from "./auth.service";

interface RegisterBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Define the user property with an id
}

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */

export const register = asyncHandler(
  async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
    next: NextFunction
  ) => {
    let { first_name, last_name, email, password, role } = req.body;
    // Trim and sanitize inputs
    first_name = validator.trim(first_name ?? "");
    last_name = validator.trim(last_name ?? "");
    email = validator.trim(email ?? "").toLowerCase();
    password = validator.trim(password ?? "");

    // Input validation
    if (!first_name || !last_name || !email || !password) {
      return next(new ErrorResponse("All fields are required", 400));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new ErrorResponse("Invalid email format", 400));
    }

    // Check if user already exists (case insensitive)
    const existingUser = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (existingUser) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    // Create user with sanitized inputs
    const user: UserDocument = await User.create({
      first_name,
      last_name,
      email,
      password, // Password will be hashed by the model's pre-save hook
      role: role ?? "user",
    });

    // Send verification email
    await authService.sendVerificationEmail(user);

    // Remove sensitive data from response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  }
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login a user
 * @access  Public
 */
export const login = asyncHandler(
  async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
  ) => {
    let { email, password } = req.body;
    // Trim and sanitize inputs
    email = validator.trim(email ?? "").toLowerCase();
    password = validator.trim(password ?? "");

    // Input validation
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new ErrorResponse("Invalid email format", 400));
    }

    // Find user with case-insensitive email match
    const user = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .select("+password");

    if (!user) {
      // Use consistent error message for security
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check password
    const isMatched = await authService.matchPassword(password, user);

    if (!isMatched) {
      // Use consistent error message for security
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Generate token
    const token = authService.generateToken(user);

    // Remove sensitive data from response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  }
);

/**
 * @route   POST /api/v1/auth/admin/login
 * @desc    Admin Login with dashboard access check
 * @access  Public
 */
export const adminLogin = asyncHandler(
  async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
  ) => {
    let { email, password } = req.body;
    // Trim and sanitize inputs
    email = validator.trim(email ?? "").toLowerCase();
    password = validator.trim(password ?? "");

    // Input validation
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new ErrorResponse("Invalid email format", 400));
    }

    // Find user with case-insensitive email match
    const user = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check password
    const isMatched = await authService.matchPassword(password, user);

    if (!isMatched) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check for admin dashboard access permission
    try {
      const hasAdminAccess = await authService.checkAdminAccess(user._id);
      if (!hasAdminAccess) {
        return next(
          new ErrorResponse("Unauthorized access to admin dashboard", 403)
        );
      }
    } catch (error) {
      console.error("Admin access verification error:", error);
      return next(new ErrorResponse("Admin access verification failed", 500));
    }

    // Generate token
    const token = authService.generateToken(user);

    // Remove sensitive data from response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set admin token cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Set regular token cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
    });
  }
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current user
 * @access  Public
 */

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // set the cookie to expire immediately
      //secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    });
    res.cookie("admin_token", "", {
      httpOnly: true,
      expires: new Date(0), // set the cookie to expire immediately
      //secure: process.env.NODE_ENV === 'production', // Uncomment for production
      sameSite: "lax",
    });
    res.cookie("org_token", "", {
      httpOnly: true,
      expires: new Date(0), // set the cookie to expire immediately
      //secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    const user = await User.findById(req.user.id).select(
      "-password -verificationToken -verificationTokenExpires"
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // If it's an admin request, check admin access
    if (req.cookies.admin_token) {
      try {
        const hasAdminAccess = await authService.checkAdminAccess(user._id);
        if (!hasAdminAccess) {
          return next(new ErrorResponse("Not authorized as admin", 403));
        }
      } catch (error) {
        console.error("Admin access verification error:", error);
        return next(new ErrorResponse("Admin access verification failed", 500));
      }
    }

    // If it's an organization/turf owner request, check organization access
    if (req.cookies.org_token && req.params.organizationId) {
      try {
        const hasOrgAccess = await authService.checkUserRoleInOrganization(
          user._id,
          req.params.organizationId
        );
        if (!hasOrgAccess) {
          return next(
            new ErrorResponse("Not authorized as organization owner", 403)
          );
        }
      } catch (error) {
        return next(
          new ErrorResponse("Organization access verification failed", 403)
        );
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request a password reset email
 * @access  Public
 */

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse("Please provide an email", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }

    try {
      const result = await authService.sendPasswordResetEmail(user);
      res.status(200).json(result);
    } catch (error: unknown) {
      // Log the error for debugging
      console.error("Password reset email error:", error);

      // Determine if it's a known error type
      if (error instanceof Error) {
        return next(
          new ErrorResponse(
            `Failed to send password reset email: ${error.message}`,
            500
          )
        );
      }

      // Generic error for unknown error types
      return next(
        new ErrorResponse(
          "An unexpected error occurred while sending reset email",
          500
        )
      );
    }
  }
);

/**
 * @route   POST /api/v1/auth/reset-password/?token=token&id=id
 * @desc    Reset password
 * @access  Public
 */

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, id } = req.query;
      const { password } = req.body;

      if (!token || !id || !password) {
        return next(
          new ErrorResponse("Invalid request. Missing parameters.", 400)
        );
      }

      // Call the modular service function
      const response = await resetUserPassword(
        id as string,
        token as string,
        password
      );

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
);

/**
 * @route   POST /api/v1/auth/verify-email/?token=token&id=id
 * @desc    Reset password
 * @access  Public
 */
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, id } = req.query;

    // Check if token and ID are provided
    if (!token || !id) {
      return next(new ErrorResponse("Invalid verification link", 400));
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Check if the token matches and is not expired
    if (
      user.verificationToken !== token ||
      new Date() > user.verificationTokenExpires
    ) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  }
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email to user
 * @access  Public
 */
export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return next(new ErrorResponse("Email is required", 400));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new ErrorResponse("Invalid email format", 400));
    }

    const user = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (!user) {
      return next(new ErrorResponse("User with this email not found", 404));
    }

    // Check if user is already verified
    if (user.isVerified) {
      return next(new ErrorResponse("Email is already verified", 400));
    }

    // Send verification email
    await authService.sendVerificationEmail(user);

    res.status(200).json({
      success: true,
      message: "Verification email has been sent. Please check your inbox.",
    });
  }
);


