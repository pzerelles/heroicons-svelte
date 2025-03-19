import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { parse } from "path"

const formatName = (s: string) => s[0].toUpperCase() + s.slice(1).replace(/-./g, (x) => x[1].toUpperCase()) + "Icon"

const createComponents = async (variant: string, defaultClass: string) => {
  const sourceDir = `./heroicons/optimized/${variant}`
  const targetDir = `./src/lib/${variant}`
  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })

  const files = await readdir(sourceDir)
  let exports = ""
  for (const file of files) {
    const svg = await readFile(`${sourceDir}/${file}`, { encoding: "utf8" })
    const { name } = parse(file)
    const componentName = formatName(name)
    await writeFile(
      `${targetDir}/${componentName}.svelte`,
      `<script lang="ts">import type { SvelteHTMLElements } from "svelte/elements"\n\n  let { class: className = "${defaultClass}", ...props }: SvelteHTMLElements["svg"] = $props()\n</script>\n\n${svg.replace(/<svg[^>]+>/, (value) => `${value.slice(0, -1)} class={className} {...props}>`)}`,
      { encoding: "utf8" }
    )
    exports += `export { default as ${componentName} } from "./${componentName}.svelte"\n`
  }
  await writeFile(`${targetDir}/index.ts`, exports, { encoding: "utf8" })
}

await createComponents("16/solid", "size-4")
await createComponents("20/solid", "size-5")
await createComponents("24/solid", "size-6")
await createComponents("24/outline", "size-6")
