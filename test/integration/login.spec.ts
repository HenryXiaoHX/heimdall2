import {
  BAD_LDAP_AUTHENTICATION,
  BAD_LOGIN_AUTHENTICATION,
  CREATE_USER_DTO_TEST_OBJ,
  LDAP_AUTHENTICATION,
  LOGIN_AUTHENTICATION
} from '../../apps/backend/test/constants/users-test.constant';
import Dropdown from '../support/components/Dropdown';
import LoginPage from '../support/pages/LoginPage';
import RegistrationPage from '../support/pages/RegistrationPage';
import LoginPageVerifier from '../support/verifiers/LoginPageVerifier';
import ToastVerifier from '../support/verifiers/ToastVerifier';
import UserModalVerifier from '../support/verifiers/UserModalVerifier';

context('Login', () => {
  // Pages, verifiers, and modules
  const dropdown = new Dropdown();
  const loginPage = new LoginPage();
  const loginPageVerifier = new LoginPageVerifier();
  const toastVerifier = new ToastVerifier();
  const userModalVerifier = new UserModalVerifier();
  const registrationPage = new RegistrationPage();

  // Run before each test
  beforeEach(() => {
    cy.visit('/signup');
    registrationPage.register(CREATE_USER_DTO_TEST_OBJ);

    cy.visit('/login');
  });

  // The test
  describe('Login Form', () => {
    it('authenticates a user with valid credentials', async () => {
      loginPageVerifier.loginFormPresent();
      cy.login(LOGIN_AUTHENTICATION);
      toastVerifier.toastTextContains('You have successfully signed in.');
    });
    it('authenticates a github oauth user', async () => {
      loginPageVerifier.loginFormPresent();
      loginPage.loginOauth('github');
      // Open the user modal
      dropdown.openUserModal();
      // Make sure all the fields exist
      userModalVerifier.verifyFieldsExist();
    });
    it('authenticates an ldap user with valid credentials', async () => {
      loginPage.switchToLDAPAuth();
      loginPageVerifier.ldapLoginFormPresent();
      loginPage.ldapLogin(LDAP_AUTHENTICATION);
      toastVerifier.toastTextContains('You have successfully signed in.');
    });
    it('authenticates an oidc user', async () => {
      loginPage.loginOauth('oidc');
      // Open the user modal
      dropdown.openUserModal();
      // Make sure all the fields exist
      userModalVerifier.verifyFieldsExist();
    });

    describe('Authentication Failures', () => {
      // Ignore 401 errors on authentication failure tests
      beforeEach(() => {
        cy.on('uncaught:exception', (err) => {
          //expect(err.response.status).to.equal(401);

          // return false to prevent the error from
          // failing this test
          return false;
        });
      });

      it('fails to authenticate a user with invalid credentials', async () => {
        cy.login(BAD_LOGIN_AUTHENTICATION);
        toastVerifier.toastTextContains('Incorrect Username or Password');
      });
      it('fails to authenticate an ldap user with invalid credentials', async () => {
        loginPage.switchToLDAPAuth();
        loginPage.ldapLogin(BAD_LDAP_AUTHENTICATION);
        toastVerifier.toastTextContains('Unauthorized');
      });
    });
  });

  describe('Logout Button', () => {
    it('sucessfully logs a user out', async () => {
      cy.login(LOGIN_AUTHENTICATION);
      dropdown.logout();
      loginPageVerifier.loginFormPresent();
    });
  });
});
