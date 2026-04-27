'use client';

import { useEffect, useState } from 'react';

import { useSessionMe } from '@/hooks/use-session-me';
import { Form, Formik, useField } from 'formik';
import { ChevronLeft, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthModal } from '@/components/auth/auth-modal-context';
import { FormErrorAlert } from '@/components/auth/form-error-alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { type SessionMe } from '@/lib/auth/session-me-types';
import { cn } from '@/lib/utils';
import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  signInFormSchema,
  signUpFormSchema,
  verifyEmailFormSchema,
  verifyTfaFormSchema,
} from '@/lib/validation/yup-auth-forms';

const inputClass = 'h-11 rounded-xl border-border/60 bg-background/50 pr-3';

const fieldErrorClass = 'text-sm text-foreground/80 dark:text-foreground/75';

function FieldError({ className, name }: { className?: string; name: string }): React.JSX.Element | null {
  const [, meta] = useField(name);
  if (!meta.touched || !meta.error) {
    return null;
  }
  return <p className={cn('pt-0.5', fieldErrorClass, className)}>{String(meta.error)}</p>;
}

type PasswordFormFieldProps = {
  autoComplete: string;
  className?: string;
  id: string;
  label: string;
  name: string;
  placeholder?: string;
};

function PasswordFormField({
  autoComplete,
  className,
  id,
  label,
  name,
  placeholder,
}: PasswordFormFieldProps): React.JSX.Element {
  const [field, meta] = useField(name);
  return (
    <div className={className ? cn('space-y-2', className) : 'space-y-2'}>
      <Label className="text-foreground" htmlFor={id}>
        {label}
      </Label>
      <PasswordInput
        autoComplete={autoComplete}
        className="space-y-0"
        id={id}
        inputClassName={inputClass}
        name={field.name}
        onBlur={field.onBlur}
        onChange={field.onChange}
        placeholder={placeholder}
        value={field.value as string}
      />
      {meta.touched && meta.error ? <p className={cn('pt-0.5', fieldErrorClass)}>{String(meta.error)}</p> : null}
    </div>
  );
}

type SignInFormProps = {
  onAfterLogin: () => void;
  onOpenForgot: () => void;
  onRequiresTfa: () => void;
  onSwitchToRegister: () => void;
  onUnverifiedEmail: (email: string) => void;
};

