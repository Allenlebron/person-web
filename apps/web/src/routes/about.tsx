import { localizeSiteSettings } from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, MailIcon, SparklesIcon } from "lucide-react";

import { SiteShell } from "#/components/site-shell";
import { $getAboutPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";

const contactEmail = "myzwilpan@gmail.com";

export const Route = createFileRoute("/about")({
  loader: () => $getAboutPageData(),
  head: ({ loaderData }) => {
    const locale = getCurrentLocale();
    const siteSettings = loaderData
      ? localizeSiteSettings(loaderData.siteSettings, locale)
      : undefined;
    const authorName = siteSettings?.authorName || (locale === "zh" ? "作者" : "Author");

    return {
      meta: [
        {
          title:
            locale === "zh"
              ? `关于 ${authorName} | ${siteSettings?.name ?? "博客"}`
              : `About ${authorName} | ${siteSettings?.name ?? "Blog"}`,
        },
        {
          name: "description",
          content: siteSettings?.authorBio || siteSettings?.description,
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const data = Route.useLoaderData();
  const locale = getCurrentLocale();
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);
  const copy = getAboutCopy(locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <div className="bg-background">
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] lg:px-8 lg:py-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-link uppercase">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-semibold text-balance sm:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  render={<a href="/blog" aria-label={copy.primaryAction} />}
                  nativeButton={false}
                >
                  {copy.primaryAction}
                  <ArrowRightIcon />
                </Button>
                <Button
                  render={<a href={`mailto:${contactEmail}`} aria-label={copy.secondaryAction} />}
                  variant="outline"
                  nativeButton={false}
                >
                  {copy.secondaryAction}
                  <MailIcon />
                </Button>
              </div>
            </div>

            <aside className="border border-border bg-muted/35 p-5">
              <img
                src={siteSettings.avatarUrl}
                alt={siteSettings.authorName}
                className="aspect-square w-full object-cover"
              />
              <div className="mt-5">
                <p className="text-sm font-semibold text-link uppercase">{copy.profileLabel}</p>
                <p className="mt-2 text-2xl font-semibold">{siteSettings.authorName}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {siteSettings.authorBio}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-border bg-muted/35">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.36fr_0.64fr] lg:px-8 lg:py-16">
            <div>
              <p className="text-sm font-semibold text-link uppercase">{copy.whyEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold text-balance">{copy.whyTitle}</h2>
            </div>
            <div className="grid gap-4">
              {copy.principles.map((principle) => (
                <article key={principle.title} className="border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="mt-1 size-4 shrink-0 text-link" />
                    <div>
                      <h3 className="text-xl font-semibold">{principle.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-px border border-border bg-border md:grid-cols-3">
              {copy.paths.map((path) => (
                <a
                  key={path.href}
                  href={path.href}
                  className="bg-background p-5 transition hover:bg-muted/45"
                >
                  <p className="text-xs font-semibold tracking-wide text-link uppercase">
                    {path.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{path.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p>
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-link hover:underline"
              >
                <MailIcon className="size-4" />
                {contactEmail}
              </a>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function getAboutCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      eyebrow: "关于我",
      title: "记录实践，也记录长期思考。",
      description:
        "这里用于整理我在技术实践、产品思考和持续学习中的经验，把解决过的问题沉淀成可以复用的笔记。",
      primaryAction: "阅读文章",
      secondaryAction: "联系我",
      profileLabel: "作者",
      whyEyebrow: "写作原则",
      whyTitle: "我希望留下什么",
      principles: [
        {
          title: "来自真实实践",
          description: "优先记录亲自做过、验证过和排查过的问题，保留可以复现的过程。",
        },
        {
          title: "能够长期复用",
          description: "把零散经验整理成清晰的方法、示例和检查清单，方便以后继续使用。",
        },
        {
          title: "持续更新",
          description: "随着理解和实践变化持续修正内容，不把一次性的结论当成最终答案。",
        },
      ],
      paths: [
        {
          eyebrow: "Writing",
          title: "阅读最新文章",
          description: "查看近期整理的技术实践、产品思考和学习笔记。",
          href: "/blog",
        },
        {
          eyebrow: "Series",
          title: "浏览专题专栏",
          description: "按主题查看持续更新的系列内容。",
          href: "/series",
        },
        {
          eyebrow: "Notes",
          title: "查看站点文档",
          description: "了解这个个人站点的写作、发布和维护方式。",
          href: "/zh/docs",
        },
      ],
    };
  }

  return {
    eyebrow: "About me",
    title: "Documenting practice and long-term thinking.",
    description:
      "This site collects lessons from technical work, product thinking, and continuous learning, turning solved problems into reusable notes.",
    primaryAction: "Read articles",
    secondaryAction: "Contact me",
    profileLabel: "Author",
    whyEyebrow: "Writing principles",
    whyTitle: "What I want to preserve",
    principles: [
      {
        title: "Grounded in real work",
        description:
          "Prioritize problems I have built, verified, or debugged, with enough detail to reproduce the process.",
      },
      {
        title: "Reusable over time",
        description:
          "Turn scattered experience into clear methods, examples, and checklists that remain useful.",
      },
      {
        title: "Continuously revised",
        description:
          "Update conclusions as understanding and practice change instead of treating one answer as final.",
      },
    ],
    paths: [
      {
        eyebrow: "Writing",
        title: "Read the latest articles",
        description: "Browse recent technical practice, product thinking, and learning notes.",
        href: "/blog",
      },
      {
        eyebrow: "Series",
        title: "Browse series",
        description: "Explore ongoing writing grouped by topic.",
        href: "/series",
      },
      {
        eyebrow: "Notes",
        title: "Read the site docs",
        description: "See how this personal site is written, published, and maintained.",
        href: "/docs",
      },
    ],
  };
}
