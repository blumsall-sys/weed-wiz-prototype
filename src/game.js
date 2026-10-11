(()=>{'use strict';
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=480,H=320,T=24,SAVE='weed-wizards-proto-v1';
const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};

// Assets are packaged with the game. Atlas data is a local JS file rather than fetch(),
// so the Windows double-click/file:// launch works without a web server.
const WW_ART = window.WW_ATLAS || {};
const artImages = {};
let artLoads=0,artTotal=Object.keys(WW_ART).length;
for (const [group, meta] of Object.entries(WW_ART)) {
 const im = new Image(); artImages[group]=im;
 im.addEventListener('load',()=>{artLoads++; const a=$('artStatus');if(a)a.textContent=artLoads===artTotal?'Pixel art ready':`Artwork ${artLoads}/${artTotal}`;});
 im.addEventListener('error',()=>{const a=$('artStatus');if(a)a.textContent='Artwork unavailable';});
 im.src = meta.image;
}
// Crop source alpha to each sprite's actual content bounds. Bottom-aligned source cells
// no longer cause different animation frames to shift or stretch.
function blit(group,name,x,y,w,h){
 if(state && state.settings && !state.settings.pixelArt) return false;
 const meta=WW_ART[group],sprite=meta&&meta.sprites[name],im=artImages[group];
 if(!sprite||!im||!im.complete||!im.naturalWidth)return false;
 const [sx,sy,sw,sh]=sprite.content;
 ctx.drawImage(im,sx,sy,sw,sh,Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 return true;
}

const QUESTS=[
 ['Home Sweet Home','Look inside your cottage.','The little cottage is northwest. Walk through its front door with WASD.'],
 ['Meet Your Mentor','Talk to Moss, the garden keeper.','Moss is the white-bearded wizard with a glowing staff outside the cottage.'],
 ['A Seed of Possibility','Find the glowing seed satchel.','Follow the east path toward the golden shimmer by the grove.'],
 ['Plant Your First Moonleaf','Plant a seed in an empty garden plot.','Stand beside a brown bed and press Z to plant (touchscreen: A).'],
 ['Give It a Drink','Water your planted Moonleaf.','Face your planted bed and press Z again to water (touchscreen: A).'],
 ['The Village Herbalist','Meet Pip in the town square.','Follow the road east to Mosswick and speak to Pip in green.'],
 ['The Hungry Visitor','Shoo away the snail from your garden.','Return home. Stand next to the hungry snail and press Z (touchscreen: A).'],
 ['A Wizard Is Born','Return to Moss for your first wand.','Find Moss by your cottage. Your first lesson is complete!'],
 ['Apprenticeship: Chapter Two','Free play! Grow crops, explore and cast light.','Rest in bed to advance crops, or visit the village. X casts light (touchscreen: B).']
];
const PLOTS=[];for(const y of [12,14,16])for(const x of [14,16,18])PLOTS.push({x,y});
const NPCS={farm:[{id:'moss',x:11,y:10,name:'Moss',color:'#9964ad',hat:'#56386c',lines:['The soil here remembers every good deed.','Small care is the oldest kind of magic.']}],town:[{id:'pip',x:12,y:10,name:'Pip the Herbalist',color:'#6ba96b',hat:'#b2c95e',lines:['Come back after your first harvest!','Rare seeds have a habit of finding curious people.']},{id:'baker',x:25,y:10,name:'Bram the Baker',color:'#ba8b57',hat:'#f8e0a9',lines:['Cinnamon buns and warm wishes.','Come by when you need to refill your hearts.']},{id:'ped1',x:19,y:17,name:'Wandering Wizard',color:'#758dd1',hat:'#504d83',wander:true,lines:['The town changes after sunset.','I heard a bell singing in the old grove.']},{id:'ped2',x:7,y:16,name:'Village Child',color:'#ce7682',hat:'#eeb89c',wander:true,lines:['I bet you can jump over little logs!','Try Space or the Jump button.']},
{id:'ped3',x:28,y:13,name:'Mira the Gardener',wander:true,lines:['My Moonleaf loved the morning rain.','The village is quieter just before sunrise.']},
{id:'ped4',x:33,y:15,name:'Little Rowan',wander:true,lines:['The crows know every secret in Mosswick!','One day I will find the Starlit Woods.']},
{id:'ped5',x:7,y:11,name:'Juniper the Seed Seller',wander:false,lines:['Fresh seed sacks arrive every Thursday.','A good seed only needs somewhere safe to begin.']},
{id:'ped6',x:18,y:19,name:'Traveling Root Mage',wander:true,lines:['Many roads begin in a garden.','Return when your wand is stronger and I may show you the forest path.']}],
shop:[{id:'seedstore',x:10,y:5,name:'Juniper the Seed Seller',lines:['The finest seeds are always shared between friends.','Come to my counter to buy Moonleaf seeds.']}],
bakery:[{id:'baker2',x:11,y:6,name:'Bram’s Assistant',lines:['Welcome to the warmest kitchen in Mosswick!','Try the counter for fresh bread.']}]};
const portals={farm:[{x:6,y:9,to:'home',px:9,py:13},{x:37,y:12,to:'town',px:1,py:12}],home:[{x:9,y:15,to:'farm',px:6,py:11}],town:[{x:0,y:12,to:'farm',px:36,py:12},{x:11,y:8,to:'shop',px:9,py:13},{x:25,y:8,to:'bakery',px:9,py:13}],shop:[{x:9,y:15,to:'town',px:11,py:9}],bakery:[{x:9,y:15,to:'town',px:25,py:9}]};
const sceneNames={farm:'The Green Patch',home:'Your Cozy Cottage',town:'Mosswick Village',shop:'Juniper’s Seed Shop',bakery:'Bram’s Bakery'};
const world={};
function mapNew(w,h,ground){return{w,h,g:Array.from({length:w*h},()=>ground),b:new Set(),d:{}};}
function key(x,y){return x+','+y}function idx(m,x,y){return y*m.w+x}function put(m,x,y,v,block){if(x<0||y<0||x>=m.w||y>=m.h)return;m.g[idx(m,x,y)]=v;if(block)m.b.add(key(x,y));else m.b.delete(key(x,y))}function setProp(m,x,y,p){m.d[key(x,y)]=p}
function rect(m,x,y,w,h,v,block=false){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(m,i,j,v,block)}
function frame(m){for(let x=0;x<m.w;x++){put(m,x,0,'tree',true);put(m,x,m.h-1,'tree',true)}for(let y=0;y<m.h;y++){put(m,0,y,'tree',true);put(m,m.w-1,y,'tree',true)}}
function building(m,x,y,w,h,roof,doorx){rect(m,x,y,w,h,roof,true);put(m,doorx,y+h-1,'door',false)}
function createWorld(){
 let m=mapNew(38,24,'grass');world.farm=m;frame(m);for(let x=5;x<38;x++)put(m,x,12,'path');for(let y=9;y<=12;y++)put(m,6,y,'path');for(let x=6;x<=11;x++)put(m,x,11,'path');for(let x=19;x<27;x++)put(m,x,6,'path');for(let y=6;y<13;y++)put(m,24,y,'path');rect(m,3,3,7,7,'house',true);put(m,6,9,'door',false);setProp(m,6,9,'house');for(const {x,y} of PLOTS)put(m,x,y,'soil');for(const p of [[4,18],[5,18],[6,18],[30,5],[29,6],[31,7],[33,18],[34,17],[26,20],[3,15],[8,19]])put(m,p[0],p[1],'tree',true);for(const p of [[20,9],[20,12],[29,15],[10,19]])put(m,p[0],p[1],'log',true);rect(m,29,8,4,3,'water',true);put(m,29,12,'arch',false);put(m,37,12,'path');put(m,25,6,'shimmer');setProp(m,25,6,'seeds');setProp(m,4,12,'sign');setProp(m,32,11,'roadSign');
 m=mapNew(36,24,'grass');world.town=m;frame(m);rect(m,1,12,34,2,'path');rect(m,17,7,3,11,'path');rect(m,3,9,30,2,'path');rect(m,10,9,3,4,'path');rect(m,24,9,3,4,'path');rect(m,5,15,3,4,'path');building(m,8,3,8,6,'shoproof',11);building(m,21,3,9,6,'bakeroof',25);building(m,23,16,8,5,'roof2',26);rect(m,16,12,4,2,'fountain',true);put(m,17,13,'fountain',true);for(const p of [[3,4],[4,4],[5,4],[32,5],[31,18],[11,20],[9,20],[3,20]])put(m,p[0],p[1],'tree',true);put(m,0,12,'path');setProp(m,5,11,'townSign');setProp(m,26,20,'library');
 for(const type of ['home','shop','bakery']){m=mapNew(20,16,'floor');world[type]=m;for(let x=0;x<20;x++){put(m,x,0,'wall',true);put(m,x,15,'wall',true)}for(let y=0;y<16;y++){put(m,0,y,'wall',true);put(m,19,y,'wall',true)}put(m,9,15,'door',false);rect(m,7,7,6,3,'rug');if(type==='home'){rect(m,3,3,3,3,'bed',true);rect(m,13,3,4,3,'stove',true);rect(m,10,5,2,2,'table',true);put(m,7,3,'book',true);put(m,14,10,'chest',true);setProp(m,4,5,'bed');setProp(m,7,3,'book');setProp(m,14,10,'chest')}else if(type==='shop'){rect(m,3,2,5,3,'shelf',true);rect(m,12,2,4,3,'shelf',true);rect(m,7,7,6,2,'counter',true);setProp(m,10,7,'counter');}else{rect(m,3,3,5,3,'stove',true);rect(m,12,4,4,4,'counter',true);setProp(m,12,6,'counter')}}
}
createWorld();
// An accessibility preference is intentionally independent of game saves, so a new
// apprenticeship preserves the player's narration choice. No audio is uploaded.
function readNarrationPref(){try{return localStorage.getItem('ww-voice-enabled')==='true'}catch(_){return false}}
function fresh(){return{scene:'farm',x:10,y:13,dir:'up',quest:0,day:1,time:9,heart:5,energy:5,xp:0,coins:8,seeds:0,harvest:0,planted:{},seedFound:false,wand:false,wandCharge:5,skills:{green:0,light:0,find:0},skillPoints:0,flags:{visitedHome:false,metMoss:false,metPip:false,snailShoo:false},snail:{x:22,y:15,active:false,banish:0},settings:{sfx:true,music:true,musicVolume:.38,showTouch:true,night:false,pixelArt:true,narration:readNarrationPref(),narrateQuests:true,voiceRate:.9,questMarkers:true},discovered:['farm'],journal:[]}}
let tapWalk=null, state=fresh(),mode='title',panelName='',dialogQueue=[],dialogCallback=null,held=new Set(),lastStep=0,lastSnail=0,lastMoveNpc=0,lastRegen=0,lastTime=0,lastSaved=0,prev=0,jumpUntil=0,jumpVelocity=0,toastUntil=0,castUntil=0,interactUntil=0,particles=[],shots=[],screenShake=0,modalReturn='game',pedsOffset={};
function hasSave(){try{return !!localStorage.getItem(SAVE)}catch(_){return false}}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));return true}catch(_){return false}}
function load(){try{let s=JSON.parse(localStorage.getItem(SAVE));if(!s||!world[s.scene]||!Number.isInteger(s.quest))return false;state={...fresh(),...s,settings:{...fresh().settings,...s.settings},skills:{...fresh().skills,...s.skills},flags:{...fresh().flags,...s.flags}};state.quest=Math.max(0,Math.min(8,state.quest));state.x=Math.max(1,Math.min(world[state.scene].w-2,state.x));state.y=Math.max(1,Math.min(world[state.scene].h-2,state.y));return true}catch(_){return false}}
function setOverlay(html){$('overlay').innerHTML=html;$('overlay').classList.remove('hidden')}function closeOverlay(){if(mode==='title')return;$('overlay').classList.add('hidden');mode='game';panelName='';updateSide();syncTouchControls()}
function syncTouchControls(){const el=$('controls');if(el)el.classList.toggle('hideControls',mode!=='game'||!state.settings.showTouch)}
function title(){stopSpeech();pauseMusic();mode='title';titleMarkup=titleMarkup.replace(/Narration (ON|OFF)/g,'Narration '+(state.settings.narration?'ON':'OFF'));setOverlay(titleMarkup);$('continueBtn').disabled=!hasSave();$('dialog').classList.add('hidden');held.clear();clearWalkTarget();syncTouchControls()}
function begin(continueGame=false){stopSpeech();state=continueGame&&load()?state:fresh();startMusic();$('controls').classList.toggle('hideControls',!state.settings.showTouch);mode='game';$('overlay').classList.add('hidden');$('dialog').classList.add('hidden');updateSide();clearWalkTarget();syncTouchControls();if(!continueGame||!hasSave()){say('Narrator',['A tiny cottage. Nine empty garden beds. A village beyond the trees.','Today you are nobody important. Tomorrow? Who knows. First, explore your cottage!'])}else notify('Welcome back, apprentice!');save()}
let titleMarkup=$('overlay').innerHTML;
const htmlEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let utteranceId=0; // cancels stale onend handlers and prevents music ducking races
function canSpeak(){return typeof window!=='undefined' && !!window.speechSynthesis && typeof SpeechSynthesisUtterance!=='undefined'}
function setMusicDucking(duck){if(bgm)bgm.volume=Math.max(0,Math.min(1,Number(state.settings.musicVolume??.38)))*(duck?.28:1)}
function stopSpeech(){utteranceId++;if(canSpeak()){try{window.speechSynthesis.cancel()}catch(_){}}setMusicDucking(false)}
function speakText(text,force=false){
 if(!force&&!state.settings.narration)return false;
 if(!canSpeak())return false;
 stopSpeech();const id=utteranceId;
 const u=new SpeechSynthesisUtterance(String(text).replace(/\s+/g,' ').trim());
 u.lang='en-US';u.rate=Number(state.settings.voiceRate||.9);u.pitch=1.04;u.volume=1;
 try{
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(v=>/^en[-_]/i.test(v.lang)&&v.localService) || voices.find(v=>/^en/i.test(v.lang));
  if(v)u.voice=v;
  u.onend=u.onerror=()=>{if(id===utteranceId)setMusicDucking(false)};
  setMusicDucking(true);
  window.speechSynthesis.speak(u);
  return true;
 }catch(_){setMusicDucking(false);return false}
}
function speakQuest(force=false){if(!force&&!state.settings.narrateQuests)return;
 const q=QUESTS[state.quest];speakText('Current quest: '+q[0]+'. '+q[1]+'. '+q[2],force);
}
function say(who,lines,cb){updateSide();dialogQueue=(Array.isArray(lines)?lines:[lines]).slice();dialogCallback=cb||null;mode='dialog';held.clear();clearWalkTarget();$('dialog').classList.remove('hidden');syncTouchControls();$('speaker').textContent=who;nextLine()}
function nextLine(){stopSpeech();if(dialogQueue.length){const line=dialogQueue.shift();$('message').textContent=line;sound('dialogue');speakText(($('speaker').textContent||'Narrator')+'. '+line)}else{let cb=dialogCallback;dialogCallback=null;$('dialog').classList.add('hidden');mode='game';if(cb)cb();updateSide();syncTouchControls()}}
function notify(s){const t=$('toast');t.textContent=s;t.classList.remove('hidden');toastUntil=performance.now()+2550}
// Local audio: original sleepy 16-bit soundtrack and individually packaged WAV accents.
// Music starts only after the player's Begin / Continue action (browser autoplay policy).
let bgm=null,fx={};
const soundList=['ui','dialogue','pickup','plant','water','quest','cast','snail','door','jump','harvest','purchase'];
function initialiseAudio(){
 if(typeof Audio==='undefined')return;
 try{
  if(!bgm){bgm=new Audio('assets/audio/moonlit_garden_loop.mp3');bgm.loop=true;bgm.preload='auto';}
  for(const name of soundList)if(!fx[name]){fx[name]=new Audio('assets/audio/'+name+'.wav');fx[name].preload='auto';}
 }catch(_){/* unsupported or restricted embedded browser */}
}
function startMusic(){
 initialiseAudio();if(!bgm)return;
 bgm.volume=Math.max(0,Math.min(1,Number(state.settings.musicVolume??.38)));
 if(!state.settings.music){bgm.pause();return}
 try{const p=bgm.play();if(p&&p.catch)p.catch(()=>{/* may require a new touch gesture */})}catch(_){}
}
function pauseMusic(){if(bgm)bgm.pause()}
function sound(name='ui'){
 if(!state.settings.sfx)return;
 initialiseAudio();let f=fx[name]||fx.ui;if(!f)return;
 try{const a=f.cloneNode(true);a.volume=.48;const p=a.play();if(p&&p.catch)p.catch(()=>{});}catch(_){}
}
function questComplete(why){if(state.quest>=8)return;const old=state.quest;state.quest++;state.xp+=10;if([3,5,7].includes(old))state.skillPoints++;state.journal.push('Day '+state.day+': '+QUESTS[old][0]);sound('quest');notify('✦ Quest complete! +10 XP'+([3,5,7].includes(old)?' · +1 skill point':''));if(state.quest===2&&state.seedFound){questComplete();return}if(state.quest===3&&Object.keys(state.planted).length){questComplete();return}if(state.quest===4&&Object.values(state.planted).some(p=>p.watered)){questComplete();return}if(state.quest===8){state.wand=true;save();say('Moss',['You’ve cared for a small life, listened to your neighbours, and defended your garden without cruelty.','Take this GLIMMER WAND! Press X to cast light, or tap B on a touchscreen.','Your apprenticeship has only just begun. The rest of Mosswick is waiting.'],()=>{openPanel('ending')})}save();updateSide();if(mode==='game')speakQuest()}
function updateSide(){$('placeHud').textContent='✦ '+sceneNames[state.scene];$('dayHud').textContent='Day '+state.day+' · '+(state.settings.night?'☾ Evening':'☀ Morning');$('questSide').textContent=QUESTS[state.quest][1];$('hintSide').textContent=QUESTS[state.quest][2];const ribbon=$('questRibbon');if(ribbon){ribbon.textContent='❗ '+(state.quest<8?'QUEST '+(state.quest+1)+'/8 · ':'FREE PLAY · ')+QUESTS[state.quest][0];ribbon.setAttribute('aria-label','Open quest journal: '+QUESTS[state.quest][0]);}$('statusSide').innerHTML='🪄 Wand: '+(state.wand?'Glimmer Wand':'not earned')+'<br>🌱 Seeds: '+state.seeds+' · ✦ XP: '+state.xp+'<br>🪙 Coins: '+state.coins+' · ✧ Skills: '+state.skillPoints;$('healthBar').style.width=(100*state.heart/5)+'%';$('healthText').textContent='Hearts '+state.heart+'/5 · Focus '+state.wandCharge+'/5';}
function near(x,y){return Math.abs(x-state.x)+Math.abs(y-state.y)<=1}function ahead(){let d=dirs[state.dir];return{x:state.x+d[0],y:state.y+d[1]}};
function npcPos(n){let d=pedsOffset[n.id]||{x:0,y:0};return{x:n.x+d.x,y:n.y+d.y}}
function npcAt(x,y){return(NPCS[state.scene]||[]).find(n=>{let p=npcPos(n);return p.x===x&&p.y===y})}
function solid(scene,x,y,jump=false){let m=world[scene];if(x<0||y<0||x>=m.w||y>=m.h)return true;if(npcAt(x,y))return true;if(m.b.has(key(x,y))){let t=m.g[idx(m,x,y)];if(t==='log'&&jump)return false;return true}let t=m.g[idx(m,x,y)];if(t==='arch'&&!held.has('crouch'))return true;return false}
function move(dx,dy,jumping=false){if(mode!=='game')return;state.dir=dx===1?'right':dx===-1?'left':dy===1?'down':'up';let tx=state.x+dx,ty=state.y+dy;if(solid(state.scene,tx,ty,jumping)){if(world[state.scene].g[idx(world[state.scene],Math.max(0,Math.min(world[state.scene].w-1,tx)),Math.max(0,Math.min(world[state.scene].h-1,ty)))]==='arch')notify('Hold crouch (C) to slip beneath the arch.');return}state.x=tx;state.y=ty;state.time+=.006;if(state.time>20){state.time=9;state.settings.night=!state.settings.night}if(jumping)jumpUntil=performance.now()+420;for(const p of portals[state.scene]||[])if(p.x===state.x&&p.y===state.y){enter(p);break}if(state.scene==='farm'&&state.x===25&&state.y===6&&!state.seedFound)collectSeeds();updateSide();}
function enter(p){clearWalkTarget();sound('door');state.scene=p.to;state.x=p.px;state.y=p.py;state.dir='down';if(!state.discovered.includes(p.to))state.discovered.push(p.to);if(p.to==='home'&&!state.flags.visitedHome){state.flags.visitedHome=true;if(state.quest===0)questComplete();say('Cottage',['Home! A bed for resting, a cookbook, a chest, and a little kitchen.','Try Z beside the bed to sleep and advance your garden by one day.']);}else if(p.to==='town'&&!state.flags.metPip&&state.quest>=5)notify('Find Pip in green by the seed shop!');else notify('Welcome to '+sceneNames[p.to]);save()}
function collectSeeds(){state.seedFound=true;state.seeds+=3;if(state.skills.find)state.seeds+=2;sound('pickup');notify('Found '+(state.skills.find?5:3)+' Moonleaf seeds!');if(state.quest===2)questComplete();save()}
function doNpc(n){if(n.id==='moss'){if(state.quest===1){say('Moss',['You must be the new keeper! I’m Moss, apprentice gardener and unofficial snail negotiator.','Follow the eastern trail. A pouch of magical Moonleaf seeds fell near the old grove.'],()=>{state.flags.metMoss=true;questComplete()})}else if(state.quest===7){questComplete()}else say('Moss',n.lines)}
else if(n.id==='pip'){if(state.quest===5){say('Pip',['Welcome to Mosswick! This little village runs on friendship, baked goods and questionable magic.','Your Moonleaf is growing? Wonderful! Take this charm. Oh, and keep an eye on the snails near your garden.'],()=>{state.flags.metPip=true;state.coins+=4;state.snail.active=true;questComplete()})}else say('Pip',n.lines)}else if(n.id==='seedstore'){openPanel('seedShop')}else if(n.id==='baker'){state.heart=Math.min(5,state.heart+1);say('Bram',['Have a warm bun. Your heart feels a little lighter!','The best adventures include a snack break.']);updateSide()}else say(n.name,n.lines)}
function doPlot(x,y){let k=key(x,y),p=state.planted[k];if(!p){if(state.seeds<=0){say('Garden','This bed is ready, but you do not have any Moonleaf seeds.');return}state.seeds--;state.planted[k]={stage:0,watered:false,health:3};sound('plant');say('Garden',['You tuck a Moonleaf seed into the soft soil.','A tiny blue spark appears where you planted it.'],()=>{if(state.quest===3)questComplete()});return}if(p.stage>=3){sound('harvest');state.harvest++;state.coins+=5;state.seeds+=1+(state.skills.find?1:0);delete state.planted[k];say('Harvest!',['You gathered '+(state.harvest)+' luminous Moonleaf flower'+(state.harvest===1?'':'s')+'!','+5 coins and '+(state.skills.find?2:1)+' seed'+(state.skills.find?'s':'')+'. The garden is ready for another planting.']);return}if(!p.watered){p.watered=true;p.health=Math.min(3,p.health+1+state.skills.green);sound('water');say('Garden',['A little water, a little patience.','The Moonleaf '+(['seed','sprout','stem'][p.stage])+' shimmers happily.'],()=>{if(state.quest===4)questComplete()})}else say('Garden','This plant has enough water today. Sleep in your cottage to begin a new day.')}
function nextDay(){sound('ui');state.day++;state.settings.night=false;state.time=9;state.heart=5;state.wandCharge=5;let grew=0,ready=0;for(const k in state.planted){const p=state.planted[k];if(p.watered){p.stage=Math.min(3,p.stage+1+(state.skills.green&&state.day%3===0?1:0));p.health=Math.min(3,p.health+1);grew++;if(p.stage===3)ready++}else p.health=Math.max(1,p.health-1);p.watered=false}if(state.snail.active){state.snail.x=22;state.snail.y=15}save();say('Morning Bell',['Day '+state.day+' begins. '+(grew?grew+' planted Moonleaf '+(grew===1?'has':'have')+' grown.':'The garden waits for your seeds.')+(ready?' '+ready+' plant'+(ready>1?'s are':' is')+' ready to harvest!':'')]);updateSide()}
function snailInteract(){if(state.quest===6){state.snail.active=false;state.snail.banish=performance.now()+8500;state.flags.snailShoo=true;sound('snail');say('Hungry Snail',['You crouch and softly wave your arms. The snail blinks, apologises (probably), and slides into the bushes.','The Moonleaf is safe! Moss will want to hear about this.'],()=>questComplete());return}state.snail.active=false;state.snail.banish=performance.now()+9000;sound('snail');notify('The snail retreats into the ferns!')}
function interact(){if(mode==='dialog'){nextLine();return}if(mode==='panel'){closeOverlay();return}if(mode!=='game')return;interactUntil=performance.now()+300;let a=ahead();let npc=(NPCS[state.scene]||[]).find(n=>{let p=npcPos(n);return near(p.x,p.y)&&(p.x===a.x&&p.y===a.y)});if(!npc)npc=(NPCS[state.scene]||[]).find(n=>{let p=npcPos(n);return near(p.x,p.y)});if(npc){doNpc(npc);return}
 if(state.scene==='farm'&&state.snail.active&&near(state.snail.x,state.snail.y)){snailInteract();return}
 if(state.scene==='farm'){let plot=PLOTS.find(p=>p.x===a.x&&p.y===a.y)||PLOTS.find(p=>p.x===state.x&&p.y===state.y);if(plot){doPlot(plot.x,plot.y);return}if(near(25,6)&&!state.seedFound){collectSeeds();return}}
 if(state.scene==='home'){if(near(4,5)){say('Cozy Bed',['A little rest makes crops grow. Tomorrow is only a nap away.'],()=>nextDay());return}if(near(7,3)){say('Old Spellbook',['The first lesson of every Weed Wizard: grow before you glow.','Three magical schools wait in your skill tree: Rootcraft, Lightcraft and Wayfinding.']);return}if(near(14,10)){say('Storage Chest',['Your spell chest is empty for now. Someday it may hold wands, trinkets and unusual seeds.']);return}if(near(14,4)){say('Kitchen',['There is bread, herbal tea and an incredibly suspicious glowing kettle.']);return}}
 if(state.scene==='shop'&&((a.y>=7&&a.y<=8&&a.x>=7&&a.x<=12)||(state.y===9&&state.x>=7&&state.x<=12))){openPanel('seedShop');return}
 if(state.scene==='bakery'&&near(12,6)){if(state.coins>=2){sound('purchase');state.coins-=2;state.heart=5;say('Bakery',['A fresh honey bun restores your hearts!','That costs 2 coins.'])}else say('Bakery','The honey bun costs 2 coins.');return}
 if(state.scene==='farm'&&near(4,12)){say('Wooden Sign',['THE GREEN PATCH','Keep your garden safe. Make magic kindly.']);return}if(state.scene==='town'&&near(5,11)){say('Town Sign',['MOSSWICK VILLAGE','West: Gardens · North: Shops · East: Starlit Woods (coming soon)']);return}if(state.scene==='town'&&near(26,20)){say('Library',['The old library is being renovated. Strange new stories will open in a later chapter.']);return}
 say('Apprentice','Nothing unusual here... yet.');}
