export default function TypographyH3({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="text-2xl font-semibold font-heading tracking-tight scroll-m-20 text-foreground">
      {children}
    </h3>
  );
}
