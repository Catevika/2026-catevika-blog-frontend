export default function TypographyP({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-foreground font-sans leading-7 not-first:mt-6">
      {children}
    </p>
  );
}
