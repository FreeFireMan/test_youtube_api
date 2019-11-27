var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var gapi = require('googleapis');
const fetch = require('node-fetch');
var OAuth2 = google.auth.OAuth2;
const http = require('https');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
console.log("TOKEN_DIR");
console.log(TOKEN_DIR);
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), getChannel);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getChannel(auth) {
    var service = google.youtube('v3');
    /* service.channels.list({
         auth: auth,
         part: 'snippet,contentDetails,statistics',
         forUsername: 'GoogleDevelopers'
     }, function(err, response) {
         if (err) {
             console.log('The API returned an error: ' + err);
             return;
         }
         var channels = response.data.items;
         if (channels.length == 0) {
             console.log('No channel found.');
         } else {
             console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                 'it has %s views.',
                 channels[0].id,
                 channels[0].snippet.title,
                 channels[0].statistics.viewCount);
         }
     });*/
  // fs.unlinkSync("file.mp4")
    const file = fs.createWriteStream("file.mp4");
    await http.get("https://api.telegram.org/file/bot901231463:AAHMqvWSKVPQLi7ufsJwfQRIkH3Ebnx4GMw/videos/file_0.MP4", response => {
        response.pipe(file);
    });
    const fileName = 'file.mp4';
    const fileSize = await fs.statSync(fileName).size;

    const res = await service.videos.insert(
        {
            part: 'id,snippet,status',
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: 'Node.js YouTube Upload Test',
                    description: 'Testing YouTube upload via Google APIs Node.js Client',
                },
                status: {
                    privacyStatus: 'private',
                },
            },
            media: {
               /* mimeType: 'video/!*, application/octet-stream',*/
                body: fs.createReadStream(fileName),
            },
        },
        {
            // Use the `onUploadProgress` event from Axios to track the
            // number of bytes uploaded to this point.
            onUploadProgress: evt => {
                const progress = (evt.bytesRead / fileSize) * 100;
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`${Math.round(progress)}% complete`);
            },
        }
    ).catch(errr => {
        console.log("My errr :");
        console.log(errr);
    });
    console.log('\n\n');
    console.log(res);
    fs.unlink("file.mp4")
}





/*const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
});
// very basic example of uploading a video to youtube
async function runSample(fileName) {
    const fileSize = await fs.statSync(fileName).size;
    const res = await youtube.videos.insert(
        {
            part: 'id,snippet,status',
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: 'Node.js YouTube Upload Test',
                    description: 'Testing YouTube upload via Google APIs Node.js Client',
                },
                status: {
                    privacyStatus: 'private',
                },
            },
            media: {
                /!*mimeType: 'video/!*, application/octet-stream',*!/
                body: fs.createReadStream(fileName),
            },
        },
        {
            // Use the `onUploadProgress` event from Axios to track the
            // number of bytes uploaded to this point.
            onUploadProgress: evt => {
                const progress = (evt.bytesRead / fileSize) * 100;
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`${Math.round(progress)}% complete`);
            },
        }
    );
    console.log('\n\n');
    console.log(res.data);
    return res.data;
}

const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
];

if (module === require.main) {
    //const fileName = 'http://localhost:3000/'+__dirname+'4122.mp4'
    http.get("https://api.telegram.org/file/bot901231463:AAHMqvWSKVPQLi7ufsJwfQRIkH3Ebnx4GMw/videos/file_0.MP4", response => {
        response.pipe(file);
    });
    const fileName = 'file.mp4';
    oauth2Client
        .authenticate(scopes)
        .then(async () => await runSample(fileName))
        .catch(console.error);
}*/
