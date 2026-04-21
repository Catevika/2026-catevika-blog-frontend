export default function TypographyH1({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h1 className="text-primary! text-4xl pb-4 font-extrabold tracking-tight text-balance">
      {children}
    </h1>
  );
}
