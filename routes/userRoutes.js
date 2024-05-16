const express = require('express');
const path = require('path');
const router = express.Router();
const userData = require('../utilities/userData');
router.use(express.json());
const logPath = path.join(__dirname, '..', '..','data', 'consoleResponses', 'log.txt');
const errorPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'error.txt');


// list of current homily numbers
// update this if you add a homily
const strongHomilyNumbers = ['1', '2'];
const weakHomilyNumbers = ['3', '4'];
const homilyNumbers = strongHomilyNumbers.concat(weakHomilyNumbers);

// number of homilies each type of user is supposed to watch
const NumLaymenHomiliesToWatch = 2; // total num of homilies to show a laymen
const NumExpertHomiliesToWatch = 4; // total num of homilies to show an expert

// =================================================================================================
// ================== GET ROUTES ===================================================================
// =================================================================================================

// --------------------------------------------------------------------------------------------------
// --------------------------------  EXISTENCE CHECK ROUTES  ----------------------------------------
// --------------------------------------------------------------------------------------------------

// route that checks if various files or folders exist
router.get('/CheckFileOrFolderExists/:userId/:userType/:experimentSource/:experimentType/:fileName', async (req, res) => {

  // try to call on checkExists function in userData to see if various files exist/have been completed by the subject
  try {

    // variables for each of the bits of data we sent 
    var userId = req.params.userId;
    var userType = req.params.userType;
    var experimentType = req.params.experimentType;
    var experimentSource = req.params.experimentSource;
    var fileName = req.params.fileName;
    var result = await userData.checkFileOrFolderExists(userId, userType, experimentSource, experimentType, fileName);
    res.json(result);
  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to check if ${fileName} exists for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable to check if ${fileName} exists for user ${userId} in the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable to check existence of ${fileName} (ROUTING ERROR): ` + error.message}));
  }
});


// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER GET ROUTES  ----------------------------------------------
// --------------------------------------------------------------------------------------------------

// checks if all homilies have been viewed
// returns true as a json to user if all homilies completed
router.get('/allHomiliesViewed/:userId/:userType/:experimentSource/:experimentType', async (req, res) => {
  
  // try to check if all homilies have been viewed 
  try {

    // variables for each of the bits of data we sent 
    var userId = req.params.userId;
    var userType = req.params.userType;
    var experimentType = req.params.experimentType;
    var experimentSource = req.params.experimentSource;

    var completed = false; // variable for whether the user has completed the required number of homilies/questionnaires

    // recover the number of homilies viewed (and associated questionnaires completed) by the user
    const numHomiliesViewed = (await userData.viewedHomilies(userId, userType, experimentSource, experimentType)).length;

    // if the user is a laymen, then check to see if they have or haven't completed the required number of homilies/questionnaires
    if (userType === 'laymen') {
      if (numHomiliesViewed >= NumLaymenHomiliesToWatch) {
        completed = true;
      }
    }
    // if user is an expert, then check to see if they have or haven't completed the required number of homilies/questionnaires
    else {
      if (numHomiliesViewed >= NumExpertHomiliesToWatch) {
        completed = true;
      }
    }

    // return the result to the user
    res.json({'allHomiliesCompleted' : completed});

    }
    // if there is an issue, write the error to the 'error.txt' file in the 'data/consoleResponses' folder
    catch (error) {
  
      // add our request to write to the error file to the queue
      await userData.fileQueueLogFile.enqueue(async () => {
  
        // if the user is an expert, we need a different message format than if they are a laymen
        if (experimentSource === 'na'){
          userData.logToFile((`Unable to check if all homilies used for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
        }
        else{
          userData.logToFile((`Unable to check if all homilies used for user ${userId} in the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
        }
      });
  
      // return an error message to the user's console (inspect element)
      res.status(500).send(JSON.stringify({'response': `Unable to check if all homilies used (ROUTING ERROR): ` + error.message}));
    }
});


// returns a randomly selected video to the user
router.get('/randomHomily/:userId/:userType/:experimentSource/:experimentType', async (req, res) => {
  
  // try to select a random homily to serve to the user
  try {

    // variables for each of the bits of data we sent 
    var userId = req.params.userId;
    var userType = req.params.userType;
    var experimentSource = req.params.experimentSource;
    var experimentType = req.params.experimentType;

    // call on randomHomily function in userData.js to get path to a homily for the user
    jsonObj = await userData.randomHomily(userId, userType, experimentSource, experimentType);

    // send this homily to the user
    res.json(JSON.parse(jsonObj))
  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to retrieve a random homily for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable to retrieve a random homily for user ${userId} in the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable retrieve random homily (ROUTING ERROR): ` + error.message}));
  }
})


