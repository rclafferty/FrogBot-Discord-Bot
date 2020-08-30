const Discord = require('discord.io');
const AUTH_FILE = require('./JSON/auth.json');
const BotInfo = require('./JSON/bot-info.json');
const INTRODUCTION = BotInfo.introduction;
const HELP = BotInfo.help;
const COMMAND_CATEGORIES = BotInfo.categories;

const botSetup = require('./bot-setup.json');
const steamHelper = require('./steam-helper.js');
const commandHelper = require('./command-helper.js');
const chatHelper = require('./chat-helper.js');

var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {colorize: true});
logger.level = 'debug';

var bot = new Discord.Client({
    token: AUTH_FILE.token,
    autorun: true
});

bot.on('ready', function(evt) {
    bot.setPresence( {game: {name: '$help'}});

    pictureURLs = botSetup.picture_urls;
    numberOfPictureURLs = pictureURLs.length;

    index = Math.floor(Math.random() * numberOfPictureURLs);

    console.log(index);

    // Log a bunch of stuff
    bot.editUserInfo({
        avatar: require('fs').readFileSync(pictureURLs[index], 'base64')
     });
    // console.log(bot.avatar);
});

bot.on('message', function(user, userID, channelID, message, evt) {
    if (user == "FrogBot")
    {
        return;
    }

    // Handle messages
    if (message.substring(0, 1) == '$')
    {
        try
        {
            parseCommand(user, userID, channelID, message, evt);
        }
        catch (err)
        {
            bot.sendMessage({
                to: channelID,
                message: "I got a wee bit confused there. Please try again."
            });
        }
    }
    else if (message.toLowerCase() == "hi")
    {
        bot.sendMessage({
            to: channelID,
            message: ":wave: Hi!"
        });
    }
    else if (bot.servers[channelID] == undefined) // direct message
    {
        chatHelper.parseChat(bot, message, channelID, evt);
    }
});

async function parseCommand(user, userID, channelID, message, evt)
{
    // bot.simulateTyping(channelID);
    
    var args = message.substring(1).split(' ');
    var cmd = args[0];
    var isYelling = (cmd == cmd.toUpperCase());

    args = args.splice(1); // gets rid of pos 0 and moves all forward

    response = '';
    embeddedResponse = '';
    isEmbeddedResponse = false;

    if (isYelling)
    {
        response = "Bruh. Inside voices PUH-LEEZE";
    }
    else
    {
        switch (cmd.toLowerCase())
        {
            /**************************/
            /* Requires CommandHelper */
            /**************************/

            case 'ping'.toLowerCase():
                response = commandHelper.ping();
                break;

            case 'hi'.toLowerCase():
                response = commandHelper.hi(userID);
                break;
            
            case 'bye'.toLowerCase():
                response = commandHelper.bye(userID);
                break;

            case 'party':
                response = commandHelper.party();
                break;

            case 'help'.toLowerCase():
                response = HELP;
                embeddedResponse = commandHelper.help(COMMAND_CATEGORIES);
                isEmbeddedResponse = true;
                break;

            case 'socialDistancing'.toLowerCase():
                response = commandHelper.socialDistance();
                break;
                
            case 'no'.toLowerCase():
                response = commandHelper.no();
                break;

            case 'yes'.toLowerCase():
                response = commandHelper.yes();
                break;

            case 'introduce'.toLowerCase():
                response = INTRODUCTION;
                embeddedResponse = commandHelper.introduce(COMMAND_CATEGORIES);
                isEmbeddedResponse = true;
                break;

            case 'compare'.toLowerCase():
                response = commandHelper.compare(args, steamHelper);
                break;

            case 'myGames'.toLowerCase():
                response = await commandHelper.myGames(args, steamHelper);
                break;

            case 'register'.toLowerCase():
                response = commandHelper.registerInfo(args, user, userID, steamHelper);
                break;

            case 'evangelize'.toLowerCase():
                messageUserID = args[0].substring(3, args[0].length - 1);
                bot.sendMessage({
                    to: messageUserID,
                    message: "Hi! :wave: Do you have a moment to talk about our lord and savior C3-PO? :robot:"
                });
                break;

            case 'interpret'.toLowerCase():
                if (args.length >= 1)
                {
                    output = "";
                    args[0].split('').forEach(element => {
                        if (!element.match(/^[0-9a-zA-Z]+$/))
                        {
                            output += "\\" + element; 
                        }
                        else
                        {
                            output += element;
                        }
                    });
                    response = output;
                }
                break;

            /*********************************/
            /* Discord built-in fun commands */
            /*********************************/
            case 'simulate'.toLowerCase():
                bot.simulateTyping(channelID);
                break;

            default:
                response = "Not sure what you're trying to say, but it sounds like a party! :partying_face:"
                break;
        }
    }

    isValid = (response != undefined && response != "") || (embeddedResponse != undefined && embeddedResponse != "");

    if (isValid)
    {
        if (isEmbeddedResponse)
        {
            bot.sendMessage({
                to: channelID,
                embed: {
                    color: 6826080,
                    title: response,
                    description: embeddedResponse
                }
            });
        }
        else
        {
            bot.sendMessage({
                to: channelID,
                message: response
            })
        }
    }
}