function cast(){if(mode==='dialog'){nextLine();return}if(mode==='panel'){closeOverlay();return}if(mode!=='game')return;if(!state.wand){notify('X will cast light once you earn your wand (touchscreen: B).');return}if(state.wandCharge<1){notify('Your wand needs a moment to recharge.');return}state.wandCharge--;castUntil=performance.now()+340;let d=dirs[state.dir];shots.push({x:state.x+.5,y:state.y+.5,dx:d[0],dy:d[1],life:state.skills.light?18:11});sound('cast');updateSide()}
function jump(){if(mode!=='game')return;let d=dirs[state.dir];jumpUntil=performance.now()+430;if(world[state.scene].g[idx(world[state.scene],Math.max(0,Math.min(world[state.scene].w-1,state.x+d[0])),Math.max(0,Math.min(world[state.scene].h-1,state.y+d[1])))]==='log'){move(d[0],d[1],true);notify('Hopped over a fallen log!')}else{sound('jump')}}
// Pointer navigation: shortest accessible four-way route through the actual collision map.
// NPCs and plots can be tapped: approach from a valid adjacent cell and interact.
function clearWalkTarget(){tapWalk=null;}
function tapPathTo(wx,wy){
 if(mode!=='game')return;
 const m=world[state.scene]; if(wx<0||wy<0||wx>=m.w||wy>=m.h)return;
 let isNpc=!!npcAt(wx,wy),isPlot=state.scene==='farm'&&PLOTS.some(p=>p.x===wx&&p.y===wy);
 let isSnail=state.scene==='farm'&&state.snail.active&&state.snail.x===wx&&state.snail.y===wy;
 let isShopCounter=state.scene==='shop'&&wx>=7&&wx<=12&&wy>=7&&wy<=8;
 let actionable=isNpc||isPlot||isSnail||isShopCounter;
 if(state.x===wx&&state.y===wy){if(actionable)interact();else clearWalkTarget();return;}
 const origin=key(state.x,state.y),visited=new Map([[origin,null]]),queue=[[state.x,state.y]],reachable=[];
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];reachable.push([x,y]);
  for(const [dx,dy] of Object.values(dirs)){
   const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(!visited.has(k)&&!solid(state.scene,nx,ny)){visited.set(k,key(x,y));queue.push([nx,ny]);}
  }
 }
 // A blocked target (e.g. an NPC or tree) uses its nearest reachable neighbour.
 const candidates=actionable?reachable.filter(([x,y])=>Math.abs(x-wx)+Math.abs(y-wy)===1):reachable;
 if(!candidates.length){notify('No walkable route to that spot.');return}
 candidates.sort((a,b)=>{
  const da=Math.abs(a[0]-wx)+Math.abs(a[1]-wy),db=Math.abs(b[0]-wx)+Math.abs(b[1]-wy);
  return da-db || (actionable?(Math.abs(a[0]-state.x)+Math.abs(a[1]-state.y))-(Math.abs(b[0]-state.x)+Math.abs(b[1]-state.y)):0);
 });
 const [gx,gy]=candidates[0],route=[];let k=key(gx,gy);
 while(k!==origin){const [x,y]=k.split(',').map(Number);route.push([x,y]);k=visited.get(k);if(k===undefined){clearWalkTarget();return}}
 route.reverse();tapWalk={route,scene:state.scene,target:[wx,wy],destination:[gx,gy],actionable,created:performance.now()};
 if(!route.length&&actionable)finishTapWalk();
}
function finishTapWalk(){
 if(!tapWalk)return;const target=tapWalk;tapWalk=null;
 if(target.scene!==state.scene||!target.actionable)return;
 const [x,y]=target.target;
 if(Math.abs(state.x-x)+Math.abs(state.y-y)<=1){
  const dx=x-state.x,dy=y-state.y;
  if(dx>0)state.dir='right';else if(dx<0)state.dir='left';else if(dy>0)state.dir='down';else if(dy<0)state.dir='up';
  if(target.scene==='shop'&&x>=7&&x<=12&&y>=7&&y<=8)openPanel('seedShop');else interact();
 }
}
function stepTapWalk(ms){
 if(mode!=='game'||!tapWalk||held.size||ms-lastStep<130)return;
 if(tapWalk.scene!==state.scene){clearWalkTarget();return}
 const next=tapWalk.route.shift();if(!next){finishTapWalk();return}
 if(solid(state.scene,next[0],next[1])){clearWalkTarget();notify('Path blocked. Tap to choose another route.');return}
 const prevScene=state.scene;move(next[0]-state.x,next[1]-state.y);
 lastStep=ms;
 if(prevScene!==state.scene){clearWalkTarget();return}
 if(!tapWalk)return;
 if(!tapWalk.route.length)finishTapWalk();
}
function stepMovement(ms){let direction=['up','down','left','right'].find(v=>held.has(v));if(direction&&ms-lastStep>132){let [dx,dy]=dirs[direction];move(dx,dy,false);lastStep=ms}}
function update(dt,now){
 if(mode==='game'){
  stepMovement(now);stepTapWalk(now);
  if(state.scene==='farm'&&state.snail.active&&now-lastSnail>1600){
   lastSnail=now;
   const sn=state.snail;
   const candidates=PLOTS.filter(p=>state.planted[key(p.x,p.y)]);
   if(candidates.length){
    const target=candidates.slice().sort((a,b)=>(Math.abs(a.x-sn.x)+Math.abs(a.y-sn.y))-(Math.abs(b.x-sn.x)+Math.abs(b.y-sn.y)))[0];
    if(Math.abs(sn.x-target.x)+Math.abs(sn.y-target.y)<=1){
     const plant=state.planted[key(target.x,target.y)];
     if(plant){plant.health=Math.max(1,plant.health-1);if(Math.random()<.4)notify('A hungry snail nibbles your Moonleaf!');}
    }else{const dx=Math.sign(target.x-sn.x),dy=Math.sign(target.y-sn.y);if(Math.abs(target.x-sn.x)>=Math.abs(target.y-sn.y))sn.x+=dx;else sn.y+=dy;}
   }
   if(near(sn.x,sn.y)&&state.quest!==6&&Math.random()<.3){state.heart=Math.max(1,state.heart-1);notify('A snail bumps into your boots!');updateSide();}
  }
  if(!state.snail.active&&state.snail.banish>0&&now>state.snail.banish&&state.quest>=8){state.snail.active=true;state.snail.x=22;state.snail.y=15;state.snail.banish=0;}
  if(now-lastRegen>4000){lastRegen=now;state.wandCharge=Math.min(5,state.wandCharge+1);updateSide();}
  if(now-lastMoveNpc>2800){
   lastMoveNpc=now;
   for(const n of NPCS.town.filter(n=>n.wander)){
    const offset=pedsOffset[n.id]||{x:0,y:0};const v=[[0,0],[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*5)];
    const ox=offset.x+v[0],oy=offset.y+v[1];
    if(Math.abs(ox)<=3&&Math.abs(oy)<=2&&n.x+ox>0&&n.y+oy>0&&n.x+ox<world.town.w-1&&n.y+oy<world.town.h-1&&!world.town.b.has(key(n.x+ox,n.y+oy))&&!(state.scene==='town'&&state.x===n.x+ox&&state.y===n.y+oy))pedsOffset[n.id]={x:ox,y:oy};
   }
  }
  for(const shot of shots){
   shot.x+=shot.dx*dt*.014;shot.y+=shot.dy*dt*.014;shot.life-=dt*.012;
   if(state.scene==='farm'&&state.snail.active&&Math.hypot(shot.x-state.snail.x-.5,shot.y-state.snail.y-.5)<1){
    state.snail.active=false;state.snail.banish=now+9000;state.snail.x=22;state.snail.y=15;shot.life=0;
    notify('Light magic gently guides the snail away!');
   }
  }
  shots=shots.filter(shot=>shot.life>0);
  if(now-lastSaved>15000){lastSaved=now;save();}
 }
 if(toastUntil&&now>toastUntil)$('toast').classList.add('hidden');
}
const colors={grass:'#76a65e',path:'#d7bb77',water:'#5797b4',soil:'#7a513f',floor:'#d4b483',wall:'#524968',rug:'#9e706f',tree:'#39744b',door:'#a87859',house:'#bf8170',shoproof:'#849d74',bakeroof:'#cd8672',roof2:'#72839b',fountain:'#7995ad'};
function hash(x,y){let t=(x*374761393+y*668265263)>>>0;t=(t^(t>>>13))*1274126177;return(t^(t>>>16))>>>0}
// All terrain, characters and particles now draw from the bundled original PNG atlases.
// Flat-colour fallbacks remain available in Settings for visual and collision debugging.
function tileDraw(t,x,y,wx,wy,now){
 const r=hash(wx,wy)%6;
 let base=state.scene==='home'||state.scene==='shop'||state.scene==='bakery'?'wood':'grass';
 if(t==='soil')base='soil';else if(t==='path')base='path';else if(t==='water'||t==='fountain')base='water';
 else if(t==='wall')base='wall_beam';else if(t==='floor')base='wood';else if(t==='rug')base='wood_pattern';
 else if(t==='house'||t==='shoproof'||t==='bakeroof'||t==='roof2')base='grass';
 else if(t==='door')base=['farm','town'].includes(state.scene)?'grass':'wood';
 ctx.fillStyle=colors[t]||'#699a5a';ctx.fillRect(x,y,T,T);
 if(!blit(['home','shop','bakery'].includes(state.scene)?'interiors':'world',['home','shop','bakery'].includes(state.scene)?(t==='wall'?'wall_wood':t==='rug'?'rug_weave':'floor_planks'):base,x,y,T,T)){
  ctx.fillStyle=colors[t]||'#6d985b';ctx.fillRect(x,y,T,T);
  ctx.fillStyle='#a8c17b';ctx.fillRect(x+((r*5)%14),y+((r*3)%14),2,3);
 }
 if(t==='grass'){
  if(r===0)blit('world','grass_flower',x,y,T,T);
  if(r===2)blit('world','grass_clover',x,y,T,T);
 }
 if(t==='path'){blit('world',r===0?'path':'dirt',x,y,T,T);}
 else if(t==='soil')blit('world',state.planted[key(wx,wy)]?.watered?'soil_wet':'soil_furrow',x,y,T,T);
 else if(t==='tree'){const m=world[state.scene];if(wx===0||wy===0||wx===m.w-1||wy===m.h-1)blit('world','grass_thick',x,y,T,T);/* Other trees drawn as depth-sorted scenery. */}
 else if(t==='log'){/* Depth-sorted stump, not part of ground pass. */}
 else if(t==='arch'){/* Tall arch drawn as depth-sorted scenery. */}
 else if(t==='shimmer'&&!state.seedFound){
  blit('items','seed_pouch',x,y-5,T,T+4);
  if(Math.floor(now/400)%2){ctx.fillStyle='#fff8aa';ctx.fillRect(x+T-3,y+2,3,3);}
 }
 else if(t==='water')blit('world',Math.floor(now/800)%2?'water':'lily',x,y,T,T);
 else if(t==='fountain'){
  blit('world','water',x,y,T,T);
  if((wx+wy)%2===0)blit('world','lily',x,y,T,T);
 }
 else if(t==='door'&&!['farm','town'].includes(state.scene))blit('world','door',x-2,y-7,T+4,T+7);
}
// One contiguous exterior image per building; collisions and door portals
// remain defined in the original tile map, so quests / interiors still work.
const buildingLayouts={
 farm:[['cottage',3,3,7,7]],
 town:[['seed_shop',8,3,8,6],['bakery',21,3,9,6],['library',23,16,8,5]]
};
function drawBuildings(camX,camY){
 for(const [name,x,y,w,h] of buildingLayouts[state.scene]||[]){
  blit('buildings',name,Math.floor(x*T-camX),Math.floor(y*T-camY),w*T,h*T);
 }
}
const objectLayouts={
 home:[['bed',3,3,3,3],['stove',13,3,4,3],['table',10,5,2,2],['bookshelf',7,3,1,2],['chest',14,10,1,1]],
 shop:[['bookshelf',3,2,5,3],['bookshelf',12,2,4,3],['interiors:seed_counter',7,7,6,2]],
 bakery:[['stove',3,3,5,3],['interiors:bakery_counter',12,4,4,4]]
};
function drawFurniture(camX,camY){
 for(const [sprite,x,y,w,h] of (objectLayouts[state.scene]||[])) {
  const [group,name]=sprite.includes(':')?sprite.split(':'):['world',sprite];
  blit(group,name,Math.floor(x*T-camX),Math.floor(y*T-camY),w*T,h*T);
 }
}
function drawWizard(sx,sy,now){
 let motion=mode==='game'&&[...held].some(v=>dirs[v]);
 let frame=motion?(['walk1','walk2','walk3','walk2'][Math.floor(now/145)%4]):'idle';
 let pose=state.dir+'_'+frame;
 let airborne=now<jumpUntil?Math.sin(Math.PI*(1-(jumpUntil-now)/430))*9:0;
 if(held.has('crouch'))pose='crouch';else if(airborne>0)pose='jump';else if(now<castUntil)pose=state.dir+'_cast';else if(now<interactUntil)pose=state.dir+'_interact';
 ctx.fillStyle='#263c2c77';ctx.fillRect(sx+4,sy+T-3,T-8,3);
 if(!blit('player',pose,sx-6,sy-19-airborne,T+12,T+20)){
  ctx.fillStyle='#275542';ctx.fillRect(sx+4,sy-5,T-8,T+3);
  ctx.fillStyle='#f4d39e';ctx.fillRect(sx+7,sy-14,10,10);
 }
 if(state.wand&&pose!=='crouch')blit('items','wand',sx+16,sy-11-airborne,12,24);
}
const npcSprite={moss:'moss',pip:'pip',baker:'seed_merchant',ped1:'traveler',ped2:'child',ped3:'villager',ped4:'child',ped5:'seed_merchant',ped6:'traveler',seedstore:'seed_merchant',baker2:'villager'};
function drawNpc(n,sx,sy,now){
 const which=npcSprite[n.id]||'villager';
 let pose=n.wander&&Math.floor(now/380)%2===0?'walk1':'front';
 ctx.fillStyle='#2a382380';ctx.fillRect(sx+4,sy+T-3,T-8,3);
 if(!blit('npcs',which+'_'+pose,sx-7,sy-20,T+14,T+20)){
  ctx.fillStyle=n.color||'#557953';ctx.fillRect(sx+5,sy-5,T-10,T+2);
 }
}
function drawPlant(p,sx,sy,now){
 const growth=['crop_0','crop_1','crop_2','crop_4'][Math.min(3,p.stage)];
 if(!blit('items',growth,sx+1,sy-12,T-2,T+12)){
  ctx.fillStyle='#79c573';ctx.fillRect(sx+9,sy+8,6,11);
 }
 if(p.watered){ctx.fillStyle='#9ddbf4';ctx.fillRect(sx+20,sy+17,3,5)}
 if(p.health===1){ctx.fillStyle='#ffb17d';ctx.fillRect(sx+1,sy+2,3,4)}
}

