import { redirect } from "next/navigation";

export default function LegacyExamPracticeRedirect() {
  redirect("/dashboard/exam-coaching");
}
