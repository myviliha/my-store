"use client";

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

import { type AuthMode, nameFromEmail, setAuth, signIn, useAuth } from "./auth-store";

/**
 * **Sign in, sign up and forgot password**, one modal, from Figma "Sign in - guest - guest" (node
 * 851:9042, the "Pop up" over 851:8644; 2026-10-09).
 *
 * **Sign up is Figma "Sign up- guest - guest"** (851:9086, its "Pop up" 851:9346): the same card
 * with its own title and line, a **Full Name** field above Email, a new-password field with no
 * "Forgot Password?", and "Already have an account? Sign in" where sign-in says "New here? Create
 * an account". The footer links switch mode in place; the name and email typed so far stay.
 *
 * **Not in the design, by request (2026-10-09), drawn in the same card at the same sizes:**
 * - **Confirm Password** on sign up, under Password. A mismatch says "Passwords don't match" under
 *   it, once the reader leaves the field or presses Sign Up, and blocks the submit.
 * - **Forgot password**, from "Forgot Password?": three steps, "Step n of 3" above the title.
 *   1. Email. 2. A 6-digit code, one box per digit: typing moves on, Backspace moves back, the
 *   arrows move, and a pasted code fills every box; "Resend" waits 30 seconds between sends.
 *   3. New Password and Confirm Password, matched as on sign up. Done returns to sign in with a
 *   success note. The Google/GitHub buttons and the terms line are sign-in and sign-up only.
 * The error red is the design's own `error-70` (#b95554, from its preview chips; the store has no
 * error token), 4.68:1 on white.
 *
 * **Where the words differ from the frames, on purpose:** the main button says just "Sign In" or
 * "Sign Up" (by request; the frames say "Sign in with email" on both), and the sign-up footer's
 * "Already havean account? SIgn in" is spelled "Already have an account? Sign in".
 *
 * **The design's layout, colours and fonts at the storefront's own scale** (by request): the Figma
 * card is drawn at 600px with 32px titles, 20px labels and 56px buttons, which beside the rest of
 * the store (14px body, 40px controls) read as a different product. So the order, the pill fields
 * on `--store-neutral-40` with a `--store-neutral-60` edge, the primary button, the "or" rule (the
 * design's own 20%-black line, stretched to the space), the Google and GitHub buttons and every
 * colour are the design's; the sizes are the store's tokens: a 460px card, 20px corners, 24px
 * padding, the title at `--store-headline-11`, body at `--store-body-2`, 40px fields and buttons.
 * The icons are the design's own SVGs in `public/auth/`, drawn smaller.
 *
 * **A native `<dialog>` opened with `showModal()`**, so focus is held inside it, Escape closes it,
 * the page behind is inert and the backdrop is the design's 12% scrim (`::backdrop`). A click on
 * the scrim closes it too.
 *
 * **Also not in the design:** the eye shows an open eye once a password is revealed (the design
 * draws only the hidden state); below `sm` the card takes the screen's width less a 16px gutter,
 * with 20px padding and the title at `--store-headline-12`, and scrolls inside itself if the screen
 * is short (`CLAUDE.md`).
 */

/*
 * ┌─ DEMO-ONLY(auth) ───────────────────────────────────────────────────────────────────────────────┐
 * │ REMOVE WHEN SIGN-IN IS WIRED TO THE AUTH SERVICE. Find every piece with:                        │
 * │   grep -rn "DEMO-ONLY(auth)" app                                                                │
 * └─────────────────────────────────────────────────────────────────────────────────────────────────┘
 * There is no account system yet, so for the full-flow demo (2026-10-09, by request) **any email and
 * password sign in**, as does sign up, Google and GitHub: each signs the visitor in through
 * `signIn` in `auth-store.ts` (a name and an email kept in this browser, never the password) and
 * closes the modal. Forgot password sends no email, so **any 6 digits pass the code step**, and the
 * reset changes nothing before it returns to sign in. **Nothing typed is sent anywhere.**
 */
const DEMO = {
  codeSent: "Demo: no email was sent. Enter any 6 digits to continue.",
  resent: "Demo: no email was sent. Any 6 digits still work.",
  reset: "Password reset. Sign in with your new password.",
} as const;
/** Who Google or GitHub "return" in the demo when no email has been typed. */
const DEMO_PROVIDER_EMAIL = "demo@voilet.dev";

type Step = "email" | "code" | "password";
type Note = { text: string; tone: "info" | "success" };

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const MIN_PASSWORD = 8;