function SignInForm({
  onAfterLogin,
  onOpenForgot,
  onRequiresTfa,
  onSwitchToRegister,
  onUnverifiedEmail,
}: SignInFormProps): React.JSX.Element {
  return (
    <Formik
      initialStatus={undefined as { error?: string } | undefined}
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const res = await fetch('/api/auth/login', {
            body: JSON.stringify({ email: values.email, password: values.password }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const data = (await res.json()) as { code?: string; error?: string; requiresTfa?: boolean };
          if (!res.ok) {
            if (data.code === 'EMAIL_NOT_VERIFIED') {
              onUnverifiedEmail(values.email);
            } else {
              setStatus({ error: data.error ?? 'Could not sign in' });
            }
            return;
          }
          if (data.requiresTfa) {
            onRequiresTfa();
            return;
          }
          onAfterLogin();
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={signInFormSchema}
    >
      {({ handleBlur, handleChange, isSubmitting, isValid, status, values }) => (
        <div className="space-y-5 px-1 sm:px-0">
          <div className="px-0 pb-0.5 text-center sm:text-left">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your profile and security.</p>
          </div>
          {status?.error ? <FormErrorAlert message={status.error} title="Sign-in failed" /> : null}
          <Form className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label className="text-foreground" htmlFor="am-email">
                Email
              </Label>
              <Input
                autoComplete="email"
                className={inputClass}
                id="am-email"
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                type="email"
                value={values.email}
              />
              <FieldError name="email" />
            </div>
            <PasswordFormField autoComplete="current-password" id="am-pass" label="Password" name="password" />
            <div className="flex justify-end">
              <button className="text-xs font-medium text-primary hover:underline" onClick={onOpenForgot} type="button">
                Forgot password?
              </button>
            </div>
            <Button className="h-11 w-full rounded-xl text-base" disabled={isSubmitting || !isValid} type="submit">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            No account?{' '}
            <button className="font-medium text-primary hover:underline" onClick={onSwitchToRegister} type="button">
              Create one
            </button>
          </p>
        </div>
      )}
    </Formik>
  );
}

type SignUpFormProps = {
  onOpenVerify: (email: string) => void;
  onSwitchToSignIn: () => void;
};

function SignUpForm({ onOpenVerify, onSwitchToSignIn }: SignUpFormProps): React.JSX.Element {
  return (
    <Formik
      initialStatus={undefined as { error?: string } | undefined}
      initialValues={{ email: '', name: '', password: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const res = await fetch('/api/auth/register', {
            body: JSON.stringify({ email: values.email, name: values.name, password: values.password }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) {
            setStatus({ error: data.error ?? 'Registration failed' });
            return;
          }
          onOpenVerify(values.email);
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={signUpFormSchema}
    >
      {({ handleBlur, handleChange, isSubmitting, isValid, status, values }) => (
        <div className="space-y-5 px-1 sm:px-0">
          <div className="px-0 pb-0.5 text-center sm:text-left">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Create account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We will email a 6-digit code. Codes expire in 2 minutes.
            </p>
          </div>
          {status?.error ? <FormErrorAlert message={status.error} title="Error" /> : null}
          <Form className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label className="text-foreground" htmlFor="am-name">
                Name
              </Label>
              <Input
                autoComplete="name"
                className={inputClass}
                id="am-name"
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
              />
              <FieldError name="name" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground" htmlFor="am-reg-email">
                Email
              </Label>
              <Input
                autoComplete="email"
                className={inputClass}
                id="am-reg-email"
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                type="email"
                value={values.email}
              />
              <FieldError name="email" />
            </div>
            <PasswordFormField
              autoComplete="new-password"
              id="am-reg-pass"
              label="Password (min 8 characters)"
              name="password"
            />
            <Button className="h-11 w-full rounded-xl text-base" disabled={isSubmitting || !isValid} type="submit">
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Button>
          </Form>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button className="font-medium text-primary hover:underline" onClick={onSwitchToSignIn} type="button">
              Sign in
            </button>
          </p>
        </div>
      )}
    </Formik>
  );
}

type VerifyEmailFormProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
  setAuthEmail: (v: string) => void;
};

function VerifyEmailForm({
  email: initialEmail,
  onBack,
  onSuccess,
  setAuthEmail: setGlobalEmail,
}: VerifyEmailFormProps): React.JSX.Element {
  const [resendMessage, setResendMessage] = useState<null | string>(null);
  return (
    <Formik
      enableReinitialize
      initialStatus={undefined as { error?: string; resendError?: string } | undefined}
      initialValues={{ email: initialEmail, otp: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        setResendMessage(null);
        setGlobalEmail(values.email);
        try {
          const res = await fetch('/api/auth/verify-email', {
            body: JSON.stringify({ email: values.email, otp: values.otp }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const data = (await res.json()) as { error?: string; message?: string };
          if (!res.ok) {
            setStatus({ error: data.error ?? 'Verification failed' });
            return;
          }
          onSuccess();
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={verifyEmailFormSchema}
    >
      {({ handleBlur, isSubmitting, isValid, setFieldValue, status, values }) => {
        return (
          <>
            <DialogHeader className="space-y-1 border-0 sm:border-b">
              <button
                className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={onBack}
                type="button"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
              <DialogTitle>Verify your email</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code we sent. In development, check the server console.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 px-5 pb-6 sm:px-6">
              {status?.error ? (
                <FormErrorAlert className="mb-1" message={status.error} title="Could not verify" />
              ) : null}
              {resendMessage ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {resendMessage}
                </p>
              ) : null}
              <Form className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="v-email">Email</Label>
                  <Input
                    className="h-11 rounded-xl"
                    id="v-email"
                    name="email"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      void setFieldValue('email', e.target.value);
                    }}
                    type="email"
                    value={values.email}
                  />
                  <FieldError name="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-otp">6-digit code</Label>
                  <Input
                    className="h-11 rounded-xl text-center text-lg tracking-[0.3em]"
                    id="v-otp"
                    inputMode="numeric"
                    maxLength={6}
                    name="otp"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      void setFieldValue('otp', v);
                    }}
                    value={values.otp}
                  />
                  <FieldError name="otp" />
                </div>
                <Button className="h-11 w-full rounded-xl" disabled={isSubmitting || !isValid} type="submit">
                  {isSubmitting ? 'Verifying…' : 'Verify and continue'}
                </Button>
              </Form>
              <ResendCodeButton email={values.email} onMessage={(m) => setResendMessage(m)} />
            </div>
          </>
        );
      }}
    </Formik>
  );
}

type ResendProps = {
  email: string;
  onMessage: (m: string) => void;
};

function ResendCodeButton({ email, onMessage }: ResendProps): React.JSX.Element {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<null | string>(null);
  return (
    <>
      {resendError ? <FormErrorAlert className="mb-1" message={resendError} title="Resend" /> : null}
      <Button
        className="h-11 w-full rounded-xl"
        disabled={resendLoading || !email}
        onClick={async () => {
          setResendError(null);
          setResendLoading(true);
          try {
            const res = await fetch('/api/auth/resend-verification', {
              body: JSON.stringify({ email }),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            });
            const data = (await res.json()) as { message?: string };
            if (!res.ok) {
              setResendError('Could not resend code');
              return;
            }
            onMessage(data.message ?? 'If applicable, a new code was sent.');
          } catch {
            setResendError('Network error');
          } finally {
            setResendLoading(false);
          }
        }}
        type="button"
        variant="outline"
      >
        {resendLoading ? 'Sending…' : 'Resend code'}
      </Button>
    </>
  );
}

type ForgotFormProps = {
  onBack: () => void;
  onSendCode: (email: string) => void;
};

function ForgotPasswordForm({ onBack, onSendCode }: ForgotFormProps): React.JSX.Element {
  return (
    <Formik
      initialStatus={undefined as { error?: string } | undefined}
      initialValues={{ email: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const res = await fetch('/api/auth/forgot-password', {
            body: JSON.stringify({ email: values.email }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          if (!res.ok) {
            setStatus({ error: 'Something went wrong' });
            return;
          }
          onSendCode(values.email);
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={forgotPasswordFormSchema}
    >
      {({ handleBlur, handleChange, isSubmitting, isValid, status, values }) => (
        <>
          <DialogHeader>
            <button
              className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={onBack}
              type="button"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>We will email a 6-digit code if the account exists.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-5 pb-6 sm:px-6">
            {status?.error ? <FormErrorAlert message={status.error} title="Error" /> : null}
            <Form className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  className="h-11 rounded-xl"
                  id="fp-email"
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="email"
                  value={values.email}
                />
                <FieldError name="email" />
              </div>
              <Button className="h-11 w-full rounded-xl" disabled={isSubmitting || !isValid} type="submit">
                {isSubmitting ? 'Sending…' : 'Send code & continue'}
              </Button>
            </Form>
          </div>
        </>
      )}
    </Formik>
  );
}

type ResetPasswordFormProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
};

function ResetPasswordForm({ email, onBack, onSuccess }: ResetPasswordFormProps): React.JSX.Element {
  return (
    <Formik
      initialStatus={undefined as { error?: string } | undefined}
      initialValues={{ newPassword: '', otp: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const res = await fetch('/api/auth/reset-password', {
            body: JSON.stringify({ email, newPassword: values.newPassword, otp: values.otp }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) {
            setStatus({ error: data.error ?? 'Reset failed' });
            return;
          }
          onSuccess();
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={resetPasswordFormSchema}
    >
      {({ handleBlur, isSubmitting, isValid, setFieldValue, status, values }) => (
        <>
          <DialogHeader>
            <button
              className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={onBack}
              type="button"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
            <DialogTitle>Choose a new password</DialogTitle>
            <DialogDescription>Use the code we sent to {email || 'your email'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-5 pb-6 sm:px-6">
            {status?.error ? <FormErrorAlert message={status.error} title="Error" /> : null}
            <Form className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="rp-otp">6-digit code</Label>
                <Input
                  className="h-11 rounded-xl"
                  id="rp-otp"
                  inputMode="numeric"
                  maxLength={6}
                  name="otp"
                  onBlur={handleBlur}
                  onChange={(e) => {
                    void setFieldValue('otp', e.target.value.replace(/\D/g, '').slice(0, 6));
                  }}
                  value={values.otp}
                />
                <FieldError name="otp" />
              </div>
              <PasswordFormField autoComplete="new-password" id="rp-new" label="New password" name="newPassword" />
              <Button className="h-11 w-full rounded-xl" disabled={isSubmitting || !isValid} type="submit">
                {isSubmitting ? 'Saving…' : 'Update password'}
              </Button>
            </Form>
          </div>
        </>
      )}
    </Formik>
  );
}

type VerifyTfaFormProps = {
  onBack: () => void;
  onSuccess: () => void;
};

function VerifyTfaForm({ onBack, onSuccess }: VerifyTfaFormProps): React.JSX.Element {
  return (
    <Formik
      initialStatus={undefined as { error?: string } | undefined}
      initialValues={{ otp: '' }}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const res = await fetch('/api/auth/verify-tfa-login', {
            body: JSON.stringify({ otp: values.otp }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) {
            setStatus({ error: data.error ?? 'Invalid code' });
            return;
          }
          onSuccess();
        } catch {
          setStatus({ error: 'Network error' });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange
      validateOnMount
      validationSchema={verifyTfaFormSchema}
    >
      {({ handleBlur, isSubmitting, isValid, setFieldValue, status, values }) => (
        <>
          <DialogHeader>
            <button
              className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={onBack}
              type="button"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
            <DialogTitle>Authenticator code</DialogTitle>
            <DialogDescription>Enter the code from your authenticator app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-5 pb-6 sm:px-6">
            {status?.error ? <FormErrorAlert message={status.error} title="Error" /> : null}
            <Form className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label className="sr-only" htmlFor="tfa-otp">
                  Code
                </Label>
                <Input
                  autoComplete="one-time-code"
                  className="h-11 rounded-xl"
                  id="tfa-otp"
                  inputMode="numeric"
                  name="otp"
                  onBlur={handleBlur}
                  onChange={(e) => {
                    void setFieldValue('otp', e.target.value.replace(/\D/g, ''));
                  }}
                  placeholder="6-digit code"
                  value={values.otp}
                />
                <FieldError name="otp" />
              </div>
              <Button className="h-11 w-full rounded-xl" disabled={isSubmitting || !isValid} type="submit">
                {isSubmitting ? 'Verifying…' : 'Continue'}
              </Button>
            </Form>
          </div>
        </>
      )}
    </Formik>
  );
}

function AccountPanel({
  me,
  onClose,
  onSignOut,
}: {
  me: SessionMe;
  onClose: () => void;
  onSignOut: () => void;
}): React.JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const initial = me.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onSignOut();
      onClose();
      router.refresh();
      window.location.assign('/');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader className="border-0 sm:border-b">
        <DialogTitle className="text-xl">Account</DialogTitle>
        <DialogDescription>Manage your session and profile.</DialogDescription>
      </DialogHeader>
      <div className="px-5 pb-6 sm:px-6">
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
          {me.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
              height={64}
              src={me.imageUrl}
              width={64}
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary ring-2 ring-primary/20">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{me.name}</p>
            <p className="truncate text-sm text-muted-foreground">{me.email}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button asChild className="h-11 w-full justify-center rounded-xl" variant="default">
            <Link href="/profile" onClick={onClose}>
              Profile & settings
            </Link>
          </Button>
          <Button
            className="h-11 w-full justify-center gap-2 rounded-xl"
            disabled={busy}
            onClick={logout}
            type="button"
            variant="outline"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}

export function AuthModals(): React.JSX.Element {
  const { close, email, fromPath, open, setAuthEmail, view } = useAuthModal();
  const { me, refresh } = useSessionMe();
  const router = useRouter();

  useEffect(() => {
    if (view === 'account' && me === null) {
      open('signIn', { fromPath });
    }
  }, [view, me, open, fromPath]);

  return (
    <Dialog
      onOpenChange={(o) => {
        if (!o) {
          close();
        }
      }}
      open={view !== null}
    >
      <DialogContent
        className="flex max-h-[min(92dvh,880px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        showCloseButton={false}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-border/50 bg-card/95 px-2 py-1.5 sm:px-3">
          <DialogClose asChild>
            <button
              aria-label="Close"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              type="button"
            >
              <X className="size-4" />
            </button>
          </DialogClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {view === 'account' && me ? <AccountPanel me={me} onClose={close} onSignOut={refresh} /> : null}

          {view === 'signIn' || view === 'signUp' ? (
            <div className="flex min-h-0 flex-col">
              <div className="border-b border-border/30 p-2 sm:p-3">
                <div className="flex gap-0.5 rounded-xl bg-muted/50 p-1 sm:gap-1">
                  {(['signIn', 'signUp'] as const).map((key) => (
                    <button
                      className={cn(
                        'min-h-[2.5rem] flex-1 rounded-lg py-2 text-sm font-medium transition-all sm:min-h-0 sm:py-2.5',
                        (key === 'signIn' && view === 'signIn') || (key === 'signUp' && view === 'signUp')
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      key={key}
                      onClick={() => {
                        open(key, { fromPath });
                      }}
                      type="button"
                    >
                      {key === 'signIn' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-2 py-4 sm:px-4 sm:py-5">
                {view === 'signIn' ? (
                  <SignInForm
                    onAfterLogin={() => {
                      close();
                      void refresh();
                      router.push(fromPath.startsWith('/') ? fromPath : '/');
                      router.refresh();
                    }}
                    onOpenForgot={() => open('forgotPassword', { fromPath })}
                    onRequiresTfa={() => open('verifyTfa', { fromPath })}
                    onSwitchToRegister={() => open('signUp', { fromPath })}
                    onUnverifiedEmail={(addr) => {
                      setAuthEmail(addr);
                      open('verifyEmail', { email: addr, fromPath });
                    }}
                  />
                ) : (
                  <SignUpForm
                    onOpenVerify={(addr) => {
                      setAuthEmail(addr);
                      open('verifyEmail', { email: addr, fromPath });
                    }}
                    onSwitchToSignIn={() => open('signIn', { fromPath })}
                  />
                )}
              </div>
            </div>
          ) : null}

          {view === 'verifyEmail' ? (
            <VerifyEmailForm
              email={email}
              onBack={() => open('signIn', { fromPath })}
              onSuccess={() => {
                close();
                void refresh();
                router.push('/profile');
                router.refresh();
              }}
              setAuthEmail={setAuthEmail}
            />
          ) : null}
          {view === 'forgotPassword' ? (
            <ForgotPasswordForm
              onBack={() => open('signIn', { fromPath })}
              onSendCode={(addr) => {
                setAuthEmail(addr);
                open('resetPassword', { email: addr, fromPath });
              }}
            />
          ) : null}
          {view === 'resetPassword' ? (
            <ResetPasswordForm
              email={email}
              onBack={() => open('forgotPassword', { fromPath })}
              onSuccess={() => {
                open('signIn', { fromPath });
              }}
            />
          ) : null}
          {view === 'verifyTfa' ? (
            <VerifyTfaForm
              onBack={() => open('signIn', { fromPath })}
              onSuccess={() => {
                close();
                void refresh();
                router.push(fromPath.startsWith('/') ? fromPath : '/');
                router.refresh();
              }}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
