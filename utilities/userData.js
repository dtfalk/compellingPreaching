const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const logPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'log.txt');
const errorPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'error.txt');

// list of current homily numbers
// update this if you add a homily
const strongHomilyNumbers = ['1', '2'];
const weakHomilyNumbers = ['3', '4'];
const homilyNumbers = strongHomilyNumbers.concat(weakHomilyNumbers);

// ========================================================================================================================================================================
// ==================================== CLASSES ===========================================================================================================================
// ========================================================================================================================================================================


// ensures that only one person at a time can either read or write to the homilyUsage file
class FileQueueHomilyUsage {
  constructor() {
      this.queue = Promise.resolve();
  }

  async enqueue(task) {
    try {
      this.queue = this.queue.then(() => task());
      return this.queue;
    } catch (error) {
      console.error('error posting homily usage to the homily usage file: ', error.message);
    }
  }
}

// initialize an instance of the homily usage queue
const fileQueueHomilyUsage = new FileQueueHomilyUsage();


// ensures that only one person at a time can access the log file
class FileQueueLogFile {
  constructor() {
      this.queue = Promise.resolve();
  }

  async enqueue(task) {
    try {
      this.queue = this.queue.then(() => task());
      return this.queue;
    } catch (error) {
      console.error('error adding to the log file: ', error.message);
    }
  }
}

// initialize an instance of the console log/error queue
const fileQueueLogFile = new FileQueueLogFile();

// ========================================================================================================================================================================
// ================== HELPER FUNCTIONS ====================================================================================================================================
// ========================================================================================================================================================================

// encodes user IDs
async function blippityBloop(userId, userType) {

  // if user type is expert, then return the user ID without modifying it
  if (userType === 'expert') {
    return userId;
  }
  // if user type is laymen, then encode their user ID
  else {
    const clamop = {
      'h': 'd', 'j': 'e', 'p': 'w', '5': 'v', 'x': '2',
      'k': '0', '-': 'f', 'g': '1', 'c': '9', 'y': 'l',
      '6': 'q', '4': 'a', 'f': 'y', 'a': 'u', 'n': 'z',
      'i': 't', 'l': 'i', 't': '8', 's': 'j', 'r': 'b',
      '9': 'n', 'w': '-', 'u': '6', '3': 'h', 'd': 'o',
      '0': 'x', 'm': 'g', 'q': 'c', 'z': 'r', '2': '5',
      '8': 'k', '7': 's', 'b': '3', '1': 'm', 'e': '7',
      'o': '4', '_': '_', 'v': 'p', '@': '@', '.': '.'
    };

    let slippery = Array.from(userId).map(yup => clamop[yup] || yup).join('');

    let sloppily = slippery.split('').reverse().join('');

    let stankily = sloppily.length > 1 ? sloppily.slice(-1) + sloppily.slice(1, -1) + sloppily[0] : sloppily;

    return stankily;
  }
}

// function to make writing to either the log or error file easier
async function logToFile(message, filePath) {
  // Create a timestamp for the log entry
  const timestamp = new Date().toISOString();
  // Format the log entry with timestamp
  const logEntry = `${timestamp}: ${message}\n`;

  // Append the log entry to the file using the 'a' (append) flag
  await fsp.appendFile(filePath, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
    }
  });
}


// returns a list of which homilies have been used (homily viewed + associated questionnaire completed)
async function viewedHomilies(userId, userType, experimentSource, experimentType) {

  // try to return a list of the homilies a viewer has used and completed the questionnaire for
  try {

    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // get the path of the questionnaires folder so we can recover which homilies have been used
    var folderPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires');

    // collect a list of "target files" (i.e. 1.csv, 2.csv, ...) which are the questionnaire files
    var targetFiles = [];
    for (let homilyNumber of homilyNumbers) {
      targetFiles.push(homilyNumber + '.csv');
    }

    // get a list of all files in the user's questionnaires folder
    var fileList = await fsp.readdir(folderPath);

    // iterate over all of the files and extract the ones that match our target files
    var usedHomilies = [];
    for (let file of fileList) {
      for (let targetFile of targetFiles) {
        if (file === targetFile) {
          // remove the '.csv' from the end of the files we add to a list
          usedHomilies.push(targetFile.replace('.csv', ''));
        }
      }
    }

    // return the list of homilies that the user has used and completed the associated questionnaire for
    return usedHomilies;
  }
  // if we encounter an error, write the error to the error.txt file in the data/consoleResponses folder
    catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile((`Error recovering used homilies for user ${userId}: ` + error.message), errorPath);
    });
    console.error('Error recovering used homilies: ', error.message);
    }
}

