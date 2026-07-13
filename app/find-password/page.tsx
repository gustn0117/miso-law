import SiteLayout from "../components/SiteLayout";
import FindPasswordForm from "./FindPasswordForm";
import { getCurrentMember } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function FindPasswordPage() {
  if (getCurrentMember()) redirect("/mypage");
  return (
    <SiteLayout hideSideRail>
      <div className="page-head">
        <div className="container">
          <h1>비밀번호 찾기</h1>
          <p>
            가입 시 등록한 휴대폰 번호 또는 이메일을 남겨 주세요. 관리자가
            본인 확인 후 임시 비밀번호를 안내해 드립니다.
          </p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 24, maxWidth: 480 }}>
        <FindPasswordForm />
      </div>
    </SiteLayout>
  );
}
