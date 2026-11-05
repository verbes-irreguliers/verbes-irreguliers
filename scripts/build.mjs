import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJavaScript } from "terser";
import { compile } from "sass";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const pages = ["index.html", "allemand.html", "anglais.html"];
const audioFiles = ["Quack.ogg", "e_oh.mp3", "notification.mp3", "switch.mp3", "youpi.mp3"];
const stylesheetPattern = /<link\b(?=[^>]*\bhref=["']css\/style\.css["'])[^>]*>/i;
const scriptPattern = /<script\b([^>]*)\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi;

async function buildPage(filename, stylesheet) {
  let html = await readFile(path.join(source, filename), "utf8");
  let styleReplacements = 0;
  html = html.replace(stylesheetPattern, () => {
    styleReplacements++;
    return `<style>${stylesheet}</style>`;
  });
  if (styleReplacements !== 1) {
    throw new Error(`${filename}: le lien vers css/style.css doit apparaître une fois.`);
  }
  if (/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/i.test(html)) {
    throw new Error(`${filename}: une feuille de style externe n'a pas été intégrée.`);
  }

  const scriptTags = [...html.matchAll(scriptPattern)];
  const scripts = [];
  for (const [, attributes, scriptPath] of scriptTags) {
    if (!/^(?:\.\/)?js\/[\w.-]+\.js$/.test(scriptPath)) {
      throw new Error(`${filename}: script externe ou chemin JavaScript invalide (${scriptPath}).`);
    }
    if (/\btype=["']module["']|\basync\b|\bdefer\b/i.test(attributes)) {
      throw new Error(`${filename}: seuls les scripts classiques synchrones sont pris en charge.`);
    }
    scripts.push(await readFile(path.join(source, scriptPath.replace(/^\.\//, "")), "utf8"));
  }

  if (scriptTags.length) {
    const bundle = await minifyJavaScript(scripts.join("\n;\n"), {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    if (!bundle.code) {
      throw new Error(`${filename}: la minification JavaScript a produit un fichier vide.`);
    }

    let remainingScripts = scriptTags.length;
    html = html.replace(scriptPattern, () => {
      remainingScripts--;
      return remainingScripts === 0
        ? `<script>${bundle.code.replace(/<\/script/gi, "<\\/script")}</script>`
        : "";
    });
  }
  if (/<script\b[^>]*\bsrc=/i.test(html)) {
    throw new Error(`${filename}: un script JavaScript n'a pas été intégré.`);
  }

  return minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeOptionalTags: false
  });
}

async function build() {
  const stylesheet = compile(path.join(source, "scss", "style.scss"), {
    style: "compressed",
    sourceMap: false
  }).css;

  await writeFile(path.join(source, "css", "style.css"), stylesheet);
  await mkdir(root, { recursive: true });
  for (const page of pages) {
    await writeFile(path.join(root, page), await buildPage(page, stylesheet));
  }
  for (const file of audioFiles) {
    await copyFile(path.join(source, file), path.join(root, file));
  }

  console.log(`Génération terminée : ${pages.join(", ")} et ${audioFiles.length} fichiers audio.`);
}

build().catch(error => {
  console.error("Échec du build :", error);
  process.exitCode = 1;
});
