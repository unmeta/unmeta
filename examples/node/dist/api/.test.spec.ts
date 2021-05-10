import { autoRetry, fetchHtml, page, run, urlBase } from "../../tests/setup";

run("npm run start");

test("page is rendered to HTML", async () => {
  const html = await fetchHtml("/");
  expect(html).toContain(
    "<li>Angola</li><li>Antarctica</li><li>Argentina</li><li>American Samoa</li>"
  );
  expect(html).toContain("<button>Counter <span>0</span></button>");
  expect(html).toMatch(
    '<script>window.__vite_plugin_ssr = {pageId: "\\u002Fpages\\u002Findex", contextProps: (function(a){return {apolloIntialState:{ROOT_QUERY:'
  );
});

test("page is hydrated to DOM", async () => {
  page.goto(`${urlBase}/`);
  expect(await page.textContent("button")).toBe("Counter 0");
  // `autoRetry` because browser-side code may not be loaded yet
  await autoRetry(async () => {
    await page.click("button");
    expect(await page.textContent("button")).toBe("Counter 1");
  });
  expect(await page.textContent("body")).toContain("Antarctica");
});
