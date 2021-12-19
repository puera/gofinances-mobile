import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const [transacations, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData,
  );

  async function loadData() {
    const response = await AsyncStorage.getItem('@gofinances:transactions');
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
    const totalInterval = `01 a ${lastTransactionsExpensives}`;

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
      lastTransactionsEntries: `Última entrada dia ${lastTransactionsEntries}`,
      lastTransactionsExpensives: `Última saida dia ${lastTransactionsExpensives}`,
      totalInterval,
    });
    setTransactions(transactionsFormatted);

    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
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
                    uri: 'https://avatars.githubusercontent.com/u/1524415?v=4',
                  }}
                />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>Renann</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={() => {}}>
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
              title="Saídas"
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
