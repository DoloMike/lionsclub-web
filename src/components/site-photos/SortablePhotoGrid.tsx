"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOptimistic, useTransition } from "react";
import {
  adminDestructiveLinkClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { SitePhotoPublicImage } from "@/components/site-photos/SitePhotoPublicImage";
import type { SitePhoto } from "@/lib/site-photos";

type ActionFn = (formData: FormData) => void | Promise<void>;

export function SortablePhotoGrid({
  photos,
  section,
  reorderAction,
  updateAction,
  deleteAction,
}: {
  photos: SitePhoto[];
  section: string;
  reorderAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: ActionFn;
}) {
  const [optimisticPhotos, setOptimisticPhotos] = useOptimistic<
    SitePhoto[],
    SitePhoto[]
  >(photos, (_state, next) => next);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    // Require a small movement before drag starts so clicking the grip
    // doesn't fire a drag when the user is just tabbing through the page.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = optimisticPhotos.findIndex((p) => p.id === active.id);
    const newIdx = optimisticPhotos.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(optimisticPhotos, oldIdx, newIdx);

    startTransition(async () => {
      setOptimisticPhotos(next);
      const formData = new FormData();
      formData.append("section", section);
      for (const photo of next) {
        formData.append("id", photo.id);
      }
      await reorderAction(formData);
    });
  }

  if (optimisticPhotos.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No photos yet — upload the first one above.
      </p>
    );
  }

  return (
    <div>
      <p className="mt-2 text-xs text-muted-foreground">
        Drag the <span className="font-semibold">⋮⋮</span> grip on a photo to
        reorder. Order is saved automatically.
        {isPending ? " · Saving…" : ""}
      </p>
      <DndContext
        id={`site-photos-reorder-${section}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={optimisticPhotos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {optimisticPhotos.map((photo) => (
              <SortablePhotoCard
                key={photo.id}
                photo={photo}
                updateAction={updateAction}
                deleteAction={deleteAction}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePhotoCard({
  photo,
  updateAction,
  deleteAction,
}: {
  photo: SitePhoto;
  updateAction: ActionFn;
  deleteAction: ActionFn;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-lg border bg-background ${
        isDragging
          ? "border-primary shadow-lg ring-2 ring-primary/30"
          : "border-border"
      }`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <SitePhotoPublicImage
          key={`${photo.id}-${photo.publicUrl}`}
          publicUrl={photo.publicUrl}
          alt={photo.altText}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label={`Drag to reorder ${photo.altText}`}
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-md bg-black/55 text-white shadow-md backdrop-blur transition hover:bg-black/70 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
        >
          <span aria-hidden className="text-lg leading-none">
            ⋮⋮
          </span>
        </button>
      </div>
      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={
              photo.published
                ? "inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"
                : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
            }
          >
            {photo.published ? "Published" : "Hidden"}
          </span>
          <span className="text-xs text-muted-foreground">
            sort: {photo.sortOrder}
          </span>
        </div>

        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={photo.id} />
          <div>
            <label className={adminLabelClass}>Alt text</label>
            <input
              name="alt_text"
              required
              maxLength={200}
              defaultValue={photo.altText}
              className={adminInputClass}
            />
          </div>
          <div>
            <label className={adminLabelClass}>
              Caption (optional, overlaid on the photo)
            </label>
            <input
              name="caption"
              maxLength={280}
              defaultValue={photo.caption ?? ""}
              className={adminInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="published"
              defaultChecked={photo.published}
              className="rounded border-border"
            />
            Show on the public site
          </label>
          <button type="submit" className={adminPrimaryButtonClass}>
            Save
          </button>
        </form>

        <form action={deleteAction} className="border-t border-border pt-3">
          <input type="hidden" name="id" value={photo.id} />
          <p className="text-xs text-muted-foreground">
            Removes the photo from this section and deletes the file from
            storage.
          </p>
          <button
            type="submit"
            className={`mt-2 ${adminDestructiveLinkClass}`}
          >
            Delete photo
          </button>
        </form>
      </div>
    </li>
  );
}
