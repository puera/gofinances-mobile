import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert } from 'react-native';
import { useTheme } from 'styled-components';
import { HighLightCard } from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCardsList,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from './styles';
import { getLastTransaction } from '../../utils/date';
import { useAuth } from '../../context/AuthContext';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightData {
  entriesTotal: string;
  expensiveTotal: string;
  total: string;
  lastTransactionsEntries: string;
  lastTransactionsExpensives: string;
  totalInterval: string;
}

export function Dashboard() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [transacations, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData,
  );

  const loadData = useCallback(async () => {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const parsedData = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;
    let total = 0;

    const transactionsFormatted: DataListProps[] = parsedData.map(
      (transaction: DataListProps) => {
        if (transaction.type === 'positive') {
          entriesTotal += Number(transaction.amount);
        } else {
          expensiveTotal += Number(transaction.amount);
        }

        total = entriesTotal - expensiveTotal;

        const amount = Number(transaction.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(transaction.date));

        return {
          id: transaction.id,
          name: transaction.name,
          amount,
          type: transaction.type,
          category: transaction.category,
          date,
        };
      },
    );

    const lastTransactionsEntries = getLastTransaction(parsedData, 'positive');
    const lastTransactionsExpensives = getLastTransaction(
      parsedData,
      'negative',
    );
    const totalInterval = `${
      lastTransactionsExpensives === 0
        ? 'N??o h?? transa????es'
        : `01 a ${lastTransactionsExpensives}`
    }`;

    setHighlightData({
      entriesTotal: Number(entriesTotal).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      expensiveTotal: Number(expensiveTotal).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      total: Number(total).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      lastTransactionsEntries:
        lastTransactionsEntries === 0
          ? 'N??o h?? transa????es'
          : `??ltima entrada dia ${lastTransactionsEntries}`,
      lastTransactionsExpensives:
        lastTransactionsExpensives === 0
          ? 'N??o h?? transa????es'
          : `??ltima saida dia ${lastTransactionsExpensives}`,
      totalInterval,
    });
    setTransactions(transactionsFormatted);

    setIsLoading(false);
  }, [user.id]);

  async function logoutApp() {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      {
        text: 'Sim',
        onPress: logout,
      },
      {
        text: 'N??o',
      },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );
  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.avatar,
                  }}
                />
                <User>
                  <UserGreeting>Ol??, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={logoutApp}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>
          <HighlightCardsList>
            <HighLightCard
              type="up"
              title="Entradas"
              amount={highlightData.entriesTotal}
              lastTransaction={highlightData.lastTransactionsEntries}
            />
            <HighLightCard
              type="down"
              title="Sa??das"
              amount={highlightData.expensiveTotal}
              lastTransaction={highlightData.lastTransactionsExpensives}
            />
            <HighLightCard
              type="total"
              title="Total"
              amount={highlightData.total}
              lastTransaction={highlightData.totalInterval}
            />
          </HighlightCardsList>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transacations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TransactionCard
                  type={item.type}
                  name={item.name}
                  amount={item.amount}
                  category={item.category}
                  date={item.date}
                />
              )}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
