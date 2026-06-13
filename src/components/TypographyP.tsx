export default function TypographyP({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="leading-7 text-foreground font-sans not-first:mt-6">
      {children}
    </p>
  );
}
