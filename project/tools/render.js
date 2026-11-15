const sharp=require('sharp'),fs=require('fs');
const [,,svg,png,size]=process.argv;
sharp(fs.readFileSync(svg),{density:300}).resize(+size,+size).png().toFile(png).then(()=>0);
