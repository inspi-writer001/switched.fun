// pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@civic/auth-web3/server';
import { createAuthStorage } from '@civic/auth-web3/server/storage';
import { authConfig } from '@civic/auth-web3/server/config';

// Mock database functions (replace with your actual database logic)
const userDatabase: Record<string, { username?: string }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create authStorage instance
    const authStorage = createAuthStorage(req, res);

    // Retrieve the authenticated user from the request
    const user = await getUser({}, authStorage, authConfig);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: No user session found.' });
    }

    const userId = user.id;

    // Check if the user exists in your database
    let existingUser = userDatabase[userId];

    if (!existingUser) {
      // If the user doesn't exist, create a new entry
      userDatabase[userId] = {};
      existingUser = userDatabase[userId];
    }

    // Check if the user has a username
    if (!existingUser.username) {
      // Prompt the user to set a username
      return res.status(200).json({
        success: true,
        message: 'Username not found. Please set your username.',
        requiresUsername: true,
      });
    }

    // User has a username; proceed with post-login actions
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: userId,
        username: existingUser.username,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/callback:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
