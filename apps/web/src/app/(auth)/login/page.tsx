import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { WaveSawtooth } from "@/components/phosphor-icons";

export default function LoginPage() {
  return (
    <main className="tide-page auth-page">
      <div className="watermark watermark-top">Alon</div>
      <div className="wave-field" aria-hidden="true" />
      <Link className="side-logo auth-logo" href="/">
        <WaveSawtooth size={25} weight="bold" />
        <span>Alon</span>
      </Link>
      <AuthCard />
    </main>
  );
}
