import Link from "next/link";
import {
  addSitePhotos,
  deleteSitePhoto,
  reorderSitePhotos,
  updateSitePhoto,
} from "../actions";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { SortablePhotoGrid } from "@/components/site-photos/SortablePhotoGrid";
import { getAllSitePhotosBySection } from "@/lib/data/site-photos";
import {
  SITE_PHOTO_SECTIONS,
  type SitePhotoSection,
} from "@/lib/photo-sections";

async function SectionCard({ section }: { section: SitePhotoSection }) {
  const photos = await getAllSitePhotosBySection(section.key);
  const publishedCount = photos.filter((p) => p.published).length;

  return (
    <li className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">
            {section.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {section.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-mono">{section.key}</span>
            {section.location ? (
              <>
                {" · "}
                <Link
                  href={section.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  View {section.location} ↗
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {publishedCount} of {photos.length} published
        </span>
      </div>

      <details
        open={photos.length === 0}
        className="group mt-5 rounded-lg border border-dashed border-border bg-muted/10"
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
        >
          <span>Upload photos</span>
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 5l6 5-6 5" />
          </svg>
        </summary>
        <form
          action={addSitePhotos}
          className="space-y-4 border-t border-border px-4 py-4"
        >
          <input type="hidden" name="section" value={section.key} />
          <div>
            <label className={adminLabelClass}>Image files</label>
            <input
              name="file"
              type="file"
              required
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, WEBP, or AVIF · max 10 MB each. Pick one file or
              several at once. We resize and re-encode to WebP on upload so the
              banner stays fast.
            </p>
          </div>
          <div>
            <label className={adminLabelClass}>
              Alt text (applied to every photo in this batch)
            </label>
            <input
              name="alt_text"
              required
              maxLength={200}
              placeholder="Describe the photos for screen readers"
              className={adminInputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Refine each photo&apos;s alt text individually after upload.
            </p>
          </div>
          <div>
            <label className={adminLabelClass}>
              Caption (optional, applied to every photo in this batch)
            </label>
            <input
              name="caption"
              maxLength={280}
              placeholder="Shown overlaid on the photo"
              className={adminInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="published"
              defaultChecked
              className="rounded border-border"
            />
            Show on the public site
          </label>
          <button type="submit" className={adminPrimaryButtonClass}>
            Upload photos
          </button>
        </form>
      </details>

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Photos in this section
        </p>
        <SortablePhotoGrid
          photos={photos}
          section={section.key}
          reorderAction={reorderSitePhotos}
          updateAction={updateSitePhoto}
          deleteAction={deleteSitePhoto}
        />
      </div>
    </li>
  );
}

export default async function AdminPhotosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Photos
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Upload photos shown on the public site. Each section corresponds to a
        specific spot (e.g. the banner at the top of the Fundraising page). New
        sections show up here automatically as we add them in code.
      </p>

      <ul className="mt-8 space-y-8">
        {SITE_PHOTO_SECTIONS.map((section) => (
          <SectionCard key={section.key} section={section} />
        ))}
      </ul>
    </div>
  );
}
