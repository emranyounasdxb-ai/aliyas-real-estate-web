# Image delivery

Project images use content-addressed WebP display copies at mobile and desktop
widths. The project gallery, cards and developer carousel retain the reviewed
original as their source and fall back to it if a display copy is unavailable.
Floor-plan originals are intentionally not resized.

After adding or replacing project images, run `npm run images:prepare` with the
original Git LFS assets present. The script verifies project image hashes before
creating display copies and then writes the manifest used by the site. It also
prepares copies of the existing, credited navigation photographs. A new image
without a prepared copy continues to use Next's image optimization until the
manifest is regenerated.

Deployments must include the generated `public/images/project-responsive` and
`public/images/navigation-responsive` directories as well as the originals.
Both generated directories use Git LFS. Their versioned, content-addressed paths
are served with long-lived cache headers.
