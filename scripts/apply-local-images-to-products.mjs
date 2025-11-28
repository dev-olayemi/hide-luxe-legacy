import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const collectionsDir = path.join(root, 'public', 'collections');
const productsFile = path.join(root, 'products-import-expanded.json');

function normalize(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

(async ()=>{
  try{
    const files = await fs.readdir(collectionsDir);
    const collectionFiles = files.filter(f=>/\.(jpe?g|png|webp)$/i.test(f));

    const raw = await fs.readFile(productsFile, 'utf8');
    const doc = JSON.parse(raw);
    if(!Array.isArray(doc.products)){
      console.error('Unexpected file format: products array missing');
      process.exit(1);
    }

    // Precompute normalized tokens for filenames
    const fileTokens = collectionFiles.map(f=>({
      file: f,
      tokens: normalize(f.replace(/\.[^.]+$/,'')).split(/\s+/).filter(Boolean)
    }));

    const updated = doc.products.map(p=>{
      const name = normalize(p.name || p.title || '');
      // score files by token overlap
      const scores = fileTokens.map(ft=>{
        let score = 0;
        for(const t of ft.tokens){
          if(name.includes(t)) score+=2; // exact token match
          else if(t.length>3 && name.includes(t.slice(0,4))) score+=1;
        }
        return {file: ft.file, score};
      });
      scores.sort((a,b)=>b.score-a.score);
      const best = scores[0];
      if(best && best.score>0){
        const url = `/collections/${best.file}`;
        p.images = [url];
        p.thumbnail = url;
        p.image = url; // also set singular image field if used elsewhere
      }
      return p;
    });

    doc.products = updated;
    await fs.writeFile(productsFile, JSON.stringify(doc, null, 2), 'utf8');
    console.log('Updated products-import-expanded.json with local collection image paths.');
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
