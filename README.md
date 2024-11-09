# Express Me

# :arrow_forward: Building the app

Serving the frontend for development:

- I recommend development on an emulator, physical device might work as well, but debugging seems to be more buggy.
- Start an emulator, I do this through android studio -> device manager
- Run `npx nx run frontend:start`
  - Seems like some JDKs throw errors. I have successfully served the app using `java 17.0.2-open`
- When started, press `shift` + `m`, then select `Open React Devtools`
- If the app is not yet opened on the emulator, press `a` where the Expo CLI is executing, to open it in the connected device
- If devtools does not connect immediately, you might have to restart the application once or twice by pressing `r` where the Expo CLI is executing
- For element inspection, press `m` where the Expo CLI is executing, then on the device, select `Toggle element inspector`. Now you can click on elements on the device or in the devtools to inspect.

Testing the frontend:

- Run `npx nx run frontend:test` to run unit tests.

End-to-end testing frontend:

- Create an AVD with name Pixel_4a_API_30.
- Create an eas account.
- Login to eas with `npx eas login`.
- Make a local build with:

```
npx nx run frontend:build --platform android --profile preview --wait --local --output=../../apps/frontend/androidTest/Frontend/Frontend-androidTest.apk
```

- `npx nx test frontend-e2e -- --configuration android.emu.local` to run frontend e2e tests.
- ..?

Serving backend for development:

```sh
npx nx run backend:start
```

Testing backend:

```sh
npx nx run backend:test
```

Normally we develop using a database running in a container defined in docker-compose.
However, there are situations when you might want to directly connect to the hosted RDS instance.

Connecting to hosted RDS:

- Make sure you have SessionManagerPlugin installed (https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)
- Manually start ec2 instance in aws.
- run `npx nx run backend:aws-local-connect-rds`
- you can now connect to the database on `localhost:5434` using credentials in aws secrets manager
- when you are done, stop the ec2 instance to save on usage costs (it will also be automatically stopped at 00:00)

## :hammer: Setup development environment for frontend work

Getting started with development on this project:

- Install [nvm](https://github.com/nvm-sh/nvm)
- Run `nvm use`, to install the node version defined in the `.nvmrc`.
- Run `npm install`, to install all required packages.
- If you want to use a physical device:
  - Connect over usb, enable USB debugging.
  - In some cases, one needs to switch the connection type "PTP via USB", to prevent getting access denied errors.
- If you want to use the Android Emulator.
  - Follow instructions on https://docs.expo.dev/workflow/android-studio-emulator/.
    - Installation instructions for Linux are missing, make sure to follow the macOS instructions.
    - Install [SDKMAN!](https://sdkman.io/).
    - Install a version of the JDK by using `sdk install java <jdk-version>`, currently `17.0.2-open`.
- Backend is built to a docker image

## AWS CLI

If you need to manage/configure aws manually using the CLI.

- Install the AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Make sure you have an AWS account, validated.
- Go to our AWS Access portal https://d-c36709bcaf.awsapps.com/
- Expand ExpressMe_DEV, select and open the "Access keys" dialog. Take note of the "SSO start URL" and "SSO Region" values.
- run `aws configure sso`. more info in this page https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
- follow the instructions, I kept all default selections, except CLI profile name: "expressme_dev".
- run `npx nx run backend:aws-login`

## Deploying backend changes to AWS Development environment

- Make sure you are logged in `npx nx run backend:aws-login`
- Run `eval "$(aws configure export-credentials --profile expressme_dev --format env)"`
  - Or waste some time to figure out why the `apps/backend/scripts/set-aws-credentials.sh` script does not work, so that this is automatically executed after logging in.
- Run `npx nx run aws:cdk-deploy-local:dev`

## Deploying ExpressMe on a new AWS Account

- run `npx nx run aws:cdk-bootstrap:dev -- --profile=expressme_dev_admin`, replace :dev with whatever build target corresponds to the AWS account you want to deploy to. And assuming the aws cli profile expressme_dev has ADMIN access to the AWS account.
- run `npx nx run aws:init-account:dev -- --profile=expressme_dev`. This will create a github deploy access role within aws.
- create a new deployment workflow for the environment you want to deploy to, using the output ARN of the previous command
- Manually create a new Cloudflare SSL certificate for AWS api-gateway custom domain.
  - Go to cloudflare dashboard->expressme.nl->SSL/TLS->Origin Server
  - Create new certificate for the domain you want
  - Go to aws->aws certificate manager->import a certificate
  - Copy values from cloudflare into aws. Certificate chain can be obtained from this link https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem
- Copy ther aws certificate ARN to env var AWS_CLOUDFLARE_SSL_CERTIFICATE_ARN of the new deployment
- Also add a AWS_API_DOMAIN env var for the new deployment
- Trigger deployment in GitHub actions
- On success..;
- Create a new DNS record in cloudlflare;
  - type: CNAME
  - name: subdomain of the api
  - content: from api gateway->custom domain names->select domain name->configurations->api gateway domain name
- Make sure to check your email to confirm the email notifications address

# Creating a new lambda function/handler

- Create the handler in the backend
- Edit `apps/backend/docker-compose.yml` to add the new endpoint for local development
- Also add the endpoint to `apps/backend/nginx.conf` for local development
- Add a build-stage to `apps/backend/Dockerfile` for native compilation for aws live deployments
- Edit `apps/aws/src/stacks/expressme-stack.ts` to add the new endpoint using `addEndpoint` function

## Express Me App

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>
