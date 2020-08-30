/********************/
/* Global variables */
/********************/
const SteamAPI = require('steamapi');

const STEAM_INFO = require('./JSON/steam-info.json');
const STEAM_API_KEY = STEAM_INFO.api_key;
const STEAM_API = new SteamAPI(STEAM_API_KEY);

const COMMUNITY_URL = STEAM_INFO.community_url;

var steamUserFile = require('./JSON/steam-users.json');
const fs = require('fs'); // FileSync

const MAX_MESSAGE_LENGTH = 1980;

/*************/
/* Functions */
/*************/
async function userGamesToString(username, displayName)
{
    outputMessage = 'Games for ' + displayName + ':\n';
    
    games = await getGamesForUser(username);
    if (games == undefined)
    {
        outputMessage += "No games found for " + username;
        games = [];
    }

    nextGame = '';
    for (i = 0; i < games.length; i++)
    {
        nextGame = '- ' + games[i] + '\n';

        if ((outputMessage + nextGame).length >= MAX_MESSAGE_LENGTH)
        {
            outputMessage += '... and ' + (games.length - i - 1) + ' more.';
            break;
        }
        else
        {
            outputMessage += nextGame;
        }
    }

    return outputMessage;
}

async function allUserGamesToString(username, displayName)
{
    messages = [];
    outputMessage = 'Games for ' + displayName + ':\n';
    
    games = await getGamesForUser(username);
    if (games == undefined)
    {
        outputMessage += "No games found for " + username;
        games = [];
    }

    nextGame = '';
    for (i = 0; i < games.length; i++)
    {
        nextGame = '- ' + games[i] + '\n';

        if ((outputMessage + nextGame).length >= MAX_MESSAGE_LENGTH)
        {
            messages.push(outputMessage);
            outputMessage = "";
        }
        
        outputMessage += nextGame;
        
    }

    messages.push(outputMessage);

    return messages;
}

async function getGamesForUser(userID)
{
    const USER_URL = COMMUNITY_URL + userID;
    
    user = await STEAM_API.resolve(USER_URL);
    userGames = [];
    games = await STEAM_API.getUserOwnedGames(user);
    games.forEach(element => {
        userGames.push(element.name);
    });

    // console.log(user + "\n" + games + "\n" + userGames.length);
    userGames.sort();

    return userGames;
}

async function findUserIndex(steamName, steamID, discordName)
{
    userIndex = -1;
    for (i = 0; i < steamUserFile.users.length; i++)
    {
        const thisUser = steamUserFile.users[i];

        if (thisUser.discordName === discordName || thisUser.steam === steamName || thisUser.steamID === steamID)
        {
            userIndex = i;
            break;
        }
    }

    return userIndex;
}

function registerUserInfo(discordName, discordID, steamName, steamID, isUpdate=false, isAdmin=false)
{
    message = "Default text here";

    userIndex = findUserIndex(steamName, steamID, discordName);

    if (isUpdate)
    {
        if (userIndex == -1)
        {
            message = 'No Steam information found for ' + discordName + '.';
        }
        else
        {
            // Update info
            steamUserFile.users[userIndex].discord = discordName;
            steamUserFile.users[userIndex].discordID = discordID;
            steamUserFile.users[userIndex].steam = steamName;
            steamUserFile.users[userIndex].steamID = steamID;
            steamUserFile.users[userIndex].games = getGamesForUser(steamName);

            message = 'Success';
        }
    }
    else
    {
        if (userIndex == -1)
        {
            // Add the info
            userGames = getGamesForUser(steamID);
            newUser = {"discord": discordName, "discordID": discordID, "steam": steamName, "steamID": steamID, "games": userGames};
            steamUserFile.users.push(newUser);

            message = 'Success';
        }
        else
        {
            isSuccess = false;
            message = 'Duplicate Steam information found for ' + discordName + '.';
        }
    }
    
    try
    {
        fs.writeFileSync('./steam-users.json', JSON.stringify(steamUserFile, null, 2));
        
        message = 'Registered steam information for ' + discordName;
    }
    catch (err)
    {
        console.log('I/O error\n' + err);
    }

    console.log("Message: " + message);
    return message;
}

