import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PATHS, withQuery } from "@/lib/paths";

export function JoinCTA() {
  return (
    <section className="accent-border-top accent-border-bottom bg-bmj-black py-20">
      <div className="page-shell-tight text-center">
        <PageHeader
          as="h2"
          tone="page"
          align="center"
          title="Join the Movement"
          label="Membership"
          description="Get access to the Weekend Briefing, handbooks, private resources, and a growing archive built for the deliberate Black man."
          showDivider={false}
          titleClassName="mb-0"
          className="mb-12"
          descriptionClassName="mx-auto mt-5 max-w-xl"
        />

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink href={PATHS.SIGNUP} variant="secondary" size="lg">
            Subscribe Free
          </ButtonLink>
          <ButtonLink href={withQuery(PATHS.SIGNUP, { tier: 'premium' })} variant="primary" size="lg">
            Go Premium
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