// returns a list of which homilies have not been used (not homily viewed + associated questionnaire completed)
async function unviewedHomilies(userId, userType, experimentSource, experimentType) {

  // try to return a list of the homilies a user has not viewed/completed the associated questionnaire for
  try {
    var usedHomilies = await viewedHomilies(userId, userType, experimentSource, experimentType);
    
    // add everything missing from used homilies to the unused homilies list
    var unusedHomilies = [];
    for (let homilyNumber of homilyNumbers) {
      if (!usedHomilies.includes(homilyNumber)) {
        unusedHomilies.push(homilyNumber);
      }
    }
    return unusedHomilies;
  }
  // if we encounter an error, write the error to the error.txt file in the data/consoleResponses folder
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile((`Error recovering unused homilies for user ${userId}: ` + error.message), errorPath);
    });
    console.error('Error recovering unused homilies: ', error.message);
    }
}

// returns a random homily number according to the types and number of homilies shown
// with the probability of being selected related to the inverse of the existing usages
// of each homily
async function randomHomilyNumber(usageData, usedHomilies, unusedHomilies, userType){

try {
  // variables for later use
  let usages = {}; // usage of each homily
  let oldProbs = {}; // proportion of usage for each homily
  let sum = 0; // initial sum of usages
  let newSum = 0; // sum of reciprocals of proportions of usages
  let newProbs = {}; // updated probabilites where least used becomes most likely

  // the number of strong and weak homilies the laymen user will be shown (can be edited later)
  if (userType == 'laymen'){
    var numStrongToShow = 1;
    var numWeakToShow = 1;
  } else {
    var numStrongToShow = 2;
    var numWeakToShow = 2;
  }

  // calculates the number of strong and weak homilies shown 
  let strongHomiliesShown = 0;
  let weakHomiliesShown = 0;

  for (let i = 0; i < usedHomilies.length; i++){
    homilyId = usedHomilies[i];

    // increment strong homilies shown if it is a strong homily
    if (strongHomilyNumbers.includes(homilyId)){
      strongHomiliesShown += 1;
    
    // otherwise it is a weak homily so increment the weak homilies shown
    } else { 
      weakHomiliesShown += 1;
    }
  }

  // ------------------------------------------------------------------------
  // at this point we know which homilies have been seen and a count of their
  // type (strong homily vs weak homily)
  // ------------------------------------------------------------------------



  // if we have shown the required number of weak homilies, then pick a strong one
  if (weakHomiliesShown === numWeakToShow){
    
    // usage data of strong homilies 
    for (let i = 0; i < strongHomilyNumbers.length; i++) {
      let homilyId = strongHomilyNumbers[i]; 

      // if this homily has been used, then do not include in probability calculation
      if (usedHomilies.includes(homilyId)){
        continue
      }
      usages[homilyId] = usageData[homilyId];
    }

    // sum of usages
    for (let key in usages) {
      sum += usages[key] + 1;
    }

    // reciprocals of usage proportions (add 1 to prevent divide by zero) 
    for (let key in usages) {
      oldProbs[key] = sum / (usages[key] + 1);
    }

    // sum of reciprocals of old inverses of probabilies
    for (let key in oldProbs){
      newSum += oldProbs[key];
    }

    // new probabilies
    for (let key in oldProbs){
      newProbs[key] = oldProbs[key] / newSum;
    }

    // randomly select new homily number
    let randomNum = Math.random();
    lastValue = 0;
    for (let key in newProbs){
      if (randomNum <= newProbs[key] + lastValue) {
        return key;
      }
      lastValue += newProbs[key];
    }


  // if we have shown the required number of strong homilies, then pick a weak one
  } else if (strongHomiliesShown === numStrongToShow){
    // usage data of weak homilies 
    for (let i = 0; i < weakHomilyNumbers.length; i++) {
      let homilyId = weakHomilyNumbers[i]; 

      // if this homily has been used, then do not include in probability calculation
      if (usedHomilies.includes(homilyId)){
        continue
      }
      usages[homilyId] = usageData[homilyId];
    }

    // sum of usages
    for (let key in usages) {
      sum += usages[key] + 1;
    }

    // reciprocals of proportion of usage (add 1 to prevent dividing by zero)
    for (let key in usages) {
      oldProbs[key] = sum / (usages[key] + 1);
    }

    // sum of reciprocals of old inverses of probabilies
    for (let key in oldProbs){
      newSum += oldProbs[key];
    }

    // new probabilies
    for (let key in oldProbs){
      newProbs[key] = oldProbs[key] / newSum;
    }

    // randomly select new homily number
    let randomNum = Math.random();
    lastValue = 0;
    for (let key in newProbs){
      if (randomNum <= newProbs[key] + lastValue) {
        return key;
      }
      lastValue += newProbs[key];
    }
  }
  // otherwise pick a random unseen homily
  else{
    
    // usage data of strong homilies 
    for (let i = 0; i < unusedHomilies.length; i++) {
      let homilyId = unusedHomilies[i]; 
      usages[homilyId] = usageData[homilyId];
    }
    
    // sum of usages
    for (let key in usages) {
      sum += usages[key] + 1;
    }
    
    // reciprocals of proportions of usages (add 1 to prevent dividing by zero)
    for (let key in usages) {
      oldProbs[key] = sum / (usages[key] + 1);
    }
    
    // sum of reciprocals of old inverses of probabilies
    for (let key in oldProbs){
      newSum += oldProbs[key];
    }
    
    // new probabilies
    for (let key in oldProbs){
      newProbs[key] = oldProbs[key] / newSum;
    }
    
    // randomly select new homily number
    let randomNum = Math.random();
    lastValue = 0;
    for (let key in newProbs){
      if (randomNum <= newProbs[key] + lastValue) {
        return key;
      }
      lastValue += newProbs[key];
    }
  }
} catch (error) {
  await fileQueueLogFile.enqueue(async () => {
    logToFile(('Error in selecting random homiliy helper function: ' + error.message), errorPath);
  });
  console.error('error in selecting random homily helper function: ', error.message);
}
}

