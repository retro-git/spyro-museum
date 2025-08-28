#!/usr/bin/env node

import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import url from "url";

// Allows us to resolve relative paths from this file:
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const KSY_DIR = path.resolve(__dirname, "ksy");
const PARSERS_DIR = path.resolve(__dirname, "parsers");

// Kaitai compiler
const DEFAULT_COMPILER = "kaitai-struct-compiler";

// We want to replace the UMD runtime reference with an import from "kaitai-struct"
const KAITAI_IMPORT_LINE = `import KaitaiStream from "kaitai-struct";\n`;

// UMD regex definitions
const UMD_START_REGEX =
  /\(function\s*\(root\s*,\s*factory\s*\)\s*\{[\s\S]*?function\s*\([\s\S]*?\)\s*\{/;
const UMD_END_REGEX = /return\s+(\w+)\s*;\s*\}\)\)\s*;\s*[\s\S]*$/;

/**
 * Utility to run a shell command, printing output to stdout/stderr.
 */
function runCommand(cmd: string): number {
  try {
    console.log(`Executing: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
    return 0;
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    return 1;
  }
}

/**
 * Converts Kaitai's default UMD wrapper to an ES6 module by:
 * - Replacing the UMD header with `import KaitaiStream from "kaitai-struct";`
 * - Replacing the final return statement with an `export default ...;`
 */
function umdToEs6(filePath: string): void {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const result = fileContent
    .replace(UMD_START_REGEX, KAITAI_IMPORT_LINE)
    .replace(UMD_END_REGEX, (_, identifier: string) => `export default ${identifier};\n`);

  fs.writeFileSync(filePath, result, "utf8");
}

/**
 * Compiles the KSY into JavaScript, placing the output in PARSERS_DIR.
 */
function compileKsy(ksyFile: string): void {
  const cmd = [
    DEFAULT_COMPILER,
    "--target javascript",
    `--outdir "${PARSERS_DIR}"`,
    `"${ksyFile}"`
  ].join(" ");

  runCommand(cmd);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Gather all .ksy files from the KSY_DIR
  const ksyFiles = fs.readdirSync(KSY_DIR).filter((file: string) => file.endsWith(".ksy"));

  if (ksyFiles.length === 0) {
    console.log("No .ksy files found in:", KSY_DIR);
    return;
  }

  // Ensure the parsers directory exists
  if (!fs.existsSync(PARSERS_DIR)) {
    fs.mkdirSync(PARSERS_DIR, { recursive: true });
  }

  // Compile each .ksy file and transform the resulting .js
  for (const ksyFile of ksyFiles) {
    const fullKsyPath = path.join(KSY_DIR, ksyFile);
    console.log(`Compiling ${fullKsyPath}...`);
    compileKsy(fullKsyPath);

    // After compilation, the output .js has the same base name
    const baseName = path.basename(ksyFile, ".ksy");
    const jsOutputPath = path.join(PARSERS_DIR, `${baseName}.js`);

    // Convert from UMD to ES6
    if (fs.existsSync(jsOutputPath)) {
      console.log(`Converting to ES6 module: ${jsOutputPath}`);
      umdToEs6(jsOutputPath);
    } else {
      console.error(`Could not find output file to transform: ${jsOutputPath}`);
    }
  }
}

// Run
main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
