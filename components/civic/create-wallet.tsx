"use client";
import { userHasWallet } from '@civic/auth-web3';
import { useUser } from '@civic/auth-web3/react';
import { useEffect } from 'react';

export default function CreateWallet() {
  const user = useUser();

  useEffect(() => {
    const setupWallet = async () => {
      if (user && !userHasWallet(user)) {
        try {
          await user.createWallet();
          console.log('Wallet created successfully');
        } catch (error) {
          console.error('Error creating wallet:', error);
        }
      }
    };

    setupWallet();
  }, [user]);

  return null;
}
