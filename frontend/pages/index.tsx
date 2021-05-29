import React from 'react';
import { withApollo } from '../lib/apollo';

import articlesQuery from '../graphql/articles.gql';
import { ArticlesQuery } from '../graphql/types';
import { v4 as uuidV4 } from 'uuid';

import Default from '../templates/default';

import Text from '../components/text/text';
import Container from '../components/container/container';
import IndexForm from '../components/indexForm/indexForm';

const Index = ({ data, roomUuid }: { data: ArticlesQuery, roomUuid: string }) => {
  return (
    <Default title="Jonasleonhard.de" description="Jonas Leonhard Index Page">
      <Text>
        <h1>Lora Font</h1>
      rendered index.tsx {data.articles.map(el => {
          return el.title
        })}
        <Container>
          <IndexForm roomUuid={roomUuid}/>
        </Container>
      </Text>
    </Default>
  )
}


Index.getInitialProps = async ({ apolloClient }) => {
  const { data }: { error: any, data: ArticlesQuery } = await apolloClient.query({
    query: articlesQuery
  });
  const roomUuid = uuidV4();
  return {
    data,
    roomUuid
  };
};

export default withApollo()(Index);