const INTER = "font-[family-name:var(--font-inter)]";
const JAKARTA = "font-[family-name:var(--store-font-headline)]";
const LABEL = `${JAKARTA} text-[length:var(--store-body-2)] font-medium leading-[1.2] text-black`;
const FIELD_EDGE =
  "border-[var(--store-neutral-60)] focus-within:border-[var(--store-primary-40)]";
/** The design's `error-70`; the store has no error token. */
const ERROR_EDGE =
  "border-[#b95554]";
/**
 * **Autofill stays inside the pill.** When the browser fills a saved value it paints its own blue
 * ground on the `<input>`, which is a rectangle inside this rounded pill, so the blue showed past the
 * pill's round ends. The input repaints that ground in the pill's own grey (an inset shadow is the one
 * thing the browser's autofill style does not override) and keeps the text black, and the pill clips
 * whatever is inside it to its round shape (`overflow-hidden`).
 *
 * **Focus is the border colour only** (by request): primary blue, or the error red when the field is
 * wrong; no glow ring around the pill and no change to its ground. The code boxes select their digit
 * on focus so typing replaces it, with the selection drawn clear for the same reason.
 */
const FIELD = `${INTER} flex h-[40px] w-full items-center overflow-hidden rounded-[100px] border bg-[var(--store-neutral-40)] text-[length:var(--store-body-2)] leading-[1.2] text-black transition-colors duration-150`;
const INPUT =
  "h-full min-w-0 flex-1 bg-transparent px-[16px] outline-none placeholder:text-[var(--store-neutral-70)] autofill:shadow-[inset_0_0_0_1000px_var(--store-neutral-40)] autofill:[-webkit-text-fill-color:black] autofill:[caret-color:black]";
const PRIMARY = `${JAKARTA} flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[100px] bg-[var(--store-primary-40)] px-[24px] text-[length:var(--store-body-2)] font-semibold leading-[1.2] text-white transition-colors duration-150 hover:bg-[var(--store-primary-50)] active:bg-[var(--store-primary-60)] disabled:cursor-not-allowed disabled:bg-[var(--store-primary-30)]`;
const SOCIAL = `${INTER} flex h-[40px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[100px] bg-[var(--store-neutral-40)] px-[24px] text-[length:var(--store-body-2)] font-medium leading-[1.2] text-[var(--store-neutral-100)] transition-colors duration-150 hover:bg-[var(--store-neutral-50)]`;
const LINK = "cursor-pointer font-semibold text-[var(--store-primary-40)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--store-neutral-70)] disabled:no-underline";
const SMALL = `${INTER} text-[length:var(--store-body-3)] leading-[1.5]`;

/** The title, line and main button for each mode, and for each step of forgot password. */
function headingOf(mode: AuthMode, step: Step, email: string) {
  if (mode === "signin") {
    return { title: "Sign in to Voilet", lead: "Save your progress and pick up right where you left off.", submit: "Sign In" };
  }
  if (mode === "signup") {
    return { title: "Sign up to Voilet", lead: "Takes less than a minute — no credit card required.", submit: "Sign Up" };
  }
  if (step === "email") {
    return {
      title: "Forgot your password?",
      lead: "Enter the email you signed up with and we'll send you a 6-digit code.",
      submit: "Send Code",
    };
  }
  if (step === "code") {
    return { title: "Check your email", lead: `Enter the 6-digit code we sent to ${email}.`, submit: "Verify" };
  }
  return {
    title: "Set a new password",
    lead: `Use at least ${MIN_PASSWORD} characters. You'll sign in with it from now on.`,
    submit: "Reset Password",
  };
}

const STEP_NUMBER: Record<Step, number> = { email: 1, code: 2, password: 3 };

