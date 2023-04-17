import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';

@Module({
  imports: [
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
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'User',
              url: 'https://moonshot-user-service.fly.dev/graphql',
            },
            // {
            //   name: 'Product',
            //   url: 'http://moonshot-api.hannah-log.site:3001/graphql',
            // },
          ],
        }),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
