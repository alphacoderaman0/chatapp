import "./styles/globals.css"; 

export const metadata = {
  title: "Fast Chat App",
  description: "A real-time chat application built with Next.js, MongoDB, and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