// Focus targets update with the actual quest state. Markers never reveal unrelated quests.
function nearestQuestPlot(needsWater){
 const choices=PLOTS.filter(p=>needsWater?!!state.planted[key(p.x,p.y)]&&!state.planted[key(p.x,p.y)].watered:!state.planted[key(p.x,p.y)]);
 const pool=choices.length?choices:PLOTS;
 return pool.reduce((best,p)=>!best || Math.abs(p.x-state.x)+Math.abs(p.y-state.y)<Math.abs(best.x-state.x)+Math.abs(best.y-state.y)?p:best,null);
}
function questTarget(){
 let q=state.quest, target=null;
 if(q===0)target={scene:'farm',x:6,y:9,label:'COTTAGE'};
 if(q===1||q===7)target={scene:'farm',x:npcPos(NPCS.farm[0]).x,y:npcPos(NPCS.farm[0]).y,label:'MOSS'};
 if(q===2)target={scene:'farm',x:25,y:6,label:'SEEDS'};
 if(q===3||q===4){let p=nearestQuestPlot(q===4);if(p)target={scene:'farm',x:p.x,y:p.y,label:q===3?'PLANT':'WATER'}}
 if(q===5)target={scene:'town',...npcPos(NPCS.town[0]),label:'PIP'};
 if(q===6)target={scene:'farm',x:state.snail.x,y:state.snail.y,label:'SNAIL'};
 if(!target)return null;
 if(target.scene!==state.scene){
  let link=(portals[state.scene]||[]).find(p=>p.to===target.scene);
  // Head through the game's actual connected areas rather than targeting across maps.
  if(!link){link=(portals[state.scene]||[]).find(p=>p.to==='farm'||p.to==='town');}
  if(link)return {scene:state.scene,x:link.x,y:link.y,label:target.scene==='town'?'TO TOWN':'TO GARDEN',portal:true};
  return null;
 }
 return target;
}
function drawQuestMarker(camX,camY,now){
 if(!state.settings.questMarkers||state.quest>=8)return;
 const target=questTarget();if(!target)return;
 const px=(target.x+.5)*T-camX,py=target.y*T-camY;
 const x=Math.round(Math.max(16,Math.min(W-16,px)));
 const y=Math.round(Math.max(47,Math.min(H-12,py)));
 const bob=Math.round(Math.sin(now/210)*2);
 // A small floating marker, never a large text box over doors or NPCs.
 const cy=y-28+bob;
 ctx.fillStyle='#162a2ce8';ctx.fillRect(x-9,cy-9,18,19);
 ctx.strokeStyle=target.portal?'#89e2ff':'#f5ce65';ctx.lineWidth=2;ctx.strokeRect(x-9,cy-9,18,19);
 ctx.fillStyle=target.portal?'#a7e6ef':'#ffe394';ctx.font='bold 14px monospace';
 ctx.fillText(target.portal?'›':'!',x-4,cy+5);
}

