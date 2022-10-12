const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const messagesPath = path.join(__dirname, "../db/messagesData.json");

async function getAllMessages() {
  try {
    const data = await fs.readFile(messagesPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return {error: "faild to read database"};
  }
}

async function getMessageById(messageId) {
  const dbMessages = await getAllMessages();
  const message = dbMessages.find(({ id }) => {
    return messageId === +id;
  });
  return message ? message : null;
}

async function removeMessage(contactId) {
  const dbMessages = await getAllMessages();
  const messageIndex = dbMessages.findIndex(({ id }) => contactId === +id);

  if (messageIndex === -1) return null;

  const removedMessage = dbMessages.splice(messageIndex, 1)[0];
  updateMessages(dbMessages);
  return removedMessage;
}

async function addMessage({ name, email, message }) {
  const newMessage = { id: randomUUID(), name, email, message };
  const isValidated = validate(newMessage);
  if (!isValidated) return { error: "fill in all filds" };

  const dbMessages = await getAllMessages();
  updateMessages([...dbMessages, newMessage]);
  return newMessage;
}

function updateMessages(messages) {
  const messagesJson = JSON.stringify(messages, null, 2);
  fs.writeFile(messagesPath, messagesJson);
}

function validate({ name, email, message }) {
  const validateName = !!name;
  const validateEmail = email.includes("@");
  const validateMessage = !!message;
  console.log(validateName, validateEmail, validateMessage);
  return validateName && validateEmail && validateMessage;
}

module.exports = {
  getAllMessages,
  getMessageById,
  removeMessage,
  addMessage,
};
