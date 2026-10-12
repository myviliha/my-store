"use client";

import { Eye, EyeOff, Mail } from "@/app/_vendor/icons";
import { VoiletWordmark } from "@/app/_vendor/voilet-wordmark";
import Link from "next/link";
import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { nameFromEmail, setAuth, signIn, useAuth } from "./auth-store";

/**
 * **Sign in, sign up and forgot password** in one dialog (the owner, 2026-10-11).
 *
 * **Sign in** (from a reference screenshot): the logo, the title, then the ways in as a column of
 * buttons, **Google, GitHub and Email**. Email gives its place to an email and password form that
 * slides up into it (`.tn-auth-up`), with "Or" above it, while Google and GitHub stay (by request).
 *
 * **Sign up is the same screen with its own title and form** (email, password, confirm). It keeps
 * Google and GitHub, on the dev's recommendation, since a provider's first sign-in creates the
 * account anyway and a sign-up without them pushes a reader towards a password; the two screens
 * differ only in the title and the form, and the line at the foot switches between them.
 *
 * **Forgot password** is reached from the sign-in form, in three steps as first asked
 * (2026-10-09): the email, then a six-digit code, then a new password and its confirmation. It ends
 * back at sign-in with the email filled in.
 *
 * **Email and password are back by the owner's ruling** (2026-10-11), over the 2026-10-09 removal
 * (`SD-178` "Google only"). The forms never submit anywhere, so a password cannot reach a URL
 * (`SD-056`), and no password is ever stored.
 *
 * **No demo note on screen** (the owner, 2026-10-11, over `SD-178`'s "the dialog says so on
 * screen"): that nothing is behind it is said here and in the DEMO-ONLY marker below.
 *
 * **A native `<dialog>` opened with `showModal()`** (`SD-178`, `SD-219`): focus is held inside it,
 * Escape closes it, the page behind is inert and does not scroll (`globals.css`), and the backdrop
 * is a 50% scrim (darker than the design's 12%, by request, 2026-10-11). A click on the scrim closes
 * it too. Sizes are the storefront's scale (a 420px card, 40px options and fields).
 */

/*
 * ┌─ DEMO-ONLY(auth) ───────────────────────────────────────────────────────────────────────────────┐
 * │ REPLACE WITH GOOGLE IDENTITY SERVICES (`SD-185`: One Tap, no client secret), THE GITHUB FLOW AND │
 * │ A REAL EMAIL SIGN-IN, SIGN-UP AND RESET.   grep -rn "DEMO-ONLY(auth)" app                         │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 * A provider button signs the visitor in as a demo account; the forms sign in any well-formed email
 * with any password (by request, 2026-10-09, for the demo flow), through `signIn` in `auth-store.ts`:
 * a name and an email kept in this browser. No code is sent: any six digits pass. Nothing is sent
 * anywhere.
 */
const DEMO_ACCOUNT = "demo@voilet.dev";

type Screen = "signin" | "signup" | "forgot";
type ResetStep = "email" | "code" | "password";

const TITLES: Record<Exclude<Screen, "forgot">, string> = {
  signin: "Sign in to Voilet",
  signup: "Create your Voilet account",
};
const RESET_TITLES: Record<ResetStep, string> = {
  email: "Reset your password",
  code: "Check your email",
  password: "Set a new password",
};

/** A new password's floor; signing in takes whatever the reader has. */
const MIN_PASSWORD = 8;
const CODE_LENGTH = 6;
/** How long before a code can be sent again. */
const RESEND_SECONDS = 30;

const INTER = "font-[family-name:var(--font-inter)]";
const JAKARTA = "font-[family-name:var(--store-font-headline)]";
/** The options keep the dialog's earlier filled pill (by request, 2026-10-11), not the reference's outline. */
const OPTION = "btn btn-lg btn-soft w-full gap-[8px]";
const LABEL = `${INTER} text-[length:var(--store-body-3)] font-medium leading-[1.2] text-[var(--store-neutral-100)]`;
/**
 * **Focus is the border colour only** (`SD-220`); autofill repaints its ground white and stays inside
 * the field's rounded edge (an inset shadow is the one thing autofill's style does not override).
 */
