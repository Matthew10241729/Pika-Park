const APIKEY = "STFOfWPjvnSBzRMakw8wOvfkbJEFEwmI10SgEnbv";

function toggleActivities() {
    var coll = document.getElementById("collapsible");
    var content = document.getElementById("activities");
    if (content.style.display === "block") {
        content.style.display = "none";
    } 
    else {
        content.style.display = "block";
    }
}


function makeentry(park){
    return `<li>
                <a onclick="window.open('` + park.url + `','_blank')">${park.fullName}</a> 
            </li>`;
}

async function getParks() {
    var names = new Set()
    var acts = document.getElementsByName("activities");
    for (i = 0; i < acts.length; i++){
        if (acts[i].checked == true) {
            var temp = acts[i].parentElement.id; //get activity name from checkbox container
            names.add(temp);
        }
    }
    let url = "https://developer.nps.gov/api/v1/activities/parks?api_key=" + APIKEY;
    let req = new Request(url); //request park data
    let res = await fetch(req);
    let data = await res.json(); 
    console.log(data);
    let parkshtml = "";

    var curr_parks = new Map();
    var new_parks = new Map();
    var first_pass = true;
    /* get intersection of all parks associated with each activity*/
    data.data.forEach(function(act){ //loop through each activity in data
        if (names.has(act.name)) {  
            act.parks.forEach(function(park) { 
                if (first_pass && park.designation == "National Park") { //only check national parks
                    curr_parks.set(park.parkCode, park);
                }
                else if (curr_parks.has(park.parkCode) && park.designation == "National Park") { 
                    new_parks.set(park.parkCode, park);
                }	
            });
            if (!first_pass) { 
                curr_parks = new Map(new_parks);
                new_parks = new Map();
            }
            console.log(curr_parks);
            first_pass = false;	
        }
    });
    /* sort parks alphabetically */
    var ordered_parks = Array.from(curr_parks.values());
    ordered_parks.sort(function(a, b){return a.fullName.localeCompare(b.fullName)});
    ordered_parks.forEach(function(park){
        parkshtml += makeentry(park);
    });
    if(parkshtml.length == 0){
        parkshtml = "<li><a>No Parks Found</a></li>";
    }
    //remove previous content/add new content
    document.getElementById("myUL").innerHTML = "";
    document.getElementById("myUL").innerHTML += parkshtml;
}


