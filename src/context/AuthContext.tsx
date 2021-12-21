import React, { createContext, useContext, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as AppleSession from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;
interface Props {
  children: React.ReactNode;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface IAuthContextData {
  user: User;
  siginWithGoogle: () => Promise<void>;
  signinWithApple: () => Promise<void>;
}

export const AuthContext = createContext({} as IAuthContextData);

export function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<User>({} as User);

  async function siginWithGoogle() {
    try {
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (type === 'success') {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`,
        );
        const userInfo = await response.json();

        const userLogged = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          avatar: userInfo.picture,
        };

        setUser(userLogged);
        await AsyncStorage.setItem(
          '@gofinances:user',
          JSON.stringify(userLogged),
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function signinWithApple() {
    try {
      const credential = await AppleSession.signInAsync({
        requestedScopes: [
          AppleSession.AppleAuthenticationScope.FULL_NAME,
          AppleSession.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        const userLogged = {
          id: credential.user,
          email: credential.email,
          name: credential.fullName.givenName,
        };

        setUser(userLogged);
        await AsyncStorage.setItem(
          '@gofinances:user',
          JSON.stringify(userLogged),
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  return (
    <AuthContext.Provider value={{ user, siginWithGoogle, signinWithApple }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