const FIELD = `${INTER} flex h-[40px] w-full items-center overflow-hidden rounded-[10px] border bg-white text-[length:var(--store-body-2)] leading-[1.2] text-[var(--store-neutral-100)] transition-colors duration-150`;
const FIELD_EDGE = "border-[var(--store-control-border)] focus-within:border-[var(--store-primary-40)]";
/** A field that is wrong keeps its red edge, focused or not. */
const ERROR_EDGE = "border-[var(--color-error)]";
const INPUT =
  "h-full min-w-0 flex-1 bg-transparent px-[14px] outline-none placeholder:text-[var(--store-neutral-70)] autofill:shadow-[inset_0_0_0_1000px_white] autofill:[-webkit-text-fill-color:var(--store-neutral-100)]";
/** Disabled is a grey fill, not opacity (`SD-164`). */
const PRIMARY = "btn btn-lg btn-primary w-full";
const SMALL = `${INTER} text-[length:var(--store-body-3)] leading-[1.5]`;
const LINK = `${INTER} cursor-pointer font-semibold text-[var(--store-primary-40)] hover:underline disabled:cursor-not-allowed disabled:font-medium disabled:text-[var(--store-neutral-70)] disabled:no-underline`;
/** Well-formed enough to be an address; the real check belongs to the provider. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal() {
  const open = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const [screen, setScreen] = useState<Screen>("signin");
  const [step, setStep] = useState<ResetStep>("email");
  /** On sign in and sign up: the options, or the email form in the Email button's place. */
  const [view, setView] = useState<"options" | "email">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  /** The reset's email field has been left once, so a malformed address can be named. */
  const [emailLeft, setEmailLeft] = useState(false);
  /** A line of good news over the sign-in form (after a reset). */
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  /**
   * **Sign in and sign up slide sideways into each other** (by request, 2026-10-11): their options are
   * the same, so only the title, the form and the line at the foot change, and they come in from the
   * right going to sign up and from the left coming back, like pages. Anything else rises.
   */
  const [slide, setSlide] = useState<"next" | "back" | null>(null);
  const across = slide === "next" ? "tn-slide-next" : slide === "back" ? "tn-slide-back" : "";

  const clearSecrets = () => {
    setPassword("");
    setConfirm("");
    setCode(Array(CODE_LENGTH).fill(""));
  };

  /* The store says open or shut, and on which screen; the element follows. `showModal` is what
     makes it modal. Each opening starts at the options with nothing secret typed. */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setScreen(open);
      setSlide(null);
      setView("options");
      setStep("email");
      setNotice(null);
      setEmailLeft(false);
      clearSecrets();
      el.showModal();
    } else if (!open && el.open) el.close();
  }, [open]);

  /* The resend countdown. */
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  /** After a swap, focus goes to the first field of what arrived, or else its first button. */
  const focusFirst = () =>
    requestAnimationFrame(() =>
      (
        body.current?.querySelector<HTMLElement>("input") ?? body.current?.querySelector<HTMLElement>("button")
      )?.focus(),
    );
  const go = (next: Screen, nextView: "options" | "email" = view) => {
    setSlide(
      screen === "signin" && next === "signup" ? "next" : screen === "signup" && next === "signin" ? "back" : null,
    );
    setScreen(next);
    setView(nextView);
    setStep("email");
    setEmailLeft(false);
    setNotice(null);
    clearSecrets();
    focusFirst();
  };
  const goStep = (next: ResetStep) => {
    setStep(next);
    focusFirst();
  };

  /* DEMO-ONLY(auth): signed in, and the dialog closes. */
  const finish = (address: string) => {
    signIn({ name: nameFromEmail(address), email: address });
    clearSecrets();
    setAuth(null);
  };

  const address = email.trim();
  const emailValid = EMAIL.test(address);
  /* **The email is called out once the reader has moved on to the password** (by request,
     2026-10-11): typing a password with the address still malformed is the moment it matters, and
     not before, so a half-typed address is never scolded. The reset has no password to move on to,
     so there it is leaving the field. */
  const emailError =
    (screen === "forgot" ? emailLeft && address !== "" : password !== "") && !emailValid
      ? address === ""
        ? "Enter your email address."
        : "Enter a valid email address, like you@example.com."
      : null;
  /* A new password: too short once the reader is confirming it, and a mismatch once the confirmation
     is as long as the password, so neither interrupts typing. */
  const tooShort = confirm !== "" && password.length < MIN_PASSWORD;
  const mismatch = confirm !== "" && confirm.length >= password.length && confirm !== password;
  const newPasswordReady = password.length >= MIN_PASSWORD && confirm === password;

  const submitSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (emailValid && password !== "") finish(address);
  };
  const submitSignUp = (e: FormEvent) => {
    e.preventDefault();
    if (emailValid && newPasswordReady) finish(address);
  };
  const sendCode = (e?: FormEvent) => {
    e?.preventDefault();
    if (!emailValid) return;
    setCode(Array(CODE_LENGTH).fill(""));
    setWait(RESEND_SECONDS);
    goStep("code");
  };
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (code.every((d) => d !== "")) goStep("password");
  };
  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    if (!newPasswordReady) return;
    go("signin", "email");
    setNotice("Your password is updated. Sign in with it now.");
  };

  const title = screen === "forgot" ? RESET_TITLES[step] : TITLES[screen];
  const lead =
    screen !== "forgot"
      ? null
      : step === "email"
        ? "Enter the email you signed up with and we'll send you a code."
        : step === "code"
          ? `We sent a ${CODE_LENGTH}-digit code to ${address}.`
          : `At least ${MIN_PASSWORD} characters.`;

  const emailField = (
    <Field label="Email" error={emailError}>
      {(props) => (
        <div className={`${FIELD} ${emailError ? ERROR_EDGE : FIELD_EDGE}`}>
          <input
            {...props}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailLeft(true)}
            className={INPUT}
          />
        </div>
      )}
    </Field>
  );
  const newPasswordFields = (
    <>
      <Field
        label={screen === "forgot" ? "New password" : "Password"}
        error={tooShort ? `Use at least ${MIN_PASSWORD} characters.` : null}
      >
        {(props) => (
          <PasswordInput
            {...props}
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD} characters`}
            value={password}
            onChange={setPassword}
            invalid={tooShort}
          />
        )}
      </Field>
      <Field label="Confirm password" error={mismatch ? "The passwords don't match." : null}>
        {(props) => (
          <PasswordInput
            {...props}
            autoComplete="new-password"
            placeholder="Type it again"
            value={confirm}
            onChange={setConfirm}
            invalid={mismatch}
          />
        )}
      </Field>
    </>
  );

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      /* Escape, or `close()` from anywhere: keep the store in step. */
      onClose={() => setAuth(null)}
      /* A click that lands on the dialog element itself is on the scrim, outside the card. */
      onClick={(e) => e.target === e.currentTarget && setAuth(null)}
      className="tn-modal-in m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[420px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[20px] bg-white p-0 text-left shadow-[var(--shadow-float)] backdrop:bg-[rgba(9,6,6,0.5)]"
    >
      <div className="relative flex flex-col gap-[24px] px-[20px] pt-[32px] pb-[20px] sm:px-[32px] sm:pb-[24px]">
        <button
          type="button"
          onClick={() => setAuth(null)}
          aria-label="Close"
          className="absolute top-[12px] right-[12px] flex size-[32px] cursor-pointer items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--store-neutral-40)]"
        >
          {/* biome-ignore lint/performance/noImgElement: the design's 46px SVG */}
          <img src="/auth/x.svg" alt="" width={46} height={46} className="block size-[22px]" />
        </button>

        <div className="flex flex-col items-center gap-[16px] text-center">
          <VoiletWordmark size="lg" markOnly />
          <div className="flex flex-col gap-[6px]">
            <h2
              key={title}
              id={titleId}
              className={`${across} ${JAKARTA} text-[length:var(--store-headline-12)] font-semibold leading-[1.2] text-[var(--store-neutral-100)] sm:text-[length:var(--store-headline-11)]`}
            >
              {title}
            </h2>
            {lead ? (
              <p className={`${INTER} text-[length:var(--store-body-2)] leading-[1.5] text-[var(--store-neutral-80)]`}>
                {lead}
              </p>
            ) : null}
          </div>
        </div>

        {/* Keyed by the reset's step, so each arrives by the same rise as the email form. Sign in and sign
            up share one key: their options stay put and only what differs slides across. */}
        <div
          ref={body}
          key={screen === "forgot" ? `forgot-${step}` : "account"}
          className="tn-auth-up flex flex-col gap-[24px]"
        >
          {screen !== "forgot" ? (
            /* Google and GitHub stay; only the Email button gives way, to the form rising into its place. */
            <div className="flex flex-col gap-[12px]">
              <button type="button" onClick={() => finish(DEMO_ACCOUNT)} className={OPTION}>
                {/* biome-ignore lint/performance/noImgElement: the design's 20px SVG */}
                <img src="/auth/google.svg" alt="" width={20} height={20} className="block size-[18px] shrink-0" />
                Continue with Google
              </button>
              <button type="button" onClick={() => finish(DEMO_ACCOUNT)} className={OPTION}>
                {/* biome-ignore lint/performance/noImgElement: the design's 20px SVG */}
                <img src="/auth/github.svg" alt="" width={20} height={20} className="block size-[18px] shrink-0" />
                Continue with GitHub
              </button>
              {view === "options" ? (
                <button
                  type="button"
                  onClick={() => {
                    setView("email");
                    focusFirst();
                  }}
                  className={OPTION}
                >
                  <Mail width={18} height={18} aria-hidden="true" className="shrink-0" />
                  Continue with Email
                </button>
              ) : (
                <div className="tn-auth-up flex flex-col gap-[12px]">
                  {/* "Or" between the providers above and the form, rising with it. */}
                  <div className={`${SMALL} flex items-center gap-[12px] text-[var(--store-neutral-70)]`}>
                    <span aria-hidden="true" className="h-px flex-1 bg-[var(--store-card-border)]" />
                    Or
                    <span aria-hidden="true" className="h-px flex-1 bg-[var(--store-card-border)]" />
                  </div>
                  {notice ? (
                    <p
                      role="status"
                      className={`${SMALL} rounded-[10px] bg-[var(--store-primary-10)] px-[12px] py-[8px] text-[var(--store-primary-60)]`}
                    >
                      {notice}
                    </p>
                  ) : null}
                  {screen === "signin" ? (
                    <form
                      key="signin"
                      onSubmit={submitSignIn}
                      noValidate
                      className={`${across} flex flex-col gap-[14px]`}
                    >
                      {emailField}
                      <Field
                        label="Password"
                        aside={
                          <button
                            type="button"
                            onClick={() => go("forgot")}
                            className={`${LINK} text-[length:var(--store-body-3)]`}
                          >
                            Forgot password?
                          </button>
                        }
                      >
                        {(props) => (
                          <PasswordInput
                            {...props}
                            autoComplete="current-password"
                            placeholder="Your password"
                            value={password}
                            onChange={setPassword}
                          />
                        )}
                      </Field>
                      <button type="submit" disabled={!emailValid || password === ""} className={`${PRIMARY} mt-[6px]`}>
                        Sign in
                      </button>
                    </form>
                  ) : (
                    <form
                      key="signup"
                      onSubmit={submitSignUp}
                      noValidate
                      className={`${across} flex flex-col gap-[14px]`}
                    >
                      {emailField}
                      {newPasswordFields}
                      <button
                        type="submit"
                        disabled={!emailValid || !newPasswordReady}
                        className={`${PRIMARY} mt-[6px]`}
                      >
                        Create account
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : step === "email" ? (
            <form onSubmit={sendCode} noValidate className="flex flex-col gap-[14px]">
              {emailField}
              <button type="submit" disabled={!emailValid} className={`${PRIMARY} mt-[6px]`}>
                Send code
              </button>
            </form>
          ) : step === "code" ? (
            <form onSubmit={submitCode} noValidate className="flex flex-col gap-[16px]">
              <CodeInput value={code} onChange={setCode} />
              <button type="submit" disabled={code.some((d) => d === "")} className={PRIMARY}>
                Continue
              </button>
              <p className={`${SMALL} text-center text-[var(--store-neutral-80)]`}>
                Didn't get it?{" "}
                <button type="button" onClick={() => sendCode()} disabled={wait > 0} className={LINK}>
                  {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={submitReset} noValidate className="flex flex-col gap-[14px]">
              {newPasswordFields}
              <button type="submit" disabled={!newPasswordReady} className={`${PRIMARY} mt-[6px]`}>
                Reset password
              </button>
            </form>
          )}

          {/* The way across: sign in and sign up point at each other; the reset points home. */}
          <p key={screen} className={`${across} ${SMALL} text-center text-[var(--store-neutral-80)]`}>
            {screen === "signin" ? (
              <>
                Don't have an account?{" "}
                <button type="button" onClick={() => go("signup")} className={LINK}>
                  Sign up
                </button>
              </>
            ) : screen === "signup" ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => go("signin")} className={LINK}>
                  Sign in
                </button>
              </>
            ) : (
              <button type="button" onClick={() => go("signin", "email")} className={LINK}>
                Back to sign in
              </button>
            )}
          </p>
        </div>

        {screen !== "forgot" ? (
          <p className={`${SMALL} text-center text-[var(--store-neutral-80)]`}>
            By continuing you agree to our{" "}
            <Link href="/terms" onClick={() => setAuth(null)} className="text-[var(--store-primary-40)] underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" onClick={() => setAuth(null)} className="text-[var(--store-primary-40)] underline">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </div>
    </dialog>
  );
}

/** What a field hands its control: its id, and the error wiring when it is wrong. */
type FieldProps = {
  id: string;
  "aria-required": true;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

/** A labelled, required field with its error line under it. */
function Field({
  label,
  error = null,
  aside,
  children,
}: {
  label: string;
  error?: string | null;
  /** Beside the label, on the right (Forgot password?). */
  aside?: ReactNode;
  children: (props: FieldProps) => ReactNode;
}) {
  const id = useId();
  const errorId = useId();
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center justify-between gap-[12px]">
        <label htmlFor={id} className={LABEL}>
          {label} <Required />
        </label>
        {aside}
      </div>
      {children({
        id,
        "aria-required": true,
        "aria-invalid": error !== null,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error ? (
        <p id={errorId} role="alert" className={`${SMALL} text-[var(--color-error)]`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A password box with its show/hide eye. */
function PasswordInput({
  value,
  onChange,
  invalid = false,
  autoComplete,
  placeholder,
  ...props
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  autoComplete: string;
  placeholder: string;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <div className={`${FIELD} ${invalid ? ERROR_EDGE : FIELD_EDGE}`}>
      <input
        {...props}
        type={reveal ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
      <button
        type="button"
        onClick={() => setReveal((r) => !r)}
        aria-label={reveal ? "Hide password" : "Show password"}
        aria-pressed={reveal}
        className="mr-[6px] flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--store-neutral-80)] hover:text-[var(--store-neutral-100)]"
      >
        {reveal ? <Eye width={16} height={16} /> : <EyeOff width={16} height={16} />}
      </button>
    </div>
  );
}

/**
 * The code, **one box a digit**, centred with air between them (as first asked, 2026-10-09). Typing
 * moves on, Backspace on an empty box moves back, the arrows move, and a pasted code fills every box.
 * Each box selects its digit on focus, so typing replaces it.
 */
function CodeInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const at = (i: number) => boxes.current[Math.max(0, Math.min(value.length - 1, i))]?.focus();
  const put = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const next = [...value];
    if (digits.length > 1) {
      for (let k = 0; k < digits.length && i + k < next.length; k++) next[i + k] = digits[k];
      onChange(next);
      at(i + digits.length);
      return;
    }
    next[i] = digits;
    onChange(next);
    if (digits) at(i + 1);
  };
  const key = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value[i] === "" && i > 0) {
      e.preventDefault();
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
      at(i - 1);
    } else if (e.key === "ArrowLeft") at(i - 1);
    else if (e.key === "ArrowRight") at(i + 1);
  };
  const paste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    put(i, e.clipboardData.getData("text"));
  };
  return (
    <fieldset className="flex justify-center gap-[10px]">
      <legend className="sr-only">The {value.length}-digit code</legend>
      {value.map((d, i) => (
        <input
          // biome-ignore lint/suspicious/noArrayIndexKey: the boxes are positions, not items
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          aria-label={`Digit ${i + 1}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={CODE_LENGTH}
          value={d}
          onChange={(e) => put(i, e.target.value)}
          onKeyDown={(e) => key(i, e)}
          onPaste={(e) => paste(i, e)}
          onFocus={(e) => e.target.select()}
          className={`${INTER} h-[52px] w-[42px] rounded-[10px] border bg-white text-center text-[length:var(--store-headline-12)] font-semibold text-[var(--store-neutral-100)] outline-none transition-colors duration-150 selection:bg-transparent ${FIELD_EDGE} focus:border-[var(--store-primary-40)]`}
        />
      ))}
    </fieldset>
  );
}

/** The required mark: seen, not read, since the field itself says it is required (`aria-required`). */
function Required() {
  return (
    <span aria-hidden="true" className="text-[var(--color-error)]">
      *
    </span>
  );
}
