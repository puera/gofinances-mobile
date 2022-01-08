import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';

import AppleSVG from '../../assets/apple.svg';
import GoogleSVG from '../../assets/google.svg';
import LogoSVG from '../../assets/logo.svg';
import { SignInSocialButton } from '../../components/SignInSocialButton';
import { useAuth } from '../../context/AuthContext';

import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper,
} from './styles';

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { siginWithGoogle, signinWithApple } = useAuth();
  const theme = useTheme();

  async function handleSiginWithGoogle() {
    try {
      setIsLoading(true);
      return await siginWithGoogle();
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível conectar a conta Google');
      setIsLoading(false);
    }
  }

  async function handleSigninWithApple() {
    try {
      setIsLoading(true);
      return await signinWithApple();
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível conectar a conta Apple');
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSVG width={RFValue(120)} height={RFValue(68)} />
          <Title>
            Controle suas {'\n'} finanças de forma {'\n'} muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>
          Faça seu login com {'\n'} uma das contas abaixo
        </SignInTitle>
      </Header>
      <Footer>
        <FooterWrapper>
          <SignInSocialButton
            title="Entrar com Google"
            svg={GoogleSVG}
            onPress={handleSiginWithGoogle}
          />
          {Platform.OS === 'ios' && (
            <SignInSocialButton
              title="Entrar com Apple"
              svg={AppleSVG}
              onPress={handleSigninWithApple}
            />
          )}
        </FooterWrapper>

        {isLoading && (
          <ActivityIndicator
            color={theme.colors.shape}
            size="small"
            style={{ marginTop: 18 }}
          />
        )}
      </Footer>
    </Container>
  );
}
