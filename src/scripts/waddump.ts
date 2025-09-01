import fs from 'fs/promises';
import path from 'path';

interface Subfile {
  offset: number;
  size: number;
}

interface WADHeader {
  s: Subfile[];
}

interface LVLHeader {
  s: Subfile[];
}

const GAME_LEVELS: Record<string, string[]> = {
  spyro1: [
    "Artisans",
    "Stone Hill",
    "Dark Hollow",
    "Town Square",
    "Toasty",
    "Sunny Flight",
    "Peace Keepers",
    "Dry Canyon",
    "Cliff Town",
    "Ice Cavern",
    "Shemp",
    "Night Flight",
    "Magic Crafters",
    "Alpine Ridge",
    "High Caves",
    "Wizard Peak",
    "Blowhard",
    "Crystal Flight",
    "Beast Makers",
    "Terrace Village",
    "Misty Bog",
    "Tree Tops",
    "Metalhead",
    "Wild Flight",
    "Dream Weavers",
    "Dark Passage",
    "Lofty Castle",
    "Haunted Towers",
    "Jacques",
    "Icy Flight",
    "Gnasty's World",
    "Gnorc Cove",
    "Twilight Harbor",
    "Gnasty Gnorc",
    "Gnasty's Loot"
  ]
  // Future games can be added here
};

function toSnakeCase(str: string): string {
  return str.toLowerCase()
    .replace(/'s/g, 's')  // Handle possessives
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

function readInt32LE(buffer: Buffer, offset: number): number {
  return buffer.readInt32LE(offset);
}

function parseWADHeader(buffer: Buffer): WADHeader {
  const subfiles: Subfile[] = [];
  const entrySize = 8; // Each subfile has 2 integers (offset and size)
  for (let i = 0; i < 256; i++) {
    const offset = readInt32LE(buffer, i * entrySize);
    const size = readInt32LE(buffer, i * entrySize + 4);
    subfiles.push({ offset, size });
  }
  return { s: subfiles };
}

function parseLVLHeader(buffer: Buffer): LVLHeader {
  const subfiles: Subfile[] = [];
  const entrySize = 8; // Each subfile has 2 integers (offset and size)
  for (let i = 0; i < 10; i++) {
    const offset = readInt32LE(buffer, i * entrySize);
    const size = readInt32LE(buffer, i * entrySize + 4);
    subfiles.push({ offset, size });
  }
  return { s: subfiles };
}

async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Failed to create directory ${dirPath}: ${err}`);
    process.exit(1);
  }
}

async function extractSubfile(inputBuffer: Buffer, subfile: Subfile, outputPath: string): Promise<void> {
  const { offset, size } = subfile;
  const data = inputBuffer.subarray(offset, offset + size);
  await fs.writeFile(outputPath, data);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Usage: dump.exe [WAD.WAD path] [Output path]');
    process.exit(-1);
  }

  const [wadPath, outputPath] = args;
  const gameId = 'spyro1'; // This could be made configurable in the future
  const LevelStartIndex = 10; // US version only

  // Read and validate WAD file
  let wadBuffer: Buffer;
  try {
    wadBuffer = await fs.readFile(wadPath);
  } catch (err) {
    console.error(`Failed to open WAD file at ${wadPath}: ${(err as Error).message}`);
    process.exit(1);
  }

  // Parse WAD Header
  const wadHeader = parseWADHeader(wadBuffer);

  // Extract levels from WAD
  // There are 35 levels, iterating over 70 indices in steps of 2 to skip overlays
  const numLevels = 35;
  const levelIndices: number[] = [];
  for (let i = 0; i < numLevels; i++) {
    levelIndices.push(LevelStartIndex + i * 2);
  }

  for (const idx of levelIndices) {
    const levelName = GAME_LEVELS[gameId][(idx - 10) / 2] || idx.toString();
    const levelNameSnakeCase = toSnakeCase(levelName);
    const lvlPathDir = path.join(
      outputPath,
      gameId,
      levelNameSnakeCase
    );

    await ensureDirectory(lvlPathDir);

    const subfileEntry = wadHeader.s[idx];

    if (subfileEntry.size === 0) {
      console.warn(`Subfile at index ${idx} has size 0. Skipping.`);
      continue;
    }

    const lvlData = wadBuffer.subarray(subfileEntry.offset, subfileEntry.offset + subfileEntry.size);

    // Parse LVL Header directly from lvlData
    if (lvlData.length < 80) {
      console.warn(`Level data for ${levelName} is too small to contain a valid LVL header. Skipping.`);
      continue;
    }

    // Extract the complete level file first
    const levelOutputPath = path.join(lvlPathDir, `${levelNameSnakeCase}.lvl`);
    await fs.writeFile(levelOutputPath, lvlData);
    console.log(`Extracted level file: ${levelOutputPath}`);

    const lvlHeader = parseLVLHeader(lvlData.subarray(0, 80));

    // Extract each subfile directly from lvlData
    for (let j = 0; j < lvlHeader.s.length; j++) {
      const sub = lvlHeader.s[j];
      if (sub.size === 0) {
        continue; // Skip empty subfiles
      }

      const subOutputPath = path.join(lvlPathDir, `sub${j}`);
      await extractSubfile(lvlData, sub, subOutputPath);
      console.log(`Extracted subfile: ${subOutputPath}`);
    }
  }

  console.log('Extraction completed successfully.');
}

// Execute the main function
main().catch((err: Error) => {
  console.error(`An unexpected error occurred: ${err.message}`);
  process.exit(1);
});
