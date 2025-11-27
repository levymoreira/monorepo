import { test, expect } from '@playwright/test';

// Generate a unique email for each test run to avoid conflicts
const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

test.describe('Authentication Flow', () => {
  test.describe('Signup', () => {
    test('should display signup form with all required fields', async ({ page }) => {
      await page.goto('/en/signup');
      
      // Check page title and header
      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
      
      // Check form fields are present
      await expect(page.getByTestId('signup-name')).toBeVisible();
      await expect(page.getByTestId('signup-email')).toBeVisible();
      await expect(page.getByTestId('signup-password')).toBeVisible();
      await expect(page.getByTestId('signup-submit')).toBeVisible();
      
      // Check login link
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    test('should show validation error for empty fields', async ({ page }) => {
      await page.goto('/en/signup');
      
      // Try to submit empty form - browser validation should prevent submission
      const submitButton = page.getByTestId('signup-submit');
      await submitButton.click();
      
      // Name field should be invalid (required)
      const nameInput = page.getByTestId('signup-name');
      await expect(nameInput).toHaveAttribute('required', '');
    });

    test('should show error for short password', async ({ page }) => {
      await page.goto('/en/signup');
      
      // Fill form with short password
      await page.getByTestId('signup-name').fill('Test User');
      await page.getByTestId('signup-email').fill(uniqueEmail());
      await page.getByTestId('signup-password').fill('12345'); // Less than 6 chars
      
      // Submit form
      await page.getByTestId('signup-submit').click();
      
      // Should show error message
      await expect(page.getByText('Password must be at least 6 characters')).toBeVisible({ timeout: 10000 });
    });

    test('should successfully create account and redirect', async ({ page }) => {
      const email = uniqueEmail();
      
      await page.goto('/en/signup');
      
      // Fill form
      await page.getByTestId('signup-name').fill('Test User');
      await page.getByTestId('signup-email').fill(email);
      await page.getByTestId('signup-password').fill('testpassword123');
      
      // Submit form
      await page.getByTestId('signup-submit').click();
      
      // Should redirect to onboarding
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
    });

    test('should show error for duplicate email', async ({ page }) => {
      const email = uniqueEmail();
      
      // First signup
      await page.goto('/en/signup');
      await page.getByTestId('signup-name').fill('Test User');
      await page.getByTestId('signup-email').fill(email);
      await page.getByTestId('signup-password').fill('testpassword123');
      await page.getByTestId('signup-submit').click();
      
      // Wait for redirect
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
      
      // Try to signup again with same email
      await page.goto('/en/signup');
      await page.getByTestId('signup-name').fill('Another User');
      await page.getByTestId('signup-email').fill(email);
      await page.getByTestId('signup-password').fill('differentpassword');
      await page.getByTestId('signup-submit').click();
      
      // Should show error
      await expect(page.getByText('An account with this email already exists')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Login', () => {
    test('should display login form with all required fields', async ({ page }) => {
      await page.goto('/en/login');
      
      // Check page title and header
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      
      // Check form fields are present
      await expect(page.getByTestId('login-email')).toBeVisible();
      await expect(page.getByTestId('login-password')).toBeVisible();
      await expect(page.getByTestId('login-submit')).toBeVisible();
      
      // Check signup link
      await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/en/login');
      
      // Fill form with non-existent credentials
      await page.getByTestId('login-email').fill('nonexistent@example.com');
      await page.getByTestId('login-password').fill('wrongpassword');
      
      // Submit form
      await page.getByTestId('login-submit').click();
      
      // Should show error
      await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Invalid email or password')).toBeVisible();
    });

    test('should successfully login and redirect', async ({ page }) => {
      const email = uniqueEmail();
      const password = 'testpassword123';
      
      // First create an account
      await page.goto('/en/signup');
      await page.getByTestId('signup-name').fill('Login Test User');
      await page.getByTestId('signup-email').fill(email);
      await page.getByTestId('signup-password').fill(password);
      await page.getByTestId('signup-submit').click();
      
      // Wait for signup to complete
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
      
      // Clear cookies to logout
      await page.context().clearCookies();
      
      // Now login
      await page.goto('/en/login');
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      await page.getByTestId('login-submit').click();
      
      // Should redirect to portal
      await expect(page).toHaveURL(/\/portal/, { timeout: 15000 });
    });

    test('should navigate between login and signup pages', async ({ page }) => {
      // Start at login
      await page.goto('/en/login');
      
      // Click signup link
      await page.getByRole('link', { name: 'Sign up' }).click();
      await expect(page).toHaveURL(/\/signup/);
      
      // Click login link
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Full Authentication Flow', () => {
    test('complete signup -> logout -> login flow', async ({ page }) => {
      const email = uniqueEmail();
      const password = 'securepassword123';
      const name = 'Full Flow Test User';
      
      // Step 1: Signup
      await page.goto('/en/signup');
      await page.getByTestId('signup-name').fill(name);
      await page.getByTestId('signup-email').fill(email);
      await page.getByTestId('signup-password').fill(password);
      await page.getByTestId('signup-submit').click();
      
      // Should redirect to onboarding after signup
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
      
      // Step 2: Clear cookies (simulate logout)
      await page.context().clearCookies();
      
      // Step 3: Login with the same credentials
      await page.goto('/en/login');
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      await page.getByTestId('login-submit').click();
      
      // Should redirect to portal
      await expect(page).toHaveURL(/\/portal/, { timeout: 15000 });
    });
  });
});
