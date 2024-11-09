Reproducing the problem:

1 `npm install`
  - we use node version `v22.3.0`

2 `npx nx run backend-report:build-all:dev`
  - we use 
```
    openjdk version "23.0.1" 2024-10-15
    OpenJDK Runtime Environment GraalVM CE 23.0.1+11.1 (build 23.0.1+11-jvmci-b01)
    OpenJDK 64-Bit Server VM GraalVM CE 23.0.1+11.1 (build 23.0.1+11-jvmci-b01, mixed mode, sharing)
```

3 `npx nx run aws:cdk-deploy-local-prod:prod`
  - assuming your aws environment has already been bootstrapped for CDK
  - check file in `apps/aws/project.json`, line 114, you might want to change the aws sso profile
  - check file in `apps/aws/.env.dev`, you need to change the environment variables to fit your aws environment

4 Check deployed api-gateway resources, send POST request to your api-gateway endpoint `https://{api-id}.execute-api.{region}.amazonaws.com/api/v1/uppercase`
  - request body not necessary
  - authorization token not necessary
  - use cloudwatch live trailing to get logs

5 Logs should be similar to `cloudflare-logs-dump.md`
  - `Unable to load connection plugin factory: 'software.amazon.jdbc.plugin.AuroraConnectionTrackerPluginFactory'`
  - `org.hibernate.exception.GenericJDBCException: unable to obtain isolated JDBC connection [Unable to load connection plugin factory: 'software.amazon.jdbc.plugin.AuroraConnectionTrackerPluginFactory'.] `
  - `Caused by: java.sql.SQLException: Unable to load connection plugin factory: 'software.amazon.jdbc.plugin.AuroraConnectionTrackerPluginFactory'`
