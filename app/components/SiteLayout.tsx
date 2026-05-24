import { getCurrentMember } from "@/lib/auth";
import Header from "./Header";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";
import SideRail from "./SideRail";

export default function SiteLayout({
  children,
  hideFloatingCta = false,
  hideSideRail = false,
}: {
  children: React.ReactNode;
  hideFloatingCta?: boolean;
  hideSideRail?: boolean;
}) {
  const member = getCurrentMember();
  return (
    <>
      <Header member={member ? { id: member.id, name: member.name } : null} />
      <main className="site-main">{children}</main>
      <Footer />
      {!hideFloatingCta && <FloatingCTA />}
      {!hideSideRail && <SideRail />}
    </>
  );
}