// ==================================================================================================
// ================== POST ROUTES ===================================================================
// ==================================================================================================

// --------------------------------------------------------------------------------------------------
// --------------------------------  RESPONSE STORAGE ROUTES  ---------------------------------------
// --------------------------------------------------------------------------------------------------

// logs the date/time of each user sign in (mostly for experts, but will be with laymen too)
router.post('/logSignIn', async (req, res) => {
  try {

    // variables for each of the bits of data we sent 
    var userId = req.body.userId; // user id
    var userType = req.body.userType; // expert or laymen
    var experimentSource = req.body.experimentSource; // sona or prolific
    var experimentType = req.body.experimentType; // audio or av

    // call on logSignIn function in userData.js to log the sign in
    await userData.logSignIn(userId, userType, experimentSource, experimentType);

    // send a success message to the user if successful
    res.send(JSON.stringify({'success message' : 'Sign in time logged successfully'}));
  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to log sign in time for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable tolog sign in time for user ${userId} in the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable to log sign in time (ROUTING ERROR): ` + error.message}));
  }
})


// route for storing user responses to various questionnaires/responses we gather from the subject
router.post('/storeResponses', async (req, res) => {

  // variables for each of the bits of data we sent 
  var userId = req.body.userId;
  var userType = req.body.userType;
  var experimentType = req.body.experimentType;
  var experimentSource = req.body.experimentSource;
  var fileName = req.body.fileName;
  var results = req.body.results;

  // try to call on storeResponses function in userData to store the data on the server (in the 'data' folder)
  try {
    await userData.storeResponses(userId, userType, experimentSource, experimentType, fileName, results);
    res.send(JSON.stringify({'response': `Successfully saved ${fileName} data`}));
  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to save ${fileName} for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable to save ${fileName} for user ${userId} in the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable to save ${fileName} data (ROUTING ERROR): ` + error.message}));
  }
})


// --------------------------------------------------------------------------------------------------
// --------------------------------  UPDATE DATA ROUTES  --------------------------------------------
// --------------------------------------------------------------------------------------------------


// updates the overall homily counts
router.post('/updateHomilyCount', async (req, res) => {
  
  // try to update the homily counts
  try {

    // variables for each of the bits of data we sent 
    var homilyId = req.body.homilyId;
    var userType = req.body.userType;
    var experimentSource = req.body.experimentSource;
    var experimentType = req.body.experimentType;

    // call on user data function to update the homily count
    await userData.updateHomilyCount(homilyId, userType, experimentSource, experimentType);

    // send success message to user if successful
    res.send(JSON.stringify({'success message' : 'homily count updated'}));
  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to update homily count for the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable to update homily count the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable to save update homily count (ROUTING ERROR): ` + error.message}));
  }


})


// when served a new homily, this will update the current video and playback time in case of refresh
router.post('/updatePlaybackTime', async (req, res) => {
  
  // try to update progress file for user's progress through a homily
  try {

    // variables for each of the bits of data we sent 
    var userId = req.body.userId;
    var userType = req.body.userType;
    var experimentSource = req.body.experimentSource;
    var experimentType = req.body.experimentType;
    var homilyPath = req.body.homilyPath;
    var playbackTime = req.body.playbackTime

    // call on updatePlaybackTime in userData.js to update the user's progress through the homily
    await userData.updatePlaybackTime(userId, userType, experimentSource, experimentType, homilyPath, playbackTime);

    // send success message to user if playback time successfully updated
    res.send(JSON.stringify({'success message' : 'playback time updated'}));

  }
  // if there is an issue, write the error to the 'error.txt' file in the 'consoleResponses' folder
  catch (error) {

    // add our request to write to the error file to the queue
    await userData.fileQueueLogFile.enqueue(async () => {

      // if the user is an expert, we need a different message format than if they are a laymen
      if (experimentSource === 'na'){
        userData.logToFile((`Unable to update playback time for user ${userId} in the ${userType} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
      else{
        userData.logToFile((`Unable to update playback time for user ${userId} the ${experimentSource} ${experimentType} condition (ROUTING ERROR): ` + error.message), errorPath);
      }
    });

    // return an error message to the user's console (inspect element)
    res.status(500).send(JSON.stringify({'response': `Unable to update playback time (ROUTING ERROR): ` + error.message}));
  }
    
})
// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER POST ROUTES  ---------------------------------------------
// --------------------------------------------------------------------------------------------------


module.exports = router;
