import { Duration } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { InstanceClass, InstanceSize, InstanceType, ISecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
export interface DatabaseProps {
  readonly prefix: string;
  readonly vpc: Vpc;
  readonly securityGroup: ISecurityGroup;
  readonly appName: string;
  readonly env: string;
  readonly region: string;
  readonly accountId: string;
  readonly databaseName: string;
}

export class Database extends Construct {
  userPool: UserPool;
  allowConnectionPolicy: PolicyStatement;
  database: DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    this.database = new DatabaseInstance(this, `${props.prefix}-Database`, {
      engine: DatabaseInstanceEngine.POSTGRES,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED, // not publicly accessible
      },
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO), // db.t4g.micro - 2cpu 1gb
      multiAz: false,
      databaseName: props.databaseName,
      allowMajorVersionUpgrade: true,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(7),
      securityGroups: [props.securityGroup],
      credentials: Credentials.fromGeneratedSecret(`${props.appName}_${props.env}_DatabaseCredentials`.replace('-', '_')),
      allocatedStorage: 20,
      iamAuthentication: true,
    });


    this.allowConnectionPolicy = new PolicyStatement({
      actions: ['rds-db:connect'],
      resources: [`arn:aws:rds-db:${props.region}:${props.accountId}:dbuser:${this.database.instanceResourceId}/*`],
    });
  }
}
