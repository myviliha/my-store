import { Capabilities } from "./_components/capabilities";
import { Closing } from "./_components/closing";
import { Conversation } from "./_components/conversation";
import { Faq } from "./_components/faq";
import { Gallery } from "./_components/gallery";
import { How } from "./_components/how";
import { Outputs } from "./_components/outputs";
import { Proof } from "./_components/proof";
import { Search } from "./_components/search";

/**
 * The landing page, as a server component end to end: no section here needs state. The FAQ
 * accordion is `@viliha/vui-react`'s, which carries its own `"use client"`, so the boundary sits
 * inside the library and not above this page.
 *
 * The vertical rhythm is the reference's: a section's top margin, not its padding, separates it
 * from the one above, which is why each section brings its own `mt-`.
 */
export default function HomePage() {
  return (
    <Conversation>
      <Search />
      <Gallery />
      <How />
      <Outputs />
      <Proof />
      <Capabilities />
      <Faq />
      <Closing />
    </Conversation>
  );
}
