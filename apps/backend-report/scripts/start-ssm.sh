#!/bin/bash

INSTANCE_ID=$(aws ec2 describe-instances --region eu-north-1 --profile expressme_prod --filters "Name=tag:Name,Values=expressme-app-PROD-BastionHost-BastionHostInstance" --query "Reservations[].Instances[?State.Name=='running'].InstanceId" --output text)

aws ssm start-session --profile=expressme_prod --region eu-north-1 --target $INSTANCE_ID --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters host="endpointid.eu-north-1.rds.amazonaws.com",portNumber="5432",localPortNumber="5434"