export function AuthModal() {
  const mode = useAuth();
  /* The last mode stays drawn while the dialog closes, so the words do not change under it. */
  const [shown, setShown] = useState<AuthMode>("signin");
  const current = mode ?? shown;
  const [step, setStep] = useState<Step>("email");
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const ids = { name: useId(), email: useId(), password: useId(), confirm: useId(), code: useId() };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  /* The mismatch shows once the reader has finished with Confirm, never while they are typing it. */
  const [checkMatch, setCheckMatch] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  /* A note to show after a mode change, which otherwise clears the note (reset → sign in). */
  const carry = useRef<Note | null>(null);
  const [wait, setWait] = useState(0);

  const heading = headingOf(current, step, email);
  const asksConfirm = current === "signup" || (current === "forgot" && step === "password");
  const mismatch = asksConfirm && checkMatch && confirm !== "" && confirm !== password;

  /* The store says which mode, or shut; the element follows. `showModal` is what makes it modal.
     A new mode starts clean: no note (unless one was carried), no passwords, no code, step 1. */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (mode) {
      setShown(mode);
      setNote(carry.current);
      carry.current = null;
      setPassword("");
      setConfirm("");
      setCode(Array(CODE_LENGTH).fill(""));
      setCheckMatch(false);
      setStep("email");
      setWait(0);
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [mode]);

  /* A switch of mode or step puts the reader in its first field, as opening does. The first open is
     left to `showModal`, which focuses the first control. */
  const opened = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on a change of mode or step
  useEffect(() => {
    const el = dialog.current;
    if (!mode || !el?.open) {
      opened.current = false;
      return;
    }
    if (!opened.current) {
      opened.current = true;
      return;
    }
    requestAnimationFrame(() => el.querySelector<HTMLInputElement>("form input")?.focus());
  }, [mode, step]);

  /* Resend's countdown. */
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  /* A step starts clean; the submit that moves on sets the next step's note after this. */
  const goStep = (next: Step) => {
    setStep(next);
    setNote(null);
    setPassword("");
    setConfirm("");
    setCheckMatch(false);
    if (next !== "code") setCode(Array(CODE_LENGTH).fill(""));
  };

  const blockMismatch = () => {
    if (confirm === password) return false;
    setCheckMatch(true);
    dialog.current?.querySelector<HTMLInputElement>(`[id="${ids.confirm}"]`)?.focus();
    return true;
  };

  /* DEMO-ONLY(auth): signed in, and the modal closes. Its fields are emptied, so after a sign-out the
     next person to open it does not find the last one's name and email waiting. */
  const finish = (user: { name: string; email: string }) => {
    signIn({ name: user.name, email: user.email.trim() });
    setName("");
    setEmail("");
    setAuth(null);
  };
  /* Google and GitHub take the email typed so far, or a demo address. */
  const provider = () => {
    const address = email.trim() || DEMO_PROVIDER_EMAIL;
    finish({ name: name.trim() || nameFromEmail(address), email: address });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // DEMO-ONLY(auth): every branch below stands in for a call to the auth service.
    if (current === "signin") {
      finish({ name: nameFromEmail(email), email });
    } else if (current === "signup") {
      if (blockMismatch()) return;
      finish({ name: name.trim() || nameFromEmail(email), email });
    } else if (step === "email") {
      goStep("code");
      setWait(RESEND_SECONDS);
      setNote({ text: DEMO.codeSent, tone: "info" });
    } else if (step === "code") {
      goStep("password");
    } else {
      if (blockMismatch()) return;
      carry.current = { text: DEMO.reset, tone: "success" };
      setAuth("signin");
    }
  };

  const social = current !== "forgot";
  const codeFull = code.every((d) => d !== "");

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      /* Escape, or `close()` from anywhere: keep the store in step. */
      onClose={() => setAuth(null)}
      /* A click that lands on the dialog element itself is on the scrim, outside the card. */
      onClick={(e) => e.target === e.currentTarget && setAuth(null)}
      className="tn-modal-in m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[460px] overflow-y-auto overscroll-contain rounded-[20px] bg-white p-0 text-left shadow-[0_24px_64px_-24px_#0c0c0c40] backdrop:bg-[rgba(9,6,6,0.12)]"
    >
      <div className="flex flex-col gap-[20px] p-[20px] sm:gap-[24px] sm:p-[24px]">
        <div className="flex items-start justify-between gap-[16px]">
          <div className="flex min-w-0 flex-col gap-[6px] leading-[1.2]">
            {current === "forgot" ? (
              <p className={`${SMALL} font-semibold text-[var(--store-primary-40)]`}>
                Step {STEP_NUMBER[step]} of 3
              </p>
            ) : null}
            <h2
              id={titleId}
              className={`${JAKARTA} text-[length:var(--store-headline-12)] font-semibold text-black sm:text-[length:var(--store-headline-11)]`}
            >
              {heading.title}
            </h2>
            <p className={`${INTER} text-[length:var(--store-body-2)] leading-[1.5] text-[var(--store-neutral-80)]`}>
              {heading.lead}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAuth(null)}
            aria-label="Close"
            className="-mr-[4px] -mt-[2px] flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--store-neutral-40)]"
          >
            {/* biome-ignore lint/performance/noImgElement: the design's 46px SVG */}
            <img src="/auth/x.svg" alt="" width={46} height={46} className="block size-[22px]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-[20px]">
          <form onSubmit={submit} className="flex w-full flex-col gap-[20px]">
            <div className="flex w-full flex-col gap-[12px]">
              {/* Sign up only (Figma 851:9355). */}
              {current === "signup" ? (
                <Field id={ids.name} label="Full Name">
                  <input
                    id={ids.name}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT}
                  />
                </Field>
              ) : null}

              {current !== "forgot" || step === "email" ? (
                <Field id={ids.email} label="Email">
                  <input
                    id={ids.email}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="You@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT}
                  />
                </Field>
              ) : null}

              {current === "forgot" && step === "code" ? (
                <div className="flex w-full flex-col gap-[12px]">
                  <span id={ids.code} className={LABEL}>
                    6-digit code
                  </span>
                  <CodeInput value={code} onChange={setCode} labelledBy={ids.code} />
                  <p className={`${SMALL} text-[var(--store-neutral-80)]`}>
                    Didn't get it?{" "}
                    <button
                      type="button"
                      disabled={wait > 0}
                      onClick={() => {
                        setWait(RESEND_SECONDS);
                        setNote({ text: DEMO.resent, tone: "info" }); // DEMO-ONLY(auth)
                      }}
                      className={LINK}
                    >
                      {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
                    </button>
                  </p>
                </div>
              ) : null}

              {current !== "forgot" || step === "password" ? (
                <PasswordField
                  id={ids.password}
                  label={current === "forgot" ? "New Password" : "Password"}
                  name={current === "signin" ? "password" : "new-password"}
                  autoComplete={current === "signin" ? "current-password" : "new-password"}
                  minLength={current === "signin" ? undefined : MIN_PASSWORD}
                  value={password}
                  onChange={setPassword}
                >
                  {current === "signin" ? (
                    <button
                      type="button"
                      onClick={() => setAuth("forgot")}
                      className={`${INTER} ${LINK} text-[length:var(--store-body-3)] leading-[1.2]`}
                    >
                      Forgot Password?
                    </button>
                  ) : null}
                </PasswordField>
              ) : null}

              {asksConfirm ? (
                <PasswordField
                  id={ids.confirm}
                  label="Confirm Password"
                  name="confirm-password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                  onBlur={() => setCheckMatch(true)}
                  error={mismatch ? "Passwords don't match" : undefined}
                />
              ) : null}
            </div>

            <button type="submit" disabled={current === "forgot" && step === "code" && !codeFull} className={PRIMARY}>
              {heading.submit}
            </button>
          </form>

          {/* DEMO-ONLY(auth): the code step's "no email was sent", and the reset's success. */}
          {note ? (
            <p
              role="status"
              className={`${SMALL} -mt-[4px] w-full rounded-[10px] px-[12px] py-[8px] ${note.tone === "success" ? "bg-[var(--store-success-10)] text-[var(--store-success-90)]" : "bg-[var(--store-primary-10)] text-[var(--store-primary-60)]"}`}
            >
              {note.text}
            </p>
          ) : null}

          {social ? (
            <>
              {/* "or", between the design's own rules (20% black), stretched to the space. */}
              <div className="flex w-full items-center gap-[12px]">
                <span aria-hidden="true" className="h-px flex-1">
                  {/* biome-ignore lint/performance/noImgElement: the design's 1px rule */}
                  <img src="/auth/divider.svg" alt="" width={234} height={1} className="block size-full" />
                </span>
                <span className={`${INTER} text-[length:var(--store-body-3)] leading-[1.2] text-[var(--store-neutral-80)]`}>or</span>
                <span aria-hidden="true" className="h-px flex-1">
                  {/* biome-ignore lint/performance/noImgElement: the design's 1px rule */}
                  <img src="/auth/divider.svg" alt="" width={234} height={1} className="block size-full" />
                </span>
              </div>

              <div className="flex w-full flex-col gap-[14px]">
                {/* DEMO-ONLY(auth): both stand in for the providers' sign-in. */}
                <button type="button" onClick={provider} className={SOCIAL}>
                  {/* biome-ignore lint/performance/noImgElement: the design's 20px SVG */}
                  <img src="/auth/google.svg" alt="" width={20} height={20} className="block size-[18px] shrink-0" />
                  Continue with Google
                </button>
                <button type="button" onClick={provider} className={SOCIAL}>
                  {/* biome-ignore lint/performance/noImgElement: the design's 20px SVG */}
                  <img src="/auth/github.svg" alt="" width={20} height={20} className="block size-[18px] shrink-0" />
                  Continue with Github
                </button>
              </div>
            </>
          ) : null}

          <p className={`${INTER} text-center text-[length:var(--store-body-2)] leading-[1.2] text-[var(--store-neutral-80)]`}>
            {current === "signin" ? (
              <>
                New here?{" "}
                <button type="button" onClick={() => setAuth("signup")} className={LINK}>
                  Create an account
                </button>
              </>
            ) : current === "signup" ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setAuth("signin")} className={LINK}>
                  Sign in
                </button>
              </>
            ) : step === "code" ? (
              <>
                Wrong address?{" "}
                <button type="button" onClick={() => goStep("email")} className={LINK}>
                  Use a different email
                </button>
              </>
            ) : (
              <>
                Remembered it?{" "}
                <button type="button" onClick={() => setAuth("signin")} className={LINK}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {social ? (
          <p className={`${SMALL} text-[var(--store-neutral-80)]`}>
            By continuing you agree to our{" "}
            <Link href="/terms" onClick={() => setAuth(null)} className="text-[var(--store-primary-40)] underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" onClick={() => setAuth(null)} className="text-[var(--store-primary-40)] underline">
              Privacy Policy
            </Link>
            <span className="text-[var(--store-primary-40)]">.</span>
          </p>
        ) : null}
      </div>
    </dialog>
  );
}

