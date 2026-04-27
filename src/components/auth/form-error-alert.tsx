import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type FormErrorAlertProps = {
  className?: string;
  message: null | string;
  title?: string;
};

export function FormErrorAlert({
  className,
  message,
  title = 'Something went wrong',
}: FormErrorAlertProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <Alert className={cn(className)} variant="form">
      <AlertTitle className="text-foreground">{title}</AlertTitle>
      <AlertDescription className="text-foreground/90 dark:text-foreground/85">{message}</AlertDescription>
    </Alert>
  );
}
