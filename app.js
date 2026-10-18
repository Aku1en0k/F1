// Очки после Гран-при Сингапура (17 этапов). Источник: crash.net, 11.10.2026
const TEAM={MER:"#00a19b",FER:"#dc0000",RBR:"#1e41ff",MCL:"#ff8000",RB:"#6692ff",ALP:"#ff87bc",HAA:"#8a8f98",AUD:"#9b1c1c",AST:"#00665e",WIL:"#005aff",CAD:"#555"};
const BASE=[["antonelli","Антонелли","MER",340],["russell","Расселл","MER",238],["hamilton","Хэмилтон","FER",229],["verstappen","Ферстаппен","RBR",221],["leclerc","Леклер","FER",215],["norris","Норрис","MCL",201],["piastri","Пиастри","MCL",138],["hadjar","Хаджар","RBR",97],["lawson","Лоусон","RB",75],["gasly","Гасли","ALP",41],["lindblad","Линдблад","RB",38],["colapinto","Колапинто","ALP",27],["bearman","Бирман","HAA",23],["hulkenberg","Хюлькенберг","AUD",13],["bortoleto","Бортолето","AUD",10],["ocon","Окон","HAA",7],["alonso","Алонсо","AST",7],["sainz","Сайнс","WIL",7],["albon","Албон","WIL",5],["tsunoda","Цунода","RB",1],["stroll","Стролл","AST",0],["bottas","Боттас","CAD",0],["perez","Перес","CAD",0]];
const RACE=[25,18,15,12,10,8,6,4,2,1], SPR=[8,7,6,5,4,3,2,1];
let D=BASE.map(d=>({k:d[0],n:d[1],t:d[2],p:d[3]}));
const $=id=>document.getElementById(id), num=(id)=>Math.max(0,+$(id).value||0);

function mkScale(id,arr){$(id).innerHTML=arr.map((v,i)=>`<input type="number" min="0" value="${v}" title="Место ${i+1}" aria-label="Место ${i+1}">`).join("");$(id).oninput=calc}
const scale=id=>[...$(id).querySelectorAll("input")].map(i=>Math.max(0,+i.value||0));

function simulate(race,spr,nGP,nSP,done,dnf,alpha){
  const N=20000,m=D.length,w=D.map(d=>alpha*Math.log(d.p/done+0.5)),win=new Array(m).fill(0),idx=[...Array(m).keys()],key=new Array(m);
  const draw=(pts)=>{for(let i=0;i<m;i++)key[i]=Math.random()<dnf?-1e9:w[i]-Math.log(-Math.log(Math.random()));return idx.slice().sort((a,b)=>key[b]-key[a]).map((d,pos)=>key[d]<-1e8?[d,0]:[d,pts[pos]||0])};
  for(let s=0;s<N;s++){
    const tot=D.map(d=>d.p);
    for(let g=0;g<nGP;g++){draw(race).forEach(([d,v])=>tot[d]+=v);if(g<nSP)draw(spr).forEach(([d,v])=>tot[d]+=v)}
    let b=0;for(let i=1;i<m;i++)if(tot[i]>tot[b])b=i;win[b]++;
  }
  return win.map(x=>x/N);
}

