package nl.expressme.backend;

import java.util.Properties;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!local")
public class AwsDataSourceConfiguration {
  @Value("${rdsuser}")
  private String user;

  @Bean
  public DataSource dataSource(DataSourceProperties properties) {
    Properties driverProperties = new Properties();
    // Enable IAM authentication plugin
    driverProperties.setProperty("wrapperPlugins", "iam");

    // Get the IAM user from environment or configuration
    String iamUser = user;
    if (iamUser != null && !iamUser.isEmpty()) {
      driverProperties.setProperty("user", iamUser);
    }

    // Configure the datasource with our properties
    org.springframework.boot.jdbc.DataSourceBuilder<?> builder =
        org.springframework.boot.jdbc.DataSourceBuilder.create()
            .url(properties.getUrl())
            .driverClassName("software.amazon.jdbc.Driver");

    return builder.build();
  }
}
