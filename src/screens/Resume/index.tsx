import React, { useCallback, useEffect, useState } from 'react';
import { VictoryPie } from 'victory-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { addMonths, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { HistoryCard } from '../../components/HistoryCard';
import {
  Container,
  Header,
  Title,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MounthSelectIcon,
  Mounth,
} from './styles';
import { DataListProps } from '../Dashboard';
import { categories } from '../../utils/categories';
import { LoadContainer } from '../Dashboard/styles';

interface TotalByCategoryProps {
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [totalByCategories, setTotalByCategories] = useState<
    TotalByCategoryProps[]
  >([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const theme = useTheme();

  const paddingBar = useBottomTabBarHeight();

  function handleDateChange(action: 'next' | 'back') {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function loadData() {
    setIsLoading(true);
    const response = await AsyncStorage.getItem('@gofinances:transactions');
    const responseFormatted: DataListProps[] = response
      ? JSON.parse(response)
      : [];

    const expensives = responseFormatted.filter(
      (expensive) =>
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear(),
    );

    const expensivesTotal = expensives.reduce((acc, expensive) => {
      return acc + Number(expensive.amount);
    }, 0);

    const totalcategories: TotalByCategoryProps[] = [];

    categories.forEach((category) => {
      let categorySun = 0;

      expensives.forEach((expensive) => {
        if (expensive.category === category.key)
          categorySun += Number(expensive.amount);
      });
      if (categorySun > 0) {
        const totalFormatted = categorySun.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const percent = `${((categorySun / expensivesTotal) * 100).toFixed(
          0,
        )}%`;

        totalcategories.push({
          name: category.name,
          color: category.color,
          totalFormatted,
          total: categorySun,
          percent,
        });
      }
    });
    setTotalByCategories(totalcategories);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate]),
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange('back')}>
              <MounthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Mounth>
              {format(selectedDate, 'MMMM, yyyy', {
                locale: ptBR,
              })}
            </Mounth>

            <MonthSelectButton onPress={() => handleDateChange('next')}>
              <MounthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.text_dark,
                },
              }}
              x="percent"
              y="total"
            />
          </ChartContainer>

          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: paddingBar,
            }}
            data={totalByCategories}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <HistoryCard
                title={item.name}
                amount={item.totalFormatted}
                color={item.color}
              />
            )}
          />
        </>
      )}
    </Container>
  );
}
