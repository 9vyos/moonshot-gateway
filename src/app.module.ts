import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { handleAuth } from './config/auth/handle.auth';

@Module({
  imports: [
    // rest api client
    ClientsModule.register([
      {
        name: 'PRODUCT-SERVICE',
        transport: Transport.TCP,
        options: { host: 'product-service', port: 3001 },
      },
      {
        name: 'USER-SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'user-service',
          port: 3002,
        },
      },
    ]),
    // graphql client
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      server: {
        context: handleAuth,
      },
      driver: ApolloGatewayDriver,
      gateway: {
        buildService: ({ url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              console.log(context.userId);
              request.http.headers.set('user', context.userId);
            },
          });
        },
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'User',
              url: 'https://moonshot-user-service.fly.dev/graphql',
            },
            {
              name: 'Product',
              url: 'http://moonshot-api.hannah-log.site:3001/graphql',
            },
          ],
        }),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
