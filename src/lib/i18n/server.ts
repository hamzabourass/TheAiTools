import { cookies, headers } from "next/headers"
import { LANG_COOKIE, Lang, isLang, langFromAcceptLanguage } from "./dictionaries"

// Language for the first render: the saved choice, otherwise the browser's preference.
export async function getRequestLang(): Promise<Lang> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value
  if (isLang(saved)) return saved
  return langFromAcceptLanguage((await headers()).get("accept-language"))
}
