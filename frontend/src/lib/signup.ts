/** First sign-in choice (new office vs. join with an invite code), kept across the Google redirect. */
export interface SignupChoice { invite_code: string; office_name: string }

const KEY = "qalam_signup";

export function getSignup(): SignupChoice {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<SignupChoice>;
    return { invite_code: v.invite_code ?? "", office_name: v.office_name ?? "" };
  } catch {
    return { invite_code: "", office_name: "" };
  }
}

export function setSignup(v: SignupChoice) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function clearSignup() {
  localStorage.removeItem(KEY);
}
