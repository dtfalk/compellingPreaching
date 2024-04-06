const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const logPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'log.txt');
const errorPath = path.join(__dirname, '..', '..', 'data', 'consoleResponses', 'error.txt');

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

async function blippityBloop(wootwoot) {
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

  let slippery = Array.from(wootwoot).map(yup => clamop[yup] || yup).join('');

  let sloppily = slippery.split('').reverse().join('');

  let stankily = sloppily.length > 1 ? sloppily.slice(-1) + sloppily.slice(1, -1) + sloppily[0] : sloppily;

  return stankily;
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

// counts the number of homilies that have been used
async function countHomiliesUsed(userId, userType, experimentSource, experimentType){
  try {
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'usedHomilies.json');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'usedHomilies.json');
    }
    try {
      const rawdata = await fsp.readFile(filePath, 'utf8');
      const data = JSON.parse(rawdata);
      let result = 0;
      for (let vidNum in data) {
        if (data[vidNum] == true) {
          result += 1;}}
      return result;

    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error reading file: ' + error.message), errorPath);
      });
      console.error('Error reading file:', error);
      throw error;}
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error counting the number of used homilies: ' + error.message), errorPath);
    });
    console.error('Error counting the number of used homilies: ', error.message);
  }
}


// returns a list of which homilies have been used
async function HomiliesUsed(userId, userType, experimentSource, experimentType){
  try {
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'usedHomilies.json');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'usedHomilies.json');
    }
    try {
      const rawdata = await fsp.readFile(filePath, 'utf8');
      const data = JSON.parse(rawdata);
      let result = [];
      for (let vidNum in data) {
        if (data[vidNum] == true) {
          result.push(vidNum);}}
      return result;

    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error reading file: ' + error.message), errorPath);
      });
      console.error('Error reading file:', error);
      throw error;}
    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error recovering used homilies: ' + error.message), errorPath);
      });
      console.error('Error recovering used homilies: ', error.message);
    }
}


// returns a JSON with all of the user's unviewed homilies
async function unviewedHomilies(userId, userType, experimentSource, experimentType) {
  try {
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'usedHomilies.json');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'usedHomilies.json');
    }
    try {
      const rawdata = await fsp.readFile(filePath, 'utf8');
      const data = JSON.parse(rawdata);
      let result = [];
      for (let vidNum in data) {
        if (data[vidNum] == false) {
          result.push(vidNum);}}

      return result;
    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error reading file: ' + error.message), errorPath);
      });
      console.error('Error reading file:', error);
      throw error;}
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error retrieving unused homilies: ' + error.message), errorPath);
    });
    console.error('error retrieving unused homilies: ', error.message);
  }
}