function calc(){
  const race=scale("raceScale"),spr=scale("sprintScale"),nGP=num("nGP"),nSP=Math.min(num("nSP"),nGP),done=Math.max(1,num("done"));
  $("alphaOut").textContent=(+$("alpha").value).toString().replace(".",",");
  const R=nGP*race[0]+nSP*spr[0];
  D.sort((a,b)=>b.p-a.p);
  const L=D[0],S=D[1],pr=simulate(race,spr,nGP,nSP,done,num("dnf")/100,+$("alpha").value);
  const pc=x=>x>0.999?"&gt;99,9%":x<0.001?"&lt;0,1%":(x*100).toFixed(1).replace(".",",")+"%";
  const prob=Object.fromEntries(D.map((d,i)=>[d.k,pr[i]]));
  window.LAST={prob:null};
  const alive=D.filter(d=>d.p+R>=L.p),clinched=L.p-S.p>R;
  window.LAST={prob,L:L.p,R};
  const top=D.slice(0,10),scaleMax=Math.max(...top.map(d=>d.p+R));
  $("verdict").textContent=clinched?`${L.n} уже математически чемпион: отрыв ${L.p-S.p} очков больше, чем осталось разыграть (${R}).`
    :`${L.n} лидирует с ${L.p} очками. Математически за титул борются ${alive.length} пилотов, вероятность титула у лидера — ${pc(prob[L.k]).replace("&gt;",">").replace("&lt;","<")}.`;
  $("board").innerHTML=top.map((d,i)=>{const out=d.p+R<L.p;return `<div class="row${out?" out":""}" style="--c:${TEAM[d.t]}">
    <div class="name">${i+1}. ${d.n}<small>${out?"вне борьбы":"максимум "+(d.p+R)}</small></div>
    <div class="gauge"><div class="max" style="width:${(d.p+R)/scaleMax*100}%"></div><div class="cur" style="width:${d.p/scaleMax*100}%"></div><div class="lead" style="left:${L.p/scaleMax*100}%"></div></div>
    <input type="number" min="0" value="${d.p}" data-k="${d.k}" aria-label="Очки: ${d.n}">
    <div class="prob">${pc(prob[d.k])}</div></div>`}).join("");
  document.querySelectorAll(".row input").forEach(inp=>inp.onchange=()=>{D.find(d=>d.k===inp.dataset.k).p=+inp.value||0;calc()});
  const wk=race[0]+(nSP>0?spr[0]:0),Rn=Math.max(0,R-wk);
  const rivals=alive.filter(d=>d!==L&&!clinched).map(d=>{const need=Rn-(L.p-d.p)+1;return `<li>${d.n}: обогнать его за этап минимум на <b>${Math.max(need,1)}</b> очк.${need>wk?" Это невозможно: максимум "+wk+".":""}</li>`}).join("");
  $("math").innerHTML=`
  <p><b>1. Сколько очков осталось.</b> <code>R = ${nGP}·${race[0]} + ${nSP}·${spr[0]} = ${R}</code> (гонок × очки за победу + спринтов × очки за победу в спринте).</p>
  <p><b>2. Кто ещё в игре.</b> Пилот может стать чемпионом, если <code>Pᵢ + R ≥ P лидера</code>, то есть набрал бы ${L.p} или больше. В игре: ${alive.map(d=>d.n+" ("+(d.p+R)+")").join(", ")}. При равенстве очков решает число побед.</p>
  <p><b>3. Досрочный титул лидера.</b> Лидер чемпион, если <code>P₁ − P₂ &gt; R</code>. Сейчас <code>${L.p} − ${S.p} = ${L.p-S.p}</code>, а R = ${R}: ${clinched?"условие выполнено.":"условие не выполнено."}</p>
  ${clinched?"":`<p><b>4. Титул в ближайшей гонке.</b> Максимум за этап — ${wk}, значит после него останется ${Rn}. Лидеру нужно обойти соперника по очкам за этап так, чтобы <code>(P₁ − Pᵢ) + разница &gt; ${Rn}</code>:</p><ul>${rivals}</ul>`}
  <p><b>5. Вероятность.</b> Это симуляция Монте-Карло, 20 000 сезонов. Вес пилота <code>wᵢ = (очки за этап + 0,5)^α</code>, где α — «влияние формы». Порядок финиша строится как в модели Плакетта — Льюса: вероятность первого места <code>wᵢ / Σw</code>. Каждый пилот с вероятностью ${num("dnf")}% сходит и получает 0. Очки считаются по вашей шкале. Вероятность — доля сезонов, где пилот набрал больше всех. Это модель по текущей форме, а не прогноз букмекеров.</p>`;
}

