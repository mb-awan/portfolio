import { cn } from '@/lib/utils';

function PageHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('mx-auto flex max-w-4xl flex-col items-center py-0 lg:m-auto', className)} {...props}>
      {children}
    </section>
  );
}

function PageHeaderHeading({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn('text-center text-3xl md:text-6xl lg:leading-[1.1]', className)} {...props} />;
}

function PageHeaderDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('text-pretty text-sm/relaxed font-light text-muted md:text-base/relaxed', className)}
      {...props}
    />
  );
}

function PageActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex space-x-4 py-4 md:pb-10', className)} {...props} />;
}

export { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading };
