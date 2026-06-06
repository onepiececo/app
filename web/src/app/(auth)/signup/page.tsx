import { AuthCard } from "@/components/auth-card";

export const metadata = {
  title: "Create account | onepiece",
};

export default function SignUpPage() {
  return <AuthCard initialTab="signup" />;
}