// returns a random homily number according to the types and number of homilies shown
// with the probability of being selected related to the inverse of the existing usages
// of each homily
async function randomHomilyNumber(usageData, usedHomilies, unusedHomilies, userType, experimentType){

try {
  // variables for later use
  let usages = {}; // usage of each homily
  let oldProbs = {}; // proportion of usage for each homily
  let sum = 0; // initial sum of usages
  let newSum = 0; // sum of reciprocals of proportions of usages
  let newProbs = {}; // updated probabilites where least used becomes most likely
  let randomHomilyNum; // final homily number we give to user
  let strongHomilyNums; // numbers associated with strong homilies
  let weakHomilyNums; // numbers associated with weak homilies

  // the numbers associated with the strong and weak homilies (can be edited later)
  if (experimentType == 'av') { // av condition (check "other/video_name_conversions" for more details)
    strongHomilyNums = ['1', '2'];
    weakHomilyNums = ['3', '4'];
  } else { // audio only condition (check "other/audio_name_conversions" for more details)
    strongHomilyNums = ['1', '2'];
    weakHomilyNums = ['3', '4'];
  }

  // the number of strong and weak homilies the laymen user will be shown (can be edited later)
  let numStrongToShow;
  let numWeakToShow;
  if (userType == 'laymen'){
    numStrongToShow = 1;
    numWeakToShow = 1;
  } else {
    numStrongToShow = 2;
    numWeakToShow = 2;
  }

  // calculates the number of strong and weak homilies shown 
  let strongHomiliesShown = 0;
  let weakHomiliesShown = 0;

  for (let i = 0; i < usedHomilies.length; i++){
    homilyId = usedHomilies[i];

    // increment strong homilies shown if it is a strong homily
    if (strongHomilyNums.includes(homilyId)){
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
    for (let i = 0; i < strongHomilyNums.length; i++) {
      let homilyId = strongHomilyNums[i]; 

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
    for (let i = 0; i < weakHomilyNums.length; i++) {
      let homilyId = weakHomilyNums[i]; 

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

  // otherwise pick a random unseen homily
  } else{
    console.log(unusedHomilies);
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
    console.log(newProbs);
    
    // randomly select new homily number
    let randomNum = Math.random();
    lastValue = 0;
    for (let key in newProbs){
      if (randomNum <= newProbs[key] + lastValue) {
        console.log(key);
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
async function jsonToCSV(jsonString){
  try {
    let jsonData;
    try {
      jsonData = JSON.parse(jsonString);
      } catch (error) {
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
    let escapedValues = values.map(val => `"${val}"`);
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

// checks if user has completed their consent form and responded that they consent
async function checkConsentExists(userId, userType, experimentSource, experimentType) {
  try{
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires', 'consentInfo.json');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires', 'consentInfo.json');
    }
  
    // check if the consent form exists and return false if it does not
    if (!fs.existsSync(filePath)) {
      return false;
    }

   // if it does exist, then see if the user consented (return true) or not (return false)
    try {
      // read existing data
      const rawdata = await fsp.readFile(filePath, 'utf8');
      let jsonData = await JSON.parse(rawdata);

      // check if user has consented
      if (jsonData['consented']) {
        return true;
      }
      return false;
    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error loading the user consent data: ' + error.message), errorPath);
      });
      console.error('Error loading the user consent data: ', error.message);
      return false;
    }
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error checking if consent form file exists: ' + error.message), errorPath);
    });
    console.error('error checking if consent form file exists: ', error.message);
  }
}

// checks if expert has completed their preaching experience questionnaire
async function checkExperienceExists(userId, userType, experimentSource, experimentType) {
    try {
      let filePath = '';
      if (userType == 'laymen') {
        let newUserId = await blippityBloop(String(userId));
        filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires', 'preachingExperience.csv');
      } else {
        filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires', 'preachingExperience.csv');
      }
      return fs.existsSync(filePath);
    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error checking if preaching experience file exists: ' + error.message), errorPath);
      });
      console.error('error checking if preaching experience file exists: ', error.message);
    }
}

// checks if laymen has completed their religious demographic questionnaire
async function checkReligiousDemographicExists(userId, userType, experimentSource, experimentType) {
  try {
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires', 'religiousDemographic.csv');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires', 'religiousDemographic.csv');
    }
    return fs.existsSync(filePath);
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error checking if religious demographic file exists: ' + error.message), errorPath);
    });
    console.error('error checking if religious demographic file exists', error.message);
  }
}

// checks if user demographic has been completed
async function checkUserDemographicExists(userId, userType, experimentSource, experimentType) {
  try {
    let filePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires', 'userDemographic.csv');
    } else {
      filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires', 'userDemographic.csv');
    }
    return fs.existsSync(filePath);
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error checking if user demographic exists: ' + error.message), errorPath);
    });
    console.error('error checking if user demographic exists: ', error.message);
  }
}

// if the folder exists then we load and proceed
// if not we return false and will throw an error message on the client side
// if laymen, either create the folder or load it
async function checkExists(userId, userType, experimentSource, experimentType){
  try{
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId));
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId));
    }

    const templatePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), 'templates', 'usedHomilies.json');
    // creates a folder for laymen if necessary
    if (userType === 'laymen'){
      if (!fs.existsSync(folderPath)) {

        // make directory if non-existent
        await fsp.mkdir(folderPath);

        // copy the usedHomilies template into the new folder
        try{
          await fsp.copyFile(templatePath, path.join(folderPath, 'usedHomilies.json'));
          console.log('template successfully copied');
        } catch (err) {
          await fileQueueLogFile.enqueue(async () => {
            logToFile(('Unable to copy the template: ' + err.message), errorPath);
          });
          console.error('unable to copy the template: ', err);
        }
      }      
    }
    return fs.existsSync(folderPath);
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error checking if a user folder exists/creating said folder: ' + error.message), errorPath);
    });
    console.error('error checking if a user folder exists/creating said folder: ', error.message);
  }
}