async function live(){
  const st=$("status");st.textContent="Загружаю…";
  try{
    const a=await (await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json")).json();
    const lst=a.MRData.StandingsTable.StandingsLists[0],round=+lst.round,norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    lst.DriverStandings.forEach(x=>{const d=D.find(d=>norm(x.Driver.familyName).includes(d.k));if(d)d.p=+x.points});
    $("done").value=round;
    const b=await (await fetch("https://api.jolpi.ca/ergast/f1/current.json?limit=40")).json();
    const rest=b.MRData.RaceTable.Races.filter(r=>+r.round>round);
    $("nGP").value=rest.length;$("nSP").value=rest.filter(r=>r.Sprint).length;
    st.textContent=`Загружено: очки после этапа ${round}, осталось гонок: ${rest.length}.`;
  }catch(e){st.textContent="Не удалось загрузить данные (сайт недоступен). Остаются очки после Гран-при Сингапура."}
  calc();
}
function reset(){D=BASE.map(d=>({k:d[0],n:d[1],t:d[2],p:d[3]}));mkScale("raceScale",RACE);mkScale("sprintScale",SPR);$("nGP").value=6;$("nSP").value=0;$("done").value=17;$("dnf").value=8;$("alpha").value=2.2;$("status").textContent="";calc()}
["nGP","nSP","done","dnf","alpha"].forEach(id=>$(id).oninput=calc);
$("live").onclick=live;$("reset").onclick=reset;reset();

// Фото, карточки и окно сезона
const PIL={antonelli:["Kimi_Antonelli","antonelli"],russell:["George_Russell_(racing_driver)","russell"],hamilton:["Lewis_Hamilton","hamilton"],verstappen:["Max_Verstappen","max_verstappen"],leclerc:["Charles_Leclerc","leclerc"],norris:["Lando_Norris","norris"],piastri:["Oscar_Piastri","piastri"],hadjar:["Isack_Hadjar","hadjar"],lawson:["Liam_Lawson","lawson"],gasly:["Pierre_Gasly","gasly"],lindblad:["Arvid_Lindblad","lindblad"],colapinto:["Franco_Colapinto","colapinto"],bearman:["Oliver_Bearman","bearman"],hulkenberg:["Nico_Hülkenberg","hulkenberg"],bortoleto:["Gabriel_Bortoleto","bortoleto"],ocon:["Esteban_Ocon","ocon"],alonso:["Fernando_Alonso","alonso"],sainz:["Carlos_Sainz_Jr.","sainz"],albon:["Alexander_Albon","albon"],tsunoda:["Yuki_Tsunoda","tsunoda"],stroll:["Lance_Stroll","stroll"],bottas:["Valtteri_Bottas","bottas"],perez:["Sergio_Pérez","perez"]};
const WC={};
const wiki=k=>WC[k]||(WC[k]=fetch("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(PIL[k][0])).then(r=>r.json()).catch(()=>({})));
const ini=n=>n.slice(0,2);
$("cards").innerHTML=BASE.map(d=>`<button type="button" class="card" data-k="${d[0]}" style="--c:${TEAM[d[2]]}" aria-label="${d[1]}: данные сезона"><div class="ph" id="ph-${d[0]}">${ini(d[1])}</div><b>${d[1]}</b><small>${d[2]}</small></button>`).join("");
BASE.forEach(d=>wiki(d[0]).then(w=>{const u=w.thumbnail&&w.thumbnail.source;if(u)$("ph-"+d[0]).innerHTML=`<img src="${u}" alt="Фото: ${d[1]}" loading="lazy">`}));
const dlg=$("dlg"),yrSel=$("yr");let cur=null;
yrSel.innerHTML=Array.from({length:77},(_,i)=>2026-i).map(y=>`<option>${y}</option>`).join("");
$("cards").onclick=e=>{const b=e.target.closest(".card");if(!b)return;cur=b.dataset.k;const d=D.find(x=>x.k===cur);
  $("dName").textContent=d.n;$("dTeam").textContent="Команда в 2026: "+d.t;$("dImg").src="";$("dImg").alt="Фото: "+d.n;$("bio").textContent="";yrSel.value=2026;dlg.showModal();show();
  wiki(cur).then(w=>{if(cur!==b.dataset.k)return;if(w.thumbnail)$("dImg").src=w.thumbnail.source;$("bio").textContent=w.extract?"Википедия (англ.): "+w.extract:""})};
$("dClose").onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg)dlg.close()};yrSel.onchange=show;
async function show(){
  const y=+yrSel.value,st=$("stat"),d=D.find(x=>x.k===cur),k=cur;
  if(y===2026){const pos=D.indexOf(d)+1,p=window.LAST&&window.LAST.prob[k],f=x=>x>0.999?">99,9%":x<0.001?"<0,1%":(x*100).toFixed(1).replace(".",",")+"%";
    st.textContent=`2026 (идёт): ${pos}-е место, ${d.p} очков, отставание от лидера ${D[0].p-d.p}. Шанс на титул по модели: ${f(p||0)}.`;return}
  st.textContent="Загружаю…";
  try{const j=await (await fetch(`https://api.jolpi.ca/ergast/f1/${y}/drivers/${PIL[k][1]}/driverStandings.json`)).json();
    if(k!==cur||y!==+yrSel.value)return;const s=j.MRData.StandingsTable.StandingsLists[0];
    if(!s){st.textContent=`В ${y} году ${d.n} не участвовал в чемпионате.`;return}
    const r=s.DriverStandings[0];st.textContent=`${y}: ${r.positionText}-е место, ${r.points} очков, побед: ${r.wins}, команда: ${r.Constructors.map(c=>c.name).join(", ")}.`;
  }catch(e){st.textContent="Не удалось загрузить данные сезона (архив недоступен)."}
}
