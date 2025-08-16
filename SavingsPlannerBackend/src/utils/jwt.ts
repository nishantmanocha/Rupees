import jwt from 'jsonwebtoken';
import env from '@/config/environment';
import { IUser } from '@/types';

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate access token
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (user: IUser) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken
  };
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Generate new access token
    const payload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};