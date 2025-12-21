// app/(public)/layout.tsx
import ChatWidget from "./components/ChatWidget";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col">

      <Header />

      <main className="flex-grow">{children}</main>

      <ChatWidget />
      
      <Footer />
    </div>
  );
}