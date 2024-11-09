// The purpose of this stack is to create an aws role which can be assumed by Github actions in order to deploy the ACTUAL expressme application stack.

import { Stack, StackProps, App } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GitHubActionRole } from 'cdk-pipelines-github';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class MyGitHubActionRole extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const provider = new GitHubActionRole(this, 'github-action-role', {
      repos: ['ExpressMe/expressme-app'],
    });
    provider.role.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: ['ec2:DescribeInstances', 'ssm:StartSession'],
      }),
    );
  }
}
