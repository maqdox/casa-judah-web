import '../globals.css';

export const metadata = {
  title: 'Admin - Casa Judah',
  description: 'Casa Judah Admin Panel',
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
