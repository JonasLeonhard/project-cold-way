import { withApollo } from '../lib/apollo';

import articlesQuery from '../graphql/articles.gql';
import { ArticlesQuery } from '../graphql/types';

import Default  from './templates/default';

import Text from './components/text/text';
import Container from './components/container/container';

import { Button, Space, DatePicker, Card } from 'antd';
import { SmileFilled } from '@ant-design/icons'

const Index = ({ data }: { data: ArticlesQuery } ) => {  
  return (
    <Default title="Jonasleonhard.de" description="Jonas Leonhard Index Page">
      <Text>
      <h1>Lora Font</h1>
      rendered index.tsx {data.articles.map(el => {
        return el.title
      })}
      <Container>
        <Space direction="vertical">
          <SmileFilled />
          <Button type="primary">Primary Button</Button>
          <Button type="ghost">Ghost Button</Button>
          <DatePicker onChange={() => {}} />
        </Space>
      </Container>
      </Text>
    </Default>
    )
}


Index.getInitialProps = async ({ apolloClient }) => {
  const { data }: { error: any, data: ArticlesQuery } = await apolloClient.query({
    query: articlesQuery
  });

  return {
    data
  };
};

export default withApollo()(Index);