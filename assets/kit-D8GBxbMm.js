import{i as e,n as t,r as n,t as r}from"./index-BGigC8VS.js";var i=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t++){let n=t;for(let e=0;e<8;e++)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})();function a(e){let t=4294967295;for(let n=0;n<e.length;n++)t=i[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0}async function o(e){let t=new TextEncoder,n=[],r=[],i=0,o=new Date,s=o.getHours()<<11|o.getMinutes()<<5|o.getSeconds()>>1,c=o.getFullYear()-1980<<9|o.getMonth()+1<<5|o.getDate();for(let o of e){let e=t.encode(o.name),l=typeof o.data==`string`?t.encode(o.data):new Uint8Array(await o.data.arrayBuffer()),u=a(l),d=new DataView(new ArrayBuffer(30));d.setUint32(0,67324752,!0),d.setUint16(4,20,!0),d.setUint16(6,2048,!0),d.setUint16(8,0,!0),d.setUint16(10,s,!0),d.setUint16(12,c,!0),d.setUint32(14,u,!0),d.setUint32(18,l.length,!0),d.setUint32(22,l.length,!0),d.setUint16(26,e.length,!0),n.push(d.buffer,e,l);let f=new DataView(new ArrayBuffer(46+e.length));f.setUint32(0,33639248,!0),f.setUint16(4,20,!0),f.setUint16(6,20,!0),f.setUint16(8,2048,!0),f.setUint16(10,0,!0),f.setUint16(12,s,!0),f.setUint16(14,c,!0),f.setUint32(16,u,!0),f.setUint32(20,l.length,!0),f.setUint32(24,l.length,!0),f.setUint16(28,e.length,!0),f.setUint32(42,i,!0),new Uint8Array(f.buffer).set(e,46),r.push(new Uint8Array(f.buffer)),i+=30+e.length+l.length}let l=r.reduce((e,t)=>e+t.length,0),u=new DataView(new ArrayBuffer(22));return u.setUint32(0,101010256,!0),u.setUint16(8,e.length,!0),u.setUint16(10,e.length,!0),u.setUint32(12,l,!0),u.setUint32(16,i,!0),new Blob([...n,...r,u.buffer],{type:`application/zip`})}var s=e=>e.skin.filter(e=>e.art);async function c(e,t,n){let i=await u(e,t.withoutSkins()),a=s(e).filter(e=>!n||e.key===n),c=[];for(let e of a){for(let[t,n]of d(i,e))c.push({name:`${e.key}/${t}.png`,data:await m(f(n,e.art))});n||c.push({name:`${e.key}/guide.png`,data:await m(p(e.art))})}if(n)return c.length===1?{name:`${e.id}-${n}.png`,blob:c[0].data}:{name:`${e.id}-${n}.zip`,blob:await o(c.map(e=>({...e,name:e.name.split(`/`).pop()})))};let h=e.skin.find(e=>e.type===`audio`),_=l(e);return h&&_&&c.push({name:`${h.key}/default-beat-${_}bpm.wav`,data:await r(_)}),c.unshift({name:`README.html`,data:g(e,t,i,_)}),{name:`${e.id}-design-kit.zip`,blob:await o(c)}}var l=e=>{let t=e.skinDefaults.bpm;return typeof t==`number`&&t>0?t:null};async function u(r,i){let a={};for(let[t,n]of Object.entries(r.images(i)))a[t]=(await Promise.all(n.map(t=>e(i.url(t)).catch(()=>null)))).filter(e=>!!e);let o=r.defaultArt?n(4,()=>r.defaultArt(i,a)):{};if(r.skin.some(e=>e.key===`background`)&&!o.background){let e=i.colors;o.background=t(1080,1920,e.background,e.backgroundAlt,e.glow)}return o}function d(e,t){let n=e[t.key];return n?n instanceof HTMLCanvasElement?[[`default`,n]]:Object.entries(n):[]}function f(e,t){let n=document.createElement(`canvas`);n.width=t.w,n.height=t.h;let r=n.getContext(`2d`),i=Math.min(t.w/e.width,t.h/e.height),a=e.width*i,o=e.height*i;return r.imageSmoothingQuality=`high`,r.drawImage(e,(t.w-a)/2,(t.h-o)/2,a,o),n}function p(e){let t=document.createElement(`canvas`);t.width=e.w,t.height=e.h;let n=t.getContext(`2d`),r=Math.max(2,Math.round(Math.min(e.w,e.h)/200));n.strokeStyle=`#ff00cc`,n.lineWidth=r,n.setLineDash([r*6,r*4]),n.strokeRect(r/2,r/2,e.w-r,e.h-r),e.round&&(n.beginPath(),n.arc(e.w/2,e.h/2,Math.min(e.w,e.h)/2-r,0,Math.PI*2),n.stroke()),n.setLineDash([]);let i=Math.min(e.w,e.h)/20;return n.beginPath(),n.moveTo(e.w/2-i,e.h/2),n.lineTo(e.w/2+i,e.h/2),n.moveTo(e.w/2,e.h/2-i),n.lineTo(e.w/2,e.h/2+i),n.stroke(),n.fillStyle=`#ff00cc`,n.font=`bold ${Math.max(14,Math.round(Math.min(e.w,e.h)/16))}px Arial, sans-serif`,n.textAlign=`center`,n.textBaseline=`bottom`,n.fillText(`${e.w} × ${e.h} px`,e.w/2,e.h-r*4),t}var m=e=>new Promise((t,n)=>e.toBlob(e=>e?t(e):n(Error(`PNG failed`)),`image/png`)),h=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);function g(e,t,n,r){let i=s(e).map(e=>{let t=e.art,r=d(n,e).map(([t])=>`${e.key}/${t}.png`),i=e.type===`items`?`Up to ${e.max??12} pictures, each with its own points and how often it appears (set in the admin).`:e.type===`imageMap`?`One picture each: ${e.keys.map(e=>h(e.label)).join(`, `)}.`:e.type===`ingredients`?`${e.count} pictures, one per ingredient (or an emoji instead).`:``;return`<tr>
        <td><b>${h(e.label)}</b>${e.hint?`<div class="hint">${h(e.hint)}</div>`:``}</td>
        <td class="num">${t.w} × ${t.h} px</td>
        <td>${t.round?`Round (fill the circle in the guide)`:`Free shape`}</td>
        <td>${h(t.note)}${i?` ${i}`:``}</td>
        <td>${r.map(e=>`<code>${h(e)}</code>`).join(`<br>`)}${r.length?`<br>`:``}<code>${h(e.key)}/guide.png</code></td>
      </tr>`}).join(``),a=e.skin.find(e=>e.type===`audio`);return`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${h(e.name)} design kit</title>
<style>
  body { font: 15px/1.5 "Segoe UI", system-ui, sans-serif; color: #1d1f24; max-width: 1100px; margin: 0 auto; padding: 32px 20px; }
  h1 { margin: 0 0 4px; font-size: 28px; } h2 { margin-top: 32px; font-size: 19px; }
  .sub, .hint { color: #5d6270; } .hint { font-size: 13px; }
  table { border-collapse: collapse; width: 100%; } th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid #e3e5ea; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #5d6270; } .num { white-space: nowrap; font-variant-numeric: tabular-nums; }
  code { font-size: 12.5px; background: #f1f2f5; padding: 1px 5px; border-radius: 4px; } li { margin: 4px 0; }
</style></head><body>
<h1>${h(e.name)}: design kit</h1>
<p class="sub">For ${h(t.pack.name)}. ${h(e.description)}</p>

<h2>How to deliver</h2>
<ul>
  <li><b>PNG with a transparent background</b> for every picture (JPG only for full photos). Up to 10 MB per picture.</li>
  <li>Deliver at the size below: about twice what the 1080 × 1920 screen shows, so it stays sharp. The same proportions in a larger size also work.</li>
  <li>Each folder has the game's <b>default</b> picture in the client's colours, as an example of what works, and <code>guide.png</code>: a transparent overlay with the edges, the circle for round art and the centre. Put it on a top layer and hide it before exporting.</li>
  <li>Upload the finished files on the game's Customize page in the Offbeat admin and pick them there; the live preview shows them straight away.</li>
</ul>

<h2>Pictures</h2>
${i?`<div style="overflow-x:auto"><table><thead><tr><th>Picture</th><th>Size</th><th>Shape</th><th>How the game uses it</th><th>In this kit</th></tr></thead><tbody>${i}</tbody></table></div>`:`<p>This game has no pictures to replace; it uses the client's logo, colours and fonts.</p>`}

${a?`<h2>Music</h2>
<ul>
  <li><b>MP3</b> (OGG, WAV or M4A also work), up to 15 MB. It plays <b>on a loop</b> for the whole round (${e.duration??45} seconds by default), so a track that loops cleanly works best.</li>
  <li>Without a music file the game plays its built-in beat${r?`: <code>${h(a.key)}/default-beat-${r}bpm.wav</code> is 4 bars of it at the default ${r} BPM`:``}.</li>
  <li>Keep it instrumental and upbeat, with no long quiet parts; sound effects play on top of it.</li>
</ul>`:``}
</body></html>
`}export{c as designKit};