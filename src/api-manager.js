import * as main from "./main.js";
import { CollegeInfo } from "./CollegeInfo.js";

// University Domains API (https://github.com/Hipo/university-domains-list)
// Accessed via a proxy
let collegeListURL = "https://people.rit.edu/jrn2778/330/project3/university-domain-proxy.php?name=";

// LinkPreview API (https://www.linkpreview.net/)
const API_KEY = ""; // API KEY REMOVED FOR SECURITY PURPOSES
let linkPreviewURL = "https://api.linkpreview.net/?key=" + API_KEY + "&q=";

// Gets list of colleges based on search,
// and converts their data to fit the CollegeInfo object
function createCollegeCards() {
    let xhr = new XMLHttpRequest();
    let url = collegeListURL + encodeURIComponent(main.app.searchTerm) + "&country=" + encodeURIComponent(main.app.searchCountry);

    xhr.onerror = (e) => console.log("XHR ERROR");
    xhr.onload = (e) => {
        // Parse the list of colleges, and save the total amount of results
        let colleges = JSON.parse(e.target.response);
        main.app.resultsAmtTotal = colleges.length;

        // Cleans the college list to get it ready to send to the LinkPreview API
        cleanCollegeList(colleges);

        // Get the website info for each college
        getLinkPreviews(colleges);
    };

    // Grab colleges from the University Domains API
    xhr.open("GET", url);
    xhr.send();
}

// Gets and saves website information for each college
// using the LinkPreview API
function getLinkPreviews(colleges) {
    let xhr = new XMLHttpRequest();

    // Create a CollegeInfo object from the college
    // at the given index 'i'
    (function createCollegeInfo(i) {
        // If finished going through the colleges array
        if (i >= colleges.length) {
            // Re-enable the search and show more buttons and hide the loader
            document.querySelector("#searchBtn").disabled = false;
            document.querySelector("#showMoreBtn").disabled = false;
            document.querySelector("#collegesLoader").style.display = "none";

            // Show/Hide appropriate controls
            main.changeControlsDisplay();

            return;
        }

        let url = linkPreviewURL + encodeURIComponent(colleges[i].web_pages[0]);

        xhr.onreadystatechange = (e) => {
            let status = xhr.status;

            // Check to see if the information has been received,
            // and whether or not it was a success
            if (xhr.readyState == XMLHttpRequest.DONE &&
                (status === 0 || (status >= 200 && status < 400))) {
                let websiteInfo = JSON.parse(e.target.response);

                // Create a CollegeInfo object with the website info
                let collegeInfo = new CollegeInfo(
                    colleges[i].name,
                    websiteInfo.description,
                    websiteInfo.image,
                    colleges[i].web_pages[0],
                    "far");

                // Adjust collegeInfo if it is already on the favorited list
                let favoritedInfo = getFavoritedInfo(collegeInfo);
                if(favoritedInfo != null) collegeInfo = favoritedInfo;

                main.app.collegeCards.push(collegeInfo);

                // Run the function again with the next index
                createCollegeInfo(i + 1);
            } else if (xhr.readyState == XMLHttpRequest.DONE) {
                // Create a CollegeInfo object with error info
                let collegeInfo = new CollegeInfo(
                    colleges[i].name,
                    "ERROR: Could not load description or image. Either no information was found or the limit of 60 API requests per hour was hit.",
                    "./media/image-not-found.png",
                    colleges[i].web_pages[0],
                    "far");

                // Adjust collegeInfo if it is already on the favorited list
                let favoritedInfo = getFavoritedInfo(collegeInfo);
                if(favoritedInfo != null) collegeInfo = favoritedInfo;

                main.app.collegeCards.push(collegeInfo);

                // Run the function again with the next index
                createCollegeInfo(i + 1);
            }
        };

        // Grab the website info for the college at index 'i',
        // using the LinkPreview API
        xhr.open("GET", url);
        xhr.send();
    })(0); // Run the function starting at index 0
}

// Removes colleges from the beginning and ends of the college list
// based on what index range is currently being displayed
function cleanCollegeList(colleges) {
    // Remove colleges from the beginning of the array,
    // so that the first element matches the resultsCurrentIndex
    for (let i = 0; i < main.app.resultsCurrentIndex; i++) {
        colleges.shift();
    }

    // Removes colleges from the end of the array,
    // so that only the resultsLimit amount of results is displayed
    let amtToRemove = colleges.length - main.app.resultsLimit;
    for (let i = 0; i < amtToRemove; i++) {
        colleges.pop();
    }
}

// Checks to see if collegeInfo is on the favorited list already
// If so, returns the collegeInfo from favoriteCards, otherwise returns null
function getFavoritedInfo(collegeInfo) {
    for (let college of main.app.favoriteCards) {
        if(college.name == collegeInfo.name) return college;
    }

    return null;
}

export {
    createCollegeCards
};