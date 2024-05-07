const express = require('express');
const path = require('path');
const router = express.Router();
const userData = require('../utilities/userData');
router.use(express.json());
const logPath = path.join(__dirname, '..', '..','data', 'consoleResponses', 'log.txt');
const errorPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'error.txt');



// ==================================================================================================================================================================
// ================== GET ROUTES ====================================================================================================================================
// ==================================================================================================================================================================

// --------------------------------------------------------------------------------------------------
// --------------------------------  EXISTENCE CHECK ROUTES  ----------------------------------------
// --------------------------------------------------------------------------------------------------

// checks if the user has completed the consent form
router.get(`/consentFormCompleted/:userId/:userType/:experimentSource/:experimentType`, async (req, res) => {
  try {
  const userId = req.params.userId; // id number
  const userType = req.params.userType; // expert or laymen
  let experimentSource = req.params.experimentSource; // prolific or sona
  const experimentType = req.params.experimentType; // audio or av
  if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
    experimentSource = '';
  }

  console.log(userId);
  const result = await userData.checkConsentExists(userId, userType, experimentSource, experimentType);
  console.log(result);
  res.json({'done': result});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use consent form completed route: ' + error.message), errorPath);
    });
    console.error('unable to use consent form completed route: ', error.message);
  }
});

// checks if the demographic has been completed
router.get(`/userDemographicCompleted/:userId/:userType/:experimentSource/:experimentType`, async (req, res) => {
  try{
    const userId = req.params.userId; // id number
    const userType = req.params.userType; // expert or laymen
    let experimentSource = req.params.experimentSource; // prolific or sona
    const experimentType = req.params.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    const result = await userData.checkUserDemographicExists(userId, userType, experimentSource, experimentType);
    res.json({'done': result});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use user demographic completed route: ' + error.message), errorPath);
    });
    console.error('unable to use user demographic completed route: '. error.message);
  }
});

// checks if laymen have submitted their religious demographic survey
router.get(`/religiousDemographicCompleted/:userId/:userType/:experimentSource/:experimentType`, async (req, res) => {
  try {
    const userId = req.params.userId; // id number
    const userType = req.params.userType; // expert or laymen
    let experimentSource = req.params.experimentSource; // prolific or sona
    const experimentType = req.params.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    const result = await userData.checkReligiousDemographicExists(userId, userType, experimentSource, experimentType);
    res.json({'done': result});
  } catch (error){
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use religious demographic completed route: ' + error.message), errorPath);
    });
    console.error('unable to use religious demographic completion route: ', error.message);
  }
});

// checks if experts have submitted their preaching experience questionnaire
router.get(`/preachingExperienceCompleted/:userId/:userType/:experimentSource/:experimentType`, async (req, res) => {
  try {
    console.log('here');
    const userId = req.params.userId; // id number
    const userType = req.params.userType; // expert or laymen
    let experimentSource = req.params.experimentSource; // prolific or sona
    const experimentType = req.params.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    const result = await userData.checkExperienceExists(userId, userType, experimentSource, experimentType);
    console.log(result)
    res.json({'done': result});
  } catch (error){
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use preaching experience completed route: ' + error.message), errorPath);
    });
    console.error('unable to use preaching experience completed route: ', error.message);
  }
});

// check if user id exists
router.get('/checkExists/:userId/:userType/:experimentSource/:experimentType', async (req, res) => {
  try {
    const userId = req.params.userId; // id number
    const userType = req.params.userType; // expert or laymen
    const experimentType = req.params.experimentType;
    let experimentSource = req.params.experimentSource; // prolific or sona or dne for experts
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    let result;
    let newUserId; // potentially add functionality for multiple people with same prolific IDs?
    if (userType == 'laymen'){
      newUserId = await userData.checkExists(userId, userType, experimentSource, experimentType);
      result = true;
    } else {
      result = await userData.checkExists(userId, userType, experimentSource, experimentType);}
    res.json({"exists": result});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use check user ID exists route: ' + error.message), errorPath);
    });
    console.error('unable to use check user ID exists route: ', error.message);
  }
});


// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER GET ROUTES  ----------------------------------------------
// --------------------------------------------------------------------------------------------------

// checks if all homilies have been viewed
// returns true as a json to user if all homilies completed
router.get('/allHomiliesViewed/:userId/:userType/:experimentSource/:experimentType', async (req, res) => {
  try {
    const userId = req.params.userId; // id number
    const userType = req.params.userType; // expert or laymen
    let experimentSource = req.params.experimentSource; // prolific or sona
    const experimentType = req.params.experimentType; // audio or av

    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    const laymenHomilies = 2; // total num of homilies to show a laymen
    const expertHomilies = 4; // total num of homilies to show an expert

    if (userType == 'laymen') {
      let homiliesUsed = await userData.countHomiliesUsed(userId, userType, experimentSource, experimentType);
      console.log('homilies used: ', homiliesUsed);
      if (homiliesUsed >= laymenHomilies) {
        res.json({'done' : true});
      } else {
        res.json({'done' : false});}
      } else {
        let homiliesUsed = await userData.countHomiliesUsed(userId, userType, experimentSource, experimentType);
        if (homiliesUsed >= expertHomilies) {
          res.json({'done' : true});
        } else {
          res.json({'done' : false});}
      }
    } catch (error) {
      await userData.fileQueueLogFile.enqueue(async () => {
        userData.logToFile(('Unable to use check if the required number of homilies have been used route: ' + error.message), errorPath);
      });
      console.error('Unable to check if the required number of homilies have been used route: ', error.message);
    }

  // } else {
  //   let unusedHomilies = await userData.unviewedHomilies(userId, userType, experimentSource, experimentType);
  //   if (unusedHomilies.length === 0){
  //     res.json({'done' : true});
  //     } else {
  //       res.json({'done' : false});}}
})


// returns a randomly selected video to the user
router.get('/randomHomily/:userId/:userType/:experimentSource/:experimentType', async (req, res) => {
  try{
    const userId = String(req.params.userId); // user ID
    const userType = String(req.params.userType); // user Type
    let experimentSource = req.params.experimentSource; // prolific or sona
    const experimentType = req.params.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }


    userData.randomHomily(userId, userType, experimentSource, experimentType).then(jsonObj => {
      console.log(jsonObj)
      res.json(JSON.parse(jsonObj));})
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');})
  } catch (error){
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use random homily selection route: ' + error.message), errorPath);
    });
    console.error('unable to use random homily selection route: ', error.message);
  }
})


// ==================================================================================================================================================================
// ================== POST ROUTES ===================================================================================================================================
// ==================================================================================================================================================================

// --------------------------------------------------------------------------------------------------
// --------------------------------  RESPONSE STORAGE ROUTES  ---------------------------------------
// --------------------------------------------------------------------------------------------------

// logs the date/time of each user sign in (mostly for experts, but will be with laymen too)
router.post('/logSignIn', async (req, res) => {
  try {
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    await userData.logSignIn(userId, userType, experimentSource, experimentType);
    res.send(JSON.stringify({'success message' : 'Sign in time logged successfully'}));

  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to log sign in time: ' + error.message), errorPath);
    });
    console.error('unable to use log sign in time route: ', error.message);
  }
})