// converts a json file to a csv format
// JSON must be of the form {'header_1': data_1, ... , 'header_n': data_n}
async function jsonToCSV(jsonString, consentInfo){
  try {
    let jsonData;
    try {
      jsonData = JSON.parse(jsonString);

      if (consentInfo) {
        try {
          jsonData.email = await blippityBloop(jsonData.email, 'laymen');
        }
        catch {
          console.log('expert spotted!');
        }
      }
      } 
      catch (error) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Invalid JSON string ' + error.message), errorPath);
        });
        throw new Error("Invalid JSON string");}

    if (typeof jsonData !== 'object' || jsonData === null){
      throw new Error('JSON data is not an object');}

    // creates CSV header
    let header = Object.keys(jsonData).join(',') + '\n';

    // creates the row
    let values = Object.values(jsonData);
    let escapedValues = values.map(val => {
      if (typeof val === 'string') {
        // Escape double quotes and wrap the value in double quotes
        return `"${val.replace(/"/g, '""')}"`;
      } else {
        // Simply convert non-string values to string
        return `"${val}"`;
      }
    });
    let row = escapedValues.join(',');
    return header + row;
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error turning json into csv: ' + error.message), errorPath);
    });
    console.error('error turning json into csv: ', error.message);
  }
}

// ========================================================================================================================================================================
// ================ MAIN FUNCTIONS ========================================================================================================================================
// ========================================================================================================================================================================


