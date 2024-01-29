export function createLogin() {
    const loginContainer = document.createElement("div");
    loginContainer.classList.add("container", "main-container-pop");
  
    loginContainer.innerHTML = `
      <div class="login-box">
        <div class="text-center">
          <h2 class="text-primary">Login Page</h2>
        </div>
        <div class="login">
          <form id="loginForm">
            <div class="form-group">
              <label for="loginUsername">Username or Email:</label>
              <input type="text" id="loginUsername" class="form-control" placeholder="Enter your username or email" required>
            </div>
            <div class="form-group">
              <label for="loginPassword">Password:</label>
              <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
            </div>

            <div class="form-group">
              <button type="submit" class="btn btn-success btn-block">Login Now</button>
            </div>
          </form>
  
          <div id="id-login-error" style="display: none;"></div>
        </div>
      </div>
    `;
    return loginContainer;
  }
  