// stores user's behavior while watching homily (rewinds, pauses, tab switchesw)
router.post('/storeUserBehavior', async (req, res) => {
  try {
    const results = req.body.results;
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let tempHomilyId = req.body.homilyId;
    let homilyId;
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }
    if (experimentType == 'av'){
      homilyId = path.basename(tempHomilyId, '.mp4');
    } else {
      homilyId = path.basename(tempHomilyId, '.mp3');}
    

    userData.storeBehaviorInfo(userId, userType, experimentSource, experimentType, homilyId, results).then(data => {
      res.send(JSON.stringify({'success message' : 'Behavior info saved'}));
      }).catch(async error => {
        console.error(error);
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use save behavior info route: ' + error.message), errorPath);
        });
        res.status(500).send('Unable to save behavior info');});
    } catch (error){
      await userData.fileQueueLogFile.enqueue(async () => {
        userData.logToFile(('Unable to use save behavior info route: ' + error.message), errorPath);
      });
      console.error('unable to use store user behavior route: ', error.message);
    }
})
// stores the results to the user demographic data
router.post('/storeUserDemographicResults', async (req, res) => {
  try {
    console.log('here');
    const results = req.body.results;
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }
    

    userData.storeUserDemographic(results, userId, userType, experimentSource, experimentType).then(data => {
      res.send(JSON.stringify({'success message' : 'Demographic info saved'}));
      }).catch(async error => {
        console.error(error);
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use save demographic info route: ' + error.message), errorPath);
        });
        res.status(500).send('Unable to save demographic info');});
    } catch (error){
      await userData.fileQueueLogFile.enqueue(async () => {
        userData.logToFile(('Unable to use save demographic info route: ' + error.message), errorPath);
      });
      console.error('unable to use store user demographic route: ', error.message);
    }
})

// stores the results to the consent screen (email variable is largely for sona)
router.post('/storeConsentinfo', async (req, res) => {
  try {
    const results = req.body.results;
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    userData.storeConsentInfo(results, userId, userType, experimentSource, experimentType).then(data => {
      console.log('consent info: ', results);
      res.send(JSON.stringify({'success message' : 'Consent info saved'}));
      }).catch(async error => {
        console.error(error);
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to save consent info route: ' + error.message), errorPath);
        });
        res.status(500).send('Unable to save consent info');});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use store consent info route: ' + error.message), errorPath);
    });
        console.error('unable to use store consent info route: ', error.message);
      }
})

// stores preaching experience questionnaire results
router.post('/storePreachingExperience', async (req, res) => {
  try{
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    const results = req.body.results; // preaching experience answers as a json
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    userData.storePreachingExperience(userId, userType, experimentSource, experimentType, results).then(data => {
      res.send(JSON.stringify({'success message' : 'Preaching Experience responses saved'}));
      }).catch(async error => {
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to save preaching experience route: ' + error.message), errorPath);
        });
        console.error(error);
        res.status(500).send('Unable to save preaching experience responses');});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use store preaching experience route: ' + error.message), errorPath);
    });
    console.error('Unable to use store preaching experience route: ', error.message);
  }
})


// stores religious demographic questionnaire results
router.post('/storeReligiousDemographic', async (req, res) =>{
  try {
    const userId = req.body.userId; // user ID
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    const results = req.body.results; // religious demographic results as json
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }
   //console.log(results);

    userData.storeReligiousDemographic(userId, userType, experimentSource, experimentType, results).then(data => {
      res.send(JSON.stringify({'success message' : 'Religious demographic responses saved'}));
      }).catch(async error => {
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use store religious demographic route: ' + error.message), errorPath);
        });
        console.error(error);
        res.status(500).send('Unable to save religious demographic responses');});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use store religious demographic route: ' + error.message), errorPath);
    });
    console.error('unable to use store religious demographic route: ', error.message);
  }
})


