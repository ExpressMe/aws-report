import {
  Duration,
  aws_apigatewayv2 as apigatewayv2,
  aws_apigatewayv2_integrations as apigatewayv2_integrations
} from 'aws-cdk-lib';
import { ISecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface BackendProps {
  readonly prefix: string;
  readonly vpc: Vpc;
  readonly securityGroup: ISecurityGroup;
  readonly allowedOrigins: string[];
}

export class Backend extends Construct {
  httpApi: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, public props: BackendProps) {
    super(scope, id);

    this.httpApi = new apigatewayv2.HttpApi(this, `${props.prefix}-v1-HttpApi`, {
      corsPreflight: {
        allowOrigins: props.allowedOrigins,
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.DELETE,
        ],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
        allowCredentials: true,
      },
      apiName: `${props.prefix}-v1-HttpApi`,
      createDefaultStage: false,
      disableExecuteApiEndpoint: false,
    });

    const stage = new apigatewayv2.HttpStage(this, `${props.prefix}-ApiStage`, {
      httpApi: this.httpApi,
      stageName: 'api',
      autoDeploy: true,
    });

  }

  public addEndpoint(options: {
    id: string;
    apiVersion: 1;
    apiPath: string;
    httpMethod: apigatewayv2.HttpMethod;
    zipFilePath: string;
    databasePolicy: PolicyStatement;
    databaseName: string;
    database: DatabaseInstance;
  }) {
    const backendFunction = new lambda.Function(this, `${this.props.prefix}-${options.id}-LambdaFunction`, {
      functionName: options.id,
      runtime: lambda.Runtime.PROVIDED_AL2023,
      vpc: this.props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      handler: 'org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest',
      timeout: Duration.seconds(60),
      code: lambda.Code.fromAsset(options.zipFilePath),
      securityGroups: [this.props.securityGroup],
      architecture: lambda.Architecture.X86_64,
      environment: {
        RDS_ENDPOINT: options.database.dbInstanceEndpointAddress,
        RDS_PORT: options.database.dbInstanceEndpointPort,
        RDS_DATABASE: options.databaseName,
        RDS_IAM_USER: "lambda_user",
      }
    });

    const integration = new apigatewayv2_integrations.HttpLambdaIntegration(`${this.props.prefix}-${options.id}-Integration`, backendFunction);

    this.httpApi.addRoutes({
      path: `/v${options.apiVersion}/${options.apiPath}`,
      methods: [options.httpMethod],
      integration,
    });

    backendFunction.addToRolePolicy(options.databasePolicy);
  }
}
