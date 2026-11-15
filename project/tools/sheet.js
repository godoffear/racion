const sharp=require('sharp'),fs=require('fs'),path=require('path');
const dir=process.argv[2],files=fs.readdirSync(dir).filter(f=>/^\d\d_[a-z]+\.png$/.test(f)).sort();
const S=256,cols=5,rows=Math.ceil(files.length/cols);
sharp({create:{width:cols*(S+16)+16,height:rows*(S+16)+16,channels:4,background:'#ddd'}})
.composite(files.map((f,i)=>({input:path.join(dir,f),left:16+(i%cols)*(S+16),top:16+Math.floor(i/cols)*(S+16)}))).png().toFile(process.argv[3]);
