import type { AppSettings, RadiusPreset } from '@prisma/client';

const RADIUS: Record<RadiusPreset, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
};

export function themeToCssVars(s: Pick<
  AppSettings,
  'colorPrimary' | 'colorAccent' | 'colorBg' | 'colorFg' | 'radius'
>): string {
  return [
    `--color-primary:${s.colorPrimary}`,
    `--color-accent:${s.colorAccent}`,
    `--color-bg:${s.colorBg}`,
    `--color-fg:${s.colorFg}`,
    `--radius:${RADIUS[s.radius]}`,
  ].join(';');
}
