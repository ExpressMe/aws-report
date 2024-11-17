import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AmazonLinux2023Kernel, Instance, InstanceType, ISecurityGroup, MachineImage, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
export interface BastionHostProps {
  readonly prefix: string;
  readonly vpc: Vpc;
  readonly securityGroup: ISecurityGroup;
  readonly region: string;
}

export class BastionHost extends Construct {
  userPool: UserPool;

  constructor(scope: Construct, id: string, props: BastionHostProps) {
    super(scope, id);

    const role = new Role(this, `${props.prefix}-BastionHost-RDS-Access-Role`, {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      roleName: `${props.prefix}-BastionHost-RDS-Access-Role`,
    });

    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    const machineImage = MachineImage.latestAmazonLinux2023({
      kernel: AmazonLinux2023Kernel.CDK_LATEST,
    });

    const instance = new Instance(this, `${props.prefix}-BastionHostInstance`, {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      role,
      securityGroup: props.securityGroup,
      instanceName: `${id}-BastionHostInstance`,
      instanceType: new InstanceType('t3.nano'),
      machineImage,
      ssmSessionPermissions: true,
    });

    //We will have to manually start the ec2 instance every time we want to connect. This code will make sure the ec2 is automatically shut down
    const stopCode = `
      const { EC2Client, StopInstancesCommand } = require('@aws-sdk/client-ec2');

      exports.handler = async (event, context, callback) => {
        const client = new EC2Client({ region: event.instanceRegion });
        const command = new StopInstancesCommand({ InstanceIds: [event.instanceId] });

        try {
          await client.send(command);
          return "Successfully stopped " + event.instanceId;
        } catch (err) {
          console.log(err);
          throw err;
        }
      };
    `;

    const stopFunction = new lambda.Function(this, `${props.prefix}-StopEC2Instances`, {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromInline(stopCode),
    });
    stopFunction.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'));

    const stopRule = new events.Rule(this, `${props.prefix}-StopRule`, {
      schedule: events.Schedule.expression('cron(0 0 ? * * *)'), // 00:00 UTC
    });

    stopRule.addTarget(
      new targets.LambdaFunction(stopFunction, {
        event: events.RuleTargetInput.fromObject({
          instanceId: instance.instanceId,
          instanceRegion: props.region,
        }),
      }),
    );
  }
}