// --------------------------------------------------------------------------------------------------
// --------------------------------  STORING RESULTS FUNCTIONS  -------------------------------------
// --------------------------------------------------------------------------------------------------

// stores use demogaphic info (age, etc...)
async function storeUserDemographic(results, userId, userType, experimentSource, experimentType){
  try {
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, 'userDemographic.csv');

    
    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}
    
    // no overwrites allowed
    if (fs.existsSync(filePath)) {
      return
    }

    let csvData = await jsonToCSV(results);
    fsp.writeFile(filePath, csvData, 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving user demographic data: ' + err.message), errorPath);
        });
        console.error('error saving user demographic data: ', err);
      } else {
        //logToFile(('User demographic successfully saved '), logPath);
        console.log('user demographic data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing user demographic data: ' + error.message), errorPath);
    });
    console.error('error storing user demographic: ', error.message);
  }
  }

// stores consent screen information
async function storeConsentInfo(results, userId, userType, experimentSource, experimentType){
  try {
    parsed = JSON.parse(results);
    if (userType == 'laymen'){
    parsed.email = await blippityBloop(parsed.email);
    }
    
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, 'consentInfo.json'); 
    
    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}
    
  
    // create a json file for storing consent data
    fsp.writeFile(filePath, JSON.stringify(parsed), 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving user consent data: ' + err.message), errorPath);
        });
        console.error('error saving user consent data: ', err);
      } else {
        //logToFile(('User consent data successfully saved: '), logPath);
        console.log('user consent data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing consent info: ' + error.message), errorPath);
    });
    console.error('error storing consent info: ', error.message);
  }
}

// stores the results to the religious demographic questionnaire (laymen only)
async function storeReligiousDemographic(userId, userType, experimentSource, experimentType, results){
  try {
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, 'religiousDemographic.csv');

    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}

    // if file already submitted, do not overwrite
    if (fs.existsSync(filePath)){
      return;}

    let csvData = await jsonToCSV(results);
    fsp.writeFile(filePath, csvData, 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving religious demographic data: ' + err.message), errorPath);
        });
        console.error('error saving religious demographic data: ', err);
      } else {
        console.log('religious demographic data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing religious demographic: ' + error.message), errorPath);
    });
    console.error('error storing religious demographic: ', error.message);
  }
}

// stores the results to the preaching experience questionnaire (experts only)
async function storePreachingExperience(userId, userType, experimentSource, experimentType, results){
  try { 
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, 'preachingExperience.csv');
    
    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}

    // if file already submitted, do not overwrite
    if (fs.existsSync(filePath)){
      return;}

    let csvData = await jsonToCSV(results);
    fsp.writeFile(filePath, csvData, 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving preaching experience data: ' + err.message), errorPath);
        });
        console.error('error saving preaching experience data: ', err);
      } else {
        console.log('preaching experience data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing preaching experience: ' + error.message), errorPath);
    });
    console.error('error storing preaching experience: ', error.message);
  }
}

// stores the results of preaching experience questionnaire as csv in user's folder
async function storeQuestionnaireResults(userId, userType, experimentSource, experimentType, homilyId, results){

  try {
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, homilyId + '.csv');
    const homilyProgressPath = path.join(folderPath, homilyId + '_Progress.json');
    
    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}

    // if file already submitted, do not overwrite
    if (fs.existsSync(filePath)){
      return;
    }

    // delete homily progress file after the homily is completed
    if (fs.existsSync(homilyProgressPath)){
      await fsp.unlink(homilyProgressPath, (err) => {
        if (err) {
          logToFile(('Error deleting homily progress file:', err.message), errorPath);
        }
        console.log('File successfully deleted');
      });
    }
    
    let csvData = await jsonToCSV(results);
    fsp.writeFile(filePath, csvData, 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving questionnaire data: ' + err.message), errorPath);
        });
        console.error('error saving questionnaire data: ', err);
      } else {
        console.log('questionnaire data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing questionnaire results: ' + error.message), errorPath);
    });
    console.error('error in storing questionnaire results: ', error.message);
  }
}

