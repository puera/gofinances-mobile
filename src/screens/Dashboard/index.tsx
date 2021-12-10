import React from 'react';
import { HighLightCard } from '../../components/HighlightCard';

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
} from './styles';

export function Dashboard() {
  return (
    <Container>
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
          <Icon name="power" />
        </UserWrapper>
      </Header>
      <HighlightCardsList>
        <HighLightCard
          type="up"
          title="Entradas"
          amount="R$ 17.400,00"
          lastTransaction="Última entrada dia 10/12/2021"
        />
        <HighLightCard
          type="down"
          title="Saídas"
          amount="R$ 1.259,00"
          lastTransaction="Última entrada dia 10/12/2021"
        />
        <HighLightCard
          type="total"
          title="Total"
          amount="R$ 16.141,00"
          lastTransaction="Última entrada dia 10/12/2021"
        />
      </HighlightCardsList>
    </Container>
  );
}
