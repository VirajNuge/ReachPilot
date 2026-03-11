const fs = require("fs");
const path = require("path");

const targetDirs = [
  "e:/FinalProject/reachpilot/app/pages/appPages/components",
  "e:/FinalProject/reachpilot/app/pages/appPages/[id]/profileAnalyzer",
];

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "ENOTDIR") return;
      else throw err;
    }
  });
  return filelist;
}

const pattern = /<button[^>]*className=["']([^"']*)["'][^>]*>/g;
const motionPattern = /<motion\.button[^>]*className=["']([^"']*)["'][^>]*>/g;

function processClasses(classStr) {
  let classes = classStr.split(/\s+/).filter(Boolean);

  const injected = [
    "bg-[#000100]",
    "hover:bg-black",
    "text-white",
    "border-0",
    "shadow-[0_4px_14px_0_rgba(26,29,35,0.2)]",
  ];

  classes = classes.filter((cls) => {
    if (injected.includes(cls)) return false;
    if (cls === "border" || cls.startsWith("border-")) return false;
    if (
      cls.startsWith("shadow") ||
      cls.startsWith("hover:shadow") ||
      cls.startsWith("active:shadow")
    )
      return false;
    if (cls.startsWith("ring") || cls.startsWith("focus:ring")) return false;
    if (cls.startsWith("outline")) return false;
    if (
      cls.startsWith("bg-") ||
      cls.startsWith("hover:bg-") ||
      cls.startsWith("active:bg-")
    )
      return false;
    if (cls.startsWith("text-") || cls.startsWith("hover:text-")) return false;
    return true;
  });

  classes.push("bg-[#000100]", "hover:bg-black", "text-white");

  return classes.join(" ");
}

let updatedFiles = 0;

targetDirs.forEach((dir) => {
  const files = walkSync(dir).filter(
    (f) => f.endsWith(".tsx") || f.endsWith(".jsx"),
  );

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");

    const replacer = (match, p1) => {
      const newClasses = processClasses(p1);
      return match.replace(p1, newClasses);
    };

    let originalContent = content;
    content = content.replace(pattern, replacer);
    content = content.replace(motionPattern, replacer);

    if (content !== originalContent) {
      fs.writeFileSync(file, content, "utf8");
      updatedFiles++;
      console.log(`Updated: ${file}`);
    }
  });
});

console.log(`Total files updated: ${updatedFiles}`);
