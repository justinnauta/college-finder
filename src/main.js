import * as apiManager from "./api-manager.js";

let app;

let keyPrefix = "jrn2778_303_proj3";    // Prefix for keys when saving to localStorage

function init() {
    app = new Vue({
        el: "#app",
        data: {
            searchTerm: "",             // What the user searched
            searchCountry: "",          // What country the user selected
            resultsLimit: 3,            // How many results to display
            resultsAmtTotal: 0,         // Total amount of results
            resultsCurrentIndex: 0,     // Index of the current first result
            collegeCards: [],           // Holds all the info of the displayed results
            favoriteCards: [],          // Holds all the info of the favorited results
            previousResults: {}
        },
        computed: {
            // The index of the last result displayed,
            // adjusted so it doesn't go over the total amount of results
            resultsCurrentIndexEnd() {
                let amt = this.resultsCurrentIndex + this.previousResults.resultsLimit;
                if (amt > this.resultsAmtTotal) amt = this.resultsAmtTotal;

                return amt;
            }
        },
        methods: {
            // Triggers a new search
            search() {
                // Show/Hide appropriate controls until results are displayed
                document.querySelector("#searchBtn").disabled = true;
                document.querySelector("#showMoreBtn").disabled = true;
                document.querySelector("#showMoreBtn").style.display = "none";
                document.querySelector("#currentAmt").style.display = "none";
                document.querySelector("#noResults").style.display = "none";
                document.querySelector("#collegesLoader").style.display = "block";

                saveSearchSettings();

                // Reset values
                this.collegeCards = [];
                this.resultsCurrentIndex = 0;

                apiManager.createCollegeCards();
            },
            // Shows the next results within the resultsLimit
            showMore() {
                // Show/Hide appropriate controls until results are displayed
                document.querySelector("#searchBtn").disabled = true;
                document.querySelector("#showMoreBtn").disabled = true;
                document.querySelector("#collegesLoader").style.display = "block";

                this.resetSearchSettings();

                // Reset/Adjust values
                this.resultsCurrentIndex += this.resultsLimit;

                apiManager.createCollegeCards();
            },
            // Adds/Removes the college to/from 'favoriteCards'
            // depending on whether or not it has already been favorited
            changeFavorite(collegeInfo) {
                if (collegeInfo.starStyle == "far") {
                    collegeInfo.starStyle = "fas";
                    this.favoriteCards.push(collegeInfo);
                } else if (collegeInfo.starStyle == "fas") {
                    collegeInfo.starStyle = "far";
                    this.favoriteCards.splice(this.favoriteCards.indexOf(collegeInfo), 1);
                }

                // Show/Hide clear favorites button
                let clearbtn = document.querySelector("#clearBtn");
                if (this.favoriteCards.length > 0) clearbtn.style.display = "block";
                else clearbtn.style.display = "none";

                // Save the list of favorites to local storage
                localStorage.setItem(keyPrefix + "-favoriteCards", JSON.stringify(app.favoriteCards));
            },
            // Resets the search settings to what they were when last searched
            resetSearchSettings() {
                this.searchTerm = this.previousResults.searchTerm;
                this.searchCountry = this.previousResults.searchCountry;
                this.resultsLimit = this.previousResults.resultsLimit;
            },
            // Clears the search settings
            clearSearchSettings() {
                this.searchTerm = "";
                this.searchCountry = "";
                this.resultsLimit = 3;

                saveSearchSettings();
                localStorage.removeItem(keyPrefix + "-previousResults");
            },
            // Clears the list of favorites
            clearFavorites() {
                for (let i = 0; i < this.favoriteCards.length; i++) {
                    this.changeFavorite(this.favoriteCards[i]);
                    i--;
                }
                localStorage.removeItem(keyPrefix + "-favoriteCards");
            },
            // Toggles between which list is displayed;
            // for smaller screens
            changeDisplayedList() {
                let collegeList = document.querySelector("#collegeList");
                let favoriteList = document.querySelector("#favoriteList");
                let collegeChevron = document.querySelector("#collegeListChevron");
                let favoriteChevron = document.querySelector("#favoriteListChevron");

                if (collegeList.classList.contains("hidden")) { // Show collegeList
                    collegeList.classList.remove("hidden");
                    collegeList.classList.add("flex");
                    favoriteList.classList.add("hidden");
                    favoriteList.classList.remove("flex");

                    // Show/hide chevrons
                    collegeChevron.classList.remove("hidden");
                    collegeChevron.classList.add("inline-block");
                    favoriteChevron.classList.remove("inline-block");
                    favoriteChevron.classList.add("hidden");
                } else {                                        // Show favoriteList
                    collegeList.classList.add("hidden");
                    collegeList.classList.remove("flex");
                    favoriteList.classList.remove("hidden");
                    favoriteList.classList.add("flex");

                    // Show/hide chevrons
                    collegeChevron.classList.add("hidden");
                    collegeChevron.classList.remove("inline-block");
                    favoriteChevron.classList.add("inline-block");
                    favoriteChevron.classList.remove("hidden");
                }
            },
            // Shows the advanced search settings; for small screens
            showAdvancedSettings(e) {
                let controls = [
                    document.querySelector("#countrySelect"),
                    document.querySelector("#limitSelect"),
                    document.querySelector("#resetBtn")
                ];

                if(e.target.innerHTML.includes("Show")) {
                    for(let control of controls) {
                        control.classList.remove("hidden");
                    }

                    e.target.innerHTML = "Hide Advanced Search";
                } else {
                    for(let control of controls) {
                        control.classList.add("hidden");
                    }

                    e.target.innerHTML = "Show Advanced Search";
                }
            }
        }
    });

    // Display the last search if there was one
    let previousResults = localStorage.getItem(keyPrefix + "-previousResults");
    if (previousResults) {
        app.previousResults = JSON.parse(previousResults);
        app.resetSearchSettings();
    }

    // Display the favorites if there are any
    let favoriteCards = localStorage.getItem(keyPrefix + "-favoriteCards");
    if (favoriteCards) {
        // Display loader
        document.querySelector("#favoritesLoader").style.display = "block";

        // Load favorites
        app.favoriteCards = JSON.parse(favoriteCards);

        // Hide loader and show clear button
        document.querySelector("#favoritesLoader").style.display = "none";
        if (app.favoriteCards.length > 0) document.querySelector("#clearBtn").style.display = "block";
    }

    // Show/hide the appropriate lists depending on screen size
    let smallScreenQuery = window.matchMedia("(max-width: 767px)");
    let largeScreenQuery = window.matchMedia("(min-width: 768px)");
    smallScreenQuery.onchange = e => {
        if (e.target.matches) {
            document.querySelector("#favoriteList").classList.add("hidden");
            document.querySelector("#favoriteList").classList.remove("flex");
            document.querySelector("#collegeListChevron").classList.remove("hidden");
            document.querySelector("#collegeListChevron").classList.add("inline-block");
        }
    };
    largeScreenQuery.onchange = e => {
        let collegeList = document.querySelector("#collegeList");
        let favoriteList = document.querySelector("#favoriteList");

        if (e.target.matches) {
            if (collegeList.classList.contains("hidden")) {
                collegeList.classList.remove("hidden");
                collegeList.classList.add("flex");
                document.querySelector("#favoriteListChevron").classList.remove("inline-block");
                document.querySelector("#favoriteListChevron").classList.add("hidden");
            }
            if (favoriteList.classList.contains("hidden")) {
                favoriteList.classList.remove("hidden");
                favoriteList.classList.add("flex");
                document.querySelector("#collegeListChevron").classList.remove("inline-block");
                document.querySelector("#collegeListChevron").classList.add("hidden");
            }
        }
    };
    smallScreenQuery.dispatchEvent(new Event("change"));
}

