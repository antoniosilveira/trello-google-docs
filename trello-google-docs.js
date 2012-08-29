function trelloFetch(url) {
  //var key = ScriptProperties.getProperty('key');
  //var token = ScriptProperties.getProperty('token');
  var key = "Your Trello Key";
  var token = "Your Trello oAuth Token";
  var completeUrl = "https://api.trello.com/1/" + url + "?key=" + key + "&token=" + token;
  var jsondata = UrlFetchApp.fetch(completeUrl);
  var object = Utilities.jsonParse(jsondata.getContentText());
  
  return object;
}

function getBoardLists(boardId, callback) {
  var paramUrl = "boards/" + boardId + '/lists/';
  var boardLists = trelloFetch(paramUrl);
  var count = boardLists.length;

  var headerNames = [];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  for (var i = 0; i < count; i++) {
    headerNames[i] = boardLists[i].name;
  }
  //getRange (firstRow, FirstColumn, number of rows, number of columns)
  sheet.getRange(2, 3, 1, count).setValues([headerNames]);
      
  callback(boardLists);
}

function getCards(boardLists) {

  var cards = [];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  for (var i = 0; i < boardLists.length; i++) {
    var paramUrl = "lists/" + boardLists[i].id + '/cards/';
    cards[i] = trelloFetch(paramUrl); // all cards from a given List
    
    for (var j = 0; j < cards[i].length; j++) {
        //getRange (firstRow, FirstColumn, number of rows, number of columns)
        sheet.getRange(3+j, 3+i, 1, 1).setValue(cards[i][j].name);
    }

  }

}


function findBoardByName(trelloBoardName,callback) {
  //var username = ScriptProperties.getProperty('username');
  var username = "Your Trello Username";
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var boardName = sheet.getRangeByName("boardName").getValue();
  
  //clear the content (not formatting)
  sheet.getRangeByName("allContentRange").clearContent();
  // Example of API Call, all boards for a given username
  // https://api.trello.com/1/members/USERNAME/boards?key=&token=
  
  var paramUrl = "members/" + username + "/boards/";
  var userBoardList = trelloFetch(paramUrl);
  var count = userBoardList.length;
  
  for (var i=0; i< count-1; i++) {
    var id = (boardName == userBoardList[i].name)?userBoardList[i].id:-1;
    // quit when finds the first match
    if (-1 != id) break;
  }
   
   //Set a Property with the Board ID:
   if (-1 != id){
     ScriptProperties.setProperty('boardid', id);
   } else {
     ScriptProperties.setProperty('boardid', 0);
     Browser.msgBox("Error: Board not found on Trello!\n1)Make sure that this username(" + username + ") has access to the Board\n2) Double check the name to the Board, it needs to be an exact match with the board name on Trello" );
   }
   
   callback(id);
}

function getTrelloData(){
    findBoardByName(null,function(boardId) {
        getBoardLists(boardId, function(boardLists){
            getCards(boardLists);
        });
    });

  // Update Last Update time stamp
  var lastUpdate=new Date();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange("C1").setValue("Updated every 15 minutes.\nLast update: " + lastUpdate);
