import type { Locator } from '@playwright/test';

/** Exercise the visible popup while keeping existing value-based regression cases. */
export async function selectValue(control: Locator, value: string) {
  const label = await control.evaluate((element, optionValue) => {
    const mirror = element.closest('.brand-select')?.querySelector('select');
    return Array.from(mirror?.options ?? []).find((option) => option.value === optionValue)
      ?.textContent;
  }, value);
  if (!label) throw new Error(`Missing option: ${value}`);
  await control.click();
  await control.page().getByRole('option', { name: label, exact: true }).click();
}
