import re
from playwright.sync_api import Page, expect, sync_playwright

with sync_playwright() as p:
    page = p.chromium.launch().new_page()
    page.goto("http://localhost:3000/")
    
    page.get_by_role("button", name="Start").click()
    expect(page.get_by_role("button", name="Reset")).to_be_visible()

    for _ in range(5):
        page.get_by_role("button", name="Fold").click()
    expect(page.get_by_role("button", name="Start")).to_be_visible()

    ended_text = page.locator("text=ended").first.inner_text()
    unique_id = re.search(r"Hand (\S+) ended", ended_text).group(1)
    expect(page.locator(f"text=Hand ID: {unique_id}")).to_be_visible()


