package nl.expressme.backend;

import org.springframework.stereotype.Service;

// Create an interface for this?
@Service
public final class UserService {
  private final UserRepository repository;

  public UserService(UserRepository repository) {
    this.repository = repository;
  }

  public User createUser(User user) {
    return repository.save(user);
  }

  public User getUser(String id) {
    return repository.findById(id).get();
  }
}
