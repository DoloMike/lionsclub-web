"use client";

import { useActionState } from "react";
import {
  addSitePhotos,
  type AddSitePhotosState,
} from "@/app/admin/(protected)/actions";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";

const initialState: AddSitePhotosState = { error: null };

export function SitePhotoUploadForm({ sectionKey }: { sectionKey: string }) {
  const [state, formAction, pending] = useActionState(
    addSitePhotos,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 border-t border-border px-4 py-4">
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      <input type="hidden" name="section" value={sectionKey} />
      <div>
        <label className={adminLabelClass}>Image files</label>
        <input
          name="file"
          type="file"
          required
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={pending}
          className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WEBP, or AVIF · max 10 MB each. Pick one file or several at
          once. We resize and re-encode to WebP on upload so the banner stays
          fast.
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
          disabled={pending}
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
          disabled={pending}
          placeholder="Shown overlaid on the photo"
          className={adminInputClass}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="published"
          defaultChecked
          disabled={pending}
          className="rounded border-border"
        />
        Show on the public site
      </label>
      <button type="submit" disabled={pending} className={adminPrimaryButtonClass}>
        {pending ? "Uploading…" : "Upload photos"}
      </button>
    </form>
  );
}
