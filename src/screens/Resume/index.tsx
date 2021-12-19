import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HistoryCard } from '../../components/HistoryCard';
import { Container, Header, Title } from './styles';
import { DataListProps } from '../Dashboard';
import { categories } from '../../utils/categories';

interface TotalByCategoryProps {
  name: string;
  total: string;
  color: string;
}

export function Resume() {
  const [totalByCategories, setTotalByCategories] = useState<
    TotalByCategoryProps[]
  >([]);
  async function loadData() {
    const response = await AsyncStorage.getItem('@gofinances:transactions');
    const responseFormatted: DataListProps[] = response
      ? JSON.parse(response)
      : [];

    const expensives = responseFormatted.filter(
      (expensive) => expensive.type === 'negative',
    );

    const totalcategories: TotalByCategoryProps[] = [];

    categories.forEach((category) => {
      let categorySun = 0;

      expensives.forEach((expensive) => {
        if (expensive.category === category.key)
          categorySun += Number(expensive.amount);
      });
      if (categorySun > 0) {
        const total = categorySun.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        totalcategories.push({
          name: category.name,
          color: category.color,
          total,
        });
      }
    });
    setTotalByCategories(totalcategories);
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
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      <FlatList
        contentContainerStyle={{ padding: 24 }}
        data={totalByCategories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <HistoryCard
            title={item.name}
            amount={item.total}
            color={item.color}
          />
        )}
      />
    </Container>
  );
}
