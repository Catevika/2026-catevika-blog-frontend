export default function TypographyH3({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="font-heading text-foreground scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  );
}
