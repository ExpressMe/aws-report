import * as cdk from 'aws-cdk-lib';
import { ExpressMeStack } from './stacks/expressme-stack';

const app = new cdk.App();

new ExpressMeStack(app, process.env.AWS_STACK_NAME, {
  databaseName: process.env.AWS_POSTGRES_DB_NAME,
  accountId: process.env.AWS_ACCOUNT_ID,
  env: process.env.NX_ENV,
  appName: process.env.AWS_STACK_NAME,
  region: process.env.NX_AWS_DEFAULT_REGION,
});
