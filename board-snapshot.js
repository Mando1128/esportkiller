// Transcribed from the visible PrizePicks League board. Never a live API response.
window.PRIZEPICKS_BOARD_SNAPSHOT = (() => {
  const projections=[];
  function add(team,opponent,time,maps,entries,combo=false){
    for(const entry of entries.split(';')){
      const [player,value,variant='standard']=entry.split(':');
      projections.push({id:`snapshot-${projections.length}`,player,team,match:`${team} vs ${opponent} · ${time} (board time)`,line:Number(value),market:`MAPS 1-${maps} Kills${combo?' (Combo)':''}`,variant,allowedWagers:variant==='standard'?['under','over']:['over']});
    }
  }
  add('IG','TES','Fri 11:00pm',3,'TheShy:8;Wei:10;Rookie:10.5;JiaQi:12.5;Meiko:2.5:demon');
  add('TES','IG','Fri 11:00pm',3,'ZUIAN:9;Tian:10.5;Creme:11.5;JackeyLove:14.5;Zhuo:2.5:demon');
  add('GEN','HLE','Sat 1:00am',3,'Kiin:9.5;Canyon:9;Chovy:11.5;Ruler:14.5;Duro:2.5:demon');
  add('HLE','GEN','Sat 1:00am',3,'Zeus:8;Kanavi:9;Zeka:10.5;Gumayusi:10;Delight:1.5:goblin');
  add('JDG','NIP','Sat 2:00am',3,'Xiaoxu:8.5;JunJia:9.5;HongQ:12.5;GALA:13.5;Vampire:2.5:demon');
  add('NIP','JDG','Sat 2:00am',3,'Hoya:8;Guwon:9.5;Care:10.5;Photic:12;fengyue:2.5:demon');
  add('VIT','G2','Sat 3:00am',3,'Naak Nako:8;Lyncas:7;FIESTA:9.5;Carzzy:11;Fleshy:1.5');
  add('G2','VIT','Sat 3:00am',3,'BrokenBlade:8.5;SkewMond:10;Caps:13;Hans Sama:13.5;Labrov:2');
  add('KC','GX','Sat 8:00am',3,'Canna:10;Yike:13;kyeahoo:10.5;Caliste:16.5;Busio:2.5');
  add('GX','KC','Sat 8:00am',3,'Oscarinin:5.5;Isma:6.5;Jackies:8;Flakked:9;Jun:1.5:demon');
  add('C9','SEN','Sat 1:00pm',2,'Thanatos:5;Blaber:5.5;Loki:8;Tactical:8;Vulcan:1.5:demon');
  add('SEN','C9','Sat 1:00pm',2,'Impact:4;HamBak:5.5;DARKWINGS:5;Rahel:6.5;Huhi:1.5:demon');
  add('TL','DIG','Sat 4:00pm',2,'Morgan:5.5;Josedeodo:7.5;Quid:9.5;Yeon:10.5;CoreJJ:1.5:demon');
  add('DIG','TL','Sat 4:00pm',2,'Denathor:3.5;Dardoch:3.5;Palafox:4;FBI:4.5;IgNar:1.5:demon');
  add('IG','TES','Fri 11:00pm',3,'Theshy + Wei + Rookie:28.5;Rookie + JiaQi:23.5',true);
  add('TES','IG','Fri 11:00pm',3,'ZUIAN + Tian + Creme:31.5;Creme + JackeyLove:26.5',true);
  add('GEN','HLE','Sat 1:00am',3,'Kiin + Canyon + Chovy:30.5;Chovy + Ruler:26.5',true);
  add('HLE','GEN','Sat 1:00am',3,'Zeus + Kanavi + Zeka:27.5;Zeka + Gumayusi:21.5',true);
  add('JDG','NIP','Sat 2:00am',3,'Xiaoxu + JunJia + HongQ:30.5;HongQ + GALA:26.5',true);
  add('NIP','JDG','Sat 2:00am',3,'Hoya + Guwon + Care:27.5;Care + Photic:22.5',true);
  add('VIT','G2','Sat 3:00am',3,'Naak Nako + Lyncas + FIESTA:25.5;FIESTA + Carzzy:21',true);
  add('G2','VIT','Sat 3:00am',3,'BrokenBlade + SkewMond + Caps:33.5;Caps + Hans Sama:25.5',true);
  add('KC','GX','Sat 8:00am',3,'Canna + Yike + kyeahoo:36;kyeahoo + Caliste:28.5',true);
  add('GX','KC','Sat 8:00am',3,'Oscarinin + Isma + Jackies:20;Jackies + Flakked:17.5',true);
  add('C9','SEN','Sat 1:00pm',2,'Thanatos + Blaber + Loki:19.5;Loki + Tactical:17',true);
  add('SEN','C9','Sat 1:00pm',2,'Impact + HamBak + DARKWINGS:15.5;DARKWINGS + Rahel:12.5',true);
  add('TL','DIG','Sat 4:00pm',2,'Morgan + Josedeodo + Quid:23.5;Quid + Yeon:21',true);
  return {source:'PrizePicks board snapshot',fetchedAt:'2026-09-05T01:45:00Z',manual:true,stale:true,projections};
})();