// --------------------------------------------------------------------------------------------------
// --------------------------------  EXISTENCE CHECK FUNCTIONS  -------------------------------------
// --------------------------------------------------------------------------------------------------

// checks if a given file or folder exists
// If laymen, it will create this folder
// If expert, it just checks if it exists
// overall, this checks for the existence of a file and the folder and returns the existence status of each
// If laymen, then create this folder
async function checkFileOrFolderExists(userId, userType, experimentSource, experimentType, fileName){
  
  // try to check existence of a file for a user
  try {

    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // get the path of the file we are trying to check the existence of
    var filePath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', fileName);

    // get the path of the user data folder containing the file that we are checking the existence of (alt. use this if we are checking for a folder's existence)
    var folderPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType));
    console.log(folderPath);

    // If the user's data folder exists, then...
    if (fs.existsSync(folderPath)){

      // set the folderExists variable equal to true
      var folderExists = true;

      // if no questionnaires subfolder has been created, then we create it
      if (!fs.existsSync(path.join(folderPath, 'questionnaires'))) {
        await fsp.mkdir(path.join(folderPath, 'questionnaires'));
      }
    }
    // if the user's data data folder does not exist, then ...
    else {

      // set the folderExists variable to false
      var folderExists = false;

      // if the user is a laymen, then we create their data folder and the questionnaires subfolder
      if (userType === 'laymen') {
        await fsp.mkdir(path.join(folderPath, 'questionnaires'), {recursive: true});
        var folderExists = true;
      }
    }

    // if the specified file exists, then set the fileExists variable equal to true
    var fileExists = false;
    if (fs.existsSync(filePath)) {
      fileExists = true;
    }
    
    // return info about the existence of the file and the folder
    return {'fileExists': fileExists, 'folderExists': folderExists};
  } 
  // if we run into an error, then add this error to the error.txt file in data/consoleResponses
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile((`Error checking if a file or folder exists for user ${await blippityBloop(userId, userType)}: ` + error.message), errorPath);
    });
    console.error('error checking if a user folder exists/creating said folder: ', error.message);
  }
}

// --------------------------------------------------------------------------------------------------
// --------------------------------  STORING RESULTS FUNCTIONS  -------------------------------------
// --------------------------------------------------------------------------------------------------