/** A label over one pill field. */
function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-[6px]">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className={`${FIELD} ${FIELD_EDGE}`}>{children}</div>
    </div>
  );
}

/**
 * A password pill with its own eye, so Password and Confirm Password reveal separately. Anything
 * passed as `children` sits under it on the right ("Forgot Password?"); `error` sits under it on
 * the left, in the design's error red, and is what the field is described by.
 */
function PasswordField({
  id,
  label,
  name,
  autoComplete,
  minLength,
  value,
  onChange,
  onBlur,
  error,
  children,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  minLength?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  children?: ReactNode;
}) {
  const [reveal, setReveal] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div className="flex w-full flex-col gap-[6px]">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className={`${FIELD} ${error ? ERROR_EDGE : FIELD_EDGE} pr-[6px]`}>
        <input
          id={id}
          type={reveal ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={INPUT}
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          aria-label={reveal ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={reveal}
          aria-controls={id}
          className="flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--store-neutral-50)]"
        >
          {reveal ? (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 5.25C4.5 5.25 1.5 12 1.5 12s3 6.75 10.5 6.75S22.5 12 22.5 12s-3-6.75-10.5-6.75Z"
                stroke="black"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={12} cy={12} r={3.75} stroke="black" strokeWidth={1.5} />
            </svg>
          ) : (
            // biome-ignore lint/performance/noImgElement: the design's 24px SVG
            <img src="/auth/eye-slash.svg" alt="" width={24} height={24} className="block size-[18px]" />
          )}
        </button>
      </div>
      {error || children ? (
        <div className="flex items-start justify-between gap-[12px]">
          {error ? (
            <p id={errorId} className={`${SMALL} text-[#b95554]`}>
              {error}
            </p>
          ) : (
            <span />
          )}
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The one-time code, one box per digit. Typing a digit moves on, Backspace on an empty box moves
 * back and clears it, the arrows move, and a pasted code (or one the phone offers from its
 * messages, via `autocomplete="one-time-code"` on the first box) fills from where it lands.
 */
function CodeInput({
  value,
  onChange,
  labelledBy,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  labelledBy: string;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => boxes.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();

  const fill = (from: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH - from);
    if (!digits) return;
    const next = [...value];
    for (let k = 0; k < digits.length; k++) next[from + k] = digits[k] ?? "";
    onChange(next);
    focus(from + digits.length);
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value[i] === "" && i > 0) {
      e.preventDefault();
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
      focus(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex justify-center gap-[10px] sm:gap-[12px]">
      {value.map((digit, i) => (
        <input
          // biome-ignore lint/suspicious/noArrayIndexKey: the boxes are fixed positions
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
          value={digit}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (typed.length > 1) {
              fill(i, typed);
              return;
            }
            const next = [...value];
            next[i] = typed;
            onChange(next);
            if (typed) focus(i + 1);
          }}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData("text"));
          }}
          onFocus={(e) => e.target.select()}
          className={`${JAKARTA} h-[56px] w-[44px] shrink-0 rounded-[12px] sm:w-[48px] border border-[var(--store-neutral-60)] bg-[var(--store-neutral-40)] text-center text-[length:var(--store-headline-12)] font-semibold text-black outline-none transition-colors duration-150 selection:bg-transparent focus:border-[var(--store-primary-40)]`}
        />
      ))}
    </div>
  );
}
