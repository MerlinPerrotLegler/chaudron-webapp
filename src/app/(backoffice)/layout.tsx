import { getAppSettings } from '@/services/settings';
import { themeToCssVars } from '@/lib/theme';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';

export const dynamic = 'force-dynamic';

export default async function BackofficeLayout({
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
      <div className="flex min-h-screen">
        <Sidebar appName={appName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