function render(now){
 const m=world[state.scene];let camX=Math.max(0,Math.min(m.w*T-W,state.x*T+T/2-W/2)),camY=Math.max(0,Math.min(m.h*T-H,state.y*T+T/2-H/2));
 if(m.w*T<W)camX=-(W-m.w*T)/2;if(m.h*T<H)camY=-(H-m.h*T)/2;
 camX=Math.floor(camX);camY=Math.floor(camY);
 ctx.fillStyle='#315d48';ctx.fillRect(0,0,W,H);
 let sx0=Math.max(0,Math.floor(camX/T)-1),sy0=Math.max(0,Math.floor(camY/T)-1);
 let sx1=Math.min(m.w,sx0+Math.ceil(W/T)+4),sy1=Math.min(m.h,sy0+Math.ceil(H/T)+4);
 for(let y=sy0;y<sy1;y++)for(let x=sx0;x<sx1;x++)tileDraw(m.g[idx(m,x,y)],Math.floor(x*T-camX),Math.floor(y*T-camY),x,y,now);
 drawBuildings(camX,camY);
 drawFurniture(camX,camY);
 if(state.scene==='farm'){
  for(const p of PLOTS){const plant=state.planted[key(p.x,p.y)];if(plant)drawPlant(plant,Math.floor(p.x*T-camX),Math.floor(p.y*T-camY),now)}
  if(state.snail.active){const sn=state.snail;
    if(!blit('items','snail_'+(['idle','crawl1','crawl2'][Math.floor(now/420)%3]),Math.floor(sn.x*T-camX)-4,Math.floor(sn.y*T-camY)-6,T+8,T+7)){
      ctx.fillStyle='#be916b';ctx.fillRect(sn.x*T-camX,sn.y*T-camY+8,20,12);
    }
  }
  // A visible little cottage sign and wayfinding marker
  blit('world','sign',Math.floor(4*T-camX),Math.floor(12*T-camY)-14,T+7,T+15);
  blit('world','sign',Math.floor(32*T-camX),Math.floor(11*T-camY)-14,T+7,T+15);
 }
 if(state.scene==='town')blit('world','sign',Math.floor(5*T-camX),Math.floor(11*T-camY)-13,T+7,T+14);
 // Large scenery must be drawn only after every ground tile, otherwise grass
 // tiles overwrite the canopy. Sort by feet Y for proper top-down occlusion.
 const actors=[];
 for(let y=Math.max(0,sy0-4);y<Math.min(m.h,sy1+4);y++)for(let x=Math.max(0,sx0-3);x<Math.min(m.w,sx1+3);x++){
  const tile=m.g[idx(m,x,y)],sx=Math.floor(x*T-camX),sy=Math.floor(y*T-camY);
  if(tile==='tree'&&x>0&&y>0&&x<m.w-1&&y<m.h-1){
   // Keep collision for every wooded tile, but paint exactly one canopy per
   // horizontal grove. Multiple huge sprites spaced 24px apart look cut up.
   let first=x,last=x;
   while(first>1&&m.g[idx(m,first-1,y)]==='tree')first--;
   while(last<m.w-2&&m.g[idx(m,last+1,y)]==='tree')last++;
   if(x===Math.floor((first+last)/2))actors.push({depth:(y+1)*T,draw:()=>{
    const variant=hash(x,y)%3===0?'tree_alt':'tree';
    blit('world',variant,sx-19,sy-42,T*2.6,T*2.8);
   }});
  }
  if(tile==='log')actors.push({depth:(y+1)*T,draw:()=>blit('world','stump',sx-3,sy-8,T+6,T+13)});
  if(tile==='arch')actors.push({depth:(y+1)*T,draw:()=>blit('world','gate',sx-4,sy-12,T+8,T+18)});
 }
 for(const n of NPCS[state.scene]||[]){const p=npcPos(n),sx=Math.floor(p.x*T-camX),sy=Math.floor(p.y*T-camY);actors.push({depth:(p.y+1)*T,draw:()=>drawNpc(n,sx,sy,now)})}
 actors.push({depth:(state.y+1)*T+.5,draw:()=>drawWizard(Math.floor(state.x*T-camX),Math.floor(state.y*T-camY),now)});
 actors.sort((a,b)=>a.depth-b.depth);for(const actor of actors)actor.draw();
 // Tap-to-walk destination sparkle; does not block any map input.
 if(tapWalk&&mode==='game'&&tapWalk.scene===state.scene){const [gx,gy]=tapWalk.destination;
  const px=Math.floor(gx*T-camX+T/2),py=Math.floor(gy*T-camY+T/2);
  ctx.strokeStyle='#fff0a8';ctx.lineWidth=2;ctx.strokeRect(px-7,py-7,14,14);
 }
 for(const s of shots){
  if(!blit('items','projectile',Math.floor(s.x*T-camX-10),Math.floor(s.y*T-camY-10),20,20)){
   ctx.fillStyle='#eafa85';ctx.fillRect(Math.floor(s.x*T-camX),Math.floor(s.y*T-camY),8,8);
  }
 }
 if(state.settings.night){ctx.fillStyle='#162e5770';ctx.fillRect(0,0,W,H)}
 drawQuestMarker(camX,camY,now);
 // Quest text is in the sidebar / journal; do not cover exits or the player.
}
function openPanel(name){if(mode==='title'||mode==='dialog')return;mode='panel';panelName=name;held.clear();clearWalkTarget();syncTouchControls();let content='',heading={bag:'🎒 Satchel',quests:'📜 Quest Journal',map:'🗺 World Map',skills:'✦ Apprentice Skill Tree',settings:'⚙ Game Settings',pause:'Ⅱ Paused',ending:'✦ Chapter Complete',seedShop:'🌱 Juniper’s Moonleaf Seeds'}[name]||name;
 if(name==='bag'){content=`<p>Carry your findings. Your garden is your main source of future riches.</p><div class="entry">🌱 <strong>Moonleaf seeds:</strong> ${state.seeds}<br>🌼 <strong>Moonleaf harvested:</strong> ${state.harvest}<br>🪙 <strong>Coins:</strong> ${state.coins}<br>🪄 <strong>Glimmer wand:</strong> ${state.wand?'Equipped! B casts light':'Locked until the final quest.'}<br>✨ <strong>Apprentice XP:</strong> ${state.xp}</div><p class="tiny">Plant seeds with Z while facing an empty brown garden bed (touchscreen: A).</p>`}
 else if(name==='seedShop'){content=`<p>Juniper has a fresh harvest of magical seeds. Choose a purchase or press Close to keep exploring.</p><div class="entry">🪙 <strong>Your coins: ${state.coins}</strong> · 🌱 Seeds in bag: ${state.seeds}</div><div class="stack"><button class="primary" data-buy="one" ${state.coins<3?'disabled':''}>🌱 Buy 1 Moonleaf seed · 3 coins</button><button class="primary" data-buy="three" ${state.coins<8?'disabled':''}>🌿 Buy 3 Moonleaf seeds · 8 coins</button><button class="secondary" data-command="close">Done shopping</button></div><p class="tiny">You can collect seed satchels in the grove or earn more coins by harvesting Moonleaf.</p>`}
 else if(name==='quests'){content='<p>Your quest log keeps track of the little things that become big things.</p>'+QUESTS.map((q,i)=>`<div class="entry ${i<state.quest?'done':i===state.quest?'activeQuest':''}">${i<state.quest?'✓':i===state.quest?'❗ ACTIVE QUEST':'🔒'} <strong>${htmlEsc(q[0])}</strong><br>${htmlEsc(q[1])}${i===state.quest?'<br><em>'+htmlEsc(q[2])+'</em>':''}</div>`).join('')}
 else if(name==='map'){content=`<p>Discover locations at your own pace. New places will be added as the story grows.</p><div class="entry">🏡 <strong>The Green Patch</strong> ${state.scene==='farm'?'(You are here)':''}<br>↳ Your cottage and Moonleaf beds</div><div class="entry">🏘 <strong>Mosswick Village</strong> ${state.discovered.includes('town')?'✓ discovered':'◇ not visited'}<br>↳ Seed shop, bakery, friendly villagers</div><div class="entry">🌲 <strong>Starlit Woods</strong> 🔒 Later chapter<br>↳ A forest full of unusual seeds</div><div class="entry">🔮 <strong>Wizard Academy</strong> 🔒 Later chapter<br>↳ Where advanced magic is taught</div>`}
 else if(name==='skills'){const skillInfo=[['green','🌿 Rootcraft','Watering restores additional plant health; every third morning watered plants grow faster.'],['light','✧ Lightcraft','Light projectiles reach farther before disappearing.'],['find','👣 Wayfinding','Gain an extra seed from each harvest and two extra seeds from future satchels.']];content=`<p>Available skill points: <strong>${state.skillPoints}</strong>. Earn points by finishing apprenticeship milestones.</p>`+skillInfo.map(([id,n,d])=>`<div class="entry"><strong>${n}</strong> · ${state.skills[id]?'UNLOCKED':'LOCKED'}<br>${d}<br><button class="secondary" data-skill="${id}" ${state.skills[id]||!state.skillPoints?'disabled':''}>${state.skills[id]?'Learned':'Learn · 1 point'}</button></div>`).join('')}
 else if(name==='settings'){content=`<p>All progress is saved on this device when browser storage is available.</p><div class="settingsGroup"><strong>🔊 Spoken dialogue and instructions</strong><label><input type="checkbox" data-setting="narration" ${state.settings.narration?'checked':''} ${canSpeak()?'':'disabled'}> Read dialogue and tutorials aloud (default off)</label><label><input type="checkbox" data-setting="narrateQuests" ${state.settings.narrateQuests?'checked':''}> Automatically read new quest instructions</label><label class="volumeLabel">Speaking speed <input type="range" min="65" max="130" step="5" data-volume="voiceRate" value="${Math.round((state.settings.voiceRate??.9)*100)}" aria-label="Speaking speed"><span id="voiceRateReadout">${Math.round((state.settings.voiceRate??.9)*100)}%</span></label><div class="speechButtons"><button class="secondary" data-command="readQuest" ${canSpeak()?'':'disabled'}>🔊 Read current quest</button><button class="secondary" data-command="testVoice" ${canSpeak()?'':'disabled'}>▶ Test voice</button><button class="secondary" data-command="stopVoice">■ Stop</button></div><p class="tiny">${canSpeak()?'Uses built-in device voices. No account, API key or uploads required.':'This browser does not expose speech synthesis. Written dialogue still works.'} On mobile, audio may require a tap.</p></div><div class="line"></div><label><input type="checkbox" data-setting="questMarkers" ${state.settings.questMarkers?'checked':''}> Show bright in-world quest markers and directions</label><label><input type="checkbox" data-setting="music" ${state.settings.music?'checked':''}> Play sleepy lo-fi garden music</label><label class="volumeLabel">Music volume <input type="range" min="0" max="100" step="5" data-volume="musicVolume" value="${Math.round((state.settings.musicVolume??.38)*100)}" aria-label="Music volume"><span id="musicVolumeReadout">${Math.round((state.settings.musicVolume??.38)*100)}%</span></label><label><input type="checkbox" data-setting="sfx" ${state.settings.sfx?'checked':''}> Play retro sound effects</label><label><input type="checkbox" data-setting="pixelArt" ${state.settings.pixelArt?'checked':''}> Use original PNG pixel artwork</label><label><input type="checkbox" data-setting="night" ${state.settings.night?'checked':''}> Evening colour palette</label><label><input type="checkbox" data-setting="showTouch" ${state.settings.showTouch?'checked':''}> Show on-screen touch controls</label><div class="line"></div><div class="stack"><button class="primary" data-command="save">Save progress now</button><button class="secondary" data-command="reset">Reset adventure</button></div><p class="artInfo">Complete art assets are bundled locally. Disable PNG pixel artwork above to compare the debug geometry.</p><p class="tiny">Offline mode: the game itself needs no network connection. Mobile browsers may restrict file:// access, so use a local Wi-Fi server when testing on phones or tablets.</p>`}
 else if(name==='pause'){content=`<p>The world is waiting. Rest here as long as you need.</p><div class="stack"><button class="primary" data-command="resume">Continue exploring</button><button class="secondary" data-command="save">Save game</button><button class="secondary" data-command="title">Return to title</button></div>`}
 else if(name==='ending'){content=`<p><strong>Congratulations, apprentice!</strong> You completed the opening chapter and earned the Glimmer Wand.</p><div class="entry">✦ 8 quests explored<br>🪄 Light spell unlocked<br>🌱 Garden and crop lifecycle available<br>🏘 Cottage and village ready to explore</div><p><strong>Keep playing:</strong> press X to cast (touch B), sleep in your bed to grow Moonleaf, harvest mature plants, buy seeds from Pip and spend your skill points.</p><p class="tiny">In the full game, your next destination will be Starlit Woods and the Wizard Academy.</p>`}
 setOverlay(`<div class="panelBox" role="dialog" aria-label="${heading}"><div class="toprow"><h2>${heading}</h2><button class="secondary" data-command="close">✕</button></div>${content}</div>`);syncTouchControls()}
