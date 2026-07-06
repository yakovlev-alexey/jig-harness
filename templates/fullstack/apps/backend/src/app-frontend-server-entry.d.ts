declare module '@app/frontend/server-entry' {
  export function render(url: string): Promise<{ appHtml: string; dehydratedState: unknown }>;
}
