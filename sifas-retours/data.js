// Données du site Sifas retours (visuels, meubles, personnes)
window.P={
 "EW-0918":["Canapé 3 places Everwood","225 x 85 x 75 cm · modulable (base 150 + 75)"],
 "EW-0950":["Fauteuil Everwood","75 x 85 x 75 cm"],
 "EW-KONIC":["Table basse Konic","80 x 80 cm · H 30 cm · plateau céramique"],
 "EW-0976":["Canapé 2 places Everwood","Dimensions à confirmer"],
 "BC-0766":["Canapé 2 places Siargao bois clair","158 x 72 x 77 cm"],
 "BC-0734":["Fauteuil lounge Siargao bois clair","74 x 68 x 77 cm"],
 "BC-0811":["Table d'appoint en U Siargao bois clair","62 x 40 x 40 cm"],
 "BC-0814":["Table d'appoint en C Siargao bois clair","Petite table d'appoint"],
 "BC-0832":["Table carrée Siargao bois clair","80 x 80 x 75 cm"],
 "BC-0852":["Fauteuil de repas Siargao bois clair","58 x 56 x 86,5 cm"],
 "MK-0730":["Canapé 2 places Siargao Mocka","158 x 72 x 77 cm"],
 "MK-0751":["Fauteuil lounge Siargao Mocka","74 x 68 x 77 cm"],
 "MK-0816":["Table d'appoint en C Siargao Mocka","Petite table d'appoint"],
 "MK-0819":["Table d'appoint en U Siargao Mocka","62 x 40 x 40 cm"],
 "MK-0869-2":["Fauteuil de repas Siargao Mocka","58 x 56 x 86,5 cm"],
 "MK-0894":["Table rectangulaire Siargao Mocka","160 x 92 x 75 cm"]
};
window.COLL={ew:"Everwood",bc:"Siargao bois clair",mk:"Siargao Mocka"};
window.VIBE={provence:"Provence et jardins",piscine:"Bord de piscine",paysage:"Grands paysages",paris:"Paris et toits",eau:"Bord de l'eau"};
window.V=[
 ["ew-mer","ew","piscine","Terrasse face à la mer",["v00"],["EW-0918","EW-0950","EW-KONIC"]],
 ["ew-loggia","ew","piscine","Loggia en pierre",["v01","v02"],["EW-0950","EW-KONIC"]],
 ["ew-pelouse","ew","provence","Jardin provençal",["v04","v07"],["EW-0918","EW-0950"]],
 ["ew-dalle","ew","provence","Canapé sur la dalle",["v06","v05"],["EW-0918","EW-KONIC"]],
 ["ew-oliviers","ew","provence","Dalle parmi les oliviers",["v08"],["EW-0918","EW-KONIC"]],
 ["ew-collines","ew","paysage","Fauteuils face aux collines",["v09"],["EW-0950","EW-KONIC"]],
 ["ew-tomettes","ew","paysage","Terrasse en tomettes au couchant",["v10"],["EW-0918","EW-0950","EW-KONIC"]],
 ["ew-montagnes","ew","paysage","Salon face aux montagnes",["b2v01","b2v02"],["EW-0918","EW-0950","EW-KONIC"]],
 ["ew-canape2","ew","paysage","Canapé 2 places face aux montagnes",["b2v03","b2v04"],["EW-0976"]],
 ["bc-piscine","bc","piscine","Canapé au bord de la piscine",["v14"],["BC-0766","BC-0811"]],
 ["bc-fleurs","bc","provence","Fauteuil dans les massifs",["v11","v13"],["BC-0734","BC-0814"]],
 ["bc-balcon","bc","paris","Balcon parisien",["v15"],["BC-0734","BC-0814"]],
 ["bc-olivier","bc","provence","Repas sous l'olivier",["v16","v19","v12"],["BC-0832","BC-0852"]],
 ["bc-repas-dessus","bc","provence","Repas vu du dessus",["b2v06"],["BC-0832","BC-0852"]],
 ["bc-mer","bc","piscine","Salon face à la mer",["b2v05"],["BC-0766","BC-0734","BC-0811"]],
 ["bc-rooftop-urbain","bc","paris","Rooftop urbain",["b2v08","b2v09"],["BC-0766","BC-0814"]],
 ["mk-lac","mk","eau","Au bord du lac",["v20","v23","v30"],["MK-0751","MK-0816"]],
 ["mk-mur","mk","provence","Salon contre le mur en pierre",["v21"],["MK-0730","MK-0751","MK-0819"]],
 ["mk-mas","mk","provence","Fauteuil devant le mas",["v22"],["MK-0751","MK-0819"]],
 ["mk-treille","mk","provence","Fauteuil sous la treille",["v29"],["MK-0751","MK-0816"]],
 ["mk-pergola","mk","provence","Repas sous la pergola",["b2v07"],["MK-0894","MK-0869-2"]],
 ["mk-cour","mk","paris","Dîner dans la cour",["v25","v26"],["MK-0894","MK-0869-2"]],
 ["mk-toits","mk","paris","Salon sur les toits de Paris",["v27"],["MK-0730","MK-0751","MK-0819"]]
].map(([id,c,v,t,ver,p])=>({id,c,v,t,ver,p}));
window.ISS=[["dim","Dimensions"],["real","Réalisme"],["decor","Décor"],["prod","Fidélité au meuble"]];
window.LET="ABCDEFG";
window.PEOPLE=[["Alex","#2f6fe4"],["Hugo","#f08a24"],["Julien","#8b5cf6"],["Michelle","#e0457b"],["Archi","#e2392b"]];
window.OTHER_COLOR="#0f9d8a";
window.API="https://script.google.com/macros/s/AKfycbylAR3teyJq9_rgDz15uFi9JDdBelEtAu3dnyvWrBq3xypzgfYV4uWFFgrUx7eUFHD5/exec";
