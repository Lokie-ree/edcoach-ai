import { test, expect } from '@playwright/test';

// MVP Validation Test Suite for EdCoach AI
// Tests the complete 5-phase growth loop for Coach Free tier

test.describe('Coach Free Tier MVP Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Mock authentication - replace with actual auth flow
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
    });
  });

  test('Complete 5-Phase Growth Loop - Coach Free Tier', async ({ page }) => {
    // Phase 1: Set Goal (Coach sets PGP goal for teacher)
    await page.goto('/dashboard');
    
    // Navigate to teachers section
    await page.click('[data-testid="teachers-nav"]');
    await expect(page).toHaveURL('/teachers');
    
    // Select a teacher
    await page.click('[data-testid="teacher-card"]:first-child');
    await expect(page).toHaveURL(/\/teachers\/[^\/]+$/);
    
    // Set PGP goal
    await page.click('[data-testid="set-pgp-goal-btn"]');
    await page.fill('[data-testid="pgp-goal-input"]', 'Improve student engagement through interactive activities');
    await page.fill('[data-testid="target-date-input"]', '2024-12-31');
    await page.click('[data-testid="save-pgp-goal-btn"]');
    
    // Verify goal is set
    await expect(page.locator('[data-testid="pgp-goal-display"]')).toContainText('Improve student engagement');
    
    // Phase 2: Capture (Coach conducts walkthrough)
    await page.click('[data-testid="new-walkthrough-btn"]');
    await expect(page).toHaveURL('/walkthrough/new');
    
    // Step 1: Select indicators
    await page.click('[data-testid="reinforcement-indicator"]');
    await page.click('[data-testid="student-engagement-option"]');
    await page.click('[data-testid="refinement-indicator"]');
    await page.click('[data-testid="classroom-management-option"]');
    await page.click('[data-testid="next-step-btn"]');
    
    // Step 2: Evidence capture
    await page.fill('[data-testid="evidence-summary"]', 'Observed teacher using interactive activities effectively. Students were engaged and participating actively.');
    await page.click('[data-testid="next-step-btn"]');
    
    // Step 3: AI feedback generation
    await page.waitForSelector('[data-testid="ai-feedback-generated"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="reinforcement-feedback"]')).toBeVisible();
    await expect(page.locator('[data-testid="refinement-feedback"]')).toBeVisible();
    
    // Submit walkthrough
    await page.click('[data-testid="submit-walkthrough-btn"]');
    await expect(page).toHaveURL(/\/walkthrough\/[^\/]+\/view$/);
    
    // Phase 3: Generate (AI generates feedback)
    await expect(page.locator('[data-testid="walkthrough-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="reinforcement-feedback"]')).toContainText('Great');
    await expect(page.locator('[data-testid="refinement-feedback"]')).toContainText('Consider');
    
    // Phase 4: Reflect (Teacher reflects on feedback)
    await page.click('[data-testid="teacher-view-btn"]');
    await expect(page).toHaveURL('/growth-journal');
    
    // Verify reflection prompt is visible
    await expect(page.locator('[data-testid="reflection-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="reflection-prompt"]')).toContainText('How will you apply');
    
    // Write reflection
    await page.click('[data-testid="write-reflection-btn"]');
    await page.fill('[data-testid="reflection-content"]', 'I learned that interactive activities really engage students. I will continue using them and work on smoother transitions between activities.');
    await page.click('[data-testid="save-reflection-btn"]');
    
    // Verify reflection is saved
    await expect(page.locator('[data-testid="reflection-saved"]')).toBeVisible();
    
    // Phase 5: Monitor (Coach views analytics)
    await page.goto('/analytics');
    await expect(page).toHaveURL('/analytics');
    
    // Verify analytics are visible
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="walkthrough-count"]')).toContainText('1');
    await expect(page.locator('[data-testid="teacher-progress"]')).toBeVisible();
  });

  test('Feature Gating - Free Tier Limits', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test walkthrough limit (3 for Free tier)
    for (let i = 1; i <= 3; i++) {
      await page.click('[data-testid="new-walkthrough-btn"]');
      await page.fill('[data-testid="evidence-summary"]', `Test walkthrough ${i}`);
      await page.click('[data-testid="submit-walkthrough-btn"]');
      await page.waitForURL(/\/walkthrough\/[^\/]+\/view$/);
      await page.goto('/dashboard');
    }
    
    // 4th walkthrough should be blocked
    await page.click('[data-testid="new-walkthrough-btn"]');
    await expect(page.locator('[data-testid="limit-reached-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="limit-reached-modal"]')).toContainText('Walkthrough limit reached');
    
    // Test teacher limit (1 for Free tier)
    await page.goto('/teachers');
    await page.click('[data-testid="invite-teacher-btn"]');
    await page.fill('[data-testid="teacher-email"]', 'teacher1@test.com');
    await page.fill('[data-testid="teacher-name"]', 'Test Teacher 1');
    await page.click('[data-testid="send-invitation-btn"]');
    
    // 2nd teacher should be blocked
    await page.click('[data-testid="invite-teacher-btn"]');
    await expect(page.locator('[data-testid="teacher-limit-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="teacher-limit-modal"]')).toContainText('Teacher limit reached');
  });

  test('Feature Protection - Pro Features Blocked', async ({ page }) => {
    await page.goto('/analytics');
    
    // Enhanced analytics should be blocked for Free tier
    await expect(page.locator('[data-testid="enhanced-analytics-locked"]')).toBeVisible();
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toContainText('Upgrade to Coach Pro');
    
    // Export capabilities should be blocked
    await expect(page.locator('[data-testid="export-btn"]')).toBeDisabled();
    await expect(page.locator('[data-testid="export-btn"]')).toHaveAttribute('title', 'Export requires Coach Pro');
  });

  test('Mobile Optimization - Tablet Workflow', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/walkthrough/new');
    
    // Verify touch-friendly buttons
    const nextButton = page.locator('[data-testid="next-step-btn"]');
    await expect(nextButton).toHaveCSS('min-height', '48px');
    await expect(nextButton).toHaveCSS('touch-action', 'manipulation');
    
    // Test touch interactions
    await page.click('[data-testid="reinforcement-indicator"]');
    await page.click('[data-testid="student-engagement-option"]');
    
    // Verify responsive layout
    await expect(page.locator('[data-testid="wizard-container"]')).toHaveCSS('max-width', '768px');
  });

  test('Error Handling - Network Failures', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/walkthroughs/create', route => route.abort());
    
    await page.goto('/walkthrough/new');
    await page.fill('[data-testid="evidence-summary"]', 'Test walkthrough');
    await page.click('[data-testid="submit-walkthrough-btn"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create walkthrough');
    
    // Verify retry functionality
    await page.click('[data-testid="retry-btn"]');
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
  });

  test('Performance - Load Times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // <3 seconds target
    
    // Test AI generation performance
    const aiStartTime = Date.now();
    await page.goto('/walkthrough/new');
    await page.fill('[data-testid="evidence-summary"]', 'Test evidence');
    await page.click('[data-testid="generate-ai-feedback-btn"]');
    await page.waitForSelector('[data-testid="ai-feedback-generated"]');
    
    const aiTime = Date.now() - aiStartTime;
    expect(aiTime).toBeLessThan(10000); // <10 seconds target
  });
});

test.describe('Teacher Experience - Free Tier', () => {
  test('Growth Journal Access', async ({ page }) => {
    await page.goto('/growth-journal');
    
    // Verify all growth journal components are visible
    await expect(page.locator('[data-testid="pgp-goal-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="refinement-focus-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="reflection-prompt-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="walkthrough-timeline"]')).toBeVisible();
    
    // Test reflection functionality
    await page.click('[data-testid="write-reflection-btn"]');
    await page.fill('[data-testid="reflection-content"]', 'This is my reflection on the feedback received.');
    await page.click('[data-testid="save-reflection-btn"]');
    
    await expect(page.locator('[data-testid="reflection-saved"]')).toBeVisible();
  });

  test('Mobile Responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/growth-journal');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="pgp-goal-card"]')).toBeVisible();
    
    // Test touch interactions
    await page.click('[data-testid="write-reflection-btn"]');
    await expect(page.locator('[data-testid="reflection-modal"]')).toBeVisible();
  });
});
