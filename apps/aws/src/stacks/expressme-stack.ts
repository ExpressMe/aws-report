import * as cdk from 'aws-cdk-lib';
import {
  aws_apigatewayv2 as apigatewayv2,
} from 'aws-cdk-lib';
import { Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import path from 'path';
import { Backend } from '../constructs/backend';
import { Database } from '../constructs/database';
export interface ExpressMeStackOptions {
  databaseName: string;
  accountId: string;
  env: string;
  appName: string;
  region: string;
}

export class ExpressMeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, options: ExpressMeStackOptions, props?: cdk.StackProps) {
    super(scope, id, props);
    const prefix = `${options.appName}-${options.env}`;

    const vpc = new Vpc(this, `${prefix}-VPC`, {
      natGateways: 0, //We dont need nat gateways since we do not have any egress from the vpc to public internet
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    const rdsSecurityGroup = new SecurityGroup(this, `${prefix}-RdsSecurityGroup`, {
      vpc,
      securityGroupName: `${prefix}-RdsSecurityGroup`,
      allowAllOutbound: false,
      description: 'Allow rds outbound and inbound to lambda',
    });

    const lambdaSecurityGroup = new SecurityGroup(this, `${prefix}-LambdaSecurityGroup`, {
      vpc,
      securityGroupName: `${prefix}-LambdaSecurityGroup`,
      allowAllOutbound: false,
      description: 'Allow lambda outbound access to db',
    });

    rdsSecurityGroup.addIngressRule(lambdaSecurityGroup, Port.tcp(5432), 'Allow inbound from lambda');
    rdsSecurityGroup.addEgressRule(lambdaSecurityGroup, Port.tcp(5432), 'Allow outbound to lambda');

    lambdaSecurityGroup.addEgressRule(rdsSecurityGroup, Port.tcp(5432), 'Allow outbound to RDS'); // Ingress rules do not affect lambda

    const database = new Database(this, `${prefix}-Database`, {
      prefix,
      vpc,
      securityGroup: rdsSecurityGroup,
      appName: options.appName,
      env: options.env,
      region: options.region,
      accountId: options.accountId,
      databaseName: options.databaseName,
    });

    const backend = new Backend(this, `${prefix}-Backend`, {
      prefix,
      vpc,
      securityGroup: lambdaSecurityGroup,
      allowedOrigins: ['https://expressme.nl'],
    });
    backend.addEndpoint({
      id: 'ExpressMeUppercase',
      apiVersion: 1,
      apiPath: 'uppercase',
      httpMethod: apigatewayv2.HttpMethod.POST,
      zipFilePath: path.join(__dirname, '../../..', '/apps/backend-report/functions/uppercase/target/uppercase-native.zip'),
      databasePolicy: database.allowConnectionPolicy,
      databaseName: options.databaseName,
      database: database.database,
    });


  }
}
