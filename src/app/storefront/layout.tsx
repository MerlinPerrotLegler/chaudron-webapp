import Link from 'next/link';
import { getAppSettings } from '@/services/settings';
import { themeToCssVars } from '@/lib/theme';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let appName = 'Le Chaudron qui sent bon';
  let css = themeToCssVars({
    colorPrimary: '#3F5D4A',
    colorAccent: '#C4A35A',
    colorBg: '#FAFAF8',
    colorFg: '#1C1C1A',
    radius: 'sm',
  });
  try {
    const s = await getAppSettings();
    appName = s.appName;
    css = themeToCssVars(s);
  } catch {
    /* defaults */
  }

  return (
    <>
      <style>{`:root{${css}}`}</style>
      <div className="min-h-screen bg-canvas">
        <header className="border-b border-ink/10 bg-primary px-4 py-5 text-white">
          <div className="mx-auto flex max-w-lg items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl leading-tight">{appName}</p>
              <p className="text-sm text-white/75">Vente marché</p>
            </div>
            <Link href="/" className="text-sm text-white/90 underline-offset-2 hover:underline">
              Back-office
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-lg px-4 py-8">{children}</div>
      </div>
    </>
  );
}
