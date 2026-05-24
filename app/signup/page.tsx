import SiteLayout from "../components/SiteLayout";
import LegalNotice from "../components/LegalNotice";
import SignupForm from "./SignupForm";
import { getCurrentMember } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  if (getCurrentMember()) redirect("/mypage");
  return (
    <SiteLayout hideSideRail>
      <div className="page-head">
        <div className="container">
          <h1>회원가입</h1>
          <p>회원가입을 하시면 상담 내역을 마이페이지에서 확인하실 수 있습니다.</p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 24, maxWidth: 520 }}>
        <SignupForm />
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