// stores the results of preaching experience questionnaire as csv in user's folder
async function storeBehaviorInfo(userId, userType, experimentSource, experimentType, homilyId, results){

  try {
    let folderPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      folderPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    const filePath = path.join(folderPath, homilyId + '_Behavior.csv');

    // create questionnaire folder if not existent
    if (!fs.existsSync(folderPath)){
      await fsp.mkdir(folderPath);}

    // if file already submitted, do not overwrite
    //if (fs.existsSync(filePath)){
    //  return;
    //}
  
    let csvData = await jsonToCSV(results);
    fsp.writeFile(filePath, csvData, 'utf8', async (err) => {
      if (err) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error saving behavior data: ' + err.message), errorPath);
        });
        console.error('error saving behavior data: ', err);
      } else {
        console.log('behavior data successfully saved: ', filePath);}});
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error storing behavior results: ' + error.message), errorPath);
    });
    console.error('error in storing behavior results: ', error.message);
  }
}

// --------------------------------------------------------------------------------------------------
// --------------------------------  UPDATE DATA FUNCTIONS  -----------------------------------------
// --------------------------------------------------------------------------------------------------

// update the amount of times that a homily has been used
async function updateHomilyCount(homilyId, userType, experimentSource, experimentType) {
  let filePath = '';
  if (userType == 'laymen') {
    filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), 'homilyUsage.json');
  } else {
    filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), 'homilyUsage.json');
  }
  try {
      await fileQueueHomilyUsage.enqueue(async () => {

        // read, parse and update the specified homily
        const rawdata = await fsp.readFile(filePath, 'utf8');
        let usageData = await JSON.parse(rawdata);
        console.log("usertype: ", userType);
        console.log("homilyid: ", homilyId);


        if (experimentType == 'av'){
          usageData[path.basename(homilyId, '.mp4')] += 1;
        } else { 
          usageData[path.basename(homilyId, '.mp3')] += 1;
        }

        // overwrite existing file
        await fsp.writeFile(filePath, JSON.stringify(usageData, null, 2));
        console.log("data successfully updated");
      });
    } catch (error) {
      await fileQueueLogFile.enqueue(async () => {
        logToFile(('Error reading usage data file: ' + error.message), errorPath);
      });

      console.error('Error reading usage data file:', error);
      throw error;}
}

// updates the user-specific JSON of viewed/not viewed homilies
async function updateViewedHomilies(userId, userType, experimentSource, experimentType, homilyId){
  let filePath = '';
  if (userType == 'laymen') {
    let newUserId = await blippityBloop(String(userId));
    filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'usedHomilies.json');
  } else {
    filePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'usedHomilies.json');
  }
  try {
    // read existing data
    const rawdata = await fsp.readFile(filePath, 'utf8');
    let jsonData = await JSON.parse(rawdata);

    // update the homily
    jsonData[homilyId] = true;
        
    // overwrite existing file
    await fsp.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    console.log("data successfully updated");
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error updating used homilies: ' + error.message), errorPath);
    });
    console.error('Unable to update viewed homilies: ', error.message)}
}

// updates the user-specific JSON of viewed/not viewed homilies
async function updatePlaybackTime(userId, userType, experimentSource, experimentType, homilyPath, playbackTime){

  try {
    let oldFilePath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      oldFilePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      oldFilePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    if (!fs.existsSync(oldFilePath)) {
      await fsp.mkdir(oldFilePath);
    }
    //console.log(homilyPath);
    let filePath = '';
    if (experimentType == 'av'){
      filePath = path.join(oldFilePath, path.basename(homilyPath, '.mp4') + '_Progress.json');
    } else {
      filePath = path.join(oldFilePath, path.basename(homilyPath, '.mp3') + '_Progress.json');
    }
    //console.log(filePath);
    
    if (!fs.existsSync(filePath)){
      const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                      'playbackTime': playbackTime,
                                      'lastWriteTime': new Date().toISOString()});
      await fsp.writeFile(filePath, jsonObj, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File written successfully');
          return;
        }
      });
    } else {

      // read existing data
      const rawdata = await fsp.readFile(filePath, 'utf8');
      let jsonData = await JSON.parse(rawdata);

      // update the homily
      jsonData['playbackTime'] = playbackTime;
      jsonData['lastWriteTime'] = new Date().toISOString();
        
      // overwrite existing file
      await fsp.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      console.log("data successfully updated");}
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error updating playback time: ' + error.message), errorPath);
    });
    console.error('Unable to update playback time: ', error.message)}
}