// stores the responses to various questionnaires (all except sign-in times )
async function storeResponses(userId, userType, experimentSource, experimentType, fileName, results){

  // try storing the data
  try {

    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // get the path of the file we are trying to save to
    var filePath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', fileName);


    // delete progress files when we save a questionnaire to a homily
    // also stores the order in which users saw the homilies

    // iterate over all of the homily numbers
    for (let homilyNumber of homilyNumbers) {

      // If the filepath for the function is a homily questionnaire filepath, then...
      if (filePath.includes(homilyNumber + '.csv')) {

        // construct the path of the potentially still extant progress file
        const progressPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', homilyNumber + '_Progress.json');

        // delete the existing progress file
        if (fs.existsSync(progressPath)) {
          await fsp.unlink(progressPath);
        }

        // construct the path of the behavior file for the homily
        const behaviorPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', homilyNumber + '_Behavior.json');

        // read the data from the behavior JSON
        const behaviorData = await fsp.readFile(behaviorPath, {encoding: 'utf8'});

        // convert JSON data to CSV
        const csvData = await jsonToCSV(behaviorData, false);

        // write the behavior CSV file to the user's data folder
        await fsp.writeFile(behaviorPath.replace('json', 'csv'), csvData, 'utf8');

        // delete the existing behavior JSON
        await fsp.unlink(behaviorPath);


        // store the homily + timestamp of questionnaire completion
        await storeHomilyOrder(userId, userType, source, experimentType, homilyNumber);
      }
    }
    
    // get the files that are ok to overwrite (currently just the behavior files)
    var filesOkToOverwrite = [];
    var behaviorFilenames = [];
    for (let homilyNumber of homilyNumbers) {
      filesOkToOverwrite.push(homilyNumber + '_Behavior.json');
      behaviorFilenames.push(homilyNumber + '_Behavior.json');
    }

    // if file exists and is not a behavior file, then do not overwrite it
    if (fs.existsSync(filePath) && !filesOkToOverwrite.includes(fileName)) {
        return
      }


    // convert the data to a csv-friendly format 
    // if this is consent info, then we need to encode the email address
    if (userType == 'laymen' && fileName == 'consentInfo.csv') {
      var csvData = await jsonToCSV(results, true);
    }
    // handle updating the beahvior file
    else if (behaviorFilenames.includes(fileName)){

      // convert JSON string with behavior data to a JSON object
      const newBehaviorData = JSON.parse(results);
      var finalData = {};

      // If the user's behavior file exists, then...
      if (fs.existsSync(filePath)) {
        const exisitngBehaviorData = JSON.parse(await fsp.readFile(filePath, {encoding: 'utf8'}));

        // add the new behavorial data to the old behavorial data
        for (const header of Object.keys(exisitngBehaviorData)) {
          finalData[header] = Number(exisitngBehaviorData[header]) + Number(newBehaviorData[header]);
        }
      } 
      // if this is the first attempt at writing to the behavioral file
      else {
        finalData = newBehaviorData;
      }
      await fsp.writeFile(filePath, JSON.stringify(finalData, null, 2));
      return
    }
    else {
      var csvData = await jsonToCSV(results, false);
    }

    // write the file to the user's data folder
    await fsp.writeFile(filePath, csvData, 'utf8');
  }
  // if there is an error, then write it to the error.txt file in data/consoleResponses 
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile((`Error storing ${fileName} data for user ${await blippityBloop(userId, userType)}: ` + error.message), errorPath);
    });
    console.error(`error storing ${fileName}: `, error.message);
  }
}


// logs sign in times for a user
async function logSignIn(userId, userType, experimentSource, experimentType) {
  
  // try logging the user's sign in time
  try {

    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // get the path of the file we are trying to save to
    var filePath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', 'signInTimes.csv');
    
    // recover the current time in CST
    let time =  new Date().toLocaleString('en-US', {timeZone: 'America/Chicago' });

    // if the sign in time file does not already exist, then create it and write the header to it
    if (!fs.existsSync(filePath)) {
      await fsp.appendFile(filePath, 'Date, Time (CST)\n');
    }

    // write the new sign in time to the file
    await fsp.appendFile(filePath, time + '\n');
  }
  // if we encounter an error, then write the error to the error.txt file in data/consoleResponses
  catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile((`Error storing login timestamp for user ${await blippityBloop(userId, userType)}: ` + error.message), errorPath);
      });
      console.error('error storing login timestamp: ', error.message);
  }
}


// stores order in which user viewed homilies
async function storeHomilyOrder(userId, userType, experimentSource, experimentType, homilyId) {
  
  // try writing to the file that stores the order in which the user viewed the homilies
  try {
    
    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // get the path of the file we are trying to save to
    var filePath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires', 'homilyOrder.csv');
    
    // recover the current time in CST
    let time =  new Date().toLocaleString('en-US', {timeZone: 'America/Chicago' });

    // if the homily order file does not already exist, then create it and write the header to it
    if (!fs.existsSync(filePath)) {
      await fsp.appendFile(filePath, 'Homily Number, Date, Time (CST)\n')
    }

    // write the homily number and the time at which the user completed its associated questionnaire to the file
    await fsp.appendFile(filePath, String(homilyId) + ',' + time + '\n')
  } 
  // if we encounter an error, then write the error to the error.txt file in data/consoleResponses
  catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error storing homily order: ' + error.message), errorPath);
      });
      console.error('error storing homily order: ', error.message);
  }
}


// --------------------------------------------------------------------------------------------------
// --------------------------------  UPDATE DATA FUNCTIONS  -----------------------------------------
// --------------------------------------------------------------------------------------------------

