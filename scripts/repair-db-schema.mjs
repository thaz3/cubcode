/**
 * Repairs a database that was created with `prisma db push` (no migration history)
 * and still has legacy GrowthCategory enum values (CONTROL, USE, BUILD).
 *
 * Usage: node scripts/repair-db-schema.mjs
 */
import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const growthMapSql = `
  CASE "growthCategory"::text
    WHEN 'CONTROL' THEN 'RESPONSIBILITY'
    WHEN 'USE' THEN 'CREATIVITY'
    WHEN 'BUILD' THEN 'CREATIVITY'
    WHEN 'WELLNESS' THEN 'BODY'
    WHEN 'MIND' THEN 'MIND'
    WHEN 'BODY' THEN 'BODY'
    WHEN 'CHARACTER' THEN 'CHARACTER'
    WHEN 'CREATIVITY' THEN 'CREATIVITY'
    WHEN 'RESPONSIBILITY' THEN 'RESPONSIBILITY'
    WHEN 'FAMILY' THEN 'FAMILY'
    WHEN 'COMMUNITY' THEN 'COMMUNITY'
    ELSE NULL
  END
`;

const tablesWithGrowthCategory = [
  "Task",
  "TaskTemplate",
  "FocusBlockLog",
  "Challenge",
  "XpLedgerEntry",
];

async function getGrowthCategoryValues(client) {
  const { rows } = await client.query(`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'GrowthCategory'
    ORDER BY e.enumsortorder
  `);
  return rows.map((row) => row.enumlabel);
}

async function tableExists(client, tableName) {
  const { rows } = await client.query(
    `SELECT to_regclass($1) AS regclass`,
    [`public."${tableName}"`],
  );
  return rows[0]?.regclass !== null;
}

async function columnExists(client, tableName, columnName) {
  const { rows } = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName],
  );
  return rows.length > 0;
}

async function migrateGrowthCategory(client) {
  const values = await getGrowthCategoryValues(client);
  const isSevenCodeEnum =
    values.includes("MIND") &&
    values.includes("BODY") &&
    values.includes("FAMILY");

  if (isSevenCodeEnum) {
    console.log("✓ GrowthCategory already uses the unified 7-code enum.");
    return;
  }

  console.log("→ Migrating GrowthCategory to seven Cub Codes…");

  await client.query("BEGIN");
  try {
    await client.query(`
      CREATE TYPE "GrowthCategory_new" AS ENUM (
        'MIND',
        'BODY',
        'CHARACTER',
        'CREATIVITY',
        'RESPONSIBILITY',
        'FAMILY',
        'COMMUNITY'
      )
    `);

    for (const table of tablesWithGrowthCategory) {
      if (!(await tableExists(client, table))) continue;
      if (!(await columnExists(client, table, "growthCategory"))) continue;

      await client.query(`
        ALTER TABLE "${table}"
        ALTER COLUMN "growthCategory" TYPE "GrowthCategory_new"
        USING (${growthMapSql})::"GrowthCategory_new"
      `);
      console.log(`  · ${table}.growthCategory`);
    }

    await client.query(`DROP TYPE "GrowthCategory"`);
    await client.query(
      `ALTER TYPE "GrowthCategory_new" RENAME TO "GrowthCategory"`,
    );

    if (await tableExists(client, "Cub")) {
      await client.query(`
        ALTER TABLE "Cub"
        ALTER COLUMN "requiredGrowthCategories"
        SET DEFAULT '["MIND","BODY","CHARACTER","RESPONSIBILITY","CREATIVITY","FAMILY","COMMUNITY"]'::jsonb
      `);
      await client.query(`
        UPDATE "Cub"
        SET "requiredGrowthCategories" = '["MIND","BODY","CHARACTER","RESPONSIBILITY","CREATIVITY","FAMILY","COMMUNITY"]'::jsonb
        WHERE "requiredGrowthCategories"::text LIKE '%CONTROL%'
           OR "requiredGrowthCategories"::text LIKE '%USE%'
           OR "requiredGrowthCategories"::text LIKE '%BUILD%'
           OR "requiredGrowthCategories"::text LIKE '%WELLNESS%'
           OR jsonb_array_length("requiredGrowthCategories") < 7
      `);
    }

    await client.query("COMMIT");
    console.log("✓ GrowthCategory migration complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function typeExists(client, typeName) {
  const { rows } = await client.query(
    `SELECT 1 FROM pg_type WHERE typname = $1 LIMIT 1`,
    [typeName],
  );
  return rows.length > 0;
}

async function applyCalendarEvents(client) {
  if (await tableExists(client, "CalendarEvent")) {
    console.log("✓ CalendarEvent table already exists.");
    return;
  }

  console.log("→ Creating CalendarEvent table…");

  if (!(await typeExists(client, "CalendarEventType"))) {
    await client.query(`
      CREATE TYPE "CalendarEventType" AS ENUM (
        'APPOINTMENT', 'SCHOOL', 'ACTIVITY', 'FAMILY', 'DEADLINE', 'REVIEW'
      )
    `);
  }

  if (!(await typeExists(client, "CalendarEventStatus"))) {
    await client.query(`
      CREATE TYPE "CalendarEventStatus" AS ENUM (
        'SCHEDULED', 'CANCELLED', 'COMPLETED'
      )
    `);
  }

  await client.query(`
    CREATE TABLE "CalendarEvent" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "eventType" "CalendarEventType" NOT NULL,
      "eventDate" TIMESTAMP(3) NOT NULL,
      "startTime" TEXT,
      "endTime" TEXT,
      "status" "CalendarEventStatus" NOT NULL DEFAULT 'SCHEDULED',
      "linkedAssignmentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "familyId" TEXT NOT NULL,
      "cubId" TEXT,
      CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
    )
  `);

  await client.query(`
    CREATE INDEX "CalendarEvent_familyId_eventDate_idx"
    ON "CalendarEvent"("familyId", "eventDate")
  `);
  await client.query(`
    CREATE INDEX "CalendarEvent_cubId_idx" ON "CalendarEvent"("cubId")
  `);
  await client.query(`
    CREATE INDEX "CalendarEvent_linkedAssignmentId_idx"
    ON "CalendarEvent"("linkedAssignmentId")
  `);
  await client.query(`
    ALTER TABLE "CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_familyId_fkey"
    FOREIGN KEY ("familyId") REFERENCES "Family"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
  `);
  await client.query(`
    ALTER TABLE "CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_cubId_fkey"
    FOREIGN KEY ("cubId") REFERENCES "Cub"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
  `);
  await client.query(`
    ALTER TABLE "CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_linkedAssignmentId_fkey"
    FOREIGN KEY ("linkedAssignmentId") REFERENCES "Task"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
  `);

  console.log("✓ CalendarEvent table created.");
}

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const before = await getGrowthCategoryValues(client);
    console.log("Current GrowthCategory values:", before.join(", "));

    await migrateGrowthCategory(client);
    await applyCalendarEvents(client);

    const after = await getGrowthCategoryValues(client);
    console.log("Final GrowthCategory values:", after.join(", "));
    console.log("\nDone. You can verify with: npx prisma db push");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nRepair failed:", error.message);
  process.exit(1);
});