async function resolveNickname(username)
{
    const USER_URL = COMMUNITY_URL + username;
    console.log(USER_URL);

    userID = await STEAM_API.resolve(USER_URL);
    summary = await STEAM_API.getUserSummary(userID);
    
    console.log(userID);
    
    return summary.nickname;
}

function commonGamesUnstored(user1, user2)
{
    username1 = resolveNickname(user1);
    user1Games = getGamesForUser(user1);

    username2 = resolveNickname(user2);
    user2Games = getGamesForUser(user2);

    mutualGames = user1Games.filter(gameTitle => user2Games.includes(gameTitle));

    return mutualGames;
}

function commonGamesStored(user1, user2)
{
    commonGames = [];
    isSuccess = false;

    user1Index = findUserIndex(user1, user1, user1);
    if (user1Index == -1)
    {
        return {commonGames, isSuccess};
    }

    user2Index = findUserIndex(user2, user2, user2);
    if (user2Index == -1)
    {
        return {commonGames, isSuccess};
    }

    user1Profile = steamUserFile.users[user1Index];
    username1 = user1Profile.steam;
    user1Games = user1Profile.games;
    
    user2Profile = steamUserFile.users[user2Index];
    username2 = user2Profile.steam;
    user2Games = user2Profile.games;

    commonGames = user1Games.filter(gameTitle => user2Games.includes(gameTitle));
    
    isSuccess = true;
    return {commonGames, isSuccess};
}

function commonGames(user1, user2, isStored=true)
{
    return isStored ? commonGamesStored(user1, user2): commonGamesUnstored(user1, user2);
}

function commonGamesToString(user1, user2, isStored=true)
{
    result = commonGames(user1, user2, isStored);
    commonGames = result.commonGames;
    isSuccess = result.isSuccess;

    outputMessage = "";
    
    if (isSuccess)
    {
        username1 = steamHelper.resolveNickname(user1);
        username2 = steamHelper.resolveNickname(user2);

        if (result.commonGames.length == 0)
        {
            // No common games
            outputMessage = username1 + " and " + username2 + " do not share any games.";
        }
        else
        {
            // Common games
            outputMessage = username1 + " and " + username2 + " share the following games:\n";

            for (i = 0; i < commonGames.length; i++)
            {
                nextGame = "- " + commonGames[i] + "\n";
                if(outputMessage.length + nextGame.length <= MAX_MESSAGE_LENGTH)
                {
                    outputMessage += nextGame;
                }
                else
                {
                    outputMessage += "... and " + (commonGames.length - i - 1) + " more.";
                    break;
                }
            }
        }
    }
    else
    {
        outputMessage = "Please make sure both " + user1 + " and " + user2 + " are registered first.";
    }

    return outputMessage;
}

function forceUpdateGames(user)
{
    userIndex = findUserIndex(user, user, user);
    if (user1Index == -1)
    {
        return false;
    }

    userProfile = steamUserFile.users[userIndex];
    username = userProfile.steam;
    userGames = getGamesForUser(user);
    userProfile.games = userGames;

    try
    {
        fs.writeFileSync('./steam-users.json', JSON.stringify(steamUserFile, null, 2));
    }
    catch (err)
    {
        return false;
    }

    return true;
}

/*********************/
/* Export statements */
/*********************/
exports.userGamesToString = userGamesToString;
exports.allUserGamesToString = allUserGamesToString;
exports.registerUser = registerUserInfo;
exports.commonGames = commonGamesToString;
exports.forceUpdateGames = forceUpdateGames;
exports.resolveNickname = resolveNickname;

exports.users = steamUserFile.users;