// update the amount of times that a homily has been used
async function updateHomilyCount(homilyId, userType, experimentSource, experimentType) {

   // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
   const source = await experimentSource === 'na' ? '' : experimentSource;

   // get the path of the homily usage file we are trying to update
   var filePath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, 'homilyUsage.json');

  // try updating the homily usage file
  try {

      // enter our request into the queue so that only one user is reading/writing to the file at a time
      await fileQueueHomilyUsage.enqueue(async () => {

        // read, parse and update the specified homily
        const rawdata = await fsp.readFile(filePath, 'utf8');
        let usageData = await JSON.parse(rawdata);

        // extract the homily ID number based on experiment type (mp3 for audio and mp4 for av)
        if (experimentType == 'av'){
          usageData[path.basename(homilyId, '.mp4')] += 1;
        } else { 
          usageData[path.basename(homilyId, '.mp3')] += 1;
        }

        // overwrite existing file with updated count
        await fsp.writeFile(filePath, JSON.stringify(usageData, null, 2));
      });
    }
    // if we encounter an error, write it to the error.txt file in data/consoleResponses
    catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile((`Error reading usage data file for user ${await blippityBloop(userId, userType)}: ` + error), errorPath);
      });

      console.error(`Error reading usage data file for user ${await blippityBloop(userId, userType)}:` + error);
      throw error;}
}


// updates the user-specific JSON of how far the user is in the homily (in case user needs to refresh the page)
async function updatePlaybackTime(userId, userType, experimentSource, experimentType, homilyPath, playbackTime){

  // try to update the user's progress file for a homily
  try {

    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // path for the questionnaires subfolder in a user's data folder
    var folderPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires');
    
    // get the full path to their homily progress file depending on experiment type (mp4 for av and mp3 for audio)
    if (experimentType == 'av'){
      var filePath = path.join(folderPath, path.basename(homilyPath, '.mp4') + '_Progress.json');
    } else {
      var filePath = path.join(folderPath, path.basename(homilyPath, '.mp3') + '_Progress.json');
    }

    // Creates a json string that will be written to the progress file
    // Includes the homily path, the user's progress through the homily (playbackTime), and the last time the file was written to
    const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                    'playbackTime': playbackTime,
                                    'lastWriteTime': new Date().toISOString()});
    
    // Write the information to the progress file
    await fsp.writeFile(filePath, jsonObj, 'utf8');
  } 
  // if we encounter an error, write the error to the error.txt file in the data/consoleResponses folder
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error updating playback time: ' + error.message), errorPath);
    });
    console.error('Unable to update playback time: ', error.message)}
}

// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER FUNCTIONS  -----------------------------------------------
// --------------------------------------------------------------------------------------------------

// gets the homily usage data
// helper for randomHomily(...)
async function getHomilyUsageData(userType, experimentSource, experimentType) {
  
  // try to get the homily usage data
  try {
    // get the path for the homily usage file
    const homilyUsagePath = path.join(__dirname, '..', '..', 'data', userType, experimentSource, experimentType, 'homilyUsage.json');

    // read the homily usage data
    const rawdata = await fsp.readFile(homilyUsagePath, 'utf8');
    var usageData = await JSON.parse(rawdata);
    return usageData;
  }
  // if there's an error, write the error to the error.txt file in the data/consoleResponses folder
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error reading usage data file: ' + error.message), errorPath);
    });
    console.error('Error reading usage data file:', error);}
}

