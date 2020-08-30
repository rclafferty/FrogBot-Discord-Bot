function ping()
{
    return "I'm still here!";
}

function hi(userID)
{
    partTwoOptions = ['', ' How are you today?', ' Whatcha up to?', ' What\'s shakin\'?', ' There you are!', ' Have an awesome day! :sunglasses:'];
    partTwoIndex = Math.floor(Math.random() * partTwoOptions.length);
    partTwo = partTwoOptions[partTwoIndex];
    return ":wave: Hi, <@" + userID + ">!" + partTwo;
}

function party()
{
    return "Not until after COVID. Then I'm down! :partying_face:";
}

function bye(userID)
{
    partTwoOptions = ['', ' Have a good day!', ' Sorry to see you go!', ' Where are ya goin\'?'];
    partTwoIndex = Math.floor(Math.random() * partTwoOptions.length);
    partTwo = partTwoOptions[partTwoIndex];
    return ":wave: Bye, <@" + userID + ">!" + partTwo;
}

function no()
{
    return "Are you sure?";
}

function yes()
{
    return "Alright.";
}

function introduce(categories)
{
    outputMessage = "";

    categoryCount = categories.length;
    for (i = 0; i < categoryCount; i++)
    {
        categoryName = categories[i].category;
        outputMessage += "**" + categoryName + "**\n-------------\n";

        categoryCommands = categories[i].commands;
        for (j = 0; j < categoryCommands.length; j++)
        {
            thisCommand = categoryCommands[j];
            outputMessage += "$" + thisCommand.command;
            
            if (thisCommand.explanation != undefined)
            {
                outputMessage += " --> " + thisCommand.explanation;
            }

            outputMessage += "\n";
        }

        outputMessage += "\n";
    }

    return outputMessage;
}

function compareGames(args, steamHelper)
{
    outputMessage = "";
    if (args.length >= 3)
    {
        if (args[0] == "steam")
        {
            outputMessage = steamHelper.commonGames(args[1], args[2], true);
        }
        else
        {
            outputMessage = "That store is not currently supported. Please ping an Admin to request support for that store.";
        }
    }

    return outputMessage;
}

function registerInfo(args, discordUser, discordUserID, steamHelper)
{
    if (args.length >= 3)
    {
        store = args[0];

        if (store == "steam")
        {
            storeUsername = args[1];
            storeID = args[2];
            isUpdate = args[args.length - 1] == '--force-update';
    
            message = steamHelper.registerUser(discordUser, discordUserID, storeUsername, storeID, isUpdate, false);

            if (message == undefined)
            {
                console.log(result);
                return "Something went wrong...";
            }
            else
            {
                console.log("Successful message -- " + message);
                return message;
            }
        }
        else
        {
            return "That store is not supported. Please ping an Admin to request support.";
        }
    }
    else
    {
        return ":warning: Not enough arguments.";
    }
}

async function printUserGames(args, steamHelper)
{
    if (args.length >= 1)
    {
        discordName = args[0];
        steamUsers = steamHelper.users;
        
        for (i = 0; i < steamUsers.length; i++)
        {
            if (steamUsers[i].discord == discordName)
            {
                user = steamUsers[i];
                return await steamHelper.userGamesToString(user.steamID, user.steam);
            }
        }

        return ":warning: Could not find user " + discordName + ". Register your information first.";
    }
    else
    {
        return ":warning: Not enough arguments.";
    }
}

async function printAllUserGames(args, steamHelper)
{
    if (args.length >= 1)
    {
        discordName = args[0];
        steamUsers = steamHelper.users;
        
        for (i = 0; i < steamUsers.length; i++)
        {
            if (steamUsers[i].discord == discordName)
            {
                user = steamUsers[i];
                return await steamHelper.allUserGamesToString(user.steamID, user.steam);
            }
        }

        return ":warning: Could not find user " + discordName + ". Register your information first.";
    }
    else
    {
        return ":warning: Not enough arguments.";
    }
}

function help(categories)
{
    outputMessage = "";

    categoryCount = categories.length;
    for (i = 0; i < categoryCount; i++)
    {
        categoryName = categories[i].category;
        outputMessage += "**" + categoryName + "**\n-------------\n";

        categoryCommands = categories[i].commands;
        for (j = 0; j < categoryCommands.length; j++)
        {
            thisCommand = categoryCommands[j];
            outputMessage += "$" + thisCommand.command;
            if (thisCommand.args != undefined)
            {
                outputMessage += thisCommand.args;
            }

            outputMessage += "\n";
        }

        outputMessage += "\n";
    }

    return outputMessage;
}

function socialDistance()
{
    return "Stay home, stay safe, and wash your hands! If you go outside, don't forget your mask!";
}

/*********************/
/* Export statements */
/*********************/
exports.ping = ping;
exports.hi = hi;
exports.bye = bye;
exports.party = party;
exports.help = help;
exports.socialDistance = socialDistance;
exports.no = no;
exports.yes = yes;
exports.introduce = introduce;
exports.compare = compareGames;
exports.registerInfo = registerInfo;
exports.myGames = printUserGames;
exports.allGames = printAllUserGames;