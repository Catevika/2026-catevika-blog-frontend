export default function TypographyH2({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="font-heading scroll-m-10 pb-2 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}