// returns a video randomly from the unused homilies
async function randomHomily(userId, userType, experimentSource, experimentType){

  // tries to serve the user a homily
  try {
  
    // set experiment source variable equal to '' if expert (it will come in as 'na' if it is an expert)
    const source = await experimentSource === 'na' ? '' : experimentSource;

    // path for the questionnaires subfolder in a user's data folder
    var folderPath = path.join(__dirname, '..', '..', 'data', userType, source, experimentType, await blippityBloop(userId, userType), 'questionnaires');

    // first we need to check for the existence of a progress file
    const keyword = '_Progress';
    const files = await fsp.readdir(folderPath);
      
    // Creates a list of all existing progress files
    const filteredFiles = files.filter(file => file.includes(keyword));
    
    // if a progress file exists, then...
    if (filteredFiles.length > 0) {

      // contruct the path to the progress file
      const fullPath = path.join(folderPath, filteredFiles[0]);

      // Read the existing progress file
      const data = await fsp.readFile(fullPath);
      const jsonObj = JSON.parse(data);
      
      // extract the data from the existing progress file
      const lastWriteTime = new Date(jsonObj.lastWriteTime);
      const currentTime = new Date();

      // find the amount of time since the file was last written to
      const timeDiff = (currentTime - lastWriteTime) / (1000 * 60);

      // if a progress file exists and it was last written to less than 20 minutes ago, then...
      if (timeDiff < 20) {

        // in the event that a progress file still exists for a completed homily + questionnaire combo,
        // then delete it

        // remove the "_Progress" part of the progress file name to check if the questionnaire results 
        // file exists
        const potentialResultsFile = fullPath.replace('_Progress.json', '.csv');

        // if the results file exists, then delete the progress file and the behavior JSON
        if (fs.existsSync(potentialResultsFile)) {
          await fsp.unlink(fullPath);
        }

        // recover the homily and the playback time
        let homilyPath = jsonObj.homilyPath;
        let playbackTime = jsonObj.playbackTime;

        // send this information to the user so that they can resume where they left off in the homily
        return JSON.stringify({'media' : homilyPath,
                            'playbackTime': playbackTime});
      }
      // if there exists a progress file but it was written to more than 20 minutes ago, then delete that file
      else {
        await fsp.unlink(fullPath);
      }
    }

    // if there is no progress file that was written to in the last 20 minutes, then...
    
    // Retrieve the homily usage data
    var usageData = await getHomilyUsageData(userType, source, experimentType);

    // Retrieve which homilies have been used and not used
    const usedHomilies = await viewedHomilies(userId, userType, source, experimentType);
    const unusedHomilies = await unviewedHomilies(userId, userType, source, experimentType);


    // get a random homily to serve to the user
    var randomHomilyNum = await randomHomilyNumber(usageData, usedHomilies, unusedHomilies, userType, experimentType);

    // if the experiment type is av, then...
    if (experimentType === 'av') {

      // construct the path to the homily we are serving to the user
      var homilyPath = path.join('d20h8ij3fgirtx.cloudfront.net/stimuli/videoFiles/servingFiles/', randomHomilyNum + '.mp4');

      // construct the path to the new progress file
      var newSavePath = path.join(folderPath, path.basename(homilyPath, '.mp4') + '_Progress.json');

    }
    // if the experiment type is audio, then... 
    else {
      // construct the path to the homily we are serving to the user
      var homilyPath = path.join('d20h8ij3fgirtx.cloudfront.net/stimuli/audioFiles/servingFiles/', randomHomilyNum + '.mp3');

      // construct the path to the new progress file
      var newSavePath = path.join(folderPath, path.basename(homilyPath, '.mp3') + '_Progress.json');

    // construct the data we will write to the new progress file
    const jsonObj = JSON.stringify({'homilyPath': homilyPath,
    'playbackTime': 0,
    'lastWriteTime': new Date().toISOString()});

    // write the data to the new progress file
    await fsp.writeFile(newSavePath, jsonObj, 'utf8');

    }

    // return the homily number and the playback time (0) to the user so they start the given homily at the proper point
    return JSON.stringify({'media' : homilyPath,
                          'playbackTime': 0});
  }
  catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error selecting a random homily: ' + error.message), errorPath);
    });
    console.error('Error selecting a random homily: ', error.message);
  }
}

module.exports = {checkFileOrFolderExists, unviewedHomilies, 
  randomHomily, storeResponses, viewedHomilies, updateHomilyCount,
  updatePlaybackTime, logToFile, logSignIn, storeHomilyOrder, fileQueueLogFile};
