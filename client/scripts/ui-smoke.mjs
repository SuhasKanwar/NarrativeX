// Run with a Playwright Page and the local Next.js server running.
// import smoke from './scripts/ui-smoke.mjs'; await smoke(page);
import assert from "node:assert/strict";

export default async function smoke(page, baseURL = "http://localhost:3000") {
  const pages = [
    ["/", "Every story"],
    ["/auth/signin", "A fresh perspective"],
    ["/auth/signup", "See the story"],
    ["/auth/error?error=AccessDenied", "One more connection"],
    ["/missing-page", "This trail ends here"],
  ];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, heading] of pages) {
      await page.goto(`${baseURL}${path}`);
      await page.getByRole("heading", { name: new RegExp(heading), level: 1 }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} overflows at ${width}px`);
    }
  }
  await page.goto(`${baseURL}/`);
  await page.locator(".mobile-menu summary").click();
  assert.equal(await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible(), true);
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Get started" }).click();
  await page.getByLabel("Full name").waitFor();
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Show password" }).click();
  assert.equal(await page.locator("#password").getAttribute("type"), "text");
  assert.equal(await page.locator("#password").evaluate(input => input.checkValidity()), false);

  // Stub only authentication responses: no accounts or sessions are created.
  await page.route("**/api/auth/providers", route => route.fulfill({ json: { credentials: { id: "credentials", type: "credentials", name: "Credentials" } } }));
  await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "test-token" } }));
  await page.route("**/api/auth/callback/credentials", async route => {
    assert.ok(route.request().postData().includes("register=false"));
    await route.fulfill({ status: 401, json: { url: `${baseURL}/auth/signin?error=CredentialsSignin` } });
  });
  try {
    await page.goto(`${baseURL}/auth/signin`);
    await page.getByLabel("Email address").fill("ui-test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("test-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.getByRole("alert").waitFor();
    assert.match(await page.getByRole("alert").innerText(), /couldn't sign you in/);
    assert.equal(await page.getByRole("button", { name: "Sign in", exact: true }).isEnabled(), true);
  } finally {
    await page.unrouteAll({ behavior: "wait" });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/`);
  assert.equal(await page.locator(".hero-asterisk").evaluate(element => getComputedStyle(element).animationName), "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return "15 responsive route checks, mobile navigation, password visibility, native validation, mocked auth failure, and reduced motion passed.";
}