// stores a user's results to a homily questionnaire
router.post(`/storeQuestionnaireResults`, async (req, res) => {
  try{
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    const tempHomilyId = req.body.homilyId; // homily ID (called "temp..." because we will cut it down)
    const results = req.body.results; // responses to the questionnaire about the homily as a json
    const order = req.body.order; // order in which the questionnaire questions were given
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }
    let homilyId;

    if (experimentType == 'av'){
      homilyId = path.basename(tempHomilyId, '.mp4');
    } else {
      homilyId = path.basename(tempHomilyId, '.mp3');}

    userData.storeQuestionnaireResults(userId, userType, experimentSource, experimentType, homilyId, results, order).then(data => {
      res.send(JSON.stringify({'success message' : 'Questionnaire responses saved'}));
    }).catch(async error => {
      await userData.fileQueueLogFile.enqueue(async () => {
        userData.logToFile(('Unable to use store questionnaire results route: ' + error.message), errorPath);
      });
      console.error(error);
      res.status(500).send('Unable to save questionnaire responses');});
      await userData.storeHomilyOrder(userId, userType, experimentSource, experimentType, homilyId)
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use store questionnaire results completed route: ' + error.message), errorPath);
    });
    console.error('unable to use store questionnaire results route: ', error.message);
  }
})


// --------------------------------------------------------------------------------------------------
// --------------------------------  UPDATE DATA ROUTES  --------------------------------------------
// --------------------------------------------------------------------------------------------------


// updates the overall homily counts for the laymen
router.post('/updateHomilyCount', async (req, res) => {
  console.log('here');
  try {
    const homilyId = req.body.homilyId; // homily ID
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }


    userData.updateHomilyCount(homilyId, userType, experimentSource, experimentType).then(data => {
      res.send(JSON.stringify({'success message' : 'homily count updated'}));
      }).catch(async error => {
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use update homily count route: ' + error.message), errorPath);
        });
        console.error(error);
        res.status(500).send('Unable to update homily count');});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use update homily count route: ' + error.message), errorPath);
    });
    console.error(' unable to use the update homily count route: ', error.message);
  }
})

// updates the user's JSON of viewed homilies
router.post('/updateViewedHomilies', async (req, res) => {
  try{
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    const tempHomilyId = req.body.homilyId; // homily id ("temp" because we will trim in down)
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }
    let homilyId;

    if (experimentType == 'av'){
      homilyId = path.basename(tempHomilyId, '.mp4');
    } else {
      homilyId = path.basename(tempHomilyId, '.mp3');}

    userData.updateViewedHomilies(userId, userType, experimentSource, experimentType, homilyId).then(data => {
      res.send(JSON.stringify({'success message' : 'Viewed homilies updated'}));
      }).catch(async error => {
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use update used homilies route: ' + error.message), errorPath);
        });
        console.error(error);
        res.status(500).send('Unable to update viewed homilies');});
  } catch (error) {
    await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use update used homilies route: ' + error.message), errorPath);
    });
    console.error('unable to use update viewed homilies route: ', error.message);
  }
})

// when served a new homily, this will update the current video and playback time in case of refresh
router.post('/updatePlaybackTime', async (req, res) => {
  try {
    const userId = req.body.userId; // user id
    const userType = req.body.userType; // expert or laymen
    let experimentSource = req.body.experimentSource; // sona or prolific
    const experimentType = req.body.experimentType; // audio or av
    const homilyPath = req.body.homilyPath; // homily id ("temp" because we will trim in down)
    const playbackTime = req.body.playbackTime
    if (experimentSource == 'na'){ // if it is an expert change the value to an empty string (dumb but quick fix)
      experimentSource = '';
    }

    userData.updatePlaybackTime(userId, userType, experimentSource, experimentType, homilyPath, playbackTime).then(data => {
      res.send(JSON.stringify({'success message' : 'playback time updated'}));
      }).catch(async error => {
        await userData.fileQueueLogFile.enqueue(async () => {
          userData.logToFile(('Unable to use update playback time route: ' + error.message), errorPath);
        });
        console.error(error);
        res.status(500).send('Unable to update playback time');});
    } catch (error) {
      await userData.fileQueueLogFile.enqueue(async () => {
      userData.logToFile(('Unable to use update used homilies route: ' + error.message), errorPath);
    });
    console.error('unable to use update playback route: ', error.message);
  }
    
})
// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER POST ROUTES  ---------------------------------------------
// --------------------------------------------------------------------------------------------------


module.exports = router;
