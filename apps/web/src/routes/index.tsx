import {
  localizePost,
  localizeSeries,
  localizeSiteSettings,
  localizeTag,
  type Post,
  type Series,
  type SiteSettings,
  type SupportedLocale,
  type Tag,
} from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, MailIcon } from "lucide-react";

import { PostCard } from "#/components/post-card";
import { SiteShell } from "#/components/site-shell";
import { $getHomePageData, type HomePageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";
import { m } from "#/paraglide/messages.js";

export const Route = createFileRoute("/")({
  loader: (): Promise<HomePageData> => $getHomePageData(),
  component: HomePage,
});

function HomePage() {
  const data: HomePageData = Route.useLoaderData();
  const locale = getCurrentLocale();
  const posts = data.posts.map((post) => localizePost(post, locale)).filter(isReaderFacingPost);
  const featuredPosts = data.featuredPosts
    .map((post) => localizePost(post, locale))
    .filter(isReaderFacingPost);
  const series = data.series.map((item) => localizeSeries(item, locale));
  const tags = data.tags.map((tag) => localizeTag(tag, locale));
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <ContentHome
        featuredPosts={featuredPosts.length ? featuredPosts : posts.slice(0, 3)}
        posts={posts}
        series={series}
        siteSettings={siteSettings}
        tags={tags}
        locale={locale}
      />
    </SiteShell>
  );
}

