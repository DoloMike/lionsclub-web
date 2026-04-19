import { HeaderAuthIsland } from "@/components/HeaderAuthIsland";
import { HeaderBrandLink } from "@/components/HeaderBrandLink";
import { LionsLogo } from "@/components/LionsLogo";
import { MainNavLinks } from "@/components/MainNavLinks";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-[inset_0_2px_0_0_rgba(235,183,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:shadow-none">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <HeaderBrandLink
          className="flex min-w-0 items-center gap-3 sm:gap-4"
          ariaLabel={`${site.shortName} home`}
        >
          <span className="shrink-0 rounded-md dark:bg-white dark:px-2 dark:py-1.5 dark:shadow-sm dark:ring-1 dark:ring-white/20">
            <LionsLogo
              priority
              className="h-8 w-auto max-w-[132px] sm:h-9 sm:max-w-[200px]"
            />
          </span>
          <span className="min-w-0 truncate border-l border-border pl-2 font-semibold leading-tight text-foreground sm:pl-4 sm:text-sm">
            <span className="block truncate">{site.shortName}</span>
            <span className="mt-0.5 hidden text-xs font-normal text-muted-foreground sm:block">
              Hancock County, KY
            </span>
          </span>
        </HeaderBrandLink>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          <MainNavLinks />
        </nav>
        <HeaderAuthIsland />
      </div>
    </header>
  );
}
