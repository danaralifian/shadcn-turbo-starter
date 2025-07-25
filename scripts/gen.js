const fs = require("fs-extra");
const path = require("path");

const [type, name] = process.argv.slice(2);

if (!type || !name) {
  console.error("❌ Usage: npm run gen <package|app> <name>");
  process.exit(1);
}

const rootDir = type === "app" ? "apps" : "packages";
const template = "template";

const src = path.resolve(`${template}/${type}`);
const dest = path.resolve(`${rootDir}/${name}`);

if (!fs.existsSync(src)) {
  console.error(`❌ Template not found: ${src}`);
  process.exit(1);
}

if (fs.existsSync(dest)) {
  console.error(`❌ Target ${name} already exists in ${rootDir}/`);
  process.exit(1);
}

fs.copySync(src, dest);
console.log(`📁 Copied ${src} → ${dest}`);

const pkgPath = path.join(dest, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = fs.readJsonSync(pkgPath);

  // Hanya prefix @repo untuk packages
  pkg.name = type === "app" ? name : `@repo/${name}`;

  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
  console.log(`📦 Updated name to ${pkg.name} in package.json`);
}

// Hanya update tsconfig.base.json kalau type === "package"
if (type === "package") {
  const tsconfigPath = path.resolve("tsconfig.base.json");

  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = fs.readJsonSync(tsconfigPath);

    tsconfig.compilerOptions.paths = {
      ...(tsconfig.compilerOptions.paths || {}),
      [`@repo/${name}`]: [`${rootDir}/${name}/src`],
    };

    fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });
    console.log(`🛠️  Updated tsconfig.base.json path alias for @repo/${name}`);
  }
}

console.log(`✅ Done generating ${type}: ${name}`);
