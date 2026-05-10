const suits=["♠","♥","♣","♦"], ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const handRanking=[["皇家同花顺",100,8],["同花顺",90,7],["四条",75,6],["葫芦",60,5],["同花",45,4],["顺子",40,4],["三条",30,3],["两对",20,2],["一对",10,2],["高牌",5,1]];
const jokersPool=[
  {name:"糖果小丑",text:"每次得分 +20 筹码",apply:s=>({...s,chips:s.chips+20})},
  {name:"彩虹小丑",text:"倍率 x1.5（向下取整）",apply:s=>({...s,mult:Math.floor(s.mult*1.5)})},
  {name:"爱心小丑",text:"含♥时 +30筹码",apply:(s,c)=>c.some(x=>x.suit==="♥")?({...s,chips:s.chips+30}):s},
  {name:"星星小丑",text:"同花时 倍率+2",apply:(s,_,n)=>n.includes("同花")?({...s,mult:s.mult+2}):s}
];
let state={};
const id=x=>document.getElementById(x);

function init(){state={round:1,score:0,target:300,handsLeft:4,discardsLeft:3,deck:shuffle(makeDeck()),hand:[],selected:new Set(),jokers:shuffle([...jokersPool]).slice(0,2)};drawToEight();say("选 1~5 张牌后点击【出牌】","准备开冲 ✨");render();}
function makeDeck(){return suits.flatMap(s=>ranks.map((r,i)=>({suit:s,rank:r,value:i+1,id:crypto.randomUUID()})));}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}
function drawToEight(){while(state.hand.length<8&&state.deck.length)state.hand.push(state.deck.pop())}
function evalHand(cards){const vals=cards.map(c=>c.value===1?14:c.value).sort((a,b)=>a-b), flush=new Set(cards.map(c=>c.suit)).size===1, counts=Object.values(cards.reduce((m,c)=>(m[c.rank]=(m[c.rank]||0)+1,m),{})).sort((a,b)=>b-a), unique=[...new Set(vals)], straight=unique.length===cards.length&&((unique.at(-1)-unique[0]===cards.length-1)||JSON.stringify(unique)==='[2,3,4,5,14]'); if(flush&&JSON.stringify(vals)==='[10,11,12,13,14]')return handRanking[0]; if(flush&&straight)return handRanking[1]; if(counts[0]===4)return handRanking[2]; if(counts[0]===3&&counts[1]===2)return handRanking[3]; if(flush)return handRanking[4]; if(straight)return handRanking[5]; if(counts[0]===3)return handRanking[6]; if(counts[0]===2&&counts[1]===2)return handRanking[7]; if(counts[0]===2)return handRanking[8]; return handRanking[9];}
function removeSelected(){state.hand=state.hand.filter((_,i)=>!state.selected.has(i));state.selected.clear()}

function play(){const pick=[...state.selected].map(i=>state.hand[i]); if(pick.length<1||pick.length>5)return say("请选 1~5 张牌","最多一次出 5 张"); const [name,cb,mb]=evalHand(pick); let s={chips:cb+pick.reduce((a,c)=>a+Math.min(c.value,10),0),mult:mb}; state.jokers.forEach(j=>s=j.apply(s,pick,name)); const got=s.chips*s.mult; state.score+=got; state.handsLeft--; removeSelected(); drawToEight(); say(`打出【${name}】 +${got}分`,`筹码 ${s.chips} × 倍率 ${s.mult}`); chipFx(`+${got}`); nextIfNeeded(); render();}
function discard(){if(state.discardsLeft<=0)return say("弃牌次数不足","请改为出牌"); if(!state.selected.size)return say("请先选牌再弃",""); state.discardsLeft--; removeSelected(); drawToEight(); say("已弃牌并补牌","继续找强牌型！"); render();}
function nextIfNeeded(){if(state.score>=state.target){state.round++;state.target=Math.floor(state.target*1.6);state.handsLeft=4;state.discardsLeft=3;state.deck=shuffle(makeDeck());state.hand=[];drawToEight();say("过关！进入下一盲注","目标提高，冲呀！")} else if(state.handsLeft<=0){say("本轮失败，自动重开","再来一把"); init();}}
function chipFx(text){id("chipFx").textContent=text;setTimeout(()=>id("chipFx").textContent="",700)}
function say(m,d){id("message").textContent=m;id("lastPlay").textContent=d}
function render(){id("round").textContent=state.round;id("target").textContent=state.target;id("score").textContent=state.score;id("handsLeft").textContent=state.handsLeft;id("discardsLeft").textContent=state.discardsLeft;id("deckLeft").textContent=state.deck.length;id("jokers").innerHTML=state.jokers.map(j=>`<div class='joker'><b>${j.name}</b><p>${j.text}</p></div>`).join("");id("hand").innerHTML="";state.hand.forEach((c,i)=>{const e=document.createElement("div");e.className=`card ${(c.suit==="♥"||c.suit==="♦")?"red":""} ${state.selected.has(i)?"selected":""}`;e.innerHTML=`<div class='value'>${c.rank}</div><div class='suit'>${c.suit}</div><div>${c.rank}${c.suit}</div>`;e.onclick=()=>{state.selected.has(i)?state.selected.delete(i):state.selected.add(i);render()};id("hand").appendChild(e);});}

id("playBtn").onclick=play; id("discardBtn").onclick=discard; id("newRunBtn").onclick=init; init();
