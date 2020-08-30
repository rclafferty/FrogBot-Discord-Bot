const CHAT_INFO = require('./JSON/responses.json');
const chatPrompts = CHAT_INFO.chat;
const chatReactionMessages = CHAT_INFO.reactions;
const chatEmojis = CHAT_INFO.emojis;

const laughingReactMessages_exact = chatReactionMessages.laughing_exact;
const laughingReactMessages_include = chatReactionMessages.laughing_partial;
const laughingReactEmoji = chatEmojis.laughing;
const roflReactMessages = chatReactionMessages.rofl_partial;
const roflReactEmoji = chatEmojis.rofl;

function parseChat(bot, message, channelID, evt)
{
    textResponse = checkForTextReact(message);
    // Check if reaction object requires reaction
    if (textResponse != "")
    {
        bot.sendMessage({
            to: channelID,
            message: textResponse
        });
    }
    else
    {
        emojiReactionObject = checkForEmojiReact(message);
        // Check if reaction object requires reaction
        if (emojiReactionObject.success === true && emojiReactionObject.emoji != undefined)
        {
            bot.addReaction({
                channelID: channelID,
                messageID: evt.d.id,
                reaction: emojiReactionObject.emoji
            }, function(err, res) {
                if (err)
                {
                    console.log(err);
                    bot.sendMessage({
                        to: channelID,
                        message: "Haha! :smile:"
                    });
                }
            });
        }
    }
}

function checkForTextReact(message)
{
    for (i = 0; i < chatPrompts.length; i++)
    {
        if (message.toLowerCase() === chatPrompts[i].prompt.toLowerCase())
        {
            return chatPrompts[i].response;
        }
    }

    return "";
}

function checkForEmojiReact(message)
{
    // Exact words
    messageParts = message.split(' ');
    for (i = 0; i < laughingReactMessages_exact.length; i++)
    {
        for (j = 0; j < messageParts.length; j++)
        {
            if (messageParts[j].toLowerCase() == laughingReactMessages_exact[i])
            {
                success = true;
                emoji = laughingReactEmoji;
                return {success, emoji};
            }
        }
    }

    // Partial words
    reactMessages = laughingReactMessages_include.concat(roflReactMessages);
    for (i = 0; i < reactMessages.length; i++)
    {
        if (message.toLowerCase().includes(reactMessages[i].toLowerCase()))
        {
            success = true;
            emoji = laughingReactEmoji;
            if (i >= laughingReactMessages_include.length)
            {
                emoji = roflReactEmoji;
            }

            return {success, emoji};
        }
    }

    success = false;
    emoji = undefined;
    return {success, emoji};
}

exports.parseChat = parseChat;