package nl.expressme.backend;

import java.util.function.Function;
import org.springframework.stereotype.Component;

@Component
public class UppercaseHandler implements Function<String, String> {
  private final UserService service;

  public UppercaseHandler(UserService service) {
    this.service = service;
  }

  @Override
  public String apply(String event) {
    service.createUser(new User("id1", "name", "email"));

    User id1 = service.getUser("id1");

    return id1.getEmail();
  }
}
