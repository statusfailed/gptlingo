/// written by chatgpt
//function createMessage(name, time, content) {
  //const messageHeader = document.createElement('div');
  //messageHeader.classList.add('message-header');

  //const senderName = document.createElement('p');
  //senderName.textContent = name;

  //const sentTime = document.createElement('p');
  //sentTime.classList.add('is-size-7');
  //sentTime.textContent = time;

  //messageHeader.appendChild(senderName);
  //messageHeader.appendChild(sentTime);

  //const messageBody = document.createElement('div');
  //messageBody.classList.add('message-body');
  //messageBody.textContent = content;

  //const messageDiv = document.createElement('div');
  //messageDiv.classList.add('message');
  //messageDiv.appendChild(messageHeader);
  //messageDiv.appendChild(messageBody);

  //return messageDiv;
//}

// Written by ChatGPT
function createMessage(user, words) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');
  messageDiv.appendChild(headerDiv);

  const senderDiv = document.createElement('div');
  senderDiv.classList.add('sender');
  senderDiv.textContent = (user == "user") ? "You" : "ChatGPT" ;
  headerDiv.appendChild(senderDiv);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  messageDiv.appendChild(contentDiv);

  // NOTE: added the context line
  const context = words.join(" ");
  words.forEach((word) => {
    const wordSpan = document.createElement('span');
    wordSpan.textContent = word;
    wordSpan.classList.add('word', 'clickable-word');
    // NOTE: slightly modified word to include context
    wordSpan.addEventListener('click', () => onWordClick(word, context));
    contentDiv.appendChild(wordSpan);
  });

  return messageDiv;
}

/// written by chatgpt
function addMessageToChatHistory(message) {
    const chatHistory = document.querySelector('#chat-history');
    chatHistory.appendChild(message);
}

/// written by chatgpt
function clearChatHistory() {
    const chatHistory = document.querySelector('#chat-history');
    chatHistory.innerHTML = '';
}

// Written by chatgpt
function addMessagesToChatHistory(messages) {
    const chatHistory = document.querySelector('#chat-history');
    messages.forEach(message => chatHistory.appendChild(message));
}

// Written by chatgpt
async function getMessagesFromServer() {
  try {
    const response = await fetch('/conversation');
    if (!response.ok) {
      throw new Error('Server response was not ok');
    }
    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

async function populateChatHistory() {
  clearChatHistory(); // clear existing messages from the chat history container

  const response = await getMessagesFromServer(); // retrieve messages from the server
  const messages = response.messages;

  // NOTE: slightly modified!
  const messageDivs = messages.map(message => createMessage(message.user, message.words)); // create message divs from the retrieved messages

  addMessagesToChatHistory(messageDivs); // add the message divs to the chat history container

  // NOTE: Modified by human!
  return messages;
}

// Written by chatGPT
async function sendMessageToServer(messages, new_message) {
  const url = '/conversation';

  const data = {
    messages: messages,
    //new_message: new_message.split(' ') // NOTE: modified by human
    new_message: new_message,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  return responseData;
}

// Written by chatgpt
//function createDefinitionElement(word, context, explanation) {
  //const infoBox = document.createElement('div');
  //infoBox.classList.add('info-box');

  //const wordElement = document.createElement('span');
  //wordElement.classList.add('info-word');
  //wordElement.innerText = word;

  //const contextElement = document.createElement('span');
  //contextElement.classList.add('info-context');
  //contextElement.innerText = context;

  //const explanationElement = document.createElement('span');
  //explanationElement.classList.add('info-explanation');
  //explanationElement.innerText = explanation;

  //infoBox.appendChild(wordElement);
  //infoBox.appendChild(contextElement);
  //infoBox.appendChild(explanationElement);

  //return infoBox;
//}

// Written by ChatGPT
function createExplanation(word, context, explanation) {
  const explanationContainer = document.createElement('div');
  explanationContainer.classList.add('box');

  const wordContainer = document.createElement('div');
  wordContainer.classList.add('has-text-weight-bold');
  wordContainer.textContent = `Word: ${word}`;
  wordContainer.style.color = '#4A4A4A';

  const contextContainer = document.createElement('div');
  contextContainer.textContent = `Context: ${context}`;
  contextContainer.style.color = '#BDBDBD';

  const explanationContent = document.createElement('div');
  explanationContent.textContent = `Explanation: ${explanation}`;
  explanationContent.style.color = '#4A4A4A';

  explanationContainer.appendChild(wordContainer);
  explanationContainer.appendChild(contextContainer);
  explanationContainer.appendChild(explanationContent);

  return explanationContainer;
}


// Written by ChatGPT
async function getExplanationFromServer(word, context) {
  const data = { word, context };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    const response = await fetch('/explain', options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Human Code

// all below here written by human
// hence yummy globals
window.App = {};
App.messages = null;

async function onClickSend(message) {
  addMessagesToChatHistory([createMessage('user', [message])]);
  response = await sendMessageToServer(App.messages, message);

  App.messages = response.messages;
  clearChatHistory();

  const messageDivs = App.messages.map(message => createMessage(message.user, message.words));
  addMessagesToChatHistory(messageDivs);
}

////////////////////////////////////////////////////////////
// Definition stuff

function setExplanationValue(word, context, definition) {
  const elem = document.querySelector('#word-definition');
  //elem.innerHTML = '';
  elem.insertBefore(createExplanation(word, context, definition), elem.firstChild);
}

async function onWordClick(word, context) {
  const result = await getExplanationFromServer(word, context);
  setExplanationValue(word, context, result.explanation);
}

////////////////////////////////////////////////////////////
// main

async function main() {
  // write to the global :3
  App.messages = await populateChatHistory();
}

main();