function press(action){if(action==='interact')interact();else if(action==='cast')cast();else if(action==='jump')jump();else if(action==='crouch'){} }
function keyDown(e){const k=e.key.toLowerCase();let d=({w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'})[k];if(d){e.preventDefault();clearWalkTarget();held.add(d);if(!e.repeat){move(...dirs[d]);lastStep=performance.now()}return}if([' ','enter','z','x','backspace','escape','i','q','m','k','c'].includes(k))e.preventDefault();if(k==='c')held.add('crouch');if(e.repeat)return;if(k==='z'||k==='enter')press('interact');else if(k==='x'||k==='backspace')press('cast');else if(k===' ')press('jump');else if(k==='escape'){if(mode==='panel')closeOverlay();else if(mode==='dialog')nextLine();else if(mode==='game')openPanel('pause')}else if(k==='i')openPanel('bag');else if(k==='q')openPanel('quests');else if(k==='m')openPanel('map');else if(k==='k')openPanel('skills')}
function keyUp(e){const k=e.key.toLowerCase();let d=({w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'})[k];if(d)held.delete(d);if(k==='c')held.delete('crouch')}
window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>held.clear());
const touchHeld=new Map();document.addEventListener('pointerdown',e=>{let btn=e.target.closest('[data-hold]');if(!btn)return;e.preventDefault();let v=btn.dataset.hold;clearWalkTarget();held.add(v);btn.classList.add('held');touchHeld.set(e.pointerId,{btn,v});try{btn.setPointerCapture(e.pointerId)}catch(_){}if(dirs[v]){move(...dirs[v]);lastStep=performance.now()}},{passive:false});function upPointer(e){let entry=touchHeld.get(e.pointerId);if(!entry)return;entry.btn.classList.remove('held');held.delete(entry.v);touchHeld.delete(e.pointerId)}document.addEventListener('pointerup',upPointer);document.addEventListener('pointercancel',upPointer);
document.addEventListener('change',e=>{let setting=e.target&&e.target.dataset&&e.target.dataset.setting;if(!setting)return;state.settings[setting]=!!e.target.checked;if(setting==='music')startMusic();if(setting==='narration'){try{localStorage.setItem('ww-voice-enabled',String(state.settings.narration))}catch(_){}if(state.settings.narration)speakText('Narration enabled. Your game dialogue and quest instructions can now be read aloud.',true);else stopSpeech()}syncTouchControls();save();updateSide()});
document.addEventListener('input',e=>{const vol=e.target?.dataset?.volume;if(vol==='musicVolume'){state.settings.musicVolume=Number(e.target.value)/100;if(bgm)bgm.volume=state.settings.musicVolume;const n=$('musicVolumeReadout');if(n)n.textContent=e.target.value+'%';}else if(vol==='voiceRate'){state.settings.voiceRate=Number(e.target.value)/100;const n=$('voiceRateReadout');if(n)n.textContent=e.target.value+'%';}});
document.addEventListener('change',e=>{if(['musicVolume','voiceRate'].includes(e.target?.dataset?.volume))save();});
document.addEventListener('click',e=>{let btn=e.target.closest('button[data-start],button[data-panel],button[data-act],button[data-command],button[data-skill],button[data-buy]');if(!btn)return;if(btn.dataset.command==='toggleNarration'){state.settings.narration=!state.settings.narration;try{localStorage.setItem('ww-voice-enabled',String(state.settings.narration))}catch(_){}if(state.settings.narration)speakText('Narration is on. I will read the story as you play.',true);else stopSpeech();titleMarkup=titleMarkup.replace(/Narration (ON|OFF)/g,'Narration '+(state.settings.narration?'ON':'OFF'));$('narrationStart').textContent='🔊 Narration '+(state.settings.narration?'ON':'OFF');return}if(btn.dataset.buy){const quantity=btn.dataset.buy==='three'?3:1,cost=quantity===3?8:3;if(mode==='panel'&&panelName==='seedShop'&&state.coins>=cost){state.coins-=cost;state.seeds+=quantity;sound('purchase');save();updateSide();openPanel('seedShop');notify('Purchased '+quantity+' Moonleaf seed'+(quantity===1?'':'s')+'!')}return}if(btn.dataset.start){begin(btn.dataset.start==='continue');return}if(btn.dataset.panel){openPanel(btn.dataset.panel);return}if(btn.dataset.act){press(btn.dataset.act);return}if(btn.dataset.skill){let s=btn.dataset.skill;if(state.skillPoints>0&&!state.skills[s]){state.skills[s]=1;state.skillPoints--;sound('quest');save();openPanel('skills');updateSide()}return}if(btn.dataset.command){let c=btn.dataset.command;if(c==='readQuest'){speakQuest(true);return}if(c==='testVoice'){speakText('Hello apprentice. This is your magical garden. Follow the golden exclamation mark to find your next quest.',true);return}if(c==='stopVoice'){stopSpeech();return}if(c==='close'||c==='resume')closeOverlay();if(c==='save'){let ok=save();notify(ok?'Game saved!':'Storage blocked by browser. Try local server.');closeOverlay()}if(c==='title'){save();title()}if(c==='reset'){if(confirm('Start over? This will erase your local save.')){try{localStorage.removeItem(SAVE)}catch(_){}state=fresh();title()}}return}});
$('dialog').addEventListener('click',()=>nextLine());$('dialog').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nextLine()}});canvas.addEventListener('pointerup',e=>{if(mode!=='game')return;
 const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top,scaleX=W/b.width,scaleY=H/b.height;
 const m=world[state.scene];let camX=Math.max(0,Math.min(m.w*T-W,state.x*T+T/2-W/2)),camY=Math.max(0,Math.min(m.h*T-H,state.y*T+T/2-H/2));
 if(m.w*T<W)camX=-(W-m.w*T)/2;if(m.h*T<H)camY=-(H-m.h*T)/2;
 const wx=Math.floor((x*scaleX+camX)/T),wy=Math.floor((y*scaleY+camY)/T);
 tapPathTo(wx,wy);
});
function frameLoop(ts){let dt=Math.min(40,ts-prev||16);prev=ts;update(dt,ts);render(ts);requestAnimationFrame(frameLoop)}
updateSide();title();requestAnimationFrame(frameLoop);
})();
