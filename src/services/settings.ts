import { prisma } from '@/lib/prisma';
import type { FontPreset, RadiusPreset } from '@prisma/client';
import { getParametres } from './parametres';

const DEFAULTS = {
  id: 1,
  appName: 'Le Chaudron qui sent bon',
  timezone: 'Europe/Paris',
  colorPrimary: '#3F5D4A',
  colorAccent: '#C4A35A',
  colorBg: '#FAFAF8',
  colorFg: '#1C1C1A',
  fontPreset: 'mixte' as FontPreset,
  logoPath: null as string | null,
  radius: 'sm' as RadiusPreset,
};

export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: 1 },
    create: DEFAULTS,
    update: {},
  });
}

export async function getSettingsBundle() {
  const [apparence, parametres] = await Promise.all([
    getAppSettings(),
    getParametres(),
  ]);
  return { apparence, metier: parametres };
}

export async function updateApparence(input: {
  colorPrimary?: string;
  colorAccent?: string;
  colorBg?: string;
  colorFg?: string;
  fontPreset?: FontPreset;
  radius?: RadiusPreset;
  logoPath?: string | null;
}) {
  await getAppSettings();
  return prisma.appSettings.update({ where: { id: 1 }, data: input });
}

export async function updateIdentite(input: {
  appName?: string;
  timezone?: string;
}) {
  await getAppSettings();
  return prisma.appSettings.update({ where: { id: 1 }, data: input });
}