// Shows/Hides certain controls depending on their parameters
function changeControlsDisplay() {
    // Get the controls
    let showMoreBtn = document.querySelector("#showMoreBtn");
    let noResultsText = document.querySelector("#noResults");
    let currentAmtText = document.querySelector("#currentAmt");

    // Show/hide the show more button depending on if there are results not displayed
    if (app.resultsCurrentIndexEnd < app.resultsAmtTotal) showMoreBtn.style.display = "block";
    else showMoreBtn.style.display = "none";

    // Show the current index of results
    if (app.resultsAmtTotal == 0) {
        noResultsText.style.display = "block";
        currentAmtText.style.display = "none";
    } else {
        currentAmtText.style.display = "block";
        noResultsText.style.display = "none";
    }
}

// Saves the search settings and puts them in local storage
function saveSearchSettings() {
    app.previousResults = {
        searchTerm: app.searchTerm,
        searchCountry: app.searchCountry,
        resultsLimit: app.resultsLimit
    };
    localStorage.setItem(keyPrefix + "-previousResults", JSON.stringify(app.previousResults));
}

// Makes sure both the college list and favorite list 
// are shown when the window is big enough
function showFullMainGrid(windowMediaQuery) {
    if (windowMediaQuery.matches) {
        document.querySelector("#collegeList").style.display = "flex";
        document.querySelector("#favoriteList").style.display = "flex";
    }
}

export {
    app,
    init,
    changeControlsDisplay
};