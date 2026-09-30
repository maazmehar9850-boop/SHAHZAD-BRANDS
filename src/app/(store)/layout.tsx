import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { Toaster } from "react-hot-toast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
    </>
  );
}
