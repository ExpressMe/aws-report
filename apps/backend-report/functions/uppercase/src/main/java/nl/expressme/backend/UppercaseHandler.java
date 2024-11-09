package nl.expressme.backend;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import java.util.function.Function;
import org.springframework.stereotype.Component;

@Component
public class UppercaseHandler implements Function<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {
  private final UserService service;

  public UppercaseHandler(UserService service) {
    this.service = service;
  }

  @Override
  public APIGatewayV2HTTPResponse apply(APIGatewayV2HTTPEvent event) {
    service.createUser(new User("id1", "name", "email"));

    User id1 = service.getUser("id1");

    return APIGatewayV2HTTPResponse.builder().withStatusCode(200).withBody(id1.getEmail()).build();
  }
}
