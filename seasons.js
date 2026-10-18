const API="https://api.jolpi.ca/ergast/f1/";
const CH="1950|Фарина|Alfa Romeo;1951|Фанхио|Alfa Romeo;1952|Аскари|Ferrari;1953|Аскари|Ferrari;1954|Фанхио|Maserati / Mercedes;1955|Фанхио|Mercedes;1956|Фанхио|Ferrari;1957|Фанхио|Maserati;1958|Хоторн|Ferrari;1959|Брэбем|Cooper;1960|Брэбем|Cooper;1961|Ф. Хилл|Ferrari;1962|Г. Хилл|BRM;1963|Кларк|Lotus;1964|Сертис|Ferrari;1965|Кларк|Lotus;1966|Брэбем|Brabham;1967|Халм|Brabham;1968|Г. Хилл|Lotus;1969|Стюарт|Matra;1970|Риндт|Lotus;1971|Стюарт|Tyrrell;1972|Фиттипальди|Lotus;1973|Стюарт|Tyrrell;1974|Фиттипальди|McLaren;1975|Лауда|Ferrari;1976|Хант|McLaren;1977|Лауда|Ferrari;1978|Андретти|Lotus;1979|Шектер|Ferrari;1980|Джонс|Williams;1981|Пике|Brabham;1982|Росберг К.|Williams;1983|Пике|Brabham;1984|Лауда|McLaren;1985|Прост|McLaren;1986|Прост|McLaren;1987|Пике|Williams;1988|Сенна|McLaren;1989|Прост|McLaren;1990|Сенна|McLaren;1991|Сенна|McLaren;1992|Мэнселл|Williams;1993|Прост|Williams;1994|Шумахер|Benetton;1995|Шумахер|Benetton;1996|Д. Хилл|Williams;1997|Вильнёв|Williams;1998|Хаккинен|McLaren;1999|Хаккинен|McLaren;2000|Шумахер|Ferrari;2001|Шумахер|Ferrari;2002|Шумахер|Ferrari;2003|Шумахер|Ferrari;2004|Шумахер|Ferrari;2005|Алонсо|Renault;2006|Алонсо|Renault;2007|Райкконен|Ferrari;2008|Хэмилтон|McLaren;2009|Баттон|Brawn;2010|Феттель|Red Bull;2011|Феттель|Red Bull;2012|Феттель|Red Bull;2013|Феттель|Red Bull;2014|Хэмилтон|Mercedes;2015|Хэмилтон|Mercedes;2016|Росберг Н.|Mercedes;2017|Хэмилтон|Mercedes;2018|Хэмилтон|Mercedes;2019|Хэмилтон|Mercedes;2020|Хэмилтон|Mercedes;2021|Ферстаппен|Red Bull;2022|Ферстаппен|Red Bull;2023|Ферстаппен|Red Bull;2024|Ферстаппен|Red Bull;2025|Норрис|McLaren";
const rows=CH.split(";").map(r=>r.split("|")),$=id=>document.getElementById(id),yr=$("yr");
yr.innerHTML=[2026,...rows.map(r=>+r[0]).reverse()].map(y=>`<option>${y}</option>`).join("");
$("champs").innerHTML="<tr><th>Год</th><th>Чемпион</th><th>Команда</th></tr>"+rows.slice().reverse().map(r=>`<tr data-y="${r[0]}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("");
$("champs").onclick=e=>{const t=e.target.closest("tr[data-y]");if(t){yr.value=t.dataset.y;load();scrollTo({top:0,behavior:"smooth"})}};
yr.onchange=load;
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
async function load(){
  const y=yr.value,c=rows.find(r=>r[0]===y);
  $("sInfo").textContent=c?`Чемпион ${y}: ${c[1]} (${c[2]}). Загружаю таблицу…`:`${y}: сезон идёт, чемпион ещё не определён. Загружаю таблицу…`;
  $("sTable").innerHTML="";
  try{
    const [a,b]=await Promise.all([fetch(`${API}${y}/driverStandings.json?limit=100`).then(r=>r.json()),fetch(`${API}${y}.json?limit=40`).then(r=>r.json())]);
    const L=a.MRData.StandingsTable.StandingsLists[0],n=b.MRData.RaceTable.Races.length;
    $("sInfo").textContent=(c?`Чемпион ${y}: ${c[1]} (${c[2]}). `:`${y}: сезон идёт. `)+`Гонок в календаре: ${n}, пилотов в таблице: ${L.DriverStandings.length}.`;
    $("sTable").innerHTML="<tr><th>Место</th><th>Пилот</th><th>Команда</th><th>Победы</th><th>Очки</th></tr>"+L.DriverStandings.map(d=>`<tr><td>${esc(d.positionText)}</td><td>${esc(d.Driver.givenName+" "+d.Driver.familyName)}</td><td>${esc(d.Constructors.map(x=>x.name).join(", "))}</td><td>${d.wins}</td><td>${d.points}</td></tr>`).join("");
  }catch(e){$("sInfo").textContent=(c?`Чемпион ${y}: ${c[1]} (${c[2]}). `:"")+"Не удалось загрузить итоговую таблицу — архив недоступен."}
}
load();
