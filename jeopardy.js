const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const BASE_URL = "https://jservice.io/api";

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() { 
    let res = await axios.get(`${BASE_URL}/categories?count=100`);
    console.log(res);

    let catIds = res.data.map(cat => cat.id);
    //console.log("categoryIDs:",catIds);

    //Lodash _samplesize to get array of 6 random categories from API
    let ranCats = _.sampleSize(catIds, NUM_CATEGORIES);
    //console.log("random categories:",ranCats);

    //return array of random categories
    return ranCats;
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`${BASE_URL}/category?id=${catId}`);
    //get category data from api
    
    let cat = res.data;
    //console.log("category:", cat);
    
    //get category clues
    let apiClues = cat.clues;
    //console.log(apiClues);
    
    //select random clues from all clues
    let ranClues = _.sampleSize(apiClues,NUM_QUESTIONS_PER_CAT);
    //console.log(ranClues);
    
    //create array of random clue questions & answers
    let cluesArr = ranClues.map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null
    }));

    //return object to be included in universal "categories" array;
    return {title: cat.title, clues: cluesArr};
}



/** Fill the HTML table #jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    //create table for #jeopardy
    $("body").append($("<table>").attr("id", "jeopardy"));

    //creating table headers per category, y=column (y coordinate value)
    for (let y = 0; y < NUM_CATEGORIES; y ++){
        //append table header with category title
        $("#jeopardy").append($("<th>").text(categories[y].title));
    } 

    $("#jeopardy").append($("<tbody>"));

    for (let x = 0; x < NUM_QUESTIONS_PER_CAT; x++){
        const row = $("<tr>");  
        for(let y = 0; y < NUM_CATEGORIES; y++){
            row.append($("<td>").text("?").attr("id", `${y}-${x}`));
        }
        $("#jeopardy tbody").append(row);
    }
    $("#jeopardy").on("click", "td", handleClick);
}



/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    //console.log(evt.target);
    let id = evt.target.id;
    // console.log(id);
    let [catId, clueId] = id.split("-");
    //console.log( [catId, clueId] );
    let clue = categories[catId].clues[clueId];
    //console.log(categories[catId].clues[clueId]);
    
    //variable to determine what is shown in the html
    let present;

    if (!clue.showing){     //if clue is not showing => show the clue and present the clue in the DOM
        present = clue.question;
        clue.showing = "question";
        // console.log("clue:", present);
    } else if (clue.showing === "question"){    //if clue is showing => show the the answer and present the answer in the DOM 
        present = clue.answer;
        clue.showing = "answer";
        // console.log("answer:", present);
    } else {     //if null, question, or answer are not showing => ignore click
        return;
    }
    
    //change the inner html of the selected clue to the value of the "present" variable
    $(`#${catId}-${clueId}`).html(present);
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#jeopardy").remove();
    $("#startBtn").remove();
    $("body").append($("<div>").attr("id", "loader"));
}



/** Remove the loading spinner and update the button used to fetch data. 
*/
async function hideLoadingView() {
    await setupAndStart();
    $("#loader").remove();
}



/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    let catIds = await getCategoryIds();

    categories = [];
    
    //for every category of "random categories array" add "category data object" to universal "categories" array
    for (let catId of catIds){
        categories.push(await getCategory(catId));
    }

    fillTable();
}


/**initate game setup with loading view add, table fill, loading view remove, and restart button add
*/
async function startGame(){
    showLoadingView();
    await hideLoadingView()
    showRestart();
}



/** On click of start/restart button, set up game. 
*/
function showRestart(){
    $("body").append($("<button>Restart Game</button>").attr("id", "startBtn"));
    //on startbutton click restart game
    $("#startBtn").on("click", startGame);   
}



/** On page load, initiate game setup */
$(document).ready(startGame());


