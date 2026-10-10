import "./globals.css";

export const metadata = {
  title: "MedFlow | Online Healthcare Management",
  description: "A simple, secure workspace for patients, doctors and healthcare administrators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
