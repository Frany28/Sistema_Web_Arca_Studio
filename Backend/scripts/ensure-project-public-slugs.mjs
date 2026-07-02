import "dotenv/config";

import { pool, query } from "../src/config/db.js";
import { slugifyProjectName } from "../src/utils/projectSlug.js";

async function getUniqueSlug(baseSlug, usedSlugs) {
  let candidate = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
}

async function main() {
  await query(`
    alter table public.projects
    add column if not exists public_slug varchar(160)
  `);

  const existingResult = await query(`
    select public_slug
    from public.projects
    where public_slug is not null
  `);
  const usedSlugs = new Set(
    existingResult.rows
      .map((row) => String(row.public_slug || "").trim())
      .filter(Boolean),
  );

  const projectsResult = await query(`
    select id, name
    from public.projects
    where public_slug is null
    order by id
  `);

  for (const project of projectsResult.rows) {
    const slug = await getUniqueSlug(slugifyProjectName(project.name), usedSlugs);

    await query(
      `
        update public.projects
        set
          public_slug = $2,
          updated_at = now()
        where id = $1
      `,
      [project.id, slug],
    );
  }

  await query(`
    create unique index if not exists idx_projects_public_slug_active
      on public.projects(public_slug)
      where deleted_at is null
  `);

  await query(`
    alter table public.projects
    alter column public_slug set not null
  `);

  const verification = await query(`
    select id, name, public_slug
    from public.projects
    where deleted_at is null
    order by id
  `);

  console.log(JSON.stringify({ projects: verification.rows }, null, 2));
}

try {
  await main();
} finally {
  await pool.end();
}
