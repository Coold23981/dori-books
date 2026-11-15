import type { ComponentPropsWithoutRef } from "react";

type SiteLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

// Full page navigation keeps links working when the Vinext client router fails.
export default function SiteLink({ href, ...props }: SiteLinkProps) {
  return <a href={href} {...props} />;
}
