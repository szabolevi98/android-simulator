const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
// Lengths rescaled between versions must stay valid CSS numbers: ".851.6px" or ".8.46px" make the browser drop the
// whole declaration (borders, shadows and paddings went missing on 4.3).
const bad=[];
for(const v of fs.readdirSync('versions',{withFileTypes:true}).filter(d=>d.isDirectory()))for(const f of fs.readdirSync(path.join('versions',v.name)).filter(f=>/\.(css|js)$/.test(f))){
  const text=fs.readFileSync(path.join('versions',v.name,f),'utf8');for(const m of text.matchAll(/[\s:(,-]\d*\.\d+\.\d+(px|em|%)/g))bad.push(`${v.name}/${f}: ${m[0].trim()}`);
}
assert.deepEqual(bad,[]);console.log('css numbers ok');