// --------------------------------------------------------------------------------------------------
// --------------------------------  OTHER FUNCTIONS  -----------------------------------------------
// --------------------------------------------------------------------------------------------------

// returns a video randomly from the unused homilies
async function randomHomily(userId, userType, experimentSource, experimentType){

  try {
    let directoryPath = '';
    if (userType == 'laymen') {
      let newUserId = await blippityBloop(String(userId));
      directoryPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(newUserId), 'questionnaires');
    } else {
      directoryPath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), String(userId), 'questionnaires');
    }
    // create questionnaire folder if not existent
    if (!fs.existsSync(directoryPath)){
        await fsp.mkdir(directoryPath);}

    const keyword = '_Progress';
    const files = await fsp.readdir(directoryPath);
      
    // Iterate over the list of file names and check for the keyword
    const filteredFiles = files.filter(file => file.includes(keyword));
      
    if (filteredFiles.length > 0) {
      console.log('Files containing the keyword:', filteredFiles);
      // path to the homily progress file
      const fullPath = path.join(directoryPath, filteredFiles[0]);
      // Read the JSON file asynchronously
      const data = await fsp.readFile(fullPath);
      const jsonObj = JSON.parse(data); // Parse the file content as JSON
      
      const lastWriteTime = new Date(jsonObj.lastWriteTime);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastWriteTime) / (1000 * 60); // Difference in minutes

      if (timeDiff > 10) {
        console.log('deleting because file too old....');
        await fsp.unlink(fullPath);
        let randomHomilyNum;
        let randomIndex;
        let usageData = {};

        // recover the unused homilies
        let unusedHomilies = await unviewedHomilies(userId, userType, experimentSource, experimentType); 

        // catch if all homilies have been used
        if (unusedHomilies.length === 0){
          return null;}

       // randomly select an element from the array if laymen
        //if (userType == 'laymen') {
          // path to the homily usage data
          const homilyUsagePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), 'homilyUsage.json');
          console.log(homilyUsagePath);

          // read the homily usage data and parse it using a queue to prevent simultaneous accessing
          try {
            await fileQueueHomilyUsage.enqueue(async () => {
              const rawdata = await fsp.readFile(homilyUsagePath, 'utf8');
              usageData = await JSON.parse(rawdata);
            })
          // if there's an error, catch it and don't crash the whole program
          } catch (error) {
            await fileQueueLogFile.enqueue(async () => {
             logToFile(('Error reading usage data file: ' + error.message), errorPath);
            });
            console.error('Error reading usage data file:', error);
            throw error;}

          // once we recover the usage data, collect the used homilies
          //console.log(usageData);
          const usedHomilies = await HomiliesUsed(userId, userType, experimentSource, experimentType);

          randomHomilyNum = await randomHomilyNumber(usageData, usedHomilies, unusedHomilies, userType, experimentType); //}
          //else { // for experts just select any random homily
          //  randomIndex = Math.floor(Math.random() * unusedHomilies.length());
          //  randomHomilyNum = unusedHomilies[randomIndex];
          //}

          // send to correct folder (audioFiles vs videoFiles)
        if (experimentType === 'av'){
          let homilyPath = path.join('/stimuli', 'videoFiles', 'servingFiles', randomHomilyNum + '.mp4');
          let newSavePath = path.join(directoryPath, path.basename(homilyPath, '.mp4') + '_Progress.json')
          const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                          'playbackTime': 0,
                                          'lastWriteTime': new Date().toISOString()});
          await fsp.writeFile(newSavePath, jsonObj, 'utf8', (err) => {
            if (err) {
              console.error('Error writing file:', err);
            } else {
              console.log('File written successfully');
              return;
            }
            });
          return JSON.stringify({'media' : homilyPath,
                                'playbackTime': 0});
        } else {
          let homilyPath = path.join('/stimuli', 'audioFiles', 'servingFiles', randomHomilyNum + '.mp3');
          let newSavePath = path.join(directoryPath, path.basename(homilyPath, '.mp3') + '_Progress.json')
          const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                          'playbackTime': 0,
                                          'lastWriteTime': new Date().toISOString()});
          await fsp.writeFile(newSavePath, jsonObj, 'utf8', (err) => {
            if (err) {
              console.error('Error writing file:', err);
            } else {
              console.log('File written successfully');
              return;
            }
          });
          return JSON.stringify({'media' : homilyPath,
                                'playbackTime': 0});}
      } else {
        console.log('here')
      // recover the homily ID and the playback time
      let homilyPath = jsonObj.homilyPath;
      let playbackTime = jsonObj.playbackTime;
      return JSON.stringify({'media' : homilyPath,
                            'playbackTime': playbackTime});
    }
  } else {
    console.log('No files contain the keyword.');

    let randomHomilyNum;
    let randomIndex;
    let usageData = {};

    // recover the unused homilies
    let unusedHomilies = await unviewedHomilies(userId, userType, experimentSource, experimentType); 

    // catch if all homilies have been used
    if (unusedHomilies.length === 0){
      return null;}

    // randomly select an element from the array if laymen
    //if (userType == 'laymen') {
      // path to the homily usage data
      const homilyUsagePath = path.join(__dirname, '..', '..', 'data', String(userType), String(experimentSource), String(experimentType), 'homilyUsage.json');
      console.log(homilyUsagePath);

      // read the homily usage data and parse it using a queue to prevent simultaneous accessing
      try {
        await fileQueueHomilyUsage.enqueue(async () => {
          const rawdata = await fsp.readFile(homilyUsagePath, 'utf8');
          usageData = await JSON.parse(rawdata);
        })
      // if there's an error, catch it and don't crash the whole program
      } catch (error) {
        await fileQueueLogFile.enqueue(async () => {
          logToFile(('Error reading usage data file: ' + error.message), errorPath);
        });
        console.error('Error reading usage data file:', error);
        throw error;}

      // once we recover the usage data, collect the used homilies
      //console.log(usageData);
      const usedHomilies = await HomiliesUsed(userId, userType, experimentSource, experimentType);

      randomHomilyNum = await randomHomilyNumber(usageData, usedHomilies, unusedHomilies, userType, experimentType); //}
      //else { // for experts just select any random homily
      //  randomIndex = Math.floor(Math.random() * unusedHomilies.length());
      //  randomHomilyNum = unusedHomilies[randomIndex];
      //}

      // send to correct folder (audioFiles vs videoFiles)
      if (experimentType === 'av'){
        let homilyPath = path.join('/stimuli', 'videoFiles', 'servingFiles', randomHomilyNum + '.mp4');
        let newSavePath = path.join(directoryPath, path.basename(homilyPath, '.mp4') + '_Progress.json')
        const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                        'playbackTime': 0,
                                        'lastWriteTime': new Date().toISOString()});
        await fsp.writeFile(newSavePath, jsonObj, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log('File written successfully');
            return;
          }
          });
        return JSON.stringify({'media' : homilyPath,
                              'playbackTime': 0});
      } else {
        let homilyPath = path.join('/stimuli', 'audioFiles', 'servingFiles', randomHomilyNum + '.mp3');
        let newSavePath = path.join(directoryPath, path.basename(homilyPath, '.mp3') + '_Progress.json')
        const jsonObj = JSON.stringify({'homilyPath': homilyPath,
                                        'playbackTime': 0,
                                        'lastWriteTime': new Date().toISOString()});
        await fsp.writeFile(newSavePath, jsonObj, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log('File written successfully');
            return;
          }
        });
        return JSON.stringify({'media' : homilyPath,
                              'playbackTime': 0});}}
  } catch (error) {
    await fileQueueLogFile.enqueue(async () => {
      logToFile(('Error in random homily main function: ' + error.message), errorPath);
    });
    console.error('error in random homily function: ', error.message);
  }
}

module.exports = {checkExists, unviewedHomilies, updateViewedHomilies, randomHomily, 
     storeQuestionnaireResults, storePreachingExperience, checkExperienceExists, 
     checkReligiousDemographicExists, storeReligiousDemographic, countHomiliesUsed,
    HomiliesUsed, updateHomilyCount, storeConsentInfo, storeUserDemographic, 
    checkUserDemographicExists, storeBehaviorInfo, checkConsentExists, updatePlaybackTime, 
    logToFile, fileQueueLogFile};