function ContentHome({
  featuredPosts,
  locale,
  posts,
  series,
  siteSettings,
  tags,
}: {
  readonly featuredPosts: Post[];
  readonly locale: SupportedLocale;
  readonly posts: Post[];
  readonly series: Series[];
  readonly siteSettings: SiteSettings;
  readonly tags: Tag[];
}) {
  const copy = getHomeCopy(locale, siteSettings.authorName);
  const featuredIds = new Set(featuredPosts.map((post) => post.id));
  const latestPosts = posts.filter((post) => !featuredIds.has(post.id)).slice(0, 4);
  const visibleLatestPosts = latestPosts.length ? latestPosts : posts.slice(0, 4);

  return (
    <div className="bg-background">
      <section className="border-b-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-wide text-link uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl leading-tight font-semibold text-balance sm:text-6xl">
              {siteSettings.name}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {siteSettings.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                render={<Link to="/blog" search={{ q: "", tag: "", series: "", page: 1 }} />}
                nativeButton={false}
                size="lg"
              >
                {copy.readArticles}
                <ArrowRightIcon />
              </Button>
              <Button
                render={<Link to="/about" />}
                variant="outline"
                nativeButton={false}
                size="lg"
              >
                {copy.about}
              </Button>
            </div>
          </div>
          <aside className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.author}
            </p>
            <p className="mt-3 text-xl font-semibold">{siteSettings.authorName}</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {siteSettings.authorBio || siteSettings.description}
            </p>
            <a
              href="mailto:myzwilpan@gmail.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
            >
              <MailIcon className="size-4" />
              myzwilpan@gmail.com
            </a>
          </aside>
        </div>
      </section>

      <PostSection
        eyebrow={copy.featuredEyebrow}
        title={copy.featuredTitle}
        description={copy.featuredDescription}
        posts={featuredPosts}
        locale={locale}
      />

      <PostSection
        eyebrow={copy.latestEyebrow}
        title={copy.latestTitle}
        description={copy.latestDescription}
        posts={visibleLatestPosts}
        locale={locale}
        muted
      />

      <TaxonomySection copy={copy} posts={posts} series={series} tags={tags} />

      <section className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-link uppercase">{copy.aboutEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-balance">{copy.aboutTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {siteSettings.authorBio || siteSettings.description}
            </p>
          </div>
          <Button render={<Link to="/about" />} variant="outline" nativeButton={false}>
            {copy.about}
            <ArrowRightIcon />
          </Button>
        </div>
      </section>
    </div>
  );
}

function PostSection({
  description,
  eyebrow,
  locale,
  muted = false,
  posts,
  title,
}: {
  readonly description: string;
  readonly eyebrow: string;
  readonly locale: SupportedLocale;
  readonly muted?: boolean;
  readonly posts: Post[];
  readonly title: string;
}) {
  return (
    <section className={`border-b border-border ${muted ? "bg-muted/35" : "bg-background"}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        {posts.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} priority={index === 0} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            {locale === "zh" ? "文章正在整理中。" : "Articles are being prepared."}
          </p>
        )}
        <div className="mt-8">
          <Button
            render={<Link to="/blog" search={{ q: "", tag: "", series: "", page: 1 }} />}
            variant="outline"
            nativeButton={false}
          >
            {m.view_all_posts()}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}

function TaxonomySection({
  copy,
  posts,
  series,
  tags,
}: {
  readonly copy: ReturnType<typeof getHomeCopy>;
  readonly posts: Post[];
  readonly series: Series[];
  readonly tags: Tag[];
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div>
          <SectionHeading
            eyebrow={copy.seriesEyebrow}
            title={copy.seriesTitle}
            description={copy.seriesDescription}
          />
          <div className="mt-7 divide-y divide-border border-y border-border">
            {series.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to="/series/$slug"
                params={{ slug: item.slug }}
                className="flex items-start justify-between gap-4 py-5 transition hover:text-link"
              >
                <span>
                  <span className="block text-lg font-semibold">{item.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {posts.filter((post) => post.series?.slug === item.slug).length}
                </span>
              </Link>
            ))}
          </div>
          <Link to="/series" className="mt-5 inline-flex text-sm font-semibold text-link">
            {copy.allSeries}
          </Link>
        </div>

        <div>
          <SectionHeading
            eyebrow={copy.tagsEyebrow}
            title={copy.tagsTitle}
            description={copy.tagsDescription}
          />
          <div className="mt-7 flex flex-wrap gap-3">
            {tags.slice(0, 12).map((tag) => (
              <Link
                key={tag.id}
                to="/tags/$slug"
                params={{ slug: tag.slug }}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-ring/50 hover:text-link"
              >
                {tag.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {
                    posts.filter((post) => post.tags.some((postTag) => postTag.slug === tag.slug))
                      .length
                  }
                </span>
              </Link>
            ))}
          </div>
          <Link to="/tags" className="mt-5 inline-flex text-sm font-semibold text-link">
            {copy.allTags}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold text-link uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-balance">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function getHomeCopy(locale: SupportedLocale, authorName: string) {
  if (locale === "zh") {
    return {
      eyebrow: `${authorName} 的个人博客`,
      readArticles: "阅读文章",
      about: "关于我",
      author: "作者",
      featuredEyebrow: "精选内容",
      featuredTitle: "值得先读的文章",
      featuredDescription: "从技术实践、产品思考和长期笔记中挑选的内容。",
      latestEyebrow: "最近更新",
      latestTitle: "最新文章",
      latestDescription: "持续记录正在学习、构建和验证的事情。",
      seriesEyebrow: "专栏",
      seriesTitle: "按主题深入阅读",
      seriesDescription: "将相关内容组织成可以连续阅读的专题。",
      tagsEyebrow: "标签",
      tagsTitle: "按兴趣探索",
      tagsDescription: "从关键词快速找到相关笔记和实践。",
      allSeries: "查看全部专栏",
      allTags: "查看全部标签",
      aboutEyebrow: "关于",
      aboutTitle: "记录实践，也记录判断如何形成。",
    };
  }

  return {
    eyebrow: `${authorName}'s personal blog`,
    readArticles: "Read articles",
    about: "About me",
    author: "Author",
    featuredEyebrow: "Featured",
    featuredTitle: "Start with these",
    featuredDescription:
      "Selected notes on technical practice, product thinking, and durable ideas.",
    latestEyebrow: "Recently published",
    latestTitle: "Latest articles",
    latestDescription: "Notes from what I am learning, building, and validating.",
    seriesEyebrow: "Series",
    seriesTitle: "Read by topic",
    seriesDescription: "Related articles organized into focused reading paths.",
    tagsEyebrow: "Tags",
    tagsTitle: "Explore by interest",
    tagsDescription: "Find related notes and practical work through keywords.",
    allSeries: "View all series",
    allTags: "View all tags",
    aboutEyebrow: "About",
    aboutTitle: "Documenting the work and the judgment behind it.",
  };
}

function isReaderFacingPost(post: { title: string; slug: string }) {
  const normalized = `${post.title} ${post.slug}`.toLowerCase();

  return !["e2e comment flow", "smoke post", "e2e edit smoke"].some((marker) =>
    normalized.includes(marker),
  );
}
