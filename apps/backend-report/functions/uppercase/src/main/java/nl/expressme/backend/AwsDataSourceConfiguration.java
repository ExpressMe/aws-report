package nl.expressme.backend;

import java.util.Properties;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.jdbc.ds.AwsWrapperDataSource;

@Configuration
@Profile("!local")
public class AwsDataSourceConfiguration {

  @Bean
  public DataSource dataSource() {
    AwsWrapperDataSource ds = new AwsWrapperDataSource();

    ds.setJdbcProtocol("jdbc:postgresql:");

    // Specify the driver-specific data source:
    ds.setTargetDataSourceClassName("org.postgresql.ds.PGSimpleDataSource");

    // Configure basic data source information:
    ds.setServerName(
        "endpointid.eu-north-1.rds.amazonaws.com");
    ds.setDatabase("postgres");
    ds.setServerPort("5432");

    // Configure the driver-specific and AWS JDBC Driver properties (optional):
    Properties targetDataSourceProps = new Properties();

    targetDataSourceProps.setProperty("wrapperPlugins", "iam");
    targetDataSourceProps.setProperty("user", "lambda_user");

    // Configure any AWS JDBC Driver properties:
    targetDataSourceProps.setProperty("wrapperLoggerLevel", "ALL");

    ds.setTargetDataSourceProperties(targetDataSourceProps);

    return ds;
  }
}
