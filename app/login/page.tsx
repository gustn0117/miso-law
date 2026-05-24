import SiteLayout from "../components/SiteLayout";
import LoginForm from "./LoginForm";
import { getCurrentMember } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (getCurrentMember()) redirect("/mypage");
  return (
    <SiteLayout hideSideRail>
      <div className="page-head">
        <div className="container">
          <h1>로그인</h1>
          <p>휴대폰 번호와 비밀번호로 로그인하세요.</p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 24, maxWidth: 480 }}>
        <LoginForm />
      </div>
    </SiteLayout>
  );
}
