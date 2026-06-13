export default function TypographyH1({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h1 className="pb-2 text-2xl font-extrabold font-heading tracking-tight text-balance">
      {children}
    </h1>
  );
}
