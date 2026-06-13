export default function TypographyH2({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="pb-2 text-xl font-semibold font-heading tracking-tight scroll-m-10 first:mt-0">
      {children}
    </h2>
  );
}
