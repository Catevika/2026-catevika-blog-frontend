export default function TypographyH1({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h1 className="font-heading pb-2 text-2xl font-extrabold tracking-tight text-balance">
      {children}
    </h1>
  );
}
