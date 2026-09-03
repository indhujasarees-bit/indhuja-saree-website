const C=window.INDHUJA_CONFIG, fallback=[
["Kanchipuram Silk","24+ Sarees","../assets/saree-01.jpg"],["Soft Silk","35+ Sarees","../assets/saree-02.jpg"],["Cotton Sarees","25+ Sarees","../assets/saree-03.jpg"],["Linen Sarees","18+ Sarees","../assets/saree-04.jpg"],["Designer Sarees","30+ Sarees","../assets/saree-05.jpg"],["Bridal Sarees","40+ Sarees","../assets/saree-06.jpg"],["Traditional Sarees","22+ Sarees","../assets/saree-07.jpg"],["Printed Sarees","26+ Sarees","../assets/saree-08.jpg"]];
document.getElementById("wh").href=`https://wa.me/${C.WHATSAPP_NUMBER}`;
function show(items){collectionsGrid.innerHTML=items.map((x,i)=>`<article class="col"><img src="${x.image||x[2]}" alt="${x.name||x[0]}"><div class="ci"><h3>${x.name||x[0]}</h3><div class="count">${x.count||x[1]}</div><a class="view" href="collection.html?collection=${encodeURIComponent(x.name||x[0])}">VIEW COLLECTION →</a></div></article>`).join("")}
async function load(){if(!C.SUPABASE_URL.startsWith("http"))return show(fallback);const db=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY);const {data}=await db.from("products").select("category,image_url");if(!data?.length)return show(fallback);const map={};data.forEach(p=>{if(!map[p.category])map[p.category]={name:p.category,count:0,image:p.image_url};map[p.category].count++});show(Object.values(map).map(x=>({...x,count:x.count+"+ Sarees"})))}load();
const menuBtn=document.getElementById("menu"), nav=document.getElementById("nav");
if(menuBtn && nav){
  menuBtn.addEventListener("click",()=>nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
}

const ig=document.getElementById("ig"), fb=document.getElementById("fb"); if(ig) ig.href=C.INSTAGRAM_URL; if(fb) fb.href=C.FACEBOOK_URL;
