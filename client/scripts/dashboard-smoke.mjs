// Run with a Playwright page, a local test-only NextAuth session cookie, and the client on 3100.
// The cookie must contain accessToken: "fixture-only-token". All data APIs are mocked.
import assert from "node:assert/strict";

export default async function smoke(
  page,
  sessionToken,
  baseURL = "http://localhost:3100",
) {
  const id = "11111111-1111-4111-8111-111111111111";
  let title = "Test investigation";
  let chats = [];
  let removed = false;
  const requests = [];
  const onRequest = (request) => {
    if (request.url().includes("/api/")) requests.push(request);
  };
  page.on("request", onRequest);
  await page
    .context()
    .addCookies([
      {
        name: "next-auth.session-token",
        value: sessionToken,
        url: baseURL,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  const reply = (route, data) =>
    route.fulfill({ json: { success: true, data } });
  await page.route("**/api/news/search?**", (r) =>
    reply(r, {
      articles: [
        {
          title: "Fixture headline",
          source: "Fixture source",
          url: "https://example.com/story",
          publishedAt: "2026-09-26",
        },
      ],
    }),
  );
  await page.route("**/api/events/geopolitics?**", (r) => reply(r, []));
  await page.route("**/api/social/search", (r) =>
    reply(r, { posts: [], errors: [] }),
  );
  await page.route("**/api/conversation", (r) => {
    if (r.request().method() === "POST") {
      title = r.request().postDataJSON().title;
      return reply(r, { id, title });
    }
    return reply(r, removed ? [] : [{ id, title, lastUpdated: "2026-09-26" }]);
  });
  await page.route("**/api/conversation/chat/*", (r) => {
    if (r.request().method() === "POST") {
      chats = [
        ...chats,
        {
          id: `q${chats.length}`,
          sender: "user",
          content: r.request().postDataJSON().content,
        },
        {
          id: `a${chats.length}`,
          sender: "bot",
          content: "## Evidence overview\n\nEvidence is incomplete.",
        },
      ];
      return reply(r, chats.slice(-2));
    }
    return reply(r, chats);
  });
  await page.route("**/api/conversation/rename/*", (r) => {
    title = r.request().postDataJSON().title;
    return reply(r, { id, title });
  });
  await page.route(`**/api/conversation/${id}`, (r) => {
    removed = true;
    return reply(r, {});
  });
  try {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/dashboard", "/dashboard/bot"]) {
        await page.goto(baseURL + path);
        await page
          .getByRole("heading", {
            name: path.endsWith("bot")
              ? "Every story has another layer."
              : "The intelligence desk.",
          })
          .waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${path} overflows at ${width}`,
        );
      }
    }
    await page.getByRole("button", { name: /CONNECT/ }).click();
    assert.match(
      await page.getByLabel("Research question").inputValue(),
      /global trade/,
    );
    await page
      .getByRole("button", { name: "Send question", exact: true })
      .click();
    await page.waitForURL(`**/dashboard/bot/${id}`);
    await page.getByRole("heading", { name: "Evidence overview" }).waitFor();
    await page.getByRole("button", { name: "Rename investigation" }).click();
    await page
      .getByRole("textbox", { name: "Rename investigation" })
      .fill("Updated brief");
    await page.getByRole("button", { name: "Save title" }).click();
    await page.getByRole("heading", { name: "Updated brief" }).waitFor();
    await page
      .getByLabel("Continue the investigation")
      .fill("What evidence is missing?");
    await page
      .getByRole("button", { name: "Send question", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Evidence overview" })
      .nth(1)
      .waitFor();
    await page.getByRole("button", { name: "Delete investigation" }).click();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await page.waitForURL("**/dashboard/bot");
    assert.equal(removed, true);
    assert.equal(
      requests.some(
        (r) => r.url().includes(":8000") || r.url().includes("/api/agent"),
      ),
      false,
    );
    assert.ok(
      requests
        .filter((r) => r.url().includes("/api/conversation"))
        .every(
          (r) => r.headers().authorization === "Bearer fixture-only-token",
        ),
    );
    return "Responsive layouts, suggestions, conversation CRUD, follow-up, and authenticated server-only requests passed.";
  } finally {
    page.off("request", onRequest);
    await page.unrouteAll({ behavior: "wait" });
  }
}
