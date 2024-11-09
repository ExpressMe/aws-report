import * as cdk from 'aws-cdk-lib';
import { MyGitHubActionRole } from './stacks/github-action-init-stack';

const app = new cdk.App();

new MyGitHubActionRole(app, 'ExpressMeGitHubActionRole');
app.synth();
