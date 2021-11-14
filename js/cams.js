const APIKEY = "STFOfWPjvnSBzRMakw8wOvfkbJEFEwmI10SgEnbv";
const LIMIT = 500; //max number of webcams to retrieve from nps.gov, currently has 194
function toggleParks() {
    var content = document.getElementById("parks");
    if (content.style.display == "block") {
        content.style.display = "none";
    } 
    else {
        content.style.display = "block";
    }
}

function toggleImages(id) {
    var content = document.getElementById(id);
    if (content.style.display == "block") {
        content.style.display = "none";
    }
    else {
        content.style.display = "block";
    }
}

function addImage(url){
    return `
                <img src="${url}" width = 300 height = 275>
            `;
}

function addListItem(pcode, pname, purl, cams) {
    var item = `<li><a>`  //toggle display of id={pcode}_img
                + `<div class="row">`
                + `<div class="lia" onclick="toggleImages('` + pcode + `_img')"><img src = "caret-down-solid.svg" width=18px height=18px/></div>`
                + `<div class="lia" onclick="window.open('` + purl + `','_blank')">` + pname + `</div></div>` 
                + `<block class="images" id="` + pcode + `_img">`; //item in list get id {pcode}_img
    if (cams.get(pcode).length != 0) {
        for (var j = 0; j < cams.get(pcode).length; j++) {
            item += addImage(cams.get(pcode)[j]);
        }
    }
    else {
        item += "No Images Available"
    }
    item += "</block></a></li>";
    return item;
}

async function getStreams() {
    var cams = new Map(); //pcode -> cams
    var pnames = new Map(); //pcode -> park name
    var purls = new Map(); //pcode -> url
    var porder = new Array() //used to maintain park order
    var nps = document.getElementsByName("parks"); //national parks
    for (i = 0; i < nps.length; i++){
        if (nps[i].checked == true) {
            var code = nps[i].parentElement.id; //get park codes from checkbox container
            cams.set(code, new Array());
            porder.push(code);
        }
    }
    //first get names of all national parks
    let url = "https://developer.nps.gov/api/v1/parks?limit=" + LIMIT + "&api_key=" + APIKEY;
    let req = new Request(url); //request park data
    let res = await fetch(req);
    let data = await res.json(); 

    data.data.forEach(function(park){
        var pcode = park.parkCode;
        if (cams.has(pcode)) {
            pnames.set(pcode, park.fullName);
            purls.set(pcode, park.url);
        }
    });

    url = "https://developer.nps.gov/api/v1/webcams?limit=" + LIMIT + "&api_key=" + APIKEY; //get all webcams in one fetch
    req = new Request(url); //request park data
    res = await fetch(req);
    data = await res.json(); 
    console.log(data);
    /* get all parks that are checked off */
    data.data.forEach(function(cam){ //loop through each cam
        cam.relatedParks.forEach(function(park) { //check all parks associated with cam
            var pcode = park.parkCode;
            var images = cam.images;
            if (cams.has(pcode)) {
                console.log(pcode);
                var imgs = cams.get(pcode);
                images.forEach(function(image) {
                    imgs.push(image.url);
                });
                cams.set(pcode, imgs);
            }
        });
    });
    var camshtml = "";
    for (var i = 0; i < porder.length; i++) {
        var pcode = porder[i];
        if (cams.has(pcode)) { 
            camshtml += addListItem(pcode, pnames.get(pcode), purls.get(pcode), cams);
        }
    }
    console.log(camshtml);
    if(camshtml.length == 0){
        camshtml = "<li><a>No Cams Found</a></li>";
    }
    //remove previous content/add new content
    document.getElementById("myUL").innerHTML = "";
    document.getElementById("myUL").innerHTML += camshtml;
}
