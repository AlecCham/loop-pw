const { test, expect } = require('@playwright/test');

const testCases = [
  {
    "id": 1,
    "name": "Test Case 1",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Draft project brief",
  },
  {
    "id": 2,
    "name": "Test Case 2",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Schedule kickoff meeting",
  },
  {
    "id": 3,
    "name": "Test Case 3",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Share timeline with teammates",
  },
  {
    "id": 4,
    "name": "Test Case 4",
    "leftNav": "Work Requests",
    "column": "New Requests",
    "card_title": "[Example] Laptop setup for new hire",
  },
  {
    "id": 5,
    "name": "Test Case 5",
    "leftNav": "Work Requests",
    "column": "In Progress",
    "card_title": "[Example] Password not working",
  },
  {
    "id": 6,
    "name": "Test Case 6",
    "leftNav": "Work Requests",
    "column": "Completed",
    "card_title": "[Example] New keycard for Daniela V",
  }
];

test.describe('Asana Data-Driven Tests', () => {
  testCases.forEach((data) => {
    test(data.name, async ({ page }) => {
      await test.step('Login to Asana', async () => {
        await page.goto('https://app.asana.com/-/login');
        await page.getByRole('textbox', { name: "Email address" }).fill('ben+pose@workwithloop.com');
        await page.getByRole('button', { name: "Continue" }).nth(1).click();
        await page.getByRole('textbox', { name: "Password" }).fill('Password123');
        await page.getByRole('button', { name: "Log in" }).click();
        await page.waitForSelector('#asana_main_page', { timeout: 10000 });
        const homeTitle = "Home - Asana";
        await page.waitForLoadState('networkidle');
        console.log("Title: ", await page.title());
        const title = await page.title();
        expect(title).toBe(homeTitle);
      });

      let foundCorrectProject = false;
      await test.step('Navigate to the project page', async () => {
        console.log("Navigation block");
        await page.waitForSelector('.SidebarProjectsSectionProjectList-projects', { timeout: 10000 });

        const projectListLocator = page.locator('.SidebarProjectsSectionProjectList-projects');

        const leftNavItems = data.leftNav.split(', ');
        for (const item of leftNavItems) {
          const navItems = projectListLocator.getByText(item);
          const navItemsCount = await navItems.count();

          for (let i = 0; i < navItemsCount; i++) {
            await navItems.nth(i).click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000); // Adding delay to ensure the page is fully loaded

            const tasks = await page.locator('.TypographyPresentation--m.BoardCard-taskName').allTextContents();
            if (tasks.includes(data.card_title)) {
              const cardLocator = page.locator(`.TypographyPresentation--m.BoardCard-taskName:has-text("${data.card_title}")`);
              const columnLocator = cardLocator.locator(`xpath=ancestor::*[contains(@class, "BoardColumn BoardBody-column")]`);
              const columnText = await columnLocator.innerText();
              console.log("Actual Column Text: ", columnText);

              // Check if the column text starts with the expected status
              const actualStatus = columnText.split(/\s+/).slice(0, data.column.split(/\s+/).length).join(' ');
              console.log("Actual Status: ", actualStatus);
              console.log("Expected Status: ", data.column);
              if (actualStatus === data.column) {
                foundCorrectProject = true;
                break;
              }
            }
          }

          if (foundCorrectProject) break;
        }

        if (!foundCorrectProject) {
          throw new Error(`Could not find the correct project or status for ${data.leftNav}`);
        }
      });

      await test.step('Verify the card is within the right column', async () => {
        // This step will not be necessary because we already verified the correct status above
      });
    });
  });
});
